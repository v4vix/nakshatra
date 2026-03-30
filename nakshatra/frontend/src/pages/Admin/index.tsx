import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, BarChart3, Settings, Crown, Shield, Trash2, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  getAdminUsers, updateAdminUser, deleteAdminUser,
  getAdminAnalytics, getAdminSettings, updateAdminSettings,
} from '@/services/auth'
import toast from 'react-hot-toast'

type Tab = 'users' | 'analytics' | 'settings'

const TIER_COLORS: Record<string, string> = {
  free: 'bg-slate-600', pro: 'bg-blue-600', guru: 'bg-purple-600',
}
const TIER_LABELS: Record<string, string> = {
  free: 'Free', pro: 'Pro', guru: 'Guru',
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('users')
  const { user: currentUser } = useAuthStore()

  if (currentUser?.role !== 'admin') {
    return <div className="p-8 text-center text-champagne/50">Admin access required</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-gold" size={24} />
        <h1 className="font-cinzel text-2xl text-gold-gradient font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { id: 'users', icon: Users, label: 'Users' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'settings', icon: Settings, label: 'Paywall' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cinzel transition-all ${
              tab === id
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-champagne/40 hover:text-champagne/60 border border-transparent'
            }`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'analytics' && <AnalyticsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminUsers()
      setUsers(data.users)
    } catch (err: any) { toast.error(err.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function changeTier(userId: string, tier: string) {
    try {
      await updateAdminUser(userId, { tier })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier } : u))
      toast.success('Tier updated')
    } catch (err: any) { toast.error(err.message) }
  }

  async function changeRole(userId: string, role: string) {
    try {
      await updateAdminUser(userId, { role })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      toast.success('Role updated')
    } catch (err: any) { toast.error(err.message) }
  }

  async function removeUser(userId: string) {
    if (!confirm('Delete this user permanently?')) return
    try {
      await deleteAdminUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('User deleted')
    } catch (err: any) { toast.error(err.message) }
  }

  if (loading) return <div className="text-center text-champagne/40 py-8">Loading users...</div>

  return (
    <div className="space-y-3">
      <p className="text-sm text-champagne/40 font-cormorant">{users.length} total users</p>
      {users.map(u => (
        <motion.div
          key={u.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card-dark rounded-xl p-4 border border-stardust/30 flex items-center gap-4 flex-wrap"
        >
          <span className="text-2xl">{u.avatar}</span>
          <div className="flex-1 min-w-[140px]">
            <p className="font-cinzel text-sm text-champagne">{u.fullName || u.username}</p>
            <p className="text-xs text-champagne/40 font-cormorant">{u.email}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-champagne/30">Lv.{u.level}</span>
            <span className={`px-2 py-0.5 rounded-full text-white ${TIER_COLORS[u.tier] || 'bg-slate-600'}`}>
              {TIER_LABELS[u.tier] || u.tier}
            </span>
            {u.role === 'admin' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white">Admin</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <select
              value={u.tier}
              onChange={e => changeTier(u.id, e.target.value)}
              className="bg-stardust/40 border border-stardust/60 rounded-lg px-2 py-1 text-xs text-white"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="guru">Guru</option>
            </select>

            <select
              value={u.role}
              onChange={e => changeRole(u.id, e.target.value)}
              className="bg-stardust/40 border border-stardust/60 rounded-lg px-2 py-1 text-xs text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button onClick={() => removeUser(u.id)} className="p-1 text-red-400/50 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminAnalytics()
      .then(d => setData(d.analytics))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-champagne/40 py-8">Loading analytics...</div>
  if (!data) return null

  const tierDist = data.tierDistribution || {}
  const total = data.totalUsers || 1

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: data.totalUsers, icon: Users },
          { label: 'Active Today', value: data.activeToday, icon: BarChart3 },
          { label: 'Kundlis', value: data.readings?.kundli || 0, icon: Crown },
          { label: 'Share Cards', value: data.readings?.shareCards || 0, icon: Settings },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card-dark rounded-xl p-4 border border-stardust/30 text-center">
            <Icon className="mx-auto text-gold/50 mb-2" size={20} />
            <p className="font-cinzel text-2xl text-gold">{value}</p>
            <p className="text-xs text-champagne/40 font-cormorant">{label}</p>
          </div>
        ))}
      </div>

      {/* Tier distribution */}
      <div className="glass-card-dark rounded-xl p-4 border border-stardust/30">
        <h3 className="font-cinzel text-sm text-gold/70 mb-3">Tier Distribution</h3>
        <div className="space-y-2">
          {['free', 'pro', 'guru'].map(tier => {
            const count = tierDist[tier] || 0
            const pct = Math.round((count / total) * 100)
            return (
              <div key={tier} className="flex items-center gap-3">
                <span className="font-cinzel text-xs text-champagne/60 w-12">{TIER_LABELS[tier]}</span>
                <div className="flex-1 h-4 bg-stardust/30 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${TIER_COLORS[tier]}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-champagne/40 w-16 text-right">{count} ({pct}%)</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent users */}
      <div className="glass-card-dark rounded-xl p-4 border border-stardust/30">
        <h3 className="font-cinzel text-sm text-gold/70 mb-3">Recent Users</h3>
        <div className="space-y-2">
          {(data.recentUsers || []).map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 text-sm">
              <span>{u.avatar}</span>
              <span className="font-cormorant text-champagne/70">{u.fullName || u.username}</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs text-white ${TIER_COLORS[u.tier]}`}>
                {TIER_LABELS[u.tier]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAdminSettings()
      .then(d => setSettings(d.settings))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      await updateAdminSettings(settings)
      toast.success('Settings saved')
    } catch (err: any) { toast.error(err.message) }
    setSaving(false)
  }

  if (loading) return <div className="text-center text-champagne/40 py-8">Loading settings...</div>

  const limitKeys = [
    { key: 'free_kundli_limit', label: 'Free Kundli Limit' },
    { key: 'free_tarot_daily_limit', label: 'Free Tarot Daily Limit' },
    { key: 'free_oracle_daily_limit', label: 'Free Oracle Daily Limit' },
    { key: 'free_numerology_limit', label: 'Free Numerology Limit' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card-dark rounded-xl p-4 border border-stardust/30">
        <h3 className="font-cinzel text-sm text-gold/70 mb-4">Free Tier Limits</h3>
        <div className="grid grid-cols-2 gap-4">
          {limitKeys.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-champagne/50 font-cormorant mb-1">{label}</label>
              <input
                type="number"
                value={settings[key] || '0'}
                onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                min={0}
                max={100}
                className="w-full bg-stardust/40 border border-stardust/60 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card-dark rounded-xl p-4 border border-stardust/30">
        <h3 className="font-cinzel text-sm text-gold/70 mb-4">Pro Features</h3>
        <p className="text-xs text-champagne/40 font-cormorant mb-2">
          Comma-separated feature keys enabled for Pro tier
        </p>
        <textarea
          value={settings.pro_features || '[]'}
          onChange={e => setSettings(prev => ({ ...prev, pro_features: e.target.value }))}
          rows={3}
          className="w-full bg-stardust/40 border border-stardust/60 rounded-lg px-3 py-2 text-white text-xs font-mono"
        />
      </div>

      <div className="glass-card-dark rounded-xl p-4 border border-stardust/30">
        <h3 className="font-cinzel text-sm text-gold/70 mb-4">Guru Features</h3>
        <textarea
          value={settings.guru_features || '[]'}
          onChange={e => setSettings(prev => ({ ...prev, guru_features: e.target.value }))}
          rows={3}
          className="w-full bg-stardust/40 border border-stardust/60 rounded-lg px-3 py-2 text-white text-xs font-mono"
        />
      </div>

      <motion.button
        onClick={save}
        disabled={saving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-6 py-3 rounded-xl text-sm font-cinzel tracking-wider disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #FFB347 0%, #FF6B00 100%)',
          color: '#020B18',
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </motion.button>
    </div>
  )
}
