import React, { useEffect, ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import './network-detector.styles.scss';

// Define the types for the props of the wrapped component
type NetworkDetectorProps = {
  [key: string]: any; // If there are any specific props, you can replace this with their actual types
};

// Define a higher-order component (HOC) type that wraps a component
const withNetworkDetector = <P extends object>(
  ComposedComponent: ComponentType<P>,
) => {
  const NetworkDetector: React.FC<P & NetworkDetectorProps> = (props) => {
    const { t } = useTranslation();

    useEffect(() => {
      handleConnectionChange();
      window.addEventListener('online', handleConnectionChange);
      window.addEventListener('offline', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleConnectionChange);
        window.removeEventListener('offline', handleConnectionChange);
      };
    }, []);

    const handleConnectionChange = () => {
      const snackbarEle = document.getElementById('snackbarDiv');
      const condition = navigator.onLine ? 'online' : 'offline';

      if (!snackbarEle) return; // Make sure snackbarEle is defined

      if (condition === 'online') {
        const webPing = setInterval(() => {
          fetch('//google.com', {
            mode: 'no-cors',
          })
            .then(() => {
              snackbarEle.className = snackbarEle.className.replace('show', '');
              clearInterval(webPing);
            })
            .catch(() => {
              snackbarEle.className = 'show';
              clearInterval(webPing);
            });
        }, 2000);
        return;
      }

      snackbarEle.className = 'show';
    };

    return (
      <>
        <div id="snackbarDiv">{t('NO_INTERNET.TITLE')}</div>
        <ComposedComponent {...(props as P)} />
      </>
    );
  };

  return NetworkDetector;
};

export default withNetworkDetector;
