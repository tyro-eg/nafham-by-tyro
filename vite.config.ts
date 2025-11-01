import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

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
    ],
    server: {
        port: 4200,
        host: true,
        strictPort: true,
    },
    build: {
        outDir: 'build',
        sourcemap: true,
    },
    define: {
        'process.env': {},
    },
});

