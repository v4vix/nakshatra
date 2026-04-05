/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    pool: 'threads',
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub out @sentry/react to avoid bundling @sentry/react + browser + core (200+ ESM files)
      // which deadlocks Rollup's native binary on macOS. Sentry initialises lazily at runtime
      // only when VITE_SENTRY_DSN is set — so this stub is safe for local/preview builds.
      '@sentry/react': path.resolve(__dirname, 'src/lib/sentry-stub.ts'),
      // Force CJS bundle (1 file) instead of 297 ESM files — prevents Rollup fd exhaustion
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion/dist/cjs/index.js'),
    },
  },
  server: {
    port: 5173,
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand', '@tanstack/react-query', 'react-hot-toast', 'axios', 'lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Sentry's unleash integration is optional — silence the missing module error
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message?.includes('unleash')) return
        warn(warning)
      },
      external: (id) => id.includes('unleash/integration'),
    },
  },
})
