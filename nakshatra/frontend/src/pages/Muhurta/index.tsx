import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  Calendar,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Copy,
  Zap,
  Sun,
} from '@/lib/lucide-icons'
import toast from 'react-hot-toast'

// ─── Constants & Types ────────────────────────────────────────────────────────

const VARA_ENGLISH = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const VARA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
const VARA_PLANET_COLORS = [
  'text-amber-400', 'text-slate-300', 'text-red-400',
  'text-green-400', 'text-yellow-400', 'text-pink-400', 'text-blue-400',
]
const VARA_PLANET_BG = [
  'bg-amber-500/10 border-amber-500/25',
  'bg-slate-500/10 border-slate-400/20',
  'bg-red-500/10 border-red-500/25',
  'bg-green-500/10 border-green-500/20',
  'bg-yellow-500/10 border-yellow-500/25',
  'bg-pink-500/10 border-pink-500/20',
  'bg-blue-500/10 border-blue-500/20',
]

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
]

const NAKSHATRAS_27 = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
]

const NEW_MOON_EPOCH = new Date('2025-01-29T12:36:00Z').getTime()
const LUNAR_CYCLE_MS = 29.530588853 * 24 * 60 * 60 * 1000

// Rahu Kalam period index per weekday (1=first 1.5hr slot from 6AM)
const RAHU_KALAM_PERIODS = [1, 8, 7, 5, 6, 4, 3]

interface EventRules {
  goodTithis?: number[]
  badTithis?: number[]
  goodVaras?: string[]
  badVaras?: string[]
  goodNakshatras?: string[]
  avoidNakshatras?: string[]
  direction?: Record<string, string>
}

interface EventCategory {
  id: string
  name: string
  emoji: string
  sanskrit: string
  english: string
  description: string
  rules: EventRules
}

type DayRating = 'excellent' | 'good' | 'neutral' | 'avoid'

interface DayAnalysis {
  date: Date
  dateKey: string
  tithi: string
  tithiNumber: number
  vara: string
  varaIndex: number
  nakshatra: string
  rating: DayRating
  score: number
  reasons: { label: string; ok: boolean; detail: string }[]
}

// ─── Event Categories ─────────────────────────────────────────────────────────

const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'vivah',
    name: 'Vivah',
    emoji: '💑',
    sanskrit: 'विवाह',
    english: 'Marriage',
    description: 'Auspicious timing for wedding ceremonies',
    rules: {
      goodTithis: [2, 3, 5, 7, 10, 11, 13],
      badTithis: [1, 4, 6, 8, 9, 12, 14, 15, 30],
      goodVaras: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      badVaras: ['Tuesday', 'Saturday'],
      goodNakshatras: ['Rohini', 'Mrigashira', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Anuradha', 'Swati', 'Magha'],
      avoidNakshatras: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula', 'Revati'],
    },
  },
  {
    id: 'griha_pravesh',
    name: 'Griha Pravesh',
    emoji: '🏠',
    sanskrit: 'गृह प्रवेश',
    english: 'Housewarming',
    description: 'Entry into a new home for prosperity and peace',
    rules: {
      goodTithis: [2, 3, 5, 7, 10, 11, 12, 13],
      goodVaras: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      goodNakshatras: ['Rohini', 'Pushya', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Anuradha'],
    },
  },
  {
    id: 'vyapar',
    name: 'Vyapar Aarambh',
    emoji: '💼',
    sanskrit: 'व्यापार आरंभ',
    english: 'Business Launch',
    description: 'Starting a new business or commercial venture',
    rules: {
      goodTithis: [2, 3, 5, 7, 11, 12, 13],
      goodVaras: ['Wednesday', 'Thursday', 'Friday'],
      goodNakshatras: ['Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Uttara Phalguni'],
    },
  },
  {
    id: 'yatra',
    name: 'Yatra',
    emoji: '✈️',
    sanskrit: 'यात्रा',
    english: 'Travel / Journey',
    description: 'Auspicious departure for travel or pilgrimage',
    rules: {
      goodVaras: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      badVaras: ['Tuesday', 'Saturday'],
      goodNakshatras: ['Ashwini', 'Mrigashira', 'Pushya', 'Hasta', 'Anuradha', 'Shravana'],
    },
  },
  {
    id: 'naamkaran',
    name: 'Naamkaran',
    emoji: '👶',
    sanskrit: 'नामकरण',
    english: 'Baby Naming',
    description: 'Sacred naming ceremony for a newborn',
    rules: {
      goodTithis: [2, 3, 5, 7, 10, 11, 12, 13],
      goodVaras: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      goodNakshatras: ['Rohini', 'Pushya', 'Hasta', 'Shravana', 'Uttara Phalguni'],
    },
  },
  {
    id: 'exam',
    name: 'Vidyarambha',
    emoji: '📚',
    sanskrit: 'विद्यारंभ',
    english: 'Study / Exams',
    description: 'Auspicious timing for study, exams, or new learning',
    rules: {
      goodVaras: ['Wednesday', 'Thursday'],
      goodNakshatras: ['Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Chitra', 'Uttara Phalguni', 'Shravana'],
    },
  },
]

// ─── Calculation Utilities ────────────────────────────────────────────────────

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function analyzeDayForEvent(date: Date, event: EventCategory): DayAnalysis {
  const now = date.getTime()
  const elapsed = (now - NEW_MOON_EPOCH) % LUNAR_CYCLE_MS
  const daysSinceNewMoon = elapsed / (24 * 60 * 60 * 1000)

  // Tithi
  const tithiRaw = Math.floor((daysSinceNewMoon / 29.530588853) * 30)
  const tithiIndex = tithiRaw % 30
  const tithiNumber = tithiIndex + 1
  const tithiName = TITHI_NAMES[tithiIndex]

  // Vara
  const varaIndex = date.getDay()
  const varaName = VARA_ENGLISH[varaIndex]

  // Nakshatra
  const moonLong = (daysSinceNewMoon * 13.176) % 360
  const nakshatraIndex = Math.floor(moonLong / 13.333) % 27
  const nakshatraName = NAKSHATRAS_27[nakshatraIndex]

  const rules = event.rules
  const reasons: { label: string; ok: boolean; detail: string }[] = []

  // Check Tithi
  if (rules.goodTithis || rules.badTithis) {
    const normalizedTithi = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15
    const isBad = rules.badTithis?.includes(tithiNumber) || rules.badTithis?.includes(normalizedTithi)
    const isGood = rules.goodTithis?.includes(tithiNumber) || rules.goodTithis?.includes(normalizedTithi)
    const ok = isGood === true && isBad !== true
    reasons.push({ label: 'Tithi', ok, detail: `${tithiName} (Tithi ${tithiNumber})` })
  }

  // Check Vara
  if (rules.goodVaras || rules.badVaras) {
    const isBad = rules.badVaras?.includes(varaName)
    const isGood = rules.goodVaras?.includes(varaName)
    const ok = isGood === true && isBad !== true
    reasons.push({ label: 'Vara', ok, detail: `${varaName} — ruled by ${VARA_PLANETS[varaIndex]}` })
  }

  // Check Nakshatra
  if (rules.goodNakshatras || rules.avoidNakshatras) {
    const isBad = rules.avoidNakshatras?.includes(nakshatraName)
    const isGood = rules.goodNakshatras?.includes(nakshatraName)
    const ok = isGood === true && isBad !== true
    reasons.push({ label: 'Nakshatra', ok, detail: `${nakshatraName}` })
  }

  const goodCount = reasons.filter((r) => r.ok).length
  const badCount = reasons.filter((r) => !r.ok).length
  const score = reasons.length > 0 ? goodCount / reasons.length : 0.5

  let rating: DayRating = 'neutral'
  if (badCount > 0 && score < 0.4) rating = 'avoid'
  else if (score >= 0.85) rating = 'excellent'
  else if (score >= 0.55) rating = 'good'
  else rating = 'neutral'

  return {
    date,
    dateKey: getDateKey(date),
    tithi: tithiName,
    tithiNumber,
    vara: varaName,
    varaIndex,
    nakshatra: nakshatraName,
    rating,
    score,
    reasons,
  }
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatPeriodTime(periodIndex: number): string {
  const startHour = 6 + (periodIndex - 1) * 1.5
  const endHour = startHour + 1.5
  const fmt = (h: number) => {
    const hr = Math.floor(h)
    const min = Math.round((h - hr) * 60)
    const suffix = hr < 12 ? 'AM' : 'PM'
    const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr
    return `${hr12}:${min.toString().padStart(2, '0')} ${suffix}`
  }
  return `${fmt(startHour)} – ${fmt(endHour)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const RATING_CONFIG: Record<DayRating, { bg: string; border: string; dot: string; label: string; textColor: string }> = {
  excellent: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    dot: 'bg-green-400',
    label: 'Excellent',
    textColor: 'text-green-400',
  },
  good: {
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-400',
    label: 'Good',
    textColor: 'text-yellow-400',
  },
  neutral: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    dot: 'bg-white/30',
    label: 'Neutral',
    textColor: 'text-white/40',
  },
  avoid: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
    label: 'Avoid',
    textColor: 'text-red-400',
  },
}

function CalendarDayCell({
  analysis,
  isSelected,
  isToday,
  onClick,
}: {
  analysis: DayAnalysis
  isSelected: boolean
  isToday: boolean
  onClick: () => void
}) {
  const cfg = RATING_CONFIG[analysis.rating]
  const day = analysis.date.getDate()

  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl p-2 border transition-all duration-200 text-center group ${
        isSelected
          ? `${cfg.bg} ${cfg.border} ring-1 ring-offset-0 ring-white/20`
          : `${cfg.bg} ${cfg.border} hover:ring-1 hover:ring-white/15`
      }`}
    >
      <div className={`text-sm font-cinzel mb-1 ${
        isToday ? 'text-saffron' : isSelected ? cfg.textColor : 'text-white/70'
      }`}>
        {day}
      </div>
      <div className={`w-2 h-2 rounded-full mx-auto ${cfg.dot}`} />
      {isToday && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-saffron rounded-full" />
      )}
    </button>
  )
}

function DayDetailPanel({ analysis, event }: { analysis: DayAnalysis; event: EventCategory }) {
  const cfg = RATING_CONFIG[analysis.rating]
  const dateStr = analysis.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleCopy = () => {
    const text = analysis.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Date copied!', { icon: '📋' })
    })
  }

  const recommendation = {
    excellent: `${analysis.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} is a highly auspicious date for ${event.english}. The planetary alignments are exceptionally favorable.`,
    good: `${analysis.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} is a good date for ${event.english}. Most cosmic conditions support your plans.`,
    neutral: `${analysis.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} is a neutral date. Proceed if no better option is available.`,
    avoid: `${analysis.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} is unfavorable for ${event.english}. Consider an alternate date.`,
  }

  return (
    <motion.div
      key={analysis.dateKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-cinzel text-sm text-white/50">{dateStr}</div>
          <div className={`font-cinzel text-lg mt-1 ${cfg.textColor}`}>
            {cfg.label}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-cinzel text-white/50 hover:text-white/80"
        >
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {analysis.reasons.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5">
            {r.ok ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-cinzel text-white/60">{r.label}: </span>
              <span className="text-xs font-cormorant text-white/70">{r.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs font-cormorant text-white/55 leading-relaxed bg-white/5 rounded-lg p-3">
        {recommendation[analysis.rating]}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Muhurta() {
  const { addXP } = useStore()

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [selectedEvent, setSelectedEvent] = useState<EventCategory>(EVENT_CATEGORIES[0])
  const [startDate, setStartDate] = useState<Date>(today)
  const [endDate, setEndDate] = useState<Date>(addDays(today, 29))
  const [hasCalculated, setHasCalculated] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayAnalysis | null>(null)
  const [calendarOffset, setCalendarOffset] = useState(0) // week offset for display

  // Calculate analyses for the date range
  const analyses = useMemo<DayAnalysis[]>(() => {
    if (!hasCalculated) return []
    const result: DayAnalysis[] = []
    let cur = new Date(startDate)
    const end = new Date(endDate)
    while (cur <= end) {
      result.push(analyzeDayForEvent(cur, selectedEvent))
      cur = addDays(cur, 1)
    }
    return result
  }, [hasCalculated, startDate, endDate, selectedEvent])

  // Today's analysis (always shown)
  const todayAnalysis = useMemo(
    () => analyzeDayForEvent(today, selectedEvent),
    [today, selectedEvent],
  )

  const handleCalculate = useCallback(() => {
    setHasCalculated(true)
    setCalendarOffset(0)
    setSelectedDay(null)
    addXP(15, `muhurta_${selectedEvent.id}`)
    toast.success(`+15 XP — Muhurta calculated for ${selectedEvent.english}!`, { icon: '✨' })
  }, [selectedEvent, addXP])

  // Top 3 best dates
  const top3 = useMemo(() => {
    return [...analyses]
      .filter((a) => a.rating === 'excellent' || a.rating === 'good')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [analyses])

  // Calendar pagination — show 7 days per page
  const calendarDays = useMemo(() => {
    if (!hasCalculated) return []
    const offset = calendarOffset * 7
    return analyses.slice(offset, offset + 35) // show up to 5 weeks
  }, [analyses, calendarOffset, hasCalculated])

  const maxOffset = Math.max(0, Math.ceil(analyses.length / 7) - 5)

  const todayRahuPeriod = RAHU_KALAM_PERIODS[today.getDay()]

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Star className="w-6 h-6 text-saffron" />
          <h1 className="font-devanagari text-4xl text-gold-gradient">मुहूर्त</h1>
          <Sparkles className="w-6 h-6 text-astral" />
        </div>
        <div className="font-cinzel text-xl text-champagne tracking-widest mb-2">
          Muhurta Calculator
        </div>
        <div className="text-sm text-white/50 font-cormorant">
          Find the cosmos-aligned moment for your important events
        </div>
      </motion.div>

      {/* ── Today's Quality Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-5 border mb-6 ${RATING_CONFIG[todayAnalysis.rating].bg} ${RATING_CONFIG[todayAnalysis.rating].border}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-4 h-4 text-saffron" />
          <span className="font-cinzel text-sm text-white/60 uppercase tracking-wider">
            Today's Muhurta Quality for {selectedEvent.english}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-cinzel text-2xl ${RATING_CONFIG[todayAnalysis.rating].textColor}`}>
              {RATING_CONFIG[todayAnalysis.rating].label}
            </div>
            <div className="text-xs text-white/50 font-cormorant mt-1">
              {todayAnalysis.vara} · {todayAnalysis.tithi} · {todayAnalysis.nakshatra}
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < Math.round(todayAnalysis.score * 5)
                    ? RATING_CONFIG[todayAnalysis.rating].dot
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Rahu Kalam warning */}
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <div className="text-xs text-red-400/80 font-cormorant">
            <span className="font-cinzel">Rahu Kalam today:</span> {formatPeriodTime(todayRahuPeriod)} — avoid starting auspicious work
          </div>
        </div>
      </motion.div>

      {/* ── Event Selector ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <h2 className="font-cinzel text-base text-champagne mb-4">Select Event Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EVENT_CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedEvent(cat)
                setHasCalculated(false)
                setSelectedDay(null)
              }}
              className={`rounded-xl border p-4 text-center transition-all duration-200 ${
                selectedEvent.id === cat.id
                  ? 'bg-saffron/15 border-saffron/40 ring-1 ring-saffron/25'
                  : 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'
              }`}
            >
              <div className="text-2xl mb-2">{cat.emoji}</div>
              <div className={`font-devanagari text-xs mb-1 ${selectedEvent.id === cat.id ? 'text-saffron' : 'text-white/50'}`}>
                {cat.sanskrit}
              </div>
              <div className={`font-cinzel text-xs ${selectedEvent.id === cat.id ? 'text-champagne' : 'text-white/60'}`}>
                {cat.english}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/6">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedEvent.emoji}</span>
            <div>
              <div className="font-cinzel text-sm text-champagne">{selectedEvent.english}</div>
              <div className="text-xs text-white/45 font-cormorant">{selectedEvent.description}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Date Range Picker ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-celestial" />
          <h2 className="font-cinzel text-base text-champagne">Date Range</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-cinzel text-white/45 mb-2 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={getDateKey(startDate)}
              min={getDateKey(today)}
              onChange={(e) => {
                const d = new Date(e.target.value + 'T00:00:00')
                setStartDate(d)
                if (d > endDate) setEndDate(addDays(d, 29))
                setHasCalculated(false)
              }}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-cinzel text-white/80 focus:outline-none focus:border-saffron/50 focus:ring-1 focus:ring-saffron/20 transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-cinzel text-white/45 mb-2 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={getDateKey(endDate)}
              min={getDateKey(addDays(startDate, 1))}
              onChange={(e) => {
                setEndDate(new Date(e.target.value + 'T00:00:00'))
                setHasCalculated(false)
              }}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-cinzel text-white/80 focus:outline-none focus:border-saffron/50 focus:ring-1 focus:ring-saffron/20 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3 rounded-xl font-cinzel text-sm bg-gradient-to-r from-saffron/80 to-gold/80 hover:from-saffron hover:to-gold text-cosmos transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-saffron/10"
        >
          <Sparkles className="w-4 h-4" />
          Find Auspicious Dates
        </button>
      </motion.div>

      {/* ── Calendar Results ── */}
      <AnimatePresence>
        {hasCalculated && analyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cinzel text-base text-champagne">
                Muhurta Calendar
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarOffset((o) => Math.max(0, o - 1))}
                  disabled={calendarOffset === 0}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => setCalendarOffset((o) => Math.min(maxOffset, o + 1))}
                  disabled={calendarOffset >= maxOffset}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {(Object.entries(RATING_CONFIG) as [DayRating, typeof RATING_CONFIG[DayRating]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-[10px] font-cinzel ${cfg.textColor}`}>{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-[9px] font-cinzel text-white/30 pb-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid — pad to start on correct weekday */}
            {(() => {
              const visibleDays = calendarDays
              if (visibleDays.length === 0) return null
              const firstDayOfWeek = visibleDays[0].date.getDay()
              const paddedStart = Array(firstDayOfWeek).fill(null)
              const allCells = [...paddedStart, ...visibleDays]
              const rows = Math.ceil(allCells.length / 7)
              const padded = [...allCells, ...Array(rows * 7 - allCells.length).fill(null)]

              return (
                <div className="grid grid-cols-7 gap-1.5">
                  {padded.map((cell, idx) => {
                    if (!cell) {
                      return <div key={`pad-${idx}`} className="rounded-xl h-14" />
                    }
                    const analysis = cell as DayAnalysis
                    const isToday = getDateKey(analysis.date) === getDateKey(today)
                    const isSelected = selectedDay?.dateKey === analysis.dateKey
                    return (
                      <CalendarDayCell
                        key={analysis.dateKey}
                        analysis={analysis}
                        isSelected={isSelected}
                        isToday={isToday}
                        onClick={() => setSelectedDay(isSelected ? null : analysis)}
                      />
                    )
                  })}
                </div>
              )
            })()}

            {/* Selected day detail */}
            <AnimatePresence>
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <DayDetailPanel analysis={selectedDay} event={selectedEvent} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top 3 Best Dates ── */}
      <AnimatePresence>
        {top3.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gold" />
              <h2 className="font-cinzel text-base text-champagne">
                Top {top3.length} Auspicious Date{top3.length > 1 ? 's' : ''}
              </h2>
            </div>
            <div className="space-y-3">
              {top3.map((a, i) => {
                const cfg = RATING_CONFIG[a.rating]
                const dateStr = a.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                const copyText = a.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                return (
                  <motion.div
                    key={a.dateKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}
                  >
                    <div className={`font-cinzel text-2xl font-bold ${cfg.textColor} w-6 text-center`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-cinzel text-sm text-white/80">{dateStr}</div>
                      <div className="text-xs text-white/45 font-cormorant truncate">
                        {a.vara} · {a.tithi} · {a.nakshatra}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-cinzel px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.border} ${cfg.textColor}`}>
                        {cfg.label}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(copyText)
                          toast.success('Date copied!', { icon: '📋' })
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/12 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rules Info for Selected Event ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card-dark rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{selectedEvent.emoji}</span>
          <div>
            <div className="font-cinzel text-sm text-champagne">{selectedEvent.english} Rules</div>
            <div className="font-devanagari text-xs text-white/40">{selectedEvent.sanskrit}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-cormorant">
          {selectedEvent.rules.goodVaras && (
            <div>
              <div className="font-cinzel text-[10px] text-green-400 uppercase tracking-wider mb-2">
                Favorable Days
              </div>
              <div className="space-y-1">
                {selectedEvent.rules.goodVaras.map((v) => {
                  const idx = VARA_ENGLISH.indexOf(v)
                  return (
                    <div key={v} className={`text-xs ${idx >= 0 ? VARA_PLANET_COLORS[idx] : 'text-white/60'}`}>
                      {v} ({idx >= 0 ? VARA_PLANETS[idx] : ''})
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {selectedEvent.rules.goodTithis && (
            <div>
              <div className="font-cinzel text-[10px] text-gold uppercase tracking-wider mb-2">
                Good Tithis
              </div>
              <div className="text-white/55 leading-relaxed">
                {selectedEvent.rules.goodTithis.map((t) => TITHI_NAMES[t - 1]).join(', ')}
              </div>
            </div>
          )}
          {selectedEvent.rules.goodNakshatras && (
            <div>
              <div className="font-cinzel text-[10px] text-celestial uppercase tracking-wider mb-2">
                Auspicious Nakshatras
              </div>
              <div className="text-white/55 leading-relaxed">
                {selectedEvent.rules.goodNakshatras.slice(0, 5).join(', ')}
                {selectedEvent.rules.goodNakshatras.length > 5 && ` +${selectedEvent.rules.goodNakshatras.length - 5} more`}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Rahu Kalam Reminder ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl p-4 bg-red-500/8 border border-red-500/20 mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="font-cinzel text-sm text-red-400">Rahu Kalam Reminder</span>
        </div>
        <p className="text-xs text-white/55 font-cormorant leading-relaxed">
          Avoid starting any auspicious work during Rahu Kalam. Today's Rahu Kalam:{' '}
          <span className="text-red-400 font-cinzel">{formatPeriodTime(todayRahuPeriod)}</span>
          . Rahu Kalam occurs every day and varies by weekday. Even an excellent muhurta is diminished if work begins during this inauspicious period.
        </p>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 text-xs text-white/30 font-cormorant"
      >
        <Zap className="w-3.5 h-3.5 text-gold/40" />
        <span>+15 XP awarded per muhurta calculation</span>
      </motion.div>
    </div>
  )
}
