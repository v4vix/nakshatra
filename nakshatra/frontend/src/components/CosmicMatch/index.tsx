import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { Heart, Sparkles, ChevronRight, Star, RefreshCw } from 'lucide-react'

// ─── Cosmic Data Tables ────────────────────────────────────────────────────

const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water']
const ELEMENT_EMOJIS: Record<string, string> = {
  Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧',
}
const ELEMENT_COMPAT: Record<string, Record<string, { score: number; desc: string }>> = {
  Fire: {
    Fire:  { score: 80, desc: 'Passionate and dynamic — you both ignite each other\'s spark.' },
    Earth: { score: 60, desc: 'Earth grounds Fire\'s intensity; a stabilizing but sometimes limiting union.' },
    Air:   { score: 95, desc: 'Air fans Fire\'s flame — an electrifying, inspiring connection.' },
    Water: { score: 50, desc: 'Water and Fire can clash or create steam — transformation awaits.' },
  },
  Earth: {
    Fire:  { score: 60, desc: 'Fire brings warmth to Earth\'s solidity — growth through contrast.' },
    Earth: { score: 85, desc: 'Two Earth signs build empires together — loyal and enduring.' },
    Air:   { score: 55, desc: 'Air stirs Earth\'s stillness — stimulating but potentially unsettling.' },
    Water: { score: 90, desc: 'Water nourishes Earth — a deeply fertile and nurturing bond.' },
  },
  Air: {
    Fire:  { score: 95, desc: 'You inspire each other to new heights — brilliant creative synergy.' },
    Earth: { score: 55, desc: 'Earth roots Air\'s restlessness — solid yet sometimes constraining.' },
    Air:   { score: 75, desc: 'Two minds in flight — intellectual harmony with occasional storms.' },
    Water: { score: 65, desc: 'Air and Water dance between thought and feeling — beautifully complex.' },
  },
  Water: {
    Fire:  { score: 50, desc: 'Opposites that either extinguish or create — intense transformation.' },
    Earth: { score: 90, desc: 'Water flows into Earth\'s form — a soulful, deeply nurturing love.' },
    Air:   { score: 65, desc: 'Emotion meets intellect — profound if both learn to bridge the gap.' },
    Water: { score: 88, desc: 'Two souls swimming in the same emotional ocean — deep psychic bond.' },
  },
}

const PLANET_PAIRS: Array<{ planets: [string, string]; harmony: number; desc: string }> = [
  { planets: ['Jupiter', 'Venus'],  harmony: 97, desc: 'Jupiter-Venus dance of wisdom and beauty — the most auspicious cosmic pairing.' },
  { planets: ['Sun', 'Moon'],       harmony: 88, desc: 'Solar consciousness meets lunar intuition — day and night in perfect union.' },
  { planets: ['Mercury', 'Jupiter'],harmony: 85, desc: 'Intelligence and wisdom unite — you elevate each other\'s thinking.' },
  { planets: ['Venus', 'Moon'],     harmony: 92, desc: 'Love and emotion flow as one — tenderness and beauty define your bond.' },
  { planets: ['Mars', 'Jupiter'],   harmony: 78, desc: 'Action meets wisdom — a powerful force when channelled together.' },
  { planets: ['Sun', 'Jupiter'],    harmony: 90, desc: 'Two luminaries of expansion — your relationship radiates light.' },
  { planets: ['Moon', 'Mercury'],   harmony: 80, desc: 'Heart and mind in dialogue — emotional intelligence defines you two.' },
  { planets: ['Mars', 'Venus'],     harmony: 85, desc: 'The cosmic dance of masculine and feminine energies — magnetic attraction.' },
  { planets: ['Saturn', 'Jupiter'], harmony: 72, desc: 'Discipline meets expansion — you temper and amplify each other.' },
  { planets: ['Mercury', 'Venus'],  harmony: 88, desc: 'Beautiful communication and shared aesthetics — a mentally stimulating love.' },
]

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

const RELATIONSHIP_LABELS: Array<{ min: number; max: number; label: string; color: string; emoji: string; desc: string }> = [
  { min: 0,  max: 29, label: 'Challenging',  color: 'text-red-400',    emoji: '🌊', desc: 'Significant differences create both friction and transformative growth.' },
  { min: 30, max: 49, label: 'Compatible',   color: 'text-amber-400',  emoji: '🌤', desc: 'A workable connection with some areas needing conscious cultivation.' },
  { min: 50, max: 69, label: 'Harmonious',   color: 'text-yellow-300', emoji: '🌟', desc: 'Natural ease and mutual understanding flow between your energies.' },
  { min: 70, max: 84, label: 'Magnetic',     color: 'text-emerald-400',emoji: '💚', desc: 'Strong cosmic attraction and complementary energies align beautifully.' },
  { min: 85, max: 94, label: 'Soulmates',    color: 'text-violet-400', emoji: '💜', desc: 'Deep karmic resonance — your souls recognise each other across lifetimes.' },
  { min: 95, max: 100,label: 'Twin Flames',  color: 'text-pink-400',   emoji: '🔥', desc: 'Rare cosmic convergence — you mirror and complete each other perfectly.' },
]

const FUN_DESCRIPTIONS: string[] = [
  'Your cosmic energies create a {p1}-{p2} dance of wisdom and beauty!',
  'The stars whisper that {p1} and {p2} energies are destined to intertwine.',
  'Ancient Vedic charts reveal a {p1}-{p2} harmony written in the celestial sphere.',
  'Your combined aura resonates with the sacred vibration of {p1} and {p2}.',
  'The universe conspired for eons to bring {p1} and {p2} energies together.',
  'Two cosmic rivers — {p1} and {p2} — merging into an ocean of possibility.',
]

// ─── Deterministic compatibility engine ───────────────────────────────────

function nameToSeed(name: string): number {
  return name.toLowerCase().split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

interface CosmicMatchResult {
  percentage: number
  element1: string
  element2: string
  elementCompat: { score: number; desc: string }
  planetPair: { planets: [string, string]; harmony: number; desc: string }
  label: { min: number; max: number; label: string; color: string; emoji: string; desc: string }
  funDescription: string
}

function computeMatch(name1: string, name2: string): CosmicMatchResult {
  const s1 = nameToSeed(name1)
  const s2 = nameToSeed(name2)
  const combined = s1 + s2

  // Element from seed
  const el1 = ELEMENTS[s1 % ELEMENTS.length]
  const el2 = ELEMENTS[s2 % ELEMENTS.length]
  const elementCompat = ELEMENT_COMPAT[el1][el2]

  // Planet pair
  const planetPair = PLANET_PAIRS[combined % PLANET_PAIRS.length]

  // Percentage: weighted blend
  const base = elementCompat.score * 0.5 + planetPair.harmony * 0.5
  // Vary slightly by seed so same element pair gives different results
  const variance = (combined * 7) % 11 - 5
  const percentage = Math.max(28, Math.min(100, Math.round(base + variance)))

  const label = RELATIONSHIP_LABELS.find((l) => percentage >= l.min && percentage <= l.max)!

  // Fun description
  const descTemplate = FUN_DESCRIPTIONS[combined % FUN_DESCRIPTIONS.length]
  const funDescription = descTemplate
    .replace('{p1}', planetPair.planets[0])
    .replace('{p2}', planetPair.planets[1])

  return { percentage, element1: el1, element2: el2, elementCompat, planetPair, label, funDescription }
}

// ─── Result Display ────────────────────────────────────────────────────────

function MatchResult({
  name1,
  name2,
  result,
  onReset,
}: {
  name1: string
  name2: string
  result: CosmicMatchResult
  onReset: () => void
}) {
  const { percentage, element1, element2, elementCompat, planetPair, label, funDescription } = result

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Score ring */}
      <div className="flex flex-col items-center py-4">
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full blur-md opacity-30 bg-gradient-to-br from-saffron to-gold`} />
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,179,71,0.1)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="url(#matchGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - percentage / 100) }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
              />
              <defs>
                <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FFB347" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-cinzel font-bold text-gold-gradient">{percentage}%</span>
              <span className="text-[8px] font-cinzel text-slate-500 uppercase tracking-wider">cosmic match</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <div className={`font-cinzel font-bold text-lg ${label.color}`}>
            {label.emoji} {label.label}
          </div>
          <p className="font-cormorant text-slate-400 text-sm mt-1 max-w-xs text-center">
            {label.desc}
          </p>
        </div>
      </div>

      {/* Names */}
      <div className="flex items-center justify-center gap-3">
        <span className="font-cinzel text-sm text-white font-semibold truncate max-w-[100px]">{name1}</span>
        <Heart size={14} className="text-rose-400 fill-rose-400 flex-shrink-0" />
        <span className="font-cinzel text-sm text-white font-semibold truncate max-w-[100px]">{name2}</span>
      </div>

      {/* Fun description */}
      <div className="bg-violet-500/10 border border-violet-500/25 rounded-xl p-3 text-center">
        <p className="font-cormorant text-violet-300 text-base italic leading-snug">
          ✦ {funDescription}
        </p>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Element match */}
        <div className="bg-stardust/40 border border-stardust/80 rounded-xl p-3">
          <div className="text-[9px] font-cinzel text-slate-500 uppercase tracking-wider mb-1">Elements</div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-lg">{ELEMENT_EMOJIS[element1]}</span>
            <span className="text-xs font-cinzel text-slate-400">{element1}</span>
            <span className="text-slate-600 text-xs mx-1">+</span>
            <span className="text-lg">{ELEMENT_EMOJIS[element2]}</span>
            <span className="text-xs font-cinzel text-slate-400">{element2}</span>
          </div>
          <p className="font-cormorant text-slate-400 text-xs leading-snug">{elementCompat.desc}</p>
        </div>

        {/* Planet harmony */}
        <div className="bg-stardust/40 border border-stardust/80 rounded-xl p-3">
          <div className="text-[9px] font-cinzel text-slate-500 uppercase tracking-wider mb-1">Planet Harmony</div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-xs font-cinzel text-amber-300">{planetPair.planets[0]}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs font-cinzel text-pink-300">{planetPair.planets[1]}</span>
          </div>
          <p className="font-cormorant text-slate-400 text-xs leading-snug">{planetPair.desc}</p>
        </div>
      </div>

      {/* CTA to full compatibility */}
      <Link
        to="/compatibility"
        className="flex items-center justify-between w-full p-3 rounded-xl bg-gradient-to-r from-saffron/10 to-gold/10 border border-gold/25 hover:border-gold/50 transition-all duration-300 group"
      >
        <div>
          <div className="font-cinzel text-xs font-bold text-gold">Get Full Kundli Milan →</div>
          <div className="font-cormorant text-slate-500 text-xs mt-0.5">
            36-point Ashta Kuta analysis with Dosha check
          </div>
        </div>
        <ChevronRight size={14} className="text-gold/50 group-hover:text-gold transition-colors flex-shrink-0" />
      </Link>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-cinzel text-slate-500 hover:text-slate-300 transition-colors"
      >
        <RefreshCw size={11} />
        Try another match
      </button>
    </motion.div>
  )
}

// ─── Main CosmicMatch Component ────────────────────────────────────────────

export default function CosmicMatch() {
  const { user } = useStore()
  const [name2, setName2] = useState('')
  const [result, setResult] = useState<CosmicMatchResult | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const userName = user?.fullName || user?.username || 'Cosmic Seeker'

  const handleSubmit = useCallback(() => {
    if (name2.trim().length < 2) return
    setIsAnimating(true)
    setTimeout(() => {
      setResult(computeMatch(userName, name2.trim()))
      setIsAnimating(false)
    }, 800)
  }, [userName, name2])

  const handleReset = useCallback(() => {
    setResult(null)
    setName2('')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Star size={15} className="text-gold" />
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400/60"
          />
        </div>
        <h3 className="font-cinzel text-sm font-bold text-gold uppercase tracking-wider">
          Cosmic Match
        </h3>
        <span className="ml-auto text-[9px] font-cinzel text-slate-600 uppercase tracking-wider">Fun Teaser</span>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <MatchResult
            key="result"
            name1={userName}
            name2={name2}
            result={result}
            onReset={handleReset}
          />
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Animation header */}
            <div className="flex flex-col items-center py-3">
              <motion.div
                className="relative"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="text-5xl">💫</div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 text-xl"
                >
                  ✨
                </motion.div>
              </motion.div>
              <p className="font-cinzel text-sm text-slate-400 mt-3 text-center">
                Who is your cosmic match?
              </p>
              <p className="font-cormorant text-slate-500 text-sm text-center mt-1">
                Enter a name to reveal your celestial compatibility
              </p>
            </div>

            {/* Your name */}
            <div>
              <label className="block text-[9px] font-cinzel text-slate-500 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <div className="px-3 py-2.5 rounded-xl bg-stardust/30 border border-stardust/60 font-cinzel text-sm text-gold/80">
                {userName}
              </div>
            </div>

            {/* Their name input */}
            <div>
              <label className="block text-[9px] font-cinzel text-slate-500 uppercase tracking-wider mb-1.5">
                Their Name
              </label>
              <input
                type="text"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter a name…"
                className="w-full px-3 py-2.5 rounded-xl bg-stardust/40 border border-stardust/80 text-slate-200 font-cinzel text-sm placeholder-slate-600 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={name2.trim().length < 2 || isAnimating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-saffron to-gold text-cosmos font-cinzel font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isAnimating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={14} />
                  </motion.div>
                  <span>Reading the cosmos…</span>
                </>
              ) : (
                <>
                  <Heart size={14} />
                  <span>Reveal Cosmic Match</span>
                </>
              )}
            </button>

            <p className="text-[9px] font-cinzel text-slate-600 text-center">
              For a serious compatibility reading, use full{' '}
              <Link to="/compatibility" className="text-gold/60 hover:text-gold transition-colors underline-offset-2 underline">
                Kundli Milan ↗
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
