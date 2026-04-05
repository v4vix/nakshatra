import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, xpForLevel, getRankForLevel } from '@/store'
import { useAuthStore } from '@/store/authStore'
import { getMyShareCards, deleteShareCard } from '@/services/auth'
import {
  User,
  Edit3,
  Share2,
  Star,
  Zap,
  Flame,
  BookOpen,
  CreditCard,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  X,
  Check,
  Telescope,
  Layers,
  LogOut,
  Link2,
  Trash2,
  Crown,
} from '@/lib/lucide-icons'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'

interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: Rarity
  xpReward: number
}

// ─── Achievements subset for showcase ────────────────────────────────────────

const SHOWCASE_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'pancha_mahapurusha', name: 'Pancha Mahapurusha', description: 'Have any of the five great Mahapurusha yogas', icon: '👑', category: 'Kundli', rarity: 'Legendary', xpReward: 1000 },
  { id: 'solar_return', name: 'Solar Return', description: 'Maintain a 365-day streak', icon: '☀️', category: 'Streak', rarity: 'Legendary', xpReward: 10000 },
  { id: 'jyotisha_guru', name: 'Jyotisha Guru', description: 'Reach Level 100', icon: '🏆', category: 'Mastery', rarity: 'Legendary', xpReward: 5000 },
  { id: 'gaja_kesari', name: 'Gaja Kesari', description: 'Possess the powerful Gaja Kesari yoga', icon: '🐘', category: 'Kundli', rarity: 'Epic', xpReward: 500 },
  { id: 'fools_journey', name: "The Fool's Journey", description: 'Collect all 22 Major Arcana', icon: '🗺️', category: 'Tarot', rarity: 'Legendary', xpReward: 1000 },
  { id: 'scripture_master', name: 'Scripture Master', description: 'Read 100 sacred verses', icon: '📚', category: 'Scripture', rarity: 'Epic', xpReward: 800 },
  { id: 'season_walker', name: 'Season Walker', description: 'Maintain a 90-day streak', icon: '🌸', category: 'Streak', rarity: 'Epic', xpReward: 1500 },
  { id: 'master_number', name: 'Master Number', description: 'Have 11, 22, or 33 as Life Path', icon: '✨', category: 'Numerology', rarity: 'Epic', xpReward: 400 },
  { id: 'first_star_born', name: 'First Star Born', description: 'Create your first Kundli', icon: '🌟', category: 'Kundli', rarity: 'Common', xpReward: 50 },
  { id: 'cosmic_initiate', name: 'Cosmic Initiate', description: '7-day activity streak', icon: '⭐', category: 'Streak', rarity: 'Common', xpReward: 100 },
  { id: 'first_pull', name: 'First Pull', description: 'Draw your first tarot card', icon: '🃏', category: 'Tarot', rarity: 'Common', xpReward: 20 },
  { id: 'home_harmony', name: 'Home Harmony', description: 'Complete first Vastu analysis', icon: '🏠', category: 'Vastu', rarity: 'Common', xpReward: 35 },
]

const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'text-slate-400',
  Uncommon: 'text-green-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-gold',
}

const RARITY_BORDER: Record<Rarity, string> = {
  Common: 'border-slate-500/20',
  Uncommon: 'border-green-500/30',
  Rare: 'border-blue-500/30',
  Epic: 'border-purple-500/35',
  Legendary: 'border-gold/40',
}

const RANK_DESCRIPTIONS: Record<string, string> = {
  'Stardust Seeker': 'You have taken your first steps into the cosmos',
  'Lunar Apprentice': 'The Moon guides your early journey',
  'Nakshatra Navigator': 'You traverse the star-paths with growing wisdom',
  'Rashi Ranger': 'You walk freely through the twelve Rashi fields',
  'Graha Guardian': 'The planets bow to your deep understanding',
  'Dasha Master': 'Time itself reveals its secrets to you',
  'Vedic Visionary': 'You see through the eye of Vedic light',
  'Cosmic Sage': 'Your wisdom spans the cosmos',
  'Jyotisha Guru': 'You are one with the light of the stars',
}

// ─── Activity Calendar ────────────────────────────────────────────────────────

function ActivityCalendar({ lastActivityDate }: { lastActivityDate: string | null }) {
  const days = useMemo(() => {
    const result: Array<{ date: Date; hasActivity: boolean; isToday: boolean }> = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Simulate activity for demo: mark last 7 days as active if streakDays > 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const isToday = i === 0
      // Simulate some activity dots for visual demo
      const hasActivity = isToday || (lastActivityDate ? Math.random() > 0.55 : false)
      result.push({ date, hasActivity, isToday })
    }
    return result
  }, [lastActivityDate])

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-white/25 font-cinzel">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`aspect-square rounded-sm flex items-center justify-center ${
              day.isToday
                ? 'bg-saffron/40 ring-1 ring-saffron/60'
                : day.hasActivity
                ? 'bg-gold/30'
                : 'bg-white/5'
            }`}
            title={day.date.toLocaleDateString()}
          >
            {day.hasActivity && (
              <div className={`w-1 h-1 rounded-full ${day.isToday ? 'bg-saffron' : 'bg-gold'}`} />
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 justify-end">
        <div className="w-2 h-2 rounded-sm bg-white/5" />
        <span className="text-[9px] text-white/25">No activity</span>
        <div className="w-2 h-2 rounded-sm bg-gold/30" />
        <span className="text-[9px] text-white/25">Active</span>
        <div className="w-2 h-2 rounded-sm bg-saffron/40 ring-1 ring-saffron/60" />
        <span className="text-[9px] text-white/25">Today</span>
      </div>
    </div>
  )
}

// ─── Edit Birth Data Modal ────────────────────────────────────────────────────

function EditBirthModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useStore()
  const [form, setForm] = useState({
    birthDate: user?.birthDate ?? '',
    birthTime: user?.birthTime ?? '',
    birthPlace: user?.birthPlace ?? '',
  })

  const handleSave = () => {
    updateUser(form)
    toast.success('Birth data updated!')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card-dark w-full max-w-sm rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel text-champagne">Edit Birth Data</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs text-white/40 font-cinzel block mb-1.5">Birth Date</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-saffron/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 font-cinzel block mb-1.5">Birth Time</label>
            <input
              type="time"
              value={form.birthTime}
              onChange={(e) => setForm((p) => ({ ...p, birthTime: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-saffron/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 font-cinzel block mb-1.5">Birth Place</label>
            <input
              type="text"
              value={form.birthPlace}
              onChange={(e) => setForm((p) => ({ ...p, birthPlace: e.target.value }))}
              placeholder="City, Country"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-saffron/50 placeholder:text-white/20"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-saffron/20 border border-saffron/30 text-saffron font-cinzel flex items-center justify-center gap-2 hover:bg-saffron/30 transition-all"
        >
          <Check className="w-4 h-4" /> Save Changes
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { user, kundlis, tarotReadings, logout: localLogout } = useStore()
  const { user: authUser, logout: authLogout } = useAuthStore()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [savedCards, setSavedCards] = useState<any[]>([])

  useEffect(() => {
    getMyShareCards()
      .then(d => setSavedCards(d.cards || []))
      .catch(() => {})
  }, [])

  async function handleDeleteCard(id: string) {
    try {
      await deleteShareCard(id)
      setSavedCards(prev => prev.filter(c => c.id !== id))
      toast.success('Card deleted')
    } catch { toast.error('Failed to delete card') }
  }

  async function handleLogout() {
    await authLogout()
    localLogout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 font-cinzel text-sm">Loading profile...</div>
      </div>
    )
  }

  const tier = authUser?.tier || 'free'
  const xpProgress = user.xp
  const xpNeeded = user.xpToNextLevel
  const progressPercent = Math.min(100, (xpProgress / xpNeeded) * 100)

  const topShowcaseAchievements = useMemo(() => {
    const RARITY_ORDER: Rarity[] = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
    const earned = SHOWCASE_ACHIEVEMENTS.filter((a) => user.achievements.includes(a.id))
    earned.sort((a, b) => {
      return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
    })
    return earned.slice(0, 3)
  }, [user.achievements])

  const handleShare = () => {
    const text = `I am a ${user.rank} on Nakshatra — Level ${user.level} with ${user.xp.toLocaleString()} XP! 🌟 Join me on my Vedic astrology journey.`
    if (navigator.share) {
      navigator.share({ text, title: 'My Nakshatra Profile' })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Profile copied to clipboard!', { icon: '📋' })
    }
  }

  const cosmicStats = [
    { label: 'Total XP', value: user.xp.toLocaleString(), icon: Zap, color: 'text-gold' },
    { label: 'Level', value: user.level.toString(), icon: Star, color: 'text-saffron' },
    { label: 'Streak', value: `${user.streakDays}d`, icon: Flame, color: 'text-orange-400' },
    { label: 'Charts', value: kundlis.length.toString(), icon: Layers, color: 'text-celestial' },
    { label: 'Tarot Readings', value: tarotReadings.length.toString(), icon: CreditCard, color: 'text-purple-400' },
    { label: 'Achievements', value: `${user.achievements.length}`, icon: Trophy, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <h1 className="text-2xl font-cinzel text-gold-gradient">Cosmic Profile</h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card shimmer-border rounded-2xl p-6 mb-6 mt-6"
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-saffron/20 to-gold/20 border border-gold/30 flex items-center justify-center text-4xl shadow-gold-glow">
              {user.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-saffron/90 border border-cosmos flex items-center justify-center">
              <span className="text-cosmos text-xs font-cinzel font-bold">{user.level}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-cinzel text-champagne truncate">
              {user.fullName || 'Cosmic Seeker'}
            </h2>
            <div className="text-sm text-white/45 font-cormorant mb-2">@{user.username}</div>

            {/* Rank badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 mb-3">
              <Star className="w-3 h-3 text-gold" />
              <span className="text-xs font-cinzel text-gold">{user.rank}</span>
            </div>

            <div className="text-xs text-white/40 font-cormorant italic">
              {RANK_DESCRIPTIONS[user.rank] ?? 'Your journey through the cosmos continues...'}
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-white/10 text-white/35 hover:text-white/60 transition-colors flex-shrink-0"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Level Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-cinzel text-white/50">Level {user.level}</span>
            <span className="text-white/35 font-cormorant">
              {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
            </span>
            <span className="font-cinzel text-white/50">Level {user.level + 1}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-saffron to-gold shadow-gold-glow"
            />
          </div>
          <div className="text-xs text-white/30 font-cormorant mt-1 text-right">
            {Math.round(xpNeeded - xpProgress).toLocaleString()} XP to next level
          </div>
        </div>
      </motion.div>

      {/* Cosmic Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {cosmicStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-card rounded-xl p-3 text-center"
          >
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <div className={`text-xl font-cinzel ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-white/35 font-cinzel uppercase tracking-wide mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Birth Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-champagne text-sm">Birth Data</h3>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 text-xs text-saffron/70 hover:text-saffron transition-colors font-cinzel"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-white/30 flex-shrink-0" />
            <div>
              <div className="text-xs text-white/40 font-cinzel">Birth Date</div>
              <div className="text-sm text-white/70 font-cormorant">
                {user.birthDate
                  ? new Date(user.birthDate + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not set'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-white/30 flex-shrink-0" />
            <div>
              <div className="text-xs text-white/40 font-cinzel">Birth Time</div>
              <div className="text-sm text-white/70 font-cormorant">
                {user.birthTime || 'Not set'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-white/30 flex-shrink-0" />
            <div>
              <div className="text-xs text-white/40 font-cinzel">Birth Place</div>
              <div className="text-sm text-white/70 font-cormorant">
                {user.birthPlace || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-champagne text-sm">Achievement Showcase</h3>
          <span className="text-xs text-white/35 font-cormorant">Top rarest earned</span>
        </div>

        {topShowcaseAchievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {topShowcaseAchievements.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-xl border text-center ${RARITY_BORDER[a.rarity]} bg-white/3`}
              >
                <div className="text-3xl mb-1">{a.icon}</div>
                <div className={`text-[10px] font-cinzel ${RARITY_COLORS[a.rarity]} mb-0.5`}>
                  {a.rarity}
                </div>
                <div className="text-[10px] font-cinzel text-white/60 leading-tight">{a.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 mx-auto text-white/15 mb-2" />
            <p className="text-sm text-white/35 font-cormorant">
              Complete activities to earn achievements
            </p>
          </div>
        )}

        {user.achievements.length > 0 && (
          <div className="mt-3 text-center">
            <span className="text-xs text-white/35 font-cormorant">
              {user.achievements.length} achievements unlocked total
            </span>
          </div>
        )}
      </motion.div>

      {/* Activity Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-champagne text-sm">Activity — Last 30 Days</h3>
          <div className="flex items-center gap-1.5 text-xs text-saffron">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-cinzel">{user.streakDays} day streak</span>
          </div>
        </div>
        <ActivityCalendar lastActivityDate={user.lastActivityDate} />
        {user.longestStreak > 0 && (
          <div className="text-xs text-white/30 font-cormorant mt-3 text-center">
            Longest streak: {user.longestStreak} days
          </div>
        )}
      </motion.div>

      {/* Share Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleShare}
          className="w-full py-3.5 rounded-xl shimmer-border bg-gradient-to-r from-saffron/15 to-gold/15 text-gold font-cinzel text-sm hover:from-saffron/25 hover:to-gold/25 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share My Cosmic Profile
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </motion.div>

      {/* Legal & About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 glass-card rounded-2xl p-5 space-y-1"
      >
        <h3 className="font-cinzel text-champagne text-sm mb-3">About</h3>
        <a
          href="/privacy"
          className="flex items-center justify-between py-2.5 px-1 border-b border-white/5 text-sm text-champagne/60 hover:text-champagne transition-colors font-cormorant"
        >
          Privacy Policy
          <ChevronRight className="w-4 h-4 opacity-40" />
        </a>
        <a
          href="/terms"
          className="flex items-center justify-between py-2.5 px-1 border-b border-white/5 text-sm text-champagne/60 hover:text-champagne transition-colors font-cormorant"
        >
          Terms of Service
          <ChevronRight className="w-4 h-4 opacity-40" />
        </a>
        <div className="pt-3 text-center">
          <p className="text-[10px] text-champagne/25 font-cormorant">
            Nakshatra v1.0.0 · For entertainment &amp; educational purposes only
          </p>
          <p className="text-[10px] text-champagne/20 font-cormorant mt-0.5">
            © {new Date().getFullYear()} BitsizeGyaan
          </p>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        {/* Tier Badge */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <Crown size={14} className="text-gold/60" />
          <span className={`px-3 py-1 rounded-full text-xs font-cinzel ${
            tier === 'guru' ? 'bg-purple-600 text-white' :
            tier === 'pro' ? 'bg-blue-600 text-white' :
            'bg-slate-600 text-white'
          }`}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </span>
        </div>

        {/* Saved Cards */}
        {savedCards.length > 0 && (
          <div className="mb-4">
            <h3 className="font-cinzel text-sm text-gold/70 mb-2 flex items-center gap-2">
              <Link2 size={14} /> Shared Cards
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {savedCards.map(card => (
                <div key={card.id} className="glass-card-dark rounded-lg p-3 border border-stardust/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gold/60 font-cinzel capitalize">{card.type}</span>
                    <button onClick={() => handleDeleteCard(card.id)} className="text-red-400/40 hover:text-red-400">
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <p className="text-xs text-champagne/60 font-cormorant truncate">{card.title || 'Untitled'}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + card.url)
                      toast.success('Link copied!')
                    }}
                    className="mt-1 text-xs text-gold/40 hover:text-gold/70 flex items-center gap-1"
                  >
                    <Link2 size={8} /> Copy link
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-cinzel text-sm hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && <EditBirthModal onClose={() => setShowEditModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
