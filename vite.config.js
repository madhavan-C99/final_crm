import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      stream: path.resolve(__dirname, './src/shared/utils/streamPolyfill.js'),
    },
  },
  server: {
    proxy: {
      '/adm': {
        target: 'https://autopilot-elude-ungloved.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html'
          }
        },
      },
      '/telecalling': {
        target: 'https://autopilot-elude-ungloved.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html'
          }
        },
      },
      '/admin': {
        target: 'https://autopilot-elude-ungloved.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html'
          }
        },
      },
    },
  },
})
