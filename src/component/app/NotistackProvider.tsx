import React from 'react';
import { SnackbarProvider } from 'notistack';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { SnackbarUtilsConfigurator } from '../../assets/utils/toaster';

const NotistackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notistackRef = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: string | number) => () => {
    if (notistackRef.current) {
      notistackRef.current.closeSnackbar(key);
    }
  };

  return (
    <SnackbarProvider
      ref={notistackRef}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      preventDuplicate
      action={(key) => (
        <IconButton onClick={onClickDismiss(key)} aria-label="close">
          <Close />
        </IconButton>
      )}
    >
      <SnackbarUtilsConfigurator />
      {children}
    </SnackbarProvider>
  );
};

export default NotistackProvider;
