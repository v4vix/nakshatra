import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  BookOpen,
  Share2,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Star,
  Award,
  RotateCcw,
  Search,
  MessageCircle,
  Loader2,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Verse {
  id: string
  source: string
  sourceShort: string
  sanskrit: string
  transliteration: string
  translation: string
  commentary: string
  category: 'gita' | 'upanishad' | 'veda' | 'yoga'
}

interface GitaChapter {
  number: number
  title: string
  verses: number
  summary: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

// ─── Verses Data ──────────────────────────────────────────────────────────────

const VERSES: Verse[] = [
  {
    id: 'bg-2-47',
    source: 'Bhagavad Gita 2:47',
    sourceShort: 'BG 2:47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration:
      'Karmanye vadhikaraste ma phaleshu kadachana, ma karma-phala-hetur bhur ma te sango \'stv akarmani',
    translation:
      'You have the right to perform your duties, but never to the fruits of action. Never consider yourself the cause of results, nor be attached to inaction.',
    commentary:
      'This is the central teaching of the Bhagavad Gita — Nishkama Karma (desireless action). Krishna teaches Arjuna to act with full dedication without attachment to the outcome, for such action purifies the mind and leads to liberation.',
    category: 'gita',
  },
  {
    id: 'bg-9-22',
    source: 'Bhagavad Gita 9:22',
    sourceShort: 'BG 9:22',
    sanskrit:
      'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
    transliteration:
      'Ananyash chintayanto mam ye janah paryupasate, tesham nityabhiyuktanam yoga-kshemam vahamy aham',
    translation:
      'To those who worship Me with devotion, meditating on My transcendental form, I carry what they lack and preserve what they have.',
    commentary:
      'Krishna promises complete care for those who surrender entirely to Him. This verse is the foundation of Bhakti Yoga — the path of pure devotional love. Divine grace flows naturally to the sincere devotee.',
    category: 'gita',
  },
  {
    id: 'bg-4-7',
    source: 'Bhagavad Gita 4:7',
    sourceShort: 'BG 4:7',
    sanskrit:
      'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदाऽऽत्मानं सृजाम्यहम्॥',
    transliteration:
      'Yada yada hi dharmasya glanir bhavati bharata, abhyutthanam adharmasya tadatmanam srjamy aham',
    translation:
      'Whenever and wherever there is a decline in religious practice and a predominant rise of irreligion, at that time I descend Myself.',
    commentary:
      'Krishna reveals the divine law of avatara — the Lord incarnates whenever dharma declines and adharma rises. This is the cosmic principle of divine intervention to restore righteousness across all ages and yugas.',
    category: 'gita',
  },
  {
    id: 'bg-2-19',
    source: 'Bhagavad Gita 2:19',
    sourceShort: 'BG 2:19',
    sanskrit:
      'य एनं वेत्ति हन्तारं यश्चैनं मन्यते हतम्। उभौ तौ न विजानीतो नायं हन्ति न हन्यते॥',
    transliteration:
      'Ya enam vetti hantaram yash chainam manyate hatam, ubhau tau na vijanito nayam hanti na hanyate',
    translation:
      'He who thinks that this Self is a slayer and he who thinks that this Self is slain — both fail to perceive the truth. This Self slays not, nor is It slain.',
    commentary:
      'The Atman (Self) is eternal, unchanging, and beyond birth and death. Only the body perishes; the soul is imperishable. This teaching liberates Arjuna from grief over apparent death in battle.',
    category: 'gita',
  },
  {
    id: 'bg-18-66',
    source: 'Bhagavad Gita 18:66',
    sourceShort: 'BG 18:66',
    sanskrit:
      'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    transliteration:
      'Sarva-dharman parityajya mam ekam sharanam vraja, aham tvam sarva-papebhyo mokshayishyami ma shucah',
    translation:
      'Abandon all varieties of dharma and simply surrender unto Me alone. I shall deliver you from all sinful reactions. Do not fear.',
    commentary:
      'This is the most sacred verse of the entire Gita — the Charama Shloka. It is the ultimate teaching: complete surrender to the Divine. All duties, paths, and practices culminate in this total surrender.',
    category: 'gita',
  },
  {
    id: 'bau-1-3-28',
    source: 'Brihadaranyaka Upanishad 1.3.28',
    sourceShort: 'BAU 1.3.28',
    sanskrit:
      'असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्माऽमृतं गमय॥ ॐ शान्तिः शान्तिः शान्तिः॥',
    transliteration:
      'Asato ma sat gamaya, tamaso ma jyotir gamaya, mrityor ma amritam gamaya. Om shantih shantih shantih.',
    translation:
      'Lead me from the unreal to the real. Lead me from darkness to light. Lead me from death to immortality. Om peace, peace, peace.',
    commentary:
      'This Shanti Mantra from the Brihadaranyaka Upanishad is one of the most profound prayers in Vedic tradition. It encapsulates the entire spiritual journey: from illusion to truth, from ignorance to wisdom, from mortality to the eternal.',
    category: 'upanishad',
  },
  {
    id: 'mu-1-2',
    source: 'Mandukya Upanishad 1:2',
    sourceShort: 'MU 1:2',
    sanskrit: 'सर्वं ह्येतद् ब्रह्म।',
    transliteration: 'Sarvam hyetad brahma',
    translation: 'All this universe is Brahman.',
    commentary:
      'One of the most concise and profound Mahavakyas of the Upanishads. The entire manifest universe — every atom, being, thought, and star — is none other than Brahman, the supreme consciousness. There is only One.',
    category: 'upanishad',
  },
  {
    id: 'cu-6-8-7',
    source: 'Chandogya Upanishad 6.8.7',
    sourceShort: 'CU 6.8.7',
    sanskrit: 'तत् त्वम् असि॥',
    transliteration: 'Tat tvam asi',
    translation: "That thou art. You are that Brahman, the Absolute Reality.",
    commentary:
      'One of the four Mahavakyas (Great Sayings) of the Upanishads. Uddalaka Aruni teaches his son Shvetaketu: the ultimate reality (Tat) that underlies all existence is identical with your deepest Self (tvam). You are Brahman.',
    category: 'upanishad',
  },
  {
    id: 'ys-1-2',
    source: 'Yoga Sutras of Patanjali 1:2',
    sourceShort: 'YS 1:2',
    sanskrit: 'योगश्चित्तवृत्तिनिरोधः॥',
    transliteration: 'Yogash chitta-vritti-nirodhah',
    translation: 'Yoga is the cessation of the modifications of the mind.',
    commentary:
      'This is the foundational definition of Yoga according to Patanjali. The mind constantly fluctuates with thoughts (vrittis). Yoga is the practice of stilling these fluctuations to reveal the pure consciousness beneath — the Purusha.',
    category: 'yoga',
  },
  {
    id: 'bg-6-5',
    source: 'Bhagavad Gita 6:5',
    sourceShort: 'BG 6:5',
    sanskrit:
      'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    transliteration:
      "Uddhared atmanatmanam natmanam avasadayet, atmaiva hy atmano bandhur atmaiva ripur atmanah",
    translation:
      'Let a man lift himself by his own Self; let him not lower himself. For this self alone is the friend of oneself, and this self alone is the enemy of oneself.',
    commentary:
      'The highest truth of self-responsibility in the Gita. No external savior is required — you are your own liberator or your own obstacle. Discipline the lower nature and the higher Self becomes your greatest ally.',
    category: 'gita',
  },
  {
    id: 'ku-1-3',
    source: 'Kena Upanishad 1:3',
    sourceShort: 'KU 1:3',
    sanskrit: 'न तत्र चक्षुर्गच्छति न वाग्गच्छति नो मनः।',
    transliteration: 'Na tatra chaksur gacchati na vag gacchati no manah',
    translation:
      'There the eye does not go, nor speech, nor the mind. We do not know, we do not understand, how one could teach It.',
    commentary:
      'The Kena Upanishad describes Brahman as beyond all sensory perception and mental conception. The Absolute cannot be seen, spoken, or thought — it is the very ground from which all perception and thought arise.',
    category: 'upanishad',
  },
  {
    id: 'bg-2-14',
    source: 'Bhagavad Gita 2:14',
    sourceShort: 'BG 2:14',
    sanskrit:
      'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः। आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥',
    transliteration:
      'Matra-sparsas tu kaunteya shitoshna-sukha-duhkha-dah, agamapayino nityhas tams titikshasva bharata',
    translation:
      'The nonpermanent appearance of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons. They arise from sense perception, and one must learn to tolerate them without being disturbed.',
    commentary:
      'Krishna teaches equanimity — the ability to remain undisturbed by the inevitable fluctuations of pleasure and pain. Like seasons, they come and go. The realized sage endures both without being controlled by either.',
    category: 'gita',
  },
]

// ─── Gita Chapters ────────────────────────────────────────────────────────────

const GITA_CHAPTERS: GitaChapter[] = [
  { number: 1, title: "Arjuna's Dilemma", verses: 47, summary: "Arjuna's grief on the battlefield of Kurukshetra as he faces his own kinsmen." },
  { number: 2, title: 'The Eternal Reality', verses: 72, summary: 'Krishna reveals the immortality of the Soul and the philosophy of Sankhya.' },
  { number: 3, title: 'The Path of Action', verses: 43, summary: 'Krishna explains Karma Yoga — performing duties without attachment to results.' },
  { number: 4, title: 'Wisdom in Action', verses: 42, summary: 'Divine knowledge, the fire of wisdom, and the mystery of divine incarnation.' },
  { number: 5, title: 'The Path of Renunciation', verses: 29, summary: 'True renunciation means inner detachment while acting in the world.' },
  { number: 6, title: 'The Path of Meditation', verses: 47, summary: 'Dhyana Yoga — disciplined meditation, the controlled mind, and the yogi\'s state.' },
  { number: 7, title: 'Knowledge of the Absolute', verses: 30, summary: 'Krishna reveals His divine nature and how the wise come to know Him.' },
  { number: 8, title: 'Attaining the Eternal', verses: 28, summary: 'The mystery of what happens at death and how to attain the Supreme.' },
  { number: 9, title: 'Royal Knowledge', verses: 34, summary: 'The most secret of all knowledge — pure devotion and divine grace.' },
  { number: 10, title: 'Opulences of the Absolute', verses: 42, summary: 'Krishna describes His divine manifestations in the world.' },
  { number: 11, title: 'The Universal Form', verses: 55, summary: 'Arjuna is granted divine vision to behold Krishna\'s cosmic universal form.' },
  { number: 12, title: 'The Path of Devotion', verses: 20, summary: 'Bhakti Yoga — the supremacy and nature of loving devotion to God.' },
  { number: 13, title: 'The Field and the Knower', verses: 35, summary: 'Kshetra and Kshetrajna — the distinction between body, nature, and Self.' },
  { number: 14, title: 'The Three Modes', verses: 27, summary: 'The three gunas — Sattva, Rajas, Tamas — and transcending them.' },
  { number: 15, title: 'The Supreme Person', verses: 20, summary: 'Purushottama Yoga — the supreme Person beyond the perishable and imperishable.' },
  { number: 16, title: 'The Divine and Demoniac', verses: 24, summary: 'Divine vs. demoniac qualities and the importance of scriptural guidance.' },
  { number: 17, title: 'Threefold Faith', verses: 28, summary: 'How the three gunas shape faith, food, worship, and sacrifice.' },
  { number: 18, title: 'The Perfection of Renunciation', verses: 78, summary: 'The ultimate teaching: surrender all actions to Krishna and be free.' },
]

// ─── Quiz Data ────────────────────────────────────────────────────────────────

const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'In Bhagavad Gita 2:47, what does Krishna say about the fruits of action?',
    options: [
      'You must always strive for the fruits of your actions',
      'Never consider yourself the cause of results, nor be attached to inaction',
      'The fruits of action belong to the guru',
      'One should renounce all action entirely',
    ],
    correctIndex: 1,
    explanation:
      "BG 2:47 teaches Nishkama Karma — perform your duty fully, but relinquish attachment to results. You have the right to action, not to its fruits.",
  },
  {
    question: 'The Mahavakya "Tat tvam asi" originates from which Upanishad?',
    options: ['Mandukya Upanishad', 'Brihadaranyaka Upanishad', 'Chandogya Upanishad', 'Kena Upanishad'],
    correctIndex: 2,
    explanation:
      '"Tat tvam asi" (That thou art) appears in the Chandogya Upanishad 6.8.7, where Uddalaka teaches his son Shvetaketu about the identity of Atman and Brahman.',
  },
  {
    question: 'According to Patanjali\'s Yoga Sutras, Yoga is defined as:',
    options: [
      'Union with the divine through breath',
      'Physical postures and exercises',
      'The cessation of the modifications of the mind',
      'Service to humanity',
    ],
    correctIndex: 2,
    explanation:
      'Yoga Sutra 1:2 — "Yogash chitta-vritti-nirodhah" — defines Yoga as stilling the fluctuations (vrittis) of the mind to reveal pure consciousness.',
  },
  {
    question: "The Bhagavad Gita's Chapter 11 is called:",
    options: ['The Path of Devotion', 'The Universal Form', 'Wisdom in Action', 'The Eternal Reality'],
    correctIndex: 1,
    explanation:
      'Chapter 11 — Vishvarupa Darshana Yoga — describes Arjuna being granted divine vision to behold Krishna\'s cosmic universal form with many arms, faces, and radiance.',
  },
  {
    question: 'What does "Asato ma sat gamaya" mean?',
    options: [
      'Lead me from the real to the unreal',
      'From ignorance to knowledge',
      'Lead me from the unreal to the real',
      'From weakness to strength',
    ],
    correctIndex: 2,
    explanation:
      'From the Brihadaranyaka Upanishad 1.3.28, the Shanti Mantra: "Lead me from the unreal to the real" — a prayer for spiritual illumination and truth.',
  },
]

// ─── Daily Verse (deterministic by date) ─────────────────────────────────────

function getDailyVerse(): Verse {
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  return VERSES[dayOfYear % VERSES.length]
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type LibraryTab = 'gita' | 'upanishads' | 'vedas' | 'yoga'

const UPANISHAD_LIST = [
  { name: 'Chandogya Upanishad', verses: 628, category: 'Sama Veda' },
  { name: 'Brihadaranyaka Upanishad', verses: 438, category: 'Shukla Yajur Veda' },
  { name: 'Mandukya Upanishad', verses: 12, category: 'Atharva Veda' },
  { name: 'Kena Upanishad', verses: 34, category: 'Sama Veda' },
  { name: 'Katha Upanishad', verses: 119, category: 'Krishna Yajur Veda' },
  { name: 'Mundaka Upanishad', verses: 64, category: 'Atharva Veda' },
  { name: 'Taittiriya Upanishad', verses: 83, category: 'Krishna Yajur Veda' },
  { name: 'Aitareya Upanishad', verses: 33, category: 'Rig Veda' },
  { name: 'Prashna Upanishad', verses: 67, category: 'Atharva Veda' },
  { name: 'Isha Upanishad', verses: 18, category: 'Shukla Yajur Veda' },
]

const VEDA_LIST = [
  { name: 'Rig Veda', hymns: 1028, mandalas: 10, focus: 'Praise of deities, creation, cosmic order' },
  { name: 'Sama Veda', hymns: 1875, mandalas: 0, focus: 'Melodies and chants for Soma rituals' },
  { name: 'Yajur Veda', hymns: 1875, mandalas: 0, focus: 'Sacrificial formulas and ritual procedures' },
  { name: 'Atharva Veda', hymns: 730, mandalas: 20, focus: 'Spells, healing, philosophy, and daily life' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Scriptures() {
  const { addXP, user } = useStore()
  const [dailyVerseRead, setDailyVerseRead] = useState(false)
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('gita')
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizQuestions] = useState<QuizQuestion[]>(() => {
    const shuffled = [...ALL_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answersCorrect, setAnswersCorrect] = useState<boolean[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [totalQuizXP, setTotalQuizXP] = useState(0)

  // Backend shlokas state
  const [backendShlokas, setBackendShlokas] = useState<any[]>([])
  const [shlokasLoading, setShlokasLoading] = useState(false)
  const [shlokasLoaded, setShlokasLoaded] = useState(false)
  const [shlokaSearch, setShlokaSearch] = useState('')

  // Ask a question state
  const [askQuestion, setAskQuestion] = useState('')
  const [askAnswer, setAskAnswer] = useState<{ content: string; provider: string } | null>(null)
  const [askLoading, setAskLoading] = useState(false)
  const [askRelatedShloka, setAskRelatedShloka] = useState<any>(null)

  const fetchAllShlokas = useCallback(async () => {
    if (shlokasLoaded) return
    setShlokasLoading(true)
    try {
      const res = await fetch(`${API_BASE}/scripture/all`)
      const data = await res.json()
      if (data.success && data.shlokas) {
        setBackendShlokas(data.shlokas)
        setShlokasLoaded(true)
      }
    } catch (err) {
      console.error('Failed to fetch shlokas:', err)
      toast.error('Could not load shlokas from server')
    } finally {
      setShlokasLoading(false)
    }
  }, [shlokasLoaded])

  const handleAskQuestion = useCallback(async () => {
    if (!askQuestion.trim() || askQuestion.trim().length < 3) return
    setAskLoading(true)
    setAskAnswer(null)
    setAskRelatedShloka(null)
    try {
      const res = await fetch(`${API_BASE}/scripture/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: askQuestion.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setAskAnswer(data.response)
        setAskRelatedShloka(data.relatedShloka ?? null)
        addXP(5, 'scripture_ask')
      } else {
        toast.error(data.error || 'Failed to get answer')
      }
    } catch (err) {
      console.error('Scripture ask failed:', err)
      toast.error('Could not reach the scripture service')
    } finally {
      setAskLoading(false)
    }
  }, [askQuestion, addXP])

  const filteredShlokas = useMemo(() => {
    if (!shlokaSearch.trim()) return backendShlokas
    const q = shlokaSearch.toLowerCase()
    return backendShlokas.filter(
      (s: any) =>
        s.source?.toLowerCase().includes(q) ||
        s.translation?.toLowerCase().includes(q) ||
        s.sanskrit?.includes(shlokaSearch) ||
        s.transliteration?.toLowerCase().includes(q)
    )
  }, [backendShlokas, shlokaSearch])

  const dailyVerse = useMemo(() => getDailyVerse(), [])

  const handleMarkRead = () => {
    if (dailyVerseRead) return
    setDailyVerseRead(true)
    addXP(10, 'daily_verse_read')
    toast.success('+10 XP — Daily verse marked as read!', { icon: '📿' })
  }

  const handleShare = () => {
    const text = `"${dailyVerse.translation}" — ${dailyVerse.source}`
    if (navigator.share) {
      navigator.share({ text, title: 'Nakshatra Sacred Verse' })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Verse copied to clipboard!', { icon: '📋' })
    }
  }

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return
    const correct = selectedAnswer === quizQuestions[currentQuestion].correctIndex
    const newCorrect = [...answersCorrect, correct]
    setAnswersCorrect(newCorrect)

    if (correct) {
      addXP(15, 'quiz_correct_answer')
      setTotalQuizXP((prev) => prev + 15)
      toast.success('+15 XP — Correct!', { icon: '✨' })
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
    } else {
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswersCorrect([])
    setQuizComplete(false)
    setTotalQuizXP(0)
  }

  const LIBRARY_TABS: { id: LibraryTab; label: string; icon: string }[] = [
    { id: 'gita', label: 'Bhagavad Gita', icon: '📖' },
    { id: 'upanishads', label: 'Upanishads', icon: '🔱' },
    { id: 'vedas', label: 'Vedas', icon: '🕉️' },
    { id: 'yoga', label: 'Yoga Sutras', icon: '🧘' },
  ]

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <BookOpen className="w-7 h-7 text-saffron" />
          <h1 className="text-3xl font-cinzel text-gold-gradient">Sacred Scriptures</h1>
          <BookOpen className="w-7 h-7 text-saffron" />
        </div>
        <p className="text-white/60 font-cormorant text-lg">
          Timeless wisdom from the Bhagavad Gita, Upanishads, Vedas, and Yoga Sutras
        </p>
      </motion.div>

      {/* Daily Verse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card shimmer-border rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-saffron font-cinzel uppercase tracking-wider mb-1">
              Today's Sacred Verse
            </div>
            <div className="text-sm text-white/50 font-cormorant">{dailyVerse.source}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              title="Share verse"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sanskrit */}
        <div className="text-center mb-4">
          <p className="text-2xl font-devanagari text-champagne leading-relaxed mb-3">
            {dailyVerse.sanskrit}
          </p>
          <p className="text-sm text-white/50 italic font-cormorant leading-relaxed">
            {dailyVerse.transliteration}
          </p>
        </div>

        <div className="h-px bg-white/10 mb-4" />

        {/* Translation */}
        <blockquote className="text-lg font-cormorant text-white/80 leading-relaxed text-center mb-4 italic">
          "{dailyVerse.translation}"
        </blockquote>

        {/* Commentary */}
        <div className="bg-white/5 rounded-xl p-4 mb-5">
          <div className="text-xs text-white/40 font-cinzel uppercase tracking-wider mb-2">
            Commentary
          </div>
          <p className="text-sm text-white/65 font-cormorant leading-relaxed">
            {dailyVerse.commentary}
          </p>
        </div>

        {/* Mark as Read */}
        <button
          onClick={handleMarkRead}
          disabled={dailyVerseRead}
          className={`w-full py-3 rounded-xl font-cinzel text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            dailyVerseRead
              ? 'bg-green-500/20 border border-green-500/30 text-green-400 cursor-default'
              : 'bg-saffron/20 border border-saffron/30 text-saffron hover:bg-saffron/30'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {dailyVerseRead ? 'Verse Read — +10 XP Earned!' : 'Mark as Read (+10 XP)'}
        </button>
      </motion.div>

      {/* Scripture Library */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <h2 className="text-lg font-cinzel text-champagne mb-4">Scripture Library</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
          {LIBRARY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLibraryTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-cinzel transition-all ${
                libraryTab === tab.id
                  ? 'bg-saffron/20 text-saffron border border-saffron/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <span className="hidden sm:inline">{tab.icon} </span>{tab.label}
            </button>
          ))}
        </div>

        {/* Bhagavad Gita */}
        <AnimatePresence mode="wait">
          {libraryTab === 'gita' && (
            <motion.div
              key="gita"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-sm text-white/50 font-cormorant mb-4">
                The Bhagavad Gita consists of 700 verses across 18 chapters, narrating the divine
                dialogue between Lord Krishna and Arjuna on the battlefield of Kurukshetra.
              </div>
              <div className="space-y-2">
                {GITA_CHAPTERS.map((chapter) => (
                  <div
                    key={chapter.number}
                    className="border border-white/5 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedChapter(
                          expandedChapter === chapter.number ? null : chapter.number
                        )
                      }
                      className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-saffron/15 border border-saffron/25 text-saffron text-xs font-cinzel flex items-center justify-center">
                          {chapter.number}
                        </span>
                        <div>
                          <div className="text-sm font-cinzel text-white/80">{chapter.title}</div>
                          <div className="text-xs text-white/35">{chapter.verses} verses</div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedChapter === chapter.number ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-white/30" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedChapter === chapter.number && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 text-sm text-white/55 font-cormorant border-t border-white/5 pt-3">
                            {chapter.summary}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upanishads */}
          {libraryTab === 'upanishads' && (
            <motion.div
              key="upanishads"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-sm text-white/50 font-cormorant mb-4">
                The Upanishads are philosophical texts forming the theoretical basis of Hinduism.
                There are 108 principal Upanishads, of which 10 are considered most important.
              </div>
              <div className="space-y-2">
                {UPANISHAD_LIST.map((up) => (
                  <div
                    key={up.name}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-cinzel text-white/80">{up.name}</div>
                      <div className="text-xs text-white/35">{up.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-saffron">{up.verses} verses</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mahavakyas */}
              <div className="mt-6 p-4 bg-gold/5 rounded-xl border border-gold/15">
                <div className="text-xs font-cinzel text-gold mb-3 uppercase tracking-wider">
                  The Four Mahavakyas (Great Sayings)
                </div>
                {[
                  { text: 'Prajnanam Brahma', source: 'Aitareya Upanishad', meaning: 'Consciousness is Brahman' },
                  { text: 'Aham Brahmasmi', source: 'Brihadaranyaka Upanishad', meaning: 'I am Brahman' },
                  { text: 'Tat tvam asi', source: 'Chandogya Upanishad', meaning: 'That thou art' },
                  { text: 'Ayam Atma Brahma', source: 'Mandukya Upanishad', meaning: 'This Self is Brahman' },
                ].map((m) => (
                  <div key={m.text} className="mb-2 last:mb-0">
                    <span className="text-sm font-cinzel text-champagne">{m.text}</span>
                    <span className="text-xs text-white/40 ml-2">— {m.source}</span>
                    <div className="text-xs text-white/50 font-cormorant">{m.meaning}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Vedas */}
          {libraryTab === 'vedas' && (
            <motion.div
              key="vedas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-sm text-white/50 font-cormorant mb-4">
                The four Vedas are the oldest and most sacred scriptures of Hinduism, revealed to
                ancient seers (Rishis) in deep meditation. They contain hymns, philosophical
                discussions, and ritual instructions.
              </div>
              <div className="space-y-3">
                {VEDA_LIST.map((veda, i) => (
                  <div
                    key={veda.name}
                    className="p-4 rounded-xl border border-white/5 hover:border-saffron/25 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-cinzel text-champagne">{veda.name}</h3>
                      <span className="text-xs text-saffron">{veda.hymns} hymns</span>
                    </div>
                    <p className="text-sm text-white/55 font-cormorant">{veda.focus}</p>
                    {veda.mandalas > 0 && (
                      <div className="text-xs text-white/35 mt-1">{veda.mandalas} mandalas/books</div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Yoga Sutras */}
          {libraryTab === 'yoga' && (
            <motion.div
              key="yoga"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-sm text-white/50 font-cormorant mb-4">
                The Yoga Sutras of Patanjali (c. 400 CE) contain 196 aphorisms organized into 4
                chapters (Padas), forming the philosophical foundation of Classical Yoga.
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { name: 'Samadhi Pada', sutras: 51, focus: 'The nature of yoga and the goal of liberation through meditation' },
                  { name: 'Sadhana Pada', sutras: 55, focus: 'The eight limbs of yoga (Ashtanga) as the path of practice' },
                  { name: 'Vibhuti Pada', sutras: 55, focus: 'Supernatural powers (siddhis) arising from advanced practice' },
                  { name: 'Kaivalya Pada', sutras: 34, focus: 'Liberation (kaivalya) and the nature of pure consciousness' },
                ].map((pada) => (
                  <div
                    key={pada.name}
                    className="p-3 rounded-xl border border-white/5 hover:border-saffron/20 transition-all"
                  >
                    <div className="text-sm font-cinzel text-champagne mb-1">{pada.name}</div>
                    <div className="text-xs text-saffron mb-1">{pada.sutras} sutras</div>
                    <div className="text-xs text-white/45 font-cormorant">{pada.focus}</div>
                  </div>
                ))}
              </div>
              {/* Key Sutras */}
              <div className="space-y-2">
                {VERSES.filter((v) => v.category === 'yoga').map((v) => (
                  <div key={v.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-saffron font-cinzel mb-1">{v.source}</div>
                    <div className="text-sm font-cormorant text-white/70 italic mb-1">{v.transliteration}</div>
                    <div className="text-sm text-white/60 font-cormorant">{v.translation}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-cinzel text-champagne">Daily Scripture Quiz</h2>
            <p className="text-xs text-white/40 font-cormorant">5 questions · +15 XP per correct answer</p>
          </div>
          <Star className="w-5 h-5 text-saffron" />
        </div>

        {!quizStarted && !quizComplete && (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-white/60 font-cormorant mb-5">
              Test your knowledge of the Vedas, Upanishads, Bhagavad Gita, and Yoga Sutras. Answer 5
              questions to earn up to 75 XP!
            </p>
            <button
              onClick={() => setQuizStarted(true)}
              className="px-8 py-3 rounded-xl bg-saffron/20 border border-saffron/30 text-saffron font-cinzel hover:bg-saffron/30 transition-all"
            >
              Begin Quiz
            </button>
          </div>
        )}

        {quizStarted && !quizComplete && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            {/* Progress */}
            <div className="flex items-center gap-2 mb-5">
              {quizQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i < currentQuestion
                      ? answersCorrect[i]
                        ? 'bg-green-400'
                        : 'bg-red-400'
                      : i === currentQuestion
                      ? 'bg-saffron'
                      : 'bg-white/10'
                  }`}
                />
              ))}
              <span className="text-xs text-white/40 ml-1">
                {currentQuestion + 1}/{quizQuestions.length}
              </span>
            </div>

            {/* Question */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-base font-cormorant text-white/85">
                {quizQuestions[currentQuestion].question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {quizQuestions[currentQuestion].options.map((opt, i) => {
                const isSelected = selectedAnswer === i
                const isCorrect = i === quizQuestions[currentQuestion].correctIndex
                const showResult = selectedAnswer !== null

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-cormorant ${
                      showResult
                        ? isCorrect
                          ? 'border-green-400/60 bg-green-400/15 text-green-300'
                          : isSelected
                          ? 'border-red-400/60 bg-red-400/15 text-red-300'
                          : 'border-white/5 text-white/30'
                        : isSelected
                        ? 'border-saffron/60 bg-saffron/15 text-saffron'
                        : 'border-white/10 text-white/60 hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-cinzel text-xs mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/5 rounded-xl p-3 mb-4 overflow-hidden"
                >
                  <div className="text-xs font-cinzel text-celestial mb-1">Explanation</div>
                  <p className="text-sm text-white/60 font-cormorant">
                    {quizQuestions[currentQuestion].explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full py-3 rounded-xl bg-saffron/20 border border-saffron/30 text-saffron font-cinzel disabled:opacity-30 hover:bg-saffron/30 transition-all flex items-center justify-center gap-2"
            >
              {currentQuestion < quizQuestions.length - 1 ? (
                <>Next Question <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>See Results <Award className="w-4 h-4" /></>
              )}
            </button>
          </motion.div>
        )}

        {quizComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-5xl mb-3">
              {answersCorrect.filter(Boolean).length >= 4 ? '🏆' : answersCorrect.filter(Boolean).length >= 2 ? '⭐' : '📚'}
            </div>
            <h3 className="text-xl font-cinzel text-gold-gradient mb-2">Quiz Complete!</h3>
            <div className="text-3xl font-cinzel text-champagne mb-1">
              {answersCorrect.filter(Boolean).length}/{quizQuestions.length}
            </div>
            <div className="text-sm text-white/50 font-cormorant mb-4">correct answers</div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold mb-5">
              <Star className="w-4 h-4" />
              <span className="font-cinzel">+{totalQuizXP} XP Earned!</span>
            </div>
            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/70 hover:border-white/20 transition-all text-sm font-cinzel"
            >
              <RotateCcw className="w-4 h-4" /> Try Again Tomorrow
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Ask a Question About Scriptures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-celestial" />
          <h2 className="text-lg font-cinzel text-champagne">Ask About Scriptures</h2>
        </div>
        <p className="text-xs text-white/40 font-cormorant mb-4">
          Ask any question about the Bhagavad Gita, Upanishads, Vedas, or Yoga philosophy.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={askQuestion}
            onChange={e => setAskQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
            placeholder="e.g., What is the meaning of dharma?"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-cormorant placeholder:text-white/25 focus:outline-none focus:border-celestial/40"
          />
          <button
            onClick={handleAskQuestion}
            disabled={askLoading || askQuestion.trim().length < 3}
            className="px-4 py-2.5 rounded-xl bg-celestial/20 border border-celestial/30 text-celestial hover:bg-celestial/30 transition-all disabled:opacity-30"
          >
            {askLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {askAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-celestial/5 border border-celestial/15 mb-3">
                <div className="text-xs text-celestial/60 font-cinzel uppercase tracking-wider mb-2">Answer</div>
                <p className="text-sm text-white/70 font-cormorant leading-relaxed whitespace-pre-wrap">
                  {askAnswer.content}
                </p>
              </div>
              {askRelatedShloka && (
                <div className="p-3 rounded-xl bg-saffron/5 border border-saffron/15">
                  <div className="text-xs text-saffron/60 font-cinzel uppercase tracking-wider mb-1">Related Shloka</div>
                  {askRelatedShloka.source && (
                    <div className="text-xs text-white/40 font-cormorant mb-1">{askRelatedShloka.source}</div>
                  )}
                  {askRelatedShloka.sanskrit && (
                    <p className="text-sm font-devanagari text-champagne/80 mb-1">{askRelatedShloka.sanskrit}</p>
                  )}
                  {askRelatedShloka.translation && (
                    <p className="text-xs text-white/50 font-cormorant italic">{askRelatedShloka.translation}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Browse All Shlokas from Backend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-saffron" />
            <h2 className="text-lg font-cinzel text-champagne">Browse All Shlokas</h2>
          </div>
          {!shlokasLoaded && (
            <button
              onClick={fetchAllShlokas}
              disabled={shlokasLoading}
              className="px-4 py-2 rounded-xl bg-saffron/20 border border-saffron/30 text-saffron text-xs font-cinzel hover:bg-saffron/30 transition-all disabled:opacity-50"
            >
              {shlokasLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
              ) : (
                'Load from Server'
              )}
            </button>
          )}
        </div>

        {shlokasLoaded && (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={shlokaSearch}
                onChange={e => setShlokaSearch(e.target.value)}
                placeholder="Search shlokas by source, text, or translation..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-cormorant placeholder:text-white/25 focus:outline-none focus:border-saffron/40"
              />
            </div>
            <div className="text-xs text-white/30 font-cormorant mb-3">
              {filteredShlokas.length} shloka{filteredShlokas.length !== 1 ? 's' : ''} found
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredShlokas.map((shloka: any, i: number) => (
                <div
                  key={shloka.id || i}
                  className="p-4 rounded-xl border border-white/5 hover:border-saffron/20 transition-all bg-white/[0.02]"
                >
                  {shloka.source && (
                    <div className="text-xs text-saffron font-cinzel mb-2">{shloka.source}</div>
                  )}
                  {shloka.sanskrit && (
                    <p className="text-base font-devanagari text-champagne/90 leading-relaxed mb-2">{shloka.sanskrit}</p>
                  )}
                  {shloka.transliteration && (
                    <p className="text-xs text-white/40 italic font-cormorant mb-2">{shloka.transliteration}</p>
                  )}
                  {shloka.translation && (
                    <p className="text-sm text-white/60 font-cormorant leading-relaxed">{shloka.translation}</p>
                  )}
                  {shloka.commentary && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-xs text-white/40 font-cormorant leading-relaxed">{shloka.commentary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {!shlokasLoaded && !shlokasLoading && (
          <p className="text-center text-white/30 text-sm font-cormorant py-6">
            Click "Load from Server" to browse the complete shloka collection from the backend.
          </p>
        )}
      </motion.div>
    </div>
  )
}
