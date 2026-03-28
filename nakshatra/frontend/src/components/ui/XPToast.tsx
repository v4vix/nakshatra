import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export interface XPToastProps {
  amount: number
  action: string
}

export default function XPToastContent({ amount, action }: XPToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,179,71,0.95) 0%, rgba(255,107,0,0.95) 100%)',
        borderRadius: '999px',
        padding: '8px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 24px rgba(255,179,71,0.35), 0 0 0 1px rgba(255,179,71,0.4)',
        minWidth: '140px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '13px' }}>⚡</span>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            color: '#020B18',
            fontSize: '11px',
            letterSpacing: '0.05em',
          }}
        >
          +
        </span>
        <motion.span
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeInOut' }}
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            color: '#020B18',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          {amount}
        </motion.span>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            color: '#020B18',
            fontSize: '11px',
            letterSpacing: '0.1em',
          }}
        >
          XP
        </span>
      </div>
      <span
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '11px',
          color: 'rgba(2,11,24,0.75)',
          letterSpacing: '0.02em',
          marginTop: '1px',
          whiteSpace: 'nowrap',
        }}
      >
        {action}
      </span>
    </motion.div>
  )
}

export function showXPToast(amount: number, action: string): void {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: t.visible ? 1 : 0 }}
        style={{ pointerEvents: 'none' }}
      >
        <XPToastContent amount={amount} action={action} />
      </motion.div>
    ),
    {
      duration: 2000,
      position: 'bottom-center',
    },
  )
}
