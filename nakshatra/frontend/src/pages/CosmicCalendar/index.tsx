import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getMonthData, getDayRating, getDayColor, getAuspiciousActivities,
  getUpcomingFestivals, getHinduMonth, getVikramSamvat,
  EKADASHI_2026, PURNIMA_2026, AMAVASYA_2026,
  type CalendarDay,
} from '@/lib/cosmic-calendar'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Calendar, List,
  Star, X, Clock, Flame, Sun, Moon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Day Detail Panel ───────────────────────────────────────────────────────

function DayDetail({ day, onClose }: { day: CalendarDay; onClose: () => void }) {
  const rating = getDayRating(day)
  const activities = getAuspiciousActivities(day)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-2xl border border-white/10 overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ background: 'rgba(15,23,42,0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-cinzel text-white">
                {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-gold/60 font-cormorant">
                {day.hinduMonth.name} | Vikram Samvat {day.vikramSamvat}
              </p>
              <p className="text-xs text-white/40">{day.vara.name} ({day.vara.planet} day)</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          {/* Moon phase + special day badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-2xl">{day.moonPhase}</span>
            {day.isEkadashi && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-cinzel">
                Ekadashi Fast
              </span>
            )}
            {day.isPurnima && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/30 text-white text-xs font-cinzel">
                🌕 Purnima
              </span>
            )}
            {day.isAmavasya && (
              <span className="px-2 py-0.5 rounded-full bg-black/40 border border-white/20 text-white/70 text-xs font-cinzel">
                🌑 Amavasya
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-white/50">Auspiciousness:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: s * 0.1 }}>
                  <Star size={16} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                </motion.span>
              ))}
            </div>
          </div>

          {/* Panchanga Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Tithi', value: `${day.tithi.paksha} ${day.tithi.name}`, dev: day.tithi.devanagari, ok: day.tithi.isAuspicious },
              { label: 'Nakshatra', value: `${day.nakshatra.name} P${day.nakshatra.pada}`, dev: day.nakshatra.devanagari, ok: day.nakshatra.isAuspicious },
              { label: 'Yoga', value: day.yoga.name, dev: day.yoga.devanagari, ok: day.yoga.isAuspicious },
              { label: 'Karana', value: day.karana.name, dev: day.karana.devanagari, ok: day.karana.isAuspicious },
            ].map(({ label, value, dev, ok }) => (
              <div key={label} className={`p-3 rounded-xl border ${ok ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
                <p className="text-white text-sm mt-1">{value}</p>
                <p className="text-white/30 text-xs">{dev}</p>
              </div>
            ))}
          </div>

          {/* Timing */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-[9px] text-red-400/70 uppercase tracking-wider mb-1">Rahu Kalam</p>
              <p className="text-red-300 text-xs font-medium">{day.rahuKalam.start}</p>
              <p className="text-red-300/60 text-[10px]">to {day.rahuKalam.end}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[9px] text-amber-400/70 uppercase tracking-wider mb-1">Abhijit</p>
              <p className="text-amber-300 text-xs font-medium">{day.abhijitMuhurta.start}</p>
              <p className="text-amber-300/60 text-[10px]">to {day.abhijitMuhurta.end}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-[9px] text-orange-400/70 uppercase tracking-wider mb-1">Yamaganda</p>
              <p className="text-orange-300 text-xs font-medium">{day.yamakantam.start}</p>
              <p className="text-orange-300/60 text-[10px]">to {day.yamakantam.end}</p>
            </div>
          </div>

          {/* Festivals */}
          {day.festivals.length > 0 && (
            <div className="mb-4 space-y-2">
              {day.festivals.map(f => (
                <div key={f.name} className={`p-3 rounded-xl bg-gradient-to-r ${f.gradient}`}>
                  <p className="text-white font-cinzel font-bold text-sm">{f.name}</p>
                  <p className="text-white/80 text-xs mt-1">{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Eclipse Warning */}
          {day.eclipseWarning && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <p className="text-red-400 font-medium text-sm">⚠ {day.eclipseWarning}</p>
              <p className="text-red-300/60 text-xs mt-1">Avoid starting new ventures during eclipses.</p>
            </div>
          )}

          {/* Activities */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Activities</p>
            {activities.filter(a => a.good).map(a => (
              <div key={a.activity} className="flex items-center gap-2 text-green-400 text-sm">
                <span className="text-green-500">✓</span> {a.activity}
              </div>
            ))}
            {activities.filter(a => !a.good).map(a => (
              <div key={a.activity} className="flex items-center gap-2 text-red-400 text-sm">
                <span className="text-red-500">✗</span> {a.activity}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Calendar Cell ──────────────────────────────────────────────────────────

function CalendarCell({ day, isToday, onClick }: { day: CalendarDay; isToday: boolean; onClick: () => void }) {
  const color = getDayColor(day)
  const hasSpecial = day.isEkadashi || day.isPurnima || day.isAmavasya

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-all border ${
        isToday
          ? 'border-amber-400/60 bg-amber-500/10 ring-1 ring-amber-400/30'
          : day.isEkadashi
          ? 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'
          : day.isPurnima
          ? 'border-white/30 bg-white/5 hover:bg-white/10'
          : day.isAmavasya
          ? 'border-white/10 bg-black/20 hover:bg-black/30'
          : 'border-white/5 hover:border-white/20 hover:bg-white/5'
      }`}
    >
      <span className={`font-medium text-sm ${isToday ? 'text-amber-300' : 'text-white/80'}`}>
        {day.day}
      </span>
      {/* Tithi name — very small */}
      <span className="text-[7px] text-white/25 leading-tight text-center px-0.5 truncate w-full">
        {day.tithi.name}
      </span>
      <div className="flex items-center gap-0.5">
        <span className={`w-1.5 h-1.5 rounded-full ${
          color === 'green' ? 'bg-green-400' : color === 'red' ? 'bg-red-400' : 'bg-yellow-400'
        }`} />
        {day.festivals.length > 0 && !day.isEkadashi && !day.isPurnima && !day.isAmavasya && (
          <span className="text-[8px]">✦</span>
        )}
        {day.isEkadashi && <span className="text-[8px] text-blue-300">E</span>}
        {day.isPurnima && <span className="text-[8px]">🌕</span>}
        {day.isAmavasya && <span className="text-[8px]">🌑</span>}
      </div>
      {day.eclipseWarning && (
        <span className="absolute top-0.5 right-0.5 text-[8px]">⚠</span>
      )}
    </motion.button>
  )
}

// ─── Festivals List View ─────────────────────────────────────────────────────

function FestivalsView() {
  const today = new Date()
  const upcoming = useMemo(() => getUpcomingFestivals(today, 30), [])
  const [filter, setFilter] = useState<'all' | 'ekadashi' | 'purnima' | 'festival'>('all')

  const ekadashis = useMemo(() =>
    EKADASHI_2026.filter(e => {
      const d = new Date(2026, e.month, e.day)
      return d >= today
    }).slice(0, 8),
  [])

  const purnimas = useMemo(() =>
    PURNIMA_2026.filter(p => {
      const d = new Date(2026, p.month, p.day)
      return d >= today
    }).slice(0, 6),
  [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Filter tabs */}
      <div className="flex gap-1 p-1 mb-4 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'festival', label: '✦ Festivals' },
          { id: 'ekadashi', label: 'Ekadashi' },
          { id: 'purnima', label: '🌕 Purnima' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id as any)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-cinzel transition-all ${
              filter === id ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ekadashi list */}
      {(filter === 'all' || filter === 'ekadashi') && (
        <div className="mb-4">
          <h3 className="font-cinzel text-xs text-blue-400/70 uppercase tracking-wider mb-2">
            Ekadashi Fasting Days
          </h3>
          <div className="space-y-2">
            {ekadashis.map((e, i) => {
              const d = new Date(2026, e.month, e.day)
              const daysAway = Math.ceil((d.getTime() - today.getTime()) / 86400000)
              return (
                <motion.div
                  key={e.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-300 font-cinzel text-sm flex-shrink-0">
                    {d.getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm text-blue-200">{e.name}</p>
                    <p className="text-xs text-blue-300/50 font-cormorant">
                      {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {e.paksha} Paksha
                    </p>
                  </div>
                  <span className="text-xs text-blue-300/60 flex-shrink-0">
                    {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d`}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Purnima list */}
      {(filter === 'all' || filter === 'purnima') && (
        <div className="mb-4">
          <h3 className="font-cinzel text-xs text-white/50 uppercase tracking-wider mb-2">
            Purnima & Amavasya
          </h3>
          <div className="space-y-2">
            {purnimas.map((p, i) => {
              const d = new Date(2026, p.month, p.day)
              const daysAway = Math.ceil((d.getTime() - today.getTime()) / 86400000)
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/15"
                >
                  <span className="text-2xl">🌕</span>
                  <div className="flex-1">
                    <p className="font-cinzel text-sm text-white/80">{p.name}</p>
                    <p className="text-xs text-white/30 font-cormorant">
                      {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs text-white/30">
                    {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d`}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main festivals */}
      {(filter === 'all' || filter === 'festival') && (
        <div>
          <h3 className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">
            Festivals & Sacred Days
          </h3>
          <div className="space-y-2">
            {upcoming.map((festival, i) => (
              <motion.div
                key={festival.name + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-4 rounded-xl bg-gradient-to-r ${festival.gradient} relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-cinzel font-bold text-sm">{festival.name}</h3>
                    <span className="text-white/70 text-xs flex-shrink-0 ml-2">
                      {festival.daysAway === 0 ? '🎉 Today!' : festival.daysAway === 1 ? 'Tomorrow' : `${festival.daysAway} days`}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mb-1">
                    {festival.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-white/80 text-sm">{festival.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CosmicCalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [view, setView] = useState<'calendar' | 'festivals'>('calendar')

  const monthData = useMemo(() => getMonthData(year, month), [year, month])
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Hindu calendar header info
  const hinduMonthInfo = getHinduMonth(new Date(year, month, 15))
  const vikramSamvat = getVikramSamvat(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isToday = (d: CalendarDay) =>
    d.date.getDate() === today.getDate() &&
    d.date.getMonth() === today.getMonth() &&
    d.date.getFullYear() === today.getFullYear()

  // Count special days this month
  const ekadashiCount = monthData.filter(d => d.isEkadashi).length
  const festivalCount = monthData.filter(d => d.festivals.filter(f => !f.gradient.includes('blue') && !f.gradient.includes('slate')).length > 0).length

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-xl font-cinzel text-white">Hindu Calendar</h1>
          <p className="text-xs text-gold/50 font-cormorant">Panchanga & Sacred Days</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 p-1 mb-4 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setView('calendar')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            view === 'calendar' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white/70'
          }`}
        >
          <Calendar size={14} /> Month View
        </button>
        <button
          onClick={() => setView('festivals')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            view === 'festivals' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white/70'
          }`}
        >
          <List size={14} /> Sacred Days
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'calendar' ? (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-1">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10">
                <ChevronLeft size={20} className="text-white/60" />
              </button>
              <div className="text-center">
                <h2 className="text-base font-cinzel text-white">{monthName}</h2>
                <p className="text-xs text-gold/50 font-cormorant">
                  {hinduMonthInfo.devanagari} · {hinduMonthInfo.name} · Vikram Samvat {vikramSamvat}
                </p>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10">
                <ChevronRight size={20} className="text-white/60" />
              </button>
            </div>

            {/* Month summary pills */}
            <div className="flex gap-2 justify-center mb-3">
              {ekadashiCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[10px] font-cinzel">
                  {ekadashiCount} Ekadashi
                </span>
              )}
              {festivalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-cinzel">
                  {festivalCount} Festivals
                </span>
              )}
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {monthData.map(day => (
                <CalendarCell
                  key={day.day}
                  day={day}
                  isToday={isToday(day)}
                  onClick={() => setSelectedDay(day)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[9px] text-white/40">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Auspicious</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Mixed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Inauspicious</span>
              <span className="flex items-center gap-1 text-blue-300">E Ekadashi</span>
              <span className="flex items-center gap-1">🌕 Purnima</span>
              <span className="flex items-center gap-1">🌑 Amavasya</span>
              <span className="flex items-center gap-1">✦ Festival</span>
            </div>

            {/* Today's quick summary */}
            {year === today.getFullYear() && month === today.getMonth() && (() => {
              const todayData = monthData.find(d => d.day === today.getDate())
              if (!todayData) return null
              return (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl glass-card-dark border border-gold/10"
                >
                  <p className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">Today's Panchanga</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-cormorant">
                    <span className="text-white/40">Tithi</span>
                    <span className="text-champagne/80">{todayData.tithi.paksha} {todayData.tithi.name}</span>
                    <span className="text-white/40">Nakshatra</span>
                    <span className="text-champagne/80">{todayData.nakshatra.name} Pada {todayData.nakshatra.pada}</span>
                    <span className="text-white/40">Yoga</span>
                    <span className="text-champagne/80">{todayData.yoga.name}</span>
                    <span className="text-white/40">Rahu Kalam</span>
                    <span className="text-red-300/70">{todayData.rahuKalam.start} – {todayData.rahuKalam.end}</span>
                    <span className="text-white/40">Abhijit</span>
                    <span className="text-amber-300/70">{todayData.abhijitMuhurta.start} – {todayData.abhijitMuhurta.end}</span>
                    <span className="text-white/40">Hindu Month</span>
                    <span className="text-champagne/80">{todayData.hinduMonth.name} · VS {todayData.vikramSamvat}</span>
                  </div>
                </motion.div>
              )
            })()}
          </motion.div>
        ) : (
          <FestivalsView key="festivals" />
        )}
      </AnimatePresence>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />}
      </AnimatePresence>
    </div>
  )
}
