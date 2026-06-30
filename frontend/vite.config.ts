import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Ins Repo-Root-`dist` bauen: Vercel erkennt das Frontend als Vite-Projekt und
    // erwartet das Output dort. emptyOutDir noetig, da das Verzeichnis ausserhalb von frontend/ liegt.
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // forwards /api/* to `vercel dev` during local development
      '/api': 'http://localhost:3000',
    },
  },
})
