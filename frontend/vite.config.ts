import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
    ],
  },
  server: {
    host: true,
    allowedHosts: [
      '9f63408b1446.ngrok-free.app'
    ],
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
