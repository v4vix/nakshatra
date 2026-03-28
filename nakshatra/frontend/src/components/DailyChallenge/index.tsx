import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { Zap, Clock, Star, CheckCircle2, XCircle, ChevronRight, Trophy, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ─────────────────────────────────────────────────────────────────

interface ChallengeQuestion {
  q: string
  options: string[]
  answer: number
  explanation: string
}

interface DayChallenge {
  planet: string
  emoji: string
  theme: string
  questions: ChallengeQuestion[]
}

// ─── Weekly Challenge Data ─────────────────────────────────────────────────

const WEEKLY_CHALLENGES: Record<number, DayChallenge> = {
  0: {
    planet: 'Sun', emoji: '☀️', theme: 'Solar Wisdom',
    questions: [
      {
        q: 'Which rashi is the Sun exalted in?',
        options: ['Aries (Mesha)', 'Leo (Simha)', 'Libra (Tula)', 'Sagittarius (Dhanu)'],
        answer: 0,
        explanation: 'Sun is exalted in Aries (Mesha) at 10 degrees. In Libra (Tula) it is debilitated — the opposite sign of its exaltation.',
      },
      {
        q: 'What is the Sun called in Sanskrit?',
        options: ['Chandra', 'Surya', 'Budha', 'Mangal'],
        answer: 1,
        explanation: 'Surya is the Sanskrit name for the Sun, revered as the king of the solar system and the soul of the universe (Atmakaraka by default in some systems).',
      },
      {
        q: 'Which house is the Sun\'s natural (kāraka) house?',
        options: ['1st House', '5th House', '9th House', '10th House'],
        answer: 0,
        explanation: 'The 1st house (Lagna) is the natural significator house of the Sun as it represents the self, identity, and the physical body.',
      },
    ],
  },
  1: {
    planet: 'Moon', emoji: '🌙', theme: 'Lunar Mysteries',
    questions: [
      {
        q: 'In which nakshatra is the Moon considered especially exalted?',
        options: ['Rohini', 'Krittika', 'Ashwini', 'Bharani'],
        answer: 0,
        explanation: 'Moon is exalted in Taurus (Vrishabha) and is especially powerful in Rohini nakshatra — its own favourite abode. Rohini is ruled by the Moon itself.',
      },
      {
        q: 'What is the Moon called in Sanskrit?',
        options: ['Surya', 'Chandra', 'Shukra', 'Guru'],
        answer: 1,
        explanation: 'Chandra is the Sanskrit name for the Moon. It represents the mind (manas), emotions, mother, and the subconscious in Vedic astrology.',
      },
      {
        q: 'How many nakshatras does the Moon traverse in one sidereal month?',
        options: ['12', '27', '30', '24'],
        answer: 1,
        explanation: 'The Moon traverses all 27 nakshatras in approximately 27.3 days — one sidereal month. Each nakshatra occupies exactly 13° 20\' of the zodiac.',
      },
    ],
  },
  2: {
    planet: 'Mars', emoji: '♂️', theme: 'Martian Power',
    questions: [
      {
        q: 'Mars is exalted in which rashi?',
        options: ['Aries (Mesha)', 'Scorpio (Vrishchika)', 'Capricorn (Makara)', 'Cancer (Karka)'],
        answer: 2,
        explanation: 'Mars is exalted in Capricorn (Makara) at 28 degrees. It is debilitated in Cancer (Karka), the opposite sign.',
      },
      {
        q: 'What is Mangal Dosha (Kuja Dosha)?',
        options: ['Mars in the 7th house only', 'Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house', 'Mars conjunct Saturn', 'Mars in retrograde motion'],
        answer: 1,
        explanation: 'Mangal Dosha (Kuja Dosha) occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house of the birth chart. It is considered when assessing marriage compatibility.',
      },
      {
        q: 'Which day of the week is ruled by Mars?',
        options: ['Monday', 'Friday', 'Tuesday', 'Saturday'],
        answer: 2,
        explanation: 'Tuesday (Mangalavara in Sanskrit) is ruled by Mars (Mangal). The English name "Tuesday" comes from Tiw, the Norse deity equivalent to Mars.',
      },
    ],
  },
  3: {
    planet: 'Mercury', emoji: '☿', theme: 'Mercurial Intelligence',
    questions: [
      {
        q: 'Mercury (Budha) rules which two rashis?',
        options: ['Aries & Scorpio', 'Gemini & Virgo', 'Taurus & Libra', 'Cancer & Leo'],
        answer: 1,
        explanation: 'Mercury (Budha) rules Gemini (Mithuna) and Virgo (Kanya) — the signs of intellect, communication, and analytical precision.',
      },
      {
        q: 'What yoga is formed by the conjunction of Sun and Mercury?',
        options: ['Gaja Kesari Yoga', 'Budhaditya Yoga', 'Malavya Yoga', 'Hamsa Yoga'],
        answer: 1,
        explanation: 'Budhaditya Yoga is formed by the conjunction of Sun (Aditya) and Mercury (Budha). It grants intelligence, communication skills, and success in intellectual and business pursuits.',
      },
      {
        q: 'Mercury is the natural significator (kāraka) of?',
        options: ['Mother', 'Father', 'Intellect & Communication', 'Marriage & Spouse'],
        answer: 2,
        explanation: 'Mercury (Budha) is the natural karaka (significator) of intellect, speech, communication, commerce, mathematics, and younger siblings.',
      },
    ],
  },
  4: {
    planet: 'Jupiter', emoji: '♃', theme: 'Jupiterian Wisdom',
    questions: [
      {
        q: 'Jupiter is called Guru in Sanskrit. What does Guru literally mean?',
        options: ['The Heavy One', 'Dispeller of darkness / Teacher', 'The Strong One', 'The Wise One'],
        answer: 1,
        explanation: '"Guru" literally means "dispeller of darkness" — the teacher who removes the darkness of ignorance (gu = darkness, ru = remover) and leads seekers to the light of knowledge.',
      },
      {
        q: 'Gaja Kesari Yoga is formed when Jupiter occupies a kendra from which planet?',
        options: ['Sun', 'Ascendant (Lagna)', 'Moon', 'Saturn'],
        answer: 2,
        explanation: 'Gaja Kesari Yoga is formed when Jupiter occupies a kendra house (1st, 4th, 7th, or 10th) from the Moon. It bestows intelligence, fame, and material prosperity.',
      },
      {
        q: 'Which nakshatra is most auspicious for Jupiter\'s energy?',
        options: ['Vishakha', 'Purva Bhadrapada', 'Punarvasu', 'Bharani'],
        answer: 2,
        explanation: 'Punarvasu ("return of light" or "renewal of good") is ruled by Jupiter and is considered highly auspicious, bestowing renewal, abundance, and divine grace.',
      },
    ],
  },
  5: {
    planet: 'Venus', emoji: '♀', theme: 'Venusian Beauty',
    questions: [
      {
        q: 'Venus (Shukra) is the guru of which group in Hindu cosmology?',
        options: ['Devas (gods)', 'Asuras (demons/titans)', 'Humans', 'Nagas (serpents)'],
        answer: 1,
        explanation: 'Shukracharya is the preceptor (guru) of the Asuras. He is said to possess the secret of Mritasanjivani — the knowledge to restore the dead to life — giving Asuras an extraordinary advantage.',
      },
      {
        q: 'In which zodiac sign is Venus considered exalted?',
        options: ['Taurus (Vrishabha)', 'Libra (Tula)', 'Pisces (Meena)', 'Aries (Mesha)'],
        answer: 2,
        explanation: 'Venus is exalted in Pisces (Meena) and reaches its maximum exaltation at 27 degrees Pisces. It is debilitated in Virgo (Kanya).',
      },
      {
        q: 'Malavya Yoga is one of the Pancha Mahapurusha Yogas. It is formed by which planet?',
        options: ['Mars in kendra', 'Venus in its own/exaltation sign in kendra', 'Jupiter in kendra', 'Saturn in kendra'],
        answer: 1,
        explanation: 'Malavya Yoga is formed by Venus in its own sign (Taurus or Libra) or exaltation sign (Pisces) in a kendra house (1st, 4th, 7th, or 10th). It bestows beauty, luxury, and artistic gifts.',
      },
    ],
  },
  6: {
    planet: 'Saturn', emoji: '♄', theme: 'Saturnine Karma',
    questions: [
      {
        q: 'Saturn (Shani) is the natural karaka (significator) of?',
        options: ['Father', 'Mother', 'Karma, Discipline & Longevity', 'Spouse & Marriage'],
        answer: 2,
        explanation: 'Saturn (Shani) is the natural karaka of karma, discipline, hard work, longevity, service, the masses, and the lessons of past lives.',
      },
      {
        q: 'What is "Shani Sade Sati"?',
        options: ['Saturn in the 7th house from Lagna', 'Saturn\'s 7.5-year transit over the natal Moon sign', 'Saturn in retrograde for 7 months', 'Saturn Mahadasha of 19 years'],
        answer: 1,
        explanation: 'Sade Sati is the 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from the natal Moon sign — spending approximately 2.5 years in each sign. It is a period of transformation, challenges, and profound karmic lessons.',
      },
      {
        q: 'In which zodiac sign is Saturn exalted?',
        options: ['Capricorn (Makara)', 'Aquarius (Kumbha)', 'Libra (Tula)', 'Scorpio (Vrishchika)'],
        answer: 2,
        explanation: 'Saturn is exalted in Libra (Tula) and reaches its peak exaltation at 20 degrees Libra. It is debilitated in Aries (Mesha), the sign ruled by its natural enemy Mars.',
      },
    ],
  },
}

// ─── Score labels ──────────────────────────────────────────────────────────

const SCORE_LABELS = [
  { min: 0, max: 0,  emoji: '🔮', label: 'Keep Trying',   color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/20' },
  { min: 1, max: 1,  emoji: '⭐',  label: 'Rising Star',   color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25' },
  { min: 2, max: 2,  emoji: '✨',  label: 'Cosmic Learner', color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/25' },
  { min: 3, max: 3,  emoji: '🌟',  label: 'Perfect Score!', color: 'text-gold',       bg: 'bg-gold/10 border-gold/30' },
]

const XP_PER_CORRECT = 15
const BONUS_PERFECT = 20
const TIMER_SECONDS = 30

const PLANET_COLORS: Record<string, string> = {
  Sun: 'text-amber-400', Moon: 'text-indigo-300', Mars: 'text-red-400',
  Mercury: 'text-cyan-300', Jupiter: 'text-yellow-300', Venus: 'text-pink-300', Saturn: 'text-violet-400',
}

const PLANET_BORDER: Record<string, string> = {
  Sun: 'border-amber-400/30', Moon: 'border-indigo-300/30', Mars: 'border-red-400/30',
  Mercury: 'border-cyan-300/30', Jupiter: 'border-yellow-300/30', Venus: 'border-pink-300/30', Saturn: 'border-violet-400/30',
}

const PLANET_BG: Record<string, string> = {
  Sun: 'bg-amber-400/10', Moon: 'bg-indigo-300/10', Mars: 'bg-red-400/10',
  Mercury: 'bg-cyan-300/10', Jupiter: 'bg-yellow-300/10', Venus: 'bg-pink-300/10', Saturn: 'bg-violet-400/10',
}

// ─── Completion key helper ─────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date()
  return `daily-challenge-v2-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// ─── Timer Bar ─────────────────────────────────────────────────────────────

function TimerBar({
  seconds,
  total,
}: {
  seconds: number
  total: number
}) {
  const pct = (seconds / total) * 100
  const isUrgent = seconds <= 10

  return (
    <div className="flex items-center gap-2">
      <Clock size={12} className={isUrgent ? 'text-red-400 animate-pulse' : 'text-slate-500'} />
      <div className="flex-1 h-1.5 rounded-full bg-stardust/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-1000 ${
            isUrgent ? 'bg-red-400' : 'bg-gradient-to-r from-saffron to-gold'
          }`}
          style={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className={`text-xs font-cinzel tabular-nums w-4 ${isUrgent ? 'text-red-400' : 'text-slate-500'}`}>
        {seconds}
      </span>
    </div>
  )
}

// ─── Question View ─────────────────────────────────────────────────────────

function QuestionView({
  question,
  qIndex,
  total,
  onAnswer,
}: {
  question: ChallengeQuestion
  qIndex: number
  total: number
  onAnswer: (idx: number) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
    setTimeLeft(TIMER_SECONDS)
  }, [qIndex])

  // Timer countdown
  useEffect(() => {
    if (revealed) return
    if (timeLeft <= 0) {
      // Time's up — treat as wrong
      setRevealed(true)
      setTimeout(() => onAnswer(-1), 1800)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, revealed, onAnswer])

  function handleSelect(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    setTimeout(() => onAnswer(idx), 1600)
  }

  const isCorrect = selected === question.answer
  const timedOut = selected === null && revealed

  return (
    <div className="space-y-4">
      {/* Progress + timer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-cinzel text-slate-500 uppercase tracking-wider">
            Question {qIndex + 1} of {total}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < qIndex ? 'bg-gold' : i === qIndex ? 'bg-gold/60 animate-pulse' : 'bg-stardust'
                }`}
              />
            ))}
          </div>
        </div>
        {!revealed && <TimerBar seconds={timeLeft} total={TIMER_SECONDS} />}
      </div>

      {/* Question text */}
      <p className="font-cormorant text-slate-200 text-lg leading-relaxed">{question.q}</p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2">
        {question.options.map((opt, idx) => {
          const isCorrectOpt = idx === question.answer
          const isSelectedOpt = idx === selected

          let cls = 'border border-stardust/60 bg-stardust/30 text-slate-300 hover:border-gold/40 hover:bg-gold/5 cursor-pointer'
          if (revealed) {
            if (isCorrectOpt) cls = 'border border-green-400/60 bg-green-400/10 text-green-300'
            else if (isSelectedOpt && !isCorrectOpt) cls = 'border border-red-400/60 bg-red-400/10 text-red-300'
            else cls = 'border border-stardust/30 bg-stardust/10 text-slate-500'
          }

          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              whileHover={!revealed ? { scale: 1.01 } : {}}
              whileTap={!revealed ? { scale: 0.99 } : {}}
              className={`rounded-xl px-4 py-3 text-sm font-cormorant text-left transition-all duration-200 ${cls} flex items-center gap-3`}
            >
              <span className="font-cinzel text-xs opacity-50 flex-shrink-0">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span>{opt}</span>
              {revealed && isCorrectOpt && (
                <CheckCircle2 size={14} className="text-green-400 ml-auto flex-shrink-0" />
              )}
              {revealed && isSelectedOpt && !isCorrectOpt && (
                <XCircle size={14} className="text-red-400 ml-auto flex-shrink-0" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl text-sm font-cormorant leading-relaxed ${
              timedOut
                ? 'bg-slate-500/10 border border-slate-500/25 text-slate-400'
                : isCorrect
                ? 'bg-green-500/10 border border-green-500/25 text-green-300'
                : 'bg-amber-500/10 border border-amber-500/25 text-amber-300'
            }`}
          >
            {timedOut
              ? `⏱ Time's up! ${question.explanation}`
              : isCorrect
              ? `✓ Correct! +${XP_PER_CORRECT} XP · ${question.explanation}`
              : `The answer is "${question.options[question.answer]}" · ${question.explanation}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Results View ──────────────────────────────────────────────────────────

function ResultsView({
  score,
  total,
  planet,
  xpEarned,
  onDismiss,
}: {
  score: number
  total: number
  planet: string
  xpEarned: number
  onDismiss: () => void
}) {
  const label = SCORE_LABELS.find((l) => score >= l.min && score <= l.max) ?? SCORE_LABELS[0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center space-y-4 py-2"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1, repeat: 2, ease: 'easeInOut' }}
        className="text-5xl"
      >
        {label.emoji}
      </motion.div>

      <div>
        <div className={`font-cinzel text-xl font-bold ${label.color}`}>{label.label}</div>
        <p className="font-cormorant text-slate-400 text-sm mt-1">
          You answered <span className="text-white font-semibold">{score}/{total}</span> questions correctly
        </p>
      </div>

      {/* XP earned */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${label.bg} border`}>
        <Zap size={13} className="text-gold" />
        <span className="font-cinzel text-sm text-gold font-bold">+{xpEarned} XP earned</span>
        {score === total && (
          <span className="text-[9px] font-cinzel text-gold/60 bg-gold/10 px-1.5 py-0.5 rounded-full">
            +{BONUS_PERFECT} Bonus!
          </span>
        )}
      </div>

      {/* Score breakdown */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-cinzel ${
              i < score
                ? 'bg-gold/20 border border-gold/50 text-gold'
                : 'bg-stardust/40 border border-stardust/60 text-slate-600'
            }`}
          >
            {i < score ? '✓' : '✗'}
          </div>
        ))}
      </div>

      <p className="font-cormorant text-slate-500 text-sm">
        Come back tomorrow for the <span className="text-gold">{planet}</span> wisdom challenge!
      </p>

      <button
        onClick={onDismiss}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-stardust/40 border border-stardust/60 text-sm font-cinzel text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Trophy size={13} />
        Done
      </button>
    </motion.div>
  )
}

// ─── Already Completed View ────────────────────────────────────────────────

function CompletedToday({ planet, theme }: { planet: string; theme: string }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowDay = tomorrow.getDay()
  const nextChallenge = WEEKLY_CHALLENGES[tomorrowDay]

  return (
    <div className="text-center py-4 space-y-3">
      <div className="text-4xl">✅</div>
      <div className="font-cinzel text-sm text-green-400">Today's Challenge Complete!</div>
      <p className="font-cormorant text-slate-500 text-sm">
        You've completed the <span className="text-gold">{theme}</span> challenge for today.
      </p>
      <div className="bg-stardust/30 border border-stardust/60 rounded-xl p-3 text-left">
        <div className="text-[9px] font-cinzel text-slate-500 uppercase tracking-wider mb-1">Tomorrow</div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{nextChallenge.emoji}</span>
          <div>
            <div className="font-cinzel text-xs text-slate-300">{nextChallenge.theme}</div>
            <div className="text-[9px] font-cinzel text-slate-600">{nextChallenge.planet} Day Challenge</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-cinzel text-slate-600">
        <RefreshCw size={10} />
        <span>Refreshes at midnight</span>
      </div>
    </div>
  )
}

// ─── Main DailyChallenge Component ────────────────────────────────────────

export default function DailyChallenge() {
  const { user, addXP, updateUser } = useStore()
  const today = useMemo(() => new Date(), [])
  const dayOfWeek = today.getDay()
  const challenge = WEEKLY_CHALLENGES[dayOfWeek]

  const completionKey = useMemo(() => todayKey(), [])
  const alreadyCompleted = useMemo(
    () => user?.completedChallenges?.includes(completionKey) ?? false,
    [user, completionKey]
  )

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'results' | 'done'>(
    alreadyCompleted ? 'done' : 'intro'
  )
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [xpEarned, setXpEarned] = useState(0)

  const planetColor = PLANET_COLORS[challenge.planet] ?? 'text-gold'
  const planetBorder = PLANET_BORDER[challenge.planet] ?? 'border-gold/30'
  const planetBg = PLANET_BG[challenge.planet] ?? 'bg-gold/10'

  const handleStart = useCallback(() => {
    setPhase('quiz')
    setCurrentQ(0)
    setAnswers([])
    setXpEarned(0)
  }, [])

  const handleAnswer = useCallback(
    (answerIdx: number) => {
      const question = challenge.questions[currentQ]
      const correct = answerIdx === question.answer
      const earned = correct ? XP_PER_CORRECT : 0

      const newAnswers = [...answers, answerIdx]
      setAnswers(newAnswers)
      setXpEarned((prev) => prev + earned)

      if (currentQ + 1 < challenge.questions.length) {
        setTimeout(() => setCurrentQ((q) => q + 1), 300)
      } else {
        // All questions answered
        const totalScore = newAnswers.filter((a, i) => a === challenge.questions[i].answer).length
        const isAllCorrect = totalScore === challenge.questions.length
        const totalXP = totalScore * XP_PER_CORRECT + (isAllCorrect ? BONUS_PERFECT : 0)

        // Add XP and mark completion
        if (totalXP > 0) {
          addXP(totalXP, 'DAILY_CHALLENGE_V2')
        }
        updateUser({
          completedChallenges: [
            ...(user?.completedChallenges ?? []).filter((k) => !k.startsWith('daily-challenge-v2')),
            completionKey,
          ],
        })

        setXpEarned(totalXP)

        if (isAllCorrect) {
          toast.success(`🌟 Perfect Score! +${totalXP} XP`, {
            style: {
              background: '#0D2137',
              color: '#FFB347',
              border: '1px solid rgba(255,179,71,0.4)',
              fontFamily: 'Cinzel, serif',
            },
          })
        }

        setTimeout(() => setPhase('results'), 400)
      }
    },
    [challenge, currentQ, answers, addXP, updateUser, user, completionKey]
  )

  const handleDone = useCallback(() => setPhase('done'), [])

  const score = useMemo(
    () => answers.filter((a, i) => challenge.questions[i] && a === challenge.questions[i].answer).length,
    [answers, challenge]
  )

  const totalQuestions = challenge.questions.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card overflow-hidden border ${planetBorder}`}
    >
      {/* Header */}
      <div className={`px-5 pt-5 pb-4 border-b border-stardust/40 ${planetBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{challenge.emoji}</div>
            <div>
              <div className="text-[9px] font-cinzel text-slate-500 uppercase tracking-widest">
                Daily Challenge
              </div>
              <div className={`font-cinzel font-bold text-base ${planetColor}`}>
                {challenge.theme}
              </div>
              <div className="text-[9px] font-cinzel text-slate-500 mt-0.5">
                {challenge.planet} Day · {totalQuestions} Questions
              </div>
            </div>
          </div>

          {phase === 'intro' && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-[9px] font-cinzel text-gold/60">
                <Zap size={9} className="text-gold" />
                <span>Up to +{totalQuestions * XP_PER_CORRECT + BONUS_PERFECT} XP</span>
              </div>
              <div className="text-[9px] font-cinzel text-slate-600 mt-0.5">
                {XP_PER_CORRECT} per correct · {BONUS_PERFECT} bonus
              </div>
            </div>
          )}

          {phase === 'quiz' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-stardust/40 border border-stardust/60">
              <Star size={10} className="text-gold" />
              <span className="text-[9px] font-cinzel text-slate-400">{currentQ + 1}/{totalQuestions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="font-cormorant text-slate-300 text-base leading-relaxed">
                Today's challenge explores the mysteries of{' '}
                <span className={`font-semibold ${planetColor}`}>{challenge.planet}</span> —
                the cosmic ruler of {today.toLocaleDateString('en-IN', { weekday: 'long' })}.
                Answer {totalQuestions} questions correctly to earn XP and deepen your Vedic wisdom.
              </p>

              {/* Question preview dots */}
              <div className="flex items-center gap-2">
                {challenge.questions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${planetBg} border ${planetBorder}`} />
                ))}
                <span className="text-[9px] font-cinzel text-slate-600 ml-1">
                  {TIMER_SECONDS}s per question
                </span>
              </div>

              <button
                onClick={handleStart}
                className={`w-full py-3 rounded-xl font-cinzel font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-saffron to-gold text-cosmos hover:opacity-90`}
              >
                <span>{challenge.emoji}</span>
                <span>Start {challenge.theme}</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <QuestionView
                question={challenge.questions[currentQ]}
                qIndex={currentQ}
                total={totalQuestions}
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}

          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultsView
                score={score}
                total={totalQuestions}
                planet={WEEKLY_CHALLENGES[(dayOfWeek + 1) % 7].planet}
                xpEarned={xpEarned}
                onDismiss={handleDone}
              />
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CompletedToday planet={challenge.planet} theme={challenge.theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
