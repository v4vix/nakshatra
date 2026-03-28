// ============================================================
// Quiz Engine — shuffling, scoring, daily challenge, streaks
// ============================================================

import { QUIZ_QUESTIONS, type QuizCategory, type QuizDifficulty, type QuizQuestion } from './quiz-data'

export interface QuizResult {
  correct: number
  total: number
  xpEarned: number
  accuracy: number
  timeSeconds: number
  isPerfect: boolean
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Seeded random (for daily challenge consistency)
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateQuiz(
  category?: QuizCategory,
  difficulty?: QuizDifficulty,
  count: number = 10
): QuizQuestion[] {
  let pool = [...QUIZ_QUESTIONS]
  if (category) pool = pool.filter(q => q.category === category)
  if (difficulty) pool = pool.filter(q => q.difficulty === difficulty)
  return shuffle(pool).slice(0, count)
}

export function generateDailyChallenge(): QuizQuestion[] {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const rng = seededRandom(seed)

  // Pick 5 questions from mixed categories
  const sorted = [...QUIZ_QUESTIONS].sort((a, b) => rng() - 0.5)
  return sorted.slice(0, 5)
}

export function calculateScore(
  answers: { questionId: string; selectedIndex: number }[],
  questions: QuizQuestion[],
  timeSeconds: number
): QuizResult {
  let correct = 0
  let xpEarned = 0

  for (const answer of answers) {
    const q = questions.find(q => q.id === answer.questionId)
    if (q && answer.selectedIndex === q.correctIndex) {
      correct++
      xpEarned += q.xpReward
    }
  }

  // Time bonus: extra 20% XP if finished under 60 seconds
  if (timeSeconds < 60 && correct > 0) {
    xpEarned = Math.floor(xpEarned * 1.2)
  }

  return {
    correct,
    total: questions.length,
    xpEarned,
    accuracy: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    timeSeconds,
    isPerfect: correct === questions.length,
  }
}

// ─── Persistence (localStorage) ─────────────────────────────────────────────

const QUIZ_STORAGE_KEY = 'nakshatra-quiz-stats'

export interface QuizStats {
  totalQuizzes: number
  totalCorrect: number
  totalQuestions: number
  bestAccuracy: number
  dailyChallengeStreak: number
  lastDailyChallengeDate: string | null
  categoryBest: Record<string, number>
  perfectScores: number
}

function getDefaultStats(): QuizStats {
  return {
    totalQuizzes: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestAccuracy: 0,
    dailyChallengeStreak: 0,
    lastDailyChallengeDate: null,
    categoryBest: {},
    perfectScores: 0,
  }
}

export function getQuizStats(): QuizStats {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY)
    return raw ? { ...getDefaultStats(), ...JSON.parse(raw) } : getDefaultStats()
  } catch {
    return getDefaultStats()
  }
}

export function saveQuizResult(result: QuizResult, category?: QuizCategory, isDaily?: boolean): QuizStats {
  const stats = getQuizStats()

  stats.totalQuizzes++
  stats.totalCorrect += result.correct
  stats.totalQuestions += result.total
  if (result.accuracy > stats.bestAccuracy) stats.bestAccuracy = result.accuracy
  if (result.isPerfect) stats.perfectScores++

  if (category) {
    const prev = stats.categoryBest[category] || 0
    if (result.accuracy > prev) stats.categoryBest[category] = result.accuracy
  }

  if (isDaily) {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (stats.lastDailyChallengeDate === yesterday) {
      stats.dailyChallengeStreak++
    } else if (stats.lastDailyChallengeDate !== today) {
      stats.dailyChallengeStreak = 1
    }
    stats.lastDailyChallengeDate = today
  }

  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(stats))
  return stats
}

export function isDailyChallengeCompleted(): boolean {
  const stats = getQuizStats()
  return stats.lastDailyChallengeDate === new Date().toDateString()
}
