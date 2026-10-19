import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/admin/', plugins: [react()],
  server: { host: '127.0.0.1', port: 5174, proxy: Object.fromEntries(['/api','/uploads','/socket.io'].map(prefix => [prefix, { target: 'http://localhost:5000', changeOrigin: true, ws: prefix === '/socket.io' }])) },
});
