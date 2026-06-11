import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, Swords, ShieldCheck, LockKeyhole, Sparkles, CheckCircle2, RefreshCw, AlertTriangle, Loader2, Phone } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { useLanguage } from "@/hooks/useLanguage";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { PageSkeleton } from "@/components/PageSkeleton";
import { trackSignup, trackLogin } from "@/lib/analytics";

import { LanguageSelector } from "@/components/LanguageSelector";
import { useHIBPCheck } from "@/hooks/useHIBPCheck";
import { isProfileComplete } from "@/lib/profileCompleteness";
import { EmailVerificationStep } from "@/components/auth/EmailVerificationStep";
import { AuthTestimonial } from "@/components/auth/AuthTestimonial";
import { AuthAccelerationDialog } from "@/components/auth/AuthAccelerationDialog";
import { validateEmail, suggestEmailCorrection } from "@/lib/emailValidation";

type AuthView = "login" | "signup" | "verify-email" | "reset" | "update" | "magiclink" | "account-deactivated";

// Account Deactivated Component
interface AccountDeactivatedViewProps {
  email: string;
  t: (key: string, options?: any) => string;
  onBack: () => void;
}

const AccountDeactivatedView = ({ email, t, onBack }: AccountDeactivatedViewProps) => {
  return (
    <div className="space-y-6 text-center">
      {/* Warning Icon */}
      <div className="flex justify-center">
        <div className="bg-amber-100 p-6 rounded-full">
          <AlertTriangle className="w-16 h-16 text-amber-600" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-slate-900">
        {t('auth.accountDeactivatedTitle', 'Conta Desativada')}
      </h2>

      {/* Email Display */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-500 mb-1">{t('auth.emailSentTo', 'Email')}</p>
        <p className="font-semibold text-slate-900">{email}</p>
      </div>

      {/* Instructions */}
      <p className="text-slate-600 text-sm leading-relaxed">
        {t('auth.accountDeactivatedDesc', 'Esta conta foi desativada anteriormente. Se você deseja reativar sua conta, entre em contato com o suporte.')}
      </p>

      {/* Contact Support */}
      <a
        href="mailto:suporte@guilda.app"
        className="inline-flex items-center justify-center gap-2 w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
      >
        <Mail className="w-4 h-4" />
        {t('auth.contactSupport', 'Contatar Suporte')}
      </a>

      {/* Use Different Email */}
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
      >
        {t('auth.useOtherEmail', 'Usar outro email')}
      </button>
    </div>
  );
};

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { isLoading: checkingAuth, isPasswordRecovery } = useRedirectIfAuthenticated();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phone, setPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | undefined>();
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const { isChecking: isCheckingHIBP, isBreached, breachCount, checkPassword, reset: resetHIBP } = useHIBPCheck();

  const handlePhoneChange = (value: string, valid: boolean, e164?: string) => {
    setPhone(value);
    setIsPhoneValid(valid);
    setPhoneE164(e164);
  };

  // Capture referral code from URL params
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, [searchParams]);

  // Set update view when password recovery is detected
  useEffect(() => {
    if (isPasswordRecovery) {
      setView("update");
    }
  }, [isPasswordRecovery]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("update");
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const trackReferral = async (userId: string) => {
    const referredBy = localStorage.getItem("referral_code");
    
    if (!referredBy) return;
    
    try {
      // Update the user's referral record with who referred them
      await supabase
        .from("user_referrals")
        .update({ referred_by: referredBy })
        .eq("user_id", userId);
      
      localStorage.removeItem("referral_code");
      localStorage.removeItem("referral_source");
    } catch (error) {
      console.error("Error tracking referral:", error);
    }
  };

  if (checkingAuth) {
    return <PageSkeleton />;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || t('auth.googleLoginError'));
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format before sending magic link
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        const suggestion = suggestEmailCorrection(email);
        if (suggestion) {
          toast.error(t('auth.emailSuggestion', { suggestion }));
        } else {
          const errorMessages: Record<string, string> = {
            'invalid_format': t('auth.emailInvalidFormat'),
            'tld_too_short': t('auth.emailTldTooShort'),
            'common_typo': t('auth.emailCommonTypo'),
            'domain_typo': t('auth.emailDomainTypo'),
          };
          toast.error(errorMessages[emailValidation.reason!] || t('auth.emailInvalidFormat'));
        }
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
      
      trackLogin("magic_link");
      toast.success(t('auth.magicLinkSent', 'Link mágico enviado! Verifique seu email.'));
    } catch (error: any) {
      toast.error(error.message || t('auth.magicLinkError', 'Erro ao enviar link mágico'));
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        // Check if user is in deleted_profiles (account was deactivated)
        if (!profile) {
          const { data: deletedCheck } = await supabase.rpc('check_deleted_user', {
            user_email: email
          });
          
          if (deletedCheck && deletedCheck.length > 0 && deletedCheck[0].is_deleted) {
            // User account was deactivated - sign them out and show message
            await supabase.auth.signOut();
            setView("account-deactivated");
            setLoading(false);
            return;
          }
        }

        // Check if user has verified OTP - if not, send new code and show verification screen
        if (profile && !profile.otp_verified) {
          // Send new OTP code
          try {
            await supabase.functions.invoke("send-confirmation-email", {
              body: { 
                email, 
                locale: localStorage.getItem("language") || "pt" 
              },
            });
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
          }
          
          toast.info(t('auth.verifyEmail.pleaseVerify', 'Por favor, verifique seu email para continuar'));
          setView("verify-email");
          setResendCooldown(60);
          setLoading(false);
          return;
        }

        // Use centralized profile completeness check
        const needsOnboarding = !isProfileComplete(profile);

        // Increment login count for push notification prompt
        const currentLoginCount = parseInt(localStorage.getItem("login_count") || "0", 10);
        localStorage.setItem("login_count", (currentLoginCount + 1).toString());

        trackLogin("email");
        toast.success(t('auth.loginSuccess'));
        if (needsOnboarding) {
          navigate("/onboarding", { replace: true });
        } else {
          // All users go to tavern - investors are now shown there
          navigate("/tavern", { replace: true });
        }
      } else if (view === "signup") {
        // Validate email format before signup
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          const suggestion = suggestEmailCorrection(email);
          if (suggestion) {
            toast.error(t('auth.emailSuggestion', { suggestion }));
          } else {
            const errorMessages: Record<string, string> = {
              'invalid_format': t('auth.emailInvalidFormat'),
              'tld_too_short': t('auth.emailTldTooShort'),
              'common_typo': t('auth.emailCommonTypo'),
              'domain_typo': t('auth.emailDomainTypo'),
            };
            toast.error(errorMessages[emailValidation.reason!] || t('auth.emailInvalidFormat'));
          }
          setLoading(false);
          return;
        }

        // Validate phone is provided and valid before signup
        if (!phoneE164 || !isPhoneValid) {
          toast.error(t('phone.required', 'Por favor, informe um telefone válido'));
          setLoading(false);
          return;
        }

        // Check password against HIBP before signup
        const hibpResult = await checkPassword(password);
        if (hibpResult.breached) {
          const breachMessage = (t as any)('auth.passwordBreached', { count: hibpResult.count.toLocaleString() });
          toast.error(breachMessage);
          setLoading(false);
          return;
        }

        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Don't set emailRedirectTo - we handle email verification with our own OTP system
            data: {
              // Pass phone in user_metadata so the database trigger can save it
              phone: phoneE164 || null,
            },
          },
        });
        if (error) throw error;
        
        if (data.user) {
          await trackReferral(data.user.id);
          
          // Always send OTP token for email verification (even if Supabase auto-confirms)
          try {
            await supabase.functions.invoke("send-confirmation-email", {
              body: { 
                email, 
                locale: localStorage.getItem("language") || "pt" 
              },
            });
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
          }
          
          trackSignup("email");
          toast.success(t('auth.confirmationEmailSent'));
          setView("verify-email");
          setResendCooldown(60);
        } else {
          // No user created (shouldn't happen)
          toast.error(t("authPage.authenticationFailed"));
        }
      }
    } catch (error: any) {
      // Provide more specific error messages
      let errorMessage = error.message || t("authPage.authenticationFailed");
      
      // Check for duplicate phone error
      if (errorMessage.includes("idx_profiles_phone_unique") || errorMessage.includes("duplicate key")) {
        errorMessage = t('auth.phoneAlreadyInUse', 'Este número de telefone já está cadastrado. Tente usar outro número ou faça login com sua conta existente.');
      }
      // Check for database errors during signup
      else if (errorMessage.includes("Database error saving new user")) {
        errorMessage = t('auth.databaseError', 'Erro ao criar conta. Este telefone pode já estar em uso. Tente outro número.');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format before sending reset
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        const suggestion = suggestEmailCorrection(email);
        if (suggestion) {
          toast.error(t('auth.emailSuggestion', { suggestion }));
        } else {
          const errorMessages: Record<string, string> = {
            'invalid_format': t('auth.emailInvalidFormat'),
            'tld_too_short': t('auth.emailTldTooShort'),
            'common_typo': t('auth.emailCommonTypo'),
            'domain_typo': t('auth.emailDomainTypo'),
          };
          toast.error(errorMessages[emailValidation.reason!] || t('auth.emailInvalidFormat'));
        }
        setLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("send-password-reset", {
        body: {
          email,
          locale: localStorage.getItem("language") || "pt",
        },
      });

      if (response.error) throw response.error;
      toast.success(t('auth.resetEmailSent'));
      setView("login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || t("authPage.resetEmailError"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsNoMatch'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      // Check password against HIBP before update
      const hibpResult = await checkPassword(password);
      if (hibpResult.breached) {
        const breachMessage = (t as any)('auth.passwordBreached', { count: hibpResult.count.toLocaleString() });
        toast.error(breachMessage);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      toast.success(t('auth.passwordUpdated'));
      setView("login");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      // Translate Supabase weak password error
      const message = error.message || "Failed to update password";
      if (message.toLowerCase().includes('weak') || message.toLowerCase().includes('easy to guess')) {
        toast.error(t('auth.weakPassword'));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white h-screen overflow-hidden">
      <div className="flex h-full w-full">
        
        {/* Left Side: Brand & Gamification (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 bg-guilda-surface relative flex-col items-center justify-center p-12 overflow-hidden">
          {/* Background Decorative */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'radial-gradient(#7610DC 1px, transparent 1px)', 
              backgroundSize: '30px 30px' 
            }} 
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-guilda-purple rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-guilda-accent rounded-full blur-[100px] opacity-20" />

          <div className="relative z-10 max-w-lg">
            <AuthTestimonial />
          
            <div className="mt-8 flex gap-4 text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                {t('auth.verifiedProfiles')}
              </div>
              <div className="flex items-center gap-2">
                <LockKeyhole className="w-5 h-5 text-purple-500" />
                {t('auth.integratedNDA')}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto bg-white">
          
          {/* Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <Link 
              to="/" 
              className="group flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors font-medium text-sm"
            >
              <div className="bg-slate-100 group-hover:bg-purple-100 p-2 rounded-full transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              {t('auth.backToHome')}
            </Link>
          </div>

          {/* Language Selector */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            <LanguageSelector />
            {/* Mobile Logo */}
            <div className="lg:hidden bg-purple-600 p-2 rounded-lg text-white">
              <Swords className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24">
            <div className="w-full max-w-md space-y-8">
              
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {view === "reset" && t('auth.resetPassword')}
                  {view === "update" && t('auth.newPassword')}
                  {view === "login" && t('auth.welcomeBack')}
                  {view === "signup" && t('auth.createYourAccount')}
                  {view === "magiclink" && t('auth.magicLinkTitle', 'Entrar sem senha')}
                  {view === "verify-email" && t('auth.verifyEmail.title')}
                </h1>
                <p className="mt-2 text-slate-500">
                  {view === "login" && t('auth.chooseClassContinue')}
                  {view === "signup" && t('auth.beginJourney')}
                  {view === "reset" && t('auth.enterEmailReset')}
                  {view === "update" && t('auth.chooseNewPassword')}
                  {view === "magiclink" && t('auth.magicLinkSubtitle', 'Enviaremos um link de acesso para seu email')}
                  {view === "verify-email" && t('auth.verifyEmail.subtitle')}
                </p>
              </div>

              {/* Back to Login Button for Reset/Update/MagicLink views */}
              {(view === "reset" || view === "update" || view === "magiclink") && (
                <Button
                  variant="ghost"
                  onClick={() => setView("login")}
                  className="mb-4"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('auth.backToLogin')}
                </Button>
              )}

              {/* Account Deactivated View */}
              {view === "account-deactivated" && (
                <AccountDeactivatedView 
                  email={email}
                  t={t}
                  onBack={() => setView("login")}
                />
              )}

              {/* Email Verification OTP View */}
              {view === "verify-email" && (
                <EmailVerificationStep
                  email={email}
                  onVerified={async () => {
                    // After OTP validation, refresh the session to get updated email_confirmed_at
                    // The verify-email-token edge function already confirmed the email in auth.users
                    await supabase.auth.refreshSession();
                    await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
                    toast.success(t('auth.accountCreated'));
                    navigate("/onboarding", { replace: true });
                  }}
                  onResend={async () => {
                    await supabase.functions.invoke("send-confirmation-email", {
                      body: { 
                        email, 
                        locale: localStorage.getItem("language") || "pt" 
                      },
                    });
                  }}
                  onBack={() => setView("signup")}
                />
              )}

              {/* Google Login Button */}
              {(view === "login" || view === "signup") && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('auth.continueWithGoogle')}
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-400">{t('auth.or')}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Login/Signup Form */}
              {(view === "login" || view === "signup") && (
                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      {t('auth.corporateEmail')}
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 py-3 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="nome@startup.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="block text-sm font-medium text-slate-700">
                        {t('auth.password')}
                      </Label>
                      {view === "login" && (
                        <button
                          type="button"
                          onClick={() => setView("reset")}
                          className="text-sm font-medium text-purple-600 hover:text-purple-800"
                        >
                          {t('auth.forgot')}
                        </button>
                      )}
                    </div>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 py-3 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Phone Input - Only on Signup */}
                  {view === "signup" && (
                    <div>
                      <PhoneInput
                        value={phone}
                        onChange={handlePhoneChange}
                        label={t('phone.label')}
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-800 transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    {loading ? t('common.processing') : view === "login" ? t('auth.enterGuild') : t('auth.createAccount')}
                  </Button>

                  {/* Magic Link Option */}
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => setView("magiclink")}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('auth.useMagicLink', 'Entrar com link mágico (sem senha)')}
                    </button>
                  )}
                </form>
              )}

              {/* Reset Password Form */}
              {view === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <Label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
                      {t('auth.email')}
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 py-3 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="nome@startup.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-800 transition-all"
                  >
                    {loading ? t('common.sending') : t('auth.sendResetLink')}
                  </Button>
                </form>
              )}

              {/* Magic Link Form */}
              {view === "magiclink" && (
                <form onSubmit={handleMagicLink} className="space-y-6">
                  <div>
                    <Label htmlFor="magiclink-email" className="block text-sm font-medium text-slate-700">
                      {t('auth.email')}
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        type="email"
                        id="magiclink-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 py-3 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="nome@startup.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? t('common.sending') : t('auth.sendMagicLink', 'Enviar link mágico')}
                  </Button>

                  <p className="text-center text-sm text-slate-500">
                    {t('auth.magicLinkHint', 'Você receberá um email com um link para acessar sua conta instantaneamente.')}
                  </p>
                </form>
              )}

              {/* Update Password Form */}
              {view === "update" && (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <Label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                      {t('auth.newPassword')}
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        type="password"
                        id="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 py-3 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                      {t('auth.confirmPassword')}
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 py-3 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-800 transition-all"
                  >
                    {loading ? t('common.updating') : t('auth.updatePassword')}
                  </Button>
                </form>
              )}

              {/* Toggle Login/Signup */}
              {(view === "login" || view === "signup") && (
                <p className="text-center text-sm text-slate-500">
                  {view === "login" ? t('auth.noAccountYet') : t('auth.alreadyHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setView(view === "login" ? "signup" : "login")}
                    className="font-bold text-purple-600 hover:text-purple-800"
                  >
                    {view === "login" ? t('auth.createFreeProfile') : t('auth.signIn')}
                  </button>
                </p>
              )}
            </div>
          </div>
          
          {/* Footer / Legal Links */}
          <div className="p-6 text-center lg:text-left lg:pl-24">
            <div className="text-xs text-slate-400 flex gap-4 justify-center lg:justify-start">
              <Link to="/terms" className="hover:text-slate-600">{t('auth.terms')}</Link>
              <Link to="/privacy" className="hover:text-slate-600">{t('auth.privacy')}</Link>
              <Link to="/blog" className="hover:text-slate-600">{t('auth.help')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Acceleration Dialog */}
      <AuthAccelerationDialog />
    </div>
  );
};

export default Auth;
