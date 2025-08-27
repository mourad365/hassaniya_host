import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLanguage);
  }, [currentLanguage, isRTL]);

  return {
    t,
    changeLanguage,
    currentLanguage,
    isArabic: currentLanguage === 'ar',
    isFrench: currentLanguage === 'fr',
    isRTL
  };
};
