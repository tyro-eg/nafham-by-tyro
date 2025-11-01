/**
 * Global TypeScript Type Declarations
 *
 * This file contains type declarations for third-party libraries
 * that don't have proper TypeScript types.
 */

/**
 * Redux Persist Integration with React
 *
 * Type definitions for redux-persist/integration/react
 * Ensures proper typing for PersistGate component
 */
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
