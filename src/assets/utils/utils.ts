/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'react-i18next';

export const rtlClass = () => {
  const { i18n } = useTranslation();
  return i18n.dir() === 'rtl' ? 'rtl' : '';
};

export const tabsProps = (index: number) => ({
  id: `full-width-tab-${index}`,
  'aria-controls': `full-width-tabpanel-${index}`,
});

const loadingDiv = document.getElementById('tyro-page-loader');
const loadingText = document.getElementById('tyro-page-loader-text');

export const showSpinner = (spinnerText = 'Loading...') => {
  if (!loadingDiv || !loadingText) return;
  loadingDiv.style.visibility = 'visible';
  loadingText.innerText = spinnerText;
};

export const hideSpinner = () => {
  if (!loadingDiv || !loadingText) return;
  loadingDiv.style.visibility = 'hidden';
  loadingText.innerText = '';
};
