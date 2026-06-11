import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Rocket, Users, MessageCircle, PenLine } from 'lucide-react';

interface SignupSurveyDialogProps {
  open: boolean;
  onSubmit: (source: string, otherText?: string) => Promise<void>;
}

const SURVEY_OPTIONS = [
  { value: 'google', icon: Search, labelKey: 'google', hintKey: undefined },
  { value: 'social_media', icon: Smartphone, labelKey: 'socialMedia', hintKey: 'socialMediaHint' },
  { value: 'acceleration', icon: Rocket, labelKey: 'acceleration', hintKey: 'accelerationHint' },
  { value: 'friends', icon: Users, labelKey: 'friends', hintKey: 'friendsHint' },
  { value: 'whatsapp', icon: MessageCircle, labelKey: 'whatsapp', hintKey: 'whatsappHint' },
  { value: 'other', icon: PenLine, labelKey: 'other', hintKey: undefined },
];

export function SignupSurveyDialog({ open, onSubmit }: SignupSurveyDialogProps) {
  const { t } = useTranslation();
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOtherSelected = selectedSource === 'other';
  const canSubmit = selectedSource && (!isOtherSelected || otherText.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedSource, isOtherSelected ? otherText.trim() : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{t('signupSurvey.title')}</DialogTitle>
          <DialogDescription>{t('signupSurvey.description')}</DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedSource}
          onValueChange={setSelectedSource}
          className="mt-4 space-y-3"
        >
          {SURVEY_OPTIONS.map(({ value, icon: Icon, labelKey, hintKey }) => (
            <div key={value} className="flex items-start space-x-3">
              <RadioGroupItem value={value} id={value} className="mt-1" />
              <Label htmlFor={value} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{t(`signupSurvey.${labelKey}`)}</span>
                </div>
                {hintKey && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t(`signupSurvey.${hintKey}`)}
                  </p>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {isOtherSelected && (
          <Input
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder={t('signupSurvey.otherPlaceholder')}
            className="mt-3"
            autoFocus
          />
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full mt-4"
        >
          {isSubmitting ? '...' : t('signupSurvey.submit')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
