import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/client',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/client/public/index.html'),
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
