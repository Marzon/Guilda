import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { isProfileComplete } from "@/lib/profileCompleteness";

export const useRedirectIfAuthenticated = () => {
  const { data: authData, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);
  
  useEffect(() => {
    // Check if this is a password recovery flow from URL hash
    // Only block redirect for actual password recovery, NOT magic link login
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }
    
    // Increment login count for OAuth/magic link logins (they redirect back)
    if (hash.includes('access_token') && !hash.includes('type=recovery')) {
      const currentLoginCount = parseInt(localStorage.getItem("login_count") || "0", 10);
      const lastIncrementedSession = localStorage.getItem("last_login_session");
      const sessionId = hash.substring(0, 50); // Use part of hash as session identifier
      
      // Only increment once per login session
      if (lastIncrementedSession !== sessionId) {
        localStorage.setItem("login_count", (currentLoginCount + 1).toString());
        localStorage.setItem("last_login_session", sessionId);
      }
    }
  }, []);
  
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isLoading) return;
      
      // Don't redirect if this is a password recovery flow
      if (isPasswordRecovery) return;
      
      if (authData?.user) {
        // Check if user signed up with email/password and has not verified OTP
        const isEmailProvider = authData.user.app_metadata?.provider === 'email';
        const otpNotVerified = isEmailProvider && authData.profile && !authData.profile.otp_verified;
        
        // If OTP not verified for email provider, don't redirect - let them stay on auth page for OTP verification
        if (otpNotVerified) {
          return;
        }
        
        if (authData?.profile) {
          // Use centralized profile completeness check
          const profile = authData.profile;
          const needsOnboarding = !isProfileComplete(profile);
          
          if (needsOnboarding) {
            navigate("/onboarding", { replace: true });
            return;
          }
          
          // Check if user has unread conversations before redirecting to tavern
          try {
            const { data: hasUnread } = await supabase.rpc('has_unread_conversations', {
              p_user_id: authData.user.id
            });
            
            if (hasUnread) {
              // Redirect to messages if there are unread conversations
              navigate("/messages", { replace: true });
              return;
            }
          } catch (error) {
            // If RPC fails, just redirect normally
            console.error("Error checking unread conversations:", error);
          }
          
          // Default redirect based on archetype
          if (profile.archetype === 'INVESTOR') {
            navigate("/capital", { replace: true });
          } else {
            navigate("/tavern", { replace: true });
          }
        } else {
          // No profile - check if user is in deleted_profiles (account was deactivated)
          const { data: deletedCheck } = await supabase.rpc('check_deleted_user', {
            user_email: authData.user.email || ''
          });
          
          if (deletedCheck && deletedCheck.length > 0 && deletedCheck[0].is_deleted) {
            // User account was deactivated - sign them out
            setIsAccountDeactivated(true);
            await supabase.auth.signOut();
            return;
          }
          
          // Not deactivated, just new user - go to onboarding
          navigate("/onboarding", { replace: true });
        }
      }
    };
    
    checkUserStatus();
  }, [authData, isLoading, navigate, isPasswordRecovery]);
  
  return { isLoading, isAuthenticated: !!authData?.user, isPasswordRecovery, isAccountDeactivated };
};
