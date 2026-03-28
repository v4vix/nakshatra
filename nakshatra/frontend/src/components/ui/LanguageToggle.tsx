// ─── Language Toggle ─────────────────────────────────────────────────────────
// Sleek EN | हिं pill toggle with gold active indicator

import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'

const LANGUAGES = [
  { code: 'en' as const, label: 'EN', script: 'English' },
  { code: 'hi' as const, label: 'हिं', script: 'हिन्दी' },
]

interface LanguageToggleProps {
  compact?: boolean
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation()

  return (
    <div
      className="relative flex items-center rounded-full overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,179,71,0.15)',
        height: compact ? 28 : 34,
      }}
      role="radiogroup"
      aria-label="Language selection"
    >
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.code
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            role="radio"
            aria-checked={isActive}
            aria-label={lang.script}
            className="relative z-10 px-3 transition-colors duration-200"
            style={{
              fontSize: compact ? 11 : 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0A1628' : 'rgba(241,245,249,0.5)',
              fontFamily: lang.code === 'hi' ? "'Noto Serif Devanagari', serif" : "'Cinzel', serif",
              letterSpacing: lang.code === 'en' ? '0.05em' : 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
          >
            {lang.label}
          </button>
        )
      })}

      {/* Animated gold pill indicator */}
      <motion.div
        layoutId="lang-pill"
        className="absolute top-0 bottom-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #FFB347, #FFCC70)',
          width: '50%',
          left: language === 'en' ? 0 : '50%',
          boxShadow: '0 0 12px rgba(255,179,71,0.3)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  )
}
