import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, TarotReading } from '@/store'
import { generateId } from '@/utils/generateId'
import { Search, ChevronLeft, BookOpen, Zap, Star, Clock, X, RefreshCw, ChevronRight, Layers } from 'lucide-react'

// ─── Complete Tarot Deck ───────────────────────────────────────────────────

export interface TarotCardDef {
  id: number
  name: string
  arcana: 'Major' | 'Minor'
  suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | null
  number: number | null
  element: string | null
  astro: string
  keywords: string[]
  uprightMeaning: string
  reversedMeaning: string
  color: string
  symbol: string
}

const MAJOR_ARCANA: TarotCardDef[] = [
  { id: 0, name: 'The Fool', arcana: 'Major', suit: null, number: 0, element: 'Air', astro: 'Uranus', keywords: ['New beginnings', 'Innocence', 'Adventure', 'Freedom'], uprightMeaning: 'New beginnings, innocence, spontaneity, a free spirit. Leap of faith into the unknown.', reversedMeaning: 'Recklessness, risk-taking without thought, naivety causing harm.', color: '#7DF9FF', symbol: '0' },
  { id: 1, name: 'The Magician', arcana: 'Major', suit: null, number: 1, element: 'Air', astro: 'Mercury', keywords: ['Willpower', 'Skill', 'Manifestation', 'Resourcefulness'], uprightMeaning: 'Manifestation, resourcefulness, power, inspired action. You have all the tools you need.', reversedMeaning: 'Manipulation, poor planning, untapped talents.', color: '#FFB347', symbol: '∞' },
  { id: 2, name: 'The High Priestess', arcana: 'Major', suit: null, number: 2, element: 'Water', astro: 'Moon', keywords: ['Intuition', 'Mystery', 'Subconscious', 'Inner voice'], uprightMeaning: 'Intuition, sacred knowledge, the divine feminine, the inner voice. Trust what you feel.', reversedMeaning: 'Secrets, disconnected from intuition, withdrawal.', color: '#C0C0FF', symbol: '☾' },
  { id: 3, name: 'The Empress', arcana: 'Major', suit: null, number: 3, element: 'Earth', astro: 'Venus', keywords: ['Fertility', 'Nurturing', 'Abundance', 'Beauty'], uprightMeaning: 'Femininity, beauty, nature, nurturing, abundance. Creation and fertility in all forms.', reversedMeaning: 'Creative block, dependence, smothering.', color: '#FFB6C1', symbol: '♀' },
  { id: 4, name: 'The Emperor', arcana: 'Major', suit: null, number: 4, element: 'Fire', astro: 'Aries', keywords: ['Authority', 'Structure', 'Father figure', 'Control'], uprightMeaning: 'Authority, establishment, structure, father figure. Stability built through discipline.', reversedMeaning: 'Domination, rigidity, lack of discipline.', color: '#FF6B6B', symbol: '♈' },
  { id: 5, name: 'The Hierophant', arcana: 'Major', suit: null, number: 5, element: 'Earth', astro: 'Taurus', keywords: ['Tradition', 'Conformity', 'Guidance', 'Belief'], uprightMeaning: 'Spiritual wisdom, religious beliefs, conformity, tradition, institutions.', reversedMeaning: 'Personal beliefs, freedom, challenging the status quo.', color: '#9B87F5', symbol: '⋈' },
  { id: 6, name: 'The Lovers', arcana: 'Major', suit: null, number: 6, element: 'Air', astro: 'Gemini', keywords: ['Love', 'Union', 'Choice', 'Alignment'], uprightMeaning: 'Love, harmony, relationships, values alignment, choices from the heart.', reversedMeaning: 'Disharmony, imbalance, misalignment of values.', color: '#FFB6C1', symbol: '♡' },
  { id: 7, name: 'The Chariot', arcana: 'Major', suit: null, number: 7, element: 'Water', astro: 'Cancer', keywords: ['Control', 'Willpower', 'Victory', 'Determination'], uprightMeaning: 'Control, willpower, success, action, determination. Harnessing opposing forces.', reversedMeaning: 'Self-discipline lost, aggression, lack of direction.', color: '#FFD700', symbol: '⊕' },
  { id: 8, name: 'Strength', arcana: 'Major', suit: null, number: 8, element: 'Fire', astro: 'Leo', keywords: ['Courage', 'Inner strength', 'Compassion', 'Influence'], uprightMeaning: 'Strength, courage, patience, control, compassion. The lion tamed by love, not force.', reversedMeaning: 'Inner weakness, self-doubt, raw emotion.', color: '#FF8C00', symbol: '∞' },
  { id: 9, name: 'The Hermit', arcana: 'Major', suit: null, number: 9, element: 'Earth', astro: 'Virgo', keywords: ['Soul-searching', 'Introspection', 'Guidance', 'Solitude'], uprightMeaning: 'Soul-searching, introspection, being alone, inner guidance. The lantern lights your path.', reversedMeaning: 'Isolation, loneliness, withdrawal.', color: '#888', symbol: '⎊' },
  { id: 10, name: 'Wheel of Fortune', arcana: 'Major', suit: null, number: 10, element: 'Fire', astro: 'Jupiter', keywords: ['Luck', 'Karma', 'Destiny', 'Cycles'], uprightMeaning: 'Good luck, karma, life cycles, destiny, turning point. The wheel always turns.', reversedMeaning: 'Bad luck, resistance to change, breaking cycles.', color: '#FFD700', symbol: '⊗' },
  { id: 11, name: 'Justice', arcana: 'Major', suit: null, number: 11, element: 'Air', astro: 'Libra', keywords: ['Justice', 'Truth', 'Cause and effect', 'Law'], uprightMeaning: 'Justice, fairness, truth, cause and effect, law. Balance will be restored.', reversedMeaning: 'Unfairness, lack of accountability, dishonesty.', color: '#7DF9FF', symbol: '⚖' },
  { id: 12, name: 'The Hanged Man', arcana: 'Major', suit: null, number: 12, element: 'Water', astro: 'Neptune', keywords: ['Pause', 'Surrender', 'New perspective', 'Letting go'], uprightMeaning: 'Pause, surrender, letting go, new perspectives. Willing suspension unlocks insight.', reversedMeaning: 'Delays, resistance, stalling, martyrdom.', color: '#38BDF8', symbol: '⊢' },
  { id: 13, name: 'Death', arcana: 'Major', suit: null, number: 13, element: 'Water', astro: 'Scorpio', keywords: ['Endings', 'Change', 'Transformation', 'Transition'], uprightMeaning: 'Endings, change, transformation, transition. Death of the old self births the new.', reversedMeaning: 'Resistance to change, inability to move on.', color: '#4A0080', symbol: '☠' },
  { id: 14, name: 'Temperance', arcana: 'Major', suit: null, number: 14, element: 'Fire', astro: 'Sagittarius', keywords: ['Balance', 'Moderation', 'Patience', 'Alchemy'], uprightMeaning: 'Balance, moderation, patience, purpose, alchemy. Blending seeming opposites into gold.', reversedMeaning: 'Imbalance, excess, self-healing needed.', color: '#38BDF8', symbol: '△' },
  { id: 15, name: 'The Devil', arcana: 'Major', suit: null, number: 15, element: 'Earth', astro: 'Capricorn', keywords: ['Shadow self', 'Attachment', 'Addiction', 'Materialism'], uprightMeaning: 'Shadow self, attachment, addiction, restriction. The chains you can remove yourself.', reversedMeaning: 'Release, exploring dark thoughts, detachment.', color: '#660000', symbol: '♑' },
  { id: 16, name: 'The Tower', arcana: 'Major', suit: null, number: 16, element: 'Fire', astro: 'Mars', keywords: ['Sudden change', 'Upheaval', 'Revelation', 'Awakening'], uprightMeaning: 'Sudden change, upheaval, chaos, revelation, awakening. Lightning clears the old.', reversedMeaning: 'Personal transformation, fear of change, averting disaster.', color: '#FF4444', symbol: '⚡' },
  { id: 17, name: 'The Star', arcana: 'Major', suit: null, number: 17, element: 'Air', astro: 'Aquarius', keywords: ['Hope', 'Faith', 'Renewal', 'Inspiration'], uprightMeaning: 'Hope, faith, renewal, inspiration, serenity. Guiding light after the storm.', reversedMeaning: 'Despair, discouragement, lack of faith.', color: '#38BDF8', symbol: '★' },
  { id: 18, name: 'The Moon', arcana: 'Major', suit: null, number: 18, element: 'Water', astro: 'Pisces', keywords: ['Illusion', 'Fear', 'The unconscious', 'Confusion'], uprightMeaning: 'Illusion, fear, the unconscious, confusion. The path through darkness illumined by moonlight.', reversedMeaning: 'Release of fear, repressed emotion, inner confusion.', color: '#C0C0FF', symbol: '☽' },
  { id: 19, name: 'The Sun', arcana: 'Major', suit: null, number: 19, element: 'Fire', astro: 'Sun', keywords: ['Joy', 'Success', 'Positivity', 'Vitality'], uprightMeaning: 'Joy, success, celebration, positivity, vitality. Radiant clarity lights your path.', reversedMeaning: 'Inner child blocked, pessimism, sadness.', color: '#FFD700', symbol: '☀' },
  { id: 20, name: 'Judgement', arcana: 'Major', suit: null, number: 20, element: 'Fire', astro: 'Pluto', keywords: ['Rebirth', 'Inner calling', 'Absolution', 'Reflection'], uprightMeaning: 'Rebirth, inner calling, absolution. A cosmic trumpet sounds your awakening.', reversedMeaning: 'Self-doubt, refusal of self-examination, ignoring the call.', color: '#FF8C00', symbol: '☆' },
  { id: 21, name: 'The World', arcana: 'Major', suit: null, number: 21, element: 'Earth', astro: 'Saturn', keywords: ['Completion', 'Integration', 'Accomplishment', 'Travel'], uprightMeaning: 'Completion, integration, accomplishment, travel. The dance of wholeness.', reversedMeaning: 'Incompletion, no closure, shortcuts.', color: '#9B87F5', symbol: '◎' },
]

// Generate Minor Arcana (56 cards)
function generateMinorArcana(): TarotCardDef[] {
  const suits = [
    { name: 'Wands' as const, element: 'Fire', astro: 'Aries/Leo/Sagittarius', color: '#FF6B6B', baseId: 22 },
    { name: 'Cups' as const, element: 'Water', astro: 'Cancer/Scorpio/Pisces', color: '#38BDF8', baseId: 36 },
    { name: 'Swords' as const, element: 'Air', astro: 'Gemini/Libra/Aquarius', color: '#C084FC', baseId: 50 },
    { name: 'Pentacles' as const, element: 'Earth', astro: 'Taurus/Virgo/Capricorn', color: '#4ADE80', baseId: 64 },
  ]

  const cards: TarotCardDef[] = []
  const courtNames = ['Page', 'Knight', 'Queen', 'King']
  const courtKeywords: Record<string, string[][]> = {
    Wands: [['Enthusiasm', 'Exploration', 'Fresh energy'], ['Adventure', 'Energy', 'Action'], ['Passion', 'Vibrancy', 'Courage'], ['Leadership', 'Vision', 'Bold']],
    Cups: [['Creativity', 'Dreaming', 'Sensitivity'], ['Romance', 'Charm', 'Imagination'], ['Empathy', 'Nurturing', 'Healing'], ['Emotional mastery', 'Calm', 'Wisdom']],
    Swords: [['Curiosity', 'Logic', 'Communication'], ['Conflict', 'Intellect', 'Speed'], ['Independence', 'Strategy', 'Clarity'], ['Authority', 'Truth', 'Ethics']],
    Pentacles: [['Diligence', 'Learning', 'Opportunity'], ['Skill', 'Ambition', 'Loyalty'], ['Practicality', 'Nurturing', 'Generosity'], ['Wealth', 'Stability', 'Discipline']],
  }

  for (const suit of suits) {
    for (let n = 1; n <= 10; n++) {
      cards.push({
        id: suit.baseId + n - 1,
        name: n === 1 ? `Ace of ${suit.name}` : `${n} of ${suit.name}`,
        arcana: 'Minor', suit: suit.name, number: n,
        element: suit.element, astro: suit.astro,
        keywords: ['Potential', 'Beginning', 'Spark'],
        uprightMeaning: `The ${n === 1 ? 'pure essence and beginning' : 'energy'} of ${suit.name.toLowerCase()}.`,
        reversedMeaning: `Blocked or delayed ${suit.name.toLowerCase()} energy.`,
        color: suit.color, symbol: n.toString()
      })
    }
    for (let c = 0; c < 4; c++) {
      cards.push({
        id: suit.baseId + 10 + c,
        name: `${courtNames[c]} of ${suit.name}`,
        arcana: 'Minor', suit: suit.name, number: 11 + c,
        element: suit.element, astro: suit.astro,
        keywords: courtKeywords[suit.name][c],
        uprightMeaning: `The ${courtNames[c]} of ${suit.name} brings ${courtKeywords[suit.name][c][0].toLowerCase()}.`,
        reversedMeaning: `Blocked ${courtNames[c].toLowerCase()} qualities of ${suit.name.toLowerCase()}.`,
        color: suit.color, symbol: courtNames[c][0]
      })
    }
  }
  return cards
}

const FULL_DECK: TarotCardDef[] = [...MAJOR_ARCANA, ...generateMinorArcana()]

// ─── Spread Configurations ─────────────────────────────────────────────────

interface SpreadConfig {
  id: string
  name: string
  cardCount: number
  positions: string[]
  description: string
  icon: string
  xp: number
}

const SPREADS: SpreadConfig[] = [
  { id: 'single', name: 'Single Card', cardCount: 1, positions: ["Today's Message"], description: 'One card reveals the energy of the moment.', icon: '✦', xp: 20 },
  { id: 'three', name: 'Three Cards', cardCount: 3, positions: ['Past', 'Present', 'Future'], description: 'Journey through time: what shaped you, where you stand, what awaits.', icon: '✦✦✦', xp: 30 },
  { id: 'celtic', name: 'Celtic Cross', cardCount: 10, positions: ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Advice', 'External', 'Hopes & Fears', 'Outcome'], description: 'The most complete tarot spread revealing every dimension of your situation.', icon: '✝', xp: 60 },
  { id: 'navagraha', name: 'Navagraha Spread', cardCount: 9, positions: ['Sun (Soul)', 'Moon (Mind)', 'Mars (Energy)', 'Mercury (Intellect)', 'Jupiter (Wisdom)', 'Venus (Love)', 'Saturn (Karma)', 'Rahu (Desires)', 'Ketu (Release)'], description: 'A unique fusion of tarot and Vedic astrology through the 9 planetary energies.', icon: '🪐', xp: 50 },
]

// ─── Deterministic daily card ─────────────────────────────────────────────

function getDailyCard(date: Date): TarotCardDef {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  return FULL_DECK[seed % FULL_DECK.length]
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getSpreadCards(spread: SpreadConfig, date: Date): { card: TarotCardDef; position: string; reversed: boolean }[] {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + spread.cardCount * 7
  const shuffled = seededShuffle(FULL_DECK, seed)
  return spread.positions.map((pos, i) => ({
    card: shuffled[i % shuffled.length],
    position: pos,
    reversed: ((seed + i * 13) % 4) === 0,
  }))
}

// ─── Card Visual Components ─────────────────────────────────────────────────

function CardFace({ card, reversed = false, size = 'md' }: { card: TarotCardDef; reversed?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-36 h-56' : size === 'sm' ? 'w-16 h-24' : 'w-24 h-36'
  const isMajor = card.arcana === 'Major'

  return (
    <div
      className={`${dims} relative rounded-xl overflow-hidden flex-shrink-0`}
      style={{
        transform: reversed ? 'rotate(180deg)' : undefined,
        background: `linear-gradient(145deg, ${card.color}22, ${card.color}11)`,
        border: `1px solid ${isMajor ? card.color + '99' : card.color + '44'}`,
        boxShadow: isMajor ? `0 0 20px ${card.color}33` : undefined,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ background: isMajor ? `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` : `${card.color}44` }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <div className="text-2xl font-cinzel font-bold"
          style={{ color: card.color, fontSize: size === 'lg' ? '2.5rem' : size === 'sm' ? '1rem' : '1.5rem' }}
        >{card.symbol}</div>
        {size !== 'sm' && (
          <div className="text-center px-1 font-cinzel leading-tight"
            style={{ color: card.color, fontSize: size === 'lg' ? '0.65rem' : '0.5rem', opacity: 0.9 }}
          >{card.name}</div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{ background: isMajor ? `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` : `${card.color}44` }}
      />
      {size !== 'sm' && (
        <>
          <div className="absolute top-1.5 left-1.5 text-xs" style={{ color: card.color + '88', fontSize: '0.4rem', fontFamily: 'Cinzel' }}>
            {card.arcana === 'Major' ? 'M' : card.suit?.[0]}
          </div>
          <div className="absolute bottom-1.5 right-1.5 text-xs rotate-180" style={{ color: card.color + '88', fontSize: '0.4rem', fontFamily: 'Cinzel' }}>
            {card.arcana === 'Major' ? 'M' : card.suit?.[0]}
          </div>
        </>
      )}
    </div>
  )
}

function CardBack({ size = 'md', width, height }: { size?: 'sm' | 'md' | 'lg'; width?: number; height?: number }) {
  const dims = size === 'lg' ? 'w-36 h-56' : size === 'sm' ? 'w-16 h-24' : 'w-24 h-36'
  const style: React.CSSProperties = {
    background: 'linear-gradient(145deg, #061628, #0D2137)',
    border: '1px solid rgba(255,179,71,0.3)',
  }
  if (width && height) {
    style.width = width
    style.height = height
  }
  return (
    <div className={`${width ? '' : dims} rounded-xl overflow-hidden flex-shrink-0 relative`} style={style}>
      <svg width="100%" height="100%" viewBox="0 0 100 160" preserveAspectRatio="none" className="absolute inset-0">
        <defs>
          <pattern id="bp" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M5,0 L10,5 L5,10 L0,5 Z" fill="none" stroke="rgba(255,179,71,0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="160" fill="url(#bp)"/>
        <rect x="8" y="8" width="84" height="144" rx="4" fill="none" stroke="rgba(255,179,71,0.2)" strokeWidth="1"/>
        <text x="50" y="85" textAnchor="middle" fill="rgba(255,179,71,0.4)" fontSize="24" fontFamily="serif">✦</text>
      </svg>
    </div>
  )
}

// ─── Flip Card Component ────────────────────────────────────────────────────

interface FlipCardProps {
  card: TarotCardDef
  reversed: boolean
  isFlipped: boolean
  onClick: () => void
  width?: number
  height?: number
  rotate?: number
}

function FlipCard({ card, reversed, isFlipped, onClick, width = 100, height = 174, rotate = 0 }: FlipCardProps) {
  return (
    <div
      className="tarot-card-wrapper cursor-pointer"
      style={{ width, height, transform: `rotate(${rotate}deg)` }}
      onClick={onClick}
    >
      <div className={`tarot-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%' }}>
        {/* tarot-card-front = face DOWN (back of physical card) */}
        <div className="tarot-card-front">
          <CardBack size="md" width={width} height={height} />
        </div>
        {/* tarot-card-back = face UP (front of physical card, revealed) */}
        <div className="tarot-card-back">
          <div
            className="rounded-xl overflow-hidden relative"
            style={{
              width,
              height,
              transform: reversed ? 'rotate(180deg)' : undefined,
              background: `linear-gradient(145deg, ${card.color}22, ${card.color}11)`,
              border: `1px solid ${card.arcana === 'Major' ? card.color + '99' : card.color + '44'}`,
              boxShadow: card.arcana === 'Major' ? `0 0 20px ${card.color}44` : undefined,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
              style={{ background: `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
              <div className="font-cinzel font-bold" style={{ color: card.color, fontSize: width > 120 ? '2.2rem' : '1.4rem' }}>
                {card.symbol}
              </div>
              <div className="text-center font-cinzel leading-tight" style={{ color: card.color, fontSize: width > 120 ? '0.6rem' : '0.45rem', opacity: 0.9 }}>
                {card.name}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
              style={{ background: `linear-gradient(90deg, ${card.color}88, ${card.color}ff, ${card.color}88)` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card Detail Drawer ────────────────────────────────────────────────────

interface CardDetailDrawerProps {
  item: { card: TarotCardDef; position: string; reversed: boolean } | null
  planetContext?: string
  onClose: () => void
}

function CardDetailDrawer({ item, planetContext, onClose }: CardDetailDrawerProps) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-cosmos/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-nebula border-l border-stardust/40 overflow-y-auto"
          >
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CardFace card={item.card} reversed={item.reversed} size="md" />
                  <div>
                    <h3 className="font-cinzel text-lg" style={{ color: item.card.color }}>
                      {item.card.name}
                    </h3>
                    {item.reversed && <div className="text-xs text-rose-400 font-cinzel">↕ Reversed</div>}
                    <div className="text-xs text-slate-400 font-cinzel mt-0.5">{item.position}</div>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-200 mt-1">
                  <X size={18} />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">
                  {item.card.arcana === 'Major' ? 'Major Arcana' : `${item.card.suit} · Minor`}
                </span>
                {item.card.astro && (
                  <span className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">
                    {item.card.astro}
                  </span>
                )}
                {item.card.element && (
                  <span className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">
                    {item.card.element}
                  </span>
                )}
              </div>

              {/* Keywords */}
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-2">Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.card.keywords.map(k => (
                    <span key={k} className="text-xs bg-gold/10 border border-gold/20 text-gold/80 px-2 py-0.5 rounded-full font-cinzel">{k}</span>
                  ))}
                </div>
              </div>

              {/* Meaning */}
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">
                  {item.reversed ? 'Reversed Meaning' : 'Upright Meaning'}
                </div>
                <p className="font-cormorant text-slate-200 text-base leading-relaxed">
                  {item.reversed ? item.card.reversedMeaning : item.card.uprightMeaning}
                </p>
              </div>

              {/* Both meanings */}
              <div className="space-y-3 pt-2 border-t border-stardust/30">
                <div>
                  <div className="text-xs font-cinzel text-emerald-400/70 uppercase tracking-wider mb-1">Upright</div>
                  <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{item.card.uprightMeaning}</p>
                </div>
                <div>
                  <div className="text-xs font-cinzel text-rose-400/70 uppercase tracking-wider mb-1">Reversed</div>
                  <p className="font-cormorant text-slate-400 text-sm leading-relaxed">{item.card.reversedMeaning}</p>
                </div>
              </div>

              {/* Planet context for Navagraha */}
              {planetContext && (
                <div className="glass-card p-3 border border-gold/20">
                  <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">Planetary Interpretation</div>
                  <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{planetContext}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Spread Layout Components ──────────────────────────────────────────────

const NAVAGRAHA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
const NAVAGRAHA_COLORS: Record<string, string> = {
  Sun: '#FFB347', Moon: '#C0C0FF', Mars: '#FF6B6B', Mercury: '#7DF9FF',
  Jupiter: '#FFD700', Venus: '#FFB6C1', Saturn: '#9B87F5', Rahu: '#888', Ketu: '#A0522D'
}

function getNavagrahaContext(position: string, card: TarotCardDef, reversed: boolean): string {
  const planet = position.split(' ')[0]
  const meaning = reversed ? card.reversedMeaning : card.uprightMeaning
  const contexts: Record<string, string> = {
    Sun: 'In the Sun position, this card speaks to your soul\'s core purpose, vitality, and how you shine your authentic self in the world.',
    Moon: 'In the Moon position, this card reveals your emotional landscape, subconscious patterns, and the intuitive currents running beneath your daily life.',
    Mars: 'In the Mars position, this card illuminates your drive, ambition, courage, and how you channel your energy toward your desires.',
    Mercury: 'In the Mercury position, this card speaks to your communication style, mental agility, and the way you process and share ideas.',
    Jupiter: 'In the Jupiter position, this card reflects your wisdom, philosophy, spiritual growth, and the blessings coming your way.',
    Venus: 'In the Venus position, this card reveals your relationship with love, beauty, pleasure, and material abundance.',
    Saturn: 'In the Saturn position, this card speaks to your karmic lessons, discipline, the structures you must build, and debts to be repaid.',
    Rahu: 'In the Rahu position, this card reveals your worldly desires, obsessions, and the karmic direction your soul craves in this lifetime.',
    Ketu: 'In the Ketu position, this card illuminates what you must release, past-life wisdom you carry, and your path toward spiritual liberation.',
  }
  return `${contexts[planet] || ''} The card ${card.name} ${reversed ? '(reversed) ' : ''}suggests: ${meaning}`
}

interface SpreadLayoutProps {
  spread: SpreadConfig
  cards: { card: TarotCardDef; position: string; reversed: boolean }[]
  flipped: Set<number>
  onFlip: (idx: number) => void
  onCardClick: (idx: number) => void
}

function SingleSpreadLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <FlipCard
        card={cards[0].card}
        reversed={cards[0].reversed}
        isFlipped={flipped.has(0)}
        onClick={() => flipped.has(0) ? onCardClick(0) : onFlip(0)}
        width={160}
        height={280}
      />
      <div className="text-center">
        <div className="text-xs font-cinzel text-gold/60">{cards[0].position}</div>
        {flipped.has(0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-sm font-cinzel mt-1" style={{ color: cards[0].card.color }}>{cards[0].card.name}</div>
            {cards[0].reversed && <div className="text-xs text-rose-400">↕ Reversed</div>}
            <div className="text-xs text-slate-500 mt-1 font-cormorant">Click to see full meaning</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ThreeCardSpreadLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end gap-4 sm:gap-6">
        {cards.map((item, idx) => {
          const isCenter = idx === 1
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <FlipCard
                card={item.card}
                reversed={item.reversed}
                isFlipped={flipped.has(idx)}
                onClick={() => flipped.has(idx) ? onCardClick(idx) : onFlip(idx)}
                width={isCenter ? 120 : 100}
                height={isCenter ? 210 : 174}
              />
              <div className="text-center max-w-20">
                <div className="text-xs font-cinzel text-gold/60">{item.position}</div>
                {flipped.has(idx) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-xs font-cinzel mt-1" style={{ color: item.card.color }}>{item.card.name}</div>
                    {item.reversed && <div className="text-xs text-rose-400">↕</div>}
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CelticCrossLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  // Standard Celtic Cross positions: 0=center, 1=crossing(rotated), 2=below, 3=left, 4=above, 5=right, 6-9=staff right column (bottom to top)
  const cw = 80
  const ch = 140

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[520px] relative mx-auto" style={{ height: 560 }}>
        {/* Cross section */}
        {/* Position 5 - Above (top center) */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 120, top: 20 }}>
          <FlipCard card={cards[4].card} reversed={cards[4].reversed} isFlipped={flipped.has(4)}
            onClick={() => flipped.has(4) ? onCardClick(4) : onFlip(4)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center">{cards[4].position}</div>
        </div>

        {/* Position 2 - Below (bottom center) */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 120, top: 310 }}>
          <FlipCard card={cards[5].card} reversed={cards[5].reversed} isFlipped={flipped.has(5)}
            onClick={() => flipped.has(5) ? onCardClick(5) : onFlip(5)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center">{cards[5].position}</div>
        </div>

        {/* Position 4 - Left */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 20, top: 175 }}>
          <FlipCard card={cards[3].card} reversed={cards[3].reversed} isFlipped={flipped.has(3)}
            onClick={() => flipped.has(3) ? onCardClick(3) : onFlip(3)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center max-w-20">{cards[3].position}</div>
        </div>

        {/* Position 6 - Right */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 220, top: 175 }}>
          <FlipCard card={cards[2].card} reversed={cards[2].reversed} isFlipped={flipped.has(2)}
            onClick={() => flipped.has(2) ? onCardClick(2) : onFlip(2)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center max-w-20">{cards[2].position}</div>
        </div>

        {/* Position 0 - Center card */}
        <div className="absolute flex flex-col items-center gap-1" style={{ left: 120, top: 175 }}>
          <FlipCard card={cards[0].card} reversed={cards[0].reversed} isFlipped={flipped.has(0)}
            onClick={() => flipped.has(0) ? onCardClick(0) : onFlip(0)} width={cw} height={ch} />
          <div className="text-xs font-cinzel text-gold/50 text-center">{cards[0].position}</div>
        </div>

        {/* Position 1 - Crossing card (rotated 90deg) */}
        <div className="absolute" style={{ left: 120 + (cw - ch) / 2, top: 175 + (ch - cw) / 2 }}>
          <FlipCard card={cards[1].card} reversed={cards[1].reversed} isFlipped={flipped.has(1)}
            onClick={() => flipped.has(1) ? onCardClick(1) : onFlip(1)} width={ch} height={cw} rotate={0} />
        </div>

        {/* Staff column (right side) - positions 6,7,8,9 from bottom to top */}
        {[9, 8, 7, 6].map((cardIdx, i) => (
          <div key={cardIdx} className="absolute flex flex-col items-center gap-1" style={{ left: 340, top: 20 + i * (ch + 20) }}>
            <FlipCard card={cards[cardIdx].card} reversed={cards[cardIdx].reversed} isFlipped={flipped.has(cardIdx)}
              onClick={() => flipped.has(cardIdx) ? onCardClick(cardIdx) : onFlip(cardIdx)} width={cw} height={ch} />
            <div className="text-xs font-cinzel text-gold/50 text-center max-w-20">{cards[cardIdx].position}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavagrahaSpreadLayout({ cards, flipped, onFlip, onCardClick }: SpreadLayoutProps) {
  const cw = 90
  const ch = 156
  const planets = NAVAGRAHA_PLANETS

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {cards.map((item, idx) => {
          const planet = planets[idx]
          const planetColor = NAVAGRAHA_COLORS[planet] ?? '#FFB347'
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <FlipCard
                  card={item.card}
                  reversed={item.reversed}
                  isFlipped={flipped.has(idx)}
                  onClick={() => flipped.has(idx) ? onCardClick(idx) : onFlip(idx)}
                  width={cw}
                  height={ch}
                />
                {/* Planet glow ring */}
                {flipped.has(idx) && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ boxShadow: `0 0 16px ${planetColor}55`, border: `1px solid ${planetColor}44` }} />
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-cinzel font-bold" style={{ color: planetColor }}>{planet}</div>
                {flipped.has(idx) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-xs font-cinzel leading-tight" style={{ color: item.card.color }}>{item.card.name}</div>
                    {item.reversed && <div className="text-xs text-rose-400">↕</div>}
                    <div className="text-xs text-slate-500 font-cormorant">tap for details</div>
                  </motion.div>
                )}
                {!flipped.has(idx) && (
                  <div className="text-xs text-slate-500 font-cormorant">{item.position.split('(')[1]?.replace(')', '') ?? item.position}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Spread View (Full Page Overlay) ──────────────────────────────────────

interface SpreadViewProps {
  spread: SpreadConfig
  date: Date
  onBack: () => void
  onComplete: (cards: { card: TarotCardDef; position: string; reversed: boolean }[], question?: string, interpretation?: string) => void
}

function SpreadView({ spread, date, onBack, onComplete }: SpreadViewProps) {
  const cards = useMemo(() => getSpreadCards(spread, date), [spread, date])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [drawerItem, setDrawerItem] = useState<{ card: TarotCardDef; position: string; reversed: boolean; idx: number } | null>(null)
  const [interpretation, setInterpretation] = useState('')
  const [loadingInterp, setLoadingInterp] = useState(false)
  const [showInterpSection, setShowInterpSection] = useState(false)
  const [question, setQuestion] = useState('')
  const { addXP } = useStore()

  const allFlipped = flipped.size === cards.length

  const flipCard = useCallback((idx: number) => {
    if (!flipped.has(idx)) {
      setFlipped(prev => new Set([...prev, idx]))
      addXP(5, 'TAROT_READING')
    }
  }, [flipped, addXP])

  function flipAll() {
    const allIndices = new Set(cards.map((_, i) => i))
    setFlipped(allIndices)
    addXP(5, 'TAROT_READING')
  }

  function openDrawer(idx: number) {
    setDrawerItem({ ...cards[idx], idx })
  }

  async function getInterpretation() {
    setLoadingInterp(true)
    try {
      const res = await fetch('/api/v1/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spread: spread.name,
          cards: cards.map(c => ({ name: c.card.name, position: c.position, reversed: c.reversed }))
        }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setInterpretation(data.interpretation || data.text || '')
      } else {
        const summary = cards.map(c =>
          `${c.position}: ${c.card.name}${c.reversed ? ' (reversed)' : ''} — ${c.reversed ? c.card.reversedMeaning : c.card.uprightMeaning}`
        ).join('\n\n')
        setInterpretation(`Cosmic Reading Summary:\n\n${summary}\n\nThe cards invite you to reflect deeply on these themes as they weave through your current journey.`)
      }
      addXP(spread.xp, 'TAROT_READING')
    } finally {
      setLoadingInterp(false)
    }
  }

  const layoutProps: SpreadLayoutProps = { spread, cards, flipped, onFlip: flipCard, onCardClick: openDrawer }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold transition-colors">
          <ChevronLeft size={14} /> Spreads
        </button>
        <div className="text-center">
          <h2 className="font-cinzel text-lg text-gold">{spread.icon} {spread.name}</h2>
          <p className="font-cormorant text-xs text-slate-400">
            {flipped.size}/{cards.length} cards revealed · Click a card to flip
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-cinzel text-gold/50">
          <Zap size={12} className="text-gold" />+{spread.xp} XP
        </div>
      </div>

      {/* Question / Intention */}
      {flipped.size === 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">Set Your Intention</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What's on your mind? (optional)"
            className="w-full bg-stardust/30 border border-stardust/50 rounded-xl px-4 py-2.5 text-white font-cormorant text-sm placeholder-slate-500 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </motion.div>
      )}

      {/* Flip All button */}
      {!allFlipped && flipped.size < cards.length && (
        <div className="flex justify-center">
          <button
            onClick={flipAll}
            className="flex items-center gap-2 bg-stardust/40 border border-stardust/60 text-slate-300 font-cinzel text-xs px-4 py-2 rounded-full hover:border-gold/40 hover:text-gold transition-all"
          >
            <Layers size={12} /> Flip All Cards
          </button>
        </div>
      )}

      {/* Spread layout */}
      <div className="glass-card p-4 sm:p-6">
        {spread.id === 'single' && <SingleSpreadLayout {...layoutProps} />}
        {spread.id === 'three' && <ThreeCardSpreadLayout {...layoutProps} />}
        {spread.id === 'celtic' && <CelticCrossLayout {...layoutProps} />}
        {spread.id === 'navagraha' && <NavagrahaSpreadLayout {...layoutProps} />}
      </div>

      {/* Revealed card meanings (compact) */}
      {flipped.size > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider">Revealed Cards</h3>
          <div className="space-y-2">
            {Array.from(flipped).sort((a, b) => a - b).map(idx => {
              const { card, position, reversed } = cards[idx]
              return (
                <button
                  key={idx}
                  onClick={() => openDrawer(idx)}
                  className="w-full flex gap-3 items-center p-2.5 rounded-xl hover:bg-stardust/30 transition-colors text-left"
                >
                  <CardFace card={card} reversed={reversed} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-sm" style={{ color: card.color }}>{card.name}</span>
                      {reversed && <span className="text-xs text-rose-400">↕</span>}
                    </div>
                    <div className="text-xs text-gold/50 font-cinzel">{position}</div>
                    <p className="font-cormorant text-xs text-slate-400 truncate leading-tight mt-0.5">
                      {reversed ? card.reversedMeaning : card.uprightMeaning}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Get Reading section */}
      {allFlipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
          {!showInterpSection ? (
            <div className="text-center space-y-3">
              <p className="font-cormorant text-slate-300 text-lg">All {cards.length} cards revealed.</p>
              <p className="font-cormorant text-slate-400 text-sm">The cosmos has spoken through these sacred symbols. Receive the full interpretation?</p>
              <button
                onClick={() => setShowInterpSection(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-cinzel text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg"
              >
                <Star size={14} /> Interpret This Spread
              </button>
            </div>
          ) : !interpretation ? (
            <div className="space-y-3">
              <h3 className="font-cinzel text-sm text-gold/70 uppercase tracking-wider text-center">Cosmic Interpretation</h3>
              {loadingInterp ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-stardust/40 rounded-full w-full" />
                  <div className="h-3 bg-stardust/30 rounded-full w-5/6" />
                  <div className="h-3 bg-stardust/40 rounded-full w-4/6" />
                  <div className="h-3 bg-stardust/30 rounded-full w-full" />
                  <div className="h-3 bg-stardust/40 rounded-full w-3/4" />
                  <p className="text-center text-xs font-cormorant text-slate-500 pt-2">Reading the cosmic patterns...</p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={getInterpretation}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-cinzel text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                  >
                    <Star size={14} /> Get Cosmic Interpretation
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-cinzel text-sm text-gold/70 uppercase tracking-wider">Cosmic Interpretation</h3>
              <p className="font-cormorant text-slate-200 leading-relaxed whitespace-pre-line text-base">{interpretation}</p>
              <div className="flex gap-2 flex-wrap pt-2 border-t border-stardust/30">
                <button
                  onClick={() => onComplete(cards, question, interpretation)}
                  className="flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-sm font-cinzel px-4 py-2 rounded-xl hover:bg-gold/20 transition-colors"
                >
                  <Star size={14} /> Save Reading
                </button>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 bg-stardust/30 text-slate-300 text-sm font-cinzel px-4 py-2 rounded-xl hover:bg-stardust/50 transition-colors"
                >
                  New Spread
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Card detail drawer */}
      <CardDetailDrawer
        item={drawerItem ? cards[drawerItem.idx] : null}
        planetContext={
          drawerItem && spread.id === 'navagraha'
            ? getNavagrahaContext(cards[drawerItem.idx].position, cards[drawerItem.idx].card, cards[drawerItem.idx].reversed)
            : undefined
        }
        onClose={() => setDrawerItem(null)}
      />
    </motion.div>
  )
}

// ─── Card Library ──────────────────────────────────────────────────────────

function CardLibrary({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Major' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles'>('All')
  const [selected, setSelected] = useState<TarotCardDef | null>(null)

  const filtered = useMemo(() => {
    let cards = FULL_DECK
    if (filter !== 'All') {
      if (filter === 'Major') cards = cards.filter(c => c.arcana === 'Major')
      else cards = cards.filter(c => c.suit === filter)
    }
    if (search) {
      const q = search.toLowerCase()
      cards = cards.filter(c => c.name.toLowerCase().includes(q) || c.keywords.some(k => k.toLowerCase().includes(q)))
    }
    return cards
  }, [search, filter])

  const filterOptions = ['All', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles'] as const

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold">
          <ChevronLeft size={14} /> Back
        </button>
        <h2 className="font-cinzel text-xl text-gold">Card Library</h2>
        <span className="text-sm text-slate-400 font-cormorant">{filtered.length} cards</span>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-stardust/40 border border-stardust/60 rounded-xl pl-9 pr-4 py-2.5 text-white font-cormorant text-sm placeholder-slate-500 focus:outline-none focus:border-gold/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-xs font-cinzel px-3 py-1.5 rounded-full border transition-all ${
                filter === f ? 'bg-gold/20 text-gold border-gold/40' : 'text-slate-400 border-stardust/40 hover:border-gold/30'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {filtered.map(card => (
          <motion.div
            key={card.id}
            whileHover={{ y: -3, scale: 1.05 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSelected(card)}
            className="cursor-pointer"
          >
            <CardFace card={card} size="sm" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cosmos/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <CardFace card={selected} size="md" />
                  <div>
                    <h3 className="font-cinzel text-xl" style={{ color: selected.color }}>{selected.name}</h3>
                    <div className="text-sm text-slate-400 font-cormorant">
                      {selected.arcana === 'Major' ? 'Major Arcana' : `${selected.suit} · Minor Arcana`}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{selected.astro} · {selected.element}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {selected.keywords.map(k => (
                    <span key={k} className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-1">Upright</div>
                <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{selected.uprightMeaning}</p>
              </div>
              <div>
                <div className="text-xs font-cinzel text-rose-400/60 uppercase tracking-wider mb-1">Reversed</div>
                <p className="font-cormorant text-slate-400 text-sm leading-relaxed">{selected.reversedMeaning}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Tarot Home ────────────────────────────────────────────────────────────

function TarotHome({
  onSelectSpread,
  onLibrary,
  onHistory,
}: {
  onSelectSpread: (s: SpreadConfig) => void
  onLibrary: () => void
  onHistory: () => void
}) {
  const { tarotReadings } = useStore()
  const today = useMemo(() => new Date(), [])
  const dailyCard = useMemo(() => getDailyCard(today), [today])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="font-cinzel text-3xl font-bold text-gold-gradient">Tarot Oracle</h1>
        <p className="font-cormorant text-slate-400 mt-2 text-lg">Let the ancient wisdom of 78 cards illuminate your path</p>
      </div>

      {/* Daily Card */}
      <div className="glass-card p-6 shimmer-border">
        <div className="flex items-center gap-2 mb-4">
          <Star size={14} className="text-gold" />
          <h2 className="font-cinzel text-sm uppercase tracking-widest text-gold">Today's Card</h2>
          <span className="text-xs text-slate-500 font-cormorant ml-auto">
            {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <CardFace card={dailyCard} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-cinzel text-xl" style={{ color: dailyCard.color }}>{dailyCard.name}</h3>
              {dailyCard.arcana === 'Major' && (
                <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full font-cinzel">Major</span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-cinzel mb-3">{dailyCard.astro} · {dailyCard.element}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {dailyCard.keywords.map(k => (
                <span key={k} className="text-xs bg-stardust/40 text-slate-300 px-2 py-0.5 rounded-full font-cinzel">{k}</span>
              ))}
            </div>
            <p className="font-cormorant text-slate-300 leading-relaxed">{dailyCard.uprightMeaning}</p>
          </div>
        </div>
      </div>

      {/* Spreads */}
      <div>
        <h2 className="font-cinzel text-sm uppercase tracking-widest text-gold/60 mb-3">Choose a Spread</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SPREADS.map(spread => (
            <motion.button
              key={spread.id}
              whileHover={{ y: -3 }}
              onClick={() => onSelectSpread(spread)}
              className="glass-card p-5 text-left hover:border-gold/40 transition-all border border-stardust/40"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl font-cinzel text-gold/60">{spread.icon}</div>
                <div className="flex items-center gap-1 text-xs font-cinzel text-gold/50">
                  <Zap size={10} />+{spread.xp}
                </div>
              </div>
              <h3 className="font-cinzel font-bold text-white mb-1">{spread.name}</h3>
              <div className="text-xs text-gold/50 font-cinzel mb-2">{spread.cardCount} card{spread.cardCount > 1 ? 's' : ''}</div>
              <p className="font-cormorant text-slate-400 text-sm">{spread.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onLibrary}
          className="glass-card p-4 flex items-center gap-3 hover:border-gold/40 transition-all border border-stardust/40"
        >
          <BookOpen size={20} className="text-gold/60" />
          <div className="text-left">
            <div className="font-cinzel text-sm text-white">Card Library</div>
            <div className="font-cormorant text-xs text-slate-400">All 78 cards</div>
          </div>
        </button>
        <button
          onClick={onHistory}
          className="glass-card p-4 flex items-center gap-3 hover:border-gold/40 transition-all border border-stardust/40"
        >
          <Clock size={20} className="text-gold/60" />
          <div className="text-left">
            <div className="font-cinzel text-sm text-white">History</div>
            <div className="font-cormorant text-xs text-slate-400">{tarotReadings.length} reading{tarotReadings.length !== 1 ? 's' : ''}</div>
          </div>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Reading History ───────────────────────────────────────────────────────

function ReadingHistory({ onBack }: { onBack: () => void }) {
  const { tarotReadings } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold">
          <ChevronLeft size={14} /> Back
        </button>
        <h2 className="font-cinzel text-xl text-gold">Reading History</h2>
      </div>

      {tarotReadings.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="text-4xl mb-3">🃏</div>
          <p className="font-cinzel text-slate-400">No readings yet. Begin your tarot journey!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tarotReadings.slice(0, 20).map(reading => (
            <div key={reading.id} className="glass-card p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === reading.id ? null : reading.id)}>
              {reading.question && (
                <p className="font-cormorant text-xs text-purple-300/70 italic mb-2">"{reading.question}"</p>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-cinzel text-sm text-gold">{reading.spreadType}</div>
                  <div className="font-cormorant text-xs text-slate-500 mt-0.5">
                    <Clock size={10} className="inline mr-1" />
                    {new Date(reading.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {reading.cards.slice(0, 5).map((c, i) => (
                  <div key={i} className={`text-xs font-cinzel px-2 py-1 rounded ${c.isReversed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-stardust/30 text-slate-400'}`}>
                    {c.cardName || `Card ${i + 1}`}
                    {c.isReversed && ' ↕'}
                  </div>
                ))}
                {reading.cards.length > 5 && <span className="text-xs text-slate-500">+{reading.cards.length - 5} more</span>}
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedId === reading.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-3 border-t border-stardust/20 space-y-3">
                      {/* All cards with positions */}
                      <div className="space-y-1.5">
                        {reading.cards.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="font-cinzel text-gold/50 w-28 flex-shrink-0">{c.position}</span>
                            <span className={`font-cinzel ${c.isReversed ? 'text-rose-400' : 'text-slate-300'}`}>
                              {c.cardName}{c.isReversed ? ' (Reversed)' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Saved interpretation */}
                      {reading.interpretation && (
                        <div className="bg-stardust/20 rounded-lg p-3">
                          <div className="font-cinzel text-[10px] text-gold/50 uppercase tracking-wider mb-1">Interpretation</div>
                          <p className="font-cormorant text-slate-300 text-sm leading-relaxed whitespace-pre-line">{reading.interpretation}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Tarot Page ───────────────────────────────────────────────────────

type TarotView = 'home' | 'spread' | 'library' | 'history'

export default function TarotPage() {
  const { addTarotReading } = useStore()
  const [view, setView] = useState<TarotView>('home')
  const [activeSpread, setActiveSpread] = useState<SpreadConfig | null>(null)
  const today = useMemo(() => new Date(), [])

  function handleSelectSpread(spread: SpreadConfig) {
    setActiveSpread(spread)
    setView('spread')
  }

  const [lastQuestion, setLastQuestion] = useState('')
  const [lastInterpretation, setLastInterpretation] = useState('')

  function handleReadingComplete(cards: { card: TarotCardDef; position: string; reversed: boolean }[], q?: string, interp?: string) {
    if (!activeSpread) return
    if (q) setLastQuestion(q)
    if (interp) setLastInterpretation(interp)
    const reading: TarotReading = {
      id: generateId(),
      spreadType: activeSpread.name,
      question: q || lastQuestion,
      cards: cards.map((c) => ({
        cardId: c.card.id,
        cardName: c.card.name,
        position: c.position,
        isReversed: c.reversed,
      })),
      interpretation: interp || lastInterpretation,
      createdAt: new Date().toISOString(),
    }
    addTarotReading(reading)
    setView('home')
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TarotHome
              onSelectSpread={handleSelectSpread}
              onLibrary={() => setView('library')}
              onHistory={() => setView('history')}
            />
          </motion.div>
        )}
        {view === 'spread' && activeSpread && (
          <motion.div key="spread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpreadView
              spread={activeSpread}
              date={today}
              onBack={() => setView('home')}
              onComplete={handleReadingComplete}
            />
          </motion.div>
        )}
        {view === 'library' && (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardLibrary onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReadingHistory onBack={() => setView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
