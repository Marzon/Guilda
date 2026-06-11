import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Crown, Check, Infinity, MessageCircle, Eye, Sparkles, 
  FileText, Star, Rocket
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface FounderUnlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expiresAt?: string;
}

const UNLOCKED_BENEFITS = [
  {
    icon: <Infinity className="w-5 h-5" />,
    title: 'Projetos Ilimitados',
    description: 'Crie quantos projetos quiser',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Matches Ilimitados',
    description: 'Conecte-se com quem quiser',
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: 'Mensagens Ilimitadas',
    description: 'Sem limite de conversas',
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Ver Quem Viu Seu Perfil',
    description: 'Descubra quem se interessou',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Destaque no Grid',
    description: 'Apareça em primeiro',
  },
  {
    icon: <Check className="w-5 h-5" />,
    title: 'Badge Verificado',
    description: 'Selo de membro premium',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Contratos Jurídicos',
    description: 'Modelos prontos para uso',
  },
  {
    icon: <Rocket className="w-5 h-5" />,
    title: 'Aceleração BuildUP',
    description: 'Acesso ao programa de 15 dias',
  },
];

export const FounderUnlockedDialog = ({ open, onOpenChange, expiresAt }: FounderUnlockedDialogProps) => {
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage as 'pt' | 'en' | 'es';

  useEffect(() => {
    if (open) {
      // Trigger confetti when dialog opens
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 }
        });
      }, 300);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center">
            <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            {lang === 'pt' ? 'Você agora é Founder!' : lang === 'es' ? '¡Ahora eres Founder!' : 'You are now a Founder!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground">
              {lang === 'pt' 
                ? 'Parabéns! Você desbloqueou todos os benefícios premium da Guilda.'
                : lang === 'es'
                ? '¡Felicidades! Desbloqueaste todos los beneficios premium de Guilda.'
                : 'Congratulations! You unlocked all Guilda premium benefits.'}
            </p>
            {expiresAt && (
              <p className="text-sm text-purple-600 font-medium">
                {lang === 'pt' ? 'Válido até' : lang === 'es' ? 'Válido hasta' : 'Valid until'}: {new Date(expiresAt).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')}
              </p>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-3">
            {UNLOCKED_BENEFITS.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm">
                  {benefit.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 rounded-xl shadow-lg"
            size="lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            {lang === 'pt' ? 'Explorar a Taverna' : lang === 'es' ? 'Explorar la Taverna' : 'Explore the Tavern'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
