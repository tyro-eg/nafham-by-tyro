import { useTranslation } from 'react-i18next';

/**
 * Custom hook to determine if the current language direction is RTL
 * @returns 'rtl' if the current language is RTL, empty string otherwise
 */
export const useRtlClass = () => {
  const { i18n } = useTranslation();
  return i18n.dir() === 'rtl' ? 'rtl' : '';
};

/**
 * @deprecated Use useRtlClass() instead. This function violates React hooks rules.
 */
export const rtlClass = useRtlClass;

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

export const getNameInitials = (name: string): string => {
  return name
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
};
