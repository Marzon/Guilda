import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { isProfileComplete } from "@/lib/profileCompleteness";

export const useRequireProfile = () => {
  const { data: authData, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (!authData?.user) {
      navigate("/auth");
      return;
    }
    
    if (!authData?.profile) {
      navigate("/onboarding");
      return;
    }
    
    // Check if profile is complete (has bio >= 20 chars AND avatar)
    if (!isProfileComplete(authData.profile)) {
      navigate("/onboarding");
      return;
    }
  }, [authData, isLoading, navigate]);
  
  return { 
    isReady: !isLoading && !!authData?.profile && isProfileComplete(authData.profile),
    user: authData?.user,
    profile: authData?.profile,
    subscription: authData?.subscription,
  };
};