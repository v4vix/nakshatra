import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRankForLevel } from '@/store'
import ConfettiCelebration from './ConfettiCelebration'

interface LevelUpModalProps {
  fromLevel: number
  toLevel: number
  newRank?: string
  onClose: () => void
}

const RANK_DESCRIPTIONS: Record<string, string> = {
  'Stardust Seeker': 'Your cosmic journey begins. The stars await your curiosity.',
  'Lunar Apprentice': 'You feel the pull of the moon. Ancient wisdom stirs within.',
  'Nakshatra Navigator': 'The 27 lunar mansions reveal their secrets to you.',
  'Rashi Ranger': 'The twelve zodiac signs bow to your growing knowledge.',
  'Graha Guardian': 'The nine planets align in recognition of your mastery.',
  'Dasha Master': 'You command the cycles of planetary periods with ease.',
  'Vedic Visionary': 'Ancient seers whisper their deepest truths to you.',
  'Cosmic Sage': 'The cosmos itself bends to your profound understanding.',
  'Jyotisha Guru': 'You have attained the pinnacle of Vedic astrological wisdom.',
}

// Cosmic mandala SVG — 8-petaled lotus
function CosmicMandala({ size = 200 }: { size?: number }) {
  const petals = Array.from({ length: 8 }, (_, i) => i)

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Outer ring */}
      <circle
        cx="0"
        cy="0"
        r="90"
        fill="none"
        stroke="rgba(255,179,71,0.2)"
        strokeWidth="0.5"
      />
      <circle
        cx="0"
        cy="0"
        r="75"
        fill="none"
        stroke="rgba(147,51,234,0.2)"
        strokeWidth="0.5"
      />

      {/* 8 petals */}
      {petals.map((i) => (
        <g key={i} transform={`rotate(${i * 45})`}>
          <ellipse
            cx="0"
            cy="-50"
            rx="16"
            ry="38"
            fill="rgba(255,179,71,0.06)"
            stroke="rgba(255,179,71,0.5)"
            strokeWidth="0.8"
          />
        </g>
      ))}

      {/* Inner ring dots */}
      {petals.map((i) => (
        <circle
          key={`dot-${i}`}
          cx={Math.cos(((i * 45 - 90) * Math.PI) / 180) * 62}
          cy={Math.sin(((i * 45 - 90) * Math.PI) / 180) * 62}
          r="2"
          fill="rgba(255,179,71,0.6)"
        />
      ))}

      {/* Inner decorative hexagon lines */}
      {petals.map((i) => (
        <line
          key={`line-${i}`}
          x1="0"
          y1="0"
          x2={Math.cos(((i * 45 - 90) * Math.PI) / 180) * 40}
          y2={Math.sin(((i * 45 - 90) * Math.PI) / 180) * 40}
          stroke="rgba(192,132,252,0.3)"
          strokeWidth="0.5"
        />
      ))}

      {/* Center circle */}
      <circle cx="0" cy="0" r="18" fill="rgba(13,33,55,0.8)" stroke="rgba(255,179,71,0.4)" strokeWidth="1" />

      {/* Center ✦ symbol */}
      <text
        x="0"
        y="7"
        textAnchor="middle"
        fontSize="18"
        fill="#FFB347"
        fontFamily="serif"
      >
        ✦
      </text>
    </svg>
  )
}

function useCountUp(target: number, duration: number, start: number): number {
  const [current, setCurrent] = useState(start)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(start + (target - start) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, start])

  return current
}

export default function LevelUpModal({
  fromLevel,
  toLevel,
  newRank,
  onClose,
}: LevelUpModalProps) {
  const [confettiActive, setConfettiActive] = useState(true)
  const [showRank, setShowRank] = useState(false)
  const displayLevel = useCountUp(toLevel, 1200, fromLevel)
  const rankName = newRank ?? getRankForLevel(toLevel)
  const rankDescription = RANK_DESCRIPTIONS[rankName] ?? ''

  // Show rank badge after level count-up settles
  useEffect(() => {
    const timer = setTimeout(() => setShowRank(true), 1400)
    return () => clearTimeout(timer)
  }, [])

  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        key="levelup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9000] flex items-center justify-center"
        style={{ background: 'rgba(2, 11, 24, 0.92)' }}
      >
        <ConfettiCelebration active={confettiActive} type="levelup" onComplete={() => setConfettiActive(false)} />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="shimmer-border relative w-full max-w-sm mx-4"
        >
          <div className="glass-card-dark rounded-2xl p-8 flex flex-col items-center text-center gap-4 overflow-hidden">
            {/* Subtle radial glow behind mandala */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(147,51,234,0.5) 0%, transparent 70%)',
              }}
            />

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-cinzel text-xs tracking-[0.3em] text-gold/80 uppercase"
            >
              ✦ LEVEL UP! ✦
            </motion.p>

            {/* Mandala + level number stack */}
            <div className="relative flex items-center justify-center w-48 h-48">
              {/* Spinning mandala */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CosmicMandala size={192} />
              </motion.div>

              {/* Counter-rotating inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <svg width="192" height="192" viewBox="-96 -96 192 192">
                  {Array.from({ length: 12 }, (_, i) => (
                    <circle
                      key={i}
                      cx={Math.cos(((i * 30 - 90) * Math.PI) / 180) * 70}
                      cy={Math.sin(((i * 30 - 90) * Math.PI) / 180) * 70}
                      r="1.5"
                      fill="rgba(192,132,252,0.5)"
                    />
                  ))}
                </svg>
              </motion.div>

              {/* Level number */}
              <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              >
                <span
                  className="font-cinzel font-bold text-gold-gradient leading-none"
                  style={{ fontSize: '3.5rem' }}
                >
                  {displayLevel}
                </span>
                <span className="font-cinzel text-xs text-gold/50 tracking-widest">LEVEL</span>
              </motion.div>
            </div>

            {/* Rank reveal */}
            <AnimatePresence>
              {showRank && (
                <motion.div
                  key="rank"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 8px rgba(255,179,71,0.3)',
                        '0 0 20px rgba(255,179,71,0.6)',
                        '0 0 8px rgba(255,179,71,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10"
                  >
                    <span className="font-cinzel text-sm font-semibold text-gold">
                      {rankName}
                    </span>
                  </motion.div>
                  {rankDescription && (
                    <p className="font-cormorant text-sm text-champagne/70 italic max-w-xs">
                      {rankDescription}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-full font-cinzel text-sm font-semibold
                bg-gradient-to-r from-gold/80 to-saffron/80 text-cosmos
                hover:from-gold hover:to-saffron transition-all duration-200
                shadow-lg shadow-gold/20"
            >
              Continue Your Journey
            </motion.button>

            {/* Auto-close hint */}
            <p className="text-xs text-slate-600 font-cormorant">Closes automatically in 5s</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
