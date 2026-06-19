import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { 
  MessageCircle, Linkedin, Instagram, Video, Send, Facebook, 
  MessageSquare, Hash, ArrowLeft, ArrowRight, Upload, CheckCircle2,
  XCircle, Loader2, Copy, Sparkles, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";


interface SocialPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Platform = 'whatsapp' | 'linkedin' | 'instagram' | 'tiktok' | 'telegram' | 'facebook' | 'discord' | 'slack';
type Step = 'platform' | 'template' | 'upload' | 'result';

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

export const SocialPaymentDialog = ({ open, onOpenChange }: SocialPaymentDialogProps) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    reasons?: string[];
    expiresAt?: string;
  } | null>(null);

  const selectedPlatformConfig = PLATFORMS.find(p => p.id === selectedPlatform);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep('template');
  };

  const handleCopyTemplate = () => {
    if (selectedPlatformConfig) {
      navigator.clipboard.writeText(selectedPlatformConfig.template);
      toast.success('Texto copiado! Cole na sua postagem.');
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

  const handleSubmit = async () => {
    if (!imagePreview || !selectedPlatform) return;

    setIsSubmitting(true);
    try {
      // Check session before calling edge function
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        onOpenChange(false);
        window.location.href = '/auth';
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-social-post', {
        body: {
          platform: selectedPlatform,
          evidence_image: imagePreview,
        }
      });

      if (error) {
        // Check for auth-related errors
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('unauthorized') || 
            errorMessage.includes('token') || 
            errorMessage.includes('auth') ||
            errorMessage.includes('jwt')) {
          toast.error('Sua sessão expirou. Por favor, faça login novamente.');
          onOpenChange(false);
          window.location.href = '/auth';
          return;
        }
        throw error;
      }

      if (data.success) {
        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        setResult({
          success: true,
          message: data.message,
          expiresAt: data.expires_at,
        });
        
        // Refresh subscription data - invalidate all subscription queries
        // The query key is ['subscription', userId], so we need to invalidate with predicate
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'subscription' 
        });
      } else {
        setResult({
          success: false,
          message: data.message || data.error,
          reasons: data.reasons,
        });
      }

      setStep('result');
    } catch (error: any) {
      console.error('Error submitting:', error);
      // Provide more helpful error messages
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('non-2xx') || errorMsg.includes('500')) {
        toast.error('Erro no servidor. Tente novamente em alguns segundos.');
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error(error.message || 'Erro ao verificar postagem. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setShowUnlockedDialog(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSuccessClose = () => {
    // Close this dialog and show the unlocked benefits dialog
    onOpenChange(false);
    handlePaymentSuccess();
  };

  const handlePaymentSuccess = () => {
    handleReset();
    // Navigate to tavern
    navigate('/tavern');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Vire Founder de Graça
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Platform Selection */}
        {step === 'platform' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha uma rede social para divulgar a Guilda. Após postar, tire um screenshot e envie para validação automática.
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

              <div className="bg-white/80 p-3 rounded-lg text-sm mb-3 whitespace-pre-wrap">
                {selectedPlatformConfig.template}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyTemplate}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Texto
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Publique o post, tire um screenshot da publicação feita, e depois clique em "Já Postei" para enviar.
              </p>
            </div>

            <Button 
              onClick={() => setStep('upload')}
              className="w-full"
            >
              Já Postei!
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
              Voltar
            </Button>

            <p className="text-sm text-muted-foreground">
              Envie um screenshot da sua postagem publicada. Nossa IA vai verificar automaticamente.
            </p>

            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full rounded-lg border"
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
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Clique para enviar screenshot
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG até 5MB
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
              onClick={handleSubmit}
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

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <div className="space-y-4 text-center py-4">
            {result.success ? (
              <>
                <div className="flex justify-center">
                  <div className="bg-green-100 p-6 rounded-full">
                    <Crown className="w-16 h-16 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-green-600">
                  Parabéns! 🎉
                </h3>
                <p className="text-muted-foreground">
                  {result.message}
                </p>
                {result.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Válido até: {new Date(result.expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <Button onClick={handleSuccessClose} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Ver Meus Benefícios
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="bg-red-100 p-6 rounded-full">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-red-600">
                  Não Aprovado
                </h3>
                <p className="text-muted-foreground">
                  {result.message}
                </p>
                {result.reasons && result.reasons.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg text-left">
                    <p className="text-sm font-medium text-red-800 mb-2">Motivos:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-red-700">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button onClick={handleReset} className="w-full">
                  Tentar Novamente
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>

    </Dialog>
  );
};
