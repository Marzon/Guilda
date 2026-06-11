import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MessageCircle, Linkedin, Instagram, Video, Send, Facebook, 
  MessageSquare, Hash, ArrowLeft, ArrowRight, Upload, CheckCircle2,
  XCircle, Loader2, Copy, Sparkles, Mail, Phone, User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialPaymentMarketingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Platform = 'whatsapp' | 'linkedin' | 'instagram' | 'tiktok' | 'telegram' | 'facebook' | 'discord' | 'slack';
type Step = 'platform' | 'template' | 'upload' | 'signup' | 'success';

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
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    template: '🚀 Descobri a Guilda (https://guilda.app.br) - uma plataforma incrível para encontrar cofounders! Builders e Sellers se conectam para lançar negócios juntos. Tem programa de aceleração de 15 dias e acesso a investidores. Se você está empreendendo, vale muito conferir!',
    instructions: 'Publique no seu Status ou em um grupo de empreendedores/startups'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    template: '🎯 Dica para quem está buscando cofounders!\n\nConheci a Guilda (https://guilda.app.br) - uma plataforma brasileira que conecta Builders (técnicos) com Sellers (comerciais) para formar duplas de cofounders.\n\nAlém do match baseado em skills complementares, tem programa de aceleração "BuildUP" de 15 dias com mentor IA e conexão com investidores.\n\nVale conferir se você está querendo encontrar um sócio para sua próxima startup!\n\n#startup #cofounder #empreendedorismo #aceleradora #investimento',
    instructions: 'Publique como um post no seu feed'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="w-6 h-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
    template: '🚀 Encontrei a plataforma perfeita pra quem quer empreender!\n\nA Guilda (https://guilda.app.br) conecta devs e pessoas de negócios para formar duplas de cofounders.\n\nTem programa de aceleração de 15 dias e acesso a investidores! Se você tá procurando um sócio, vale muito conferir 💜\n\n#startup #cofounder #empreendedorismo #aceleradora',
    instructions: 'Publique no seu Story ou Feed'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <Video className="w-6 h-6" />,
    color: 'text-slate-900',
    bgColor: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
    template: 'Descobri um "Tinder de cofounders" chamado Guilda! 🚀 Conecta devs com pessoas de negócios pra criar startups. Tem programa de aceleração de 15 dias e acesso a investidores! Link: https://guilda.app.br #startup #empreendedorismo #cofounder #investimento',
    instructions: 'Publique um vídeo mencionando a Guilda'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <Send className="w-6 h-6" />,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
    template: '🚀 Dica: Conheci a Guilda (https://guilda.app.br) - plataforma para encontrar cofounders! Conecta Builders com Sellers, tem programa de aceleração de 15 dias e acesso a investidores. Se você está procurando um sócio para sua startup, vale conferir!',
    instructions: 'Publique em um canal ou grupo de empreendedores'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="w-6 h-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    template: '🎯 Dica para empreendedores!\n\nConheci a Guilda (https://guilda.app.br) - uma plataforma que conecta pessoas técnicas com pessoas de negócios para formar duplas de cofounders.\n\nAlém do match, tem programa de aceleração "BuildUP" de 15 dias e acesso a investidores. Se você está buscando um sócio para sua startup, vale muito conferir!',
    instructions: 'Publique no seu feed ou em grupos de startups'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    template: '🚀 Descobri uma plataforma muito boa pra quem tá procurando cofounders: Guilda (https://guilda.app.br)\n\nConecta devs com pessoas de negócios, tem programa de aceleração de 15 dias e acesso a investidores. Se alguém aqui tá querendo um sócio pra startup, vale conferir!',
    instructions: 'Publique em um servidor de startups/devs'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: <Hash className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    template: '🚀 Dica: Conheci a Guilda (https://guilda.app.br) - plataforma para encontrar cofounders. Conecta Builders com Sellers, tem aceleração de 15 dias e acesso a investidores. Se alguém está procurando sócio para startup, recomendo!',
    instructions: 'Publique em um canal de carreira/startups'
  }
];

export const SocialPaymentMarketingDialog = ({ open, onOpenChange }: SocialPaymentMarketingDialogProps) => {
  const { t, currentLanguage } = useLanguage();
  const lang = currentLanguage as 'pt' | 'en' | 'es';
  
  const [step, setStep] = useState<Step>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Signup form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<{name?: string; email?: string; phone?: string}>({});

  const selectedPlatformConfig = PLATFORMS.find(p => p.id === selectedPlatform);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep('template');
  };

  const handleCopyTemplate = () => {
    if (selectedPlatformConfig) {
      navigator.clipboard.writeText(selectedPlatformConfig.template);
      toast.success(lang === 'pt' ? 'Texto copiado! Cole na sua postagem.' : lang === 'es' ? '¡Texto copiado!' : 'Text copied!');
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'pt' ? 'A imagem deve ter no máximo 5MB' : lang === 'es' ? 'La imagen debe tener máximo 5MB' : 'Image must be under 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [lang]);

  const validateForm = (): boolean => {
    const errors: {name?: string; email?: string; phone?: string} = {};
    
    if (!name.trim()) {
      errors.name = lang === 'pt' ? 'Nome é obrigatório' : lang === 'es' ? 'Nombre es obligatorio' : 'Name is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = lang === 'pt' ? 'Email é obrigatório' : lang === 'es' ? 'Email es obligatorio' : 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = lang === 'pt' ? 'Email inválido' : lang === 'es' ? 'Email inválido' : 'Invalid email';
    }
    
    if (!phone.trim()) {
      errors.phone = lang === 'pt' ? 'Celular é obrigatório' : lang === 'es' ? 'Celular es obligatorio' : 'Phone is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !imagePreview || !selectedPlatform) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('social-payment-signup', {
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          platform: selectedPlatform,
          evidence_image: imagePreview,
          locale: lang,
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar');
      }

      if (data.success) {
        setStep('success');
      } else {
        toast.error(data.error || 'Erro ao processar');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar';
      console.error('Error:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setImageFile(null);
    setImagePreview(null);
    setName('');
    setEmail('');
    setPhone('');
    setFormErrors({});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            {lang === 'pt' ? 'Ganhe 6 Meses Grátis!' : lang === 'es' ? '¡Gana 6 Meses Gratis!' : 'Get 6 Months Free!'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Platform Selection */}
        {step === 'platform' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {lang === 'pt' 
                ? 'Escolha uma rede social para divulgar a Guilda. Após postar, tire um screenshot e cadastre-se para validação.' 
                : lang === 'es'
                ? 'Elige una red social para compartir Guilda. Después de publicar, toma una captura y regístrate.'
                : 'Choose a social network to share Guilda. After posting, take a screenshot and sign up for validation.'}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    platform.bgColor
                  )}
                >
                  <div className={platform.color}>{platform.icon}</div>
                  <span className="font-medium text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Template & Instructions */}
        {step === 'template' && selectedPlatformConfig && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('platform')}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {lang === 'pt' ? 'Voltar' : lang === 'es' ? 'Volver' : 'Back'}
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

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyTemplate}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                {lang === 'pt' ? 'Copiar Texto' : lang === 'es' ? 'Copiar Texto' : 'Copy Text'}
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>{lang === 'pt' ? 'Importante:' : lang === 'es' ? 'Importante:' : 'Important:'}</strong>{' '}
                {lang === 'pt' 
                  ? 'Publique o post, tire um screenshot da publicação feita, e depois clique em "Já Postei".'
                  : lang === 'es'
                  ? 'Publica el post, toma una captura de pantalla, y haz clic en "Ya Publiqué".'
                  : 'Post the content, take a screenshot, then click "I Posted".'}
              </p>
            </div>

            <Button 
              onClick={() => setStep('upload')}
              className="w-full"
            >
              {lang === 'pt' ? 'Já Postei!' : lang === 'es' ? '¡Ya Publiqué!' : 'I Posted!'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Upload Screenshot */}
        {step === 'upload' && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('template')}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {lang === 'pt' ? 'Voltar' : lang === 'es' ? 'Volver' : 'Back'}
            </Button>

            <p className="text-sm text-muted-foreground">
              {lang === 'pt' 
                ? 'Envie um screenshot da sua postagem publicada.'
                : lang === 'es'
                ? 'Sube una captura de pantalla de tu publicación.'
                : 'Upload a screenshot of your published post.'}
            </p>

            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full rounded-lg border max-h-48 object-contain"
                  />
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
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {lang === 'pt' ? 'Clique para enviar screenshot' : lang === 'es' ? 'Clic para subir captura' : 'Click to upload screenshot'}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG {lang === 'pt' ? 'até' : lang === 'es' ? 'hasta' : 'up to'} 5MB
                  </span>
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
              onClick={() => setStep('signup')}
              disabled={!imagePreview}
              className="w-full"
            >
              {lang === 'pt' ? 'Continuar' : lang === 'es' ? 'Continuar' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 4: Signup Form */}
        {step === 'signup' && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('upload')}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {lang === 'pt' ? 'Voltar' : lang === 'es' ? 'Volver' : 'Back'}
            </Button>

            <p className="text-sm text-muted-foreground">
              {lang === 'pt' 
                ? 'Preencha seus dados para criar sua conta e validar a postagem.'
                : lang === 'es'
                ? 'Completa tus datos para crear tu cuenta y validar la publicación.'
                : 'Fill in your details to create your account and validate the post.'}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {lang === 'pt' ? 'Nome' : lang === 'es' ? 'Nombre' : 'Name'}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'pt' ? 'Seu nome completo' : lang === 'es' ? 'Tu nombre completo' : 'Your full name'}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'pt' ? 'seu@email.com' : 'your@email.com'}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {lang === 'pt' ? 'Celular' : lang === 'es' ? 'Celular' : 'Phone'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className={formErrors.phone ? 'border-red-500' : ''}
                />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <p className="text-sm text-purple-800">
                {lang === 'pt' 
                  ? '📧 Você receberá um link mágico por email para acessar sua conta.'
                  : lang === 'es'
                  ? '📧 Recibirás un enlace mágico por email para acceder a tu cuenta.'
                  : '📧 You will receive a magic link by email to access your account.'}
              </p>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {lang === 'pt' ? 'Processando...' : lang === 'es' ? 'Procesando...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {lang === 'pt' ? 'Criar Conta e Validar' : lang === 'es' ? 'Crear Cuenta y Validar' : 'Create Account & Validate'}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-green-600">
              {lang === 'pt' ? 'Quase lá! 🎉' : lang === 'es' ? '¡Casi listo! 🎉' : 'Almost there! 🎉'}
            </h3>
            
            <p className="text-muted-foreground">
              {lang === 'pt' 
                ? 'Enviamos um link mágico para o seu email. Clique nele para acessar sua conta e completar o cadastro.'
                : lang === 'es'
                ? 'Enviamos un enlace mágico a tu email. Haz clic para acceder a tu cuenta y completar el registro.'
                : 'We sent a magic link to your email. Click it to access your account and complete the signup.'}
            </p>
            
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">
                📧 {email}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {lang === 'pt' 
                ? 'Não recebeu? Verifique sua pasta de spam.'
                : lang === 'es'
                ? '¿No lo recibiste? Revisa tu carpeta de spam.'
                : "Didn't receive it? Check your spam folder."}
            </p>

            <Button onClick={handleClose} variant="outline" className="w-full mt-4">
              {lang === 'pt' ? 'Fechar' : lang === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
