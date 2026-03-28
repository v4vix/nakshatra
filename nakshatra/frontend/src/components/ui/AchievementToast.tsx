import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'

interface RarityConfig {
  color: string
  bgColor: string
  borderColor: string
  glow: string
  label: string
}

const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  Common: {
    color: '#94A3B8',
    bgColor: 'rgba(148,163,184,0.12)',
    borderColor: 'rgba(148,163,184,0.4)',
    glow: 'rgba(148,163,184,0.2)',
    label: 'Common',
  },
  Uncommon: {
    color: '#22C55E',
    bgColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.4)',
    glow: 'rgba(34,197,94,0.2)',
    label: 'Uncommon',
  },
  Rare: {
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.12)',
    borderColor: 'rgba(59,130,246,0.4)',
    glow: 'rgba(59,130,246,0.2)',
    label: 'Rare',
  },
  Epic: {
    color: '#A855F7',
    bgColor: 'rgba(168,85,247,0.12)',
    borderColor: 'rgba(168,85,247,0.4)',
    glow: 'rgba(168,85,247,0.25)',
    label: 'Epic',
  },
  Legendary: {
    color: '#FFB347',
    bgColor: 'rgba(255,179,71,0.12)',
    borderColor: 'rgba(255,179,71,0.5)',
    glow: 'rgba(255,179,71,0.3)',
    label: 'Legendary',
  },
}

function normalizeRarity(rarity: string): Rarity {
  const key = rarity as Rarity
  return key in RARITY_CONFIG ? key : 'Common'
}

interface AchievementToastContentProps {
  achievementName: string
  xpReward: number
  rarity: string
  visible: boolean
}

function AchievementToastContent({
  achievementName,
  xpReward,
  rarity,
  visible,
}: AchievementToastContentProps) {
  const normalRarity = normalizeRarity(rarity)
  const config = RARITY_CONFIG[normalRarity]

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 30, scale: visible ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        background: 'linear-gradient(135deg, rgba(13,33,55,0.98) 0%, rgba(6,22,40,0.98) 100%)',
        border: `1px solid ${config.borderColor}`,
        borderRadius: 14,
        padding: '12px 16px',
        width: 300,
        maxWidth: '92vw',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${config.glow}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        cursor: 'default',
      }}
    >
      {/* Trophy icon */}
      <motion.div
        initial={{ rotate: -20, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
          boxShadow: `0 0 12px ${config.glow}`,
        }}
      >
        🏆
      </motion.div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              color: config.color,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Achievement Unlocked!
          </span>
        </div>

        {/* Achievement name */}
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 14,
            color: '#F7E7CE',
            fontWeight: 600,
            marginBottom: 6,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {achievementName}
        </p>

        {/* Rarity + XP row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Rarity badge */}
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 11,
              color: config.color,
              background: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              borderRadius: 999,
              padding: '1px 8px',
              letterSpacing: '0.04em',
              ...(normalRarity === 'Legendary'
                ? { textShadow: '0 0 8px rgba(255,179,71,0.7)' }
                : {}),
            }}
          >
            {config.label}
          </span>

          {/* XP reward */}
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              fontWeight: 700,
              color: '#FFB347',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 10 }}>⚡</span>+{xpReward} XP
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

export function showAchievementToast(
  achievementName: string,
  xpReward: number,
  rarity: string,
): void {
  toast.custom(
    (t) => (
      <AchievementToastContent
        achievementName={achievementName}
        xpReward={xpReward}
        rarity={rarity}
        visible={t.visible}
      />
    ),
    {
      duration: 5000,
      position: 'top-right',
    },
  )
}
