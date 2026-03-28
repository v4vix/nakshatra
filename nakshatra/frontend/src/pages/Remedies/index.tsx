import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { getAllRemedies, getDailyRemedy, getPersonalizedRemedies, getRemedyCategories, type Remedy, type RemedyType } from '@/lib/remedies'
import { NAKSHATRA_NAMES, RASHI_DATA } from '@/lib/vedic-constants'
import { ArrowLeft, ChevronRight, Lock, CheckCircle, X, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Remedy Detail Modal ────────────────────────────────────────────────────

function RemedyModal({ remedy, onClose, onComplete }: {
  remedy: Remedy
  onClose: () => void
  onComplete: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md mx-4 mb-4 rounded-2xl border border-white/10 overflow-hidden max-h-[80vh] overflow-y-auto"
        style={{ background: 'rgba(15,23,42,0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{remedy.icon}</span>
              <div>
                <h3 className="text-lg font-cinzel text-white">{remedy.name}</h3>
                <p className="text-sm text-white/40">{remedy.planet} &middot; {remedy.type}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          <p className="text-white/70 text-sm leading-relaxed mb-4">{remedy.description}</p>

          <div className="space-y-3 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">How To Practice</p>
              <p className="text-white/80 text-sm leading-relaxed">{remedy.howTo}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-[9px] text-white/40 uppercase">Frequency</p>
                <p className="text-white/80 text-xs mt-1">{remedy.frequency}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-[9px] text-white/40 uppercase">Best Day</p>
                <p className="text-white/80 text-xs mt-1">{remedy.bestDay}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-[9px] text-white/40 uppercase">Difficulty</p>
                <p className={`text-xs mt-1 ${
                  remedy.difficulty === 'easy' ? 'text-green-400' :
                  remedy.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>{remedy.difficulty}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Best Time</p>
              <p className="text-amber-300 text-sm">{remedy.bestTime}</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Mark as Done (+15 XP)
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RemediesPage() {
  const { t } = useTranslation()
  const { user, addXP } = useStore()
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null)
  const [activeType, setActiveType] = useState<RemedyType | 'all'>('all')
  const [completedToday, setCompletedToday] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nakshatra-remedies-today')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.date === new Date().toDateString()) return new Set(parsed.ids)
      }
    } catch { /* ignore */ }
    return new Set()
  })

  const dailyRemedy = useMemo(() => getDailyRemedy(), [])
  const categories = useMemo(() => getRemedyCategories(), [])
  const { weakPlanets, recommended } = useMemo(
    () => getPersonalizedRemedies(undefined, undefined),
    []
  )

  const allRemedies = useMemo(() => {
    const all = getAllRemedies()
    if (activeType === 'all') return all
    return all.filter(r => r.type === activeType)
  }, [activeType])

  const handleComplete = (remedy: Remedy) => {
    const newCompleted = new Set(completedToday)
    newCompleted.add(remedy.id)
    setCompletedToday(newCompleted)
    localStorage.setItem('nakshatra-remedies-today', JSON.stringify({
      date: new Date().toDateString(),
      ids: [...newCompleted],
    }))
    addXP(15, 'remedy_completed')
    setSelectedRemedy(null)
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-cinzel text-white">Cosmic Remedies</h1>
          <p className="text-sm text-white/40">Personalized practices to strengthen your planets</p>
        </div>
      </div>

      {/* Daily Remedy Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl mb-6 border border-amber-500/20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,179,71,0.1), rgba(168,85,247,0.1))' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame size={16} className="text-amber-400" />
          <span className="text-xs text-amber-400 uppercase tracking-wider font-medium">Today&apos;s Remedy</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-cinzel text-white mb-1">{dailyRemedy.icon} {dailyRemedy.name}</h3>
            <p className="text-sm text-white/50">{dailyRemedy.planet} &middot; {dailyRemedy.type}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRemedy(dailyRemedy)}
            className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm"
          >
            {completedToday.has(dailyRemedy.id) ? 'Done \u2713' : 'Start'}
          </motion.button>
        </div>
      </motion.div>

      {/* Planet Strength Overview */}
      <div className="mb-6">
        <h2 className="text-sm text-white/50 font-medium mb-3">Planet Strengths</h2>
        <div className="grid grid-cols-3 gap-2">
          {weakPlanets.slice(0, 9).map(p => (
            <div key={p.planet} className="p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70">{p.planet}</span>
                <span className={`text-[10px] ${
                  p.status === 'strong' ? 'text-green-400' :
                  p.status === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                }`}>{p.strength}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.strength}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeType === 'all' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white/50 border border-white/10'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.type}
            onClick={() => setActiveType(cat.type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeType === cat.type ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            {cat.icon} {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Remedies List */}
      <div className="space-y-2">
        {allRemedies.map((remedy, i) => (
          <motion.button
            key={remedy.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.5) }}
            onClick={() => !remedy.isPremium && setSelectedRemedy(remedy)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              completedToday.has(remedy.id)
                ? 'border-green-500/20 bg-green-500/5'
                : remedy.isPremium
                ? 'border-purple-500/20 bg-purple-500/5 opacity-70'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            }`}
          >
            <span className="text-xl">{remedy.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium truncate">{remedy.name}</span>
                {completedToday.has(remedy.id) && <CheckCircle size={14} className="text-green-400 flex-shrink-0" />}
                {remedy.isPremium && <Lock size={12} className="text-purple-400 flex-shrink-0" />}
              </div>
              <p className="text-white/40 text-xs">{remedy.planet} &middot; {remedy.difficulty}</p>
            </div>
            <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-white/50 text-sm">
          Remedies Completed Today: <span className="text-amber-400 font-bold">{completedToday.size}</span>
        </p>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRemedy && (
          <RemedyModal
            remedy={selectedRemedy}
            onClose={() => setSelectedRemedy(null)}
            onComplete={() => handleComplete(selectedRemedy)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
