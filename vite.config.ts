import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgr({
      // Support both default import (for img src) and ReactComponent named export
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
    react(),
    tsconfigPaths(),
    // Sentry plugin for uploading source maps (only in production builds)
    sentryVitePlugin({
      org: process.env.VITE_SENTRY_ORG,
      project: process.env.VITE_SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload source maps if auth token is provided
      disable: !process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './build/**',
      },
    }),
  ],
  server: {
    port: 4200,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true, // Generate source maps for production debugging
  },
  define: {
    'process.env': {},
  },
});
