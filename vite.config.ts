import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  for (const key of [
    'RESEND_API_KEY',
    'RESEND_FROM',
    'RESEND_REPLY_TO',
    'RESEND_WAITLIST_SEGMENT_ID',
  ]) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [
      react(),
      {
        name: 'betamanuscript-local-api',
        configureServer(server) {
          server.middlewares.use('/api/waitlist', async (request, response) => {
            const { default: handler } = (await server.ssrLoadModule(
              '/api/waitlist.ts',
            )) as typeof import('./api/waitlist')

            await handler(request, response)
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
