import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { getCurrentTransits } from '@/lib/transits'
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight } from '@/lib/lucide-icons'
import { Link } from 'react-router-dom'

// ─── Types ──────────────────────────────────────────────────────────────────

interface MoodEntry {
  id: string
  date: string
  mood: number // 1-5
  emoji: string
  note: string
  planets: string // snapshot of key transits
  tags: string[]
}

const MOODS = [
  { value: 1, emoji: '\u{1F614}', label: 'Low', color: 'bg-red-500' },
  { value: 2, emoji: '\u{1F615}', label: 'Uneasy', color: 'bg-orange-500' },
  { value: 3, emoji: '\u{1F610}', label: 'Neutral', color: 'bg-yellow-500' },
  { value: 4, emoji: '\u{1F60A}', label: 'Good', color: 'bg-green-400' },
  { value: 5, emoji: '\u{1F929}', label: 'Amazing', color: 'bg-emerald-500' },
]

const TAGS = ['Work', 'Love', 'Health', 'Spiritual', 'Family', 'Finance', 'Creative', 'Social', 'Travel', 'Rest']

const STORAGE_KEY = 'nakshatra-mood-journal'

function loadEntries(): MoodEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveEntries(entries: MoodEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

// ─── New Entry Modal ────────────────────────────────────────────────────────

function NewEntryModal({ onSave, onClose }: { onSave: (e: MoodEntry) => void; onClose: () => void }) {
  const [mood, setMood] = useState(3)
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const transits = useMemo(() => getCurrentTransits(), [])
  const transitSummary = transits.slice(0, 3).map(t => `${t.planet} in ${t.rashi}`).join(', ')

  const handleSave = () => {
    const entry: MoodEntry = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      mood,
      emoji: MOODS[mood - 1].emoji,
      note,
      planets: transitSummary,
      tags: selectedTags,
    }
    onSave(entry)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md mx-4 mb-4 rounded-2xl border border-white/10 overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ background: 'rgba(15,23,42,0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-cinzel text-white">How are you feeling?</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          {/* Mood Selector */}
          <div className="flex justify-between mb-6">
            {MOODS.map(m => (
              <motion.button
                key={m.value}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  mood === m.value ? 'bg-white/10 border border-white/20 scale-110' : 'opacity-50'
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] text-white/60">{m.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-2">What's this about?</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  )}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note about your day..."
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none h-20 placeholder:text-white/20 focus:outline-none focus:border-amber-500/30"
          />

          {/* Transit snapshot */}
          <div className="mt-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] text-purple-400 uppercase tracking-wider">Today&apos;s Transits</p>
            <p className="text-xs text-white/50 mt-1">{transitSummary}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
          >
            Save Entry
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MoodJournalPage() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<MoodEntry[]>(loadEntries)
  const [showNew, setShowNew] = useState(false)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  useEffect(() => { saveEntries(entries) }, [entries])

  const monthEntries = useMemo(() => {
    return entries.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    })
  }, [entries, viewMonth, viewYear])

  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date.startsWith(today))

  // Heatmap data
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const heatmapData: (MoodEntry | null)[] = Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    return entries.find(e => e.date.startsWith(dateStr)) || null
  })

  const avgMood = monthEntries.length > 0
    ? (monthEntries.reduce((sum, e) => sum + e.mood, 0) / monthEntries.length).toFixed(1)
    : '--'

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleSave = (entry: MoodEntry) => {
    setEntries(prev => [entry, ...prev])
    setShowNew(false)
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-2xl font-cinzel text-white">Mood Journal</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNew(true)}
          className="p-2 rounded-full bg-amber-500/20 border border-amber-500/30"
        >
          <Plus size={20} className="text-amber-400" />
        </motion.button>
      </div>

      {/* Today's Check-in */}
      {!todayEntry ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowNew(true)}
          className="w-full p-5 rounded-2xl border border-amber-500/20 mb-6 text-left"
          style={{ background: 'linear-gradient(135deg, rgba(255,179,71,0.1), rgba(168,85,247,0.1))' }}
        >
          <p className="text-amber-400 text-xs uppercase tracking-wider font-medium mb-1">Daily Check-in</p>
          <p className="text-white text-lg font-cinzel">How are you feeling today?</p>
          <p className="text-white/40 text-sm mt-1">Tap to log your cosmic mood</p>
        </motion.button>
      ) : (
        <div className="p-4 rounded-2xl border border-green-500/20 bg-green-500/5 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{todayEntry.emoji}</span>
            <div>
              <p className="text-green-400 text-xs font-medium">Today&apos;s Mood Logged</p>
              <p className="text-white/60 text-sm">{todayEntry.note || 'No note added'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-lg font-bold text-amber-400">{monthEntries.length}</p>
          <p className="text-[10px] text-white/40">Entries</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-lg font-bold text-purple-400">{avgMood}</p>
          <p className="text-[10px] text-white/40">Avg Mood</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-lg font-bold text-green-400">{entries.length}</p>
          <p className="text-[10px] text-white/40">Total</p>
        </div>
      </div>

      {/* Mood Heatmap */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-white/10">
            <ChevronLeft size={16} className="text-white/40" />
          </button>
          <h2 className="text-sm font-cinzel text-white/60">
            {new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-white/10">
            <ChevronRight size={16} className="text-white/40" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-white/20 py-1">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {heatmapData.map((entry, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                entry ? MOODS[entry.mood - 1].color + '/30 border border-white/10' : 'bg-white/[0.03]'
              }`}
              title={entry ? `${MOODS[entry.mood - 1].label}: ${entry.note}` : `Day ${i + 1}`}
            >
              {entry ? entry.emoji : <span className="text-white/10">{i + 1}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <h2 className="text-sm text-white/50 font-medium mb-3">Recent Entries</h2>
      <div className="space-y-2">
        {entries.slice(0, 20).map(entry => (
          <div key={entry.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{entry.emoji}</span>
                <span className="text-white text-sm font-medium">{MOODS[entry.mood - 1].label}</span>
              </div>
              <span className="text-white/30 text-xs">
                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {entry.note && <p className="text-white/50 text-sm ml-8">{entry.note}</p>}
            {entry.tags.length > 0 && (
              <div className="flex gap-1 mt-2 ml-8">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">{tag}</span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-purple-400/40 mt-1 ml-8">{entry.planets}</p>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-white/30 py-8">No entries yet. Start logging your cosmic mood!</p>
        )}
      </div>

      <AnimatePresence>
        {showNew && <NewEntryModal onSave={handleSave} onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  )
}
