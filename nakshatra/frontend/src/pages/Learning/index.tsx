import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { ArrowLeft, BookOpen, CheckCircle, Lock, ChevronRight, Award, X } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Course Data ────────────────────────────────────────────────────────────

interface Lesson {
  id: string
  title: string
  content: string[]
  keyPoints: string[]
  xpReward: number
}

interface Course {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
  lessons: Lesson[]
  isPremium: boolean
}

const COURSES: Course[] = [
  {
    id: 'vedic-101',
    title: 'Vedic Astrology 101',
    description: 'Master the fundamentals of Jyotish Shastra from scratch.',
    icon: '\u{1F4D6}',
    gradient: 'from-blue-500 to-cyan-500',
    isPremium: false,
    lessons: [
      { id: 'v1', title: 'What is Jyotish?', content: ['Jyotish (Science of Light) is one of the six Vedangas — limbs of the Vedas.', 'Unlike Western astrology that uses the tropical zodiac, Vedic astrology uses the sidereal zodiac, accounting for the precession of equinoxes.', 'The difference between the two systems is called the Ayanamsa, currently about 24 degrees.'], keyPoints: ['Jyotish = Science of Light', 'Uses sidereal (star-based) zodiac', 'Ayanamsa corrects for precession'], xpReward: 20 },
      { id: 'v2', title: 'The 12 Rashis (Signs)', content: ['The zodiac is divided into 12 Rashis of 30 degrees each, starting with Mesha (Aries).', 'Each Rashi has a ruling planet (Lord), an element (Fire/Earth/Air/Water), and a quality (Cardinal/Fixed/Mutable).', 'The Rashis are: Mesha, Vrishabha, Mithuna, Karka, Simha, Kanya, Tula, Vrischika, Dhanu, Makara, Kumbha, Meena.'], keyPoints: ['12 signs of 30\u00B0 each', 'Each has a Lord, element, and quality', 'Starts with Mesha (Aries)'], xpReward: 20 },
      { id: 'v3', title: 'The 9 Grahas (Planets)', content: ['Vedic astrology uses 9 Grahas (seizers): Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.', 'Rahu and Ketu are shadow planets (Chaya Grahas) — the north and south lunar nodes.', 'Each Graha rules specific aspects of life and has natural benefic or malefic tendencies.'], keyPoints: ['9 Grahas including Rahu & Ketu', 'Shadow planets = lunar nodes', 'Benefics vs Malefics'], xpReward: 20 },
      { id: 'v4', title: 'The 12 Bhavas (Houses)', content: ['The chart is divided into 12 Bhavas (houses), each governing specific life areas.', 'The 1st house (Lagna) is the most important — it represents the self and is determined by the rising sign.', 'Key houses: 1st (Self), 4th (Home), 7th (Marriage), 10th (Career). These are Kendra (angular) houses.'], keyPoints: ['12 houses govern life areas', 'Lagna (Ascendant) = 1st house', 'Kendra houses: 1, 4, 7, 10'], xpReward: 25 },
      { id: 'v5', title: 'The 27 Nakshatras', content: ['Nakshatras are 27 lunar mansions of 13\u00B020\' each, providing deeper personality insights than Rashis alone.', 'Each Nakshatra has a ruling planet (Vimshottari Dasha lord), a deity, an animal symbol, and a temperament (Gana).', 'Your birth Nakshatra (Janma Nakshatra) is determined by the Moon\'s position and is crucial for Dasha calculations.'], keyPoints: ['27 lunar mansions', 'Each has lord, deity, animal', 'Janma Nakshatra = Moon\'s nakshatra'], xpReward: 25 },
    ],
  },
  {
    id: 'yogas',
    title: 'Planetary Yogas',
    description: 'Learn the powerful combinations that shape destiny.',
    icon: '\u{1F52E}',
    gradient: 'from-purple-500 to-pink-500',
    isPremium: false,
    lessons: [
      { id: 'y1', title: 'What are Yogas?', content: ['Yogas are specific planetary combinations in a birth chart that produce distinct results.', 'They can be auspicious (Shubha) or inauspicious (Ashubha).', 'Major yogas include Raja Yoga (power), Dhana Yoga (wealth), and various named combinations.'], keyPoints: ['Planetary combinations', 'Can be positive or negative', 'Raja Yoga = power/status'], xpReward: 25 },
      { id: 'y2', title: 'Gajakesari Yoga', content: ['Formed when Jupiter is in a Kendra (1st, 4th, 7th, or 10th) from the Moon.', 'Gaja = elephant, Kesari = lion. This yoga gives the person the combined strength of both.', 'Results: Fame, wealth, wisdom, good reputation, and leadership abilities.'], keyPoints: ['Jupiter in Kendra from Moon', 'Gives fame and wisdom', 'Very common and powerful'], xpReward: 25 },
      { id: 'y3', title: 'Mangal Dosha', content: ['Mars in houses 1, 2, 4, 7, 8, or 12 from Lagna, Moon, or Venus creates Mangal Dosha.', 'It primarily affects marriage and relationships, causing delays or conflicts.', 'Remedies include specific pujas, wearing Red Coral, and Kuja Dosha cancellation rules.'], keyPoints: ['Mars in 1/2/4/7/8/12', 'Affects marriage', 'Many cancellation conditions exist'], xpReward: 30 },
      { id: 'y4', title: 'Raja Yoga', content: ['Raja Yoga forms when lords of Kendra (1,4,7,10) and Trikona (1,5,9) houses conjoin or aspect each other.', 'It grants power, authority, fame, and success in public life.', 'The strength of Raja Yoga depends on the planets involved, their dignity, and the houses they rule.'], keyPoints: ['Kendra lord + Trikona lord', 'Grants power and authority', 'Strength varies by dignity'], xpReward: 30 },
    ],
  },
  {
    id: 'dashas',
    title: 'Dasha Systems',
    description: 'Understand the timing of events through planetary periods.',
    icon: '\u23F3',
    gradient: 'from-amber-500 to-orange-500',
    isPremium: true,
    lessons: [
      { id: 'd1', title: 'Vimshottari Dasha Basics', content: ['The Vimshottari system divides 120 years among 9 planets based on the birth Nakshatra.', 'The sequence follows Ketu-Venus-Sun-Moon-Mars-Rahu-Jupiter-Saturn-Mercury.', 'Each Maha Dasha is subdivided into Antardashas (sub-periods) of all 9 planets.'], keyPoints: ['120-year cycle', '9 planet sequence', 'Sub-periods within each dasha'], xpReward: 35 },
      { id: 'd2', title: 'Interpreting Dashas', content: ['The Maha Dasha planet colors all experiences during its period.', 'Results depend on the planet\'s dignity (exalted, debilitated), house placement, and aspects.', 'Antardasha planet modifies the main theme — a Jupiter-Saturn period differs greatly from Jupiter-Venus.'], keyPoints: ['Dasha lord sets the theme', 'Dignity and placement matter', 'Antardasha modifies results'], xpReward: 35 },
    ],
  },
  {
    id: 'remedies-course',
    title: 'Vedic Remedies Deep Dive',
    description: 'Advanced practices to strengthen planets and reduce doshas.',
    icon: '\u{1F48E}',
    gradient: 'from-emerald-500 to-teal-500',
    isPremium: true,
    lessons: [
      { id: 'r1', title: 'Mantra Science', content: ['Mantras work through sound vibration (Shabda Brahman) that resonates with planetary energies.', 'Each planet has a beej (seed) mantra and a Vedic mantra of different potency.', 'The number 108 is sacred: 12 zodiac signs \u00D7 9 planets. Japa mala has 108 beads for this reason.'], keyPoints: ['Sound vibration heals', 'Beej mantras are most potent', '108 = 12 signs \u00D7 9 planets'], xpReward: 30 },
      { id: 'r2', title: 'Gemstone Therapy', content: ['Gemstones amplify planetary rays. The gem must be natural, flawless, and of minimum prescribed weight.', 'CRITICAL: Always consult a qualified astrologer before wearing a gemstone, especially Blue Sapphire (Neelam).', 'Gems are set in specific metals and worn on specific fingers after energizing during appropriate muhurtas.'], keyPoints: ['Must be natural & flawless', 'Blue Sapphire needs caution', 'Finger and metal matter'], xpReward: 30 },
    ],
  },
]

const PROGRESS_KEY = 'nakshatra-learning-progress'

function getProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { return {} }
}
function markComplete(lessonId: string) {
  const p = getProgress()
  p[lessonId] = true
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  return p
}

// ─── Lesson Modal ───────────────────────────────────────────────────────────

function LessonModal({ lesson, onComplete, onClose }: {
  lesson: Lesson; onComplete: () => void; onClose: () => void
}) {
  const completed = getProgress()[lesson.id]

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
        className="w-full max-w-md mx-4 mb-4 rounded-2xl border border-white/10 overflow-hidden max-h-[80vh] overflow-y-auto"
        style={{ background: 'rgba(15,23,42,0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-cinzel text-white">{lesson.title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {lesson.content.map((para, i) => (
              <p key={i} className="text-white/70 text-sm leading-relaxed">{para}</p>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <p className="text-amber-400 text-xs uppercase tracking-wider font-medium mb-2">Key Points</p>
            {lesson.keyPoints.map((kp, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/60 mb-1">
                <span className="text-amber-400 mt-0.5">\u2022</span>
                <span>{kp}</span>
              </div>
            ))}
          </div>

          {!completed ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Complete Lesson (+{lesson.xpReward} XP)
            </motion.button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-center text-sm flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Lesson Completed
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function LearningPage() {
  const { t } = useTranslation()
  const { addXP } = useStore()
  const [progress, setProgress] = useState(getProgress)
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; courseId: string } | null>(null)

  const handleComplete = () => {
    if (!activeLesson) return
    const updated = markComplete(activeLesson.lesson.id)
    setProgress({ ...updated })
    addXP(activeLesson.lesson.xpReward, 'lesson_completed')
    setActiveLesson(null)
  }

  const getCourseProgress = (course: Course) => {
    const completed = course.lessons.filter(l => progress[l.id]).length
    return { completed, total: course.lessons.length, pct: Math.round((completed / course.lessons.length) * 100) }
  }

  const totalLessons = COURSES.reduce((sum, c) => sum + c.lessons.length, 0)
  const completedLessons = Object.keys(progress).length

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-cinzel text-white">Learning Paths</h1>
          <p className="text-sm text-white/40">Structured Vedic astrology courses</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-sm">Overall Progress</span>
          <span className="text-amber-400 text-sm font-medium">{completedLessons}/{totalLessons} lessons</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-4">
        {COURSES.map((course, ci) => {
          const p = getCourseProgress(course)
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.1 }}
              className="rounded-2xl border border-white/10 overflow-hidden"
            >
              {/* Course Header */}
              <div className={`p-4 bg-gradient-to-r ${course.gradient}/10`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{course.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-cinzel font-bold">{course.title}</h3>
                        {course.isPremium && <Lock size={12} className="text-purple-400" />}
                      </div>
                      <p className="text-white/40 text-xs">{course.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white/40" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="text-white/40 text-xs">{p.pct}%</span>
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-white/5">
                {course.lessons.map((lesson, li) => {
                  const done = progress[lesson.id]
                  const locked = course.isPremium

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !locked && setActiveLesson({ lesson, courseId: course.id })}
                      className={`w-full p-3 flex items-center gap-3 text-left transition-all ${
                        locked ? 'opacity-40' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                        done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                      }`}>
                        {done ? <CheckCircle size={14} /> : li + 1}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${done ? 'text-white/50' : 'text-white'}`}>{lesson.title}</span>
                        <span className="text-xs text-white/20 ml-2">+{lesson.xpReward} XP</span>
                      </div>
                      {locked ? <Lock size={14} className="text-purple-400/50" /> : <ChevronRight size={14} className="text-white/20" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            lesson={activeLesson.lesson}
            onComplete={handleComplete}
            onClose={() => setActiveLesson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
