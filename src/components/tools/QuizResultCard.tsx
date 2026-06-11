import { useTranslation } from 'react-i18next';
import { Linkedin, Twitter, Share2, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

interface QuizResultCardProps {
  archetype: 'BUILDER' | 'SELLER';
  builderScore: number;
  sellerScore: number;
  percentage: number;
}

const QuizResultCard = ({ archetype, builderScore, sellerScore, percentage }: QuizResultCardProps) => {
  const { t } = useTranslation();
  const isBuilder = archetype === 'BUILDER';
  const quizUrl = 'https://guilda.app.br/tools/archetype-quiz';

  const getShareText = () => {
    return t('tools.quizShare.viralText', { 
      percentage, 
      archetype: t(`quiz.result.${archetype}.title`) 
    });
  };

  const handleShare = async (platform: 'linkedin' | 'twitter' | 'whatsapp' | 'native' | 'copy') => {
    const shareText = getShareText();
    
    trackEvent('quiz_result_share', 'tools', `${platform}_${archetype}`, percentage);

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: t('tools.quizShare.shareTitle'),
          text: shareText,
          url: quizUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
      }
    }

    const fullText = `${shareText}\n\n${quizUrl}`;

    switch (platform) {
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(quizUrl)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(quizUrl)}`,
          '_blank'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(fullText)}`,
          '_blank'
        );
        break;
      case 'copy':
      default:
        navigator.clipboard.writeText(fullText);
        toast.success(t('tools.quizShare.copiedToClipboard'));
        break;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-8 ${
      isBuilder 
        ? 'bg-gradient-to-br from-primary/30 via-primary/10 to-background border border-primary/30' 
        : 'bg-gradient-to-br from-amber-500/30 via-amber-500/10 to-background border border-amber-500/30'
    }`}>
      {/* Glow effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
        isBuilder ? 'bg-primary/30' : 'bg-amber-500/30'
      }`} />
      
      {/* Badge Icon */}
      <div className={`w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl ${
        isBuilder 
          ? 'bg-gradient-to-br from-primary to-primary/70 ring-4 ring-primary/30' 
          : 'bg-gradient-to-br from-amber-500 to-amber-600 ring-4 ring-amber-500/30'
      }`}>
        <span className="text-5xl">{isBuilder ? '⚒️' : '🎯'}</span>
      </div>

      {/* Main Result */}
      <div className="text-center mb-6">
        <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
          {t('tools.quizShare.iAm')}
        </p>
        <h2 className={`text-5xl font-extrabold mb-2 ${
          isBuilder ? 'text-primary' : 'text-amber-500'
        }`}>
          {percentage}% {archetype}
        </h2>
        <p className="text-muted-foreground">
          {t(`quiz.result.${archetype}.headline`)}
        </p>
      </div>

      {/* Comparison Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className={`font-medium ${isBuilder ? 'text-primary' : 'text-muted-foreground'}`}>
            Builder ({builderScore})
          </span>
          <span className={`font-medium ${!isBuilder ? 'text-amber-500' : 'text-muted-foreground'}`}>
            Seller ({sellerScore})
          </span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          <div 
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${(builderScore / 10) * 100}%` }}
          />
          <div 
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${(sellerScore / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground mb-3">
          {t('tools.quizShare.shareYourResult')}
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 text-[#0A66C2]"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="bg-foreground/5 border-foreground/20 hover:bg-foreground/10"
          >
            <Twitter className="w-4 h-4 mr-2" />
            X
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('whatsapp')}
            className="bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366]"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        <div className="flex justify-center gap-2">
          {navigator.share && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare('native')}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('tools.quizShare.shareNative')}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('copy')}
          >
            <Copy className="w-4 h-4 mr-2" />
            {t('tools.quizShare.copyLink')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultCard;
