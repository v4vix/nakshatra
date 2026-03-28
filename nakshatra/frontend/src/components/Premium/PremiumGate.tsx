import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { hasPlan, type PlanId } from '@/lib/purchases'
import UpgradeModal from './UpgradeModal'

interface PremiumGateProps {
  feature: string
  featureName: string
  children: React.ReactNode
  previewLines?: number
  requiredPlan?: PlanId
}

const FEATURE_BENEFITS: Record<string, string> = {
  compatibility: 'Get a complete 8-kuta Kundli Milan analysis for any two birth charts.',
  muhurta: 'Find the most auspicious timing for weddings, travel, business, and more.',
  panchanga: 'Access today\'s full Vedic almanac — tithi, nakshatra, yoga, karana & more.',
  unlimited_tarot: 'Unlock unlimited spreads, all card types, and a full reading history.',
  oracle_unlimited: 'Chat with an AI Vedic sage without daily limits — wisdom on demand.',
  pdf_export: 'Download a beautifully formatted PDF of any birth chart.',
  share_cards: 'Create and share stunning cosmic insight cards for every feature.',
  numerology_full: 'Unlock all 6 numerology numbers including Expression, Soul Urge & more.',
  video_analysis: 'Generate a cinematic video analysis of your Kundli covering planetary positions, dashas, forecasts, remedies and more. Share via WhatsApp or email.',
}

function getDescription(feature: string, featureName: string): string {
  return FEATURE_BENEFITS[feature] ?? `Upgrade to Pro to unlock ${featureName} and more.`
}

export default function PremiumGate({
  feature,
  featureName,
  children,
  previewLines,
  requiredPlan = 'pro',
}: PremiumGateProps) {
  const [showModal, setShowModal] = useState(false)
  const isPremium = hasPlan(requiredPlan)

  // If premium, render children directly with no gate
  if (isPremium) {
    return <>{children}</>
  }

  const description = getDescription(feature, featureName)

  return (
    <>
      <div className="relative">
        {/* Blurred preview content */}
        <div
          className="select-none pointer-events-none"
          style={{
            WebkitMaskImage: previewLines
              ? undefined
              : 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            maskImage: previewLines
              ? undefined
              : 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            filter: 'blur(6px)',
            maxHeight: previewLines ? `${previewLines * 1.6}rem` : undefined,
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {children}
        </div>

        {/* Gate overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(2, 11, 24, 0.85) 0%, rgba(6, 22, 40, 0.92) 100%)',
            backdropFilter: 'blur(2px)',
            borderRadius: '16px',
          }}
        >
          <div className="flex flex-col items-center text-center px-6 py-8 max-w-xs">
            {/* Lock icon with glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 179, 71, 0.2)',
                  '0 0 40px rgba(255, 179, 71, 0.45)',
                  '0 0 20px rgba(255, 179, 71, 0.2)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(255, 179, 71, 0.08)',
                border: '1px solid rgba(255, 179, 71, 0.3)',
              }}
            >
              <Lock className="w-6 h-6 text-gold" />
            </motion.div>

            <h3 className="font-cinzel text-base text-gold mb-2">
              Unlock {featureName}
            </h3>
            <p className="text-sm font-cormorant text-champagne/60 leading-relaxed mb-6">
              {description}
            </p>

            {/* CTA */}
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-cinzel tracking-wider mb-3"
              style={{
                background: 'linear-gradient(135deg, #FFB347 0%, #FF6B00 100%)',
                color: '#020B18',
                boxShadow: '0 4px 20px rgba(255, 179, 71, 0.3)',
              }}
            >
              ✦ Upgrade to Pro
            </motion.button>

            <button
              onClick={() => {}}
              className="text-xs font-cormorant text-white/25 hover:text-white/50 transition-colors underline underline-offset-2"
            >
              Continue for Free
            </button>
          </div>
        </motion.div>
      </div>

      {/* Upgrade modal */}
      {showModal && (
        <UpgradeModal
          onClose={() => setShowModal(false)}
          trigger={featureName}
        />
      )}
    </>
  )
}
