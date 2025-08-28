import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.4.1', // your backend server
        changeOrigin: true,              // changes the origin header to match the target
        // rewrite: (path) => path.replace(/^\/api/, '') // optional, if backend doesn't expect /api prefix
      }
    }
  }
})
