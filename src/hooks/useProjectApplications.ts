import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface ProjectApplication {
  id: string;
  project_id: string;
  role_id: string;
  applicant_id: string;
  message: string | null;
  linkedin_url: string | null;
  phone: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  created_at: string;
  responded_at: string | null;
  applicant?: {
    username: string;
    avatar_url: string | null;
    archetype: "BUILDER" | "SELLER";
    bio: string | null;
    phone: string | null;
    email?: string;
  };
  role?: {
    role_name: string;
    role_description: string | null;
  };
  project?: {
    title: string;
    owner_id: string;
  };
}

export const useProjectApplications = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch applications for a project (owner view)
  const { data: projectApplications = [], isLoading: loadingProjectApps } = useQuery({
    queryKey: ["project-applications", projectId],
    queryFn: async (): Promise<ProjectApplication[]> => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          applicant:profiles!project_applications_applicant_id_fkey(username, avatar_url, archetype, bio, phone),
          role:project_roles!project_applications_role_id_fkey(role_name, role_description)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project applications:", error);
        return [];
      }

      // Fetch emails for applicants (only project owner can call this)
      const { data: emailsData } = await supabase.rpc("get_applicant_emails_for_project_owner", {
        project_id_param: projectId
      });

      const emailsMap = new Map<string, string>();
      if (emailsData) {
        emailsData.forEach((e: { user_id: string; email: string }) => {
          emailsMap.set(e.user_id, e.email);
        });
      }

      // Merge emails into applications
      const applicationsWithEmails = (data || []).map((app: any) => ({
        ...app,
        applicant: app.applicant ? {
          ...app.applicant,
          email: emailsMap.get(app.applicant_id) || null
        } : null
      }));

      return applicationsWithEmails as ProjectApplication[];
    },
    enabled: !!projectId,
  });

  // Fetch user's own applications (where user is the applicant)
  const { data: myApplications = [], isLoading: loadingMyApps } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async (): Promise<ProjectApplication[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          role:project_roles!project_applications_role_id_fkey(role_name, role_description),
          project:projects!project_applications_project_id_fkey(title, owner_id)
        `)
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching my applications:", error);
        return [];
      }

      return (data || []) as unknown as ProjectApplication[];
    },
  });

  // Fetch applications received for user's projects (where user is project owner)
  const { data: receivedApplications = [], isLoading: loadingReceivedApps } = useQuery({
    queryKey: ["received-applications"],
    queryFn: async (): Promise<ProjectApplication[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get all projects owned by user
      const { data: userProjects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", user.id);

      if (projectsError || !userProjects?.length) return [];

      const projectIds = userProjects.map(p => p.id);

      // Then get all applications for those projects
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          applicant:profiles!project_applications_applicant_id_fkey(username, avatar_url, archetype, bio, phone),
          role:project_roles!project_applications_role_id_fkey(role_name, role_description),
          project:projects!project_applications_project_id_fkey(title, owner_id)
        `)
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching received applications:", error);
        return [];
      }

      return (data || []) as unknown as ProjectApplication[];
    },
  });

  // Apply to a role
  const applyToRole = useMutation({
    mutationFn: async ({ roleId, projectId, message, linkedinUrl, phone }: { 
      roleId: string; 
      projectId: string; 
      message?: string;
      linkedinUrl?: string;
      phone?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user profile for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      // Get project and role details
      const { data: project } = await supabase
        .from("projects")
        .select("title, owner_id")
        .eq("id", projectId)
        .single();

      const { data: role } = await supabase
        .from("project_roles")
        .select("role_name")
        .eq("id", roleId)
        .single();

      const { error } = await supabase
        .from("project_applications")
        .insert({
          role_id: roleId,
          project_id: projectId,
          applicant_id: user.id,
          message: message || null,
          linkedin_url: linkedinUrl || null,
          phone: phone || null,
        });

      if (error) throw error;

      // Send notification to project owner
      if (project && role && profile) {
        try {
          await supabase.functions.invoke("send-application-notification", {
            body: {
              type: "application_received",
              recipientId: project.owner_id,
              projectId,
              projectTitle: project.title,
              roleName: role.role_name,
              applicantName: profile.username,
              locale: localStorage.getItem("language") || "pt",
            },
          });
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["project-applications"] });
      toast.success(t("applications.sentSuccess"));
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error(t("applications.alreadyApplied"));
      } else {
        toast.error(t("applications.sendError"));
      }
    },
  });

  // Respond to application (accept/reject)
  const respondToApplication = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: "ACCEPTED" | "REJECTED" }) => {
      const app = projectApplications.find(a => a.id === applicationId);
      
      const { error } = await supabase
        .from("project_applications")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", applicationId);

      if (error) throw error;

      // If accepted, mark role as filled and add member
      if (status === "ACCEPTED" && app) {
        await supabase.from("project_roles").update({ is_filled: true }).eq("id", app.role_id);
        
        // Check if member already exists (e.g., was previously removed)
        const { data: existingMember } = await supabase
          .from("project_members")
          .select("id")
          .eq("project_id", app.project_id)
          .eq("user_id", app.applicant_id)
          .single();

        if (existingMember) {
          // Reactivate existing member
          await supabase.from("project_members")
            .update({ status: "ACTIVE", role_id: app.role_id })
            .eq("id", existingMember.id);
        } else {
          // Insert new member
          await supabase.from("project_members").insert({
            project_id: app.project_id,
            user_id: app.applicant_id,
            role_id: app.role_id,
          });
        }
      }

      // Send notification to applicant
      if (app) {
        const { data: project } = await supabase
          .from("projects")
          .select("title")
          .eq("id", app.project_id)
          .single();

        try {
          await supabase.functions.invoke("send-application-notification", {
            body: {
              type: status === "ACCEPTED" ? "application_accepted" : "application_rejected",
              recipientId: app.applicant_id,
              projectId: app.project_id,
              projectTitle: project?.title || "Startup",
              roleName: app.role?.role_name,
              locale: localStorage.getItem("language") || "pt",
            },
          });
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
        }
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["project-applications"] });
      queryClient.invalidateQueries({ queryKey: ["project-members"] });
      queryClient.invalidateQueries({ queryKey: ["project-roles"] });
      toast.success(status === "ACCEPTED" ? t("applications.accepted") : t("applications.rejected"));
    },
    onError: () => {
      toast.error(t("applications.processError"));
    },
  });

  // Withdraw application
  const withdrawApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("project_applications")
        .update({ status: "WITHDRAWN" as any })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success(t("applications.cancelled"));
    },
    onError: () => {
      toast.error(t("applications.cancelError"));
    },
  });

  // Check if user already applied to a role
  const hasAppliedToRole = (roleId: string) => {
    return myApplications.some(app => app.role_id === roleId && app.status !== "WITHDRAWN");
  };

  // Get application status for a role
  const getApplicationStatus = (roleId: string) => {
    const app = myApplications.find(a => a.role_id === roleId);
    return app?.status || null;
  };

  return {
    projectApplications,
    myApplications,
    receivedApplications,
    pendingReceivedApplications: receivedApplications.filter(a => a.status === "PENDING"),
    pendingApplications: projectApplications.filter(a => a.status === "PENDING"),
    isLoading: loadingProjectApps || loadingMyApps || loadingReceivedApps,
    applyToRole,
    respondToApplication,
    withdrawApplication,
    hasAppliedToRole,
    getApplicationStatus,
  };
};
