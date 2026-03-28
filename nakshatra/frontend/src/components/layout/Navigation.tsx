import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  Home, Star, Hash, Compass, BookOpen, Trophy, Flame,
  User, Menu, X, Sparkles, Grid3X3, MessageCircle, Heart,
  Calendar, Clock, Users, Crown, Database
} from 'lucide-react'
import { xpForLevel } from '@/store'
import LanguageToggle from '@/components/ui/LanguageToggle'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard', emoji: '🏠' },
  { path: '/kundli', icon: Star, label: 'Kundli', emoji: '⭐' },
  { path: '/tarot', icon: Sparkles, label: 'Tarot', emoji: '🃏' },
  { path: '/oracle', icon: MessageCircle, label: 'Oracle', emoji: '🔮' },
  { path: '/numerology', icon: Hash, label: 'Numerology', emoji: '🔢' },
  { path: '/vastu', icon: Compass, label: 'Vastu', emoji: '🧭' },
  { path: '/compatibility', icon: Heart, label: 'Compatibility', emoji: '💞' },
  { path: '/panchanga', icon: Calendar, label: 'Panchanga', emoji: '📅' },
  { path: '/muhurta', icon: Clock, label: 'Muhurta', emoji: '⏰' },
  { path: '/scriptures', icon: BookOpen, label: 'Scriptures', emoji: '📿' },
  { path: '/transits', icon: Compass, label: 'Transits', emoji: '🪐' },
  { path: '/calendar', icon: Calendar, label: 'Calendar', emoji: '📅' },
  { path: '/remedies', icon: Flame, label: 'Remedies', emoji: '💎' },
  { path: '/quiz', icon: Grid3X3, label: 'Quiz', emoji: '🧠' },
  { path: '/mood-journal', icon: Heart, label: 'Mood Journal', emoji: '📓' },
  { path: '/muhurta-alerts', icon: Clock, label: 'Muhurta Planner', emoji: '⏰' },
  { path: '/learning', icon: BookOpen, label: 'Learning', emoji: '📚' },
  { path: '/year-ahead', icon: Star, label: 'Year Ahead', emoji: '🔮' },
  { path: '/community', icon: Users, label: 'Community', emoji: '🌐' },
  { path: '/achievements', icon: Trophy, label: 'Achievements', emoji: '🏆' },
  { path: '/profile', icon: User, label: 'Profile', emoji: '👤' },
]

// Admin-only nav items — only visible to users with role 'admin'
const adminNavItems = [
  { path: '/knowledge', icon: Database, label: 'Knowledge Base', emoji: '📚' },
]

export default function Navigation() {
  const { user, sidebarOpen, setSidebarOpen } = useStore()
  const location = useLocation()

  const xpProgress = user
    ? ((user.xp - xpForLevel(user.level)) / (xpForLevel(user.level + 1) - xpForLevel(user.level))) * 100
    : 0

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass-card-dark border-b border-gold/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✦</span>
          <span className="font-cinzel text-lg text-gold-gradient font-bold">Nakshatra</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle compact />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg glass-card text-champagne hover:text-gold transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-void/80 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          glass-card-dark border-r border-gold/10
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gold/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-shimmer flex items-center justify-center text-cosmos font-bold text-lg">
                ✦
              </div>
              <div>
                <h1 className="font-cinzel text-lg font-bold text-gold-gradient">Nakshatra</h1>
                <p className="text-xs text-slate-400 font-cormorant">Vedic Wisdom Quest</p>
              </div>
            </div>
            <LanguageToggle compact />
          </div>
        </div>

        {/* User Level Card */}
        {user && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-stardust/50 border border-gold/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{user.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-cinzel text-champagne truncate">{user.username}</p>
                <p className="text-xs text-gold/70">{user.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gold font-bold">Lv.{user.level}</p>
                {user.streakDays > 0 && (
                  <div className="flex items-center gap-0.5 justify-end">
                    <Flame size={10} className="text-saffron" />
                    <span className="text-xs text-saffron">{user.streakDays}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-cosmos rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold-shimmer rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{user.xp} / {user.xpToNextLevel} XP</p>
          </div>
        )}

        {/* Nav Items - scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-gold/10 border border-gold/20 text-gold shadow-gold-glow/20'
                    : 'text-slate-400 hover:text-champagne hover:bg-stardust/50'
                  }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span className={`font-cinzel text-sm ${isActive ? 'text-gold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                  />
                )}
              </NavLink>
            )
          })}

          {/* Admin-only section */}
          {user?.role === 'admin' && adminNavItems.length > 0 && (
            <>
              <div className="mx-3 my-3 border-t border-gold/10" />
              <p className="px-3 mb-1 font-cinzel text-[10px] uppercase tracking-widest text-gold/40">Admin</p>
              {adminNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'bg-red-500/10 border border-red-400/20 text-red-300'
                        : 'text-slate-500 hover:text-red-300 hover:bg-red-500/5'
                      }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className={`font-cinzel text-sm ${isActive ? 'text-red-300' : ''}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator-admin"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400"
                      />
                    )}
                  </NavLink>
                )
              })}
            </>
          )}
        </nav>

        {/* Upgrade CTA */}
        <div className="p-4 border-t border-gold/10 space-y-2">
          <NavLink
            to="/daily-rituals"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-saffron/10 border border-saffron/20 hover:bg-saffron/20 transition-all"
          >
            <Grid3X3 size={14} className="text-saffron" />
            <span className="text-xs font-cinzel text-saffron">Daily Rituals</span>
          </NavLink>
          <button
            onClick={() => {
              const event = new CustomEvent('open-upgrade-modal')
              window.dispatchEvent(event)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-celestial/10 border border-celestial/20 hover:bg-celestial/20 transition-all"
          >
            <Crown size={14} className="text-ethereal" />
            <span className="text-xs font-cinzel text-ethereal">Upgrade to Pro</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
