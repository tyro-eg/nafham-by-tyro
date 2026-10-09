import React, { useMemo } from 'react';
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface MaterialThemeProps {
  children: React.ReactNode;
}

// Keep in sync with src/assets/styles/variables.scss
const tokens = {
  brand400: '#3ac5f1',
  brand500: '#12a9dd',
  brand600: '#0a8bc0',
  brand700: '#0b6f99',
  brand50: '#eef9fe',
  navy900: '#0f1b2d',
  navy800: '#1a2b42',
  navy700: '#2a3d57',
  gray50: '#f6f9fc',
  gray100: '#eef2f7',
  gray200: '#e3e9f0',
  gray300: '#cfd8e3',
  gray400: '#9aa8b8',
  gray500: '#6b7a8d',
  gray600: '#4a5a6e',
  accent400: '#ffc94a',
  accent500: '#f5b301',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
};

const shadowSm =
  '0 1px 3px rgba(15, 27, 45, 0.08), 0 1px 2px rgba(15, 27, 45, 0.04)';
const shadowLg = '0 12px 32px rgba(15, 27, 45, 0.12)';
const focusRing = `0 0 0 3px ${alpha(tokens.brand500, 0.35)}`;

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
        direction,
        palette: {
          primary: {
            light: tokens.brand400,
            main: tokens.brand600,
            dark: tokens.brand700,
            contrastText: '#fff',
          },
          secondary: {
            light: tokens.navy700,
            main: tokens.navy800,
            dark: tokens.navy900,
            contrastText: '#fff',
          },
          warning: { main: tokens.accent500, contrastText: tokens.navy900 },
          success: { main: tokens.success },
          error: { main: tokens.danger },
          text: {
            primary: tokens.navy900,
            secondary: tokens.gray600,
            disabled: tokens.gray400,
          },
          divider: tokens.gray200,
          background: { default: '#fff', paper: '#fff' },
          action: { hover: alpha(tokens.navy900, 0.04) },
        },
        shape: { borderRadius: 8 },
        typography: {
          // html font-size is 62.5% (1rem = 10px)
          htmlFontSize: 10,
          fontFamily: isRtl
            ? '"Tajawal", Arial, Helvetica, sans-serif'
            : '"Inter", Arial, Helvetica, sans-serif',
          fontSize: 15,
          button: {
            textTransform: 'none',
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: 0,
          },
          body1: { fontSize: '1.6rem', lineHeight: 1.6 },
          body2: { fontSize: '1.4rem', lineHeight: 1.6 },
          caption: { fontSize: '1.2rem' },
          h1: { fontSize: '4.4rem', fontWeight: 700 },
          h2: { fontSize: '3.6rem', fontWeight: 700 },
          h3: { fontSize: '2.4rem', fontWeight: 700 },
          h4: { fontSize: '2rem', fontWeight: 700 },
          h5: { fontSize: '1.8rem', fontWeight: 600 },
          h6: { fontSize: '1.6rem', fontWeight: 600 },
        },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '0.9rem 2rem',
                minHeight: '4.2rem',
                transition:
                  'background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
                '&.Mui-focusVisible': { boxShadow: focusRing },
              },
              sizeSmall: {
                padding: '0.5rem 1.4rem',
                minHeight: '3.4rem',
                fontSize: '1.4rem',
              },
              sizeLarge: {
                padding: '1.2rem 2.8rem',
                minHeight: '5rem',
                fontSize: '1.6rem',
              },
              outlined: {
                borderColor: tokens.gray300,
                color: tokens.navy900,
                '&:hover': {
                  borderColor: tokens.gray400,
                  backgroundColor: tokens.gray50,
                },
              },
              outlinedPrimary: {
                borderColor: alpha(tokens.brand600, 0.5),
                color: tokens.brand700,
                '&:hover': {
                  borderColor: tokens.brand600,
                  backgroundColor: tokens.brand50,
                },
              },
              text: { '&:hover': { backgroundColor: tokens.brand50 } },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: { '&.Mui-focusVisible': { boxShadow: focusRing } },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                backgroundColor: '#fff',
                fontSize: '1.5rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: tokens.gray300,
                  transition: 'border-color 180ms ease',
                },
                '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline':
                  { borderColor: tokens.gray400 },
                '&.Mui-focused:not(.Mui-error)': { boxShadow: focusRing },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: tokens.brand500,
                  borderWidth: 1,
                },
              },
              input: { padding: '1.15rem 1.4rem' },
              inputSizeSmall: { padding: '0.85rem 1.2rem' },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                fontSize: '1.5rem',
                color: tokens.gray500,
                '&.Mui-focused': { color: tokens.brand700 },
              },
            },
          },
          MuiFormHelperText: {
            styleOverrides: { root: { fontSize: '1.25rem', marginTop: 4 } },
          },
          MuiFormLabel: {
            styleOverrides: { root: { fontSize: '1.4rem' } },
          },
          MuiSelect: {
            styleOverrides: { icon: { color: tokens.gray500 } },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: 10,
                border: `1px solid ${tokens.gray200}`,
                boxShadow: shadowLg,
                marginTop: 4,
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontSize: '1.4rem',
                minHeight: '4rem',
                borderRadius: 6,
                margin: '0 0.6rem',
                '&.Mui-selected': {
                  backgroundColor: tokens.brand50,
                  color: tokens.brand700,
                  fontWeight: 600,
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
                boxShadow: '0 24px 64px rgba(15, 27, 45, 0.24)',
                '@media (max-width: 600px)': {
                  margin: 16,
                  width: 'calc(100% - 32px)',
                  maxHeight: 'calc(100% - 32px)',
                },
              },
            },
          },
          MuiBackdrop: {
            styleOverrides: {
              root: {
                '&:not(.MuiBackdrop-invisible)': {
                  backgroundColor: alpha(tokens.navy900, 0.55),
                  backdropFilter: 'blur(2px)',
                },
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                fontSize: '2rem',
                fontWeight: 700,
                color: tokens.navy900,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              rounded: { borderRadius: 12 },
              elevation1: { boxShadow: shadowSm },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                border: `1px solid ${tokens.gray200}`,
                boxShadow: shadowSm,
              },
            },
          },
          MuiAppBar: {
            defaultProps: { elevation: 0, color: 'inherit' },
            styleOverrides: {
              root: {
                backgroundColor: alpha('#fff', 0.92),
                backdropFilter: 'saturate(180%) blur(12px)',
                borderBottom: `1px solid ${tokens.gray200}`,
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              indicator: { height: 3, borderRadius: 3 },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: tokens.gray500,
                minHeight: '4.8rem',
                '&.Mui-selected': { color: tokens.brand700 },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontSize: '1.3rem', fontWeight: 500, borderRadius: 999 },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: tokens.navy900,
                fontSize: '1.2rem',
                borderRadius: 6,
                padding: '0.6rem 1rem',
              },
              arrow: { color: tokens.navy900 },
            },
          },
          MuiCheckbox: {
            styleOverrides: { root: { color: tokens.gray400 } },
          },
          MuiRadio: {
            styleOverrides: { root: { color: tokens.gray400 } },
          },
          MuiStepIcon: {
            styleOverrides: { text: { fontSize: '1.2rem', fontWeight: 700 } },
          },
          MuiStepLabel: {
            styleOverrides: { label: { fontSize: '1.4rem' } },
          },
          MuiPaginationItem: {
            styleOverrides: { root: { fontSize: '1.4rem', borderRadius: 8 } },
          },
          MuiAlert: {
            styleOverrides: {
              root: { fontSize: '1.4rem', borderRadius: 10 },
            },
          },
          MuiDivider: {
            styleOverrides: { root: { borderColor: tokens.gray200 } },
          },
        },
      }),
    [direction, isRtl],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MaterialTheme;
