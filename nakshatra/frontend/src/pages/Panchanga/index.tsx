import { useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import {
  Sun,
  Moon,
  Star,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Constants (from shared source) ───────────────────────────────────────────
import {
  VARA_NAMES, VARA_DEVANAGARI, VARA_PLANETS, VARA_PLANET_ICONS,
  VARA_PLANET_COLORS, VARA_PLANET_BG, VARA_ENGLISH,
  TITHI_NAMES, TITHI_DEVANAGARI, AUSPICIOUS_TITHIS,
  NAKSHATRA_NAMES as NAKSHATRAS_27, NAKSHATRAS_DEVANAGARI, NAKSHATRA_LORDS,
  AUSPICIOUS_NAKSHATRAS,
  YOGAS_27, YOGAS_DEVANAGARI, AUSPICIOUS_YOGAS,
  KARANAS, KARANAS_DEVANAGARI,
  RAHU_KALAM_PERIODS, GULIKA_KALAM_PERIODS, YAMAGANDA_PERIODS,
} from '@/lib/vedic-constants'

// Sarvartha Siddhi Yoga combinations (vara day index → qualifying nakshatras)
const SARVARTHA_COMBOS: Record<number, string[]> = {
  0: ['Hasta', 'Pushya', 'Ashwini'],    // Sunday
  1: ['Rohini', 'Mrigashira', 'Hasta'], // Monday
  2: ['Ashwini', 'Krittika'],            // Tuesday
  3: ['Rohini', 'Hasta', 'Ashwini'],    // Wednesday
  4: ['Pushya', 'Ashwini', 'Anuradha'], // Thursday
  5: ['Rohini', 'Anuradha', 'Swati'],   // Friday
  6: ['Rohini', 'Svati', 'Hasta'],      // Saturday
}

// Lunar constants from shared source
import { NEW_MOON_EPOCH, LUNAR_CYCLE_MS } from '@/lib/vedic-constants'

// ─── Calculation Utilities ────────────────────────────────────────────────────

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

function calculatePanchanga() {
  const now = Date.now()
  const today = new Date()
  const dayIndex = today.getDay() // 0=Sunday

  // 1. Vara
  const varaIndex = dayIndex
  const vara = {
    name: VARA_NAMES[varaIndex],
    devanagari: VARA_DEVANAGARI[varaIndex],
    planet: VARA_PLANETS[varaIndex],
    planetIcon: VARA_PLANET_ICONS[varaIndex],
    color: VARA_PLANET_COLORS[varaIndex],
    bg: VARA_PLANET_BG[varaIndex],
    english: VARA_ENGLISH[varaIndex],
    isAuspicious: ![2, 6].includes(varaIndex), // Tue, Sat less favorable
  }

  // 2. Tithi
  const elapsed = (now - NEW_MOON_EPOCH) % LUNAR_CYCLE_MS
  const daysSinceNewMoon = elapsed / (24 * 60 * 60 * 1000)
  const tithiRaw = Math.floor((daysSinceNewMoon / 29.530588853) * 30)
  const tithiIndex = tithiRaw % 30 // 0-29
  const tithiNumber = tithiIndex + 1 // 1-30
  const paksha = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha'
  const pakshaDev = tithiIndex < 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'
  const tithi = {
    number: tithiNumber,
    name: TITHI_NAMES[tithiIndex],
    devanagari: TITHI_DEVANAGARI[tithiIndex],
    paksha,
    pakshaDev,
    isAuspicious: AUSPICIOUS_TITHIS.has(tithiNumber <= 15 ? tithiNumber : tithiNumber - 15),
  }

  // 3. Nakshatra
  const moonLongitude = (daysSinceNewMoon * 13.176) % 360
  const nakshatraIndex = Math.floor(moonLongitude / 13.333) % 27
  const nakshatra = {
    name: NAKSHATRAS_27[nakshatraIndex],
    devanagari: NAKSHATRAS_DEVANAGARI[nakshatraIndex],
    lord: NAKSHATRA_LORDS[nakshatraIndex],
    pada: Math.floor((moonLongitude % 13.333) / (13.333 / 4)) + 1,
    isAuspicious: AUSPICIOUS_NAKSHATRAS.has(NAKSHATRAS_27[nakshatraIndex]),
  }

  // 4. Yoga
  const doy = getDayOfYear(today)
  const sunLongitude = ((doy - 80) * 0.9856 + 360) % 360
  const yogaIndex = Math.floor(((sunLongitude + moonLongitude) % 360) / 13.333) % 27
  const yoga = {
    name: YOGAS_27[yogaIndex],
    devanagari: YOGAS_DEVANAGARI[yogaIndex],
    isAuspicious: AUSPICIOUS_YOGAS.has(YOGAS_27[yogaIndex]),
  }

  // 5. Karana (half-tithi)
  const karanaPhase = (daysSinceNewMoon % (1 / 2)) < (1 / 4)
  const karanaRaw = tithiIndex * 2 + (karanaPhase ? 0 : 1)
  const karanaIndex = karanaRaw % 11
  const karana = {
    name: KARANAS[karanaIndex],
    devanagari: KARANAS_DEVANAGARI[karanaIndex],
    isAuspicious: KARANAS[karanaIndex] !== 'Vishti',
  }

  // Sarvartha Siddhi Yoga check
  const sarvartha = SARVARTHA_COMBOS[dayIndex]?.includes(nakshatra.name) ?? false

  return { vara, tithi, nakshatra, yoga, karana, sarvartha, dayIndex, daysSinceNewMoon }
}

function formatPeriodTime(periodIndex: number): string {
  // Sunrise ~6:00 AM, each period = 1.5 hrs
  const startHour = 6 + (periodIndex - 1) * 1.5
  const endHour = startHour + 1.5
  const fmt = (h: number) => {
    const hr = Math.floor(h)
    const min = Math.round((h - hr) * 60)
    const suffix = hr < 12 ? 'AM' : 'PM'
    const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr
    return `${hr12}:${min.toString().padStart(2, '0')} ${suffix}`
  }
  return `${fmt(startHour)} – ${fmt(endHour)}`
}

function getSanskritDate(): string {
  const months = [
    'Magha', 'Phalguna', 'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
    'Shravana', 'Bhadrapada', 'Ashvina', 'Kartika', 'Margashirsha', 'Pushya',
  ]
  const today = new Date()
  return `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear() + 57} Vikram Samvat`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PangaCardProps {
  devanagari: string
  englishLabel: string
  value: string
  valueDevanagari?: string
  subtitle?: string
  description: string
  isAuspicious: boolean
  icon: React.ElementType
  color: string
  delay: number
}

function PangaCard({
  devanagari, englishLabel, value, valueDevanagari, subtitle,
  description, isAuspicious, icon: Icon, color, delay,
}: PangaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-devanagari text-xs text-white/40 mb-0.5">{devanagari}</div>
          <div className="font-cinzel text-sm text-white/60 uppercase tracking-wider">{englishLabel}</div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className={`font-cinzel text-xl ${color}`}>{value}</div>
        {valueDevanagari && (
          <div className="font-devanagari text-sm text-white/50 mt-0.5">{valueDevanagari}</div>
        )}
        {subtitle && (
          <div className="text-xs text-white/40 font-cormorant mt-1">{subtitle}</div>
        )}
      </div>

      <p className="text-xs text-white/55 font-cormorant leading-relaxed flex-1">{description}</p>

      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-cinzel self-start ${
        isAuspicious
          ? 'bg-green-500/15 text-green-400 border border-green-500/25'
          : 'bg-red-500/15 text-red-400 border border-red-500/25'
      }`}>
        {isAuspicious ? (
          <><CheckCircle2 className="w-3 h-3" /> Auspicious</>
        ) : (
          <><AlertTriangle className="w-3 h-3" /> Inauspicious</>
        )}
      </div>
    </motion.div>
  )
}

interface TimeBlockProps {
  label: string
  time: string
  type: 'auspicious' | 'inauspicious' | 'special'
  icon: React.ElementType
  note?: string
}

function TimeBlock({ label, time, type, icon: Icon, note }: TimeBlockProps) {
  const styles = {
    auspicious: 'bg-green-500/8 border-green-500/20 text-green-400',
    inauspicious: 'bg-red-500/8 border-red-500/20 text-red-400',
    special: 'bg-gold/8 border-gold/20 text-gold',
  }
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles[type]}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-cinzel">{label}</div>
        {note && <div className="text-[10px] opacity-60 font-cormorant">{note}</div>}
      </div>
      <div className="text-sm font-cinzel tabular-nums flex-shrink-0">{time}</div>
    </div>
  )
}

// ─── Week Strip ───────────────────────────────────────────────────────────────

function WeekStrip({ todayIndex }: { todayIndex: number }) {
  const days = VARA_NAMES.map((name, i) => ({
    vara: name,
    short: VARA_ENGLISH[i].slice(0, 3),
    planet: VARA_PLANETS[i],
    icon: VARA_PLANET_ICONS[i],
    color: VARA_PLANET_COLORS[i],
    bg: VARA_PLANET_BG[i],
  }))

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const isToday = i === todayIndex
        return (
          <motion.div
            key={d.vara}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`rounded-xl border p-2 text-center transition-all ${
              isToday ? `${d.bg} ring-1 ring-white/10` : 'border-white/5 bg-white/3'
            }`}
          >
            <div className={`text-lg mb-1 ${!isToday && 'opacity-40'}`}>{d.icon}</div>
            <div className={`text-[9px] font-cinzel mb-0.5 ${isToday ? d.color : 'text-white/30'}`}>
              {d.short}
            </div>
            <div className={`text-[9px] font-cormorant truncate ${isToday ? 'text-white/60' : 'text-white/20'}`}>
              {d.planet}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Panchanga() {
  const { addXP } = useStore()
  const hasAwardedXP = useRef(false)

  const panchanga = useMemo(() => calculatePanchanga(), [])

  useEffect(() => {
    if (hasAwardedXP.current) return
    const key = `panchanga_xp_${new Date().toDateString()}`
    if (localStorage.getItem(key)) return
    hasAwardedXP.current = true
    localStorage.setItem(key, '1')
    addXP(10, 'panchanga_visit')
    toast.success('+10 XP — Panchanga consulted!', { icon: '🪐' })
  }, [addXP])

  const { vara, tithi, nakshatra, yoga, karana, sarvartha, dayIndex } = panchanga

  const rahuPeriod = RAHU_KALAM_PERIODS[dayIndex]
  const gulikaPeriod = GULIKA_KALAM_PERIODS[dayIndex]
  const yamagandaPeriod = YAMAGANDA_PERIODS[dayIndex]

  const today = new Date()
  const englishDate = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sun className="w-6 h-6 text-saffron" />
          <h1 className="font-devanagari text-4xl text-gold-gradient">पञ्चाङ्ग</h1>
          <Moon className="w-6 h-6 text-celestial" />
        </div>
        <div className="font-cinzel text-xl text-champagne tracking-widest mb-3">Panchanga</div>
        <div className="text-sm text-white/50 font-cormorant">{englishDate}</div>
        <div className="text-xs text-saffron/70 font-cormorant mt-1">{getSanskritDate()}</div>
        <div className="mt-3 text-xs text-white/35 font-cormorant italic">
          "The Hindu Almanac — Five Limbs of Sacred Time"
        </div>
      </motion.div>

      {/* ── Sarvartha Siddhi Yoga Banner ── */}
      <AnimatePresence>
        {sarvartha && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gold/15 via-saffron/10 to-gold/15 border border-gold/30 text-center"
          >
            <div className="text-2xl mb-1">✦</div>
            <div className="font-cinzel text-gold text-lg tracking-wider">SARVARTHA SIDDHI YOGA</div>
            <div className="font-devanagari text-saffron text-sm mt-1">सर्वार्थ सिद्धि योग</div>
            <div className="text-xs text-white/60 font-cormorant mt-2">
              A supremely auspicious alignment — {vara.english} with {nakshatra.name} nakshatra.
              All endeavors begun today carry cosmic blessing.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Five Pangas Grid ── */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-cinzel text-sm text-white/40 uppercase tracking-widest mb-4 text-center"
        >
          The Five Limbs — पञ्च अङ्ग
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vara */}
          <PangaCard
            devanagari="वार"
            englishLabel="Vara — Weekday"
            value={vara.name}
            valueDevanagari={vara.devanagari}
            subtitle={`Ruled by ${vara.planet} ${vara.planetIcon}`}
            description={`${vara.planet} governs today's energy and activities. The day carries the essence and vibration of its planetary ruler.`}
            isAuspicious={vara.isAuspicious}
            icon={Sun}
            color={vara.color}
            delay={0.15}
          />

          {/* Tithi */}
          <PangaCard
            devanagari="तिथि"
            englishLabel="Tithi — Lunar Day"
            value={tithi.name}
            valueDevanagari={tithi.devanagari}
            subtitle={`${tithi.paksha} • Tithi ${tithi.number}/30`}
            description={`The ${tithi.paksha} (${tithi.paksha === 'Shukla Paksha' ? 'waxing' : 'waning'} fortnight). ${tithi.number <= 15 ? 'Moon grows in light, building energy and momentum.' : 'Moon recedes inward, ideal for reflection and completion.'}`}
            isAuspicious={tithi.isAuspicious}
            icon={Moon}
            color="text-slate-300"
            delay={0.2}
          />

          {/* Nakshatra */}
          <PangaCard
            devanagari="नक्षत्र"
            englishLabel="Nakshatra — Moon's Asterism"
            value={nakshatra.name}
            valueDevanagari={nakshatra.devanagari}
            subtitle={`Pada ${nakshatra.pada} • Lord: ${nakshatra.lord}`}
            description={`The Moon transits ${nakshatra.name}, one of the 27 lunar mansions. The nakshatra lord ${nakshatra.lord} colors all activities with its qualities today.`}
            isAuspicious={nakshatra.isAuspicious}
            icon={Star}
            color="text-celestial"
            delay={0.25}
          />

          {/* Yoga */}
          <PangaCard
            devanagari="योग"
            englishLabel="Yoga — Soli-Lunar Union"
            value={yoga.name}
            valueDevanagari={yoga.devanagari}
            description={`${yoga.name} yoga is formed by the combined longitudes of Sun and Moon. ${
              yoga.isAuspicious
                ? 'This yoga bestows auspicious energy and supports positive endeavors.'
                : 'This yoga carries challenging vibrations — proceed with caution in new undertakings.'
            }`}
            isAuspicious={yoga.isAuspicious}
            icon={Sparkles}
            color="text-astral"
            delay={0.3}
          />

          {/* Karana */}
          <PangaCard
            devanagari="करण"
            englishLabel="Karana — Half-Tithi"
            value={karana.name}
            valueDevanagari={karana.devanagari}
            description={`${karana.name} karana spans half a lunar day. ${
              karana.name === 'Vishti'
                ? 'Vishti (Bhadra) is considered inauspicious — avoid starting important work during this period.'
                : `${karana.name} is generally conducive for activities requiring its particular energy.`
            }`}
            isAuspicious={karana.isAuspicious}
            icon={Wind}
            color="text-ethereal"
            delay={0.35}
          />

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-dark rounded-2xl p-5 flex flex-col justify-between"
          >
            <div className="font-cinzel text-xs text-white/40 uppercase tracking-widest mb-4">
              Today's Score
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Vara', ok: vara.isAuspicious },
                { label: 'Tithi', ok: tithi.isAuspicious },
                { label: 'Nakshatra', ok: nakshatra.isAuspicious },
                { label: 'Yoga', ok: yoga.isAuspicious },
                { label: 'Karana', ok: karana.isAuspicious },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-white/50 font-cinzel">{label}</span>
                  <span className={`text-[10px] font-cinzel px-2 py-0.5 rounded-full ${
                    ok
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}>
                    {ok ? '✓ Shubha' : '✗ Ashubha'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              {(() => {
                const auspiciousCount = [vara.isAuspicious, tithi.isAuspicious, nakshatra.isAuspicious, yoga.isAuspicious, karana.isAuspicious].filter(Boolean).length
                const label = auspiciousCount >= 4 ? 'Highly Auspicious' : auspiciousCount >= 3 ? 'Moderately Auspicious' : auspiciousCount >= 2 ? 'Mixed' : 'Challenging'
                const color = auspiciousCount >= 4 ? 'text-green-400' : auspiciousCount >= 3 ? 'text-gold' : auspiciousCount >= 2 ? 'text-amber-400' : 'text-red-400'
                return (
                  <div className={`font-cinzel text-sm text-center ${color}`}>
                    {auspiciousCount}/5 — {label}
                  </div>
                )
              })()}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Auspicious Times ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-saffron" />
          <h2 className="font-cinzel text-lg text-champagne">Auspicious Times Today</h2>
        </div>

        <div className="space-y-2.5">
          <TimeBlock
            label="Brahma Muhurta"
            time="4:24 AM – 5:12 AM"
            type="special"
            icon={Star}
            note="96 mins before sunrise — ideal for meditation & study"
          />
          <TimeBlock
            label="Abhijit Muhurta"
            time="11:36 AM – 12:24 PM"
            type="auspicious"
            icon={Sun}
            note="Solar noon window — auspicious for all new beginnings"
          />
          <div className="pt-1 pb-1">
            <div className="text-[10px] font-cinzel text-white/30 uppercase tracking-widest mb-2">
              Inauspicious Periods
            </div>
          </div>
          <TimeBlock
            label={`Rahu Kalam (${vara.english})`}
            time={formatPeriodTime(rahuPeriod)}
            type="inauspicious"
            icon={AlertTriangle}
            note="Avoid starting auspicious activities"
          />
          <TimeBlock
            label="Gulika Kalam"
            time={formatPeriodTime(gulikaPeriod)}
            type="inauspicious"
            icon={AlertTriangle}
            note="Son of Saturn — inauspicious for new work"
          />
          <TimeBlock
            label="Yamaganda Kalam"
            time={formatPeriodTime(yamagandaPeriod)}
            type="inauspicious"
            icon={AlertTriangle}
            note="Avoid travel and important decisions"
          />
        </div>
      </motion.div>

      {/* ── Week View ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-celestial" />
          <h2 className="font-cinzel text-lg text-champagne">Week at a Glance</h2>
        </div>
        <WeekStrip todayIndex={dayIndex} />
        <div className="mt-4 text-xs text-white/30 font-cormorant text-center">
          Each day is ruled by its planetary lord and carries that planet's cosmic energy
        </div>
      </motion.div>

      {/* ── Daily Shloka ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-2xl p-6 bg-gradient-to-br from-celestial/10 to-astral/10 border border-celestial/20 text-center mb-6"
      >
        <Sparkles className="w-5 h-5 text-astral mx-auto mb-3" />
        <div className="font-devanagari text-2xl text-champagne mb-2">
          काल: पचति भूतानि
        </div>
        <div className="font-cormorant text-base text-white/70 italic mb-3">
          "Kālaḥ pacati bhūtāni"
        </div>
        <div className="font-cormorant text-sm text-white/50">
          "Time ripens and cooks all beings" — Mahābhārata
        </div>
        <div className="mt-4 text-xs text-white/30 font-cormorant">
          Reflecting on the nature of time is the first step toward mastering its auspicious currents
        </div>
      </motion.div>

      {/* ── Footer XP note ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-2 text-xs text-white/30 font-cormorant"
      >
        <Zap className="w-3.5 h-3.5 text-gold/40" />
        <span>+10 XP awarded for consulting the Panchanga today</span>
      </motion.div>
    </div>
  )
}
