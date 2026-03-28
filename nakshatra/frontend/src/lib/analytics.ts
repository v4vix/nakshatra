/**
 * Nakshatra Analytics — PostHog + Sentry integration
 *
 * PostHog: Product analytics (free tier: 1M events/month)
 * Sentry: Error tracking (free tier: 5K errors/month)
 *
 * Both initialize lazily and degrade gracefully when keys aren't set.
 */

import posthog from 'posthog-js'
import * as Sentry from '@sentry/react'

type EventProperties = Record<string, string | number | boolean | undefined>

const isDev = import.meta.env.DEV

let posthogInitialized = false
let sentryInitialized = false

// ─── Initialization ─────────────────────────────────────────────────────────

/**
 * Initialize all analytics providers. Call once on app startup.
 */
export function initAnalytics(): void {
  // PostHog
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (posthogKey && !isDev) {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        autocapture: false, // We track events manually for precision
        capture_pageview: false, // We handle page views manually
        persistence: 'localStorage',
        disable_session_recording: true, // Enable later if needed
        loaded: () => {
          posthogInitialized = true
        },
      })
    } catch {
      // PostHog init failed — continue without analytics
    }
  }

  // Sentry
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  if (sentryDsn && !isDev) {
    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: isDev ? 'development' : 'production',
        tracesSampleRate: 0.1, // 10% of transactions for performance
        replaysSessionSampleRate: 0, // Disable session replay (privacy)
        replaysOnErrorSampleRate: 0.5, // 50% replay on errors
        beforeSend(event) {
          // Strip PII from error reports
          if (event.user) {
            delete event.user.email
            delete event.user.ip_address
          }
          return event
        },
      })
      sentryInitialized = true
    } catch {
      // Sentry init failed — continue without error tracking
    }
  }
}

// ─── Core Tracking ──────────────────────────────────────────────────────────

export function track(event: string, properties?: EventProperties): void {
  if (isDev) {
    console.log(
      `%c[Analytics] %c${event}`,
      'color: #C084FC; font-weight: bold',
      'color: #FFB347',
      properties ?? '',
    )
  }

  if (posthogInitialized) {
    posthog.capture(event, properties)
  }
}

export function trackPageView(path: string): void {
  track('$pageview', { $current_url: path })
}

export function identify(userId: string, traits?: EventProperties): void {
  if (isDev) {
    console.log(
      `%c[Analytics] %cidentify`,
      'color: #C084FC; font-weight: bold',
      'color: #22D3EE',
      userId,
      traits ?? '',
    )
  }

  if (posthogInitialized) {
    posthog.identify(userId, traits)
  }

  if (sentryInitialized) {
    Sentry.setUser({ id: userId })
  }
}

/**
 * Track an error in Sentry.
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (isDev) {
    console.error('[Analytics] Error captured:', error.message, context)
  }

  if (sentryInitialized) {
    Sentry.captureException(error, { extra: context })
  }
}

/**
 * Reset analytics state (on logout).
 */
export function resetAnalytics(): void {
  if (posthogInitialized) {
    posthog.reset()
  }
  if (sentryInitialized) {
    Sentry.setUser(null)
  }
}

// ─── Pre-defined Events ──────────────────────────────────────────────────────

export const events = {
  // Onboarding
  onboardingStart: () => track('onboarding_start'),
  onboardingComplete: (lang: string) => track('onboarding_complete', { language: lang }),

  // Oracle
  oracleQuery: (query: string, source: 'typed' | 'suggested') =>
    track('oracle_query', { query: query.slice(0, 100), source }),
  oracleRAGHit: (provider: string) => track('oracle_rag_hit', { provider }),
  oracleRuleFallback: () => track('oracle_rule_fallback'),

  // Kundli
  kundliGenerated: () => track('kundli_generated'),

  // Tarot
  tarotReading: (spread: string) => track('tarot_reading', { spread }),

  // Community
  communityPost: (type: string) => track('community_post', { type }),
  communityLike: () => track('community_like'),

  // Knowledge Base (admin)
  kbSourceAdded: (type: string) => track('kb_source_added', { type }),
  kbSearch: (query: string) => track('kb_search', { query: query.slice(0, 100) }),

  // Engagement
  xpGained: (amount: number, reason: string) => track('xp_gained', { amount, reason }),
  levelUp: (level: number) => track('level_up', { level }),
  streakMaintained: (days: number) => track('streak_maintained', { days }),

  // i18n
  languageChanged: (lang: string) => track('language_changed', { language: lang }),

  // Premium
  upgradeModalOpened: (trigger: string) => track('upgrade_modal_opened', { trigger }),
  purchaseStarted: (plan: string) => track('purchase_started', { plan }),
  purchaseCompleted: (plan: string) => track('purchase_completed', { plan }),
  purchaseFailed: (plan: string, reason: string) => track('purchase_failed', { plan, reason }),
  purchaseRestored: (plan: string) => track('purchase_restored', { plan }),
} as const
