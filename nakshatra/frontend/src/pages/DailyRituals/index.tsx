import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  Sun,
  Moon,
  Star,
  Zap,
  BookOpen,
  CreditCard,
  Hash,
  Compass,
  CheckCircle2,
  Circle,
  Flame,
  Award,
  Sparkles,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MorningRitual {
  id: string
  title: string
  subtitle: string
  xp: number
  icon: React.ElementType
  color: string
  bgColor: string
}

interface DailyChallenge {
  day: string
  planet: string
  planetIcon: string
  title: string
  description: string
  task: string
  xp: number
  color: string
}

interface PlanetDay {
  day: string
  short: string
  planet: string
  planetIcon: string
  energy: string
  color: string
  bgClass: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MORNING_RITUALS: MorningRitual[] = [
  {
    id: 'daily_shloka',
    title: 'Read Daily Shloka',
    subtitle: "Today's sacred verse from the scriptures",
    xp: 10,
    icon: BookOpen,
    color: 'text-saffron',
    bgColor: 'bg-saffron/10 border-saffron/25',
  },
  {
    id: 'planetary_energy',
    title: "Check Today's Planetary Energy",
    subtitle: "See which planet rules today and its influence",
    xp: 5,
    icon: Star,
    color: 'text-celestial',
    bgColor: 'bg-celestial/10 border-celestial/25',
  },
  {
    id: 'tarot_pull',
    title: 'Daily Tarot Card Pull',
    subtitle: 'Draw one card for the day ahead',
    xp: 15,
    icon: CreditCard,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/25',
  },
  {
    id: 'numerology_insight',
    title: 'Daily Numerology Insight',
    subtitle: "Discover today's Personal Day number and its meaning",
    xp: 10,
    icon: Hash,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/25',
  },
]

const PLANET_DAYS: PlanetDay[] = [
  {
    day: 'Sunday',
    short: 'Sun',
    planet: 'Sun',
    planetIcon: '☀️',
    energy: 'Vitality, leadership, self-expression, and creative power',
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/25',
  },
  {
    day: 'Monday',
    short: 'Mon',
    planet: 'Moon',
    planetIcon: '🌙',
    energy: 'Emotions, intuition, nurturing, inner world, and subconscious',
    color: 'text-slate-300',
    bgClass: 'bg-slate-500/10 border-slate-400/20',
  },
  {
    day: 'Tuesday',
    short: 'Tue',
    planet: 'Mars',
    planetIcon: '🔴',
    energy: 'Action, courage, drive, willpower, and assertiveness',
    color: 'text-red-400',
    bgClass: 'bg-red-500/10 border-red-500/25',
  },
  {
    day: 'Wednesday',
    short: 'Wed',
    planet: 'Mercury',
    planetIcon: '☿',
    energy: 'Communication, intellect, commerce, and adaptability',
    color: 'text-green-400',
    bgClass: 'bg-green-500/10 border-green-500/20',
  },
  {
    day: 'Thursday',
    short: 'Thu',
    planet: 'Jupiter',
    planetIcon: '🪐',
    energy: 'Wisdom, expansion, abundance, philosophy, and grace',
    color: 'text-yellow-400',
    bgClass: 'bg-yellow-500/10 border-yellow-500/25',
  },
  {
    day: 'Friday',
    short: 'Fri',
    planet: 'Venus',
    planetIcon: '♀',
    energy: 'Love, beauty, art, harmony, pleasure, and relationships',
    color: 'text-pink-400',
    bgClass: 'bg-pink-500/10 border-pink-500/20',
  },
  {
    day: 'Saturday',
    short: 'Sat',
    planet: 'Saturn',
    planetIcon: '🪐',
    energy: 'Discipline, karma, structure, perseverance, and lessons',
    color: 'text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
]

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    day: 'Monday',
    planet: 'Moon',
    planetIcon: '🌙',
    title: 'Moon Meditation',
    description: 'The Moon governs emotions and the inner world. Today, tune into your emotional currents.',
    task: 'Draw a tarot card for emotional guidance and reflect on what feelings arise in your day.',
    xp: 50,
    color: 'text-slate-300',
  },
  {
    day: 'Tuesday',
    planet: 'Mars',
    planetIcon: '🔴',
    title: 'Mars Energy',
    description: 'Mars brings courage and directional force. Channel this energy into focused action.',
    task: 'In a sample Kundli, identify the position of Mars and understand which house it activates.',
    xp: 45,
    color: 'text-red-400',
  },
  {
    day: 'Wednesday',
    planet: 'Mercury',
    planetIcon: '☿',
    title: 'Mercury Wisdom',
    description: 'Mercury sharpens the mind. Today is ideal for study, communication, and learning.',
    task: 'Complete the Scripture Quiz and read Bhagavad Gita Chapter 3 — The Path of Action.',
    xp: 60,
    color: 'text-green-400',
  },
  {
    day: 'Thursday',
    planet: 'Jupiter',
    planetIcon: '🪐',
    title: 'Jupiter Blessings',
    description: 'Jupiter expands what it touches. Receive its blessings through study and generosity.',
    task: 'Calculate the Life Path Number for a person you admire and share what you discover.',
    xp: 40,
    color: 'text-yellow-400',
  },
  {
    day: 'Friday',
    planet: 'Venus',
    planetIcon: '♀',
    title: 'Venus Beauty',
    description: 'Venus invites you to create harmony and appreciate beauty in all its forms.',
    task: "Review your Vastu zones and identify which area of your home represents the 'beauty zone.'",
    xp: 35,
    color: 'text-pink-400',
  },
  {
    day: 'Saturday',
    planet: 'Saturn',
    planetIcon: '🪐',
    title: 'Saturn Discipline',
    description: 'Saturn rewards persistent effort. Honor the discipline you have built.',
    task: 'Check your 7-day streak status and complete all four morning rituals today.',
    xp: 55,
    color: 'text-blue-400',
  },
  {
    day: 'Sunday',
    planet: 'Sun',
    planetIcon: '☀️',
    title: 'Sun Consciousness',
    description: 'The Sun illuminates your highest self. Today is for clarity, purpose, and light.',
    task: 'Read 3 verses from the Bhagavad Gita and meditate on how they apply to your life.',
    xp: 65,
    color: 'text-amber-400',
  },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function getTodayData() {
  const today = new Date()
  const dayIndex = today.getDay() // 0=Sunday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[dayIndex]
  const planetDay = PLANET_DAYS.find((p) => p.day === dayName) ?? PLANET_DAYS[0]
  const challenge = DAILY_CHALLENGES.find((c) => c.day === dayName) ?? DAILY_CHALLENGES[0]
  return { dayName, planetDay, challenge, dayIndex }
}

// ─── Ritual Card ──────────────────────────────────────────────────────────────

function RitualCard({
  ritual,
  completed,
  onComplete,
}: {
  ritual: MorningRitual
  completed: boolean
  onComplete: () => void
}) {
  const Icon = ritual.icon

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        completed
          ? 'bg-green-500/8 border-green-500/25'
          : `${ritual.bgColor}`
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            completed ? 'bg-green-500/20' : 'bg-white/8'
          }`}
        >
          <Icon className={`w-5 h-5 ${completed ? 'text-green-400' : ritual.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`text-sm font-cinzel ${completed ? 'text-white/50 line-through' : 'text-white/85'}`}>
            {ritual.title}
          </div>
          <div className="text-xs text-white/40 font-cormorant truncate">{ritual.subtitle}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-cinzel ${completed ? 'text-white/30' : 'text-saffron'}`}>
            +{ritual.xp} XP
          </span>
          <button
            onClick={onComplete}
            disabled={completed}
            className="transition-all"
          >
            {completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Circle className="w-5 h-5 text-white/25 hover:text-saffron transition-colors" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Weekly Calendar ──────────────────────────────────────────────────────────

function WeeklyCalendar({ todayIndex }: { todayIndex: number }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {PLANET_DAYS.map((day, i) => {
        // Map PLANET_DAYS index (0=Sunday) to match JS Date.getDay()
        const isToday = i === todayIndex
        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-2 text-center transition-all ${
              isToday
                ? `${day.bgClass} ring-1 ring-offset-0`
                : 'border-white/5 bg-white/3'
            }`}
          >
            <div className={`text-lg mb-1 ${!isToday && 'opacity-50'}`}>{day.planetIcon}</div>
            <div className={`text-[9px] font-cinzel mb-0.5 ${isToday ? day.color : 'text-white/30'}`}>
              {day.short}
            </div>
            <div className={`text-[9px] font-cormorant ${isToday ? 'text-white/65' : 'text-white/25'}`}>
              {day.planet}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyRituals() {
  const { addXP, updateStreak, user } = useStore()
  const { dayName, planetDay, challenge, dayIndex } = useMemo(() => getTodayData(), [])

  const [completedRituals, setCompletedRituals] = useState<string[]>([])
  const [challengeComplete, setChallengeComplete] = useState(false)

  const allRitualsComplete = completedRituals.length === MORNING_RITUALS.length

  const handleCompleteRitual = (ritual: MorningRitual) => {
    if (completedRituals.includes(ritual.id)) return
    setCompletedRituals((prev) => [...prev, ritual.id])
    addXP(ritual.xp, `ritual_${ritual.id}`)
    updateStreak()
    toast.success(`+${ritual.xp} XP — ${ritual.title} complete!`, { icon: '✨' })
  }

  const handleCompleteChallenge = () => {
    if (challengeComplete) return
    setChallengeComplete(true)
    addXP(challenge.xp, 'daily_challenge')
    updateStreak()
    toast.success(`+${challenge.xp} XP — Daily challenge complete!`, { icon: '🏆' })
  }

  const handleCompleteAll = () => {
    const uncompleted = MORNING_RITUALS.filter((r) => !completedRituals.includes(r.id))
    if (uncompleted.length === 0) return
    let totalXP = 0
    uncompleted.forEach((r) => {
      totalXP += r.xp
    })
    setCompletedRituals(MORNING_RITUALS.map((r) => r.id))
    addXP(totalXP, 'complete_all_rituals')
    updateStreak()
    toast.success(`All rituals complete! +${totalXP} XP earned!`, { icon: '🌅' })
  }

  const completedCount = completedRituals.length
  const totalRituals = MORNING_RITUALS.length
  const progressPercent = (completedCount / totalRituals) * 100

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sun className="w-7 h-7 text-saffron" />
          <h1 className="text-3xl font-cinzel text-gold-gradient">Daily Rituals</h1>
          <Moon className="w-7 h-7 text-celestial" />
        </div>
        <p className="text-white/60 font-cormorant text-lg">
          Cultivate your cosmic practice, one sacred day at a time
        </p>
        <div className="mt-2 text-sm text-saffron font-cinzel">
          {dayName} — {planetDay.planet} Day {planetDay.planetIcon}
        </div>
      </motion.div>

      {/* Today's Planetary Energy Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border p-5 mb-6 ${planetDay.bgClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl">{planetDay.planetIcon}</div>
          <div className="flex-1">
            <div className={`text-sm font-cinzel ${planetDay.color} mb-1`}>
              {planetDay.planet} Rules Today
            </div>
            <div className="text-xs text-white/60 font-cormorant leading-relaxed">
              {planetDay.energy}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Morning Rituals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-cinzel text-champagne">Morning Rituals</h2>
            <p className="text-xs text-white/40 font-cormorant">
              {completedCount}/{totalRituals} complete
            </p>
          </div>
          {allRitualsComplete ? (
            <div className="flex items-center gap-1.5 text-green-400 text-xs font-cinzel">
              <CheckCircle2 className="w-4 h-4" /> All Done!
            </div>
          ) : (
            <button
              onClick={handleCompleteAll}
              className="text-xs text-saffron/60 hover:text-saffron font-cinzel transition-colors"
            >
              Complete All
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 mb-5 overflow-hidden">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full transition-all ${
              allRitualsComplete
                ? 'bg-green-400'
                : 'bg-gradient-to-r from-saffron to-gold'
            }`}
          />
        </div>

        <div className="space-y-3">
          {MORNING_RITUALS.map((ritual, i) => (
            <motion.div
              key={ritual.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
            >
              <RitualCard
                ritual={ritual}
                completed={completedRituals.includes(ritual.id)}
                onComplete={() => handleCompleteRitual(ritual)}
              />
            </motion.div>
          ))}
        </div>

        {/* Streak reminder */}
        {user && user.streakDays > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-orange-400/70 font-cormorant">
            <Flame className="w-3.5 h-3.5" />
            <span>{user.streakDays}-day streak — keep it alive today!</span>
          </div>
        )}

        <AnimatePresence>
          {allRitualsComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-center"
            >
              <div className="text-2xl mb-1">🌅</div>
              <div className="text-sm font-cinzel text-green-400">Morning Rituals Complete!</div>
              <div className="text-xs text-white/40 font-cormorant mt-0.5">
                Your cosmic practice is in full bloom today
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card shimmer-border rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-cinzel text-champagne">Daily Challenge</h2>
        </div>

        {/* Challenge Card */}
        <div className={`rounded-xl border p-4 mb-4 ${
          challengeComplete ? 'bg-green-500/8 border-green-500/20' : 'bg-white/5 border-white/8'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{challenge.planetIcon}</span>
            <div>
              <div className={`text-base font-cinzel ${challenge.color}`}>{challenge.title}</div>
              <div className="text-xs text-white/40 font-cormorant">{challenge.planet} Day Challenge</div>
            </div>
            <div className="ml-auto">
              <span className={`text-sm font-cinzel ${challengeComplete ? 'text-white/30' : 'text-gold'}`}>
                +{challenge.xp} XP
              </span>
            </div>
          </div>

          <p className="text-sm text-white/65 font-cormorant leading-relaxed mb-3">
            {challenge.description}
          </p>

          <div className="bg-white/5 rounded-lg p-3 mb-4">
            <div className="text-[10px] font-cinzel text-saffron uppercase tracking-wider mb-1.5">
              Your Task
            </div>
            <p className="text-sm text-white/70 font-cormorant">
              {challenge.task}
            </p>
          </div>

          <button
            onClick={handleCompleteChallenge}
            disabled={challengeComplete}
            className={`w-full py-3 rounded-xl font-cinzel text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              challengeComplete
                ? 'bg-green-500/15 border border-green-500/25 text-green-400 cursor-default'
                : 'bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25'
            }`}
          >
            {challengeComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Challenge Complete!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Mark Challenge Complete
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Weekly Planetary Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-celestial" />
          <h2 className="text-lg font-cinzel text-champagne">Weekly Planetary Calendar</h2>
        </div>

        <WeeklyCalendar todayIndex={dayIndex} />

        {/* Expanded day details */}
        <div className="mt-5 p-4 rounded-xl bg-white/3 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{planetDay.planetIcon}</span>
            <div>
              <div className={`text-sm font-cinzel ${planetDay.color}`}>{planetDay.day}</div>
              <div className="text-xs text-white/40 font-cinzel">{planetDay.planet} Day</div>
            </div>
          </div>
          <p className="text-sm text-white/65 font-cormorant leading-relaxed">
            {planetDay.energy}
          </p>
        </div>

        {/* Full weekly energy guide */}
        <div className="mt-4 space-y-2">
          {PLANET_DAYS.map((day, i) => {
            const isToday = i === dayIndex
            return (
              <div
                key={day.day}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isToday ? `${day.bgClass}` : 'hover:bg-white/3'
                }`}
              >
                <span className="text-base w-6 text-center flex-shrink-0">{day.planetIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-cinzel ${isToday ? day.color : 'text-white/45'}`}>
                    {day.day}
                    {isToday && <span className="ml-1.5 text-[9px] bg-saffron/20 text-saffron px-1.5 py-0.5 rounded-full">Today</span>}
                  </div>
                  <div className="text-xs text-white/30 font-cormorant truncate">{day.energy.split(',')[0]}</div>
                </div>
                <div className={`text-[10px] font-cinzel flex-shrink-0 ${isToday ? day.color : 'text-white/25'}`}>
                  {day.planet}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Bottom XP summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex items-center justify-center gap-3 text-xs text-white/30 font-cormorant"
      >
        <Zap className="w-3.5 h-3.5 text-gold/50" />
        <span>
          Max daily XP:{' '}
          <span className="text-gold/70 font-cinzel">
            {MORNING_RITUALS.reduce((s, r) => s + r.xp, 0) + (DAILY_CHALLENGES[0]?.xp ?? 0)}
          </span>{' '}
          XP
        </span>
      </motion.div>
    </div>
  )
}
