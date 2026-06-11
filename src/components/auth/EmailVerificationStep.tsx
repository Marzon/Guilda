import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Loader2, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailVerificationStepProps {
  email: string;
  onVerified: () => void;
  onResend: () => Promise<void>;
  onBack?: () => void;
}

export function EmailVerificationStep({
  email,
  onVerified,
  onResend,
  onBack,
}: EmailVerificationStepProps) {
  const { t } = useTranslation();
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-submit when token is complete
  useEffect(() => {
    if (token.length === 6) {
      handleVerify();
    }
  }, [token]);

  const handleVerify = async () => {
    if (token.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    const tokenToVerify = token.toUpperCase();
    console.log("[EmailVerification] Starting verification:", { email, token: tokenToVerify });

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-email-token", {
        body: { email, token: tokenToVerify },
      });

      console.log("[EmailVerification] Response:", { data, fnError });

      if (fnError || !data?.success) {
        const errorCode = data?.error || "invalid_token";
        console.error("[EmailVerification] Verification failed:", { errorCode, fnError, data });
        
        if (errorCode === "expired_token") {
          setError(t("auth.verifyEmail.expiredCode"));
        } else if (errorCode === "too_many_attempts") {
          setError(t("auth.verifyEmail.tooManyAttempts"));
        } else {
          setError(t("auth.verifyEmail.invalidCode"));
        }
        
        setToken("");
        return;
      }

      // Success! Now sign in the user
      toast.success(t("auth.verifyEmail.verified"));
      onVerified();
    } catch (err) {
      console.error("Verification error:", err);
      setError(t("auth.verifyEmail.invalidCode"));
      setToken("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      await onResend();
      setResendCooldown(60);
      toast.success(t("auth.verifyEmail.codeSent"));
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(t("auth.verifyEmail.resendError"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute top-4 left-4 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("common.back")}
          </Button>
        )}
        
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground">
          {t("auth.verifyEmail.title")}
        </h2>
        
        <p className="text-muted-foreground">
          {t("auth.verifyEmail.subtitle")}
        </p>
        
        <p className="text-foreground font-medium">{email}</p>
      </div>

      {/* OTP Input */}
      <div className="flex flex-col items-center space-y-4">
        <InputOTP
          maxLength={6}
          value={token}
          onChange={setToken}
          disabled={isVerifying}
          className="gap-2"
        >
          <InputOTPGroup className="gap-2">
            <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
            <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
            <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
            <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
            <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
            <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
          </InputOTPGroup>
        </InputOTP>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          onClick={handleVerify}
          disabled={token.length !== 6 || isVerifying}
          className="w-full max-w-xs"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("auth.verifyEmail.verifying")}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t("auth.verifyEmail.verifyButton")}
            </>
          )}
        </Button>
      </div>

      {/* Resend section */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {t("auth.verifyEmail.didntReceive")}
        </p>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="text-primary"
        >
          {isResending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {resendCooldown > 0
            ? t("auth.verifyEmail.resendCooldown", { seconds: resendCooldown })
            : t("auth.verifyEmail.resendCode")}
        </Button>

        <p className="text-xs text-muted-foreground">
          {t("auth.verifyEmail.checkSpam")}
        </p>
      </div>

      {/* Use other email */}
      {onBack && (
        <div className="text-center">
          <Button variant="link" size="sm" onClick={onBack} className="text-muted-foreground">
            {t("auth.verifyEmail.useOtherEmail")}
          </Button>
        </div>
      )}
    </div>
  );
}
