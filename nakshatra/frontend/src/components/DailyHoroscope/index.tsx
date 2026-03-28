import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import {
  ChevronDown, ChevronUp, Sparkles, ChevronRight, RefreshCw,
} from 'lucide-react'

// ─── Planet Energy Tables ──────────────────────────────────────────────────

const PLANET_DAILY_ENERGY: Record<string, string[]> = {
  Sun: [
    'Your confidence shines today. Assert your identity and take leadership — the cosmos recognises your authority.',
    'Authority figures favor you. A great day for career moves, presentations, and stepping into the spotlight.',
    'Your vitality is high. Physical activities and bold decisions are favored. Act from your highest self.',
  ],
  Moon: [
    'Emotions run deep today. Nurture your relationships and honour your need for comfort and connection.',
    'Intuition is heightened — trust your gut over logic. Dreams and inner whispers carry important messages.',
    'Home and family matters take centre stage. Create a sanctuary of peace and tend to those you love.',
  ],
  Mars: [
    'Energy and drive are your allies. Push through obstacles with courageous determination today.',
    'Competitive spirit rises — channel it productively. Physical exertion relieves tension and builds strength.',
    'Action taken now bears fruit quickly. Initiate projects, assert your boundaries, and move decisively.',
  ],
  Mercury: [
    'Communication flows smoothly. Contracts, negotiations, and intellectual conversations are favoured.',
    'Sharp mental clarity illuminates your path. Learning, writing, and problem-solving excel beautifully.',
    'Short journeys and unexpected meetings bring opportunity. Stay alert and speak your truth clearly.',
  ],
  Jupiter: [
    'Expansion and growth energize the day. Think big, dream wide, and align with your highest vision.',
    'Wisdom and guidance flow to you naturally. Teach what you know or seek a mentor for accelerated growth.',
    'Blessings arrive unexpectedly. Practise gratitude — it amplifies the cosmic abundance around you.',
  ],
  Venus: [
    'Love and beauty color your world. Relationships harmonize and creative expression flows effortlessly.',
    'Creative pursuits shine brilliantly today. Art, music, beauty, and all forms of pleasure are blessed.',
    'Financial matters improve under Venusian grace. A favorable day for conscious purchases and investments.',
  ],
  Saturn: [
    'Discipline and patience are rewarded today. Show up fully, do the work, and honour your commitments.',
    'Slow and steady wins the race. Avoid shortcuts — the foundations you build now last a lifetime.',
    'Karmic lessons surface with clarity. Accept rather than resist — wisdom lives in the resistance itself.',
  ],
  Rahu: [
    'Unexpected twists require adaptability. Stay flexible, embrace change, and trust the unfolding.',
    'Worldly ambitions are activated strongly. Pursue your goals — but check your motives stay aligned.',
    'Technology, innovation, and unconventional paths favor you. Break molds thoughtfully today.',
  ],
  Ketu: [
    'Spiritual insights emerge from stillness. Meditation and deep introspection reveal profound truths.',
    'Release attachments with grace. What you consciously let go of liberates enormous energy.',
    'Past connections resurface carrying lessons ready to be completed. Receive them with open awareness.',
  ],
}

const PLANET_OPPORTUNITIES: Record<string, string[]> = {
  Sun: ['Leadership and self-expression', 'Career advancement and recognition', 'Healing the father-relationship'],
  Moon: ['Deepening emotional bonds', 'Intuitive creative work', 'Healing the mother-relationship'],
  Mars: ['Completing long-delayed projects', 'Physical health and vitality', 'Courageous conversations'],
  Mercury: ['Business and commerce', 'Learning new skills', 'Clearing communication misunderstandings'],
  Jupiter: ['Spiritual study and growth', 'Teaching and mentoring others', 'Abundance and financial expansion'],
  Venus: ['Romance and partnership', 'Artistic creation', 'Beauty rituals and self-care'],
  Saturn: ['Clearing karmic debts', 'Disciplined skill-building', 'Long-term planning and structure'],
  Rahu: ['Technology and innovation', 'Breaking old patterns', 'Networking and new alliances'],
  Ketu: ['Spiritual liberation practices', 'Past-life healing', 'Surrendering to the divine flow'],
}

const PLANET_WATCH_OUTS: Record<string, string> = {
  Sun: 'Ego clashes with authority. Avoid arrogance or over-dominance.',
  Moon: 'Emotional hypersensitivity. Don\'t project feelings onto others.',
  Mars: 'Impulsiveness and anger. Pause before reacting to provocations.',
  Mercury: 'Over-analysis causing paralysis. Trust intuition alongside logic.',
  Jupiter: 'Over-expansion or excess. Discern between genuine growth and escapism.',
  Venus: 'Indulgence and laziness. Pleasure is a gift — but keep your discipline.',
  Saturn: 'Excessive restriction or pessimism. Not every boundary serves you.',
  Rahu: 'Obsession and deception. Discern illusion from opportunity carefully.',
  Ketu: 'Detachment becoming disconnection. Stay grounded while you transcend.',
}

const PLANET_MANTRAS: Record<string, { mantra: string; devanagari: string; planet: string }> = {
  Sun: {
    planet: 'Surya (Sun)',
    devanagari: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
  },
  Moon: {
    planet: 'Chandra (Moon)',
    devanagari: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    mantra: 'Om Shraam Shreem Shraum Sah Chandramase Namah',
  },
  Mars: {
    planet: 'Mangal (Mars)',
    devanagari: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
  },
  Mercury: {
    planet: 'Budha (Mercury)',
    devanagari: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    mantra: 'Om Braam Breem Braum Sah Budhaya Namah',
  },
  Jupiter: {
    planet: 'Guru (Jupiter)',
    devanagari: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    mantra: 'Om Graam Greem Graum Sah Gurave Namah',
  },
  Venus: {
    planet: 'Shukra (Venus)',
    devanagari: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    mantra: 'Om Draam Dreem Draum Sah Shukraya Namah',
  },
  Saturn: {
    planet: 'Shani (Saturn)',
    devanagari: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
  },
  Rahu: {
    planet: 'Rahu (North Node)',
    devanagari: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    mantra: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
  },
  Ketu: {
    planet: 'Ketu (South Node)',
    devanagari: 'ॐ स्त्रां स्त्रीं स्त्रौं सः केतवे नमः',
    mantra: 'Om Straam Streem Straum Sah Ketave Namah',
  },
}

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
]

const RASHI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
]

const PLANET_COLORS: Record<string, string> = {
  Sun: 'text-amber-400',
  Moon: 'text-indigo-300',
  Mars: 'text-red-400',
  Mercury: 'text-cyan-300',
  Jupiter: 'text-yellow-300',
  Venus: 'text-pink-300',
  Saturn: 'text-violet-400',
  Rahu: 'text-slate-300',
  Ketu: 'text-orange-300',
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☀️', Moon: '🌙', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}

// ─── Deterministic Seed ────────────────────────────────────────────────────

function dateSeed(date: Date): number {
  return date.getDate() + date.getMonth() * 31 + date.getFullYear() * 367
}

function pickDeterministic<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

// ─── Section Component ─────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-stardust/40 first:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 px-1 hover:bg-stardust/20 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-cinzel text-xs uppercase tracking-wider text-slate-300 group-hover:text-gold transition-colors">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-slate-500" />
        ) : (
          <ChevronDown size={14} className="text-slate-500" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main DailyHoroscope Component ────────────────────────────────────────

export default function DailyHoroscope() {
  const { getActiveKundli } = useStore()
  const kundli = getActiveKundli()

  const today = useMemo(() => new Date(), [])
  const seed = useMemo(() => dateSeed(today), [today])

  const horoscope = useMemo(() => {
    if (!kundli) return null

    // Current Mahadasha planet
    const mahadashaPlanet = kundli.dashas?.currentMahadasha?.planet ?? 'Jupiter'
    const antardashaPlanet = kundli.dashas?.currentAntardasha?.planet ?? 'Moon'

    // Moon nakshatra from kundli
    const moonPlanet = kundli.planets.find((p) => p.name === 'Moon')
    const moonNakshatraIndex = moonPlanet?.nakshatraIndex ?? (seed % 27)
    const moonNakshatra = NAKSHATRA_NAMES[moonNakshatraIndex] ?? 'Rohini'
    const moonRashi = RASHI_NAMES[moonPlanet?.rashiIndex ?? (seed % 12)] ?? 'Mesha (Aries)'

    // Sun sign from kundli
    const sunPlanet = kundli.planets.find((p) => p.name === 'Sun')
    const sunRashi = RASHI_NAMES[sunPlanet?.rashiIndex ?? (seed % 12)] ?? 'Mesha (Aries)'

    // Ascendant
    const ascRashi = RASHI_NAMES[kundli.ascendant?.rashiIndex ?? (seed % 12)] ?? 'Mesha (Aries)'

    // Pick messages deterministically from date
    const msgIdx = (today.getDate() + today.getMonth()) % 3
    const sunEnergy = (PLANET_DAILY_ENERGY[mahadashaPlanet] ?? PLANET_DAILY_ENERGY.Jupiter)[msgIdx]
    const moonEnergy = (PLANET_DAILY_ENERGY.Moon)[msgIdx]
    const opportunity = pickDeterministic(PLANET_OPPORTUNITIES[mahadashaPlanet] ?? PLANET_OPPORTUNITIES.Jupiter, seed + 1)
    const watchOut = PLANET_WATCH_OUTS[antardashaPlanet] ?? PLANET_WATCH_OUTS.Moon
    const mantraData = PLANET_MANTRAS[mahadashaPlanet] ?? PLANET_MANTRAS.Jupiter

    // Overall intensity (seed-based 1–10)
    const intensity = ((seed * 17 + today.getDate() * 7) % 10) + 1

    return {
      mahadashaPlanet,
      antardashaPlanet,
      moonNakshatra,
      moonRashi,
      sunRashi,
      ascRashi,
      sunEnergy,
      moonEnergy,
      opportunity,
      watchOut,
      mantraData,
      intensity,
    }
  }, [kundli, seed, today])

  const dateString = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── No Kundli state ──────────────────────────────────────────────────────

  if (!kundli) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-gold" />
          <h3 className="font-cinzel text-sm font-bold text-gold uppercase tracking-wider">Daily Horoscope</h3>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🔭</div>
          <p className="font-cinzel text-slate-400 text-sm mb-1">Your personal horoscope awaits</p>
          <p className="font-cormorant text-slate-500 text-sm mb-4">
            Create your Kundli to unlock a personalized daily horoscope based on your birth chart, Mahadasha, and Moon nakshatra.
          </p>
          <Link
            to="/kundli"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-saffron/80 to-gold/80 text-cosmos text-xs font-cinzel font-bold hover:opacity-90 transition-opacity"
          >
            <span>Create Kundli</span>
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    )
  }

  const { mahadashaPlanet, moonNakshatra, moonRashi, sunRashi, ascRashi,
    sunEnergy, moonEnergy, opportunity, watchOut, mantraData, intensity, antardashaPlanet } = horoscope!

  const planetColor = PLANET_COLORS[mahadashaPlanet] ?? 'text-gold'
  const planetSymbol = PLANET_SYMBOLS[mahadashaPlanet] ?? '✦'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-stardust/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-gold" />
              <h3 className="font-cinzel text-xs font-bold text-gold uppercase tracking-wider">
                Daily Horoscope
              </h3>
            </div>
            <p className="font-cinzel text-[10px] text-slate-500 mt-0.5">{dateString}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`text-2xl ${planetColor}`}>{planetSymbol}</div>
            <span className="text-[10px] font-cinzel text-slate-500">{mahadashaPlanet} Dasha</span>
          </div>
        </div>

        {/* Cosmic signature strip */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: 'Ascendant', value: ascRashi.split('(')[0].trim() },
            { label: 'Sun Sign', value: sunRashi.split('(')[0].trim() },
            { label: 'Moon', value: moonNakshatra },
          ].map((item) => (
            <div key={item.label} className="px-2.5 py-1 rounded-full bg-stardust/50 border border-stardust/80">
              <span className="text-[9px] font-cinzel text-slate-500 uppercase tracking-wider">{item.label}: </span>
              <span className="text-[10px] font-cinzel text-gold/80">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Intensity bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-cinzel text-slate-600 uppercase tracking-wider">Cosmic Intensity</span>
            <span className="text-[9px] font-cinzel text-gold/60">{intensity}/10</span>
          </div>
          <div className="h-1.5 rounded-full bg-stardust/60 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${
                intensity >= 8 ? 'from-saffron to-gold' :
                intensity >= 5 ? 'from-violet-500 to-purple-400' :
                'from-indigo-500 to-blue-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${intensity * 10}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-5 space-y-0">

        <Section
          title={`${mahadashaPlanet} Dasha Energy`}
          icon={<span className={`text-base ${planetColor}`}>{planetSymbol}</span>}
          defaultOpen
        >
          <p className="font-cormorant text-slate-300 text-base leading-relaxed">{sunEnergy}</p>
          <div className="mt-2 text-xs font-cinzel text-slate-500">
            Antardasha: <span className={PLANET_COLORS[antardashaPlanet] ?? 'text-gold'}>{antardashaPlanet}</span>
          </div>
        </Section>

        <Section
          title="Moon Energy"
          icon={<span className="text-base text-indigo-300">🌙</span>}
        >
          <p className="font-cormorant text-slate-300 text-base leading-relaxed">{moonEnergy}</p>
          <p className="text-xs font-cinzel text-slate-500 mt-2">
            Moon in <span className="text-indigo-300">{moonNakshatra}</span> nakshatra · {moonRashi}
          </p>
        </Section>

        <Section
          title="Today's Opportunity"
          icon={<span className="text-base">🌟</span>}
        >
          <p className="font-cormorant text-emerald-300 text-base font-semibold leading-relaxed">
            {opportunity}
          </p>
          <p className="font-cormorant text-slate-400 text-sm mt-1">
            Your {mahadashaPlanet} Mahadasha opens doors in this area. Act with intention.
          </p>
        </Section>

        <Section
          title="Watch Out"
          icon={<span className="text-base">⚠️</span>}
        >
          <p className="font-cormorant text-amber-300 text-base leading-relaxed">{watchOut}</p>
          <p className="font-cormorant text-slate-400 text-sm mt-1">
            {antardashaPlanet} Antardasha reminder — awareness is your shield.
          </p>
        </Section>

        <Section
          title="Mantra of the Day"
          icon={<span className="text-base">📿</span>}
        >
          <div className="space-y-2">
            <p className="text-xs font-cinzel text-slate-500">{mantraData.planet}</p>
            <p className="font-devanagari text-lg text-gold leading-relaxed">
              {mantraData.devanagari}
            </p>
            <p className="font-cormorant text-slate-400 text-sm italic">
              {mantraData.mantra}
            </p>
            <p className="text-xs font-cormorant text-slate-500">
              Chant 108 times at sunrise for maximum benefit.
            </p>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 text-[10px] font-cinzel text-slate-600 bg-stardust/30 rounded-lg p-2.5">
          <RefreshCw size={10} />
          <span>Horoscope refreshes at midnight · Based on your Kundli birth chart</span>
        </div>
      </div>
    </motion.div>
  )
}
