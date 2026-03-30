// ============================================================
// Cosmic Calendar — Panchanga Data Engine
// Provides monthly calendar data with tithi, nakshatra, yoga,
// karana, vara, festivals, auspiciousness ratings, and more.
// ============================================================

import {
  TITHI_NAMES, TITHI_DEVANAGARI, AUSPICIOUS_TITHIS,
  NAKSHATRA_NAMES, NAKSHATRAS_DEVANAGARI, NAKSHATRA_LORDS,
  AUSPICIOUS_NAKSHATRAS,
  YOGAS_27, YOGAS_DEVANAGARI, AUSPICIOUS_YOGAS,
  KARANAS, KARANAS_DEVANAGARI,
  VARA_NAMES, VARA_ENGLISH, VARA_PLANETS,
  NEW_MOON_EPOCH, LUNAR_CYCLE_MS,
} from '@/lib/vedic-constants'
import type { NakshatraName } from '@/lib/vedic-constants'

// ─── Hindu Month & Vikram Samvat ────────────────────────────────────────────

// The 12 Hindu (Amanta) month names
export const HINDU_MONTHS = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
  'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik',
  'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
]

export const HINDU_MONTHS_DEVANAGARI = [
  'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़',
  'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक',
  'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन',
]

/** Convert Gregorian year to Vikram Samvat year (approximate — varies by region by ±1) */
export function getVikramSamvat(gregorianYear: number, month: number): number {
  // Vikram Samvat is 56–57 years ahead of Gregorian.
  // New year starts at Chaitra Shukla Pratipada (roughly March/April).
  return gregorianYear + (month >= 3 ? 57 : 56)
}

/** Get the Hindu month name for a given Gregorian date (approximate Amanta system) */
export function getHinduMonth(date: Date): { name: string; devanagari: string; index: number } {
  // Approximate: Hindu months lag Gregorian by ~1 month, starting ~mid-month
  // Chaitra ≈ Mar 15 – Apr 14, Vaishakha ≈ Apr 15 – May 14, etc.
  const month = date.getMonth() // 0-indexed
  const day = date.getDate()
  // Shift: if after ~15th, use current Gregorian month offset; before 15th, use previous
  const offset = day >= 15 ? month : (month - 1 + 12) % 12
  // Chaitra starts in March (index 2), so shift by 2
  const hinduIndex = ((offset - 2) + 12) % 12
  return {
    name: HINDU_MONTHS[hinduIndex],
    devanagari: HINDU_MONTHS_DEVANAGARI[hinduIndex],
    index: hinduIndex,
  }
}

// ─── Rahu Kalam ─────────────────────────────────────────────────────────────

// Rahu Kalam duration: 1.5 hours, starts at different times per weekday
// Based on standard 6am–6pm (12hr day) division into 8 parts
// Weekday index 0=Sun, order: [8,2,7,5,6,4,3] as parts (1-indexed out of 8)
const RAHU_KALAM_PARTS = [8, 2, 7, 5, 6, 4, 3] // Sun through Sat

export function getRahuKalam(date: Date, sunriseMins = 360, sunsetMins = 1080): { start: string; end: string } {
  const dayLength = sunsetMins - sunriseMins // in minutes
  const partDuration = dayLength / 8
  const part = RAHU_KALAM_PARTS[date.getDay()] - 1 // 0-indexed
  const startMins = sunriseMins + part * partDuration
  const endMins = startMins + partDuration

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return { start: fmt(startMins), end: fmt(endMins) }
}

// Abhijit Muhurta: the auspicious midday window (~11:48 AM – 12:36 PM)
export function getAbhijitMuhurta(): { start: string; end: string } {
  return { start: '11:48 AM', end: '12:36 PM' }
}

// Yamakantam (inauspicious period)
const YAMAKANTAM_PARTS = [5, 4, 3, 2, 1, 7, 6]
export function getYamakantam(date: Date, sunriseMins = 360, sunsetMins = 1080): { start: string; end: string } {
  const dayLength = sunsetMins - sunriseMins
  const partDuration = dayLength / 8
  const part = YAMAKANTAM_PARTS[date.getDay()] - 1
  const startMins = sunriseMins + part * partDuration
  const endMins = startMins + partDuration
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    const ampm = h < 12 ? 'AM' : 'PM'
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
  }
  return { start: fmt(startMins), end: fmt(endMins) }
}

// ─── Ekadashi Dates 2026 ─────────────────────────────────────────────────────

// Ekadashi = 11th tithi of each paksha (lunar fortnight), twice per month
// These are the actual 2026 Ekadashi dates
export const EKADASHI_2026: { month: number; day: number; name: string; paksha: 'Shukla' | 'Krishna' }[] = [
  { month: 0, day: 6, name: 'Saphala Ekadashi', paksha: 'Krishna' },
  { month: 0, day: 21, name: 'Putrada Ekadashi', paksha: 'Shukla' },
  { month: 1, day: 4, name: 'Shattila Ekadashi', paksha: 'Krishna' },
  { month: 1, day: 19, name: 'Jaya Ekadashi', paksha: 'Shukla' },
  { month: 2, day: 6, name: 'Vijaya Ekadashi', paksha: 'Krishna' },
  { month: 2, day: 21, name: 'Amalaki Ekadashi', paksha: 'Shukla' },
  { month: 3, day: 4, name: 'Papamochani Ekadashi', paksha: 'Krishna' },
  { month: 3, day: 19, name: 'Kamada Ekadashi', paksha: 'Shukla' },
  { month: 4, day: 4, name: 'Varuthini Ekadashi', paksha: 'Krishna' },
  { month: 4, day: 18, name: 'Mohini Ekadashi', paksha: 'Shukla' },
  { month: 5, day: 3, name: 'Apara Ekadashi', paksha: 'Krishna' },
  { month: 5, day: 17, name: 'Nirjala Ekadashi', paksha: 'Shukla' },
  { month: 6, day: 2, name: 'Yogini Ekadashi', paksha: 'Krishna' },
  { month: 6, day: 17, name: 'Devshayani Ekadashi', paksha: 'Shukla' },
  { month: 7, day: 1, name: 'Kamika Ekadashi', paksha: 'Krishna' },
  { month: 7, day: 15, name: 'Shravana Putrada Ekadashi', paksha: 'Shukla' },
  { month: 7, day: 31, name: 'Aja Ekadashi', paksha: 'Krishna' },
  { month: 8, day: 14, name: 'Parsva Ekadashi', paksha: 'Shukla' },
  { month: 8, day: 29, name: 'Indira Ekadashi', paksha: 'Krishna' },
  { month: 9, day: 13, name: 'Papankusha Ekadashi', paksha: 'Shukla' },
  { month: 9, day: 29, name: 'Rama Ekadashi', paksha: 'Krishna' },
  { month: 10, day: 12, name: 'Dev Prabodhini Ekadashi', paksha: 'Shukla' },
  { month: 10, day: 28, name: 'Utpanna Ekadashi', paksha: 'Krishna' },
  { month: 11, day: 11, name: 'Mokshada Ekadashi', paksha: 'Shukla' },
  { month: 11, day: 28, name: 'Saphala Ekadashi', paksha: 'Krishna' },
]

// Purnima (Full Moon) and Amavasya (New Moon) 2026
export const PURNIMA_2026: { month: number; day: number; name: string }[] = [
  { month: 0, day: 13, name: 'Paush Purnima' },
  { month: 1, day: 12, name: 'Magha Purnima' },
  { month: 2, day: 13, name: 'Holi Purnima' },
  { month: 3, day: 12, name: 'Hanuman Jayanti Purnima' },
  { month: 4, day: 12, name: 'Buddha Purnima' },
  { month: 5, day: 10, name: 'Vat Purnima' },
  { month: 6, day: 10, name: 'Guru Purnima' },
  { month: 7, day: 9, name: 'Shravana Purnima / Raksha Bandhan' },
  { month: 8, day: 7, name: 'Bhadrapada Purnima' },
  { month: 9, day: 6, name: 'Sharad Purnima' },
  { month: 10, day: 5, name: 'Kartik Purnima / Dev Deepawali' },
  { month: 11, day: 4, name: 'Margashirsha Purnima' },
]

export const AMAVASYA_2026: { month: number; day: number; name: string }[] = [
  { month: 0, day: 29, name: 'Mauni Amavasya' },
  { month: 1, day: 28, name: 'Maghi Amavasya' },
  { month: 2, day: 28, name: 'Chaitra Amavasya' },
  { month: 3, day: 27, name: 'Vaishakha Amavasya' },
  { month: 4, day: 26, name: 'Jyeshtha Amavasya' },
  { month: 5, day: 25, name: 'Ashadha Amavasya' },
  { month: 6, day: 24, name: 'Shravana Amavasya' },
  { month: 7, day: 23, name: 'Pitru Amavasya / Mahalaya' },
  { month: 8, day: 21, name: 'Ashwin Amavasya' },
  { month: 9, day: 21, name: 'Diwali / Lakshmi Puja' },
  { month: 10, day: 20, name: 'Kartik Amavasya' },
  { month: 11, day: 19, name: 'Margashirsha Amavasya' },
]

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VaraInfo {
  name: string
  english: string
  planet: string
}

export interface TithiInfo {
  index: number
  name: string
  devanagari: string
  paksha: 'Shukla' | 'Krishna'
  isAuspicious: boolean
}

export interface NakshatraInfo {
  index: number
  name: NakshatraName
  devanagari: string
  lord: string
  pada: number
  isAuspicious: boolean
}

export interface YogaInfo {
  name: string
  devanagari: string
  isAuspicious: boolean
}

export interface KaranaInfo {
  name: string
  devanagari: string
  isAuspicious: boolean
}

export interface FestivalInfo {
  name: string
  description: string
  gradient: string
}

export interface CalendarDay {
  date: Date
  day: number
  tithi: TithiInfo
  nakshatra: NakshatraInfo
  yoga: YogaInfo
  karana: KaranaInfo
  vara: VaraInfo
  isAuspicious: boolean
  moonPhase: string
  festivals: FestivalInfo[]
  eclipseWarning: string | null
  // Hindu Calendar additions
  hinduMonth: { name: string; devanagari: string; index: number }
  vikramSamvat: number
  rahuKalam: { start: string; end: string }
  abhijitMuhurta: { start: string; end: string }
  yamakantam: { start: string; end: string }
  isEkadashi: boolean
  ekadashiName?: string
  ekadashiPaksha?: 'Shukla' | 'Krishna'
  isPurnima: boolean
  purnimaName?: string
  isAmavasya: boolean
  amavasyaname?: string
}

// ─── Moon Phase Emoji ───────────────────────────────────────────────────────

const MOON_EMOJIS = ['\u{1F311}', '\u{1F312}', '\u{1F313}', '\u{1F314}', '\u{1F315}', '\u{1F316}', '\u{1F317}', '\u{1F318}']

function getMoonPhaseEmoji(tithiIndex: number): string {
  // Map 30 tithis to 8 moon phase emojis
  if (tithiIndex === 29) return MOON_EMOJIS[0] // Amavasya = New Moon
  if (tithiIndex === 14) return MOON_EMOJIS[4] // Purnima = Full Moon
  if (tithiIndex < 4) return MOON_EMOJIS[1]
  if (tithiIndex < 7) return MOON_EMOJIS[2]
  if (tithiIndex < 11) return MOON_EMOJIS[3]
  if (tithiIndex < 15) return MOON_EMOJIS[4]
  if (tithiIndex < 19) return MOON_EMOJIS[5]
  if (tithiIndex < 22) return MOON_EMOJIS[6]
  if (tithiIndex < 26) return MOON_EMOJIS[7]
  return MOON_EMOJIS[0]
}

// ─── Panchanga Calculation for a Given Date ─────────────────────────────────

function calculatePanchangaForDate(date: Date) {
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
  const now = noon.getTime()
  const dayIndex = noon.getDay()

  // Vara
  const vara: VaraInfo = {
    name: VARA_NAMES[dayIndex],
    english: VARA_ENGLISH[dayIndex],
    planet: VARA_PLANETS[dayIndex],
  }

  // Tithi
  const elapsed = ((now - NEW_MOON_EPOCH) % LUNAR_CYCLE_MS + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS
  const daysSinceNewMoon = elapsed / (24 * 60 * 60 * 1000)
  const tithiRaw = Math.floor((daysSinceNewMoon / 29.530588853) * 30)
  const tithiIndex = ((tithiRaw % 30) + 30) % 30
  const tithiNumber = (tithiIndex < 15 ? tithiIndex + 1 : tithiIndex - 15 + 1)
  const tithi: TithiInfo = {
    index: tithiIndex,
    name: TITHI_NAMES[tithiIndex],
    devanagari: TITHI_DEVANAGARI[tithiIndex],
    paksha: tithiIndex < 15 ? 'Shukla' : 'Krishna',
    isAuspicious: AUSPICIOUS_TITHIS.has(tithiNumber),
  }

  // Nakshatra
  const moonLongitude = ((daysSinceNewMoon * 13.176) % 360 + 360) % 360
  const nakshatraIndex = Math.floor(moonLongitude / 13.333) % 27
  const nakshatra: NakshatraInfo = {
    index: nakshatraIndex,
    name: NAKSHATRA_NAMES[nakshatraIndex],
    devanagari: NAKSHATRAS_DEVANAGARI[nakshatraIndex],
    lord: NAKSHATRA_LORDS[nakshatraIndex],
    pada: Math.floor((moonLongitude % 13.333) / (13.333 / 4)) + 1,
    isAuspicious: AUSPICIOUS_NAKSHATRAS.has(NAKSHATRA_NAMES[nakshatraIndex]),
  }

  // Yoga
  const start = new Date(date.getFullYear(), 0, 0)
  const doy = Math.floor((noon.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  const sunLongitude = ((doy - 80) * 0.9856 + 360) % 360
  const yogaIndex = Math.floor(((sunLongitude + moonLongitude) % 360) / 13.333) % 27
  const yoga: YogaInfo = {
    name: YOGAS_27[yogaIndex],
    devanagari: YOGAS_DEVANAGARI[yogaIndex],
    isAuspicious: AUSPICIOUS_YOGAS.has(YOGAS_27[yogaIndex]),
  }

  // Karana
  const karanaPhase = (daysSinceNewMoon % 0.5) < 0.25
  const karanaRaw = tithiIndex * 2 + (karanaPhase ? 0 : 1)
  const karanaIndex = karanaRaw % 11
  const karana: KaranaInfo = {
    name: KARANAS[karanaIndex],
    devanagari: KARANAS_DEVANAGARI[karanaIndex],
    isAuspicious: KARANAS[karanaIndex] !== 'Vishti',
  }

  // Moon phase emoji
  const moonPhase = getMoonPhaseEmoji(tithiIndex)

  // Overall auspiciousness
  const isAuspicious = tithi.isAuspicious && nakshatra.isAuspicious

  return { vara, tithi, nakshatra, yoga, karana, moonPhase, isAuspicious }
}

// ─── Festival Data ──────────────────────────────────────────────────────────

interface FestivalSeed {
  name: string
  month: number   // 0-indexed
  day: number
  description: string
  gradient: string
}

// 2026 Hindu festival dates (seed data — simplified lookup)
const FESTIVALS_2026: FestivalSeed[] = [
  { name: 'Makar Sankranti', month: 0, day: 14, description: 'Sun enters Capricorn; harvest festival celebrating the northward journey of the Sun.', gradient: 'from-amber-600 to-orange-500' },
  { name: 'Vasant Panchami', month: 1, day: 1, description: 'Spring festival honoring Goddess Saraswati, deity of knowledge and arts.', gradient: 'from-yellow-400 to-amber-500' },
  { name: 'Maha Shivaratri', month: 1, day: 26, description: 'The great night of Lord Shiva; devotees fast and chant Om Namah Shivaya.', gradient: 'from-indigo-600 to-purple-700' },
  { name: 'Holi', month: 2, day: 14, description: 'Festival of colors celebrating the triumph of good over evil and the arrival of spring.', gradient: 'from-pink-500 to-fuchsia-500' },
  { name: 'Ugadi', month: 2, day: 29, description: 'Telugu and Kannada New Year; the beginning of a new Vikram Samvat cycle.', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Ram Navami', month: 3, day: 6, description: 'Birth of Lord Rama, the seventh avatar of Vishnu and hero of the Ramayana.', gradient: 'from-amber-500 to-yellow-400' },
  { name: 'Hanuman Jayanti', month: 3, day: 14, description: 'Birth anniversary of Lord Hanuman, the devoted servant of Lord Rama.', gradient: 'from-orange-500 to-red-500' },
  { name: 'Akshaya Tritiya', month: 4, day: 2, description: 'Eternally auspicious day; considered ideal for new beginnings and gold purchases.', gradient: 'from-yellow-400 to-amber-600' },
  { name: 'Guru Purnima', month: 6, day: 11, description: 'Day to honor spiritual teachers and the sage Vyasa, compiler of the Vedas.', gradient: 'from-violet-500 to-purple-600' },
  { name: 'Raksha Bandhan', month: 7, day: 8, description: 'Sacred thread festival celebrating the bond between siblings.', gradient: 'from-rose-400 to-pink-500' },
  { name: 'Janmashtami', month: 7, day: 16, description: 'Birth of Lord Krishna, the eighth avatar of Vishnu, celebrated with fasting and devotion.', gradient: 'from-blue-600 to-indigo-600' },
  { name: 'Ganesh Chaturthi', month: 8, day: 7, description: 'Birthday of Lord Ganesha, the remover of obstacles; celebrated with clay idols and modak.', gradient: 'from-orange-400 to-red-400' },
  { name: 'Navaratri Begins', month: 9, day: 2, description: 'Nine nights of worship honoring the divine feminine — Durga, Lakshmi, and Saraswati.', gradient: 'from-red-500 to-rose-500' },
  { name: 'Dussehra', month: 9, day: 11, description: 'Victory of Lord Rama over Ravana; celebrates the triumph of dharma over adharma.', gradient: 'from-red-600 to-amber-500' },
  { name: 'Karva Chauth', month: 9, day: 25, description: 'Married women fast from sunrise to moonrise for the longevity of their husbands.', gradient: 'from-rose-500 to-red-400' },
  { name: 'Diwali', month: 9, day: 31, description: 'Festival of lights celebrating the return of Lord Rama to Ayodhya; symbolizes victory of light over darkness.', gradient: 'from-amber-400 to-yellow-300' },
  { name: 'Govardhan Puja', month: 10, day: 1, description: 'Celebrates Krishna lifting Govardhan Hill; devotees prepare mountains of food as offerings.', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Bhai Dooj', month: 10, day: 2, description: 'Sisters pray for the well-being of their brothers; similar to Raksha Bandhan.', gradient: 'from-pink-400 to-rose-400' },
  { name: 'Dev Deepawali', month: 10, day: 15, description: 'Celebrated on Kartik Purnima; the gods descend to bathe in the Ganges.', gradient: 'from-amber-500 to-orange-400' },
]

// Eclipse warnings for 2026
const ECLIPSES_2026: { month: number; day: number; type: string }[] = [
  { month: 1, day: 17, type: 'Total Lunar Eclipse' },
  { month: 7, day: 12, type: 'Partial Lunar Eclipse' },
  { month: 7, day: 28, type: 'Annular Solar Eclipse' },
]

// ─── Public API ─────────────────────────────────────────────────────────────

export function getMonthData(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: CalendarDay[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const panchanga = calculatePanchangaForDate(date)

    // Match festivals
    const festivals: FestivalInfo[] = FESTIVALS_2026
      .filter(f => f.month === month && f.day === d && year === 2026)
      .map(f => ({ name: f.name, description: f.description, gradient: f.gradient }))

    // Eclipse warning
    const eclipse = ECLIPSES_2026.find(e => e.month === month && e.day === d && year === 2026)

    // Hindu calendar data
    const hinduMonth = getHinduMonth(date)
    const vikramSamvat = getVikramSamvat(year, month)
    const rahuKalam = getRahuKalam(date)
    const abhijitMuhurta = getAbhijitMuhurta()
    const yamakantam = getYamakantam(date)

    // Ekadashi
    const ekadashiEntry = year === 2026
      ? EKADASHI_2026.find(e => e.month === month && e.day === d)
      : undefined
    const isEkadashi = !!ekadashiEntry
    if (isEkadashi && ekadashiEntry) {
      festivals.push({
        name: ekadashiEntry.name,
        description: `${ekadashiEntry.paksha} Paksha Ekadashi — sacred fasting day dedicated to Lord Vishnu.`,
        gradient: 'from-blue-600 to-indigo-700',
      })
    }

    // Purnima
    const purnimaEntry = year === 2026
      ? PURNIMA_2026.find(p => p.month === month && p.day === d)
      : undefined
    const isPurnima = !!purnimaEntry
    if (isPurnima && purnimaEntry) {
      festivals.push({
        name: purnimaEntry.name,
        description: 'Full Moon day — auspicious for prayers, fasting, and gratitude.',
        gradient: 'from-slate-400 to-blue-200',
      })
    }

    // Amavasya
    const amavasya = year === 2026
      ? AMAVASYA_2026.find(a => a.month === month && a.day === d)
      : undefined
    const isAmavasya = !!amavasya

    days.push({
      date,
      day: d,
      ...panchanga,
      festivals,
      eclipseWarning: eclipse ? eclipse.type : null,
      hinduMonth,
      vikramSamvat,
      rahuKalam,
      abhijitMuhurta,
      yamakantam,
      isEkadashi,
      ekadashiName: ekadashiEntry?.name,
      ekadashiPaksha: ekadashiEntry?.paksha,
      isPurnima,
      purnimaName: purnimaEntry?.name,
      isAmavasya,
      amavasyaname: amavasya?.name,
    })
  }

  return days
}

export function getFestivals(year: number, _month?: number): (FestivalSeed & { date: Date })[] {
  if (year !== 2026) return []
  const list = _month !== undefined
    ? FESTIVALS_2026.filter(f => f.month === _month)
    : FESTIVALS_2026
  return list.map(f => ({ ...f, date: new Date(year, f.month, f.day) }))
}

export function getUpcomingFestivals(fromDate: Date, count: number): (FestivalSeed & { date: Date; daysAway: number })[] {
  const all = getFestivals(fromDate.getFullYear())
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())

  return all
    .map(f => {
      const festDate = new Date(f.date)
      const diff = Math.ceil((festDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { ...f, daysAway: diff }
    })
    .filter(f => f.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, count)
}

export function getDayRating(day: CalendarDay): number {
  let score = 3 // neutral baseline
  if (day.tithi.isAuspicious) score += 0.5
  if (day.nakshatra.isAuspicious) score += 0.5
  if (day.yoga.isAuspicious) score += 0.5
  if (day.karana.isAuspicious) score += 0.25
  if (!day.karana.isAuspicious) score -= 0.5 // Vishti karana
  if (day.festivals.length > 0) score += 0.5
  if (day.eclipseWarning) score -= 1
  return Math.max(1, Math.min(5, Math.round(score)))
}

export type AuspiciousActivity = { activity: string; good: boolean }

export function getAuspiciousActivities(day: CalendarDay): AuspiciousActivity[] {
  const activities: AuspiciousActivity[] = []
  const rating = getDayRating(day)

  // Positive activities based on panchanga elements
  if (day.tithi.isAuspicious && day.nakshatra.isAuspicious) {
    activities.push({ activity: 'Marriage & Engagements', good: true })
  }
  if (day.nakshatra.isAuspicious) {
    activities.push({ activity: 'Starting New Business', good: true })
    activities.push({ activity: 'Travel', good: true })
  }
  if (day.yoga.isAuspicious) {
    activities.push({ activity: 'Religious Ceremonies', good: true })
    activities.push({ activity: 'Buying Property', good: true })
  }
  if (day.tithi.isAuspicious) {
    activities.push({ activity: 'Griha Pravesh', good: true })
  }
  if (rating >= 4) {
    activities.push({ activity: 'Starting Education', good: true })
    activities.push({ activity: 'Medical Procedures', good: true })
  }

  // Negative indicators
  if (!day.karana.isAuspicious) {
    activities.push({ activity: 'Lending Money', good: false })
    activities.push({ activity: 'Major Purchases', good: false })
  }
  if (day.eclipseWarning) {
    activities.push({ activity: 'Starting New Ventures', good: false })
    activities.push({ activity: 'Surgery', good: false })
  }
  if (!day.tithi.isAuspicious && !day.nakshatra.isAuspicious) {
    activities.push({ activity: 'Marriage Ceremonies', good: false })
    activities.push({ activity: 'Long-distance Travel', good: false })
  }
  if (day.vara.english === 'Tuesday' || day.vara.english === 'Saturday') {
    activities.push({ activity: 'Hair Cutting', good: false })
  }

  // Ensure at least some activities
  if (activities.filter(a => a.good).length === 0) {
    activities.push({ activity: 'Meditation & Reflection', good: true })
    activities.push({ activity: 'Charity & Donations', good: true })
  }
  if (activities.filter(a => !a.good).length === 0) {
    activities.push({ activity: 'Risky Investments', good: false })
  }

  return activities
}

export function getDayColor(day: CalendarDay): 'green' | 'red' | 'yellow' {
  const rating = getDayRating(day)
  if (rating >= 4) return 'green'
  if (rating <= 2) return 'red'
  return 'yellow'
}
