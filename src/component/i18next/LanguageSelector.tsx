import { useEffect } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import './i18n';

/**
 * Language selector component that switches between English and Arabic
 * Automatically updates document direction when language changes
 * @component
 */
function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Update document direction when language changes
  useEffect(() => {
    const directionEle = document.getElementById('direction');
    if (directionEle) {
      directionEle.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [currentLanguage]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Show Arabic button when current language is not Arabic
  if (currentLanguage !== 'ar') {
    return (
      <Button
        color="inherit"
        onClick={() => changeLanguage('ar')}
        sx={{ fontSize: '14px' }}
      >
        العربية
      </Button>
    );
  }

  // Show English button when current language is Arabic
  return (
    <Button
      color="inherit"
      onClick={() => changeLanguage('en')}
      sx={{ fontSize: '14px' }}
    >
      English
    </Button>
  );
}

export default LanguageSelector;
