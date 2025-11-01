import React, { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface MaterialThemeProps {
  children: React.ReactNode;
}

/**
 * Material-UI theme provider with support for RTL/LTR direction
 * and language-specific font families
 */
const MaterialTheme: React.FC<MaterialThemeProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const direction = i18n.dir();
  const isRtl = direction === 'rtl';

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            light: '#5BD1F6',
            main: '#3ac5f1',
            dark: '#41B7DC',
            contrastText: '#fff',
          },
        },
        direction,
        typography: {
          fontFamily: isRtl
            ? '"Tajawal", Arial, Helvetica, sans-serif'
            : '"Inter", Arial, Helvetica, sans-serif',
          button: {
            textTransform: 'none',
            fontSize: 14,
          },
          body1: {
            fontSize: '1.4rem',
          },
          body2: {
            fontSize: '1rem',
          },
        },
      }),
    [direction, isRtl],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MaterialTheme;
