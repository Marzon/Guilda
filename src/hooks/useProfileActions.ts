import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import type { Archetype } from "@/types/archetype";

interface UseProfileActionsOptions {
  userId: string | null;
  onUpdateSuccess?: () => void;
}

interface ProfileUpdate {
  username?: string;
  bio?: string | null;
  archetype?: Archetype;
  stats?: any;
  avatar_url?: string | null;
  looking_for?: string | null;
  offering?: string | null;
  main_skills?: string[] | null;
  phone?: string | null;
  investor_type?: string | null;
  investor_check_range?: string | null;
  investor_sectors?: string[] | null;
}

export const useProfileActions = ({ userId, onUpdateSuccess }: UseProfileActionsOptions) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success(t("profile.profileUpdated"));
      onUpdateSuccess?.();
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async ({ file, currentAvatarUrl }: { file: File; currentAvatarUrl?: string | null }) => {
      if (!userId) throw new Error("User not authenticated");
      
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE");
      }

      const fileExt = file.name.split(".").pop();
      // Adicionar timestamp para evitar cache do navegador
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists (pode ter nome diferente)
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      return data.publicUrl;
    },
    onError: (error: Error) => {
      if (error.message === "FILE_TOO_LARGE") {
        toast.error(t("profilePage.imageTooLarge"));
      } else {
        toast.error(t("profilePage.uploadError"));
      }
    },
  });

  // Delete avatar
  const deleteAvatarMutation = useMutation({
    mutationFn: async (currentAvatarUrl: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      const fileName = currentAvatarUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("avatars").remove([`${userId}/${fileName}`]);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success(t("profilePage.avatarDeleted"));
    },
    onError: () => {
      toast.error(t("profilePage.deleteAvatarError"));
    },
  });

  return {
    // Mutations
    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    deleteAvatar: deleteAvatarMutation.mutate,
    
    // Loading states
    isUpdating: updateMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isDeletingAvatar: deleteAvatarMutation.isPending,
  };
};
