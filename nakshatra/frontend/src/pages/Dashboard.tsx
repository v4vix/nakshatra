import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { getDailyShloka } from '@/services/api'
import {
  Flame, Star, Zap, Trophy, BookOpen, Sparkles,
  ChevronRight, Clock, Activity, TrendingUp
} from 'lucide-react'

// ─── Cosmic Energy Engine ──────────────────────────────────────────────────

interface PlanetaryEnergy {
  planet: string
  symbol: string
  color: string
  colorClass: string
  borderClass: string
  bgClass: string
  tip: string
  element: string
}

const PLANETARY_ENERGIES: Record<number, PlanetaryEnergy> = {
  0: {
    planet: 'Sun', symbol: '☀️', color: '#FFB347', colorClass: 'text-amber-400',
    borderClass: 'border-amber-400/40', bgClass: 'bg-amber-400/10',
    tip: 'Channel solar energy — lead boldly, shine your authentic self, take initiative.',
    element: 'Fire'
  },
  1: {
    planet: 'Moon', symbol: '🌙', color: '#C0C0FF', colorClass: 'text-indigo-300',
    borderClass: 'border-indigo-300/40', bgClass: 'bg-indigo-300/10',
    tip: 'Lunar energy flows — trust intuition, nurture relationships, reflect inward.',
    element: 'Water'
  },
  2: {
    planet: 'Mars', symbol: '♂', color: '#FF4444', colorClass: 'text-red-400',
    borderClass: 'border-red-400/40', bgClass: 'bg-red-400/10',
    tip: 'Mars ignites courage — take decisive action, overcome obstacles, assert your will.',
    element: 'Fire'
  },
  3: {
    planet: 'Mercury', symbol: '☿', color: '#7DF9FF', colorClass: 'text-cyan-300',
    borderClass: 'border-cyan-300/40', bgClass: 'bg-cyan-300/10',
    tip: 'Mercury sharpens the mind — communicate clearly, learn something new, solve puzzles.',
    element: 'Air'
  },
  4: {
    planet: 'Jupiter', symbol: '♃', color: '#FFD700', colorClass: 'text-yellow-300',
    borderClass: 'border-yellow-300/40', bgClass: 'bg-yellow-300/10',
    tip: 'Jupiter expands blessings — seek wisdom, be generous, pursue spiritual growth.',
    element: 'Ether'
  },
  5: {
    planet: 'Venus', symbol: '♀', color: '#FFB6C1', colorClass: 'text-pink-300',
    borderClass: 'border-pink-300/40', bgClass: 'bg-pink-300/10',
    tip: 'Venus graces your day — appreciate beauty, cultivate harmony, enjoy the arts.',
    element: 'Water'
  },
  6: {
    planet: 'Saturn', symbol: '♄', color: '#9B87F5', colorClass: 'text-violet-400',
    borderClass: 'border-violet-400/40', bgClass: 'bg-violet-400/10',
    tip: 'Saturn demands discipline — work steadily, build lasting foundations, honor karma.',
    element: 'Earth'
  },
}

function getDailyCosmicEnergy(date: Date): PlanetaryEnergy {
  return PLANETARY_ENERGIES[date.getDay()]
}

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']

function getMoonPhase(date: Date): { phase: string; name: string } {
  // Approximate lunar cycle: ~29.53 days
  // Known new moon: Jan 11 2024
  const knownNewMoon = new Date(2024, 0, 11) // Jan 11 2024 local (avoids UTC parse bug)
  const daysSince = Math.floor((date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24))
  const cycleDay = ((daysSince % 30) + 30) % 30
  const phaseIndex = Math.floor(cycleDay / 3.75)
  const safeIndex = Math.min(phaseIndex, 7)
  const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
  return { phase: MOON_PHASES[safeIndex], name: names[safeIndex] }
}

// ─── Daily Challenge (deterministic by date) ──────────────────────────────

interface DailyChallenge {
  type: string
  title: string
  question: string
  options: string[]
  answer: number
  xp: number
  icon: string
}

const CHALLENGES: DailyChallenge[] = [
  {
    type: 'Nakshatra Quiz', title: 'Lunar Mansion Mystery',
    question: 'Which nakshatra is ruled by the Moon itself?',
    options: ['Rohini', 'Hasta', 'Shravana', 'Punarvasu'],
    answer: 0, xp: 30, icon: '🌙'
  },
  {
    type: 'Graha Quiz', title: 'Planetary Rulership',
    question: 'Which planet is called "Guru" in Vedic astrology?',
    options: ['Mars', 'Jupiter', 'Saturn', 'Venus'],
    answer: 1, xp: 25, icon: '⭐'
  },
  {
    type: 'Tarot Reflection', title: 'Arcana Wisdom',
    question: 'The High Priestess represents which quality?',
    options: ['Action', 'Intuition', 'Strength', 'Change'],
    answer: 1, xp: 20, icon: '🔮'
  },
  {
    type: 'Rashi Quiz', title: 'Sign Wisdom',
    question: 'Which rashi is ruled by Jupiter as its exaltation sign?',
    options: ['Dhanu', 'Meena', 'Karka', 'Tula'],
    answer: 2, xp: 30, icon: '♓'
  },
  {
    type: 'Dasha Quiz', title: 'Mahadasha Master',
    question: 'How many years does the Sun\'s Mahadasha last?',
    options: ['7 years', '6 years', '10 years', '18 years'],
    answer: 1, xp: 35, icon: '☀️'
  },
  {
    type: 'Yoga Quiz', title: 'Auspicious Combination',
    question: 'Gajakesari yoga is formed by the conjunction of Moon and which planet?',
    options: ['Sun', 'Saturn', 'Jupiter', 'Venus'],
    answer: 2, xp: 40, icon: '✨'
  },
  {
    type: 'Vastu Quiz', title: 'Sacred Directions',
    question: 'Which direction is ruled by Kubera, the lord of wealth?',
    options: ['South', 'East', 'North', 'West'],
    answer: 2, xp: 25, icon: '🏠'
  },
]

function getDailyChallenge(date: Date): DailyChallenge {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  return CHALLENGES[seed % CHALLENGES.length]
}

// ─── Feature Cards ─────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    id: 'kundli', title: 'Kundli', subtitle: 'Your Birth Chart Awaits',
    description: 'Decode the cosmic blueprint of your soul through Vedic birth chart analysis.',
    icon: '⬡', link: '/kundli', gradient: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/30', badge: 'Birth Chart'
  },
  {
    id: 'tarot', title: 'Tarot', subtitle: 'Daily Draw Invitation',
    description: 'Let the ancient cards reveal guidance from the cosmic consciousness.',
    icon: '🃏', link: '/tarot', gradient: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/30', badge: 'Daily Card'
  },
  {
    id: 'numerology', title: 'Numerology', subtitle: 'Numbers of Destiny',
    description: 'Your name and birthdate encode your soul\'s mission in sacred numbers.',
    icon: '✦', link: '/numerology', gradient: 'from-cyan-500/20 to-blue-600/10',
    border: 'border-cyan-500/30', badge: 'Core Numbers'
  },
  {
    id: 'vastu', title: 'Vastu Shastra', subtitle: 'Sacred Architecture',
    description: 'Align your living space with cosmic energies for prosperity and peace.',
    icon: '🏛', link: '/vastu', gradient: 'from-green-500/20 to-emerald-600/10',
    border: 'border-green-500/30', badge: 'Space Energy'
  },
  {
    id: 'scriptures', title: 'Scriptures', subtitle: 'Ancient Wisdom Daily',
    description: '"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन" — Gita 2.47',
    icon: '📿', link: '/scriptures', gradient: 'from-rose-500/20 to-pink-600/10',
    border: 'border-rose-500/30', badge: 'Daily Shloka'
  },
  {
    id: 'rituals', title: 'Daily Rituals', subtitle: 'Sacred Practice',
    description: 'Guided Vedic rituals, mantras, and planetary remedies for each day.',
    icon: '🕯', link: '/daily-rituals', gradient: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-500/30', badge: 'Remedies'
  },
  {
    id: 'transits', title: 'Transits', subtitle: 'Live Planetary Positions',
    description: 'Track real-time positions of all 9 Vedic planets and their effects on your chart.',
    icon: '🪐', link: '/transits', gradient: 'from-indigo-500/20 to-blue-600/10',
    border: 'border-indigo-500/30', badge: 'Live'
  },
  {
    id: 'calendar', title: 'Cosmic Calendar', subtitle: 'Panchanga at a Glance',
    description: 'Month view with tithis, nakshatras, festivals, and daily auspiciousness ratings.',
    icon: '📅', link: '/calendar', gradient: 'from-teal-500/20 to-emerald-600/10',
    border: 'border-teal-500/30', badge: 'Festivals'
  },
  {
    id: 'remedies', title: 'Remedies', subtitle: 'Strengthen Your Planets',
    description: 'Personalized mantras, gemstones, and practices to balance your cosmic energies.',
    icon: '💎', link: '/remedies', gradient: 'from-orange-500/20 to-red-600/10',
    border: 'border-orange-500/30', badge: 'Personalized'
  },
  {
    id: 'quiz', title: 'Quiz Arena', subtitle: 'Test Your Knowledge',
    description: 'Challenge yourself with 100+ Vedic astrology questions and earn XP rewards.',
    icon: '🧠', link: '/quiz', gradient: 'from-fuchsia-500/20 to-purple-600/10',
    border: 'border-fuchsia-500/30', badge: 'Earn XP'
  },
  {
    id: 'mood', title: 'Mood Journal', subtitle: 'Track Your Cosmic Mood',
    description: 'Log your daily emotions and correlate them with planetary transits over time.',
    icon: '📓', link: '/mood-journal', gradient: 'from-rose-500/20 to-pink-600/10',
    border: 'border-rose-500/30', badge: 'Daily'
  },
  {
    id: 'muhurta-alerts', title: 'Muhurta Planner', subtitle: 'Perfect Timing for Everything',
    description: 'Find the ideal planetary hora for meetings, travel, investments, and more.',
    icon: '⏰', link: '/muhurta-alerts', gradient: 'from-sky-500/20 to-blue-600/10',
    border: 'border-sky-500/30', badge: 'Hora'
  },
  {
    id: 'learning', title: 'Learning Paths', subtitle: 'Master Vedic Astrology',
    description: 'Structured courses from basics to advanced yogas, dashas, and remedies.',
    icon: '📚', link: '/learning', gradient: 'from-lime-500/20 to-green-600/10',
    border: 'border-lime-500/30', badge: 'Courses'
  },
  {
    id: 'year-ahead', title: 'Year Ahead', subtitle: 'Your Annual Forecast',
    description: 'Comprehensive predictions for career, love, finance, health, and spirituality.',
    icon: '🔮', link: '/year-ahead', gradient: 'from-violet-500/20 to-indigo-600/10',
    border: 'border-violet-500/30', badge: 'Forecast'
  },
]

// ─── Animation Variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function XPBar({ xp, xpToNext }: { xp: number; xpToNext: number }) {
  const pct = Math.min((xp / xpToNext) * 100, 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gold/60 mb-1 font-cinzel">
        <span>{xp.toLocaleString()} XP</span>
        <span>{xpToNext.toLocaleString()} XP</span>
      </div>
      <div className="h-2 rounded-full bg-stardust/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-saffron to-gold"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div variants={itemVariants} className="glass-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gold/60 text-sm mb-1">
        {icon}
        <span className="font-cinzel text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-cinzel font-bold text-gold-gradient">{value}</div>
      {sub && <div className="text-xs text-slate-400 font-cormorant">{sub}</div>}
    </motion.div>
  )
}

function DailyChallengeCard({ challenge, date }: { challenge: DailyChallenge; date: Date }) {
  const { user, addXP } = useStore()
  const todayKey = `challenge-${date.toISOString().split('T')[0]}`
  const completed = user?.completedChallenges?.includes(todayKey) ?? false
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(completed)

  function handleSelect(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    if (idx === challenge.answer) {
      addXP(challenge.xp, 'DAILY_CHALLENGE_COMPLETE')
    }
  }

  return (
    <motion.div variants={itemVariants} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div>
            <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider">{challenge.type}</div>
            <div className="font-cinzel text-lg text-white">{challenge.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gold/10 border border-gold/30 rounded-full px-3 py-1">
          <Zap size={12} className="text-gold" />
          <span className="text-xs font-cinzel text-gold">+{challenge.xp} XP</span>
        </div>
      </div>

      <p className="font-cormorant text-slate-300 text-lg mb-4">{challenge.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {challenge.options.map((opt, idx) => {
          const isCorrect = idx === challenge.answer
          const isSelected = idx === selected
          let cls = 'border border-stardust/60 bg-stardust/30 text-slate-300 hover:border-gold/40 hover:bg-gold/5 cursor-pointer'
          if (revealed) {
            if (isCorrect) cls = 'border border-green-400/60 bg-green-400/10 text-green-300'
            else if (isSelected && !isCorrect) cls = 'border border-red-400/60 bg-red-400/10 text-red-300'
            else cls = 'border border-stardust/30 bg-stardust/10 text-slate-500'
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`rounded-xl px-4 py-3 text-sm font-cormorant text-left transition-all duration-200 ${cls}`}
            >
              <span className="font-cinzel text-xs mr-2 opacity-60">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl text-sm font-cormorant ${selected === challenge.answer
            ? 'bg-green-500/10 border border-green-500/30 text-green-300'
            : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            }`}
        >
          {selected === challenge.answer
            ? `✓ Correct! +${challenge.xp} XP added to your cosmic journey.`
            : `The answer is: ${challenge.options[challenge.answer]}`}
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, kundlis, tarotReadings, numerologyProfile } = useStore()
  const today = useMemo(() => new Date(), [])
  const cosmicEnergy = useMemo(() => getDailyCosmicEnergy(today), [today])
  const moonPhase = useMemo(() => getMoonPhase(today), [today])
  const challenge = useMemo(() => getDailyChallenge(today), [today])

  const [dailyShloka, setDailyShloka] = useState<{ text: string; source: string; translation?: string } | null>(null)

  useEffect(() => {
    getDailyShloka()
      .then((data) => { if (data) setDailyShloka(data) })
      .catch(() => { /* silently ignore – dashboard stays functional */ })
  }, [])

  const activeKundli = kundlis[0] ?? null

  const weeklyXP = useMemo(() => {
    // Approximate: 50 XP per day shown (real app would compute from transactions)
    return user ? Math.floor((user.xp % 500) + 50) : 0
  }, [user])

  const { t } = useTranslation()
  const greetingHour = today.getHours()
  const greeting = greetingHour < 12 ? t('dashboard.goodMorning') : greetingHour < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening')
  const displayName = user?.fullName?.split(' ')[0] || user?.username || 'Seeker'

  const recentActivity = useMemo(() => {
    const items: { icon: string; text: string; time: string; color: string }[] = []
    if (tarotReadings.length > 0) {
      const r = tarotReadings[0]
      const d = new Date(r.createdAt)
      items.push({
        icon: '🃏', text: `Tarot reading: ${r.spreadType}`,
        time: d.toLocaleDateString(), color: 'text-violet-300'
      })
    }
    if (kundlis.length > 0) {
      const k = kundlis[0]
      const d = new Date(k.createdAt)
      items.push({
        icon: '⬡', text: `Kundli created for ${k.name}`,
        time: d.toLocaleDateString(), color: 'text-amber-300'
      })
    }
    if (numerologyProfile) {
      items.push({
        icon: '✦', text: `Numerology profile: ${numerologyProfile.fullName}`,
        time: 'Recent', color: 'text-cyan-300'
      })
    }
    if (items.length === 0) {
      items.push({ icon: '✨', text: 'Welcome! Begin your cosmic journey.', time: 'Now', color: 'text-gold' })
    }
    return items
  }, [tarotReadings, kundlis, numerologyProfile])

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

        {/* ── Header: Greeting + Level ─────────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-card p-6 shimmer-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{user?.avatar ?? '🌟'}</div>
              <div>
                <div className="text-xs font-cinzel text-gold/50 uppercase tracking-widest">{greeting}</div>
                <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-gold-gradient">{displayName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-cinzel text-slate-400">{t('dashboard.level')} {user?.level ?? 1}</span>
                  <span className="text-gold/40">·</span>
                  <span className="text-sm font-cormorant text-slate-400 italic">{user?.rank ?? 'Stardust Seeker'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-0 sm:min-w-48">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400 flex-shrink-0" />
                <span className="text-sm font-cinzel text-orange-300">{user?.streakDays ?? 0} {t('dashboard.dayStreak')}</span>
              </div>
              {user && <XPBar xp={user.xp} xpToNext={user.xpToNextLevel} />}
            </div>
          </div>
        </motion.div>

        {/* ── Daily Cosmic Overview ────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className={`glass-card p-6 border ${cosmicEnergy.borderClass}`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-gold" />
              <h2 className="font-cinzel text-sm uppercase tracking-widest text-gold">{t('dashboard.dailyCosmicOverview')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ruling planet */}
              <div className={`rounded-xl p-4 ${cosmicEnergy.bgClass} border ${cosmicEnergy.borderClass}`}>
                <div className="text-3xl mb-2">{cosmicEnergy.symbol}</div>
                <div className={`font-cinzel font-bold ${cosmicEnergy.colorClass}`}>{cosmicEnergy.planet} {t('dashboard.rulesToday')}</div>
                <div className="text-xs text-slate-400 mt-1">{cosmicEnergy.element} {t('dashboard.element')}</div>
                <p className="font-cormorant text-sm text-slate-300 mt-2 leading-relaxed">{cosmicEnergy.tip}</p>
              </div>
              {/* Moon phase */}
              <div className="rounded-xl p-4 bg-indigo-900/20 border border-indigo-500/20">
                <div className="text-3xl mb-2">{moonPhase.phase}</div>
                <div className="font-cinzel font-bold text-indigo-300">{t('dashboard.moonPhase')}</div>
                <div className="text-sm font-cormorant text-slate-300 mt-2">{moonPhase.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {moonPhase.name.includes('Full') ? t('dashboard.moonFull') :
                    moonPhase.name.includes('New') ? t('dashboard.moonNew') :
                      moonPhase.name.includes('Waxing') ? t('dashboard.moonWaxing') :
                        t('dashboard.moonWaning')}
                </div>
              </div>
              {/* Dasha or Date energy */}
              <div className="rounded-xl p-4 bg-gold/5 border border-gold/20">
                <div className="text-3xl mb-2">📅</div>
                <div className="font-cinzel font-bold text-gold">
                  {activeKundli?.dashas?.currentMahadasha?.planet
                    ? `${activeKundli.dashas.currentMahadasha.planet} ${t('dashboard.mahadasha')}`
                    : t('dashboard.todaysEnergy')}
                </div>
                {activeKundli?.dashas?.currentMahadasha ? (
                  <div className="text-sm font-cormorant text-slate-300 mt-2">
                    Antardasha: {activeKundli.dashas.currentAntardasha?.planet ?? '—'}
                    <div className="text-xs text-slate-400 mt-1">
                      Until {new Date(activeKundli.dashas.currentMahadasha.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-cormorant text-slate-300 mt-2">
                    Create your Kundli to unlock your Vimshottari Dasha periods.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Stats ──────────────────────────────────────────── */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<TrendingUp size={14} />} label={t('dashboard.xpThisWeek')} value={weeklyXP} sub={t('dashboard.cosmicPoints')} />
          <StatCard icon={<Flame size={14} />} label={t('dashboard.streak')} value={`${user?.streakDays ?? 0}d`} sub={t('dashboard.consecutiveDays')} />
          <StatCard icon={<BookOpen size={14} />} label={t('dashboard.readings')} value={tarotReadings.length + kundlis.length} sub={t('dashboard.totalSessions')} />
          <StatCard icon={<Trophy size={14} />} label={t('dashboard.achievementsLabel')} value={user?.achievements?.length ?? 0} sub={t('dashboard.unlocked')} />
        </motion.div>

        {/* ── Daily Shloka ────────────────────────────────────────── */}
        {dailyShloka && (
          <motion.div variants={itemVariants}>
            <div className="glass-card p-6 border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-amber-600/5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-rose-300" />
                <h2 className="font-cinzel text-sm uppercase tracking-widest text-rose-300">Today's Shloka</h2>
              </div>
              <blockquote className="font-cormorant text-lg text-white leading-relaxed italic">
                "{dailyShloka.text}"
              </blockquote>
              {dailyShloka.translation && (
                <p className="font-cormorant text-sm text-slate-300 mt-3 leading-relaxed">
                  {dailyShloka.translation}
                </p>
              )}
              <p className="font-cinzel text-xs text-gold/60 mt-4 tracking-wide">— {dailyShloka.source}</p>
            </div>
          </motion.div>
        )}

        {/* ── Feature Cards Grid ───────────────────────────────────── */}
        <div>
          <motion.h2 variants={itemVariants} className="font-cinzel text-sm uppercase tracking-widest text-gold/60 mb-3">
            {t('dashboard.exploreTheCosmos')}
          </motion.h2>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_CARDS.map((card) => (
              <motion.div key={card.id} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Link to={card.link} className="block h-full">
                  <div className={`glass-card h-full p-5 border ${card.border} bg-gradient-to-br ${card.gradient} hover:shadow-gold-glow transition-all duration-300`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{card.icon}</div>
                      <span className={`text-xs font-cinzel px-2 py-0.5 rounded-full border ${card.border} text-gold/70`}>
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="font-cinzel font-bold text-white text-lg">{card.title}</h3>
                    <p className="font-cinzel text-xs text-gold/60 mb-2">{card.subtitle}</p>
                    <p className="font-cormorant text-slate-400 text-sm leading-relaxed">{card.description}</p>
                    <div className="flex items-center gap-1 mt-4 text-gold/50 text-xs font-cinzel">
                      <span>Explore</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Bottom row: Challenge + Recent Activity ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Daily Challenge */}
          <div>
            <motion.h2 variants={itemVariants} className="font-cinzel text-sm uppercase tracking-widest text-gold/60 mb-3">
              {t('dashboard.dailyChallenge')}
            </motion.h2>
            <DailyChallengeCard challenge={challenge} date={today} />
          </div>

          {/* Recent Activity */}
          <div>
            <motion.h2 variants={itemVariants} className="font-cinzel text-sm uppercase tracking-widest text-gold/60 mb-3">
              {t('dashboard.recentActivity')}
            </motion.h2>
            <motion.div variants={itemVariants} className="glass-card p-5 space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-stardust/30 last:border-0">
                  <div className="text-xl flex-shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-cormorant ${item.color} truncate`}>{item.text}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-slate-500" />
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </div>
                  </div>
                  <Activity size={14} className="text-slate-600 flex-shrink-0 mt-1" />
                </div>
              ))}

              {/* Navigation links */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link to="/achievements" className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gold/5 border border-gold/20 text-xs font-cinzel text-gold/70 hover:bg-gold/10 transition-colors">
                  <Trophy size={12} />
                  {t('nav.achievements')}
                </Link>
                <Link to="/profile" className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gold/5 border border-gold/20 text-xs font-cinzel text-gold/70 hover:bg-gold/10 transition-colors">
                  <Star size={12} />
                  {t('nav.profile')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Footer Spacer ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <p className="text-xs font-cinzel text-slate-600 tracking-widest">
            ✦ यत्र योगेश्वरः कृष्णः ✦
          </p>
        </motion.div>

      </motion.div>
    </div>
  )
}
