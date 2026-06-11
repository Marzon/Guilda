import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import i18n from "@/i18n";

interface AddSkillParams {
  userId: string;
  skillId: string;
  proficiencyLevel: number;
}

interface UpdateSkillParams {
  userId: string;
  skillId: string;
  proficiencyLevel: number;
}

interface RemoveSkillParams {
  userId: string;
  skillId: string;
}

export const useAddUserSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, skillId, proficiencyLevel }: AddSkillParams) => {
      const { data, error } = await supabase
        .from("user_skills")
        .insert({
          user_id: userId,
          skill_id: skillId,
          proficiency_level: proficiencyLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["batch-user-skills"] });
    },
    onError: (error) => {
      console.error("Error adding skill:", error);
      toast.error(i18n.t("skills.addError"));
    },
  });
};

export const useUpdateUserSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, skillId, proficiencyLevel }: UpdateSkillParams) => {
      const { data, error } = await supabase
        .from("user_skills")
        .update({ proficiency_level: proficiencyLevel })
        .eq("user_id", userId)
        .eq("skill_id", skillId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["batch-user-skills"] });
    },
    onError: (error) => {
      console.error("Error updating skill:", error);
      toast.error(i18n.t("skills.updateError"));
    },
  });
};

export const useRemoveUserSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, skillId }: RemoveSkillParams) => {
      const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("user_id", userId)
        .eq("skill_id", skillId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["batch-user-skills"] });
    },
    onError: (error) => {
      console.error("Error removing skill:", error);
      toast.error(i18n.t("skills.removeError"));
    },
  });
};
