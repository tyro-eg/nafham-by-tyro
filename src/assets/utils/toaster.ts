import {
  useSnackbar,
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
} from 'notistack';

let useSnackbarRef: {
  enqueueSnackbar: (
    msg: SnackbarMessage,
    options?: OptionsObject,
  ) => SnackbarKey;
} | null = null;

export const SnackbarUtilsConfigurator = () => {
  useSnackbarRef = useSnackbar();

  return null;
};

export const snackActions = {
  success(msg: SnackbarMessage, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'success' });
  },
  warning(msg: SnackbarMessage, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'warning' });
  },
  info(msg: SnackbarMessage, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'info' });
  },
  error(msg: SnackbarMessage, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'error' });
  },
  toast(msg: SnackbarMessage, options: OptionsObject = {}) {
    const finalOptions: OptionsObject = {
      variant: 'default',
      ...options,
    };
    if (useSnackbarRef) {
      useSnackbarRef.enqueueSnackbar(msg, { ...finalOptions });
    } else {
      console.warn('Snackbar is not initialized.');
    }
  },
};
