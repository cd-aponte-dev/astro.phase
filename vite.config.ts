import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/astro.phase/',
  plugins: [react()],
  // satellite.js ships an optional WASM runtime (unused here) whose worker
  // entry uses top-level await — the default iife worker format can't build
  // that, so switch to es modules.
  worker: { format: 'es' },
})
