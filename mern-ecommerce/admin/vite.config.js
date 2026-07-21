import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The admin SPA is served separately but talks to the SAME backend server
// (default http://localhost:5000). In dev, /api and /socket.io are proxied
// to the backend so cookies (admin auth) are sent on the same origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
