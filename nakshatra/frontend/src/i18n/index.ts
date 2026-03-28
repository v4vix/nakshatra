// ─── i18n Engine ─────────────────────────────────────────────────────────────
// Lightweight, zero-dependency internationalization for Nakshatra
// Uses Zustand store for language persistence

import { en, type TranslationKey } from './translations/en'
import { hi } from './translations/hi'
import { useStore } from '@/store'

const translations: Record<string, Record<TranslationKey, string>> = { en, hi }

/**
 * useTranslation hook — returns `t()` function and current language
 *
 * Usage:
 *   const { t, language, setLanguage } = useTranslation()
 *   <h1>{t('dashboard.goodMorning')}</h1>
 */
export function useTranslation() {
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)

  function t(key: TranslationKey, replacements?: Record<string, string | number>): string {
    const dict = translations[language] ?? translations.en
    let text = dict[key] ?? translations.en[key] ?? key

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }

    return text
  }

  return { t, language, setLanguage }
}

export type { TranslationKey }
