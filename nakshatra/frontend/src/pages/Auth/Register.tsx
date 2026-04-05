import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, AtSign, UserPlus } from '@/lib/lucide-icons'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirm: '' })
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    const ok = await register({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      password: form.password,
    })

    if (ok) {
      toast.success('Account created!')
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-cosmos flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">✦</span>
          <h1 className="font-cinzel text-3xl text-gold-gradient font-bold">Nakshatra</h1>
          <p className="font-cormorant text-champagne/50 mt-1">Begin Your Cosmic Journey</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-dark rounded-2xl p-6 border border-gold/10 space-y-4">
          <h2 className="font-cinzel text-lg text-gold text-center">Create Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              <User size={10} className="inline mr-1" />Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => update('fullName', e.target.value)}
              required
              placeholder="Your full name"
              className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              <AtSign size={10} className="inline mr-1" />Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              minLength={3}
              placeholder="cosmic_seeker"
              className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              <Mail size={10} className="inline mr-1" />Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
                <Lock size={10} className="inline mr-1" />Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 chars"
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
                <Lock size={10} className="inline mr-1" />Confirm
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => update('confirm', e.target.value)}
                required
                placeholder="Repeat"
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl text-sm font-cinzel tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #FFB347 0%, #FF6B00 100%)',
              color: '#020B18',
              boxShadow: '0 4px 20px rgba(255, 179, 71, 0.3)',
            }}
          >
            <UserPlus size={16} />
            {isLoading ? 'Creating...' : 'Create Account'}
          </motion.button>

          <p className="text-center text-sm text-champagne/40 font-cormorant">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold/80 underline">Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
