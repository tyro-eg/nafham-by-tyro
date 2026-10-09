import { useEffect } from 'react';
import { Button } from '@mui/material';
import { Language } from '@mui/icons-material';
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

  // Quiet text button with a globe icon (used in the site header)
  const buttonSx = {
    minHeight: '4.4rem',
    px: 1.5,
    fontSize: '1.4rem',
    fontWeight: 500,
    color: '#4a5a6e',
    whiteSpace: 'nowrap',
    '& .MuiButton-startIcon': { color: '#6b7a8d' },
    '&:hover': { color: '#0f1b2d', backgroundColor: '#f6f9fc' },
  };

  // Show Arabic button when current language is not Arabic
  if (currentLanguage !== 'ar') {
    return (
      <Button
        color="inherit"
        className="language-selector"
        startIcon={<Language />}
        onClick={() => changeLanguage('ar')}
        sx={buttonSx}
        lang="ar"
      >
        العربية
      </Button>
    );
  }

  // Show English button when current language is Arabic
  return (
    <Button
      color="inherit"
      className="language-selector"
      startIcon={<Language />}
      onClick={() => changeLanguage('en')}
      sx={buttonSx}
      lang="en"
    >
      English
    </Button>
  );
}

export default LanguageSelector;
