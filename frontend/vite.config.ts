import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const configuredApiUrl = loadEnv(
    mode,
    process.cwd(),
    'VITE_API_BASE_URL',
  ).VITE_API_BASE_URL?.trim()
  const productionApiUrl =
    configuredApiUrl && new URL(configuredApiUrl).protocol === 'https:'
      ? configuredApiUrl
      : ''

  return {
    plugins: [react(), tailwindcss()],
    define:
      command === 'build'
        ? {
            'import.meta.env.VITE_API_BASE_URL':
              JSON.stringify(productionApiUrl),
          }
        : undefined,
    server: {
      port: 5173,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
      },
    },
  }
})
