import React from 'react';
import {
  unstable_createMuiStrictModeTheme as createMuiTheme,
  ThemeProvider,
} from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const MaterialTheme = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#5BD1F6',
        main: '#3ac5f1',
        dark: '#41B7DC',
        contrastText: '#fff',
      },
    },
    direction: i18n.dir(),
    typography: {
      fontFamily:
        i18n.dir() === 'ltr'
          ? '"Inter", Arial, Helvetica, sans-serif'
          : '"Tajawal", Arial, Helvetica, sans-serif',
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
  });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MaterialTheme;
