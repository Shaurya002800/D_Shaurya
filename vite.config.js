import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: false,
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@react-three') || id.includes('three') || id.includes('@dimforge') || id.includes('rapier')) return undefined
          if (id.includes('framer-motion') || id.includes('gsap')) {
            return 'motion'
          }
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
})
