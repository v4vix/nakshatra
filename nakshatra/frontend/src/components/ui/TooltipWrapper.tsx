import { useState, useRef, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipWrapperProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const ARROW_SIZE = 6
const TOOLTIP_OFFSET = 10

// Variants per side
const variants = {
  top: {
    initial: { opacity: 0, y: 6, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 4, scale: 0.95 },
  },
  bottom: {
    initial: { opacity: 0, y: -6, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4, scale: 0.95 },
  },
  left: {
    initial: { opacity: 0, x: 6, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 4, scale: 0.95 },
  },
  right: {
    initial: { opacity: 0, x: -6, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -4, scale: 0.95 },
  },
}

function getTooltipPositionStyle(
  side: 'top' | 'bottom' | 'left' | 'right',
): React.CSSProperties {
  switch (side) {
    case 'top':
      return {
        bottom: `calc(100% + ${TOOLTIP_OFFSET}px)`,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom':
      return {
        top: `calc(100% + ${TOOLTIP_OFFSET}px)`,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'left':
      return {
        right: `calc(100% + ${TOOLTIP_OFFSET}px)`,
        top: '50%',
        transform: 'translateY(-50%)',
      }
    case 'right':
      return {
        left: `calc(100% + ${TOOLTIP_OFFSET}px)`,
        top: '50%',
        transform: 'translateY(-50%)',
      }
  }
}

function ArrowShape({
  side,
}: {
  side: 'top' | 'bottom' | 'left' | 'right'
}) {
  const s = ARROW_SIZE

  const sharedStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
  }

  if (side === 'top') {
    return (
      <span
        style={{
          ...sharedStyle,
          bottom: -s,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${s}px solid transparent`,
          borderRight: `${s}px solid transparent`,
          borderTop: `${s}px solid rgba(255,179,71,0.5)`,
        }}
      />
    )
  }
  if (side === 'bottom') {
    return (
      <span
        style={{
          ...sharedStyle,
          top: -s,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${s}px solid transparent`,
          borderRight: `${s}px solid transparent`,
          borderBottom: `${s}px solid rgba(255,179,71,0.5)`,
        }}
      />
    )
  }
  if (side === 'left') {
    return (
      <span
        style={{
          ...sharedStyle,
          right: -s,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${s}px solid transparent`,
          borderBottom: `${s}px solid transparent`,
          borderLeft: `${s}px solid rgba(255,179,71,0.5)`,
        }}
      />
    )
  }
  // right
  return (
    <span
      style={{
        ...sharedStyle,
        left: -s,
        top: '50%',
        transform: 'translateY(-50%)',
        borderTop: `${s}px solid transparent`,
        borderBottom: `${s}px solid transparent`,
        borderRight: `${s}px solid rgba(255,179,71,0.5)`,
      }}
    />
  )
}

export default function TooltipWrapper({
  content,
  children,
  side = 'top',
  delay = 300,
}: TooltipWrapperProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  const showTooltip = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hideTooltip = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setVisible(false)
  }, [])

  const v = variants[side]

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              zIndex: 9000,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              ...getTooltipPositionStyle(side),
            }}
          >
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                padding: '5px 10px',
                background: 'rgba(6,22,40,0.95)',
                border: '1px solid rgba(255,179,71,0.5)',
                borderRadius: 8,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 8px rgba(255,179,71,0.15)',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 13,
                color: '#F7E7CE',
                letterSpacing: '0.02em',
              }}
            >
              {content}
              <ArrowShape side={side} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
