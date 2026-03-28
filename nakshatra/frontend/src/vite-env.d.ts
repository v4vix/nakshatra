/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_ADMIN_TOKEN: string
  readonly VITE_REVENUECAT_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_POSTHOG_KEY: string
  readonly VITE_POSTHOG_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
