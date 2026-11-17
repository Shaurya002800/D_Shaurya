import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import { chatMiddleware } from './server/chatMiddleware.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['GROQ_API_KEY', 'GROQ_MODEL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'LLM_TIMEOUT_MS']) {
    if (process.env[key] === undefined && env[key] !== undefined) process.env[key] = env[key]
  }
  const assistantApi = {
    name: 'local-assistant-api',
    configureServer(server) { server.middlewares.use('/api/chat', chatMiddleware()) },
    configurePreviewServer(server) { server.middlewares.use('/api/chat', chatMiddleware()) },
  }
  return {
    plugins: [react(), assistantApi],
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
  }
})
