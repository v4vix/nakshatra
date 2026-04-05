import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { VARA_PLANETS, RASHI_DATA } from '@/lib/vedic-constants'
import { ArrowLeft, Bell, Clock, Star, CheckCircle } from '@/lib/lucide-icons'
import { Link } from 'react-router-dom'

// ─── Hora Engine ────────────────────────────────────────────────────────────

const HORA_SEQUENCE = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']
const HORA_COLORS: Record<string, string> = {
  Sun: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  Moon: 'from-slate-400/20 to-blue-400/10 border-slate-400/30',
  Mars: 'from-red-500/20 to-rose-500/10 border-red-500/30',
  Mercury: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
  Jupiter: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
  Venus: 'from-pink-500/20 to-rose-400/10 border-pink-500/30',
  Saturn: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
}
const HORA_ACTIVITIES: Record<string, string[]> = {
  Sun: ['Government work', 'Leadership tasks', 'Meeting authority figures', 'Health matters'],
  Moon: ['Travel', 'Public events', 'Creative pursuits', 'Water-related work'],
  Mars: ['Physical activities', 'Property dealing', 'Surgery', 'Competitive tasks'],
  Mercury: ['Communication', 'Study/learning', 'Business deals', 'Writing/signing documents'],
  Jupiter: ['Religious activities', 'Teaching/education', 'Financial planning', 'Marriage rituals'],
  Venus: ['Romance', 'Arts/music', 'Buying luxury items', 'Social gatherings'],
  Saturn: ['Manual labor', 'Oil/iron related', 'Meditation', 'Avoid starting new ventures'],
}

interface HoraSlot {
  planet: string
  startTime: string
  endTime: string
  isCurrent: boolean
  isAuspicious: boolean
  activities: string[]
}

function calculateHoras(): HoraSlot[] {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const dayPlanet = VARA_PLANETS[dayOfWeek]

  // Find starting hora index for this day
  const startIndex = HORA_SEQUENCE.indexOf(dayPlanet)

  const sunrise = 6 // 6 AM approximate
  const sunset = 18  // 6 PM approximate
  const dayHoraMinutes = ((sunset - sunrise) * 60) / 12
  const nightHoraMinutes = ((24 - sunset + sunrise) * 60) / 12

  const currentHour = now.getHours() + now.getMinutes() / 60
  const horas: HoraSlot[] = []

  for (let i = 0; i < 24; i++) {
    const planetIndex = (startIndex + i) % 7
    const planet = HORA_SEQUENCE[planetIndex]
    const isDayHora = i < 12
    const horaMinutes = isDayHora ? dayHoraMinutes : nightHoraMinutes
    const baseHour = isDayHora ? sunrise : sunset

    const startMinutes = baseHour * 60 + (i % 12) * horaMinutes
    const endMinutes = startMinutes + horaMinutes

    const startH = Math.floor(startMinutes / 60) % 24
    const startM = Math.floor(startMinutes % 60)
    const endH = Math.floor(endMinutes / 60) % 24
    const endM = Math.floor(endMinutes % 60)

    const startDecimal = startH + startM / 60
    const endDecimal = endH + endM / 60

    const isCurrent = currentHour >= startDecimal && currentHour < endDecimal

    const fmt = (h: number, m: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
    }

    horas.push({
      planet,
      startTime: fmt(startH, startM),
      endTime: fmt(endH, endM),
      isCurrent,
      isAuspicious: ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet),
      activities: HORA_ACTIVITIES[planet] || [],
    })
  }

  return horas
}

// ─── Muhurta suggestions for common activities ──────────────────────────────

interface MuhurtaSuggestion {
  activity: string
  icon: string
  bestHora: string
  bestDay: string
  description: string
}

const MUHURTA_SUGGESTIONS: MuhurtaSuggestion[] = [
  { activity: 'Business Meeting', icon: '\u{1F4BC}', bestHora: 'Mercury or Jupiter', bestDay: 'Wednesday or Thursday', description: 'Mercury hora boosts communication; Jupiter hora attracts positive outcomes.' },
  { activity: 'Job Interview', icon: '\u{1F3AF}', bestHora: 'Jupiter or Sun', bestDay: 'Thursday or Sunday', description: 'Jupiter for wisdom & favor; Sun for authority & confidence.' },
  { activity: 'Medical Treatment', icon: '\u{1FA7A}', bestHora: 'Sun or Jupiter', bestDay: 'Sunday or Thursday', description: 'Avoid Mars hora for surgery unless urgently needed. Sun aids recovery.' },
  { activity: 'Marriage Proposal', icon: '\u{1F48D}', bestHora: 'Venus or Jupiter', bestDay: 'Friday or Thursday', description: 'Venus governs love; Jupiter blesses unions with dharma.' },
  { activity: 'Travel', icon: '\u2708\uFE0F', bestHora: 'Moon or Mercury', bestDay: 'Monday or Wednesday', description: 'Moon for safe journeys; Mercury for business travel.' },
  { activity: 'Property Purchase', icon: '\u{1F3E0}', bestHora: 'Jupiter or Venus', bestDay: 'Thursday or Friday', description: 'Jupiter expands wealth; Venus brings comfort to the home.' },
  { activity: 'Study / Exam', icon: '\u{1F4DA}', bestHora: 'Mercury or Jupiter', bestDay: 'Wednesday or Thursday', description: 'Mercury sharpens intellect; Jupiter grants wisdom.' },
  { activity: 'Starting a Business', icon: '\u{1F680}', bestHora: 'Jupiter or Mercury', bestDay: 'Thursday or Wednesday', description: 'Avoid Saturn hora for new ventures. Jupiter ensures growth.' },
  { activity: 'Spiritual Practice', icon: '\u{1F9D8}', bestHora: 'Jupiter or Saturn', bestDay: 'Thursday or Saturday', description: 'Jupiter for devotion; Saturn for deep discipline and tapas.' },
  { activity: 'Investment', icon: '\u{1F4B0}', bestHora: 'Jupiter or Venus', bestDay: 'Thursday or Friday', description: 'Jupiter grows wealth; Venus attracts material prosperity.' },
]

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MuhurtaAlertsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'today' | 'planner'>('today')
  const horas = useMemo(() => calculateHoras(), [])
  const currentHora = horas.find(h => h.isCurrent)

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-cinzel text-white">Muhurta Planner</h1>
          <p className="text-sm text-white/40">Find the perfect time for every activity</p>
        </div>
      </div>

      {/* Current Hora Hero */}
      {currentHora && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl mb-6 border bg-gradient-to-r ${HORA_COLORS[currentHora.planet]}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-amber-400" />
            <span className="text-xs text-amber-400 uppercase tracking-wider font-medium">Current Hora</span>
          </div>
          <h3 className="text-2xl font-cinzel text-white mb-1">{currentHora.planet} Hora</h3>
          <p className="text-white/50 text-sm">{currentHora.startTime} — {currentHora.endTime}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentHora.activities.map(a => (
              <span key={a} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">{a}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-4 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            tab === 'today' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50'
          }`}
        >
          <Clock size={14} /> Today&apos;s Horas
        </button>
        <button
          onClick={() => setTab('planner')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            tab === 'planner' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50'
          }`}
        >
          <Star size={14} /> Activity Planner
        </button>
      </div>

      {tab === 'today' ? (
        <div className="space-y-2">
          {horas.map((hora, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                hora.isCurrent
                  ? `bg-gradient-to-r ${HORA_COLORS[hora.planet]} ring-1 ring-amber-400/30`
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                hora.isAuspicious ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
              }`}>
                {hora.planet.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{hora.planet}</span>
                  {hora.isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">NOW</span>
                  )}
                  {hora.isAuspicious && !hora.isCurrent && (
                    <CheckCircle size={12} className="text-green-400/50" />
                  )}
                </div>
                <span className="text-white/30 text-xs">{hora.startTime} — {hora.endTime}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {MUHURTA_SUGGESTIONS.map((s, i) => (
            <motion.div
              key={s.activity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h3 className="text-white font-medium text-sm">{s.activity}</h3>
                  <p className="text-amber-400/70 text-xs">Best: {s.bestHora} hora on {s.bestDay}</p>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
