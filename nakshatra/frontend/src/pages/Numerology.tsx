import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { Calculator, RefreshCw, ChevronDown, ChevronUp, Zap, Info } from 'lucide-react'
import { calculateNumerology, getNumerologyCompatibility } from '@/services/api'

// ─── Number Systems ────────────────────────────────────────────────────────

type NumerologySystem = 'Pythagorean' | 'Chaldean'

const PYTHAGOREAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
}

const CHALDEAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

function digitSum(n: number): number {
  let sum = n
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d), 0)
  }
  return sum
}

function sumLetters(name: string, chart: Record<string, number>, vowelsOnly?: boolean, consonantsOnly?: boolean): number {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '')
  let sum = 0
  for (const ch of upper) {
    if (vowelsOnly && !VOWELS.has(ch)) continue
    if (consonantsOnly && VOWELS.has(ch)) continue
    sum += chart[ch] ?? 0
  }
  return digitSum(sum)
}

function calcLifePath(dateStr: string): number {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return 0
  const [year, month, day] = parts.map(Number)
  const total = digitSum(day) + digitSum(month) + digitSum(year)
  return digitSum(total)
}

function calcPersonalYear(dateStr: string, currentYear?: number): number {
  const parts = dateStr.split('-')
  if (parts.length < 2) return 0
  const month = parseInt(parts[1])
  const day = parseInt(parts[2])
  const year = currentYear ?? new Date().getFullYear()
  return digitSum(day + month + digitSum(year))
}

interface NumerologyResult {
  lifePath: number
  expression: number
  soulUrge: number
  personality: number
  personalYear: number
  personalMonth: number
  personalDay: number
  maturityNumber: number
  birthdayNumber: number
}

function calculate(fullName: string, birthDate: string, system: NumerologySystem): NumerologyResult {
  const chart = system === 'Pythagorean' ? PYTHAGOREAN : CHALDEAN
  const parts = birthDate.split('-')
  const day = parts[2] ? parseInt(parts[2]) : 1
  const lifePath = calcLifePath(birthDate)
  const expression = sumLetters(fullName, chart)
  const personalYear = calcPersonalYear(birthDate)
  const now = new Date()
  const personalMonth = digitSum(personalYear + (now.getMonth() + 1))
  const personalDay = digitSum(personalMonth + now.getDate())

  return {
    lifePath,
    expression,
    soulUrge: sumLetters(fullName, chart, true),
    personality: sumLetters(fullName, chart, false, true),
    personalYear,
    personalMonth,
    personalDay,
    maturityNumber: digitSum(lifePath + expression),
    birthdayNumber: digitSum(day),
  }
}

// ─── Lucky Data ───────────────────────────────────────────────────────────

const LUCKY_DATA: Record<number, { color: string; colorHex: string; day: string; gem: string }> = {
  1: { color: 'Red', colorHex: '#FF6B6B', day: 'Sunday', gem: 'Ruby' },
  2: { color: 'White/Silver', colorHex: '#C0C0FF', day: 'Monday', gem: 'Pearl' },
  3: { color: 'Yellow', colorHex: '#FFD700', day: 'Thursday', gem: 'Yellow Sapphire' },
  4: { color: 'Blue', colorHex: '#38BDF8', day: 'Saturday', gem: 'Hessonite' },
  5: { color: 'Green', colorHex: '#4ADE80', day: 'Wednesday', gem: 'Emerald' },
  6: { color: 'Pink', colorHex: '#F472B6', day: 'Friday', gem: 'Diamond' },
  7: { color: 'Purple', colorHex: '#9B87F5', day: 'Monday', gem: "Cat's Eye" },
  8: { color: 'Dark Blue', colorHex: '#3B82F6', day: 'Saturday', gem: 'Blue Sapphire' },
  9: { color: 'Red/Orange', colorHex: '#FF8C00', day: 'Tuesday', gem: 'Red Coral' },
  11: { color: 'Silver', colorHex: '#C0C0FF', day: 'Monday', gem: 'Pearl' },
  22: { color: 'Gold', colorHex: '#FFB347', day: 'Thursday', gem: 'Yellow Sapphire' },
  33: { color: 'Pink', colorHex: '#F472B6', day: 'Friday', gem: 'Diamond' },
}

function getLucky(n: number) {
  return LUCKY_DATA[n] ?? LUCKY_DATA[((n - 1) % 9) + 1]
}

// ─── Lo Shu Grid ──────────────────────────────────────────────────────────

const LO_SHU_GRID = [[4, 9, 2], [3, 5, 7], [8, 1, 6]]

function LoShuGrid({ birthDate }: { birthDate: string }) {
  // Count occurrences of each digit in the birth date
  const digits = birthDate.replace(/\D/g, '').split('').map(Number)
  const counts: Record<number, number> = {}
  digits.forEach(d => { if (d >= 1 && d <= 9) counts[d] = (counts[d] || 0) + 1 })

  return (
    <motion.div variants={itemVariants} className="glass-card p-5 border border-stardust/40">
      <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-3">Lo Shu Grid (Vedic Magic Square)</div>
      <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto">
        {LO_SHU_GRID.flat().map(n => {
          const count = counts[n] || 0
          const present = count > 0
          return (
            <div
              key={n}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                present ? 'bg-gold/15 border-2 border-gold/40' : 'bg-stardust/20 border border-stardust/30 opacity-40'
              }`}
              style={present ? { boxShadow: '0 0 12px rgba(255,179,71,0.2)' } : undefined}
            >
              <span className={`font-cinzel font-bold text-xl ${present ? 'text-gold' : 'text-slate-600'}`}>{n}</span>
              {count > 1 && <span className="text-[9px] text-gold/70 font-cinzel">×{count}</span>}
            </div>
          )
        })}
      </div>
      <div className="text-center mt-3">
        <p className="text-xs text-slate-500 font-cormorant">
          Present: {Object.keys(counts).sort().join(', ') || 'None'} · Missing: {[1,2,3,4,5,6,7,8,9].filter(n => !counts[n]).join(', ')}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Name Compatibility ───────────────────────────────────────────────────

function NameCompatibility({ lifePath, system }: { lifePath: number; system: NumerologySystem }) {
  const [otherName, setOtherName] = useState('')
  const [otherBirthDate, setOtherBirthDate] = useState('')
  const [compatResult, setCompatResult] = useState<{ score: number; otherLP: number; description: string } | null>(null)

  async function checkCompat() {
    if (!otherName.trim() || !otherBirthDate) return
    const otherLP = calcLifePath(otherBirthDate)

    // Try backend API first
    try {
      const apiResult = await getNumerologyCompatibility(lifePath, otherLP)
      if (apiResult?.success && apiResult.compatibility) {
        const c = apiResult.compatibility
        setCompatResult({
          score: c.score ?? c.harmonyScore ?? (c.isHarmonic ? 9 : 5),
          otherLP,
          description: c.description ?? c.summary ?? '',
        })
        return
      }
    } catch {
      // API unavailable — fall back to local
    }

    // Local fallback: simple compatibility matrix
    const harmonious: Record<number, number[]> = {
      1: [3, 5, 6], 2: [4, 6, 8], 3: [1, 5, 9], 4: [2, 6, 8],
      5: [1, 3, 7], 6: [1, 2, 4, 9], 7: [3, 5, 9], 8: [2, 4, 6],
      9: [3, 6, 7, 9], 11: [2, 6, 11], 22: [4, 8, 22], 33: [6, 9, 33],
    }
    const isHarmonic = (harmonious[lifePath] ?? []).includes(otherLP) || (harmonious[otherLP] ?? []).includes(lifePath)
    const sameNumber = lifePath === otherLP
    const score = sameNumber ? 8 : isHarmonic ? 9 : 5
    const descriptions: Record<number, string> = {
      9: 'Excellent harmony! Your Life Path numbers are naturally compatible, creating a flowing and supportive connection.',
      8: 'Mirror souls — sharing the same Life Path brings deep understanding but may amplify both strengths and challenges.',
      5: 'A growth-oriented pairing. Different energies create opportunities for learning, though patience is needed.',
    }
    setCompatResult({ score, otherLP, description: descriptions[score] ?? '' })
  }

  return (
    <motion.div variants={itemVariants} className="glass-card p-5 border border-stardust/40">
      <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-3">Name Compatibility Check</div>
      <div className="space-y-3">
        <input
          type="text"
          value={otherName}
          onChange={e => setOtherName(e.target.value)}
          placeholder="Enter another person's name"
          className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-2.5 text-white font-cormorant text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
        />
        <input
          type="date"
          value={otherBirthDate}
          onChange={e => setOtherBirthDate(e.target.value)}
          className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-2.5 text-white font-cormorant text-sm focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
        />
        <button
          onClick={checkCompat}
          disabled={!otherName.trim() || !otherBirthDate}
          className="w-full bg-gold/10 border border-gold/30 text-gold font-cinzel text-sm py-2.5 rounded-xl hover:bg-gold/20 transition-all disabled:opacity-40"
        >
          Check Compatibility
        </button>
        {compatResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-stardust/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm text-white">Harmony Score</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5,6,7,8,9,10].map(s => (
                    <div key={s} className={`w-2.5 h-2.5 rounded-full ${s <= compatResult.score ? 'bg-gold' : 'bg-stardust/40'}`} />
                  ))}
                </div>
                <span className="font-cinzel text-gold font-bold">{compatResult.score}/10</span>
              </div>
            </div>
            <p className="text-xs font-cormorant text-slate-400">
              {otherName}'s Life Path: <span className="text-gold font-bold">{compatResult.otherLP}</span>
            </p>
            <p className="text-sm font-cormorant text-slate-300">{compatResult.description}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Number Meanings ───────────────────────────────────────────────────────

interface NumberMeaning {
  title: string
  archetype: string
  keywords: string[]
  description: string
  strengths: string[]
  challenges: string[]
  compatible: string
  color: string
  planet: string
  tarotCard: string
}

const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    title: 'The Leader', archetype: 'Pioneer',
    keywords: ['Independence', 'Originality', 'Drive', 'Courage'],
    description: 'Born to lead and innovate, you forge your own path with fierce independence and creative fire. Your mission is to pioneer new ideas and inspire others through your own authentic example.',
    strengths: ['Natural leadership', 'Self-reliance', 'Creative vision', 'Determination'],
    challenges: ['Stubbornness', 'Arrogance', 'Loneliness', 'Impatience'],
    compatible: '3, 5, 6',
    color: '#FF6B6B', planet: 'Sun', tarotCard: 'The Magician'
  },
  2: {
    title: 'The Diplomat', archetype: 'Peacemaker',
    keywords: ['Cooperation', 'Sensitivity', 'Intuition', 'Harmony'],
    description: 'A natural mediator and empath, you bring balance to discord. Your gift lies in creating harmony, understanding others\' feelings, and building bridges between opposing forces.',
    strengths: ['Empathy', 'Diplomacy', 'Intuition', 'Patience'],
    challenges: ['Over-sensitivity', 'Indecision', 'Codependency', 'Self-doubt'],
    compatible: '4, 6, 8',
    color: '#38BDF8', planet: 'Moon', tarotCard: 'The High Priestess'
  },
  3: {
    title: 'The Creator', archetype: 'Artist',
    keywords: ['Creativity', 'Expression', 'Joy', 'Optimism'],
    description: 'You are pure creative energy — a communicator, artist, and bringer of joy. Words, art, music, and laughter flow through you. Your mission is to uplift the world through inspired expression.',
    strengths: ['Creativity', 'Communication', 'Charisma', 'Optimism'],
    challenges: ['Scattered energy', 'Moodiness', 'Superficiality', 'Procrastination'],
    compatible: '1, 5, 9',
    color: '#FFD700', planet: 'Jupiter', tarotCard: 'The Empress'
  },
  4: {
    title: 'The Builder', archetype: 'Foundation',
    keywords: ['Stability', 'Discipline', 'Order', 'Trust'],
    description: 'The cornerstone of civilization, you build lasting structures — in business, family, and spirit. Practical, loyal, and methodical, you lay the foundations upon which others stand.',
    strengths: ['Reliability', 'Hard work', 'Organization', 'Loyalty'],
    challenges: ['Rigidity', 'Stubbornness', 'Resistance to change', 'Workaholism'],
    compatible: '2, 6, 8',
    color: '#4ADE80', planet: 'Uranus/Rahu', tarotCard: 'The Emperor'
  },
  5: {
    title: 'The Freedom Seeker', archetype: 'Adventurer',
    keywords: ['Freedom', 'Change', 'Versatility', 'Adventure'],
    description: 'Born under the sign of constant motion, you crave freedom, variety, and experience. A natural explorer of life, you bridge worlds and spread ideas with magnetic, quicksilver energy.',
    strengths: ['Adaptability', 'Curiosity', 'Resourcefulness', 'Magnetism'],
    challenges: ['Restlessness', 'Impulsiveness', 'Overindulgence', 'Inconsistency'],
    compatible: '1, 3, 7',
    color: '#FF8C00', planet: 'Mercury', tarotCard: 'The Hierophant'
  },
  6: {
    title: 'The Nurturer', archetype: 'Healer',
    keywords: ['Responsibility', 'Compassion', 'Service', 'Home'],
    description: 'The cosmic parent, you pour love and healing into those around you. Service, beauty, and family are your sacred callings. You create sanctuary and hold the world together with warmth.',
    strengths: ['Nurturing', 'Responsibility', 'Artistic sense', 'Compassion'],
    challenges: ['Self-sacrifice', 'Controlling tendencies', 'Perfectionism', 'Worry'],
    compatible: '2, 3, 9',
    color: '#F472B6', planet: 'Venus', tarotCard: 'The Lovers'
  },
  7: {
    title: 'The Seeker', archetype: 'Mystic',
    keywords: ['Wisdom', 'Spirituality', 'Analysis', 'Introspection'],
    description: 'The seeker of hidden truths, you dive deep into the ocean of consciousness. Analytical yet mystical, you bridge science and spirit, seeking the deeper meaning beneath all surface appearances.',
    strengths: ['Intelligence', 'Intuition', 'Spiritual depth', 'Analytical mind'],
    challenges: ['Isolation', 'Skepticism', 'Aloofness', 'Perfectionism'],
    compatible: '3, 5, 9',
    color: '#9B87F5', planet: 'Ketu/Neptune', tarotCard: 'The Chariot'
  },
  8: {
    title: 'The Powerhouse', archetype: 'Executive',
    keywords: ['Power', 'Authority', 'Achievement', 'Abundance'],
    description: 'The master of the material realm, you wield power and wealth as tools for manifestation. Your path is the integration of spiritual wisdom with material achievement — abundance as a spiritual practice.',
    strengths: ['Leadership', 'Business acumen', 'Determination', 'Vision'],
    challenges: ['Materialism', 'Domineering', 'Workaholic', 'Fear of failure'],
    compatible: '2, 4, 6',
    color: '#DAA520', planet: 'Saturn', tarotCard: 'Strength'
  },
  9: {
    title: 'The Humanitarian', archetype: 'Sage',
    keywords: ['Compassion', 'Wisdom', 'Philanthropy', 'Completion'],
    description: 'The old soul of numerology, carrying lifetimes of accumulated wisdom. Your path is one of universal love, service to all of humanity, and completion — letting go to allow rebirth.',
    strengths: ['Empathy', 'Wisdom', 'Generosity', 'Creative intelligence'],
    challenges: ['Lack of boundaries', 'Resentment', 'Overgiving', 'Disappointment'],
    compatible: '3, 6, 9',
    color: '#7DF9FF', planet: 'Mars', tarotCard: 'The Hermit'
  },
  11: {
    title: 'The Illuminator', archetype: 'Master Intuitive',
    keywords: ['Spiritual illumination', 'Inspiration', 'Vision', 'Higher calling'],
    description: 'A master number of spiritual illumination, you are a channel for higher wisdom. Your path carries intense sensitivity, visionary insight, and the sacred duty to inspire the spiritual evolution of humanity.',
    strengths: ['Visionary insight', 'Spiritual sensitivity', 'Inspiration', 'Healing'],
    challenges: ['Nervous energy', 'Extreme sensitivity', 'Inner conflict', 'Extremes'],
    compatible: '2, 6, 11',
    color: '#C084FC', planet: 'Moon/Uranus', tarotCard: 'The Star'
  },
  22: {
    title: 'The Master Builder', archetype: 'Visionary Architect',
    keywords: ['Mastery', 'Manifestation', 'Practical vision', 'Greatness'],
    description: 'The most powerful number in numerology, the Master Builder holds the vision of a better world and possesses the practical ability to make it real. You build lasting legacies that outlive your physical form.',
    strengths: ['Master manifestor', 'Visionary', 'Practical power', 'Discipline'],
    challenges: ['Overwhelm', 'Megalomania', 'Excessive pressure', 'Perfectionism'],
    compatible: '4, 8, 22',
    color: '#FFB347', planet: 'Uranus/Saturn', tarotCard: 'The World'
  },
  33: {
    title: 'The Master Teacher', archetype: 'Divine Servant',
    keywords: ['Selfless service', 'Teaching', 'Compassion', 'Christ-like love'],
    description: 'The rarest and highest master number, 33 embodies the pure energy of unconditional love and selfless teaching. You carry the sacred mission of healing and elevating the consciousness of humanity.',
    strengths: ['Unconditional love', 'Teaching', 'Healing', 'Inspired service'],
    challenges: ['Self-neglect', 'Martyrdom', 'Overwhelming responsibilities', 'Perfectionism'],
    compatible: '6, 9, 33',
    color: '#E879F9', planet: 'Venus/Jupiter', tarotCard: 'The World'
  },
}

function getMeaning(n: number): NumberMeaning {
  return NUMBER_MEANINGS[n] ?? NUMBER_MEANINGS[((n - 1) % 9) + 1]
}

// ─── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

// ─── Number Card Component ─────────────────────────────────────────────────

interface NumberCardProps {
  label: string
  number: number
  description: string
  expanded?: boolean
}

function NumberCard({ label, number, description, expanded = false }: NumberCardProps) {
  const [open, setOpen] = useState(expanded)
  const meaning = getMeaning(number)
  const isMaster = [11, 22, 33].includes(number)

  return (
    <motion.div
      variants={itemVariants}
      className={`glass-card border transition-all duration-200 ${
        isMaster ? 'border-gold/50 shadow-gold-glow' : 'border-stardust/40'
      }`}
    >
      <div
        className="p-5 cursor-pointer flex items-start justify-between gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-4">
          {/* Big number */}
          <div
            className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `${meaning.color}18`,
              border: `2px solid ${meaning.color}44`,
              boxShadow: isMaster ? `0 0 20px ${meaning.color}33` : undefined,
            }}
          >
            <span
              className="font-cinzel font-bold text-2xl"
              style={{ color: meaning.color }}
            >{number}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-cinzel tracking-widest text-slate-500 uppercase mb-0.5">{label}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-cinzel font-bold text-lg" style={{ color: meaning.color }}>
                {meaning.title}
              </h3>
              {isMaster && (
                <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full font-cinzel">
                  Master Number
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {meaning.keywords.map(k => (
                <span
                  key={k}
                  className="text-xs px-2 py-0.5 rounded-full font-cinzel"
                  style={{ background: `${meaning.color}15`, color: meaning.color, border: `1px solid ${meaning.color}30` }}
                >{k}</span>
              ))}
            </div>
          </div>
        </div>

        <button className="flex-shrink-0 text-slate-500 mt-1">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-stardust/20 pt-4">
              <p className="font-cormorant text-slate-300 leading-relaxed text-base">{meaning.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-cinzel text-green-400/70 uppercase tracking-wider mb-2">Strengths</div>
                  <ul className="space-y-1">
                    {meaning.strengths.map(s => (
                      <li key={s} className="flex items-center gap-2 text-sm font-cormorant text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-cinzel text-rose-400/70 uppercase tracking-wider mb-2">Challenges</div>
                  <ul className="space-y-1">
                    {meaning.challenges.map(c => (
                      <li key={c} className="flex items-center gap-2 text-sm font-cormorant text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400/60 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-cinzel text-slate-500 uppercase">Planet:</span>
                  <span className="font-cinzel text-slate-300" style={{ color: meaning.color }}>{meaning.planet}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-cinzel text-slate-500 uppercase">Tarot:</span>
                  <span className="font-cormorant text-slate-300">{meaning.tarotCard}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-cinzel text-slate-500 uppercase">Compatible:</span>
                  <span className="font-cinzel text-slate-300">{meaning.compatible}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Calculation Breakdown ─────────────────────────────────────────────────

function CalculationBreakdown({ name, birthDate, system }: { name: string; birthDate: string; system: NumerologySystem }) {
  const chart = system === 'Pythagorean' ? PYTHAGOREAN : CHALDEAN
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '')
  const [showChart, setShowChart] = useState(false)

  return (
    <div className="glass-card-dark p-5 space-y-4 rounded-xl">
      <button
        onClick={() => setShowChart(!showChart)}
        className="flex items-center gap-2 text-xs font-cinzel text-gold/60 hover:text-gold transition-colors"
      >
        <Info size={12} />
        {showChart ? 'Hide' : 'Show'} Calculation Details
        {showChart ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4"
          >
            <div>
              <div className="text-xs font-cinzel text-gold/50 uppercase tracking-wider mb-2">
                {system} Chart Values
              </div>
              <div className="flex flex-wrap gap-1">
                {upper.split('').map((ch, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center px-2 py-1 rounded-lg ${
                      VOWELS.has(ch) ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-stardust/30 border border-stardust/40'
                    }`}
                  >
                    <span className="font-cinzel text-sm text-white">{ch}</span>
                    <span className="font-cinzel text-xs text-gold">{chart[ch] ?? 0}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500 font-cormorant mt-1">
                Blue = Vowels (Soul Urge) · Grey = Consonants (Personality)
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Expression', formula: `All letters: ${upper.split('').map(c => chart[c] ?? 0).join(' + ')} = ${upper.split('').reduce((s, c) => s + (chart[c] ?? 0), 0)} → ${sumLetters(name, chart)}` },
                { label: 'Soul Urge', formula: `Vowels only: ${upper.split('').filter(c => VOWELS.has(c)).map(c => `${c}=${chart[c]}`).join(', ')} → ${sumLetters(name, chart, true)}` },
                { label: 'Personality', formula: `Consonants only: ${upper.split('').filter(c => !VOWELS.has(c)).map(c => `${c}=${chart[c]}`).join(', ')} → ${sumLetters(name, chart, false, true)}` },
              ].map(row => (
                <div key={row.label} className="text-xs font-cormorant text-slate-400">
                  <span className="font-cinzel text-gold/60">{row.label}:</span> {row.formula}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Personal Year Wheel ───────────────────────────────────────────────────

function PersonalYearWheel({ personalYear }: { personalYear: number }) {
  const meaning = getMeaning(personalYear)
  const yearThemes: Record<number, string> = {
    1: 'New beginnings, plant seeds, launch projects',
    2: 'Cooperation, patience, relationships deepen',
    3: 'Creativity, self-expression, joy and socializing',
    4: 'Work, discipline, build stable foundations',
    5: 'Change, freedom, unexpected opportunities',
    6: 'Service, home, love, responsibility',
    7: 'Inner reflection, spirituality, solitude',
    8: 'Achievement, power, financial matters',
    9: 'Completion, release, prepare for new cycle',
  }

  return (
    <div className="glass-card p-5 border border-stardust/40">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${meaning.color}20`, border: `1px solid ${meaning.color}40` }}>
          <span className="font-cinzel font-bold" style={{ color: meaning.color }}>{personalYear}</span>
        </div>
        <div>
          <div className="font-cinzel text-sm text-white">Personal Year {personalYear}</div>
          <div className="text-xs text-slate-400 font-cinzel">{new Date().getFullYear()} Energy</div>
        </div>
      </div>
      <p className="font-cormorant text-slate-300 text-sm leading-relaxed">
        {yearThemes[personalYear] ?? 'A year of profound significance and personal transformation.'}
      </p>
    </div>
  )
}

// ─── Input Form ────────────────────────────────────────────────────────────

interface FormState {
  fullName: string
  birthDate: string
  system: NumerologySystem
}

function NumerologyForm({ onCalculate, initial }: { onCalculate: (f: FormState) => void; initial?: FormState }) {
  const [form, setForm] = useState<FormState>(initial ?? { fullName: '', birthDate: '', system: 'Pythagorean' })
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!form.fullName.trim()) { setError('Please enter your full name.'); return }
    if (!form.birthDate) { setError('Please enter your birth date.'); return }
    setError('')
    onCalculate(form)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-5"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">✦</div>
        <h2 className="font-cinzel text-xl text-gold">Sacred Number Analysis</h2>
        <p className="font-cormorant text-slate-400 mt-1">Your name and birthdate encode your soul's blueprint</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm font-cormorant">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">Full Birth Name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
            placeholder="Your full name as given at birth"
            className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        <div>
          <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">Birth Date</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))}
            className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">Number System</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Pythagorean', 'Chaldean'] as NumerologySystem[]).map(sys => (
              <button
                key={sys}
                onClick={() => setForm(p => ({ ...p, system: sys }))}
                className={`py-3 rounded-xl font-cinzel text-sm transition-all border ${
                  form.system === sys
                    ? 'bg-gold/20 text-gold border-gold/40'
                    : 'text-slate-400 border-stardust/40 hover:border-gold/20'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-cormorant mt-1.5 text-center">
            {form.system === 'Pythagorean'
              ? 'Western system — sequential A=1 through I=9'
              : 'Ancient Babylonian system — frequency-based values'}
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-saffron to-gold text-cosmos font-cinzel font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Calculator size={16} />
        Calculate My Numbers
      </button>
    </motion.div>
  )
}

// ─── Results Display ───────────────────────────────────────────────────────

interface ResultsProps {
  form: FormState
  result: NumerologyResult
  onRecalculate: () => void
}

function NumerologyResults({ form, result, onRecalculate }: ResultsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="glass-card p-5 shimmer-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-cinzel text-xs text-gold/50 uppercase tracking-wider">Numerology Profile</div>
            <h2 className="font-cinzel text-2xl text-gold-gradient mt-0.5">{form.fullName}</h2>
            <div className="text-sm font-cormorant text-slate-400 mt-0.5">
              Born {new Date(form.birthDate + 'T12:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              <span className="mx-1.5 text-slate-600">·</span>
              {form.system} System
            </div>
          </div>
          <button
            onClick={onRecalculate}
            className="flex items-center gap-2 text-xs font-cinzel text-gold/60 border border-gold/20 px-3 py-2 rounded-xl hover:border-gold/40 transition-colors"
          >
            <RefreshCw size={12} />
            Recalculate
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          {[
            { label: 'Life Path', num: result.lifePath },
            { label: 'Expression', num: result.expression },
            { label: 'Soul Urge', num: result.soulUrge },
            { label: 'Personality', num: result.personality },
            { label: 'Maturity', num: result.maturityNumber },
            { label: 'Birthday', num: result.birthdayNumber },
          ].map(({ label, num }) => {
            const meaning = getMeaning(num)
            return (
              <div key={label} className="text-center">
                <div
                  className="text-2xl font-cinzel font-bold"
                  style={{ color: meaning.color }}
                >{num}</div>
                <div className="text-xs font-cinzel text-slate-500 leading-tight mt-0.5">{label}</div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Current Cycles: Year / Month / Day */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-stardust/40">
        <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-3">Current Cycles</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Personal Year', num: result.personalYear, sub: new Date().getFullYear().toString() },
            { label: 'Personal Month', num: result.personalMonth, sub: new Date().toLocaleDateString('en-US', { month: 'long' }) },
            { label: 'Personal Day', num: result.personalDay, sub: 'Today' },
          ].map(({ label, num, sub }) => {
            const m = getMeaning(num)
            return (
              <div key={label} className="text-center p-3 rounded-xl" style={{ background: `${m.color}10`, border: `1px solid ${m.color}25` }}>
                <div className="font-cinzel font-bold text-2xl" style={{ color: m.color }}>{num}</div>
                <div className="font-cinzel text-[10px] text-slate-400 uppercase mt-1">{label}</div>
                <div className="text-[10px] text-slate-500 font-cormorant">{sub}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-3">
          <PersonalYearWheel personalYear={result.personalYear} />
        </div>
      </motion.div>

      {/* Lucky Colors, Days, Gems */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-stardust/40">
        <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-3">Lucky Attributes (Life Path {result.lifePath})</div>
        <div className="grid grid-cols-3 gap-3">
          {(() => {
            const lucky = getLucky(result.lifePath)
            return [
              { label: 'Lucky Color', value: lucky.color, icon: <div className="w-4 h-4 rounded-full" style={{ background: lucky.colorHex }} /> },
              { label: 'Lucky Day', value: lucky.day, icon: <span className="text-base">📅</span> },
              { label: 'Lucky Gem', value: lucky.gem, icon: <span className="text-base">💎</span> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-2 bg-stardust/20 rounded-lg p-3">
                {icon}
                <div>
                  <div className="text-[10px] font-cinzel text-slate-500 uppercase">{label}</div>
                  <div className="text-sm font-cinzel text-white">{value}</div>
                </div>
              </div>
            ))
          })()}
        </div>
      </motion.div>

      {/* Core number cards */}
      <NumberCard label="Life Path Number" number={result.lifePath} description="Your soul's primary purpose and life journey." expanded={true} />
      <NumberCard label="Expression Number" number={result.expression} description="Your natural talents and abilities in this lifetime." />
      <NumberCard label="Soul Urge Number" number={result.soulUrge} description="Your innermost desires and motivations (vowels)." />
      <NumberCard label="Personality Number" number={result.personality} description="How others perceive you externally (consonants)." />

      {/* Birthday number */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-stardust/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gold/10 border border-gold/30">
            <span className="font-cinzel font-bold text-gold text-xl">{result.birthdayNumber}</span>
          </div>
          <div>
            <div className="font-cinzel text-sm text-gold">Birthday Number</div>
            <p className="font-cormorant text-slate-400 text-sm">
              A special talent gifted to you at birth — a unique strength that defines your character.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Maturity Number */}
      <NumberCard
        label="Maturity Number"
        number={result.maturityNumber}
        description="The true you that emerges after age 40 — the blending of your Life Path and Expression energies."
      />

      {/* Lo Shu Grid */}
      <LoShuGrid birthDate={form.birthDate} />

      {/* Name Compatibility */}
      <NameCompatibility lifePath={result.lifePath} system={form.system} />

      {/* Calculation breakdown */}
      <motion.div variants={itemVariants}>
        <CalculationBreakdown name={form.fullName} birthDate={form.birthDate} system={form.system} />
      </motion.div>

      {/* XP earned indicator */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2">
          <Zap size={14} className="text-gold" />
          <span className="font-cinzel text-sm text-gold">+25 XP earned</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Numerology Page ──────────────────────────────────────────────────

export default function NumerologyPage() {
  const { numerologyProfile, setNumerologyProfile, addXP } = useStore()
  const [form, setForm] = useState<FormState | null>(
    numerologyProfile
      ? {
          fullName: numerologyProfile.fullName,
          birthDate: numerologyProfile.birthDate,
          system: 'Pythagorean',
        }
      : null
  )
  const [result, setResult] = useState<NumerologyResult | null>(() => {
    if (numerologyProfile) {
      const py = numerologyProfile.personalYearNumber
      const now = new Date()
      const pm = digitSum(py + (now.getMonth() + 1))
      return {
        lifePath: numerologyProfile.lifePathNumber,
        expression: numerologyProfile.expressionNumber,
        soulUrge: numerologyProfile.soulUrgeNumber,
        personality: numerologyProfile.personalityNumber,
        personalYear: py,
        personalMonth: pm,
        personalDay: digitSum(pm + now.getDate()),
        maturityNumber: digitSum(numerologyProfile.lifePathNumber + numerologyProfile.expressionNumber),
        birthdayNumber: digitSum(parseInt(numerologyProfile.birthDate.split('-')[2] ?? '1')),
      }
    }
    return null
  })

  async function handleCalculate(f: FormState) {
    // Always compute local result as fallback
    const localResult = calculate(f.fullName, f.birthDate, f.system)
    let r = localResult

    // Try backend API first
    try {
      const apiResult = await calculateNumerology(f.fullName, f.birthDate)
      if (apiResult?.success && apiResult.numbers) {
        const n = apiResult.numbers
        r = {
          lifePath: n.lifePath.value,
          expression: n.expression.value,
          soulUrge: n.soulUrge.value,
          personality: n.personality.value,
          personalYear: n.personalYear.value,
          personalMonth: localResult.personalMonth,    // not in API
          personalDay: localResult.personalDay,        // not in API
          maturityNumber: localResult.maturityNumber,   // not in API
          birthdayNumber: n.birthday.value,
        }
      }
    } catch {
      // API unavailable — use local result
    }

    setForm(f)
    setResult(r)

    // Persist to store
    setNumerologyProfile({
      fullName: f.fullName,
      birthDate: f.birthDate,
      lifePathNumber: r.lifePath,
      expressionNumber: r.expression,
      soulUrgeNumber: r.soulUrge,
      personalityNumber: r.personality,
      personalYearNumber: r.personalYear,
      interpretation: {},
    })
    addXP(25, 'NUMEROLOGY_CALCULATED')
  }

  function handleRecalculate() {
    setResult(null)
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-5xl mb-3">✦</div>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-gold-gradient">Numerology</h1>
        <p className="font-cormorant text-slate-400 mt-2 text-lg">Decode the sacred mathematics woven into your existence</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NumerologyForm
              onCalculate={handleCalculate}
              initial={form ?? undefined}
            />

            {/* What you'll discover */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 glass-card-dark p-5 rounded-xl space-y-3"
            >
              <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider">Your Profile Includes</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { num: '1-9, 11, 22, 33', label: 'Life Path Number', desc: 'Core soul purpose' },
                  { num: '✦', label: 'Expression Number', desc: 'Natural talents & destiny' },
                  { num: '♡', label: 'Soul Urge Number', desc: 'Heart\'s deepest desire' },
                  { num: '◆', label: 'Personality Number', desc: 'How the world sees you' },
                  { num: '📅', label: 'Personal Year Number', desc: 'This year\'s cosmic theme' },
                  { num: '⭐', label: 'Birthday Number', desc: 'Your innate gift' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-sm font-cinzel text-gold">
                      {item.num.length > 3 ? item.num : item.num}
                    </div>
                    <div>
                      <div className="font-cinzel text-xs text-white">{item.label}</div>
                      <div className="font-cormorant text-xs text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick reference chart */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 glass-card-dark p-5 rounded-xl"
            >
              <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-4">Number Archetypes</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[1,2,3,4,5,6,7,8,9,11,22,33].map(n => {
                  const m = getMeaning(n)
                  return (
                    <div
                      key={n}
                      className="text-center p-2 rounded-lg"
                      style={{ background: `${m.color}10`, border: `1px solid ${m.color}25` }}
                    >
                      <div className="font-cinzel font-bold text-lg" style={{ color: m.color }}>{n}</div>
                      <div className="font-cinzel text-xs text-slate-400 leading-tight mt-0.5">{m.archetype}</div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {form && <NumerologyResults form={form} result={result} onRecalculate={handleRecalculate} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
