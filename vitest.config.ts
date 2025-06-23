import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  css: {
    // Add CSS preprocess
    preprocessorOptions: {
      scss: {
        additionalData: '',
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts', './tests/css-setup.js'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
  },
})
