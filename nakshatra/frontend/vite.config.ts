/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// On macOS, Rollup's native binary deadlocks when opening 200+ ESM files simultaneously
// (framer-motion has 297, @sentry/react has 200+) due to the low default fd limit (256).
// We work around this by aliasing them to single-file CJS/stub versions on macOS only.
// On Linux (Docker / Render CI) the fd limit is 1M+ so the standard ESM bundles work fine.
const isMacOS = process.platform === 'darwin'

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
      // macOS-only: stub Sentry to avoid opening 200+ ESM files → Rollup fd deadlock
      ...(isMacOS && {
        '@sentry/react': path.resolve(__dirname, 'src/lib/sentry-stub.ts'),
        // Force CJS bundle (1 file) instead of 297 ESM files
        'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion/dist/cjs/index.js'),
      }),
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
