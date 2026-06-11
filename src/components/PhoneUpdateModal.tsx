import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Phone, Loader2 } from 'lucide-react';

interface PhoneUpdateModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

export function PhoneUpdateModal({ isOpen, userId, onComplete }: PhoneUpdateModalProps) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [e164, setE164] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string, valid: boolean, e164Value?: string) => {
    setPhone(value);
    setIsValid(valid);
    setE164(e164Value);
  };

  const handleSubmit = async () => {
    if (!isValid || !e164) {
      toast.error(t('phone.invalid'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: e164 })
        .eq('id', userId);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          toast.error(t('phone.alreadyInUse'));
        } else {
          console.error('Error updating phone:', error);
          toast.error(t('common.error'));
        }
        return;
      }

      toast.success(t('phone.saved'));
      onComplete();
    } catch (err) {
      console.error('Failed to save phone:', err);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {t('phone.updateTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('phone.updateDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PhoneInput
            value={phone}
            onChange={handlePhoneChange}
            required
            label={t('phone.label')}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            t('phone.confirm')
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
