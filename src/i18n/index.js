import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import arTranslation from './locales/ar.json';
import enTranslation from './locales/en.json';
import frTranslation from './locales/fr.json';

const resources = {
  ar: {
    translation: arTranslation,
  },
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Force Arabic as default
    fallbackLng: 'ar',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Force Arabic language on initialization
if (!localStorage.getItem('i18nextLng') || localStorage.getItem('i18nextLng') !== 'ar') {
  localStorage.setItem('i18nextLng', 'ar');
  i18n.changeLanguage('ar');
}

export default i18n;
