import { CSSProperties } from 'react'

// ─── Shimmer keyframes injected once ─────────────────────────────────────────

const SHIMMER_STYLE_ID = 'nakshatra-skeleton-shimmer'

function ensureShimmerStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(SHIMMER_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = SHIMMER_STYLE_ID
  style.textContent = `
    @keyframes skeleton-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
  `
  document.head.appendChild(style)
}

ensureShimmerStyles()

// ─── Shared shimmer style ─────────────────────────────────────────────────────

const shimmerBase: CSSProperties = {
  background:
    'linear-gradient(90deg, #0D2137 0%, rgba(255,179,71,0.07) 40%, rgba(255,179,71,0.13) 50%, rgba(255,179,71,0.07) 60%, #0D2137 100%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.8s linear infinite',
  borderRadius: '10px',
}

// ─── Primitive building blocks ────────────────────────────────────────────────

interface BlockProps {
  width?: string | number
  height?: string | number
  style?: CSSProperties
  circle?: boolean
}

function SkeletonBlock({ width = '100%', height = 16, style, circle }: BlockProps) {
  return (
    <div
      style={{
        ...shimmerBase,
        width,
        height,
        borderRadius: circle ? '50%' : shimmerBase.borderRadius,
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

// ─── KundliSkeleton ───────────────────────────────────────────────────────────

export function KundliSkeleton(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkeletonBlock width={40} height={40} circle />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock width="55%" height={18} />
          <SkeletonBlock width="35%" height={12} />
        </div>
      </div>

      {/* Chart circle */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            ...shimmerBase,
            width: 240,
            height: 240,
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Planet list rows */}
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SkeletonBlock width={28} height={28} circle />
          <SkeletonBlock width="40%" height={14} />
          <SkeletonBlock width="25%" height={14} style={{ marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  )
}

// ─── TarotSkeleton ────────────────────────────────────────────────────────────

export function TarotSkeleton(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* Spread label */}
      <SkeletonBlock width="45%" height={20} style={{ margin: '0 auto' }} />

      {/* Card spread — 3 cards */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            style={{
              ...shimmerBase,
              width: 80,
              height: 130,
              borderRadius: 12,
              flexShrink: 0,
              opacity: i === 1 ? 1 : 0.7,
            }}
          />
        ))}
      </div>

      {/* Interpretation lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBlock width="75%" height={14} />
        <SkeletonBlock width="90%" height={14} />
        <SkeletonBlock width="60%" height={14} />
        <SkeletonBlock width="80%" height={14} />
      </div>

      {/* Action button */}
      <SkeletonBlock width="50%" height={38} style={{ borderRadius: 999, margin: '0 auto' }} />
    </div>
  )
}

// ─── CardSkeleton ─────────────────────────────────────────────────────────────

export function CardSkeleton(): JSX.Element {
  return (
    <div
      style={{
        background: 'rgba(13,33,55,0.6)',
        borderRadius: 16,
        border: '1px solid rgba(255,179,71,0.08)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SkeletonBlock width={36} height={36} circle />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock width="60%" height={16} />
          <SkeletonBlock width="40%" height={11} />
        </div>
      </div>

      {/* Body lines */}
      <SkeletonBlock width="100%" height={12} />
      <SkeletonBlock width="85%" height={12} />
      <SkeletonBlock width="70%" height={12} />
    </div>
  )
}

// ─── ProfileSkeleton ──────────────────────────────────────────────────────────

export function ProfileSkeleton(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* Avatar + name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <SkeletonBlock width={88} height={88} circle />
        <SkeletonBlock width={160} height={22} />
        <SkeletonBlock width={100} height={14} />
      </div>

      {/* XP bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBlock width={60} height={12} />
          <SkeletonBlock width={60} height={12} />
        </div>
        <SkeletonBlock width="100%" height={8} style={{ borderRadius: 999 }} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            style={{
              ...shimmerBase,
              height: 72,
              borderRadius: 12,
            }}
          />
        ))}
      </div>

      {/* Achievements row */}
      <SkeletonBlock width="45%" height={18} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// ─── DashboardSkeleton ────────────────────────────────────────────────────────

export function DashboardSkeleton(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* Greeting */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBlock width="50%" height={28} />
        <SkeletonBlock width="35%" height={16} />
      </div>

      {/* Hero card */}
      <SkeletonBlock width="100%" height={140} style={{ borderRadius: 16 }} />

      {/* Quick actions row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBlock key={i} width="100%" height={80} style={{ borderRadius: 14 }} />
        ))}
      </div>

      {/* Section header */}
      <SkeletonBlock width="40%" height={18} />

      {/* Card list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
