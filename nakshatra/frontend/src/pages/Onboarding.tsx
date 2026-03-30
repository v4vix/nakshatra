import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useAuthStore } from '@/store/authStore'
import { generateId } from '@/utils/generateId'
import StarfieldCanvas from '@/components/layout/StarfieldCanvas'
import { ChevronRight, ChevronLeft, Sparkles, Star, Calendar, Clock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const AVATARS = ['🌟', '☀️', '🌙', '⭐', '🪐', '✨', '🔮', '🌺', '🦋', '🕉️', '🌸', '💫']

const STEPS = [
  { id: 'welcome', title: 'Welcome to Nakshatra', subtitle: 'Your cosmic journey begins' },
  { id: 'name', title: 'Who Are You?', subtitle: 'Tell us your name' },
  { id: 'birth', title: 'Your Cosmic Coordinates', subtitle: 'Birth details for your Kundli' },
  { id: 'avatar', title: 'Choose Your Sigil', subtitle: 'Pick your cosmic avatar' },
  { id: 'complete', title: 'The Stars Await', subtitle: 'Your journey begins now' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUser, user, addXP } = useStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    avatar: '🌟',
  })

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canProceed = () => {
    if (step === 1) return form.fullName.trim().length > 1 && form.username.trim().length > 2
    if (step === 2) return form.birthDate.length > 0
    return true
  }

  const handleComplete = async () => {
    const { updateProfile } = useAuthStore.getState()

    // Sync birth data and avatar to server
    try {
      await updateProfile({
        fullName: form.fullName,
        avatar: form.avatar,
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        birthPlace: form.birthPlace,
        onboardingComplete: true,
      })
    } catch {
      // Proceed even if server sync fails
    }

    const authUser = useAuthStore.getState().user
    const userId = authUser?.id || generateId()
    setUser({
      id: userId,
      username: authUser?.username || form.username || 'cosmic_seeker',
      email: authUser?.email || '',
      fullName: form.fullName,
      birthDate: form.birthDate,
      birthTime: form.birthTime,
      birthPlace: form.birthPlace,
      avatar: form.avatar,
      level: 1,
      xp: 100, // Welcome bonus
      xpToNextLevel: 212,
      rank: 'Stardust Seeker',
      streakDays: 1,
      longestStreak: 1,
      lastActivityDate: new Date().toDateString(),
      achievements: ['first_login'],
      completedChallenges: [],
      kundliIds: [],
      onboardingComplete: true,
      role: authUser?.role || 'user',
    })
    toast.success('Welcome bonus: +100 XP!', {
      icon: '🌟',
      duration: 4000,
    })
    navigate('/dashboard')
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />
      case 1:
        return (
          <NameStep
            fullName={form.fullName}
            username={form.username}
            onChange={updateForm}
          />
        )
      case 2:
        return (
          <BirthStep
            birthDate={form.birthDate}
            birthTime={form.birthTime}
            birthPlace={form.birthPlace}
            onChange={updateForm}
          />
        )
      case 3:
        return (
          <AvatarStep
            selected={form.avatar}
            onSelect={(a) => updateForm('avatar', a)}
          />
        )
      case 4:
        return <CompleteStep name={form.fullName} avatar={form.avatar} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-cosmos flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <StarfieldCanvas />

      {/* Cosmic background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-gold/5 animate-cosmic-ring" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-gold/8" style={{ animation: 'cosmic-ring-pulse 4s ease-in-out infinite' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-gold/10" style={{ animation: 'cosmic-ring-pulse 2s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-2 animate-float">✦</div>
          <h1 className="font-cinzel text-2xl text-gold-gradient font-bold">NAKSHATRA</h1>
          <p className="text-slate-400 text-sm font-cormorant">Vedic Wisdom Quest</p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-gold' : i < step ? 'w-4 bg-gold/40' : 'w-4 bg-stardust'
              }`}
            />
          ))}
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="font-cinzel text-xl text-champagne font-semibold mb-1">
              {STEPS[step].title}
            </h2>
            <p className="text-slate-400 text-sm font-cormorant mb-6">{STEPS[step].subtitle}</p>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-cinzel text-sm transition-all
              ${step === 0 ? 'opacity-0 pointer-events-none' : 'glass-card text-slate-400 hover:text-champagne'}`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => {
                if (!canProceed()) {
                  toast.error('Please fill in the required fields', { icon: '⚠️' })
                  return
                }
                setStep(step + 1)
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-cinzel text-sm font-semibold
                bg-gold-shimmer text-cosmos hover:shadow-gold-glow transition-all duration-300"
            >
              {step === 0 ? 'Begin Journey' : 'Continue'}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-cinzel text-sm font-semibold
                bg-gold-shimmer text-cosmos hover:shadow-gold-glow transition-all duration-300 animate-glow-pulse"
            >
              <Sparkles size={16} />
              Enter the Cosmos
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step Components ──────────────────────────────────────────────────────────

function WelcomeStep() {
  const features = [
    { icon: '⭐', title: 'Vedic Kundli', desc: 'Authentic birth chart with Swiss Ephemeris accuracy' },
    { icon: '🃏', title: 'Tarot Wisdom', desc: '78-card deck with Vedic-cosmic interpretations' },
    { icon: '🔢', title: 'Numerology', desc: 'Pythagorean & Chaldean number analysis' },
    { icon: '🧭', title: 'Vastu Shastra', desc: 'Ancient spatial harmony principles' },
    { icon: '📿', title: 'Sacred Texts', desc: 'Bhagavad Gita, Upanishads & more' },
    { icon: '🏆', title: 'Gamified Journey', desc: 'XP, levels, achievements & daily challenges' },
  ]

  return (
    <div>
      <p className="text-champagne/80 font-cormorant text-lg mb-6 leading-relaxed">
        Embark on a quest through ancient Vedic wisdom. Discover your cosmic blueprint,
        unlock mysteries of the stars, and earn wisdom as you journey deeper.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => (
          <div key={f.title} className="p-3 rounded-xl bg-stardust/40 border border-gold/10">
            <div className="text-xl mb-1">{f.icon}</div>
            <h3 className="font-cinzel text-xs text-gold mb-0.5">{f.title}</h3>
            <p className="text-xs text-slate-500 font-cormorant">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[11px] text-slate-500 font-cormorant leading-relaxed text-center">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-gold/70 underline underline-offset-2 hover:text-gold">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-gold/70 underline underline-offset-2 hover:text-gold">
          Privacy Policy
        </a>
        . Nakshatra is for entertainment and educational purposes only.
      </p>
    </div>
  )
}

function NameStep({
  fullName, username, onChange
}: { fullName: string; username: string; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-cinzel text-gold/70 mb-2 uppercase tracking-wider">
          Full Name *
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          placeholder="As it appears on your birth certificate"
          className="w-full px-4 py-3 rounded-xl bg-stardust/50 border border-gold/20 text-champagne
            placeholder-slate-600 focus:border-gold/60 focus:outline-none transition-colors
            font-cormorant text-lg"
        />
        <p className="text-xs text-slate-500 mt-1 font-cormorant">Used for numerology calculations</p>
      </div>
      <div>
        <label className="block text-xs font-cinzel text-gold/70 mb-2 uppercase tracking-wider">
          Username *
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => onChange('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
          placeholder="your_cosmic_handle"
          className="w-full px-4 py-3 rounded-xl bg-stardust/50 border border-gold/20 text-champagne
            placeholder-slate-600 focus:border-gold/60 focus:outline-none transition-colors
            font-cormorant text-lg"
        />
      </div>
    </div>
  )
}

function BirthStep({
  birthDate, birthTime, birthPlace, onChange
}: {
  birthDate: string; birthTime: string; birthPlace: string
  onChange: (k: string, v: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-slate-400 font-cormorant text-sm">
        Accurate birth details enable precise Kundli calculations using the Swiss Ephemeris.
      </p>
      <div>
        <label className="flex items-center gap-2 text-xs font-cinzel text-gold/70 mb-2 uppercase tracking-wider">
          <Calendar size={12} /> Birth Date *
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => onChange('birthDate', e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-stardust/50 border border-gold/20 text-champagne
            focus:border-gold/60 focus:outline-none transition-colors font-cormorant text-lg
            [color-scheme:dark]"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-xs font-cinzel text-gold/70 mb-2 uppercase tracking-wider">
          <Clock size={12} /> Birth Time <span className="text-slate-600 normal-case">(for Lagna)</span>
        </label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => onChange('birthTime', e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-stardust/50 border border-gold/20 text-champagne
            focus:border-gold/60 focus:outline-none transition-colors font-cormorant text-lg
            [color-scheme:dark]"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-xs font-cinzel text-gold/70 mb-2 uppercase tracking-wider">
          <MapPin size={12} /> Birth Place
        </label>
        <input
          type="text"
          value={birthPlace}
          onChange={(e) => onChange('birthPlace', e.target.value)}
          placeholder="City, Country"
          className="w-full px-4 py-3 rounded-xl bg-stardust/50 border border-gold/20 text-champagne
            placeholder-slate-600 focus:border-gold/60 focus:outline-none transition-colors
            font-cormorant text-lg"
        />
      </div>
    </div>
  )
}

function AvatarStep({ selected, onSelect }: { selected: string; onSelect: (a: string) => void }) {
  return (
    <div>
      <p className="text-slate-400 font-cormorant text-sm mb-4">
        Choose an avatar that resonates with your cosmic energy.
      </p>
      <div className="grid grid-cols-6 gap-3">
        {AVATARS.map((avatar) => (
          <button
            key={avatar}
            onClick={() => onSelect(avatar)}
            className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all
              ${selected === avatar
                ? 'bg-gold/20 border-2 border-gold shadow-gold-glow scale-110'
                : 'bg-stardust/50 border border-gold/10 hover:border-gold/30 hover:scale-105'
              }`}
          >
            {avatar}
          </button>
        ))}
      </div>
    </div>
  )
}

function CompleteStep({ name, avatar }: { name: string; avatar: string }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4 animate-float">{avatar}</div>
      <h3 className="font-cinzel text-2xl text-gold mb-2">
        Namaste, {name.split(' ')[0]}!
      </h3>
      <p className="text-champagne/70 font-cormorant text-lg mb-6 leading-relaxed">
        The cosmos has been waiting for your arrival. Your personalized journey
        through Vedic wisdom is about to begin. May the stars illuminate your path.
      </p>
      <div className="flex justify-center gap-6 text-center">
        <div className="p-3 rounded-xl bg-stardust/50 border border-gold/10">
          <Star className="text-gold mx-auto mb-1" size={20} />
          <p className="text-xs font-cinzel text-gold">+100 XP</p>
          <p className="text-xs text-slate-500">Welcome Bonus</p>
        </div>
        <div className="p-3 rounded-xl bg-stardust/50 border border-gold/10">
          <Sparkles className="text-saffron mx-auto mb-1" size={20} />
          <p className="text-xs font-cinzel text-saffron">Level 1</p>
          <p className="text-xs text-slate-500">Stardust Seeker</p>
        </div>
      </div>
    </div>
  )
}
