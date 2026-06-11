import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Rocket, Users, MessageCircle, PenLine } from 'lucide-react';

interface SignupSourceStepProps {
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  otherText: string;
  setOtherText: (text: string) => void;
}

const SURVEY_OPTIONS = [
  { value: 'google', icon: Search, labelKey: 'google', hintKey: undefined },
  { value: 'social_media', icon: Smartphone, labelKey: 'socialMedia', hintKey: 'socialMediaHint' },
  { value: 'acceleration', icon: Rocket, labelKey: 'acceleration', hintKey: 'accelerationHint' },
  { value: 'friends', icon: Users, labelKey: 'friends', hintKey: 'friendsHint' },
  { value: 'whatsapp', icon: MessageCircle, labelKey: 'whatsapp', hintKey: 'whatsappHint' },
  { value: 'other', icon: PenLine, labelKey: 'other', hintKey: undefined },
];

export function SignupSourceStep({ 
  selectedSource, 
  setSelectedSource, 
  otherText, 
  setOtherText 
}: SignupSourceStepProps) {
  const { t } = useTranslation();
  const isOtherSelected = selectedSource === 'other';

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{t('signupSurvey.title')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground">{t('signupSurvey.description')}</p>
      </div>

      {/* Mobile: 2x3 Grid layout */}
      <RadioGroup
        value={selectedSource}
        onValueChange={setSelectedSource}
        className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-3 sm:block"
      >
        {SURVEY_OPTIONS.map(({ value, icon: Icon, labelKey, hintKey }) => (
          <div 
            key={value} 
            className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border transition-all cursor-pointer text-center sm:text-left ${
              selectedSource === value 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedSource(value)}
          >
            <RadioGroupItem value={value} id={value} className="hidden sm:block mt-0.5 sm:mt-1" />
            <div className="flex flex-col sm:flex-1 items-center sm:items-start">
              <div className={`w-10 h-10 sm:w-auto sm:h-auto rounded-lg sm:rounded-none flex items-center justify-center mb-1 sm:mb-0 ${
                selectedSource === value ? 'bg-primary text-primary-foreground' : 'bg-muted'
              } sm:bg-transparent sm:text-primary`}>
                <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
              </div>
              <Label htmlFor={value} className="cursor-pointer">
                <span className="font-medium text-xs sm:text-base">{t(`signupSurvey.${labelKey}`)}</span>
              </Label>
              {hintKey && (
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                  {t(`signupSurvey.${hintKey}`)}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      {isOtherSelected && (
        <Input
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          placeholder={t('signupSurvey.otherPlaceholder')}
          className="mt-2 sm:mt-3"
          autoFocus
        />
      )}
    </div>
  );
}
