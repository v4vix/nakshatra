import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { Trophy, Lock, Sparkles, Filter, Star, Zap } from '@/lib/lucide-icons'

// ─── Types ────────────────────────────────────────────────────────────────────

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
type Category =
  | 'Kundli'
  | 'Tarot'
  | 'Numerology'
  | 'Vastu'
  | 'Streak'
  | 'Scripture'
  | 'Mastery'

interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: Category
  rarity: Rarity
  xpReward: number
}

// ─── Achievements Data ────────────────────────────────────────────────────────

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // Kundli
  {
    id: 'first_star_born',
    name: 'First Star Born',
    description: 'Create your first Kundli birth chart',
    icon: '🌟',
    category: 'Kundli',
    rarity: 'Common',
    xpReward: 50,
  },
  {
    id: 'nakshatra_seeker',
    name: 'Nakshatra Seeker',
    description: 'Discover your Moon nakshatra',
    icon: '🌙',
    category: 'Kundli',
    rarity: 'Common',
    xpReward: 25,
  },
  {
    id: 'lagna_lord',
    name: 'Lagna Lord',
    description: 'Identify your Rising Sign (Ascendant)',
    icon: '⬆️',
    category: 'Kundli',
    rarity: 'Common',
    xpReward: 30,
  },
  {
    id: 'dasha_diver',
    name: 'Dasha Diver',
    description: 'Explore your Vimshottari Dasha timeline',
    icon: '⏳',
    category: 'Kundli',
    rarity: 'Uncommon',
    xpReward: 75,
  },
  {
    id: 'yoga_finder',
    name: 'Yoga Finder',
    description: 'Discover a planetary yoga in your chart',
    icon: '🧘',
    category: 'Kundli',
    rarity: 'Rare',
    xpReward: 150,
  },
  {
    id: 'gaja_kesari',
    name: 'Gaja Kesari',
    description: 'Possess the powerful Gaja Kesari yoga in your chart',
    icon: '🐘',
    category: 'Kundli',
    rarity: 'Epic',
    xpReward: 500,
  },
  {
    id: 'pancha_mahapurusha',
    name: 'Pancha Mahapurusha',
    description: 'Have any of the five great Mahapurusha yogas',
    icon: '👑',
    category: 'Kundli',
    rarity: 'Legendary',
    xpReward: 1000,
  },
  {
    id: 'navamsha_navigator',
    name: 'Navamsha Navigator',
    description: 'View and interpret your D9 Navamsha divisional chart',
    icon: '🗺️',
    category: 'Kundli',
    rarity: 'Uncommon',
    xpReward: 75,
  },

  // Tarot
  {
    id: 'first_pull',
    name: 'First Pull',
    description: 'Draw your very first tarot card',
    icon: '🃏',
    category: 'Tarot',
    rarity: 'Common',
    xpReward: 20,
  },
  {
    id: 'three_card_spread',
    name: 'Three Card Spread',
    description: 'Complete your first 3-card Past, Present, Future reading',
    icon: '🃏',
    category: 'Tarot',
    rarity: 'Common',
    xpReward: 35,
  },
  {
    id: 'fools_leap',
    name: "The Fool's Leap",
    description: 'Draw The Fool card — embrace new beginnings',
    icon: '🌸',
    category: 'Tarot',
    rarity: 'Uncommon',
    xpReward: 100,
  },
  {
    id: 'death_card',
    name: 'Death Card',
    description: 'Draw the Death card — a symbol of transformation, not literal death',
    icon: '💀',
    category: 'Tarot',
    rarity: 'Uncommon',
    xpReward: 100,
  },
  {
    id: 'major_arcana_master',
    name: 'Major Arcana Master',
    description: 'Experience all 22 Major Arcana cards in readings',
    icon: '✨',
    category: 'Tarot',
    rarity: 'Rare',
    xpReward: 250,
  },
  {
    id: 'celtic_cross',
    name: 'Celtic Cross',
    description: 'Complete a full 10-card Celtic Cross spread',
    icon: '☘️',
    category: 'Tarot',
    rarity: 'Rare',
    xpReward: 200,
  },
  {
    id: 'fools_journey',
    name: "The Fool's Journey",
    description: 'Collect all 22 Major Arcana in sequential order across readings',
    icon: '🗺️',
    category: 'Tarot',
    rarity: 'Legendary',
    xpReward: 1000,
  },

  // Numerology
  {
    id: 'numbers_speak',
    name: 'Numbers Speak',
    description: 'Complete your first numerology reading',
    icon: '🔢',
    category: 'Numerology',
    rarity: 'Common',
    xpReward: 25,
  },
  {
    id: 'master_number',
    name: 'Master Number',
    description: 'Have 11, 22, or 33 as your Life Path Number',
    icon: '✨',
    category: 'Numerology',
    rarity: 'Epic',
    xpReward: 400,
  },
  {
    id: 'life_path_7',
    name: 'Life Path 7',
    description: 'The Seeker\'s Path — born to seek deeper truths',
    icon: '🔍',
    category: 'Numerology',
    rarity: 'Uncommon',
    xpReward: 100,
  },
  {
    id: 'name_analysis',
    name: 'Name Analysis',
    description: 'Analyze the vibrational numerology of your full birth name',
    icon: '📝',
    category: 'Numerology',
    rarity: 'Common',
    xpReward: 30,
  },

  // Vastu
  {
    id: 'home_harmony',
    name: 'Home Harmony',
    description: 'Complete your first Vastu Shastra property analysis',
    icon: '🏠',
    category: 'Vastu',
    rarity: 'Common',
    xpReward: 35,
  },
  {
    id: 'sacred_space',
    name: 'Sacred Space',
    description: 'Identify and understand the Brahmasthala of your home',
    icon: '🕉️',
    category: 'Vastu',
    rarity: 'Uncommon',
    xpReward: 75,
  },
  {
    id: 'vastu_vidya',
    name: 'Vastu Vidya',
    description: 'Complete 5 Vastu property analyses',
    icon: '🧭',
    category: 'Vastu',
    rarity: 'Rare',
    xpReward: 200,
  },

  // Streak
  {
    id: 'first_day',
    name: 'First Day',
    description: 'Complete your very first day on Nakshatra',
    icon: '🌅',
    category: 'Streak',
    rarity: 'Common',
    xpReward: 10,
  },
  {
    id: 'third_eye_opens',
    name: 'Third Eye Opens',
    description: 'Maintain a 3-day activity streak',
    icon: '👁️',
    category: 'Streak',
    rarity: 'Common',
    xpReward: 50,
  },
  {
    id: 'cosmic_initiate',
    name: 'Cosmic Initiate',
    description: 'Maintain a 7-day activity streak',
    icon: '⭐',
    category: 'Streak',
    rarity: 'Common',
    xpReward: 100,
  },
  {
    id: 'lunar_phase',
    name: 'Lunar Phase',
    description: 'Maintain a 14-day activity streak',
    icon: '🌙',
    category: 'Streak',
    rarity: 'Uncommon',
    xpReward: 200,
  },
  {
    id: 'moon_cycle',
    name: 'Moon Cycle',
    description: 'Maintain a 28-day activity streak — a full lunar cycle',
    icon: '🌕',
    category: 'Streak',
    rarity: 'Rare',
    xpReward: 500,
  },
  {
    id: 'season_walker',
    name: 'Season Walker',
    description: 'Maintain a 90-day activity streak — walk through a full season',
    icon: '🌸',
    category: 'Streak',
    rarity: 'Epic',
    xpReward: 1500,
  },
  {
    id: 'solar_return',
    name: 'Solar Return',
    description: 'Maintain a 365-day streak — complete one full solar year',
    icon: '☀️',
    category: 'Streak',
    rarity: 'Legendary',
    xpReward: 10000,
  },

  // Scripture
  {
    id: 'first_shloka',
    name: 'First Shloka',
    description: 'Read your first sacred verse from the scriptures',
    icon: '📿',
    category: 'Scripture',
    rarity: 'Common',
    xpReward: 10,
  },
  {
    id: 'gita_student',
    name: 'Gita Student',
    description: 'Read 10 verses from the Bhagavad Gita',
    icon: '📖',
    category: 'Scripture',
    rarity: 'Uncommon',
    xpReward: 100,
  },
  {
    id: 'upanishad_scholar',
    name: 'Upanishad Scholar',
    description: 'Read verses from at least 3 different Upanishads',
    icon: '🔱',
    category: 'Scripture',
    rarity: 'Rare',
    xpReward: 200,
  },
  {
    id: 'daily_devotion',
    name: 'Daily Devotion',
    description: 'Read the daily verse 7 days in a row',
    icon: '🪔',
    category: 'Scripture',
    rarity: 'Rare',
    xpReward: 300,
  },
  {
    id: 'scripture_master',
    name: 'Scripture Master',
    description: 'Read 100 sacred verses across all scriptures',
    icon: '📚',
    category: 'Scripture',
    rarity: 'Epic',
    xpReward: 800,
  },

  // Mastery
  {
    id: 'nakshatra_navigator',
    name: 'Nakshatra Navigator',
    description: 'Reach Level 16 — you navigate by the stars',
    icon: '🗺️',
    category: 'Mastery',
    rarity: 'Uncommon',
    xpReward: 200,
  },
  {
    id: 'graha_guardian',
    name: 'Graha Guardian',
    description: 'Reach Level 36 — guardian of the planetary forces',
    icon: '🪐',
    category: 'Mastery',
    rarity: 'Rare',
    xpReward: 500,
  },
  {
    id: 'vedic_visionary',
    name: 'Vedic Visionary',
    description: 'Reach Level 66 — you see with the eye of Vedic wisdom',
    icon: '🔮',
    category: 'Mastery',
    rarity: 'Epic',
    xpReward: 1500,
  },
  {
    id: 'jyotisha_guru',
    name: 'Jyotisha Guru',
    description: 'Reach Level 100 — master of Jyotisha, the science of light',
    icon: '🏆',
    category: 'Mastery',
    rarity: 'Legendary',
    xpReward: 5000,
  },
]

// ─── Rarity Config ────────────────────────────────────────────────────────────

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bgClass: string; borderClass: string; glowClass: string }> = {
  Common: {
    label: 'Common',
    color: 'text-slate-400',
    bgClass: 'bg-slate-500/10',
    borderClass: 'border-slate-500/25',
    glowClass: '',
  },
  Uncommon: {
    label: 'Uncommon',
    color: 'text-green-400',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
    glowClass: '',
  },
  Rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    glowClass: '',
  },
  Epic: {
    label: 'Epic',
    color: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/35',
    glowClass: 'shadow-cosmic-glow',
  },
  Legendary: {
    label: 'Legendary',
    color: 'text-gold',
    bgClass: 'bg-gold/10',
    borderClass: 'border-gold/40',
    glowClass: 'shadow-gold-glow',
  },
}

const CATEGORIES: Array<Category | 'All'> = [
  'All', 'Kundli', 'Tarot', 'Numerology', 'Vastu', 'Streak', 'Scripture', 'Mastery',
]
const RARITIES: Array<Rarity | 'All'> = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']

// ─── Achievement Card ─────────────────────────────────────────────────────────

function AchievementCard({
  achievement,
  earned,
}: {
  achievement: AchievementDef
  earned: boolean
}) {
  const rc = RARITY_CONFIG[achievement.rarity]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        earned
          ? `${rc.bgClass} ${rc.borderClass} ${rc.glowClass}`
          : 'bg-white/3 border-white/5 opacity-45'
      }`}
    >
      {/* Earned stamp */}
      {earned && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/40 flex items-center justify-center">
            <span className="text-green-400 text-xs">✓</span>
          </div>
        </div>
      )}

      {/* Locked overlay */}
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="w-3.5 h-3.5 text-white/25" />
        </div>
      )}

      {/* Icon */}
      <div className={`text-3xl mb-2 ${!earned ? 'grayscale opacity-40' : ''}`}>
        {achievement.icon}
      </div>

      {/* Name */}
      <div className={`text-xs font-cinzel mb-1 ${earned ? 'text-white/90' : 'text-white/30'}`}>
        {achievement.name}
      </div>

      {/* Description */}
      <div className={`text-xs font-cormorant leading-tight mb-2 ${earned ? 'text-white/55' : 'text-white/25'}`}>
        {achievement.description}
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-1 flex-wrap">
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded-full border font-cinzel ${rc.color} ${rc.bgClass} ${rc.borderClass}`}
        >
          {achievement.rarity}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/35 font-cinzel">
          {achievement.category}
        </span>
        <span className="ml-auto text-[9px] text-saffron font-cinzel">+{achievement.xpReward} XP</span>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Achievements() {
  const { user } = useStore()
  const earnedIds = user?.achievements ?? []

  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All')
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'All'>('All')
  const [showOnlyEarned, setShowOnlyEarned] = useState(false)

  const filtered = useMemo(() => {
    return ALL_ACHIEVEMENTS.filter((a) => {
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false
      if (rarityFilter !== 'All' && a.rarity !== rarityFilter) return false
      if (showOnlyEarned && !earnedIds.includes(a.id)) return false
      return true
    })
  }, [categoryFilter, rarityFilter, showOnlyEarned, earnedIds])

  const totalEarned = earnedIds.filter((id) =>
    ALL_ACHIEVEMENTS.find((a) => a.id === id)
  ).length

  const totalXPEarned = ALL_ACHIEVEMENTS.filter((a) => earnedIds.includes(a.id)).reduce(
    (sum, a) => sum + a.xpReward,
    0
  )

  const rarestOwned = useMemo(() => {
    const RARITY_ORDER: Rarity[] = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
    for (const rarity of RARITY_ORDER) {
      const found = ALL_ACHIEVEMENTS.find(
        (a) => earnedIds.includes(a.id) && a.rarity === rarity
      )
      if (found) return found
    }
    return null
  }, [earnedIds])

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-7 h-7 text-gold" />
          <h1 className="text-3xl font-cinzel text-gold-gradient">Achievements</h1>
          <Trophy className="w-7 h-7 text-gold" />
        </div>
        <p className="text-white/60 font-cormorant text-lg">
          Your cosmic milestones on the path of Jyotisha
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-cinzel text-gold mb-1">{totalXPEarned.toLocaleString()}</div>
          <div className="text-xs text-white/45 font-cinzel uppercase tracking-wider">XP from Achievements</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-cinzel text-saffron mb-1">
            {totalEarned}
            <span className="text-base text-white/30">/{ALL_ACHIEVEMENTS.length}</span>
          </div>
          <div className="text-xs text-white/45 font-cinzel uppercase tracking-wider">Achievements Unlocked</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          {rarestOwned ? (
            <>
              <div className="text-2xl mb-1">{rarestOwned.icon}</div>
              <div className={`text-xs font-cinzel mb-0.5 ${RARITY_CONFIG[rarestOwned.rarity].color}`}>
                {rarestOwned.rarity}
              </div>
              <div className="text-xs text-white/55 font-cinzel truncate">{rarestOwned.name}</div>
              <div className="text-[10px] text-white/30">Rarest Achievement</div>
            </>
          ) : (
            <>
              <Lock className="w-6 h-6 text-white/25 mx-auto mb-1" />
              <div className="text-xs text-white/30 font-cinzel">No achievements yet</div>
            </>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-xl p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-xs font-cinzel text-white/40 uppercase tracking-wider">Filter Achievements</span>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-cinzel transition-all ${
                categoryFilter === cat
                  ? 'bg-saffron/20 border border-saffron/35 text-saffron'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rarity filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {RARITIES.map((rar) => (
            <button
              key={rar}
              onClick={() => setRarityFilter(rar)}
              className={`px-3 py-1 rounded-lg text-xs font-cinzel transition-all ${
                rarityFilter === rar
                  ? rar === 'All'
                    ? 'bg-white/15 border border-white/25 text-white/80'
                    : `${RARITY_CONFIG[rar as Rarity].bgClass} ${RARITY_CONFIG[rar as Rarity].borderClass} ${RARITY_CONFIG[rar as Rarity].color}`
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
              }`}
            >
              {rar}
            </button>
          ))}
        </div>

        {/* Earned toggle */}
        <button
          onClick={() => setShowOnlyEarned(!showOnlyEarned)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-cinzel transition-all ${
            showOnlyEarned
              ? 'bg-green-500/15 border border-green-500/30 text-green-400'
              : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          {showOnlyEarned ? 'Showing Earned Only' : 'Show Earned Only'}
        </button>

        <div className="mt-3 text-xs text-white/30 font-cormorant">
          Showing {filtered.length} of {ALL_ACHIEVEMENTS.length} achievements
        </div>
      </motion.div>

      {/* Rarity Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-x-4 gap-y-1 mb-6 px-1"
      >
        {(Object.keys(RARITY_CONFIG) as Rarity[]).map((rar) => (
          <div key={rar} className="flex items-center gap-1.5">
            <Star className={`w-3 h-3 ${RARITY_CONFIG[rar].color}`} />
            <span className={`text-xs font-cinzel ${RARITY_CONFIG[rar].color}`}>{rar}</span>
          </div>
        ))}
      </motion.div>

      {/* Achievement Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        <AnimatePresence>
          {filtered.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              earned={earnedIds.includes(achievement.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-cinzel text-sm">No achievements match your filters</p>
        </div>
      )}

      {/* XP Summary at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 glass-card rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-gold" />
          <div>
            <div className="text-sm font-cinzel text-white/70">Total Achievable XP</div>
            <div className="text-xs text-white/35 font-cormorant">Complete all achievements</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-cinzel text-gold">
            {ALL_ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0).toLocaleString()}
          </div>
          <div className="text-xs text-white/35 font-cinzel">Total XP Pool</div>
        </div>
      </motion.div>
    </div>
  )
}
