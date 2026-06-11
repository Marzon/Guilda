import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "./useLanguage";

interface EmailPreferences {
  id: string;
  user_id: string;
  match_request: boolean;
  match_accepted: boolean;
  new_message: boolean;
  project_invite: boolean;
  weekly_summary: boolean;
  pending_match_reminder: boolean;
  inactivity_reminder: boolean;
  acceleration_updates: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailPreferences = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["email-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Try to get existing preferences
      const { data, error } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // If no preferences exist, create default ones
      if (error && error.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from("email_preferences")
          .insert({
            user_id: user.id,
            match_request: true,
            match_accepted: true,
            new_message: true,
            project_invite: true,
            weekly_summary: true,
            pending_match_reminder: true,
            inactivity_reminder: true,
            acceleration_updates: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs as EmailPreferences;
      }

      if (error) throw error;
      return data as EmailPreferences;
    },
  });

  // Update preferences
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<Omit<EmailPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("email_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-preferences"] });
      toast.success(t('settings.preferencesSaved'));
    },
    onError: (error) => {
      console.error("Error updating email preferences:", error);
      toast.error(t('settings.preferencesError'));
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
};
