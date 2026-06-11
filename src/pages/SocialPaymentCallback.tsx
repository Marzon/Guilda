import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * SocialPaymentCallback - Marketing site handler
 * 
 * This page catches the magic link redirect from the social-payment-signup edge function.
 * Since auth is managed by Core (suprema.guilda.app.br), we redirect there with the 
 * full hash containing the access token so Core can complete the authentication.
 */
const SocialPaymentCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the full hash with access_token from Supabase magic link
    const hash = window.location.hash;
    
    if (hash && hash.includes('access_token')) {
      // Redirect to Core app with the auth hash - Core will handle the session
      const coreUrl = `https://suprema.guilda.app.br/social-payment-callback${hash}`;
      window.location.href = coreUrl;
    } else {
      // No valid token - redirect to pricing page
      navigate('/pricing', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Processando seu acesso...</p>
      </div>
    </div>
  );
};

export default SocialPaymentCallback;
