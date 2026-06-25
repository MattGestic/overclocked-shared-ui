import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: 'src/index.js',
        'components/index': 'src/components/index.js',
        'theme/index': 'src/theme/index.js',
        'utils/index': 'src/utils/index.js',
        'hooks/index': 'src/hooks/index.js',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
