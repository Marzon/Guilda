import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Users, Rocket, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

type CTAContext = 
  | { type: 'quiz-result'; archetype: 'BUILDER' | 'SELLER' }
  | { type: 'equity-calculated' }
  | { type: 'runway-calculated'; months: number }
  | { type: 'valuation-calculated'; value: number }
  | { type: 'captable-calculated' };

interface SmartCTAProps {
  context: CTAContext;
}

const SmartCTA = ({ context }: SmartCTAProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getCTAContent = () => {
    switch (context.type) {
      case 'quiz-result':
        if (context.archetype === 'SELLER') {
          return {
            icon: Rocket,
            titleKey: 'tools.smartCta.sellerNeedsBuilder.title',
            descKey: 'tools.smartCta.sellerNeedsBuilder.description',
            color: 'primary',
          };
        }
        return {
          icon: TrendingUp,
          titleKey: 'tools.smartCta.builderNeedsSeller.title',
          descKey: 'tools.smartCta.builderNeedsSeller.description',
          color: 'amber-500',
        };
      
      case 'equity-calculated':
        return {
          icon: Users,
          titleKey: 'tools.smartCta.needPartnerForEquity.title',
          descKey: 'tools.smartCta.needPartnerForEquity.description',
          color: 'primary',
        };
      
      case 'runway-calculated':
        if (context.months < 6) {
          return {
            icon: Rocket,
            titleKey: 'tools.smartCta.lowRunway.title',
            descKey: 'tools.smartCta.lowRunway.description',
            color: 'amber-500',
          };
        }
        return {
          icon: Users,
          titleKey: 'tools.smartCta.healthyRunway.title',
          descKey: 'tools.smartCta.healthyRunway.description',
          color: 'primary',
        };
      
      case 'valuation-calculated':
        if (context.value >= 1000000) {
          return {
            icon: TrendingUp,
            titleKey: 'tools.smartCta.highValuation.title',
            descKey: 'tools.smartCta.highValuation.description',
            color: 'primary',
          };
        }
        return {
          icon: Rocket,
          titleKey: 'tools.smartCta.growValuation.title',
          descKey: 'tools.smartCta.growValuation.description',
          color: 'amber-500',
        };
      
      case 'captable-calculated':
        return {
          icon: Users,
          titleKey: 'tools.smartCta.needFounders.title',
          descKey: 'tools.smartCta.needFounders.description',
          color: 'primary',
        };
      
      default:
        return {
          icon: Lightbulb,
          titleKey: 'tools.smartCta.generic.title',
          descKey: 'tools.smartCta.generic.description',
          color: 'primary',
        };
    }
  };

  const handleClick = () => {
    trackEvent('smart_cta_click', 'tools', context.type);
    navigate('/auth?view=signup');
  };

  const content = getCTAContent();
  const Icon = content.icon;
  const colorClass = content.color === 'amber-500' ? 'border-l-amber-500' : 'border-l-primary';
  const bgClass = content.color === 'amber-500' ? 'bg-amber-500/5' : 'bg-primary/5';
  const iconColor = content.color === 'amber-500' ? 'text-amber-500' : 'text-primary';

  return (
    <Card className={`${colorClass} ${bgClass} border-l-4 mt-6`}>
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className="font-medium">{t(content.titleKey)}</p>
            <p className="text-sm text-muted-foreground">{t(content.descKey)}</p>
          </div>
        </div>
        <Button onClick={handleClick} className="w-full sm:w-auto flex-shrink-0">
          {t('tools.smartCta.findPartner')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmartCTA;
