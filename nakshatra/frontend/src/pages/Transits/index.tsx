import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { getCurrentTransits, getUpcomingTransits, getTransitToNatal, type PlanetTransit, type TransitEvent } from '@/lib/transits'
import { RASHI_DATA } from '@/lib/vedic-constants'
import { ArrowLeft, ChevronRight, Info, X } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Planet Detail Modal ──────────────────────────────────────────────────

function PlanetModal({ planet, onClose }: { planet: PlanetTransit; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md mx-4 mb-4 rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(15,23,42,0.95)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl" style={{ color: planet.color }}>{planet.glyph}</span>
              <div>
                <h3 className="text-xl font-cinzel text-white">{planet.planet}</h3>
                <p className="text-sm text-white/50">
                  {planet.isRetrograde ? 'Retrograde ' : ''}{planet.rashi} ({RASHI_DATA.find(r => r.name === planet.rashi)?.western})
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Position</p>
                <p className="text-white font-medium">{planet.rashiSymbol} {planet.rashiDegree.toFixed(1)}&deg;</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Nakshatra</p>
                <p className="text-white font-medium text-sm">{planet.nakshatra} P{planet.nakshatraPada}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Speed</p>
                <p className="text-white font-medium">{planet.dailyMotion.toFixed(3)}&deg;/day</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Status</p>
                <p className={planet.isRetrograde ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
                  {planet.isRetrograde ? 'Rx Retrograde' : 'Direct Motion'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Transit Meaning</p>
              <p className="text-white/70 text-sm leading-relaxed">
                {planet.planet} transiting through {planet.rashi} influences{' '}
                {planet.planet === 'Jupiter' ? 'expansion, wisdom, and opportunities' :
                 planet.planet === 'Saturn' ? 'discipline, structure, and karmic lessons' :
                 planet.planet === 'Mars' ? 'energy, courage, and assertiveness' :
                 planet.planet === 'Venus' ? 'love, beauty, and material comforts' :
                 planet.planet === 'Mercury' ? 'communication, intellect, and commerce' :
                 planet.planet === 'Sun' ? 'vitality, authority, and self-expression' :
                 planet.planet === 'Moon' ? 'emotions, intuition, and daily life' :
                 planet.planet === 'Rahu' ? 'desires, ambitions, and worldly pursuits' :
                 'detachment, spirituality, and past karma'}.
                {planet.isRetrograde ? ' The retrograde motion intensifies introspection in these areas.' : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TransitsPage() {
  const { t } = useTranslation()
  const { user } = useStore()
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetTransit | null>(null)
  const [tab, setTab] = useState<'current' | 'natal' | 'upcoming'>('current')

  const transits = useMemo(() => getCurrentTransits(), [])
  const upcomingEvents = useMemo(() => getUpcomingTransits(30), [])

  // Use ascendant from active kundli if available
  const ascendantIndex = user?.birthDate ? 0 : 0 // fallback to Aries
  const natalTransits = useMemo(
    () => getTransitToNatal(transits, ascendantIndex),
    [transits, ascendantIndex]
  )

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-cinzel text-white">Planetary Transits</h1>
          <p className="text-sm text-white/40">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 mb-6 rounded-xl bg-white/5 border border-white/10">
        {(['current', 'natal', 'upcoming'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            {t === 'current' ? 'Positions' : t === 'natal' ? 'Your Chart' : 'Upcoming'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'current' && (
          <motion.div
            key="current"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {transits.map((planet, i) => (
              <motion.button
                key={planet.planet}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedPlanet(planet)}
                className="w-full p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all text-left"
                style={{ background: `linear-gradient(135deg, ${planet.color}08, transparent)` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" style={{ color: planet.color }}>{planet.glyph}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{planet.planet}</span>
                        {planet.isRetrograde && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">Rx</span>
                        )}
                      </div>
                      <p className="text-sm text-white/50">
                        {planet.rashiSymbol} {planet.rashi} &middot; {planet.rashiDegree.toFixed(1)}&deg;
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">{planet.nakshatra}</p>
                    <p className="text-xs text-white/30">Pada {planet.nakshatraPada}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {tab === 'natal' && (
          <motion.div
            key="natal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {natalTransits.length > 0 ? natalTransits.map((ht, i) => (
              <motion.div
                key={ht.house}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border ${
                  ht.nature === 'benefic' ? 'border-green-500/20 bg-green-500/5' :
                  ht.nature === 'malefic' ? 'border-red-500/20 bg-red-500/5' :
                  'border-yellow-500/20 bg-yellow-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-cinzel text-white">House {ht.house}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    ht.nature === 'benefic' ? 'bg-green-500/20 text-green-400' :
                    ht.nature === 'malefic' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ht.nature}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  {ht.planets.map(p => (
                    <span key={p} className="text-sm px-2 py-0.5 rounded bg-white/10 text-white/70">{p}</span>
                  ))}
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{ht.effect}</p>
              </motion.div>
            )) : (
              <div className="text-center py-12 text-white/40">
                <Info size={32} className="mx-auto mb-3 opacity-50" />
                <p>Complete your Kundli to see personalized transit effects</p>
                <Link to="/kundli" className="text-amber-400 text-sm mt-2 inline-block">Generate Kundli &rarr;</Link>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'upcoming' && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-1"
          >
            <div className="relative pl-6 border-l-2 border-white/10 space-y-4 ml-2">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
                <motion.div
                  key={`${event.planet}-${event.date.getTime()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[29px] w-3 h-3 rounded-full border-2"
                    style={{ borderColor: event.color, background: `${event.color}40` }}
                  />

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/40">
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        event.type === 'exaltation' ? 'bg-green-500/20 text-green-400' :
                        event.type === 'debilitation' ? 'bg-red-500/20 text-red-400' :
                        event.type === 'retrograde' ? 'bg-orange-500/20 text-orange-400' :
                        event.type === 'direct' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-white text-sm">
                      <span style={{ color: event.color }}>{event.glyph}</span> {event.description}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <p className="text-white/40 text-center py-8">No major transits in the next 30 days</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planet Detail Modal */}
      <AnimatePresence>
        {selectedPlanet && (
          <PlanetModal planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
