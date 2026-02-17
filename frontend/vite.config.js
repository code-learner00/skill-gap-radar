import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js must use ESM (import/export), NOT CommonJS (require)
// Vite 5+ is pure ESM. Make sure package.json has "type": "module"
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
})