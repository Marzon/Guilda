import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useLanguage } from "@/hooks/useLanguage";
import { useHIBPCheck } from "@/hooks/useHIBPCheck";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { styledToast } from "@/utils/styledToast";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { trackSignup, trackLogin } from "@/lib/analytics";
import {
  ArrowLeft, ArrowRight, Mail, Lock, Phone, User,
  Loader2, CheckCircle2, XCircle, Upload, Copy,
  Crown, Sparkles, Eye, EyeOff, Hammer, TrendingUp, DollarSign,
  MessageCircle, Linkedin, Instagram, Video, Send, Facebook, 
  MessageSquare, Hash
} from "lucide-react";

interface UnlockGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'auth' | 'verify-email' | 'archetype' | 'username' | 'social-platform' | 'social-template' | 'social-upload' | 'social-result' | 'success';
type Platform = 'whatsapp' | 'linkedin' | 'instagram' | 'tiktok' | 'telegram' | 'facebook' | 'discord' | 'slack';

interface PlatformConfig {
  id: Platform;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  template: string;
  instructions: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    template: '🚀 Descobri a Guilda (guilda.app.br) - uma plataforma incrível para encontrar cofounders e parceiros para startups! Builders e Sellers se conectam para lançar negócios juntos. Se você está empreendendo, vale muito conferir!',
    instructions: 'Publique no seu Status ou em um grupo de empreendedores/startups'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    template: '🎯 Dica para quem está buscando cofounders!\n\nConheci a Guilda (guilda.app.br) - uma plataforma brasileira que conecta Builders (técnicos) com Sellers (comerciais) para formar duplas de cofounders.\n\nO match é baseado em skills complementares e interesses em comum. Vale conferir se você está querendo encontrar um sócio para sua próxima startup!\n\n#startup #cofounder #empreendedorismo #guilda',
    instructions: 'Publique como um post no seu feed'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="w-5 h-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
    template: '🚀 Encontrei a plataforma perfeita pra quem quer empreender!\n\nA @guilda.app.br conecta devs e pessoas de negócios para formar duplas de cofounders.\n\nSe você tá procurando um sócio técnico ou comercial, vale muito conferir 💜\n\n#startup #cofounder #empreendedorismo',
    instructions: 'Publique no seu Story ou Feed'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <Video className="w-5 h-5" />,
    color: 'text-slate-900',
    bgColor: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
    template: 'Descobri um "Tinder de cofounders" chamado Guilda! 🚀 Conecta desenvolvedores com pessoas de negócios pra criar startups juntos. Link na bio: guilda.app.br #startup #empreendedorismo #cofounder #tech',
    instructions: 'Publique um vídeo mencionando a Guilda'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <Send className="w-5 h-5" />,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
    template: '🚀 Dica: Conheci a Guilda (guilda.app.br) - plataforma para encontrar cofounders! Conecta Builders (devs) com Sellers (comercial). Se você está procurando um sócio para sua startup, vale conferir!',
    instructions: 'Publique em um canal ou grupo de empreendedores'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="w-5 h-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    template: '🎯 Dica para empreendedores!\n\nConheci a Guilda (guilda.app.br) - uma plataforma que conecta pessoas técnicas com pessoas de negócios para formar duplas de cofounders.\n\nSe você está buscando um sócio para sua startup, vale muito conferir! O match é baseado em skills complementares.',
    instructions: 'Publique no seu feed ou em grupos de startups'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    template: '🚀 Descobri uma plataforma muito boa pra quem tá procurando cofounders: Guilda (guilda.app.br)\n\nConecta devs com pessoas de negócios. Se alguém aqui tá querendo um sócio pra startup, vale conferir!',
    instructions: 'Publique em um servidor de startups/devs'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: <Hash className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    template: '🚀 Dica: Conheci a Guilda (guilda.app.br) - plataforma para encontrar cofounders. Conecta Builders com Sellers. Se alguém está procurando sócio para startup, recomendo dar uma olhada!',
    instructions: 'Publique em um canal de carreira/startups'
  }
];

const STEPS_ORDER: Step[] = ['auth', 'verify-email', 'archetype', 'username', 'social-platform', 'social-template', 'social-upload', 'social-result', 'success'];

export const UnlockGateDialog = ({ open, onOpenChange, onSuccess }: UnlockGateDialogProps) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { checkPassword } = useHIBPCheck();
  
  // Auth state
  const [step, setStep] = useState<Step>('auth');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | undefined>();
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP state
  const [otpToken, setOtpToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Archetype state
  const [archetype, setArchetype] = useState<"BUILDER" | "SELLER" | "INVESTOR" | null>(null);
  
  // Username state
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  
  // Social payment state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialResult, setSocialResult] = useState<{
    success: boolean;
    message: string;
    reasons?: string[];
    expiresAt?: string;
  } | null>(null);
  
  // User ID for updating profile
  const [userId, setUserId] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handlePhoneChange = (value: string, valid: boolean, e164?: string) => {
    setPhone(value);
    setIsPhoneValid(valid);
    setPhoneE164(e164);
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (authMode === 'signup') {
        // Validate phone
        if (!phoneE164 || !isPhoneValid) {
          toast.error(t('phone.required', 'Por favor, informe um telefone válido'));
          setLoading(false);
          return;
        }

        // Check password against HIBP
        const hibpResult = await checkPassword(password);
        if (hibpResult.breached) {
          toast.error(`Essa senha apareceu em ${hibpResult.count.toLocaleString()} vazamentos. Escolha outra.`);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              phone: phoneE164 || null,
            },
          },
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUserId(data.user.id);
          
          // Send OTP
          await supabase.functions.invoke("send-confirmation-email", {
            body: { email, locale: localStorage.getItem("language") || "pt" },
          });
          
          trackSignup("email");
          setStep('verify-email');
          setResendCooldown(60);
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUserId(data.user.id);
          await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
          
          // Check if user has verified OTP
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          
          if (profile && !profile.otp_verified) {
            await supabase.functions.invoke("send-confirmation-email", {
              body: { email, locale: localStorage.getItem("language") || "pt" },
            });
            setStep('verify-email');
            setResendCooldown(60);
          } else if (profile && profile.archetype && profile.username) {
            // Already has profile - check social payment
            const { data: socialPayment } = await supabase
              .from('social_payment_submissions')
              .select('status')
              .eq('user_id', data.user.id)
              .eq('status', 'approved')
              .maybeSingle();
            
            if (socialPayment) {
              // Already unlocked
              trackLogin("email");
              onSuccess();
              handleClose();
            } else {
              // Go to social payment
              trackLogin("email");
              setStep('social-platform');
            }
          } else {
            // Needs to complete profile
            trackLogin("email");
            setStep(profile?.otp_verified ? 'archetype' : 'verify-email');
          }
        }
      }
    } catch (error: any) {
      let errorMessage = error.message || "Erro de autenticação";
      
      if (errorMessage.includes("idx_profiles_phone_unique") || errorMessage.includes("duplicate key")) {
        errorMessage = "Este número de telefone já está cadastrado.";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpToken.length !== 6) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-email-token", {
        body: { email, token: otpToken },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Código inválido");

      styledToast.success("✅ Email verificado!", "Sua conta foi confirmada com sucesso");
      setStep('archetype');
    } catch (error: any) {
      styledToast.error("❌ Código inválido", error.message || "Verifique e tente novamente");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await supabase.functions.invoke("send-confirmation-email", {
        body: { email, locale: localStorage.getItem("language") || "pt" },
      });
      styledToast.success("📧 Código enviado!", "Verifique sua caixa de entrada");
      setResendCooldown(60);
    } catch (error) {
      styledToast.error("❌ Erro ao enviar", "Tente novamente em alguns segundos");
    }
  };

  const handleArchetypeSelect = (value: "BUILDER" | "SELLER" | "INVESTOR") => {
    setArchetype(value);
  };

  const handleArchetypeContinue = async () => {
    if (!archetype || !userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ archetype })
        .eq("id", userId);
      
      if (error) throw error;
      setStep('username');
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar arquétipo");
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = async (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    
    if (sanitized.length < 3) {
      setUsernameError("Username deve ter pelo menos 3 caracteres");
      return;
    }
    
    if (sanitized.length > 20) {
      setUsernameError("Username deve ter no máximo 20 caracteres");
      return;
    }
    
    // Check availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", sanitized)
      .neq("id", userId || "")
      .maybeSingle();
    
    if (existing) {
      setUsernameError("Este username já está em uso");
    } else {
      setUsernameError("");
    }
  };

  const handleUsernameContinue = async () => {
    if (!username || usernameError || !userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", userId);
      
      if (error) throw error;
      setStep('social-platform');
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar username");
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep('social-template');
  };

  const handleCopyTemplate = () => {
    const config = PLATFORMS.find(p => p.id === selectedPlatform);
    if (config) {
      navigator.clipboard.writeText(config.template);
      toast.success('Texto copiado!');
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSocialSubmit = async () => {
    if (!imagePreview || !selectedPlatform) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-social-post', {
        body: {
          platform: selectedPlatform,
          evidence_image: imagePreview,
        }
      });

      if (error) throw error;

      if (data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        setSocialResult({
          success: true,
          message: data.message,
          expiresAt: data.expires_at,
        });
        
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'subscription' || query.queryKey[0] === 'social-payment-status'
        });
        
        setStep('social-result');
      } else {
        setSocialResult({
          success: false,
          message: data.message || data.error,
          reasons: data.reasons,
        });
        setStep('social-result');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar postagem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedPlatform(null);
    setImageFile(null);
    setImagePreview(null);
    setSocialResult(null);
    setStep('social-platform');
  };

  const handleClose = () => {
    // Reset all state
    setStep('auth');
    setAuthMode('signup');
    setEmail("");
    setPassword("");
    setPhone("");
    setPhoneE164(undefined);
    setIsPhoneValid(false);
    setOtpToken("");
    setArchetype(null);
    setUsername("");
    setUsernameError("");
    setSelectedPlatform(null);
    setImageFile(null);
    setImagePreview(null);
    setSocialResult(null);
    setUserId(null);
    onOpenChange(false);
  };

  const handleSuccessClose = () => {
    handleClose();
    onSuccess();
  };

  const getStepIndex = () => STEPS_ORDER.indexOf(step);
  const totalSteps = 6; // Auth, Verify, Archetype, Username, Social, Success (simplified view)

  const selectedPlatformConfig = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0" hideCloseButton>
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${((getStepIndex() + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step 1: Auth (Signup/Login) */}
          {step === 'auth' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold">Desbloqueie Grátis</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie sua conta e compartilhe a Guilda para ver os resultados
                </p>
              </div>

              {/* Toggle Signup/Login */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode('signup')}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    authMode === 'signup' ? "bg-white shadow-sm" : "text-slate-600"
                  )}
                >
                  Criar Conta
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    authMode === 'login' ? "bg-white shadow-sm" : "text-slate-600"
                  )}
                >
                  Entrar
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <Label className="text-sm">Telefone (WhatsApp)</Label>
                    <div className="mt-1">
                      <PhoneInput
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAuth}
                disabled={loading || !email || !password || (authMode === 'signup' && !isPhoneValid)}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {authMode === 'signup' ? 'Criar Conta' : 'Entrar'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Email Verification */}
          {step === 'verify-email' && (
            <div className="space-y-4 animate-fade-in">
              <Button variant="ghost" size="sm" onClick={() => setStep('auth')} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold">Verifique seu Email</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enviamos um código de 6 dígitos para <strong>{email}</strong>
                </p>
              </div>

              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otpToken}
                  onChange={setOtpToken}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otpToken.length !== 6}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verificar Código
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-sm text-purple-600 hover:text-purple-800 disabled:text-slate-400"
                >
                  {resendCooldown > 0 
                    ? `Reenviar código em ${resendCooldown}s` 
                    : 'Reenviar código'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Archetype Selection */}
          {step === 'archetype' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-bold">Qual seu perfil?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Isso nos ajuda a conectar você com as pessoas certas
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Card
                  className={cn(
                    "p-3 cursor-pointer transition-all border-2",
                    archetype === "BUILDER"
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleArchetypeSelect("BUILDER")}
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                      <Hammer className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold">Builder</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Dev, Designer, Técnico
                    </p>
                  </div>
                </Card>

                <Card
                  className={cn(
                    "p-3 cursor-pointer transition-all border-2",
                    archetype === "SELLER"
                      ? "border-accent shadow-lg shadow-accent/20"
                      : "border-border hover:border-accent/50"
                  )}
                  onClick={() => handleArchetypeSelect("SELLER")}
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-bold">Seller</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Vendas, Marketing, Negócios
                    </p>
                  </div>
                </Card>

                <Card
                  className={cn(
                    "p-3 cursor-pointer transition-all border-2",
                    archetype === "INVESTOR"
                      ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "border-border hover:border-emerald-500/50"
                  )}
                  onClick={() => handleArchetypeSelect("INVESTOR")}
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-bold">Investor</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Anjo, VC, Family Office
                    </p>
                  </div>
                </Card>
              </div>

              <Button
                onClick={handleArchetypeContinue}
                disabled={!archetype || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 4: Username */}
          {step === 'username' && (
            <div className="space-y-4 animate-fade-in">
              <Button variant="ghost" size="sm" onClick={() => setStep('archetype')} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold">Escolha seu Username</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Este será seu identificador único na plataforma
                </p>
              </div>

              <div>
                <Label htmlFor="username" className="text-sm">Username</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => validateUsername(e.target.value)}
                    placeholder="seunome"
                    className="pl-8"
                  />
                </div>
                {usernameError && (
                  <p className="text-xs text-destructive mt-1">{usernameError}</p>
                )}
              </div>

              <Button
                onClick={handleUsernameContinue}
                disabled={!username || !!usernameError || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 5a: Social Platform Selection */}
          {step === 'social-platform' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">Último Passo!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Compartilhe a Guilda em uma rede social para desbloquear
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      platform.bgColor
                    )}
                  >
                    <div className={platform.color}>{platform.icon}</div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5b: Social Template */}
          {step === 'social-template' && selectedPlatformConfig && (
            <div className="space-y-4 animate-fade-in">
              <Button variant="ghost" size="sm" onClick={() => setStep('social-platform')} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>

              <div className={cn("p-4 rounded-xl border-2", selectedPlatformConfig.bgColor)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={selectedPlatformConfig.color}>{selectedPlatformConfig.icon}</div>
                  <span className="font-semibold">{selectedPlatformConfig.name}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedPlatformConfig.instructions}
                </p>

                <div className="bg-white/80 p-3 rounded-lg text-sm mb-3 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {selectedPlatformConfig.template}
                </div>

                <Button variant="outline" size="sm" onClick={handleCopyTemplate} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Texto
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Importante:</strong> Publique o post, tire um screenshot, e clique em "Já Postei".
                </p>
              </div>

              <Button onClick={() => setStep('social-upload')} className="w-full">
                Já Postei!
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 5c: Social Upload */}
          {step === 'social-upload' && (
            <div className="space-y-4 animate-fade-in">
              <Button variant="ghost" size="sm" onClick={() => setStep('social-template')} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>

              <div className="text-center">
                <h2 className="text-lg font-bold">Envie o Screenshot</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Nossa IA vai verificar automaticamente
                </p>
              </div>

              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg border" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Clique para enviar</span>
                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <Button
                onClick={handleSocialSubmit}
                disabled={!imagePreview || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar Postagem
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 5d: Social Result */}
          {step === 'social-result' && socialResult && (
            <div className="space-y-4 text-center py-4 animate-fade-in">
              {socialResult.success ? (
                <>
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-6 rounded-full">
                      <Crown className="w-16 h-16 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-green-600">Parabéns! 🎉</h3>
                  <p className="text-muted-foreground">{socialResult.message}</p>
                  {socialResult.expiresAt && (
                    <p className="text-sm text-muted-foreground">
                      Válido até: {new Date(socialResult.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <Button onClick={handleSuccessClose} className="w-full">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ver Meus Resultados
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="bg-red-100 p-6 rounded-full">
                      <XCircle className="w-16 h-16 text-red-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-red-600">Não Aprovado</h3>
                  <p className="text-muted-foreground">{socialResult.message}</p>
                  {socialResult.reasons && socialResult.reasons.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg text-left">
                      <p className="text-sm font-medium text-red-800 mb-2">Motivos:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {socialResult.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-red-700">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button onClick={handleRetry} className="w-full">
                    Tentar Novamente
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
