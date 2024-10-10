declare module 'redux-persist/integration/react' {
  import { ReactNode } from 'react';
  import { Persistor } from 'redux-persist';

  interface PersistGateProps {
    persistor: Persistor;
    loading?: ReactNode;
    onBeforeLift?: () => void | Promise<void>;
    children?: ReactNode;
  }

  export class PersistGate extends React.Component<PersistGateProps, any> {}
}
