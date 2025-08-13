import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react(), svgr()],
      server: {
        proxy: {
          '/api/coingecko': {
            target: 'https://api.coingecko.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/coingecko/, '')
          },
          '/api/coincap': {
            target: 'https://api.coincap.io',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/coincap/, '')
          },
          '/api/coinbase': {
            target: 'https://api.coinbase.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/coinbase/, '')
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
