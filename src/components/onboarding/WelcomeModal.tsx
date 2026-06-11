import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Hammer, TrendingUp, DollarSign, Sparkles, Map, HelpCircle } from "lucide-react";
import type { Archetype } from "@/types/archetype";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  archetype: Archetype;
}

export const WelcomeModal = ({ open, onClose, archetype }: WelcomeModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const isBuilder = archetype === "BUILDER";
  const isInvestor = archetype === "INVESTOR";
  const isStarter = archetype === "STARTER";

  const getIcon = () => {
    if (isBuilder) return <Hammer className="w-10 h-10 text-primary" />;
    if (isInvestor) return <DollarSign className="w-10 h-10 text-emerald-500" />;
    if (isStarter) return <Sparkles className="w-10 h-10 text-purple-500" />;
    return <TrendingUp className="w-10 h-10 text-accent" />;
  };

  const getBgClass = () => {
    if (isBuilder) return 'bg-primary/20';
    if (isInvestor) return 'bg-emerald-500/20';
    if (isStarter) return 'bg-purple-500/20';
    return 'bg-accent/20';
  };

  const getTitle = () => {
    if (isBuilder) return t('welcome.builderTitle');
    if (isInvestor) return t('welcome.investorTitle');
    if (isStarter) return t('welcome.starterTitle', 'Bem-vindo, Starter! 🌱');
    return t('welcome.sellerTitle');
  };

  const getMessage = () => {
    if (isBuilder) return t('welcome.builderMessage');
    if (isInvestor) return t('welcome.investorMessage');
    if (isStarter) return t('welcome.starterMessage', 'Você deu o primeiro passo! Explore a comunidade, aprenda e encontre sua primeira oportunidade.');
    return t('welcome.sellerMessage');
  };

  const getFeatures = (): string[] => {
    if (isBuilder) {
      return [
        t('welcome.builderFeature1'),
        t('welcome.builderFeature2'),
        t('welcome.builderFeature3'),
      ];
    }
    if (isInvestor) {
      return [
        t('welcome.investorFeature1'),
        t('welcome.investorFeature2'),
        t('welcome.investorFeature3'),
      ];
    }
    if (isStarter) {
      return [
        t('welcome.starterFeature1', 'Observe e aprenda com founders experientes'),
        t('welcome.starterFeature2', 'Conecte-se para encontrar mentores'),
        t('welcome.starterFeature3', 'Desenvolva suas habilidades'),
      ];
    }
    return [
      t('welcome.sellerFeature1'),
      t('welcome.sellerFeature2'),
      t('welcome.sellerFeature3'),
    ];
  };

  const handleTour = () => {
    onClose();
    // Tour will auto-start when they visit tavern as new user
    navigate('/tavern');
  };

  const handleFaq = () => {
    onClose();
    // Navigate to FAQ with archetype section
    if (isBuilder) {
      navigate('/faq?section=builders');
    } else if (isInvestor) {
      navigate('/faq?section=investidores');
    } else if (isStarter) {
      navigate('/faq?section=starters');
    } else {
      navigate('/faq?section=sellers');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${getBgClass()}`}>
              {getIcon()}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>
        
        {/* Features list */}
        <div className="space-y-2 mt-2">
          {getFeatures().map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary">•</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={handleTour}
            className="flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            {t('welcome.startTour')}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFaq}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            {t('welcome.readFaq')}
          </Button>
        </div>

        <Button onClick={onClose} className="w-full mt-2">
          {t('welcome.explore')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
