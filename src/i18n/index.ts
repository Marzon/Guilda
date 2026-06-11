import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

// Auto-detect language based on browser, timezone, and saved preference
const detectLanguage = (): string => {
  // 1. Check saved preference
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) return savedLanguage;

  // 2. Detect by timezone (América do Sul = pt/es, América do Norte/Europa = en)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Sao_Paulo') || timezone.includes('Brazil') || timezone.includes('Buenos_Aires') || timezone.includes('Santiago')) {
    return 'pt';
  }
  if (timezone.includes('Mexico') || timezone.includes('Lima') || timezone.includes('Bogota')) {
    return 'es';
  }

  // 3. Fallback to browser language
  const browserLanguage = navigator.language.split('-')[0];
  if (['en', 'pt', 'es'].includes(browserLanguage)) {
    return browserLanguage;
  }

  // 4. Default fallback
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es }
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
