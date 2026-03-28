import React from 'react'
import { motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// ─── Broken Star Icon ─────────────────────────────────────────────────────────

function BrokenStarIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow ring */}
      <circle cx="40" cy="40" r="36" stroke="rgba(255,179,71,0.15)" strokeWidth="1" />

      {/* Star left half */}
      <motion.g
        initial={{ rotate: 0, x: 0, y: 0 }}
        animate={{ rotate: [-2, 2, -2], x: [-1, 1, -1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '30px 40px' }}
      >
        <path
          d="M40 8 L36 28 L18 22 L30 36 L8 40 L28 44 L22 62 L36 52"
          stroke="#FFB347"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(255,179,71,0.08)"
        />
      </motion.g>

      {/* Star right half (cracked/shifted) */}
      <motion.g
        initial={{ rotate: 0, x: 0, y: 0 }}
        animate={{ rotate: [3, -3, 3], x: [2, -2, 2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        style={{ transformOrigin: '50px 40px' }}
      >
        <path
          d="M36 52 L40 72 L44 52 L62 58 L50 44 L72 40 L52 36 L58 18 L44 28 L40 8"
          stroke="#FF6B00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(255,107,0,0.06)"
          strokeDasharray="4 2"
        />
      </motion.g>

      {/* Crack line */}
      <motion.line
        x1="36"
        y1="28"
        x2="36"
        y2="52"
        stroke="#FFB347"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Sparkle fragments */}
      {[
        { cx: 20, cy: 20, r: 2 },
        { cx: 60, cy: 18, r: 1.5 },
        { cx: 65, cy: 55, r: 2 },
        { cx: 15, cy: 60, r: 1.5 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="#C084FC"
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  )
}

// ─── Error Fallback UI ────────────────────────────────────────────────────────

function CosmicErrorFallback({
  error,
  onReset,
}: {
  error?: Error
  onReset: () => void
}) {
  const isDev = import.meta.env.DEV

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full"
      style={{ background: 'linear-gradient(135deg, #020B18 0%, #061628 50%, #020B18 100%)' }}
    >
      {/* Subtle ambient glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(147,51,234,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative flex flex-col items-center gap-6 px-6 py-10 max-w-sm w-full mx-4 glass-card"
        style={{ zIndex: 1 }}
      >
        {/* Animated broken star */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <BrokenStarIcon />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="font-cinzel text-lg font-semibold text-gold-gradient mb-2">
            Cosmic Disturbance
          </h2>
          <p className="font-cormorant text-base text-champagne/80 leading-relaxed">
            The cosmos encountered a disturbance. The stars have been temporarily misaligned.
          </p>
        </motion.div>

        {/* Dev error details */}
        {isDev && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full rounded-xl p-3 overflow-auto max-h-32"
            style={{
              background: 'rgba(6,22,40,0.8)',
              border: '1px solid rgba(255,107,0,0.25)',
            }}
          >
            <p className="font-mono text-xs text-saffron/80 break-words whitespace-pre-wrap">
              {error.message}
            </p>
            {error.stack && (
              <p className="font-mono text-xs text-slate-500 mt-1 break-words whitespace-pre-wrap">
                {error.stack.split('\n').slice(1, 4).join('\n')}
              </p>
            )}
          </motion.div>
        )}

        {/* Realign button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="px-6 py-2.5 rounded-full font-cinzel text-sm font-semibold
            border border-gold/40 text-gold bg-gold/10
            hover:bg-gold/20 hover:border-gold/60 transition-all duration-200"
        >
          ✦ Realign the Stars
        </motion.button>
      </motion.div>
    </div>
  )
}

// ─── Class-based Error Boundary ───────────────────────────────────────────────

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In a real app, log to error reporting service (Sentry, etc.)
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error)
      console.error('[ErrorBoundary] Component stack:', info.componentStack)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <CosmicErrorFallback error={this.state.error} onReset={this.handleReset} />
      )
    }

    return this.props.children
  }
}

// ─── Hook-friendly functional wrapper ────────────────────────────────────────

export default function CosmicErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}
