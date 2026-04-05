import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Star, Zap, Crown, Shield, ChevronRight, Sparkles } from '@/lib/lucide-icons'
import toast from 'react-hot-toast'
import { isNative } from '@/lib/native'
import { getOfferings, purchasePackage, restorePurchases, refreshSubscriptionState } from '@/lib/purchases'

interface UpgradeModalProps {
  onClose: () => void
  trigger?: string
}

interface Testimonial {
  name: string
  location: string
  review: string
  rating: number
  avatar: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Priya Venkataraman',
    location: 'Bangalore',
    review:
      'The Kundli Milan feature gave me clarity I couldn\'t find anywhere else. The 8-kuta analysis was incredibly detailed and accurate.',
    rating: 5,
    avatar: '🌺',
  },
  {
    name: 'Arjun Krishnamurthy',
    location: 'Chennai',
    review:
      'Muhurta calculator changed how I plan important decisions. Found the perfect time for my business launch and it went flawlessly!',
    rating: 5,
    avatar: '🔱',
  },
  {
    name: 'Deepika Sharma',
    location: 'Jaipur',
    review:
      'I was skeptical at first, but the daily Panchanga and Oracle conversations have become an essential part of my morning routine.',
    rating: 5,
    avatar: '✨',
  },
]

interface PlanFeature {
  label: string
  free: string | boolean
  pro: string | boolean
  guru: string | boolean
}

const FEATURES: PlanFeature[] = [
  { label: 'Kundli Charts', free: '1 chart', pro: 'Unlimited + PDF', guru: 'Unlimited + PDF' },
  { label: 'Tarot Readings', free: '3/day', pro: 'Unlimited + history', guru: 'Unlimited + history' },
  { label: 'Numerology', free: 'Life Path only', pro: 'All 6 numbers', guru: 'All 6 numbers' },
  { label: 'Daily Scripture Verse', free: true, pro: true, guru: true },
  { label: 'Oracle / AI Chat', free: '5 questions/day', pro: 'Unlimited', guru: 'Unlimited' },
  { label: 'Kundli Milan (Compatibility)', free: false, pro: true, guru: true },
  { label: 'Panchanga (Daily Almanac)', free: false, pro: true, guru: true },
  { label: 'Muhurta Calculator', free: false, pro: true, guru: true },
  { label: 'Share Cards', free: false, pro: 'All types', guru: 'All types' },
  { label: 'Priority AI Oracle', free: false, pro: true, guru: true },
  { label: 'Expert Consultation', free: false, pro: false, guru: '1hr/month' },
  { label: 'Custom Birth Chart PDF', free: false, pro: false, guru: '10-page report' },
  { label: 'Daily Personal Horoscope', free: false, pro: false, guru: true },
  { label: 'WhatsApp Auspicious Alerts', free: false, pro: false, guru: true },
]

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="flex items-center justify-center">
        <X className="w-4 h-4 text-white/20" strokeWidth={2} />
      </span>
    )
  }
  return (
    <span className="text-xs text-champagne/80 font-cormorant leading-tight text-center">
      {value}
    </span>
  )
}

// Animated stars background
function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function UpgradeModal({ onClose, trigger }: UpgradeModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const [purchasing, setPurchasing] = useState(false)

  const handleUpgrade = async (plan: 'pro' | 'guru') => {
    if (isNative) {
      // Real in-app purchase flow via RevenueCat
      setPurchasing(true)
      try {
        const offerings = await getOfferings()
        if (!offerings) {
          toast.error('Unable to load store products. Please try again.')
          return
        }

        // Find the right package based on plan + billing period
        const packageId = plan === 'guru' ? 'nakshatra_guru_monthly' : 'nakshatra_pro_monthly'
        const pkg = offerings.availablePackages?.find(
          (p: any) => p.identifier === packageId || p.product?.identifier === packageId
        ) ?? offerings.availablePackages?.[0]

        if (!pkg) {
          toast.error('Product not found in store.')
          return
        }

        const success = await purchasePackage(pkg)
        if (success) {
          onClose()
          toast.custom(
            () => (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="achievement-toast px-5 py-4 flex items-center gap-3 min-w-[280px]"
              >
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-cinzel text-sm text-gold">
                    Welcome to Nakshatra {plan === 'pro' ? 'Pro' : 'Guru'}!
                  </p>
                  <p className="text-xs text-champagne/70 mt-0.5">All premium features are now unlocked.</p>
                </div>
              </motion.div>
            ),
            { duration: 4000 }
          )
        }
      } catch {
        toast.error('Purchase failed. Please try again.')
      } finally {
        setPurchasing(false)
      }
    } else {
      // Web fallback (development/testing only)
      localStorage.setItem('nakshatra_premium', 'true')
      localStorage.setItem('nakshatra_plan', plan)
      onClose()
      toast.custom(
        () => (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="achievement-toast px-5 py-4 flex items-center gap-3 min-w-[280px]"
          >
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-cinzel text-sm text-gold">
                Welcome to Nakshatra {plan === 'pro' ? 'Pro' : 'Guru'}!
              </p>
              <p className="text-xs text-champagne/70 mt-0.5">All premium features are now unlocked.</p>
            </div>
          </motion.div>
        ),
        { duration: 4000 }
      )
    }
  }

  const handleRestore = async () => {
    setPurchasing(true)
    try {
      const state = await restorePurchases()
      if (state.isActive) {
        onClose()
        toast.success(`Restored ${state.plan === 'guru' ? 'Guru' : 'Pro'} subscription!`)
      } else {
        toast.error('No active subscriptions found.')
      }
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6, 22, 40, 0.97) 0%, rgba(2, 11, 24, 0.99) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <StarField />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #061628 0%, #020B18 50%, #0D2137 100%)',
            border: '1px solid rgba(255, 179, 71, 0.2)',
            boxShadow:
              '0 0 80px rgba(255, 179, 71, 0.08), 0 0 160px rgba(107, 33, 168, 0.06)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full glass-card-dark hover:border-gold/30 transition-all duration-200 group"
          >
            <X className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          </button>

          <div className="px-6 pt-10 pb-8 md:px-10">
            {/* Header */}
            <div className="text-center mb-8">
              {trigger && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-gold/20 mb-4"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-cinzel text-gold/80">
                    Unlock {trigger} with Pro
                  </span>
                </motion.div>
              )}
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-cinzel text-3xl md:text-4xl text-gold-gradient mb-3"
              >
                Elevate Your Cosmic Journey
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="font-cormorant text-lg text-champagne/60 max-w-xl mx-auto"
              >
                Access the full depth of Vedic wisdom — from Muhurta to Kundli Milan — with
                unlimited AI conversations and ancient astrology tools.
              </motion.p>

              {/* Billing toggle */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 mt-6 glass-card-dark px-4 py-2 rounded-full"
              >
                <button
                  onClick={() => setBilling('monthly')}
                  className={`text-sm font-cinzel transition-colors px-3 py-1 rounded-full ${
                    billing === 'monthly'
                      ? 'bg-gold/15 text-gold'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`text-sm font-cinzel transition-colors px-3 py-1 rounded-full flex items-center gap-2 ${
                    billing === 'yearly'
                      ? 'bg-gold/15 text-gold'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Yearly
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                    Save 30%
                  </span>
                </button>
              </motion.div>
            </div>

            {/* Plan cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
            >
              {/* FREE */}
              <div className="glass-card p-6 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-white/40" />
                    <span className="font-cinzel text-sm text-white/50 uppercase tracking-widest">
                      Free
                    </span>
                    <span className="ml-auto text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  </div>
                  <p className="font-cinzel text-3xl text-white/70">₹0</p>
                  <p className="text-xs text-white/30 font-cormorant mt-1">Free forever</p>
                </div>
                <ul className="space-y-2.5 text-sm font-cormorant text-white/50 flex-1">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    1 Kundli chart
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    3 Tarot readings/day
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    Basic Life Path numerology
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    Daily scripture verse
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    5 Oracle questions/day
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                    <span className="text-white/25">Compatibility (Kundli Milan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                    <span className="text-white/25">Panchanga & Muhurta</span>
                  </li>
                </ul>
                <button
                  disabled
                  className="mt-6 w-full py-2.5 rounded-xl text-sm font-cinzel text-white/30 bg-white/5 cursor-not-allowed border border-white/10"
                >
                  Current Plan
                </button>
              </div>

              {/* PRO — highlighted */}
              <div className="relative shimmer-border flex flex-col">
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-xs font-cinzel tracking-widest"
                  style={{
                    background: 'linear-gradient(90deg, #FFB347, #FF6B00)',
                    color: '#020B18',
                    boxShadow: '0 0 20px rgba(255, 179, 71, 0.5)',
                  }}
                >
                  ✦ MOST POPULAR
                </div>
                <div
                  className="flex-1 flex flex-col p-6 rounded-2xl"
                  style={{
                    background: 'linear-gradient(160deg, rgba(107, 33, 168, 0.15) 0%, rgba(13, 33, 55, 0.9) 100%)',
                  }}
                >
                  <div className="mb-4 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-gold" />
                      <span className="font-cinzel text-sm text-gold uppercase tracking-widest">
                        Nakshatra Pro
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className="font-cinzel text-3xl text-gold-gradient">
                        {billing === 'monthly' ? '₹299' : '₹208'}
                      </p>
                      <p className="text-sm text-champagne/50 font-cormorant mb-1">/month</p>
                    </div>
                    {billing === 'yearly' && (
                      <p className="text-xs text-emerald-400 font-cormorant">
                        ₹2,499/year · Save ₹1,089
                      </p>
                    )}
                    {billing === 'monthly' && (
                      <p className="text-xs text-champagne/40 font-cormorant mt-0.5">
                        or ₹2,499/year (save 30%)
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2.5 text-sm font-cormorant text-champagne/80 flex-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Unlimited charts + PDF export
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Unlimited Tarot + all spreads + history
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      All 6 numerology numbers
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Unlimited Oracle conversations
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Kundli Milan · Full 8-kuta analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Daily Panchanga almanac
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Muhurta auspicious timing
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      All Share Card types
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      Priority AI Oracle
                    </li>
                  </ul>
                  <motion.button
                    onClick={() => handleUpgrade('pro')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full py-3 rounded-xl text-sm font-cinzel tracking-wider flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #FFB347 0%, #FF6B00 100%)',
                      color: '#020B18',
                      boxShadow: '0 4px 24px rgba(255, 179, 71, 0.35)',
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Start 14-Day Free Trial
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <p className="text-center text-xs text-champagne/30 font-cormorant mt-2">
                    No credit card required for trial
                  </p>
                </div>
              </div>

              {/* GURU */}
              <div
                className="flex flex-col p-6 rounded-2xl"
                style={{
                  background: 'rgba(13, 33, 55, 0.7)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                }}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-ethereal" />
                    <span className="font-cinzel text-sm text-ethereal uppercase tracking-widest">
                      Jyotisha Guru
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="font-cinzel text-3xl" style={{ color: '#C084FC' }}>
                      {billing === 'monthly' ? '₹999' : '₹708'}
                    </p>
                    <p className="text-sm text-champagne/50 font-cormorant mb-1">/month</p>
                  </div>
                  {billing === 'yearly' && (
                    <p className="text-xs text-emerald-400 font-cormorant">
                      ₹8,499/year · Save ₹3,489
                    </p>
                  )}
                  {billing === 'monthly' && (
                    <p className="text-xs text-champagne/40 font-cormorant mt-0.5">
                      or ₹8,499/year (save 29%)
                    </p>
                  )}
                </div>
                <ul className="space-y-2.5 text-sm font-cormorant text-champagne/70 flex-1">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ethereal mt-0.5 shrink-0" />
                    Everything in Nakshatra Pro
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ethereal mt-0.5 shrink-0" />
                    1-on-1 Expert consultation (1hr/month)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ethereal mt-0.5 shrink-0" />
                    Custom birth chart PDF (10 pages)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ethereal mt-0.5 shrink-0" />
                    Daily personal horoscope
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ethereal mt-0.5 shrink-0" />
                    WhatsApp alerts for auspicious times
                  </li>
                </ul>
                <motion.button
                  onClick={() => handleUpgrade('guru')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full py-3 rounded-xl text-sm font-cinzel tracking-wider flex items-center justify-center gap-2 border transition-all duration-200"
                  style={{
                    borderColor: 'rgba(192, 132, 252, 0.4)',
                    color: '#C084FC',
                    background: 'rgba(147, 51, 234, 0.1)',
                  }}
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Guru
                </motion.button>
              </div>
            </motion.div>

            {/* Feature comparison table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-10"
            >
              <h3 className="font-cinzel text-center text-sm text-gold/60 uppercase tracking-widest mb-4">
                Full Feature Comparison
              </h3>
              <div className="glass-card-dark rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-4 px-4 py-3 border-b border-white/5">
                  <div className="text-xs font-cinzel text-white/30 uppercase tracking-wider">Feature</div>
                  <div className="text-xs font-cinzel text-white/30 uppercase tracking-wider text-center">Free</div>
                  <div className="text-xs font-cinzel text-gold uppercase tracking-wider text-center">Pro</div>
                  <div className="text-xs font-cinzel text-ethereal/70 uppercase tracking-wider text-center">Guru</div>
                </div>
                {FEATURES.map((feature, i) => (
                  <div
                    key={feature.label}
                    className={`grid grid-cols-4 px-4 py-3 items-center ${
                      i % 2 === 0 ? 'bg-white/[0.02]' : ''
                    } border-b border-white/[0.04] last:border-0`}
                  >
                    <div className="text-sm font-cormorant text-champagne/60 pr-2">{feature.label}</div>
                    <div className="flex justify-center">
                      <FeatureValue value={feature.free} />
                    </div>
                    <div className="flex justify-center">
                      <FeatureValue value={feature.pro} />
                    </div>
                    <div className="flex justify-center">
                      <FeatureValue value={feature.guru} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <h3 className="font-cinzel text-center text-sm text-gold/60 uppercase tracking-widest mb-5">
                Loved by Seekers Across India
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TESTIMONIALS.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{
                          background: 'rgba(255, 179, 71, 0.1)',
                          border: '1px solid rgba(255, 179, 71, 0.2)',
                        }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-cinzel text-champagne">{t.name}</p>
                        <p className="text-xs text-champagne/40 font-cormorant">{t.location}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-cormorant text-champagne/60 leading-relaxed italic">
                      "{t.review}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* As seen in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <p className="text-xs font-cinzel text-white/20 uppercase tracking-widest mb-3">
                As Seen In
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {['The Hindu', 'Times of India', 'YourStory'].map((pub) => (
                  <span
                    key={pub}
                    className="font-cinzel text-sm text-white/25 tracking-wider"
                  >
                    {pub}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2 text-xs font-cormorant text-white/30">
                <Shield className="w-4 h-4 text-emerald-500/50" />
                <span>🔒 Secured by {isNative ? 'Apple / Google' : 'end-to-end encryption'}</span>
              </div>
              {isNative && (
                <button
                  onClick={handleRestore}
                  disabled={purchasing}
                  className="text-xs font-cormorant text-white/30 underline underline-offset-2 hover:text-white/50 transition-colors"
                >
                  Restore Purchases
                </button>
              )}
              <p className="text-[10px] font-cormorant text-white/15 mt-1">
                Subscriptions auto-renew. Cancel anytime in Settings.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
