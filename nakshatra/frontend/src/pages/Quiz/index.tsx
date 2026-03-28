import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { CATEGORY_INFO, type QuizCategory, type QuizQuestion } from '@/lib/quiz-data'
import {
  generateQuiz, generateDailyChallenge, calculateScore, saveQuizResult,
  isDailyChallengeCompleted, getQuizStats, type QuizResult
} from '@/lib/quiz-engine'
import { ArrowLeft, Trophy, Zap, Clock, Star, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

type Screen = 'home' | 'playing' | 'results'

export default function QuizPage() {
  const { t } = useTranslation()
  const { addXP } = useStore()
  const [screen, setScreen] = useState<Screen>('home')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isDaily, setIsDaily] = useState(false)
  const [quizCategory, setQuizCategory] = useState<QuizCategory | undefined>()
  const startTimeRef = useRef(Date.now())

  const stats = useMemo(() => getQuizStats(), [screen])
  const dailyDone = useMemo(() => isDailyChallengeCompleted(), [screen])

  const startQuiz = useCallback((qs: QuizQuestion[], daily: boolean, category?: QuizCategory) => {
    setQuestions(qs)
    setCurrentIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowExplanation(false)
    setResult(null)
    setIsDaily(daily)
    setQuizCategory(category)
    startTimeRef.current = Date.now()
    setScreen('playing')
  }, [])

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    setAnswers(prev => [...prev, { questionId: questions[currentIndex].id, selectedIndex: idx }])
    setShowExplanation(true)

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const allAnswers = [...answers, { questionId: questions[currentIndex].id, selectedIndex: idx }]
        const res = calculateScore(allAnswers, questions, elapsed)
        setResult(res)
        saveQuizResult(res, quizCategory, isDaily)
        addXP(res.xpEarned, 'quiz_completed')
        setScreen('results')
      }
    }, 1800)
  }, [selectedAnswer, currentIndex, questions, answers, quizCategory, isDaily, addXP])

  const currentQ = questions[currentIndex]

  // ─── Home Screen ──────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <h1 className="text-2xl font-cinzel text-white">Quiz Arena</h1>
        </div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl mb-6 border relative overflow-hidden ${
            dailyDone ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20'
          }`}
          style={dailyDone ? {} : { background: 'linear-gradient(135deg, rgba(255,179,71,0.1), rgba(168,85,247,0.1))' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-amber-400" />
            <span className="text-xs text-amber-400 uppercase tracking-wider font-medium">Daily Challenge</span>
          </div>
          <p className="text-white text-sm mb-3">5 mixed questions — test your Vedic knowledge daily!</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white/40 text-xs">
              <span className="flex items-center gap-1"><Trophy size={12} /> Streak: {stats.dailyChallengeStreak}</span>
            </div>
            {dailyDone ? (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle size={14} /> Completed
              </span>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => startQuiz(generateDailyChallenge(), true)}
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium"
              >
                Play Now
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Categories */}
        <h2 className="text-sm text-white/50 font-medium mb-3">Categories</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.entries(CATEGORY_INFO) as [QuizCategory, typeof CATEGORY_INFO[QuizCategory]][]).map(([key, info], i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startQuiz(generateQuiz(key, undefined, 10), false, key)}
              className="p-4 rounded-xl border border-white/10 hover:border-white/20 text-left"
              style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))` }}
            >
              <span className="text-2xl">{info.icon}</span>
              <p className="text-white font-medium text-sm mt-2">{info.label}</p>
              <p className="text-white/30 text-xs mt-1">
                Best: {stats.categoryBest[key] ? `${stats.categoryBest[key]}%` : '--'}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Quick Play */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => startQuiz(generateQuiz(undefined, undefined, 10), false)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 text-white font-medium text-sm mb-6"
        >
          Quick 10 — Random Mix
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-lg font-bold text-white">{stats.totalQuizzes}</p>
            <p className="text-[10px] text-white/40">Quizzes</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-lg font-bold text-amber-400">{stats.bestAccuracy}%</p>
            <p className="text-[10px] text-white/40">Best Score</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-lg font-bold text-purple-400">{stats.perfectScores}</p>
            <p className="text-[10px] text-white/40">Perfects</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Playing Screen ───────────────────────────────────────────────────────
  if (screen === 'playing' && currentQ) {
    const isCorrect = selectedAnswer === currentQ.correctIndex
    return (
      <div className="min-h-screen p-4 max-w-xl mx-auto flex flex-col">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <div className="flex-1">
            <div className="w-full h-2 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </div>
          </div>
          <span className="text-sm text-white/50 font-mono">{currentIndex + 1}/{questions.length}</span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                currentQ.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                currentQ.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentQ.difficulty} &middot; +{currentQ.xpReward} XP
              </span>
            </div>

            <h2 className="text-xl font-cinzel text-white mb-8 leading-relaxed">{currentQ.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                let bg = 'bg-white/5 border-white/10 hover:border-white/20'
                if (selectedAnswer !== null) {
                  if (idx === currentQ.correctIndex) bg = 'bg-green-500/10 border-green-500/40'
                  else if (idx === selectedAnswer && !isCorrect) bg = 'bg-red-500/10 border-red-500/40'
                  else bg = 'bg-white/5 border-white/5 opacity-50'
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
                    animate={selectedAnswer === idx && !isCorrect ? {
                      x: [0, -8, 8, -4, 4, 0],
                      transition: { duration: 0.4 }
                    } : {}}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/60 font-medium flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-white text-sm">{opt}</span>
                      {selectedAnswer !== null && idx === currentQ.correctIndex && (
                        <CheckCircle size={16} className="text-green-400 ml-auto flex-shrink-0" />
                      )}
                      {selectedAnswer === idx && !isCorrect && (
                        <XCircle size={16} className="text-red-400 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`p-3 rounded-xl border ${
                    isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
                      {isCorrect ? 'Correct! +' + currentQ.xpReward + ' XP' : 'Not quite!'}
                    </p>
                    <p className="text-white/60 text-sm">{currentQ.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* XP Float Animation */}
            <AnimatePresence>
              {selectedAnswer !== null && isCorrect && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -60 }}
                  transition={{ duration: 1 }}
                  className="fixed top-1/3 left-1/2 -translate-x-1/2 text-amber-400 font-bold text-xl pointer-events-none"
                >
                  +{currentQ.xpReward} XP
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ─── Results Screen ───────────────────────────────────────────────────────
  if (screen === 'results' && result) {
    return (
      <div className="min-h-screen p-4 max-w-md mx-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center"
        >
          {result.isPerfect && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-5xl mb-4"
            >
              &#127881;
            </motion.div>
          )}

          <h2 className="text-3xl font-cinzel text-white mb-2">
            {result.isPerfect ? 'Perfect!' : result.accuracy >= 80 ? 'Great Job!' : result.accuracy >= 50 ? 'Good Effort!' : 'Keep Learning!'}
          </h2>

          {/* Score Ring */}
          <div className="relative w-32 h-32 mx-auto my-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.accuracy >= 80 ? '#22c55e' : result.accuracy >= 50 ? '#eab308' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.accuracy / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{result.accuracy}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-green-400">{result.correct}/{result.total}</p>
              <p className="text-[10px] text-white/40">Correct</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-amber-400">+{result.xpEarned}</p>
              <p className="text-[10px] text-white/40">XP Earned</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-purple-400">{result.timeSeconds}s</p>
              <p className="text-[10px] text-white/40">Time</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 w-full">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const qs = quizCategory ? generateQuiz(quizCategory) : generateQuiz()
                startQuiz(qs, false, quizCategory)
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Play Again
            </motion.button>
            <button
              onClick={() => setScreen('home')}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm"
            >
              Back to Quiz Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
