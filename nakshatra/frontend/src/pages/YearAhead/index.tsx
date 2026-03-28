import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { getCurrentTransits, getUpcomingTransits } from '@/lib/transits'
import { RASHI_DATA, NAKSHATRA_NAMES, DASHA_YEARS, DASHA_SEQUENCE } from '@/lib/vedic-constants'
import { ArrowLeft, TrendingUp, Heart, Briefcase, Brain, Star, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Prediction Engine ──────────────────────────────────────────────────────

interface YearPrediction {
  area: string
  icon: React.ReactNode
  rating: number // 1-5
  summary: string
  advice: string
  color: string
}

function generatePredictions(rashiIndex: number, nakshatraIndex: number): YearPrediction[] {
  const rashi = RASHI_DATA[rashiIndex]
  const nakshatra = NAKSHATRA_NAMES[nakshatraIndex]
  const transits = getCurrentTransits()

  const jupiterRashi = transits.find(t => t.planet === 'Jupiter')?.rashi || 'Meena'
  const saturnRashi = transits.find(t => t.planet === 'Saturn')?.rashi || 'Meena'
  const jupiterFromMoon = ((RASHI_DATA.findIndex(r => r.name === jupiterRashi) - rashiIndex + 12) % 12) + 1
  const saturnFromMoon = ((RASHI_DATA.findIndex(r => r.name === saturnRashi) - rashiIndex + 12) % 12) + 1

  // Simplified prediction based on Jupiter/Saturn transit positions from birth rashi
  const jupiterBenefic = [1, 2, 5, 7, 9, 11].includes(jupiterFromMoon)
  const saturnChallenge = [1, 2, 12].includes(saturnFromMoon) // Sade Sati zone

  return [
    {
      area: 'Career & Profession',
      icon: <Briefcase size={18} />,
      rating: jupiterBenefic ? 4 : saturnChallenge ? 2 : 3,
      summary: jupiterBenefic
        ? `Jupiter in your ${jupiterFromMoon}th house brings expansion to career. New opportunities and recognition are likely.`
        : saturnChallenge
        ? `Saturn\'s transit near your Moon sign demands patience in career matters. Hard work now builds lasting foundations.`
        : `A steady year for career with gradual progress. Focus on skill development.`,
      advice: jupiterBenefic ? 'Take bold career steps. Network actively.' : 'Be patient. Avoid impulsive job changes.',
      color: 'text-blue-400',
    },
    {
      area: 'Love & Relationships',
      icon: <Heart size={18} />,
      rating: jupiterFromMoon === 7 ? 5 : saturnChallenge ? 2 : 3,
      summary: jupiterFromMoon === 7
        ? `Jupiter blesses your 7th house of partnerships! This is an excellent year for marriage, commitment, and deepening bonds.`
        : saturnChallenge
        ? `Saturn\'s influence may test relationships. Communication and patience are essential.`
        : `Relationships remain stable. Venus transits will bring periodic romantic highs throughout the year.`,
      advice: jupiterFromMoon === 7 ? 'Open your heart to commitment.' : 'Practice patience and honest communication.',
      color: 'text-pink-400',
    },
    {
      area: 'Finance & Wealth',
      icon: <TrendingUp size={18} />,
      rating: jupiterBenefic ? 4 : 3,
      summary: jupiterBenefic
        ? `Jupiter\'s positive placement supports financial growth. Investments made this year can yield good returns.`
        : `A year of financial discipline. Avoid speculative investments and focus on savings.`,
      advice: jupiterBenefic ? 'Invest in long-term assets. Donate on Thursdays.' : 'Budget carefully. Avoid lending large sums.',
      color: 'text-green-400',
    },
    {
      area: 'Health & Wellness',
      icon: <Shield size={18} />,
      rating: saturnChallenge ? 3 : 4,
      summary: saturnChallenge
        ? `Saturn\'s transit suggests paying extra attention to health. Chronic issues may flare up. Regular exercise and diet control are essential.`
        : `Generally good health. Mars transits may bring occasional energy fluctuations. Stay active.`,
      advice: saturnChallenge ? 'Get regular checkups. Practice yoga on Saturdays.' : 'Maintain your routine. Stay hydrated.',
      color: 'text-red-400',
    },
    {
      area: 'Spiritual Growth',
      icon: <Star size={18} />,
      rating: saturnChallenge ? 5 : jupiterBenefic ? 4 : 3,
      summary: saturnChallenge
        ? `Saturn\'s influence is the greatest spiritual teacher. This is an excellent period for deep meditation and self-discovery.`
        : `Regular spiritual practice will bring inner peace. Jupiter\'s blessings support devotional activities.`,
      advice: 'Meditate daily. Visit temples on Thursdays. Practice gratitude.',
      color: 'text-purple-400',
    },
    {
      area: 'Education & Knowledge',
      icon: <Brain size={18} />,
      rating: jupiterBenefic ? 4 : 3,
      summary: jupiterBenefic
        ? `Jupiter favors learning and academic pursuits. Higher education, certifications, and skill-building are strongly supported.`
        : `A good year for self-study and focused learning. Mercury\'s transits will bring clarity of thought.`,
      advice: jupiterBenefic ? 'Enroll in courses. Start that certification.' : 'Focus on depth over breadth in learning.',
      color: 'text-cyan-400',
    },
  ]
}

// ─── Monthly Overview ───────────────────────────────────────────────────────

const MONTH_THEMES = [
  'New beginnings, set intentions',
  'Financial review and planning',
  'Spring energy, communication focus',
  'Home and family matters arise',
  'Creative expression peaks',
  'Health awareness, service to others',
  'Relationships take center stage',
  'Transformation and deep change',
  'Travel and higher learning',
  'Career achievements highlighted',
  'Social connections expand',
  'Spiritual reflection and closure',
]

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function YearAheadPage() {
  const { t } = useTranslation()
  const { user } = useStore()
  const currentYear = new Date().getFullYear()

  // Use user birth data or defaults
  const rashiIndex = 10  // Default: Kumbha (Aquarius)
  const nakshatraIndex = 6 // Default: Punarvasu

  const predictions = useMemo(() => generatePredictions(rashiIndex, nakshatraIndex), [])
  const overallRating = Math.round(predictions.reduce((s, p) => s + p.rating, 0) / predictions.length * 10) / 10

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-cinzel text-white">{currentYear} Year Ahead</h1>
          <p className="text-sm text-white/40">{RASHI_DATA[rashiIndex].symbol} {RASHI_DATA[rashiIndex].name} ({RASHI_DATA[rashiIndex].western})</p>
        </div>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl mb-6 border border-amber-500/20 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(255,179,71,0.1), rgba(168,85,247,0.1))' }}
      >
        <p className="text-amber-400/60 text-xs uppercase tracking-wider mb-2">Overall {currentYear} Rating</p>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <motion.span
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: s * 0.1 }}
            >
              <Star size={24} className={s <= Math.round(overallRating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
            </motion.span>
          ))}
        </div>
        <p className="text-white text-2xl font-cinzel font-bold">{overallRating}/5</p>
        <p className="text-white/40 text-sm mt-1">Based on Jupiter-Saturn transits from {RASHI_DATA[rashiIndex].name}</p>
      </motion.div>

      {/* Life Area Predictions */}
      <h2 className="text-sm text-white/50 font-medium mb-3">Life Area Predictions</h2>
      <div className="space-y-3 mb-8">
        {predictions.map((pred, i) => (
          <motion.div
            key={pred.area}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={pred.color}>{pred.icon}</span>
                <h3 className="text-white font-medium text-sm">{pred.area}</h3>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={10} className={s <= pred.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                ))}
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-2">{pred.summary}</p>
            <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-amber-300/70 text-xs"><strong>Advice:</strong> {pred.advice}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Overview */}
      <h2 className="text-sm text-white/50 font-medium mb-3">Month-by-Month Overview</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {MONTH_THEMES.map((theme, i) => {
          const monthDate = new Date(currentYear, i)
          const isPast = i < new Date().getMonth()
          const isCurrent = i === new Date().getMonth()

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`p-2 rounded-lg text-center border ${
                isCurrent ? 'border-amber-500/30 bg-amber-500/10' :
                isPast ? 'border-white/5 bg-white/[0.01] opacity-50' :
                'border-white/10 bg-white/[0.02]'
              }`}
            >
              <p className={`text-xs font-medium ${isCurrent ? 'text-amber-300' : 'text-white/60'}`}>
                {monthDate.toLocaleDateString('en-US', { month: 'short' })}
              </p>
              <p className="text-[9px] text-white/30 mt-1 leading-tight">{theme}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
        <p className="text-purple-400/60 text-xs">
          Predictions are based on planetary transits from your Moon sign.
          For personalized readings, generate your full Kundli.
        </p>
      </div>
    </div>
  )
}
