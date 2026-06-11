import { useState, useCallback } from "react";
import { ProfileForPreview } from "@/types/profile";

export const useProfilePreview = () => {
  const [previewProfile, setPreviewProfile] = useState<ProfileForPreview | null>(null);
  
  const openPreview = useCallback((profile: ProfileForPreview) => {
    setPreviewProfile(profile);
  }, []);
  
  const closePreview = useCallback(() => {
    setPreviewProfile(null);
  }, []);
  
  return {
    previewProfile,
    isOpen: !!previewProfile,
    openPreview,
    closePreview,
  };
};
