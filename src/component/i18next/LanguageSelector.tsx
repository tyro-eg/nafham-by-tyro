import React from 'react';
import { Button, Box } from '@mui/material';

import './i18n';
import { useTranslation } from 'react-i18next';
/**
 * This function Change language  its display language switch button and change the selected language
 * @component
 * @see https://medium.com/@ricklee_10931/react-multi-lingual-with-react-i18next-57879f986168
 */
function LanguageSelector() {
  const { i18n } = useTranslation();
  const directionEle = document.getElementById('direction');

  /**
   * This function return language selected ar or en
   *  i18n.changeLanguage function to switch between languages
   * @param {string} lng  language selected 'ar' , 'en'
   * @return {string} 'en' or 'ar'
   */
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    directionEle!.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div>
      <Box
        component="div"
        display={i18n.language === 'ar' ? 'none' : 'inherit'}
      >
        <Button
          color="inherit"
          onClick={() => changeLanguage('ar')}
          style={{ fontSize: '14px' }}
        >
          العربية
        </Button>
      </Box>
      <Box
        component="div"
        display={i18n.language === 'en' ? 'none' : 'inherit'}
      >
        <Button
          color="inherit"
          onClick={() => changeLanguage('en')}
          style={{ fontSize: '14px' }}
        >
          English
        </Button>
      </Box>
    </div>
  );
}

export default LanguageSelector;
