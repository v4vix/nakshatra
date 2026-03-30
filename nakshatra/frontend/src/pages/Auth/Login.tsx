import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    const ok = await login(email, password)
    if (ok) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  function fillDemo(tier: string) {
    const accounts: Record<string, { email: string; password: string }> = {
      free: { email: 'free@nakshatra.app', password: 'nakshatra123' },
      pro: { email: 'pro@nakshatra.app', password: 'nakshatra123' },
      guru: { email: 'guru@nakshatra.app', password: 'nakshatra123' },
      admin: { email: 'admin@nakshatra.app', password: 'nakshatra_admin' },
    }
    const acc = accounts[tier]
    if (acc) { setEmail(acc.email); setPassword(acc.password) }
  }

  return (
    <div className="min-h-screen bg-cosmos flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background stars */}
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
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">✦</span>
          <h1 className="font-cinzel text-3xl text-gold-gradient font-bold">Nakshatra</h1>
          <p className="font-cormorant text-champagne/50 mt-1">Vedic Wisdom Awaits</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="glass-card-dark rounded-2xl p-6 border border-gold/10 space-y-5">
          <h2 className="font-cinzel text-lg text-gold text-center">Sign In</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              <Mail size={10} className="inline mr-1" />Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              <Lock size={10} className="inline mr-1" />Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 pr-10 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gold/40 hover:text-gold/70">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
            <LogIn size={16} />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>

          <p className="text-center text-sm text-champagne/40 font-cormorant">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:text-gold/80 underline">Register</Link>
          </p>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 glass-card-dark rounded-2xl p-4 border border-gold/10">
          <p className="font-cinzel text-xs text-gold/50 text-center mb-3 uppercase tracking-wider">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { tier: 'free', label: 'Free', color: 'from-slate-500 to-slate-700' },
              { tier: 'pro', label: 'Pro', color: 'from-blue-500 to-blue-700' },
              { tier: 'guru', label: 'Guru', color: 'from-purple-500 to-purple-700' },
              { tier: 'admin', label: 'Admin', color: 'from-amber-500 to-amber-700' },
            ].map(({ tier, label, color }) => (
              <button
                key={tier}
                type="button"
                onClick={() => fillDemo(tier)}
                className={`py-2 px-3 rounded-lg text-xs font-cinzel text-white bg-gradient-to-r ${color} hover:opacity-80 transition-opacity`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-champagne/30 font-cormorant text-center mt-2">
            Click a button above, then sign in
          </p>
        </div>
      </motion.div>
    </div>
  )
}
