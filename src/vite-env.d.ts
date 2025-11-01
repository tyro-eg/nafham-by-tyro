/// <reference types="vite/client" />

/**
 * Vite Environment Configuration
 *
 * This file provides TypeScript type definitions for:
 * 1. Vite's client-side types
 * 2. SVG imports with SVGR
 * 3. Environment variables
 */

/**
 * SVG Module Declarations
 *
 * Allows importing SVG files as React components or URL strings:
 *
 * @example
 * // As React component
 * import { ReactComponent as Logo } from './logo.svg';
 *
 * @example
 * // As URL string
 * import logoUrl from './logo.svg';
 */
declare module '*.svg' {
  import * as React from 'react';

  // Named export for React component
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  // Default export for URL string
  const src: string;
  export default src;
}

/**
 * Environment Variables Interface
 *
 * Define all environment variables here for type safety.
 * All Vite env variables must be prefixed with VITE_
 *
 * Usage: import.meta.env.VITE_API_BASE_URL
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add other environment variables as needed:
  // readonly VITE_ENABLE_ANALYTICS?: string;
  // readonly VITE_SENTRY_DSN?: string;
}

/**
 * Augment ImportMeta interface with env property
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
