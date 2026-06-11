import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export type Language = 'en' | 'pt' | 'es';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}

export const availableLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = async (langCode: Language) => {
    try {
      await i18n.changeLanguage(langCode);
      localStorage.setItem('language', langCode);
      
      const selectedLang = availableLanguages.find(lang => lang.code === langCode);
      toast.success(t('settings.languageUpdated', { 
        language: selectedLang?.nativeName || langCode 
      }));
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error('Failed to change language');
    }
  };

  const getLanguageName = (code: Language): string => {
    return availableLanguages.find(lang => lang.code === code)?.name || code;
  };

  const getCurrentLanguageOption = (): LanguageOption | undefined => {
    return availableLanguages.find(lang => lang.code === currentLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    getLanguageName,
    getCurrentLanguageOption,
    t,
  };
};
