import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/mekit/' : '/',
  plugins: [react()],
  build: { target: ['es2020', 'safari16'] },
  test: { include: ['src/**/*.test.ts'] },
}))
