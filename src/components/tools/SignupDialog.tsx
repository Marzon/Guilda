import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Download, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: 'save' | 'export' | 'pdf';
  toolName: string;
  calculationData?: Record<string, unknown>;
}

const SignupDialog = ({ open, onOpenChange, feature, toolName }: SignupDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignup = () => {
    trackEvent('soft_gate_signup_click', 'tools', `${toolName}_${feature}`);
    navigate('/auth?view=signup');
  };

  const handleLogin = () => {
    trackEvent('soft_gate_login_click', 'tools', `${toolName}_${feature}`);
    navigate('/auth');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const FeatureIcon = feature === 'pdf' || feature === 'export' ? Download : Save;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {t('tools.signupDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('tools.signupDialog.chooseOption')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            className="w-full justify-start h-auto py-4"
            onClick={handleSignup}
          >
            <FeatureIcon className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">{t('tools.signupDialog.signupOption')}</p>
              <p className="text-sm text-primary-foreground/80">{t('tools.signupDialog.signupOptionDesc')}</p>
            </div>
          </Button>
        </div>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <span>{t('tools.signupDialog.benefit1')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <span>{t('tools.signupDialog.benefit2')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <span>{t('tools.signupDialog.benefit3')}</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('tools.signupDialog.hasAccount')}{' '}
          <button
            onClick={handleLogin}
            className="text-primary hover:underline font-medium"
          >
            {t('tools.signupDialog.login')}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;
