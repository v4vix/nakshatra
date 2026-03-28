import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  Heart, Star, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Share2, Sparkles, Users, Calendar, Clock, MapPin, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ShareCard from '@/components/ShareCard'

// ─── Types ─────────────────────────────────────────────────────────────────

interface PersonInput {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
}

interface LocalChart {
  name: string
  birthDate: string
  rashiIndex: number      // 0-11
  nakshatraIndex: number  // 0-26
  nakshatraPada: number   // 1-4
}

interface KutaScore {
  name: string
  sanskritName: string
  maxPoints: number
  scored: number
  description: string
  detail: string
}

interface CompatibilityResult {
  person1: LocalChart
  person2: LocalChart
  kutas: KutaScore[]
  total: number
  maxTotal: 36
  label: string
  labelColor: string
  summary: string
  loveStrengths: string[]
  loveCautions: string[]
  familyNote: string
  careerNote: string
  healthNote: string
  doshas: string[]
}

// ─── Vedic Data (from shared source) ──────────────────────────────────────
import {
  NAKSHATRA_NAMES, RASHI_NAMES, RASHI_SYMBOLS, RASHI_LORDS as RASHI_LORD,
  PLANET_FRIENDSHIP, NAKSHATRA_GANA, NAKSHATRA_NADI, NAKSHATRA_YONI, NAKSHATRA_VARNA,
} from '@/lib/vedic-constants'

// Yoni compatibility: -1=hostile enemy, 0=enemy, 1=neutral, 2=friendly, 3=same
const YONI_COMPAT: number[][] = (() => {
  const n = 14
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(1))
  for (let i = 0; i < n; i++) grid[i][i] = 3
  const hostile: [number, number][] = [[0, 6], [1, 8], [2, 12], [3, 13], [4, 9], [5, 10]]
  for (const [a, b] of hostile) { grid[a][b] = -1; grid[b][a] = -1 }
  const enemy: [number, number][] = [[0, 4], [1, 9], [2, 3], [5, 11], [7, 11], [8, 12]]
  for (const [a, b] of enemy) { grid[a][b] = 0; grid[b][a] = 0 }
  const friendly: [number, number][] = [[0, 7], [1, 3], [2, 10], [4, 6], [5, 13], [8, 13]]
  for (const [a, b] of friendly) { grid[a][b] = 2; grid[b][a] = 2 }
  return grid
})()

// ─── Sidereal Rashi from birth date ────────────────────────────────────────

function getSiderealRashi(month: number, day: number): number {
  // Lahiri ayanamsa approximate sidereal dates (0-indexed)
  const ranges = [
    { rashi: 0,  from: [4, 13], to: [5, 14] },
    { rashi: 1,  from: [5, 15], to: [6, 14] },
    { rashi: 2,  from: [6, 15], to: [7, 15] },
    { rashi: 3,  from: [7, 16], to: [8, 16] },
    { rashi: 4,  from: [8, 17], to: [9, 16] },
    { rashi: 5,  from: [9, 17], to: [10, 16] },
    { rashi: 6,  from: [10, 17], to: [11, 15] },
    { rashi: 7,  from: [11, 16], to: [12, 15] },
    { rashi: 8,  from: [12, 16], to: [1, 13] },
    { rashi: 9,  from: [1, 14], to: [2, 12] },
    { rashi: 10, from: [2, 13], to: [3, 12] },
    { rashi: 11, from: [3, 13], to: [4, 12] },
  ]
  const d = month * 100 + day
  for (const r of ranges) {
    const from = r.from[0] * 100 + r.from[1]
    const to   = r.to[0]   * 100 + r.to[1]
    if (from <= to) {
      if (d >= from && d <= to) return r.rashi
    } else {
      if (d >= from || d <= to) return r.rashi
    }
  }
  return 11
}

function buildLocalChart(input: PersonInput): LocalChart {
  // Parse date parts directly to avoid UTC timezone shift
  const [year, month, day] = input.birthDate.split('-').map(Number)

  // Approximate Moon's sidereal longitude for nakshatra calculation
  // Uses J2000 epoch + mean lunar daily motion (~13.176°/day) + Ayanamsa correction
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0) / 86400000
  const birthJD = Date.UTC(year, month - 1, day, 12, 0, 0) / 86400000
  const daysSinceJ2000 = birthJD - J2000
  const moonMeanLong = (218.3165 + 13.176396 * daysSinceJ2000) % 360
  const ayanamsa = 24.16 // Lahiri approximate
  const moonSidereal = ((moonMeanLong - ayanamsa) % 360 + 360) % 360

  const rashiIndex = Math.floor(moonSidereal / 30) % 12
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27)) % 27
  const nakshatraPada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1

  return {
    name:            input.name.trim() || 'Person',
    birthDate:       input.birthDate,
    rashiIndex,
    nakshatraIndex,
    nakshatraPada:   Math.min(nakshatraPada, 4),
  }
}

// ─── Ashtakoot Calculation ──────────────────────────────────────────────────

function calcVarna(c1: LocalChart, c2: LocalChart): number {
  // Treat c1 as "boy" perspective (caller normalizes)
  const v1 = NAKSHATRA_VARNA[c1.nakshatraIndex]
  const v2 = NAKSHATRA_VARNA[c2.nakshatraIndex]
  return v1 >= v2 ? 1 : 0
}

function calcVashya(c1: LocalChart, c2: LocalChart): number {
  // Vashya groups: 0=Manav, 1=Chatushpad, 2=Jalchar, 3=Dwipada, 4=Keeta
  const getVashya = (rashi: number): number => {
    if ([2, 5, 6, 11].includes(rashi)) return 0  // Manav (Gemini,Virgo,Libra,Pisces)
    if ([0, 1, 4, 9].includes(rashi)) return 1   // Chatushpad (Aries,Taurus,Leo,Cap)
    if ([3, 7].includes(rashi)) return 2          // Jalchar (Cancer,Scorpio)
    if ([8, 10].includes(rashi)) return 3         // Dwipada (Sagittarius,Aquarius)
    return 4                                       // Keeta fallback
  }
  const v1 = getVashya(c1.rashiIndex)
  const v2 = getVashya(c2.rashiIndex)
  if (v1 === v2) return 2
  // Some are vashya to each other
  const vashyaOf: Record<number, number[]> = {
    0: [1],   // Manav commands Chatushpad
    2: [0],   // Jalchar commands Manav
    1: [2],   // Chatushpad commands Jalchar
  }
  if (vashyaOf[v1]?.includes(v2)) return 2
  if (vashyaOf[v2]?.includes(v1)) return 1
  return 0
}

function calcTara(c1: LocalChart, c2: LocalChart): number {
  const AUSPICIOUS = new Set([2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 22, 24, 26])
  const count1 = ((c2.nakshatraIndex - c1.nakshatraIndex + 27) % 27) + 1
  const count2 = ((c1.nakshatraIndex - c2.nakshatraIndex + 27) % 27) + 1
  const auspicious1 = AUSPICIOUS.has(count1)
  const auspicious2 = AUSPICIOUS.has(count2)
  if (auspicious1 && auspicious2) return 3
  if (auspicious1 || auspicious2) return 1.5
  return 0
}

function calcYoni(c1: LocalChart, c2: LocalChart): number {
  const y1 = NAKSHATRA_YONI[c1.nakshatraIndex]
  const y2 = NAKSHATRA_YONI[c2.nakshatraIndex]
  const compat = YONI_COMPAT[y1][y2]
  if (compat === 3)  return 4  // same
  if (compat === 2)  return 3  // friendly
  if (compat === 1)  return 2  // neutral
  if (compat === 0)  return 1  // enemy
  return 0                     // hostile enemy
}

function calcGrahaMaitri(c1: LocalChart, c2: LocalChart): number {
  const lord1 = RASHI_LORD[c1.rashiIndex]
  const lord2 = RASHI_LORD[c2.rashiIndex]
  if (lord1 === lord2) return 5
  const f12 = PLANET_FRIENDSHIP[lord1]?.[lord2] ?? 0
  const f21 = PLANET_FRIENDSHIP[lord2]?.[lord1] ?? 0
  const sum = f12 + f21
  if (sum === 2)  return 5   // both friendly
  if (sum === 1)  return 4   // one friendly, one neutral
  if (sum === 0)  return 3   // both neutral
  if (sum === -1) return 1.5 // one neutral, one enemy
  return 0                   // both enemy or one hostile
}

function calcGana(c1: LocalChart, c2: LocalChart): number {
  const g1 = NAKSHATRA_GANA[c1.nakshatraIndex]
  const g2 = NAKSHATRA_GANA[c2.nakshatraIndex]
  if (g1 === g2) return 6
  // Deva+Manushya or Manushya+Deva = 5
  if ((g1 === 0 && g2 === 1) || (g1 === 1 && g2 === 0)) return 5
  // Any combo with Rakshasa = 0 or 1
  if (g1 === 2 || g2 === 2) {
    if ((g1 === 0 && g2 === 2) || (g1 === 2 && g2 === 0)) return 1
    return 0
  }
  return 3
}

function calcBhakoot(c1: LocalChart, c2: LocalChart): number {
  const r1 = c1.rashiIndex + 1  // 1-indexed
  const r2 = c2.rashiIndex + 1
  const diff = Math.abs(r1 - r2)
  const inauspicious = [1, 6] // 2/12=diff11, 3/11=diff8, 4/10=diff6, 5/9=diff4, 6/8=diff2
  const inauspiciousMap = new Set([2, 4, 6, 8, 11])
  if (inauspiciousMap.has(diff)) return 0
  // 1/7 pattern
  if (diff === 6 || diff === 0) {
    void inauspicious
    return diff === 0 ? 7 : 0
  }
  return 7
}

function calcNadi(c1: LocalChart, c2: LocalChart): number {
  const n1 = NAKSHATRA_NADI[c1.nakshatraIndex]
  const n2 = NAKSHATRA_NADI[c2.nakshatraIndex]
  return n1 !== n2 ? 8 : 0
}

function calculateCompatibility(chart1: LocalChart, chart2: LocalChart): CompatibilityResult {
  const varnaScore    = calcVarna(chart1, chart2)
  const vashyaScore   = calcVashya(chart1, chart2)
  const taraScore     = calcTara(chart1, chart2)
  const yoniScore     = calcYoni(chart1, chart2)
  const maitriScore   = calcGrahaMaitri(chart1, chart2)
  const ganaScore     = calcGana(chart1, chart2)
  const bhakootScore  = calcBhakoot(chart1, chart2)
  const nadiScore     = calcNadi(chart1, chart2)

  const kutas: KutaScore[] = [
    {
      name: 'Varna',
      sanskritName: 'वर्ण',
      maxPoints: 1,
      scored: varnaScore,
      description: 'Spiritual compatibility & ego harmony',
      detail: varnaScore === 1
        ? 'Spiritual alignment is favorable — both share compatible temperaments.'
        : 'Some differences in spiritual approach; growth through understanding.',
    },
    {
      name: 'Vashya',
      sanskritName: 'वश्य',
      maxPoints: 2,
      scored: vashyaScore,
      description: 'Mutual attraction & influence',
      detail: vashyaScore === 2
        ? 'Strong natural magnetism and mutual influence between partners.'
        : vashyaScore === 1
        ? 'Moderate attraction; one partner may need more effort to connect.'
        : 'Different energies; conscious effort needed to maintain attraction.',
    },
    {
      name: 'Tara',
      sanskritName: 'तारा',
      maxPoints: 3,
      scored: taraScore,
      description: 'Destiny & birth star compatibility',
      detail: taraScore === 3
        ? 'Birth stars align beautifully — destined connection with mutual prosperity.'
        : taraScore > 0
        ? 'Partial nakshatra harmony; relationship brings some destined blessings.'
        : 'Challenging star positions; spiritual practices can ease friction.',
    },
    {
      name: 'Yoni',
      sanskritName: 'योनि',
      maxPoints: 4,
      scored: yoniScore,
      description: 'Physical & intimate compatibility',
      detail: yoniScore >= 3
        ? 'Excellent physical and intimate harmony — natural comfort with each other.'
        : yoniScore === 2
        ? 'Moderate physical compatibility with room to deepen the bond.'
        : 'Physical differences may require patience, communication, and compromise.',
    },
    {
      name: 'Graha Maitri',
      sanskritName: 'ग्रह मैत्री',
      maxPoints: 5,
      scored: maitriScore,
      description: 'Planetary friendship & mental compatibility',
      detail: maitriScore >= 4
        ? 'Rashi lords are friends — excellent mental understanding and shared values.'
        : maitriScore >= 2
        ? 'Neutral planetary relationship; respect and patience build the bond.'
        : 'Opposing planetary rulers; work on communication to bridge differences.',
    },
    {
      name: 'Gana',
      sanskritName: 'गण',
      maxPoints: 6,
      scored: ganaScore,
      description: 'Temperament & nature compatibility',
      detail: ganaScore === 6
        ? 'Same cosmic nature (Gana) — natural temperamental harmony.'
        : ganaScore >= 5
        ? 'Compatible natures with minor differences that add spice to the union.'
        : ganaScore >= 1
        ? 'Different natures; understanding each other\'s temperament is key.'
        : 'Contrasting natures (Deva/Rakshasa); extra spiritual support recommended.',
    },
    {
      name: 'Bhakoot',
      sanskritName: 'भकूट',
      maxPoints: 7,
      scored: bhakootScore,
      description: 'Emotional & financial compatibility',
      detail: bhakootScore === 7
        ? 'Excellent rashi compatibility — emotional and financial prosperity together.'
        : 'Bhakoot Dosha present; can be mitigated by strong Nadi and other kutas.',
    },
    {
      name: 'Nadi',
      sanskritName: 'नाडी',
      maxPoints: 8,
      scored: nadiScore,
      description: 'Health, genetics & spiritual evolution',
      detail: nadiScore === 8
        ? 'Different Nadis — most auspicious. Complementary energies for healthy progeny.'
        : 'Nadi Dosha present — consider Nadi Dosha Nivaran puja before marriage.',
    },
  ]

  const total = Math.round(
    varnaScore + vashyaScore + taraScore + yoniScore +
    maitriScore + ganaScore + bhakootScore + nadiScore
  )

  let label = ''
  let labelColor = ''
  let summary = ''

  if (total >= 33) {
    label = 'Exceptional Match'
    labelColor = '#FFB347'
    summary = `${chart1.name} and ${chart2.name} share an extraordinarily rare cosmic bond. The stars themselves conspire to bring you together — this union is written in the heavens.`
  } else if (total >= 25) {
    label = 'Highly Compatible'
    labelColor = '#22c55e'
    summary = `A beautiful alignment of energies between ${chart1.name} and ${chart2.name}. Your charts speak of deep harmony, mutual growth, and a fulfilling life together.`
  } else if (total >= 18) {
    label = 'Compatible'
    labelColor = '#eab308'
    summary = `${chart1.name} and ${chart2.name} have a workable compatibility with areas of natural harmony and some that call for conscious effort. Love bridges these differences.`
  } else {
    label = 'Challenging Union'
    labelColor = '#ef4444'
    summary = `Some cosmic friction exists between ${chart1.name} and ${chart2.name}. With spiritual effort, understanding, and remedies, many challenges can be transcended.`
  }

  const loveStrengths: string[] = []
  const loveCautions: string[] = []

  if (maitriScore >= 4) loveStrengths.push('Deep mental understanding and shared worldview')
  if (yoniScore >= 3)   loveStrengths.push('Natural physical and emotional intimacy')
  if (ganaScore >= 5)   loveStrengths.push('Compatible temperaments — comfortable silences and easy laughter')
  if (taraScore === 3)  loveStrengths.push('Destined meeting — past-life connection indicated')
  if (nadiScore === 8)  loveStrengths.push('Complementary life energies creating beautiful balance')
  if (bhakootScore === 7) loveStrengths.push('Emotional security and financial stability in the union')
  if (loveStrengths.length === 0) loveStrengths.push('Every relationship holds unique gifts waiting to be discovered')

  if (ganaScore < 3)  loveCautions.push('Different temperaments may cause misunderstandings — practice active listening')
  if (yoniScore < 2)  loveCautions.push('Physical compatibility needs nurturing through open communication')
  if (maitriScore < 2) loveCautions.push('Mental wavelengths differ; find shared interests and activities')
  if (loveCautions.length === 0) loveCautions.push('No major cautions — nurture this beautiful bond with presence and gratitude')

  const familyNote = ganaScore >= 5
    ? 'Family life is well-starred. Natural understanding of each other\'s roles creates a harmonious home.'
    : 'Family dynamics may require conscious role-definition. Respect for each other\'s family traditions is vital.'

  const careerNote = maitriScore >= 4
    ? 'You inspire each other professionally. Shared goals and mutual support amplify individual success.'
    : 'Career paths may diverge; celebrate each other\'s achievements and maintain separate as well as shared ambitions.'

  const healthNote = nadiScore === 8
    ? 'Complementary Nadis suggest good health for the couple and favorable conditions for healthy children.'
    : 'Similar Nadis (Nadi Dosha) — consult an astrologer for Nadi Dosha remedies and health practices.'

  const doshas: string[] = []
  if (nadiScore === 0)   doshas.push('Nadi Dosha')
  if (bhakootScore === 0) doshas.push('Bhakoot Dosha')

  return {
    person1: chart1,
    person2: chart2,
    kutas,
    total,
    maxTotal: 36,
    label,
    labelColor,
    summary,
    loveStrengths,
    loveCautions,
    familyNote,
    careerNote,
    healthNote,
    doshas,
  }
}

// ─── Score Gauge Component ──────────────────────────────────────────────────

function ScoreGauge({ total, maxTotal, color }: { total: number; maxTotal: number; color: string }) {
  const radius = 80
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(total), 100)
    return () => clearTimeout(timer)
  }, [total])

  const fraction = animated / maxTotal
  const strokeDashoffset = circumference - fraction * circumference

  const getColor = (t: number) => {
    if (t >= 33) return '#FFB347'
    if (t >= 25) return '#22c55e'
    if (t >= 18) return '#eab308'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={radius * 2} height={radius * 2} className="drop-shadow-lg">
        {/* Background ring */}
        <circle
          cx={radius} cy={radius} r={normalizedRadius}
          fill="none" stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Score ring */}
        <circle
          cx={radius} cy={radius} r={normalizedRadius}
          fill="none"
          stroke={getColor(animated)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease' }}
        />
        {/* Score text */}
        <text
          x={radius} y={radius - 8}
          textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="30" fontWeight="bold"
          fontFamily="Cinzel, serif"
        >
          {animated}
        </text>
        <text
          x={radius} y={radius + 20}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(247,231,206,0.6)" fontSize="12"
          fontFamily="Cormorant Garamond, serif"
        >
          / {maxTotal}
        </text>
      </svg>
    </div>
  )
}

// ─── Kuta Card ──────────────────────────────────────────────────────────────

const KUTA_TOOLTIPS: Record<string, string> = {
  'Varna': 'Measures spiritual development and ego compatibility between partners.',
  'Vashya': 'Indicates mutual attraction and the ability to influence each other.',
  'Tara': 'Assesses destiny compatibility through birth star relationships.',
  'Yoni': 'Evaluates physical and intimate compatibility through animal symbols.',
  'Graha Maitri': 'Checks mental wavelength compatibility through planetary friendships.',
  'Gana': 'Compares temperaments — Deva (divine), Manushya (human), Rakshasa (demon).',
  'Bhakoot': 'Assesses emotional and financial harmony between moon signs.',
  'Nadi': 'Checks genetic and health compatibility — most important kuta (8 points).',
}

function KutaCard({ kuta }: { kuta: KutaScore }) {
  const [expanded, setExpanded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const fraction = kuta.scored / kuta.maxPoints

  const barColor = fraction >= 0.75 ? '#22c55e'
    : fraction >= 0.5 ? '#eab308'
    : '#ef4444'

  return (
    <motion.div
      className="glass-card-dark rounded-xl p-4 cursor-pointer select-none"
      whileHover={{ scale: 1.02 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-cinzel text-champagne text-sm font-semibold">{kuta.name}</span>
            <span className="text-xs text-champagne/40 font-cormorant">{kuta.sanskritName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip) }}
              className="text-champagne/30 hover:text-gold/60 transition-colors"
            >
              <span className="text-[10px]">ℹ️</span>
            </button>
          </div>
          {showTooltip && KUTA_TOOLTIPS[kuta.name] && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-gold/60 font-cormorant mb-1 leading-snug">
              {KUTA_TOOLTIPS[kuta.name]}
            </motion.p>
          )}
          <p className="text-xs text-champagne/50 font-cormorant truncate">{kuta.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-cinzel text-sm" style={{ color: barColor }}>
            {kuta.scored}/{kuta.maxPoints}
          </span>
          {expanded ? <ChevronUp size={14} className="text-champagne/40" /> : <ChevronDown size={14} className="text-champagne/40" />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(fraction * 100, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-xs text-champagne/70 font-cormorant leading-relaxed overflow-hidden"
          >
            {kuta.detail}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Input Form ─────────────────────────────────────────────────────────────

function PersonForm({
  label, value, onChange, accent,
}: {
  label: string
  value: PersonInput
  onChange: (v: PersonInput) => void
  accent: string
}) {
  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-champagne text-sm font-cormorant placeholder-champagne/30 focus:outline-none focus:border-gold/50 focus:bg-white/8 transition-all'

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="font-cinzel text-sm font-semibold" style={{ color: accent }}>{label}</h3>
      </div>

      <div>
        <label className="block text-xs text-champagne/50 font-cormorant mb-1.5 flex items-center gap-1">
          <Users size={11} /> Full Name
        </label>
        <input
          type="text"
          placeholder="Enter full name"
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-champagne/50 font-cormorant mb-1.5 flex items-center gap-1">
          <Calendar size={11} /> Birth Date
        </label>
        <input
          type="date"
          value={value.birthDate}
          onChange={e => onChange({ ...value, birthDate: e.target.value })}
          className={inputClass}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div>
        <label className="block text-xs text-champagne/50 font-cormorant mb-1.5 flex items-center gap-1">
          <Clock size={11} /> Birth Time <span className="text-champagne/30">(optional)</span>
        </label>
        <input
          type="time"
          value={value.birthTime}
          onChange={e => onChange({ ...value, birthTime: e.target.value })}
          className={inputClass}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div>
        <label className="block text-xs text-champagne/50 font-cormorant mb-1.5 flex items-center gap-1">
          <MapPin size={11} /> Birth Place
        </label>
        <input
          type="text"
          placeholder="City, Country"
          value={value.birthPlace}
          onChange={e => onChange({ ...value, birthPlace: e.target.value })}
          className={inputClass}
        />
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const EMPTY_PERSON: PersonInput = { name: '', birthDate: '', birthTime: '', birthPlace: '' }

interface MatchHistory {
  names: string
  score: number
  label: string
  date: string
  p1: PersonInput
  p2: PersonInput
}

function getMatchHistory(): MatchHistory[] {
  try { return JSON.parse(localStorage.getItem('compat-history') || '[]') } catch { return [] }
}

function saveMatchHistory(entry: MatchHistory) {
  const hist = getMatchHistory()
  hist.unshift(entry)
  localStorage.setItem('compat-history', JSON.stringify(hist.slice(0, 5)))
}

export default function CompatibilityPage() {
  const { addXP, unlockAchievement, user } = useStore()

  const [person1, setPerson1] = useState<PersonInput>(EMPTY_PERSON)
  const [person2, setPerson2] = useState<PersonInput>(EMPTY_PERSON)
  const [result, setResult]   = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>(getMatchHistory)
  const resultRef = useRef<HTMLDivElement>(null)

  const isReady = person1.name && person1.birthDate && person2.name && person2.birthDate

  function useMyProfile() {
    if (user) {
      setPerson1({
        name: user.username || '',
        birthDate: (user as any).birthDate || '',
        birthTime: (user as any).birthTime || '',
        birthPlace: (user as any).birthPlace || '',
      })
      toast.success('Profile loaded!', { icon: '✦' })
    }
  }

  function loadFromHistory(entry: MatchHistory) {
    setPerson1(entry.p1)
    setPerson2(entry.p2)
    // Recalculate
    const chart1 = buildLocalChart(entry.p1)
    const chart2 = buildLocalChart(entry.p2)
    setResult(calculateCompatibility(chart1, chart2))
  }

  function handleCalculate() {
    if (!isReady) {
      toast.error('Please fill in names and birth dates for both persons.')
      return
    }
    setLoading(true)
    // Brief delay for animation feel
    setTimeout(() => {
      const chart1 = buildLocalChart(person1)
      const chart2 = buildLocalChart(person2)
      const res    = calculateCompatibility(chart1, chart2)
      setResult(res)
      setLoading(false)

      // Save to history
      const entry: MatchHistory = {
        names: `${person1.name} & ${person2.name}`,
        score: res.total,
        label: res.label,
        date: new Date().toISOString(),
        p1: person1,
        p2: person2,
      }
      saveMatchHistory(entry)
      setMatchHistory(getMatchHistory())

      addXP(40, 'compatibility')
      toast.success('+40 XP — Compatibility calculated!', { icon: '✦' })

      if (res.total >= 30) {
        if (user && !user.achievements.includes('soul_match')) {
          unlockAchievement('soul_match')
          toast.success('Achievement unlocked: Soul Match!', { icon: '💫' })
        }
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }, 900)
  }

  function handleReset() {
    setPerson1(EMPTY_PERSON)
    setPerson2(EMPTY_PERSON)
    setResult(null)
  }

  const shareData = result
    ? {
        name1: result.person1.name,
        name2: result.person2.name,
        score: result.total,
        maxScore: result.maxTotal,
        label: result.label,
        rashi1: RASHI_NAMES[result.person1.rashiIndex],
        rashi2: RASHI_NAMES[result.person2.rashiIndex],
      }
    : {}

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full glass-card border border-gold/20">
          <Heart size={14} className="text-saffron" />
          <span className="text-xs font-cinzel text-gold/80 tracking-widest uppercase">Kundli Milan</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-cinzel text-gold-gradient mb-3">
          Cosmic Compatibility
        </h1>
        <p className="text-champagne/60 font-cormorant text-lg max-w-lg mx-auto">
          Discover the sacred Ashtakoot harmony between two souls through Vedic astrology's most revered compatibility system.
        </p>
      </motion.div>

      {/* Input Forms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-cinzel text-gold/60 uppercase tracking-wider">Person 1</span>
            {user && (
              <button onClick={useMyProfile} className="text-[10px] font-cinzel text-gold/50 border border-gold/20 px-2 py-1 rounded-lg hover:bg-gold/10 transition-all">
                Use My Profile
              </button>
            )}
          </div>
          <PersonForm label="Person 1" value={person1} onChange={setPerson1} accent="#FFB347" />
        </div>

        <div className="flex items-center justify-center">
          <div className="hidden md:flex flex-col items-center gap-3">
            <div className="text-2xl text-gold/40">✦</div>
            <div className="w-px h-16 bg-gradient-to-b from-gold/30 to-transparent" />
            <Heart size={20} className="text-saffron/60" />
            <div className="w-px h-16 bg-gradient-to-t from-gold/30 to-transparent" />
            <div className="text-2xl text-gold/40">✦</div>
          </div>
        </div>

        <PersonForm label="Person 2" value={person2} onChange={setPerson2} accent="#9333EA" />
      </motion.div>

      {/* Calculate Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
      >
        <motion.button
          onClick={handleCalculate}
          disabled={!isReady || loading}
          whileHover={{ scale: isReady && !loading ? 1.04 : 1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 px-8 py-3.5 rounded-full font-cinzel text-sm font-semibold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{
            background: isReady && !loading
              ? 'linear-gradient(135deg, #FF6B00, #FFB347)'
              : 'rgba(255,179,71,0.15)',
            color: isReady && !loading ? '#020B18' : '#FFB347',
            boxShadow: isReady && !loading ? '0 0 30px rgba(255,107,0,0.4)' : 'none',
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Reading the Stars…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Calculate Compatibility
            </>
          )}
        </motion.button>

        {result && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 rounded-full glass-card border border-white/10 text-champagne/60 text-sm font-cinzel hover:text-champagne transition-colors"
          >
            <RefreshCw size={14} />
            Reset
          </motion.button>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Score Hero */}
            <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden">
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${result.labelColor} 0%, transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-6">
                  {/* Person 1 */}
                  <div className="text-center">
                    <div className="text-3xl mb-1">{RASHI_SYMBOLS[result.person1.rashiIndex]}</div>
                    <p className="font-cinzel text-champagne text-sm">{result.person1.name}</p>
                    <p className="text-xs text-champagne/50 font-cormorant">
                      {RASHI_NAMES[result.person1.rashiIndex]} · {NAKSHATRA_NAMES[result.person1.nakshatraIndex]}
                    </p>
                  </div>

                  {/* Gauge */}
                  <ScoreGauge total={result.total} maxTotal={result.maxTotal} color={result.labelColor} />

                  {/* Person 2 */}
                  <div className="text-center">
                    <div className="text-3xl mb-1">{RASHI_SYMBOLS[result.person2.rashiIndex]}</div>
                    <p className="font-cinzel text-champagne text-sm">{result.person2.name}</p>
                    <p className="text-xs text-champagne/50 font-cormorant">
                      {RASHI_NAMES[result.person2.rashiIndex]} · {NAKSHATRA_NAMES[result.person2.nakshatraIndex]}
                    </p>
                  </div>
                </div>

                {/* Label */}
                <div
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4 border"
                  style={{
                    borderColor: `${result.labelColor}40`,
                    background: `${result.labelColor}15`,
                    color: result.labelColor,
                  }}
                >
                  <Star size={14} />
                  <span className="font-cinzel text-sm font-semibold">{result.label}</span>
                </div>

                <p className="text-champagne/70 font-cormorant text-lg max-w-xl mx-auto leading-relaxed">
                  {result.summary}
                </p>

                {/* Doshas */}
                {result.doshas.length > 0 && (
                  <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    {result.doshas.map(d => (
                      <div key={d} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        <AlertTriangle size={11} className="text-red-400" />
                        <span className="text-xs text-red-400 font-cinzel">{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ashtakoot Grid */}
            <div>
              <h2 className="font-cinzel text-gold text-lg mb-4 flex items-center gap-2">
                <Star size={16} className="text-gold" />
                Ashtakoot Analysis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.kutas.map((k, i) => (
                  <motion.div
                    key={k.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <KutaCard kuta={k} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Love & Romance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-cinzel text-gold text-sm font-semibold mb-4 flex items-center gap-2">
                  <Heart size={14} className="text-saffron" />
                  Love &amp; Romance — Strengths
                </h3>
                <ul className="space-y-3">
                  {result.loveStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                      <span className="text-champagne/70 font-cormorant text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-cinzel text-gold text-sm font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  Cautions to Navigate
                </h3>
                <ul className="space-y-3">
                  {result.loveCautions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <AlertTriangle size={14} className="text-yellow-400/70 mt-0.5 shrink-0" />
                      <span className="text-champagne/70 font-cormorant text-sm leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Life Together */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-cinzel text-gold text-sm font-semibold mb-5 flex items-center gap-2">
                <Sparkles size={14} />
                Life Together
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { icon: '🏡', label: 'Family Life', note: result.familyNote },
                  { icon: '💼', label: 'Career & Ambition', note: result.careerNote },
                  { icon: '🌿', label: 'Health & Wellness', note: result.healthNote },
                ].map(item => (
                  <div key={item.label} className="glass-card-dark rounded-xl p-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="font-cinzel text-champagne text-xs font-semibold mb-2">{item.label}</p>
                    <p className="text-champagne/60 font-cormorant text-sm leading-relaxed">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Remedies */}
            <div className="glass-card rounded-2xl p-6 border border-gold/10">
              <h3 className="font-cinzel text-gold text-sm font-semibold mb-5 flex items-center gap-2">
                <Star size={14} className="text-gold" />
                Vedic Remedies &amp; Blessings
              </h3>
              <div className="space-y-3">
                {/* Universal remedies */}
                {[
                  'Perform a joint Gauri-Shankar puja before marriage to invoke divine blessings.',
                  'Chant the Mangal Mantra (Om Angarakaya Namaha) together on Tuesdays.',
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                    <span className="text-gold text-sm mt-0.5">✦</span>
                    <p className="text-champagne/70 font-cormorant text-sm leading-relaxed">{r}</p>
                  </div>
                ))}
                {/* Score-based remedies */}
                {result.total < 25 && (
                  <>
                    {result.kutas.filter(k => k.scored / k.maxPoints < 0.5).map(k => (
                      <div key={k.name} className="flex items-start gap-3 p-3 rounded-lg bg-saffron/5 border border-saffron/10">
                        <span className="text-saffron text-sm mt-0.5">✦</span>
                        <p className="text-champagne/70 font-cormorant text-sm leading-relaxed">
                          <span className="text-champagne font-semibold">{k.name} remedy: </span>
                          {k.name === 'Nadi'
                            ? 'Perform Nadi Dosha Nivaran puja at a Shiva temple. Donate silver.'
                            : k.name === 'Bhakoot'
                            ? 'Chant Vishnu Sahasranama together. Offer yellow flowers on Thursdays.'
                            : k.name === 'Gana'
                            ? 'Offer prayers to Durga Ma together on Fridays. Practice patience and empathy.'
                            : k.name === 'Yoni'
                            ? 'Perform Kamadeva puja. Place a Shri Yantra in the northeast of the home.'
                            : `Strengthen ${k.name} through regular spiritual practice together.`}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-astral/10 border border-astral/20">
                      <span className="text-astral text-sm mt-0.5">✦</span>
                      <p className="text-champagne/70 font-cormorant text-sm leading-relaxed">
                        Consult a qualified Jyotishi for a personal remediation chart (Upaya) tailored to your specific planetary positions and dashas.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Relationship Insights */}
            <div className="glass-card-dark rounded-2xl p-6 space-y-4">
              <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-widest">Relationship Insights</h3>

              {/* Compatibility Type */}
              {(() => {
                const kutas = result.kutas
                const varna = kutas.find(k => k.name === 'Varna')?.scored ?? 0
                const nadi = kutas.find(k => k.name === 'Nadi')?.scored ?? 0
                const yoni = kutas.find(k => k.name === 'Yoni')?.scored ?? 0
                const gana = kutas.find(k => k.name === 'Gana')?.scored ?? 0
                const maitri = kutas.find(k => k.name === 'Graha Maitri')?.scored ?? 0
                const tara = kutas.find(k => k.name === 'Tara')?.scored ?? 0
                let type = 'Balanced Partnership'
                if (varna > 0 && nadi >= 6) type = 'Spiritual Partners'
                else if (yoni >= 3 && gana >= 4) type = 'Passionate Bond'
                else if (maitri >= 4 && tara >= 2) type = 'Intellectual Match'
                else if (gana >= 5) type = 'Kindred Spirits'
                return (
                  <div className="text-center p-3 rounded-xl bg-gold/5 border border-gold/20">
                    <span className="text-xs font-cinzel text-gold/50 uppercase">Your Compatibility Type</span>
                    <p className="font-cinzel text-lg text-gold mt-1">{type}</p>
                  </div>
                )
              })()}

              {/* Strengths */}
              <div>
                <span className="text-xs font-cinzel text-green-400/70 uppercase tracking-wider">Your Strengths</span>
                <div className="space-y-1.5 mt-2">
                  {result.kutas
                    .filter(k => k.scored / k.maxPoints >= 0.6)
                    .sort((a, b) => b.scored / b.maxPoints - a.scored / a.maxPoints)
                    .slice(0, 3)
                    .map(k => (
                      <div key={k.name} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                        <span className="font-cormorant text-champagne/80">
                          <strong className="text-green-300">{k.name}:</strong> {k.description}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Areas to nurture */}
              <div>
                <span className="text-xs font-cinzel text-amber-400/70 uppercase tracking-wider">Areas to Nurture</span>
                <div className="space-y-1.5 mt-2">
                  {result.kutas
                    .filter(k => k.scored / k.maxPoints < 0.5)
                    .sort((a, b) => a.scored / a.maxPoints - b.scored / b.maxPoints)
                    .slice(0, 3)
                    .map(k => (
                      <div key={k.name} className="flex items-center gap-2 text-sm">
                        <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                        <span className="font-cormorant text-champagne/80">
                          <strong className="text-amber-300">{k.name}:</strong> {k.detail.slice(0, 80)}...
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Share Button */}
            <div className="flex justify-center pb-8">
              <motion.button
                onClick={() => setShowShare(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 py-3 rounded-full font-cinzel text-sm font-semibold tracking-wider border border-gold/30 text-gold hover:bg-gold/10 transition-all"
              >
                <Share2 size={15} />
                Share Compatibility
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShare && result && (
          <ShareCard
            type="compatibility"
            data={shareData}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      {/* Recent Matches */}
      {matchHistory.length > 0 && !result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8">
          <h3 className="font-cinzel text-xs text-gold/50 uppercase tracking-widest mb-3">Recent Matches</h3>
          <div className="space-y-2">
            {matchHistory.map((entry, i) => (
              <button
                key={i}
                onClick={() => loadFromHistory(entry)}
                className="w-full glass-card-dark rounded-xl p-3 flex items-center justify-between hover:border-gold/30 transition-all text-left"
              >
                <div>
                  <span className="font-cinzel text-sm text-champagne">{entry.names}</span>
                  <span className="text-xs text-champagne/40 font-cormorant ml-2">
                    {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-cinzel px-2 py-0.5 rounded-full ${
                    entry.score >= 25 ? 'bg-green-500/20 text-green-300' :
                    entry.score >= 18 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>{entry.score}/36</span>
                  <span className="text-xs text-champagne/40 font-cormorant">{entry.label}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
