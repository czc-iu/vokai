import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/__tests__/**/*.test.ts', 'app/__tests__/**/*.test.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/utils/**/*.ts', 'app/composables/**/*.ts'],
      exclude: ['node_modules', '.nuxt', '.output', '**/*.test.ts']
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
})
