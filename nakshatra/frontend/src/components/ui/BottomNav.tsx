import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Star, Sparkles, MessageCircle, User } from 'lucide-react'
import { useTranslation } from '@/i18n'
import type { TranslationKey } from '@/i18n'

interface NavTab {
  path: string
  icon: React.ElementType
  labelKey: TranslationKey
}

const TABS: NavTab[] = [
  { path: '/dashboard', icon: Home, labelKey: 'nav.dashboard' },
  { path: '/kundli', icon: Star, labelKey: 'nav.kundli' },
  { path: '/tarot', icon: Sparkles, labelKey: 'nav.tarot' },
  { path: '/oracle', icon: MessageCircle, labelKey: 'nav.oracle' },
  { path: '/profile', icon: User, labelKey: 'nav.profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const { t } = useTranslation()

  const activeIndex = TABS.findIndex((t) => location.pathname.startsWith(t.path))

  return (
    <nav
      aria-label="Main navigation"
      role="navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(6, 22, 40, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,179,71,0.10)',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      {/* Active tab bump glow */}
      <AnimatePresence>
        {activeIndex >= 0 && (
          <motion.div
            key={activeIndex}
            layoutId="bottom-nav-bump"
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(${(activeIndex / TABS.length) * 100}% + ${(100 / TABS.length / 2)}%)`,
              transform: 'translateX(-50%)',
              width: '56px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #FFB347, transparent)',
              borderRadius: '0 0 4px 4px',
              pointerEvents: 'none',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'stretch',
        }}
      >
        {TABS.map((tab, index) => {
          const isActive = location.pathname.startsWith(tab.path)
          const Icon = tab.icon

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-label={t(tab.labelKey)}
              aria-current={isActive ? 'page' : undefined}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                  paddingTop: 8,
                }}
              >
                {/* Active indicator dot above icon */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      layoutId={`bottom-nav-dot-${index}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#FFB347',
                        boxShadow: '0 0 6px rgba(255,179,71,0.8)',
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.span
                  animate={
                    isActive
                      ? { color: '#FFB347', filter: 'drop-shadow(0 0 4px rgba(255,179,71,0.6))' }
                      : { color: '#64748b', filter: 'none' }
                  }
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  <Icon size={20} />
                </motion.span>

                {/* Label */}
                <motion.span
                  animate={
                    isActive ? { color: '#FFB347' } : { color: '#64748b' }
                  }
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 9,
                    letterSpacing: '0.05em',
                    lineHeight: 1,
                  }}
                >
                  {t(tab.labelKey)}
                </motion.span>
              </motion.div>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
