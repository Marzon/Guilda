import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { CheckCircle2, Camera, Upload, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface IdentitySubStepProps {
  username: string;
  setUsername: (value: string) => void;
  usernameError?: string;
  avatarUrl: string | null;
  setAvatarFile: (value: File | null) => void;
  onContinue: () => void;
}

export const IdentitySubStep = ({
  username,
  setUsername,
  usernameError,
  avatarUrl,
  setAvatarFile,
  onContinue,
}: IdentitySubStepProps) => {
  const { t } = useLanguage();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl);

  // Sanitize username input
  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('onboarding.imageTooLarge'));
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isUsernameValid = username.length >= 3 && !usernameError;
  const canContinue = isUsernameValid;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
          {t('onboarding.identityTitle', 'Sua Identidade')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.identitySubtitle', 'Como você quer ser conhecido?')}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Avatar Upload - Centralizado e maior */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar preview" 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-accent/50 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/30">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors shadow-md">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-xs text-muted-foreground">{t('onboarding.optional', 'Opcional')}</span>
        </div>

        {/* Username - Maior e mais proeminente */}
        <div className="w-full max-w-sm">
          <Label htmlFor="username" className="text-sm font-medium">
            {t('onboarding.username')} <span className="text-destructive">*</span>
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder={t('onboarding.usernamePlaceholder')}
              className={cn(
                "pr-10 h-12 text-base",
                usernameError && "border-destructive focus-visible:ring-destructive"
              )}
              maxLength={20}
            />
            {isUsernameValid && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {usernameError && (
            <p className="text-xs text-destructive mt-1.5">{usernameError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">{username.length}/20</p>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full max-w-sm h-11 mt-2"
        >
          {t('onboarding.continue', 'Continuar')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
