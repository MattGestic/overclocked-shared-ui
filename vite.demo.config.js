import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate config for the local design-system demo (components + tokens
// showcase). Kept apart from vite.config.js, which builds the publishable
// library and is what CI's `npm run build` / `npm publish` rely on.
export default defineConfig({
  root: 'demo',
  plugins: [react()],
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
})
