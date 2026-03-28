import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { getMonthData, getDayRating, getDayColor, getAuspiciousActivities, getUpcomingFestivals, type CalendarDay } from '@/lib/cosmic-calendar'
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, List, Star, X } from 'lucide-react'
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
        className="w-full max-w-lg rounded-t-2xl border border-white/10 overflow-hidden max-h-[80vh] overflow-y-auto"
        style={{ background: 'rgba(15,23,42,0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-cinzel text-white">
                {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-white/40">{day.vara.name} ({day.vara.planet} day)</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-white/50">Auspiciousness:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <motion.span
                  key={s}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: s * 0.1 }}
                >
                  <Star size={16} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                </motion.span>
              ))}
            </div>
          </div>

          {/* Panchanga */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Tithi</p>
              <p className="text-white text-sm mt-1">{day.tithi.paksha} {day.tithi.name}</p>
              <p className="text-white/30 text-xs">{day.tithi.devanagari}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Nakshatra</p>
              <p className="text-white text-sm mt-1">{day.nakshatra.name} P{day.nakshatra.pada}</p>
              <p className="text-white/30 text-xs">{day.nakshatra.devanagari}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Yoga</p>
              <p className="text-white text-sm mt-1">{day.yoga.name}</p>
              <p className="text-white/30 text-xs">{day.yoga.devanagari}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Karana</p>
              <p className="text-white text-sm mt-1">{day.karana.name}</p>
              <p className="text-white/30 text-xs">{day.karana.devanagari}</p>
            </div>
          </div>

          {/* Festivals */}
          {day.festivals.length > 0 && (
            <div className="mb-4">
              {day.festivals.map(f => (
                <div key={f.name} className={`p-3 rounded-xl bg-gradient-to-r ${f.gradient} mb-2`}>
                  <p className="text-white font-cinzel font-bold">{f.name}</p>
                  <p className="text-white/80 text-sm mt-1">{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Eclipse Warning */}
          {day.eclipseWarning && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <p className="text-red-400 font-medium">{day.eclipseWarning}</p>
              <p className="text-red-300/60 text-sm mt-1">Avoid starting new ventures during eclipses.</p>
            </div>
          )}

          {/* Activities */}
          <div className="space-y-2">
            <p className="text-sm text-white/50 font-medium">Activities</p>
            {activities.filter(a => a.good).map(a => (
              <div key={a.activity} className="flex items-center gap-2 text-green-400 text-sm">
                <span>&#10003;</span> {a.activity}
              </div>
            ))}
            {activities.filter(a => !a.good).map(a => (
              <div key={a.activity} className="flex items-center gap-2 text-red-400 text-sm">
                <span>&#10007;</span> {a.activity}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CosmicCalendarPage() {
  const { t } = useTranslation()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [view, setView] = useState<'calendar' | 'festivals'>('calendar')

  const monthData = useMemo(() => getMonthData(year, month), [year, month])
  const upcomingFestivals = useMemo(() => getUpcomingFestivals(today, 20), [])

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <h1 className="text-2xl font-cinzel text-white">Cosmic Calendar</h1>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 p-1 mb-4 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setView('calendar')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            view === 'calendar' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50'
          }`}
        >
          <Calendar size={14} /> Month View
        </button>
        <button
          onClick={() => setView('festivals')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            view === 'festivals' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50'
          }`}
        >
          <List size={14} /> Festivals
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10">
                <ChevronLeft size={20} className="text-white/60" />
              </button>
              <h2 className="text-lg font-cinzel text-white">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10">
                <ChevronRight size={20} className="text-white/60" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first week offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {monthData.map(day => {
                const color = getDayColor(day)
                const todayFlag = isToday(day)

                return (
                  <motion.button
                    key={day.day}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-all border ${
                      todayFlag
                        ? 'border-amber-400/60 bg-amber-500/10 ring-1 ring-amber-400/30'
                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className={`font-medium ${todayFlag ? 'text-amber-300' : 'text-white/80'}`}>
                      {day.day}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        color === 'green' ? 'bg-green-400' : color === 'red' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                      {day.festivals.length > 0 && (
                        <span className="text-[8px]">&#10024;</span>
                      )}
                    </div>
                    <span className="text-[8px] text-white/30">{day.moonPhase}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-white/40">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Auspicious</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Mixed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Inauspicious</span>
              <span className="flex items-center gap-1">&#10024; Festival</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="festivals"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {upcomingFestivals.map((festival, i) => (
              <motion.div
                key={festival.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl bg-gradient-to-r ${festival.gradient} relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-cinzel font-bold">{festival.name}</h3>
                    <span className="text-white/70 text-sm">
                      {festival.daysAway === 0 ? 'Today!' :
                       festival.daysAway === 1 ? 'Tomorrow' :
                       `${festival.daysAway} days`}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mb-2">
                    {festival.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-white/80 text-sm">{festival.description}</p>
                </div>
              </motion.div>
            ))}
            {upcomingFestivals.length === 0 && (
              <p className="text-center text-white/40 py-12">No upcoming festivals found for this year.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />}
      </AnimatePresence>
    </div>
  )
}
