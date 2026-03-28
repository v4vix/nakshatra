import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, X } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

const DISMISSED_KEY = 'pwa_banner_dismissed'

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [isDismissed, setIsDismissed] = useState<boolean>(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  )
  const [isInstalling, setIsInstalling] = useState(false)

  // Hide once actually installed
  useEffect(() => {
    if (isInstalled) setIsDismissed(true)
  }, [isInstalled])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setIsDismissed(true)
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    await installApp()
    setIsInstalling(false)
  }

  const shouldShow = isInstallable && !isInstalled && !isDismissed

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto w-full max-w-lg glass-card-dark flex items-center gap-4 px-5 py-4 rounded-2xl"
            style={{
              border: '1px solid rgba(255, 179, 71, 0.2)',
              boxShadow: '0 -4px 40px rgba(255, 179, 71, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Icon */}
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255, 179, 71, 0.1)',
                border: '1px solid rgba(255, 179, 71, 0.2)',
              }}
            >
              <Smartphone className="w-5 h-5 text-gold" />
            </div>

            {/* Text */}
            <p className="flex-1 text-sm font-cormorant text-champagne/80 leading-snug">
              <span className="mr-1">📱</span>
              Add{' '}
              <span className="font-cinzel text-gold text-xs">Nakshatra</span>{' '}
              to your home screen for the best experience
            </p>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-2">
              <motion.button
                onClick={handleInstall}
                disabled={isInstalling}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl text-xs font-cinzel tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #FFB347 0%, #FF6B00 100%)',
                  color: '#020B18',
                  boxShadow: '0 2px 12px rgba(255, 179, 71, 0.3)',
                }}
              >
                {isInstalling ? 'Installing…' : 'Install App'}
              </motion.button>

              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors hover:bg-white/5"
                aria-label="Dismiss install banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
