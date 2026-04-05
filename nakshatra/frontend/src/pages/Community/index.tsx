import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  Star, Heart, MessageCircle, Share2, Sparkles, TrendingUp,
  Hash, Users, Plus, X, ChevronRight, Zap,
} from '@/lib/lucide-icons'
import toast from 'react-hot-toast'

// ─── Types ─────────────────────────────────────────────────────────────────

type PostType = 'kundli' | 'tarot' | 'numerology' | 'achievement' | 'scripture' | 'ritual' | 'compatibility'

interface CommunityPost {
  id: string
  username: string
  avatar: string
  rank: string
  content: string
  type: PostType
  timestamp: string
  likes: number
  comments: number
  badge?: string
  tags: string[]
  liked?: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: '1',
    username: 'priya_stardust',
    avatar: '🌸',
    rank: 'Nakshatra Navigator',
    content: 'Just calculated my Kundli — I have Gaja Kesari Yoga! Jupiter is exactly conjunct Moon in Sagittarius. Feeling so blessed ✨ The positioning means wisdom and fame are written in my stars!',
    type: 'kundli',
    timestamp: '2m ago',
    likes: 24,
    comments: 8,
    badge: 'Gaja Kesari Yoga',
    tags: ['#KundliMilan', '#GajaKesari', '#VedicAstrology'],
  },
  {
    id: '2',
    username: 'arjun_cosmos',
    avatar: '🔱',
    rank: 'Graha Guardian',
    content: 'Drew the High Priestess today during my morning spread 🌙 Intuition is calling me loudly. The moon energy in Rohini is amplifying this card\'s message tenfold. Time to trust the inner voice.',
    type: 'tarot',
    timestamp: '5m ago',
    likes: 31,
    comments: 12,
    badge: 'The High Priestess',
    tags: ['#TarotReading', '#HighPriestess', '#Intuition'],
  },
  {
    id: '3',
    username: 'meera_jyotish',
    avatar: '🌺',
    rank: 'Vedic Visionary',
    content: 'Life Path 7 gang! 🔮 Who else is on the path of the mystic? Just completed my numerology profile and everything makes so much sense now — the solitude, the deep thinking, the spiritual seeking. We are the seekers of truth.',
    type: 'numerology',
    timestamp: '12m ago',
    likes: 47,
    comments: 19,
    badge: 'Life Path 7',
    tags: ['#LifePath7', '#Numerology', '#SpiritualPath'],
  },
  {
    id: '4',
    username: 'vedic_warrior',
    avatar: '⚔️',
    rank: 'Dasha Master',
    content: '🎉 Just hit Level 15 — Graha Guardian! The cosmic journey continues. Started as a curious seeker and now I understand my planetary periods, yogas, and the entire map of my destiny. This app has been transformative!',
    type: 'achievement',
    timestamp: '18m ago',
    likes: 89,
    comments: 34,
    badge: 'Graha Guardian Achieved',
    tags: ['#LevelUp', '#GrahaGuardian', '#CosmicJourney'],
  },
  {
    id: '5',
    username: 'radha_nakshatra',
    avatar: '🌼',
    rank: 'Lunar Apprentice',
    content: '📿 कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥\n\n"You have a right to perform your duty, but never to the fruits of action." — Bhagavad Gita 2.47\n\nThis shloka hit different during Mercury Retrograde. Detaching from results = pure freedom.',
    type: 'scripture',
    timestamp: '25m ago',
    likes: 112,
    comments: 28,
    badge: 'Bhagavad Gita',
    tags: ['#BhagavadGita', '#Karma', '#Vedanta'],
  },
  {
    id: '6',
    username: 'surya_devotee',
    avatar: '☀️',
    rank: 'Rashi Ranger',
    content: 'Our Kundli Milan score is 31/36! 🥰 Couldn\'t believe it when I saw the numbers. Nadi Kuta matched perfectly and our Moon signs create a beautiful Mahendra combination. Sometimes the stars really do write the best love stories 💫',
    type: 'compatibility',
    timestamp: '33m ago',
    likes: 203,
    comments: 67,
    badge: '31/36 Compatibility',
    tags: ['#KundliMilan', '#Compatibility', '#CosmicLove'],
  },
  {
    id: '7',
    username: 'ananya_mystic',
    avatar: '🔮',
    rank: 'Nakshatra Navigator',
    content: 'Completed my Sunday morning ritual — Surya Namaskar + Aditya Hridayam recitation at sunrise 🌅 The Sun is in Uttara Phalguni nakshatra today, perfect for health and vitality practices. Feeling the solar prana flowing through every cell!',
    type: 'ritual',
    timestamp: '41m ago',
    likes: 58,
    comments: 14,
    badge: 'Surya Ritual Complete',
    tags: ['#SuryaNamaskar', '#DailyRitual', '#AdityaHridayam'],
  },
  {
    id: '8',
    username: 'kiran_astro',
    avatar: '🌟',
    rank: 'Graha Guardian',
    content: 'Mercury Retrograde survival guide: 1) Back up EVERYTHING 2) Re-read contracts 3) Reconnect with old friends (they\'re showing up for a reason!) 4) Journal your inner thoughts — Mercury rules communication & mind 5) Avoid signing new deals until Sept 15. You\'re welcome! ✌️',
    type: 'kundli',
    timestamp: '52m ago',
    likes: 178,
    comments: 45,
    tags: ['#MercuryRetrograde', '#AstroTips', '#VedicAstrology'],
  },
  {
    id: '9',
    username: 'shakti_seeker',
    avatar: '🦋',
    rank: 'Stardust Seeker',
    content: 'First time getting a Tarot reading on this app — pulled the Wheel of Fortune! 🎡 Everything is cyclical, change is the only constant. The interpretation resonated so deeply with what I\'m going through in my Saturn Mahadasha. Truly cosmic timing.',
    type: 'tarot',
    timestamp: '1h ago',
    likes: 36,
    comments: 9,
    badge: 'Wheel of Fortune',
    tags: ['#TarotReading', '#WheelOfFortune', '#Synchronicity'],
  },
  {
    id: '10',
    username: 'dharma_path',
    avatar: '🪷',
    rank: 'Dasha Master',
    content: '✨ Master Number 11 checking in! Just discovered I have the Life Path of the Intuitive Illuminator. The double 1 carries the vibration of revelation and enlightenment. No wonder I\'ve always felt this calling toward spiritual leadership and teaching.',
    type: 'numerology',
    timestamp: '1h ago',
    likes: 92,
    comments: 31,
    badge: 'Master Number 11',
    tags: ['#MasterNumber11', '#Numerology', '#SpiritualLeader'],
  },
  {
    id: '11',
    username: 'puja_cosmos',
    avatar: '🌙',
    rank: 'Vedic Visionary',
    content: '🌕 Full Moon in Purva Ashadha tonight! Perfect time for:\n\n• Releasing limiting beliefs about victory\n• Setting intentions for invincibility\n• Chanting Om Dum Durgayei Namaha\n• Offerings of white flowers to the Moon\n\nJupiter\'s aspect on this full moon makes it exceptionally auspicious for spiritual growth. Don\'t miss this window! 🙏',
    type: 'ritual',
    timestamp: '1h ago',
    likes: 267,
    comments: 88,
    badge: 'Full Moon Wisdom',
    tags: ['#FullMoon', '#LunarEnergy', '#VedicRitual'],
  },
  {
    id: '12',
    username: 'nakshatra_novice',
    avatar: '⭐',
    rank: 'Lunar Apprentice',
    content: 'Finally understood what Atmakaraka means! The planet at highest degree in your chart = your soul\'s mission planet. Mine is Venus in Libra 🌹 Now I understand why beauty, harmony and relationships are so central to everything I do. Vedic astrology is mind-blowing!',
    type: 'kundli',
    timestamp: '2h ago',
    likes: 74,
    comments: 22,
    badge: 'Atmakaraka Discovery',
    tags: ['#Atmakaraka', '#VedicAstrology', '#SoulMission'],
  },
  {
    id: '13',
    username: 'guru_devotee',
    avatar: '📿',
    rank: 'Jyotisha Guru',
    content: '🙏 From the Brihat Parashara Hora Shastra:\n\n"ग्रहाणां च फलं ब्रूते स्थान-वल-कलादिभिः"\n\n"The results of planets are to be declared based on their placement, strength, and time."\n\nThis is the foundation of Vedic astrology. Not fate — but the interplay of position, power, and timing. We are never victims of stars, only students.',
    type: 'scripture',
    timestamp: '2h ago',
    likes: 198,
    comments: 52,
    badge: 'BPHS Quote',
    tags: ['#BPHS', '#JyotishWisdom', '#VedicScripture'],
  },
  {
    id: '14',
    username: 'cosmic_twin',
    avatar: '👯',
    rank: 'Nakshatra Navigator',
    content: 'My twin sister and I got our compatibility done on a whim... we scored 28/36! 🤣 The Varna kuta shows we\'re on the same dharmic path (obvious!) and Graha Maitri shows planetary friendship (double Sagittarius Moon gang). I guess the stars knew we\'d be best friends forever 🌟',
    type: 'compatibility',
    timestamp: '2h ago',
    likes: 445,
    comments: 123,
    badge: '28/36 Sisters',
    tags: ['#Compatibility', '#TwinSisters', '#KundliMilan'],
  },
  {
    id: '15',
    username: 'saturn_student',
    avatar: '♄',
    rank: 'Dasha Master',
    content: 'Day 40 of Shani Sade Sati 🪐 What I\'ve learned: Saturn doesn\'t punish, it PURIFIES. Every frustration has been a teacher. Every delay has been protection. Every loss has created space for something better. Shani Maharaj, I bow to your cosmic wisdom. The 7.5 years that build character.',
    type: 'kundli',
    timestamp: '3h ago',
    likes: 334,
    comments: 97,
    badge: 'Sade Sati Wisdom',
    tags: ['#ShaneSadeSati', '#Saturn', '#KarmicLessons'],
  },
  {
    id: '16',
    username: 'tarot_daily',
    avatar: '🃏',
    rank: 'Rashi Ranger',
    content: 'Three-card pull this morning: Past — The Hermit (solitude was necessary) | Present — The Star (hope returns, healing underway) | Future — The World (completion approaching!) 🌍✨ This spread gave me chills. The arc of my last 3 years told in three cards. Tarot never lies.',
    type: 'tarot',
    timestamp: '3h ago',
    likes: 156,
    comments: 43,
    badge: 'Three Card Spread',
    tags: ['#ThreeCardSpread', '#TarotJourney', '#TheWorld'],
  },
  {
    id: '17',
    username: 'mantra_maven',
    avatar: '🎵',
    rank: 'Graha Guardian',
    content: '108 repetitions of the Gayatri Mantra completed at dawn 🌅\n\nॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥\n\nThe 108 sacred repetitions at sunrise during Brahma Muhurta carries 1000x amplification. Today\'s energy will carry this vibration for hours. Join me tomorrow!',
    type: 'ritual',
    timestamp: '4h ago',
    likes: 289,
    comments: 71,
    badge: 'Gayatri Japa',
    tags: ['#GayatriMantra', '#108Japa', '#BrahmaMuhurta'],
  },
  {
    id: '18',
    username: 'destiny_number',
    avatar: '🔢',
    rank: 'Nakshatra Navigator',
    content: 'Personal Year 9 — the year of completion and release ♾️ Everything I\'ve been building for 9 years is coming to its natural end to make way for a new 9-year cycle. Numerology predicted this massive life transition months ago. Now watching it unfold in real time. Mind = blown 🤯',
    type: 'numerology',
    timestamp: '5h ago',
    likes: 83,
    comments: 26,
    badge: 'Personal Year 9',
    tags: ['#PersonalYear9', '#Numerology', '#LifeCycles'],
  },
  {
    id: '19',
    username: 'cosmic_achiever',
    avatar: '🏆',
    rank: 'Vedic Visionary',
    content: '🎖️ Achievement Unlocked: "Nakshatra Scholar" — answered 50 daily challenges correctly! The knowledge I\'ve gained about the 27 nakshatras, their ruling planets, deities, and qualities has genuinely changed how I see the world. Every moment has a cosmic signature. Started this journey knowing nothing. Now I\'m a Navigator! 🌟',
    type: 'achievement',
    timestamp: '6h ago',
    likes: 167,
    comments: 54,
    badge: 'Nakshatra Scholar',
    tags: ['#Achievement', '#NakshatraScholar', '#CosmicLearning'],
  },
  {
    id: '20',
    username: 'vastu_vibe',
    avatar: '🏛️',
    rank: 'Rashi Ranger',
    content: 'Rearranged my home office based on Vastu principles — Northeast for study (zone of wisdom, ruled by Jupiter), East facing desk (solar energy for clarity), water element in the North. Within ONE WEEK my productivity doubled and creative blocks dissolved. The ancient architects knew something we forgot. 🏛️',
    type: 'ritual',
    timestamp: '8h ago',
    likes: 234,
    comments: 78,
    tags: ['#Vastu', '#VastuShastra', '#CosmicHome'],
  },
]

const TYPE_ICONS: Record<PostType, { icon: string; label: string; color: string }> = {
  kundli: { icon: '⬡', label: 'Kundli', color: 'text-amber-400' },
  tarot: { icon: '🃏', label: 'Tarot', color: 'text-violet-400' },
  numerology: { icon: '✦', label: 'Numerology', color: 'text-cyan-400' },
  achievement: { icon: '🏆', label: 'Achievement', color: 'text-gold' },
  scripture: { icon: '📿', label: 'Scripture', color: 'text-rose-400' },
  ritual: { icon: '🕯', label: 'Ritual', color: 'text-yellow-300' },
  compatibility: { icon: '💫', label: 'Compatibility', color: 'text-pink-400' },
}

const FILTER_TABS: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '✦' },
  { key: 'kundli', label: 'Kundli', icon: '⬡' },
  { key: 'tarot', label: 'Tarot', icon: '🃏' },
  { key: 'numerology', label: 'Numerology', icon: '✦' },
  { key: 'achievement', label: 'Achievements', icon: '🏆' },
  { key: 'scripture', label: 'Scripture', icon: '📿' },
]

const TRENDING_TOPICS = [
  { tag: '#GajaKesari', count: '248 posts', color: 'text-amber-400' },
  { tag: '#MercuryRetrograde', count: '1.2k posts', color: 'text-cyan-400' },
  { tag: '#LifePath7', count: '445 posts', color: 'text-violet-400' },
  { tag: '#BhagavadGita', count: '892 posts', color: 'text-rose-400' },
  { tag: '#KundliMilan', count: '334 posts', color: 'text-pink-400' },
  { tag: '#FullMoon', count: '678 posts', color: 'text-indigo-300' },
  { tag: '#SadeSati', count: '189 posts', color: 'text-slate-300' },
]

const POST_TYPE_OPTIONS: { value: PostType; label: string; icon: string }[] = [
  { value: 'kundli', label: 'Kundli Discovery', icon: '⬡' },
  { value: 'tarot', label: 'Tarot Reading', icon: '🃏' },
  { value: 'numerology', label: 'Numerology Reveal', icon: '✦' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'scripture', label: 'Scripture / Wisdom', icon: '📿' },
  { value: 'ritual', label: 'Daily Ritual', icon: '🕯' },
  { value: 'compatibility', label: 'Compatibility', icon: '💫' },
]

// ─── Animation Variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
}

// ─── Post Card ─────────────────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
}: {
  post: CommunityPost
  onLike: (id: string) => void
}) {
  const typeInfo = TYPE_ICONS[post.type]
  const [expanded, setExpanded] = useState(false)
  const MAX_LEN = 200
  const isLong = post.content.length > MAX_LEN
  const displayContent = isLong && !expanded
    ? post.content.slice(0, MAX_LEN) + '…'
    : post.content

  function handleShare() {
    navigator.clipboard?.writeText(`${post.content}\n\n— ${post.username} on Nakshatra Cosmic Community`).catch(() => {})
    toast.success('Copied to clipboard! ✦', { icon: '🔗' })
  }

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="glass-card p-5 hover:border-gold/25 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl select-none">{post.avatar}</div>
          <div>
            <div className="font-cinzel text-sm text-white font-semibold">{post.username}</div>
            <div className="text-xs text-gold/50 font-cinzel mt-0.5">{post.rank}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-lg ${typeInfo.color}`}>{typeInfo.icon}</span>
          <span className="text-xs text-slate-500 font-cinzel">{post.timestamp}</span>
        </div>
      </div>

      {/* Badge */}
      {post.badge && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/25 text-xs font-cinzel text-gold">
            <Sparkles size={10} />
            {post.badge}
          </span>
        </div>
      )}

      {/* Content */}
      <p className="font-cormorant text-slate-200 text-base leading-relaxed whitespace-pre-line">
        {displayContent}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gold/60 hover:text-gold font-cinzel mt-1 transition-colors"
        >
          {expanded ? 'Show less ▲' : 'Read more ▼'}
        </button>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-cinzel text-violet-400/80 hover:text-violet-300 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stardust/40">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-sm font-cinzel transition-all duration-200 group ${
            post.liked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'
          }`}
        >
          <Heart
            size={15}
            className={`transition-transform group-hover:scale-110 ${post.liked ? 'fill-rose-400' : ''}`}
          />
          <span>{post.likes}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm font-cinzel text-slate-500 hover:text-sky-400 transition-colors">
          <MessageCircle size={15} />
          <span>{post.comments}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-cinzel text-slate-500 hover:text-gold transition-colors ml-auto"
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Create Post Modal ─────────────────────────────────────────────────────

function CreatePostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (content: string, type: PostType) => void
}) {
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<PostType>('kundli')

  function handleSubmit() {
    if (content.trim().length < 10) {
      toast.error('Write at least 10 characters to share your cosmic story.')
      return
    }
    onSubmit(content.trim(), selectedType)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cosmos/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="glass-card shimmer-border w-full max-w-lg p-6"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-cinzel text-lg font-bold text-gold-gradient">Share Your Cosmic Story</h3>
            <p className="text-xs font-cinzel text-slate-400 mt-0.5">+15 XP for posting</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stardust/60 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type selector */}
        <div className="mb-4">
          <label className="block text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-2">
            Story Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-cinzel transition-all duration-200 text-left ${
                  selectedType === opt.value
                    ? 'bg-gold/15 border border-gold/50 text-gold'
                    : 'bg-stardust/30 border border-stardust/60 text-slate-400 hover:border-gold/30'
                }`}
              >
                <span>{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-5">
          <label className="block text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-2">
            Your Story
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What cosmic revelation are you experiencing today? Share your chart discoveries, tarot insights, or ancient wisdom with the community…"
            rows={5}
            className="w-full bg-stardust/40 border border-stardust/80 rounded-xl px-4 py-3 text-slate-200 font-cormorant text-base placeholder-slate-600 focus:outline-none focus:border-gold/50 resize-none transition-colors"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600 font-cinzel">Min 10 characters</span>
            <span className={`text-xs font-cinzel ${content.length > 500 ? 'text-rose-400' : 'text-slate-600'}`}>
              {content.length}/500
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stardust/60 text-slate-400 font-cinzel text-sm hover:bg-stardust/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-saffron to-gold text-cosmos font-cinzel font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            Post +15 XP
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Community Page ───────────────────────────────────────────────────

const STORAGE_KEY = 'nakshatra-community-posts'

function loadPersistedPosts(): CommunityPost[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const likedJson = localStorage.getItem(STORAGE_KEY + '-likes')
    const likedIds = new Set<string>(likedJson ? JSON.parse(likedJson) : [])

    // Restore like state on seed posts
    const seedPosts = INITIAL_POSTS.map((p) =>
      likedIds.has(p.id) ? { ...p, liked: true, likes: p.likes + 1 } : p
    )

    if (stored) {
      const userPosts: CommunityPost[] = JSON.parse(stored)
      const userIds = new Set(userPosts.map((p) => p.id))
      return [...userPosts, ...seedPosts.filter((p) => !userIds.has(p.id))]
    }

    return seedPosts
  } catch {
    // Corrupted storage — ignore
  }
  return INITIAL_POSTS
}

function persistUserPosts(posts: CommunityPost[]) {
  try {
    // Persist user-created posts + liked state for seed posts
    const seedIds = new Set(INITIAL_POSTS.map((p) => p.id))
    const userPosts = posts.filter((p) => !seedIds.has(p.id))
    const likedSeedIds = posts.filter((p) => seedIds.has(p.id) && p.liked).map((p) => p.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userPosts))
    localStorage.setItem(STORAGE_KEY + '-likes', JSON.stringify(likedSeedIds))
  } catch {
    // Storage full or unavailable — ignore
  }
}

export default function CommunityPage() {
  const { user, addXP } = useStore()
  const [posts, setPosts] = useState<CommunityPost[]>(loadPersistedPosts)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Persist user-created posts to localStorage
  useEffect(() => {
    persistUserPosts(posts)
  }, [posts])

  const liveCount = useMemo(
    () => Math.floor(2000 + Math.random() * 1500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return posts
    return posts.filter((p) => p.type === activeFilter)
  }, [posts, activeFilter])

  const handleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
          : p
      )
    )
  }, [])

  const handleCreatePost = useCallback(
    (content: string, type: PostType) => {
      const newPost: CommunityPost = {
        id: `user-${Date.now()}`,
        username: user?.username ?? 'cosmic_seeker',
        avatar: user?.avatar ?? '🌟',
        rank: user?.rank ?? 'Stardust Seeker',
        content,
        type,
        timestamp: 'just now',
        likes: 0,
        comments: 0,
        tags: [],
      }
      setPosts((prev) => [newPost, ...prev])
      addXP(15, 'COMMUNITY_POST')
      setShowCreateModal(false)
      toast.success('+15 XP! Your cosmic story is live ✨', {
        style: {
          background: '#0D2137',
          color: '#FFB347',
          border: '1px solid rgba(255,179,71,0.3)',
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
        },
      })
    },
    [user, addXP]
  )

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

        {/* ── Page Header ───────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="glass-card shimmer-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-gold-gradient">
                Cosmic Community
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-cinzel text-green-400">✦ Live Cosmic Feed</span>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25">
                <Users size={14} className="text-gold" />
                <span className="text-sm font-cinzel text-gold">
                  🌟 {liveCount.toLocaleString()} cosmic seekers active today
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main content grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Feed ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Create post card */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full glass-card p-4 border border-dashed border-gold/25 hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{user?.avatar ?? '🌟'}</div>
                  <div className="flex-1">
                    <p className="font-cormorant text-slate-500 text-base group-hover:text-slate-400 transition-colors">
                      Share your cosmic story with the community…
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-saffron/80 to-gold/80 text-cosmos text-xs font-cinzel font-bold">
                    <Plus size={12} />
                    Post
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Filter tabs */}
            <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cinzel transition-all duration-200 ${
                    activeFilter === tab.key
                      ? 'bg-gold/20 border border-gold/50 text-gold'
                      : 'bg-stardust/40 border border-stardust/60 text-slate-400 hover:border-gold/30 hover:text-gold/70'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Posts feed */}
            <AnimatePresence mode="popLayout">
              {filteredPosts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <div className="text-4xl mb-3">✦</div>
                  <p className="font-cinzel text-slate-500">No posts in this category yet.</p>
                  <p className="font-cormorant text-slate-600 mt-1">Be the first to share your cosmic story!</p>
                </motion.div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={handleLike} />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Sidebar ────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Trending topics */}
            <motion.div variants={itemVariants} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-gold" />
                <h3 className="font-cinzel text-sm font-bold text-gold uppercase tracking-wider">
                  Trending Topics
                </h3>
              </div>
              <div className="space-y-2">
                {TRENDING_TOPICS.map((topic, i) => (
                  <button
                    key={topic.tag}
                    className="w-full flex items-center justify-between py-2 px-2 rounded-lg hover:bg-stardust/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-cinzel text-slate-600 w-4">{i + 1}</span>
                      <div>
                        <div className={`text-sm font-cinzel font-semibold ${topic.color} group-hover:opacity-100 opacity-90`}>
                          {topic.tag}
                        </div>
                        <div className="text-xs text-slate-600 font-cinzel">{topic.count}</div>
                      </div>
                    </div>
                    <Hash size={12} className="text-slate-600 group-hover:text-gold/40 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Community stats */}
            <motion.div variants={itemVariants} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={15} className="text-gold" />
                <h3 className="font-cinzel text-sm font-bold text-gold uppercase tracking-wider">
                  Community Stats
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Posts Today', value: '1,247', icon: '📜' },
                  { label: 'Kundli Shared', value: '389', icon: '⬡' },
                  { label: 'Tarot Spreads', value: '521', icon: '🃏' },
                  { label: 'Scriptures Quoted', value: '204', icon: '📿' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-stardust/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{stat.icon}</span>
                      <span className="text-xs font-cinzel text-slate-400">{stat.label}</span>
                    </div>
                    <span className="text-sm font-cinzel font-bold text-gold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Post XP prompt */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full glass-card p-4 border border-gold/20 hover:border-gold/40 transition-all duration-300 group text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-gold" />
                  <span className="text-xs font-cinzel text-gold uppercase tracking-wider">Earn XP</span>
                </div>
                <p className="font-cormorant text-slate-400 text-sm mb-3">
                  Share your cosmic wisdom and earn <span className="text-gold font-semibold">+15 XP</span> for every post.
                </p>
                <div className="flex items-center gap-1 text-xs font-cinzel text-gold/60 group-hover:text-gold transition-colors">
                  <span>Share now</span>
                  <ChevronRight size={12} />
                </div>
              </button>
            </motion.div>

          </div>
        </div>

        {/* Footer spacer */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <p className="text-xs font-cinzel text-slate-700 tracking-widest">
            ✦ सर्वे भवन्तु सुखिनः ✦
          </p>
        </motion.div>

      </motion.div>

      {/* Create post modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePost}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
