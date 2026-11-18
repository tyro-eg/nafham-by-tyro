import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

const availableLanguages = ['en', 'ar'];

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    // No fixed `lng`: it overrode the saved choice, so Arabic fell back to
    // English on every page load. The choice is kept in localStorage; a first
    // visit is English, as before (the browser's language is not used).
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    resources,
    initImmediate: true,
    fallbackLng: 'en', // Fallback language
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: availableLanguages,

    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true, // If you use Suspense for lazy loading translations
    },
  });

export default i18n;
