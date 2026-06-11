import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import i18n from "@/i18n";

export interface AccelerationApplication {
  id: string;
  user_id: string;
  pitch: string;
  bottleneck: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  cohort_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profile?: {
    id: string;
    username: string;
    avatar_url: string | null;
    archetype: "BUILDER" | "SELLER";
    bio: string | null;
  };
  cohort?: {
    id: string;
    name: string;
    whatsapp_link: string | null;
  };
}

export interface CreateApplicationData {
  pitch: string;
  bottleneck: string;
}

export function useAccelerationApplications(adminMode = false) {
  const queryClient = useQueryClient();
  const { data: auth } = useAuth();

  // Admin query - all applications
  const { data: applications = [], isLoading: loadingApplications } = useQuery({
    queryKey: ["acceleration-applications", adminMode],
    queryFn: async () => {
      if (!adminMode) return [];

      const { data, error } = await supabase
        .from("acceleration_applications")
        .select(`
          *,
          profile:profiles!acceleration_applications_user_id_fkey(
            id, username, avatar_url, archetype, bio
          ),
          cohort:cohorts!acceleration_applications_cohort_id_fkey(
            id, name, whatsapp_link
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((app) => ({
        ...app,
        status: app.status as "PENDING" | "APPROVED" | "REJECTED",
        profile: Array.isArray(app.profile) ? app.profile[0] : app.profile,
        cohort: Array.isArray(app.cohort) ? app.cohort[0] : app.cohort,
      })) as AccelerationApplication[];
    },
    enabled: adminMode,
  });

  // User's own application
  const { data: myApplication, isLoading: loadingMyApplication } = useQuery({
    queryKey: ["my-acceleration-application", auth?.user?.id],
    queryFn: async () => {
      if (!auth?.user?.id) return null;

      const { data, error } = await supabase
        .from("acceleration_applications")
        .select(`
          *,
          cohort:cohorts!acceleration_applications_cohort_id_fkey(
            id, name
          )
        `)
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        status: data.status as "PENDING" | "APPROVED" | "REJECTED",
        cohort: Array.isArray(data.cohort) ? data.cohort[0] : data.cohort,
      } as AccelerationApplication;
    },
    enabled: !!auth?.user?.id && !adminMode,
  });

  // Create application (user)
  const createApplication = useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      if (!auth?.user?.id) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("acceleration_applications").insert([
        {
          user_id: auth.user.id,
          pitch: data.pitch,
          bottleneck: data.bottleneck,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-acceleration-application"] });
      toast.success(i18n.t("acceleration.submitSuccess"));
    },
    onError: (error) => {
      toast.error(i18n.t("acceleration.submitError") + error.message);
    },
  });

  // Approve application (admin)
  const approveApplication = useMutation({
    mutationFn: async ({
      applicationId,
      cohortId,
      userId,
    }: {
      applicationId: string;
      cohortId: string;
      userId: string;
    }) => {
      // Update application
      const { error: appError } = await supabase
        .from("acceleration_applications")
        .update({
          status: "APPROVED",
          cohort_id: cohortId,
          reviewed_by: auth?.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (appError) throw appError;

      // Update subscription to ALPHA tier
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            tier: "ALPHA",
            cohort_id: cohortId,
            purchased_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (subError) throw subError;

      // Create user progress record (enroll in cohort)
      const { error: progressError } = await supabase
        .from("acceleration_user_progress")
        .upsert(
          {
            user_id: userId,
            cohort_id: cohortId,
            current_day: 1,
            status: "ACTIVE",
            started_at: new Date().toISOString(),
          },
          { onConflict: "user_id,cohort_id" }
        );

      if (progressError) throw progressError;

      // Get cohort details for email
      const { data: cohort } = await supabase
        .from("cohorts")
        .select("name, whatsapp_link")
        .eq("id", cohortId)
        .single();

      // Get user email
      const { data: userData } = await supabase.rpc("get_user_emails_for_admin");
      const userEmail = userData?.find((u: { user_id: string; email: string }) => u.user_id === userId)?.email;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      // Trigger welcome email
      if (cohort && userEmail) {
        await supabase.functions.invoke("send-cohort-welcome-email", {
          body: {
            email: userEmail,
            username: profile?.username || "Membro",
            cohort_name: cohort.name,
            whatsapp_link: cohort.whatsapp_link,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-applications"] });
      toast.success(i18n.t("acceleration.approvedSuccess"));
    },
    onError: (error) => {
      toast.error(i18n.t("acceleration.rejectError") + error.message);
    },
  });

  // Reject application (admin)
  const rejectApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("acceleration_applications")
        .update({
          status: "REJECTED",
          reviewed_by: auth?.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceleration-applications"] });
      toast.success(i18n.t("acceleration.rejectedSuccess"));
    },
    onError: (error) => {
      toast.error(i18n.t("acceleration.rejectError") + error.message);
    },
  });

  const pendingApplications = applications.filter((a) => a.status === "PENDING");
  const approvedApplications = applications.filter((a) => a.status === "APPROVED");
  const rejectedApplications = applications.filter((a) => a.status === "REJECTED");

  return {
    applications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    myApplication,
    isLoading: loadingApplications || loadingMyApplication,
    createApplication,
    approveApplication,
    rejectApplication,
  };
}
