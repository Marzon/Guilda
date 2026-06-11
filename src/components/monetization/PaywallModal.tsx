import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { PixPaymentModal } from "./PixPaymentModal";
import { SocialPaymentDialog } from "./SocialPaymentDialog";
import { useLanguage } from "@/hooks/useLanguage";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: "daily_limit" | "view_likes" | "messages_limit" | "project_limit" | "message_limit" | "profile_viewers" | "premium_feature";
}

export const PaywallModal = ({ open, onOpenChange, reason }: PaywallModalProps) => {
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage as 'pt' | 'en' | 'es';

  const handleUpgrade = () => {
    setPixModalOpen(true);
  };

  const handleSocialPayment = () => {
    onOpenChange(false);
    setSocialDialogOpen(true);
  };

  const getReasonTitle = () => {
    switch (reason) {
      case "daily_limit":
        return lang === 'pt' ? "Limite de matches atingido" : lang === 'es' ? "Límite de matches alcanzado" : "Match limit reached";
      case "message_limit":
      case "messages_limit":
        return lang === 'pt' ? "Limite de mensagens atingido" : lang === 'es' ? "Límite de mensajes alcanzado" : "Message limit reached";
      case "project_limit":
        return lang === 'pt' ? "Limite de projetos atingido" : lang === 'es' ? "Límite de proyectos alcanzado" : "Project limit reached";
      case "view_likes":
      case "profile_viewers":
        return lang === 'pt' ? "Recurso exclusivo Founder" : lang === 'es' ? "Recurso exclusivo Founder" : "Founder exclusive feature";
      default:
        return lang === 'pt' ? "Desbloqueie mais recursos" : lang === 'es' ? "Desbloquea más recursos" : "Unlock more features";
    }
  };

  const getReasonDescription = () => {
    switch (reason) {
      case "daily_limit":
        return lang === 'pt' 
          ? "Você usou seus 3 matches gratuitos da semana. Seja Founder para matches ilimitados!"
          : lang === 'es'
          ? "Has usado tus 3 matches gratuitos de la semana. ¡Sé Founder para matches ilimitados!"
          : "You've used your 3 free matches this week. Become Founder for unlimited matches!";
      case "message_limit":
      case "messages_limit":
        return lang === 'pt'
          ? "Você atingiu o limite de 30 mensagens do plano gratuito. Seja Founder para mensagens ilimitadas!"
          : lang === 'es'
          ? "Has alcanzado el límite de 30 mensajes del plan gratuito. ¡Sé Founder para mensajes ilimitados!"
          : "You've reached the 30 message limit. Become Founder for unlimited messages!";
      case "project_limit":
        return lang === 'pt'
          ? "O plano Scout permite apenas 1 projeto. Seja Founder para projetos ilimitados!"
          : lang === 'es'
          ? "El plan Scout permite solo 1 proyecto. ¡Sé Founder para proyectos ilimitados!"
          : "Scout plan allows only 1 project. Become Founder for unlimited projects!";
      case "view_likes":
      case "profile_viewers":
        return lang === 'pt'
          ? "Veja quem visitou seu perfil e conecte-se estrategicamente."
          : lang === 'es'
          ? "Ve quién visitó tu perfil y conéctate estratégicamente."
          : "See who visited your profile and connect strategically.";
      default:
        return lang === 'pt'
          ? "Desbloqueie recursos avançados para acelerar sua jornada."
          : lang === 'es'
          ? "Desbloquea recursos avanzados para acelerar tu jornada."
          : "Unlock advanced features to accelerate your journey.";
    }
  };

  const founderBenefits = [
    lang === 'pt' ? "Matches Ilimitados" : lang === 'es' ? "Matches Ilimitados" : "Unlimited Matches",
    lang === 'pt' ? "Mensagens Ilimitadas" : lang === 'es' ? "Mensajes Ilimitados" : "Unlimited Messages",
    lang === 'pt' ? "Projetos Ilimitados" : lang === 'es' ? "Proyectos Ilimitados" : "Unlimited Projects",
    lang === 'pt' ? "Ver quem viu seu perfil" : lang === 'es' ? "Ver quién vio tu perfil" : "See profile viewers",
    lang === 'pt' ? "Badge Verificado" : lang === 'es' ? "Badge Verificado" : "Verified Badge",
    lang === 'pt' ? "Destaque no grid" : lang === 'es' ? "Destacado en grid" : "Highlighted in grid",
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-6 h-6 text-primary" />
              {getReasonTitle()}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {getReasonDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-muted-foreground">
              {getReasonDescription()}
            </p>

            {/* Founder Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-0.5 rounded-full font-semibold">
                {lang === 'pt' ? 'Recomendado' : lang === 'es' ? 'Recomendado' : 'Recommended'}
              </div>
              
              <div className="flex items-center gap-2 mb-3 justify-center">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">Founder</span>
              </div>
              
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">R$ 899,90</span>
                <span className="text-muted-foreground text-sm ml-1">
                  /{lang === 'pt' ? 'semestre' : lang === 'es' ? 'semestre' : '6 mo'}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'pt' ? '≈ R$150/mês' : lang === 'es' ? '≈ R$150/mes' : '≈ $30/month'}
                </p>
              </div>

              <ul className="space-y-2 mb-4">
                {founderBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
              >
                {lang === 'pt' ? 'Assinar com Pix' : lang === 'es' ? 'Suscribir con Pix' : 'Subscribe with Pix'}
              </Button>
            </div>

            {/* Social Payment Option */}
            <div className="text-center">
              <button
                onClick={handleSocialPayment}
                className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Gift className="w-4 h-4" />
                {lang === 'pt' 
                  ? 'Ou ganhe 6 meses grátis divulgando a Guilda' 
                  : lang === 'es'
                  ? 'O gana 6 meses gratis compartiendo Guilda'
                  : 'Or get 6 months free by sharing Guilda'}
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PixPaymentModal
        open={pixModalOpen}
        onOpenChange={setPixModalOpen}
        productType="founder_pass"
      />

      <SocialPaymentDialog
        open={socialDialogOpen}
        onOpenChange={setSocialDialogOpen}
      />
    </>
  );
};
