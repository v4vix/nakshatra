import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, KundliData } from '@/store'
import { generateId } from '@/utils/generateId'
import {
  ChevronLeft, Plus, Star, Clock, MapPin, Calendar, RefreshCw, ChevronDown, ChevronUp,
  Download, Copy, Share2, Check, BarChart3, Shield
} from 'lucide-react'
import { generateChartImage, shareChart, copyChartToClipboard } from '@/lib/chart-share'
import {
  detectYogas, computeAshtakvarga, computeShadbala, detectDoshas,
  RAHU_KETU_INTERPRETATIONS,
  type PlanetInput, type AshtakvargaResult, type ShadbalaResult, type YogaResult, type DoshaResult
} from '@/lib/vedic-calculations'
import { calculateKundli } from '@/services/api'

// ─── Vedic Astrology Data ──────────────────────────────────────────────────

const RASHIS = [
  { id: 1, name: 'Mesha', western: 'Aries', symbol: '♈', ruler: 'Mars', element: 'Fire' },
  { id: 2, name: 'Vrishabha', western: 'Taurus', symbol: '♉', ruler: 'Venus', element: 'Earth' },
  { id: 3, name: 'Mithuna', western: 'Gemini', symbol: '♊', ruler: 'Mercury', element: 'Air' },
  { id: 4, name: 'Karka', western: 'Cancer', symbol: '♋', ruler: 'Moon', element: 'Water' },
  { id: 5, name: 'Simha', western: 'Leo', symbol: '♌', ruler: 'Sun', element: 'Fire' },
  { id: 6, name: 'Kanya', western: 'Virgo', symbol: '♍', ruler: 'Mercury', element: 'Earth' },
  { id: 7, name: 'Tula', western: 'Libra', symbol: '♎', ruler: 'Venus', element: 'Air' },
  { id: 8, name: 'Vrischika', western: 'Scorpio', symbol: '♏', ruler: 'Mars', element: 'Water' },
  { id: 9, name: 'Dhanu', western: 'Sagittarius', symbol: '♐', ruler: 'Jupiter', element: 'Fire' },
  { id: 10, name: 'Makara', western: 'Capricorn', symbol: '♑', ruler: 'Saturn', element: 'Earth' },
  { id: 11, name: 'Kumbha', western: 'Aquarius', symbol: '♒', ruler: 'Saturn', element: 'Air' },
  { id: 12, name: 'Meena', western: 'Pisces', symbol: '♓', ruler: 'Jupiter', element: 'Water' },
]

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

const PLANET_COLORS: Record<string, string> = {
  'Sun': '#FFB347', 'Moon': '#C0C0FF', 'Mars': '#FF6B6B', 'Mercury': '#7DF9FF',
  'Jupiter': '#FFD700', 'Venus': '#FFB6C1', 'Saturn': '#9B87F5',
  'Rahu': '#888', 'Ketu': '#A0522D'
}

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
  'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra', 'Ketu': 'Ke'
}

const PLANET_INTERPRETATIONS: Record<string, Record<string, string>> = {
  Sun: {
    default: 'The Sun represents your soul, ego, and life force. Its placement shapes your core identity and vitality.',
    Mesha: 'Exalted Sun — powerful leadership, dynamic vitality, pioneering spirit. Natural authority and confidence. Government favor likely.',
    Vrishabha: 'Sun in Vrishabha — steady determination, values material security. Artistic sensibilities, fixed in purpose. Wealth through effort.',
    Mithuna: 'Sun in Mithuna — intellectual brilliance, versatile communication. Multiple talents, curious mind. Success in writing or media.',
    Karka: 'Sun in Karka — deep emotional core, protective nature. Strong attachment to home and family. Nurturing leadership style.',
    Simha: 'Own sign — radiant self-expression, natural authority, creative brilliance. Born leader with magnetic personality.',
    Kanya: 'Sun in Kanya — analytical mind, service-oriented. Perfectionist tendencies, health-conscious. Success through attention to detail.',
    Tula: 'Debilitated Sun — challenges with self-assertion; growth through partnerships. Diplomatic nature, seeks balance in all things.',
    Vrischika: 'Sun in Vrischika — intense willpower, transformative energy. Deep researcher, secretive nature. Power through regeneration.',
    Dhanu: 'Sun in Dhanu — philosophical outlook, love of truth and justice. Teaching ability, spiritual inclination. Foreign travel indicated.',
    Makara: 'Sun in Makara — ambitious, disciplined, structured approach. Slow but steady rise. Authority through hard work and persistence.',
    Kumbha: 'Sun in Kumbha — humanitarian ideals, unconventional approach. Scientific mind, social reform. Success through innovation.',
    Meena: 'Sun in Meena — spiritual depth, compassionate nature. Intuitive wisdom, artistic gifts. May lack worldly ambition.',
  },
  Moon: {
    default: 'The Moon governs mind, emotions, and mother. Its placement reveals your emotional nature and mental patterns.',
    Mesha: 'Moon in Mesha — quick emotions, impulsive reactions. Courage in feelings, independent emotionally. Active mind.',
    Vrishabha: 'Exalted Moon — emotional stability, sensory delight, deep nurturing. Strong memory, love of beauty and comfort.',
    Mithuna: 'Moon in Mithuna — restless mind, quick-witted. Emotionally versatile, communicative nature. Many interests.',
    Karka: 'Own sign — highly intuitive, deeply empathetic, strong bonds with home. Natural caretaker, strong maternal instinct.',
    Simha: 'Moon in Simha — proud emotions, need for recognition. Creative expression, generous heart. Love of drama.',
    Kanya: 'Moon in Kanya — analytical emotions, health-conscious mind. Worry tendency, but excellent problem-solving instincts.',
    Tula: 'Moon in Tula — harmonious emotions, need for partnership. Diplomatic mind, aesthetic sensibilities. Social charm.',
    Vrischika: 'Debilitated Moon — intense emotions, deep psychological insight. Transformative inner life, powerful intuition.',
    Dhanu: 'Moon in Dhanu — optimistic emotions, philosophical mind. Love of adventure and learning. Expansive inner world.',
    Makara: 'Moon in Makara — controlled emotions, practical mind. Ambitious feelings, structured inner life. Late emotional blooming.',
    Kumbha: 'Moon in Kumbha — detached emotions, humanitarian concerns. Innovative mind, group-oriented feelings.',
    Meena: 'Moon in Meena — deeply sensitive, intuitive, spiritual emotions. Artistic imagination, compassionate heart.',
  },
  Mars: {
    default: 'Mars governs energy, courage, and drive. Its placement shows how you take action and assert yourself.',
    Mesha: 'Own sign — bold, pioneering, tireless energy. Natural warrior, competitive spirit. Quick action, physical strength.',
    Vrishabha: 'Mars in Vrishabha — determined energy, persistent effort. Financial drive, sensual passion. Slow to anger but formidable.',
    Mithuna: 'Mars in Mithuna — mental energy, verbal assertiveness. Sharp debater, technical skills. Action through communication.',
    Karka: 'Debilitated Mars — scattered energy; emotions drive action. Protective instincts, domestic drive. Channel feelings into purpose.',
    Simha: 'Mars in Simha — confident action, leadership drive. Creative energy, dramatic courage. Natural authority in action.',
    Kanya: 'Mars in Kanya — precise action, technical skill. Health focus, service through effort. Analytical approach to conflict.',
    Tula: 'Mars in Tula — diplomatic action, balanced assertion. Partnership energy, legal skills. Action refined by fairness.',
    Vrischika: 'Own sign — intense drive, strategic power. Fearless in crisis, transformative action. Deep reserves of strength.',
    Dhanu: 'Mars in Dhanu — righteous action, philosophical courage. Adventurous drive, teaching with passion. Crusader energy.',
    Makara: 'Exalted Mars — disciplined, strategic, formidable willpower. Professional ambition, structured courage. Peak achievement drive.',
    Kumbha: 'Mars in Kumbha — humanitarian action, innovative drive. Group energy, unconventional methods. Technology-oriented.',
    Meena: 'Mars in Meena — spiritual action, compassionate drive. Artistic energy, intuitive courage. Action guided by dreams.',
  },
  Mercury: {
    default: 'Mercury governs intellect, communication, and commerce. It shapes how you think, learn, and express ideas.',
    Mesha: 'Mercury in Mesha — quick thinking, impulsive speech. Sharp mind, competitive intellect. Fast learner.',
    Vrishabha: 'Mercury in Vrishabha — practical intellect, methodical thinking. Financial acumen, artistic communication.',
    Mithuna: 'Own sign — brilliant communicator, versatile mind. Writing talent, business sense. Multiple skills and interests.',
    Karka: 'Mercury in Karka — emotionally intelligent, intuitive thinking. Good memory, empathetic communication.',
    Simha: 'Mercury in Simha — creative intellect, authoritative speech. Dramatic communication, big-picture thinking.',
    Kanya: 'Exalted + Own sign — analytical genius, precise communication. Scientific mind, detail-oriented. Master of craft.',
    Tula: 'Mercury in Tula — diplomatic communication, balanced judgment. Negotiation skill, aesthetic intelligence.',
    Vrischika: 'Mercury in Vrischika — penetrating mind, research ability. Secretive communication, psychological insight.',
    Dhanu: 'Mercury in Dhanu — philosophical thinking, teaching ability. Broad knowledge, ethical communication.',
    Makara: 'Mercury in Makara — structured thinking, business mind. Practical communication, organizational intelligence.',
    Kumbha: 'Mercury in Kumbha — innovative thinking, scientific mind. Humanitarian communication, tech-savvy.',
    Meena: 'Debilitated Mercury — intuitive over logical. Imaginative mind, spiritual communication. Poetic expression.',
  },
  Jupiter: {
    default: 'Jupiter is the great benefic — wisdom, fortune, expansion, spirituality, and children.',
    Mesha: 'Jupiter in Mesha — pioneering wisdom, courageous faith. Independent spiritual path. Quick to teach.',
    Vrishabha: 'Jupiter in Vrishabha — material abundance, grounded wisdom. Financial good fortune, love of comfort.',
    Mithuna: 'Jupiter in Mithuna — intellectual expansion, versatile knowledge. Writing fortune, communicative teaching.',
    Karka: 'Exalted Jupiter — supreme blessings. Deep wisdom, emotional generosity, nurturing abundance. Greatest fortune.',
    Simha: 'Jupiter in Simha — regal wisdom, creative abundance. Leadership blessings, generous heart. Fame likely.',
    Kanya: 'Jupiter in Kanya — practical wisdom, analytical expansion. Service-oriented growth, health knowledge.',
    Tula: 'Jupiter in Tula — balanced wisdom, partnership blessings. Diplomatic expansion, artistic fortune.',
    Vrischika: 'Jupiter in Vrischika — transformative wisdom, deep occult knowledge. Research fortune, hidden blessings.',
    Dhanu: 'Own sign — philosophical genius, spiritual mastery. Teaching fortune, religious depth. Dharmic life.',
    Makara: 'Debilitated Jupiter — delayed blessings, practical spirituality. Hard-earned wisdom, structured growth.',
    Kumbha: 'Jupiter in Kumbha — humanitarian wisdom, innovative expansion. Group blessings, social fortune.',
    Meena: 'Own sign — mystical wisdom, compassionate abundance. Spiritual fortune, intuitive knowledge. Liberation path.',
  },
  Venus: {
    default: 'Venus governs love, beauty, luxury, creativity, and relationships. It reveals your romantic nature.',
    Mesha: 'Venus in Mesha — passionate love, impulsive romance. Bold in relationships, active creativity.',
    Vrishabha: 'Own sign — supreme luxury, sensual beauty. Artistic mastery, stable love. Material comfort and charm.',
    Mithuna: 'Venus in Mithuna — intellectual romance, witty charm. Social butterfly, versatile creativity.',
    Karka: 'Venus in Karka — nurturing love, domestic beauty. Emotional romance, homely comforts.',
    Simha: 'Venus in Simha — dramatic romance, creative luxury. Generous love, theatrical beauty.',
    Kanya: 'Debilitated Venus — critical in love, practical romance. Service through beauty, health aesthetics.',
    Tula: 'Own sign — harmonious love, refined beauty. Perfect partnerships, artistic excellence. Social grace.',
    Vrischika: 'Venus in Vrischika — intense passion, transformative love. Deep romance, magnetic attraction.',
    Dhanu: 'Venus in Dhanu — adventurous love, philosophical beauty. Foreign romance, spiritual creativity.',
    Makara: 'Venus in Makara — mature love, structured beauty. Status-oriented romance, enduring relationships.',
    Kumbha: 'Venus in Kumbha — unconventional love, humanitarian beauty. Progressive romance, unique aesthetics.',
    Meena: 'Exalted Venus — divine love, transcendent beauty. Artistic genius, compassionate romance. Soulmate connections.',
  },
  Saturn: {
    default: 'Saturn is the great teacher — discipline, karma, delays, and ultimately mastery through perseverance.',
    Mesha: 'Debilitated Saturn — frustrated discipline, impatient lessons. Learning patience through hardship.',
    Vrishabha: 'Saturn in Vrishabha — patient wealth-building, enduring values. Slow but lasting material success.',
    Mithuna: 'Saturn in Mithuna — disciplined communication, structured learning. Technical mastery, serious mind.',
    Karka: 'Saturn in Karka — emotional discipline, duty to family. Delayed domestic happiness, deep care.',
    Simha: 'Saturn in Simha — challenged ego, humble leadership. Authority earned through service.',
    Kanya: 'Saturn in Kanya — methodical service, health discipline. Analytical mastery, practical perfection.',
    Tula: 'Exalted Saturn — supreme justice, diplomatic mastery. Balanced discipline, partnership karma fulfilled.',
    Vrischika: 'Saturn in Vrischika — deep karmic transformation, research discipline. Occult mastery through struggle.',
    Dhanu: 'Saturn in Dhanu — philosophical discipline, tested faith. Teaching through experience, religious duty.',
    Makara: 'Own sign — masterful discipline, peak ambition. Career authority, structured power. Long-term legacy.',
    Kumbha: 'Own sign — humanitarian discipline, social responsibility. Innovative structures, group leadership.',
    Meena: 'Saturn in Meena — spiritual discipline, karmic completion. Compassionate service, transcendent duty.',
  },
  Rahu: {
    default: 'Rahu represents worldly desires, ambition, and unconventional paths. It amplifies whatever it touches.',
    ...RAHU_KETU_INTERPRETATIONS.Rahu,
  },
  Ketu: {
    default: 'Ketu represents spiritual liberation, past-life wisdom, and detachment. It brings intuitive insight.',
    ...RAHU_KETU_INTERPRETATIONS.Ketu,
  },
}

const HOUSE_SIGNIFICATIONS: Record<number, { name: string; rules: string }> = {
  1: { name: 'Lagna', rules: 'Self, personality, health, appearance, beginnings' },
  2: { name: 'Dhana', rules: 'Wealth, family, speech, food, early education' },
  3: { name: 'Sahaja', rules: 'Siblings, courage, communication, short travels' },
  4: { name: 'Sukha', rules: 'Mother, home, vehicles, comfort, education' },
  5: { name: 'Putra', rules: 'Children, creativity, intelligence, romance, past merit' },
  6: { name: 'Ripu', rules: 'Enemies, disease, debts, service, competition' },
  7: { name: 'Kalatra', rules: 'Marriage, partnerships, business, foreign travel' },
  8: { name: 'Ayu', rules: 'Longevity, transformation, inheritance, occult, hidden' },
  9: { name: 'Dharma', rules: 'Father, fortune, religion, higher learning, guru' },
  10: { name: 'Karma', rules: 'Career, status, authority, government, public life' },
  11: { name: 'Labha', rules: 'Gains, income, friends, elder siblings, aspirations' },
  12: { name: 'Vyaya', rules: 'Losses, expenses, liberation, foreign lands, sleep' },
}

const DASHA_DESCRIPTIONS: Record<string, string> = {
  Sun: 'Period of self-assertion, authority, government dealings, and vitality. Father figures prominent. Soul-level growth.',
  Moon: 'Period of emotional growth, mother, home changes, and public life. Mental peace sought. Nurturing energy increases.',
  Mars: 'Period of energy, courage, property matters, and siblings. Drive for achievement. May bring conflicts or surgery.',
  Mercury: 'Period of intellect, business, education, and communication. Writing, trading, and learning excel. Nervous energy.',
  Jupiter: 'Period of wisdom, expansion, fortune, and spirituality. Marriage, children, and guru blessings. Most auspicious dasha.',
  Venus: 'Period of love, luxury, creativity, and relationships. Material comforts increase. Art, music, and romance flourish.',
  Saturn: 'Period of discipline, hard work, delays, and karma. Slow but lasting achievements. Health and responsibility focus.',
  Rahu: 'Period of worldly ambition, unconventional paths, and foreign connections. Sudden changes. Material pursuit intensifies.',
  Ketu: 'Period of spiritual awakening, detachment, and past-life resolution. Intuition increases. May feel loss or confusion.',
}

// Vedic aspects: each planet aspects the 7th house, Mars also 4th & 8th, Jupiter 5th & 9th, Saturn 3rd & 10th
function getPlanetAspects(planetName: string, houseNumber: number): number[] {
  const aspects = [(houseNumber % 12) + 1 <= 12 ? ((houseNumber + 6) % 12) + 1 : 7] // 7th always
  const h7 = ((houseNumber + 6 - 1) % 12) + 1
  const result = [h7]
  if (planetName === 'Mars') {
    result.push(((houseNumber + 3 - 1) % 12) + 1) // 4th
    result.push(((houseNumber + 7 - 1) % 12) + 1) // 8th
  }
  if (planetName === 'Jupiter') {
    result.push(((houseNumber + 4 - 1) % 12) + 1) // 5th
    result.push(((houseNumber + 8 - 1) % 12) + 1) // 9th
  }
  if (planetName === 'Saturn') {
    result.push(((houseNumber + 2 - 1) % 12) + 1) // 3rd
    result.push(((houseNumber + 9 - 1) % 12) + 1) // 10th
  }
  if (planetName === 'Rahu') {
    result.push(((houseNumber + 4 - 1) % 12) + 1) // 5th
    result.push(((houseNumber + 8 - 1) % 12) + 1) // 9th
  }
  return result
}

function getDignityStrength(dignity: string): number {
  switch (dignity) {
    case 'Exalted': return 100
    case 'Own': return 80
    case 'Friendly': return 65
    case 'Neutral': return 45
    case 'Enemy': return 25
    case 'Debilitated': return 10
    default: return 45
  }
}

const YOGA_ICONS: Record<string, string> = {
  // Pancha Mahapurusha
  'Ruchaka Yoga': '⚔️', 'Bhadra Yoga': '💎', 'Hamsa Yoga': '🦢', 'Malavya Yoga': '🌸', 'Sasa Yoga': '🪐',
  // Chandra Yogas
  'Gajakesari Yoga': '🐘', 'Chandra-Mangal Yoga': '🌙', 'Sunapha Yoga': '🌓', 'Anapha Yoga': '🌒',
  'Durudhara Yoga': '🌕', 'Kemadruma Yoga': '🌑', 'Adhi Yoga': '👑', 'Amala Yoga': '🏆',
  // Solar Yogas
  'Budhaditya Yoga': '☀️', 'Vesi Yoga': '🌅', 'Vasi Yoga': '🌄', 'Ubhayachari Yoga': '🌞',
  // Raj Yogas
  'Raja Yoga': '🔱', 'Dharma-Karma Adhipati Yoga': '☸️', 'Viparita Raja Yoga': '🔄',
  'Neechabhanga Raja Yoga': '🏔️', 'Lakshmi Yoga': '🪷', 'Saraswati Yoga': '📚', 'Parijata Yoga': '🌺',
  // Dhana Yogas
  'Dhana Yoga': '💰', 'Dhana Yoga (2nd Lord)': '💰', 'Dhana Yoga (11th Lord)': '💰',
  // Spiritual
  'Sanyasa Yoga': '🙏', 'Pravrajya Yoga': '🧘', 'Moksha Yoga': '🕉️', 'Tapasvi Yoga': '🔥',
  // Negative
  'Kaal Sarpa Dosha': '🐍', 'Grahan Yoga': '🌘', 'Shakata Yoga': '🎡', 'Daridra Yoga': '⚠️',
  // Misc
  'Akhanda Samrajya Yoga': '🏛️', 'Chaturmukha Yoga': '🗿', 'Kahala Yoga': '🦁',
  'Mahabhagya Yoga': '🌟', 'Pushkala Yoga': '🌊', 'Dharma Karma Yoga': '☸️',
  'default': '✨',
}

const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 }

// ─── Sidereal Sun Sign Calculation ────────────────────────────────────────

function getSiderealSunSign(month: number, day: number): number {
  const ranges = [
    { rashi: 1, from: [4, 13], to: [5, 14] },
    { rashi: 2, from: [5, 15], to: [6, 14] },
    { rashi: 3, from: [6, 15], to: [7, 15] },
    { rashi: 4, from: [7, 16], to: [8, 16] },
    { rashi: 5, from: [8, 17], to: [9, 16] },
    { rashi: 6, from: [9, 17], to: [10, 16] },
    { rashi: 7, from: [10, 17], to: [11, 15] },
    { rashi: 8, from: [11, 16], to: [12, 15] },
    { rashi: 9, from: [12, 16], to: [1, 13] },
    { rashi: 10, from: [1, 14], to: [2, 12] },
    { rashi: 11, from: [2, 13], to: [3, 12] },
    { rashi: 12, from: [3, 13], to: [4, 12] },
  ]

  const d = month * 100 + day
  for (const r of ranges) {
    const from = r.from[0] * 100 + r.from[1]
    const to = r.to[0] * 100 + r.to[1]
    if (from <= to) {
      if (d >= from && d <= to) return r.rashi
    } else {
      if (d >= from || d <= to) return r.rashi
    }
  }
  return 12
}

// ─── Karmic Axis: Rahu/Ketu house meanings ─────────────────────────────────

const RAHU_HOUSE_MEANINGS: Record<number, { title: string; meaning: string; desire: string }> = {
  1:  { title: 'Rahu in 1st — The Transformer', meaning: 'Soul drives toward self-reinvention. You are meant to develop a powerful, magnetic personality this lifetime. Identity itself is your area of karmic growth.', desire: 'Fame, recognition, a distinctive self-image.' },
  2:  { title: 'Rahu in 2nd — The Accumulator', meaning: 'Karmic hunger for wealth, speech, and family legacy. You are learning to build material foundations and articulate truth with authority.', desire: 'Wealth, eloquence, a powerful voice.' },
  3:  { title: 'Rahu in 3rd — The Communicator', meaning: 'Destined for bold self-expression, writing, media, and short journeys. Courage in communication is the soul\'s dharmic call.', desire: 'Influence through words, siblings, and media.' },
  4:  { title: 'Rahu in 4th — The Homebuilder', meaning: 'Karmic drive toward domestic security, property, and emotional roots. Foreign lands or unconventional homes often become meaningful.', desire: 'Emotional security, real estate, a sense of belonging.' },
  5:  { title: 'Rahu in 5th — The Creator', meaning: 'Soul craves creative expression, children, romance, and speculation. Intelligence and artistic gifts are amplified — and must be expressed honestly.', desire: 'Love, children, creative fame, intellectual brilliance.' },
  6:  { title: 'Rahu in 6th — The Healer-Warrior', meaning: 'Karmic path through service, health, enemies, and daily discipline. You overcome obstacles through sheer persistence and unconventional methods.', desire: 'Mastery over disease, enemies, and daily work.' },
  7:  { title: 'Rahu in 7th — The Relationship Seeker', meaning: 'Soul destiny is woven through partnerships — romantic, business, and social. The partner often comes from a different culture or background.', desire: 'A powerful, transformative life partner.' },
  8:  { title: 'Rahu in 8th — The Occultist', meaning: 'Deep karmic drive toward hidden knowledge, transformation, and inheritance. Research into occult sciences, tantra, or other people\'s resources beckons.', desire: 'Occult mastery, longevity, hidden wealth.' },
  9:  { title: 'Rahu in 9th — The Seeker', meaning: 'Dharmic path through higher education, philosophy, foreign cultures, and teachers. Conventional religion may be questioned and replaced with direct experience.', desire: 'Wisdom, guru, foreign travel, philosophical fame.' },
  10: { title: 'Rahu in 10th — The Achiever', meaning: 'Perhaps the most powerful placement for material ambition. Soul is driven toward professional recognition, public status, and leaving a lasting legacy.', desire: 'Power, career pinnacle, societal recognition.' },
  11: { title: 'Rahu in 11th — The Networker', meaning: 'Karmic gain through large networks, elder siblings, and fulfillment of ambitious desires. Technology, social groups, and unconventional income sources favor you.', desire: 'Abundant gains, influential social circles, bold dreams fulfilled.' },
  12: { title: 'Rahu in 12th — The Wanderer', meaning: 'Soul karma is worked out in foreign lands, ashrams, hospitals, or through spiritual practice. Loss and isolation are initiations that lead to liberation.', desire: 'Moksha, spiritual breakthrough, foreign settlement.' },
}

const KETU_HOUSE_MEANINGS: Record<number, { title: string; meaning: string; release: string }> = {
  1:  { title: 'Ketu in 1st — Past Identity Released', meaning: 'You carry deep past-life wisdom about the self, but must release ego-attachment this lifetime. Spiritual awareness comes naturally; worldly assertiveness requires effort.', release: 'Ego, vanity, over-identification with the physical body.' },
  2:  { title: 'Ketu in 2nd — Past Wealth Released', meaning: 'In past lives, you accumulated wealth and family knowledge. Now you must learn to give freely and not hoard. Spiritual speech has more power than material accumulation.', release: 'Attachment to money, family traditions, possessions.' },
  3:  { title: 'Ketu in 3rd — Past Courage Released', meaning: 'You\'ve been courageous and communicative in past lives. Now the lesson is to communicate from the heart rather than just for effect. Siblings may feel distant.', release: 'Shallow communication, aggression for its own sake.' },
  4:  { title: 'Ketu in 4th — Past Home Released', meaning: 'Past lives were built around home and mother. This life, inner security must come from within — not from property or family. Spiritual awakening often happens through domestic loss.', release: 'Dependency on home, mother, or material comforts.' },
  5:  { title: 'Ketu in 5th — Past Creativity Released', meaning: 'Creative expression and romance were mastered in past lifetimes. Now you must use that creative intelligence for spiritual or humanitarian purposes rather than personal pleasure.', release: 'Ego-based creativity, romantic attachment, speculation.' },
  6:  { title: 'Ketu in 6th — Past Service Released', meaning: 'Lifetimes of service and health work have given you innate healing ability. Past enemies are resolved; you naturally disarm conflicts. The path forward is through higher knowledge.', release: 'Perpetual conflict, over-service, health obsession.' },
  7:  { title: 'Ketu in 7th — Past Partnerships Released', meaning: 'Deep past-life experiences with partnerships make you spiritually wise about relationships. Yet detachment from partners may cause distance. Marriage is karmic and complex.', release: 'Dependency on others, fear of being alone.' },
  8:  { title: 'Ketu in 8th — Past Occult Released', meaning: 'Occult knowledge and deep transformations were mastered before. You have natural intuition about the unseen. This lifetime is about using that wisdom in service, not power.', release: 'Fear of death, power over others through hidden knowledge.' },
  9:  { title: 'Ketu in 9th — Past Wisdom Released', meaning: 'Previous lifetimes were spent in temples, ashrams, and philosophical study. Now that dharmic foundation is complete — life calls you to translate wisdom into action.', release: 'Dogmatic religiosity, teacher-dependency, orthodoxy.' },
  10: { title: 'Ketu in 10th — Past Career Released', meaning: 'Professional mastery and public status were achieved before. This life, inner spiritual purpose must replace external achievement. Career may feel hollow unless spiritually driven.', release: 'Status seeking, external validation, corporate identity.' },
  11: { title: 'Ketu in 11th — Past Gains Released', meaning: 'Material gains and social networks were well-developed in past lives. This lifetime, the soul learns that true fulfillment is spiritual rather than social or material.', release: 'Greed, attachment to outcomes, social climbing.' },
  12: { title: 'Ketu in 12th — The Liberated Soul', meaning: 'Ketu is extremely powerful here — you carry deep past-life spiritual merit. Moksha is very near. Dreams, intuition, and meditation are exceptionally strong. Loss leads to liberation.', release: 'Fear of the unknown, resistance to surrender.' },
}

// Yogakaraka: planet owning both a kendra (1,4,7,10) AND a trikona (1,5,9) = highest benefic
// (1st house is both, so Lagna lord counts as partial — only listed for clear dual-ownership cases)
const YOGAKARAKA_BY_LAGNA: Record<string, string | null> = {
  'Mesha':    null,
  'Vrishabha': 'Saturn',  // owns 9th (trikona) + 10th (kendra)
  'Mithuna':  null,
  'Karka':    'Mars',     // owns 5th (trikona) + 10th (kendra)
  'Simha':    'Mars',     // owns 4th (kendra)  + 9th (trikona)
  'Kanya':    null,
  'Tula':     'Saturn',   // owns 4th (kendra)  + 5th (trikona)
  'Vrishchika': null,
  'Dhanu':    null,
  'Makara':   'Venus',    // owns 5th (trikona) + 10th (kendra)
  'Kumbha':   'Venus',    // owns 4th (kendra)  + 9th (trikona)
  'Meena':    null,
}

// Parivartana Yoga: two planets in each other's own signs (sign exchange)
const PLANET_SIGNS: Record<string, number[]> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5],
  Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10],
}

function detectParivartana(planets: KundliData['planets']): { planetA: string; planetB: string; houses: [number, number] }[] {
  const result: { planetA: string; planetB: string; houses: [number, number] }[] = []
  const pByName = Object.fromEntries(planets.map(p => [p.name, p]))
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const a = pByName[planetNames[i]]
      const b = pByName[planetNames[j]]
      if (!a || !b) continue
      const aOwnsB = PLANET_SIGNS[planetNames[i]]?.includes(b.rashiIndex) ?? false
      const bOwnsA = PLANET_SIGNS[planetNames[j]]?.includes(a.rashiIndex) ?? false
      if (aOwnsB && bOwnsA) {
        result.push({ planetA: planetNames[i], planetB: planetNames[j], houses: [a.houseNumber, b.houseNumber] })
      }
    }
  }
  return result
}

// ─── Karmic Axis Section Component ─────────────────────────────────────────

function KarmicAxisSection({ kundli }: { kundli: KundliData }) {
  const rahu = kundli.planets.find(p => p.name === 'Rahu')
  const ketu = kundli.planets.find(p => p.name === 'Ketu')
  if (!rahu || !ketu) return null
  const rahuMeaning = RAHU_HOUSE_MEANINGS[rahu.houseNumber]
  const ketuMeaning = KETU_HOUSE_MEANINGS[ketu.houseNumber]
  const lagnaName = RASHIS[kundli.ascendant.rashiIndex]?.name ?? ''
  const yogakaraka = YOGAKARAKA_BY_LAGNA[lagnaName]
  const parivartanas = detectParivartana(kundli.planets)

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-cinzel text-sm text-violet-400/80 uppercase tracking-wider">Karmic Axis — Rahu & Ketu</h3>
      <p className="text-xs font-cormorant text-slate-500 leading-relaxed">
        Rahu shows your soul's dharmic <em>hunger</em> this lifetime. Ketu shows what you've already mastered — and must now release.
      </p>

      {/* Rahu */}
      {rahuMeaning && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">☊</span>
            <span className="font-cinzel text-sm text-violet-300">House {rahu.houseNumber} — {rahuMeaning.title.split('—')[1].trim()}</span>
          </div>
          <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{rahuMeaning.meaning}</p>
          <p className="text-xs text-violet-400/70 mt-2 font-cinzel">Karmic desire: {rahuMeaning.desire}</p>
        </div>
      )}

      {/* Ketu */}
      {ketuMeaning && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">☋</span>
            <span className="font-cinzel text-sm text-orange-300">House {ketu.houseNumber} — {ketuMeaning.title.split('—')[1].trim()}</span>
          </div>
          <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{ketuMeaning.meaning}</p>
          <p className="text-xs text-orange-400/70 mt-2 font-cinzel">Must release: {ketuMeaning.release}</p>
        </div>
      )}

      {/* Yogakaraka */}
      {yogakaraka && (
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 flex items-start gap-3">
          <span className="text-xl">⭐</span>
          <div>
            <p className="font-cinzel text-sm text-gold">Yogakaraka: {yogakaraka}</p>
            <p className="text-xs font-cormorant text-slate-400 mt-1">
              {yogakaraka} rules both a trikona and a kendra from your {lagnaName} Lagna, making it the single most powerful planet in your chart for material and spiritual success. Strengthen it.
            </p>
          </div>
        </div>
      )}

      {/* Parivartana Yogas */}
      {parivartanas.length > 0 && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="font-cinzel text-xs text-cyan-400 uppercase tracking-wider mb-2">Parivartana Yoga (Sign Exchange)</p>
          {parivartanas.map(pv => (
            <p key={`${pv.planetA}-${pv.planetB}`} className="font-cormorant text-sm text-slate-300">
              <span className="text-cyan-300">{pv.planetA} ↔ {pv.planetB}</span>
              {' '}(Houses {pv.houses[0]} & {pv.houses[1]}) — these planets act as if conjunct, powerfully linking the themes of both houses.
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function computeMockKundli(birthDate: string, birthTime: string, birthPlace: string, name: string): KundliData {
  // Parse date parts directly to avoid UTC timezone shift (new Date('YYYY-MM-DD') parses as UTC)
  const [year, month, day] = birthDate.split('-').map(Number)
  // Parse time — include in seed for time-sensitive calculations
  const [hours, minutes] = (birthTime || '12:00').split(':').map(Number)

  const seed = year * 10000 + month * 100 + day + hours * 60 + minutes
  const rng = (n: number) => ((seed * 1103515245 + n * 12345) >>> 0) % 12

  const sunRashi = getSiderealSunSign(month, day)
  // Ascendant changes roughly every 2 hours — incorporate birth time
  const ascRashi = ((sunRashi + Math.floor(hours / 2) + rng(1)) % 12) + 1
  const moonRashi = ((sunRashi + rng(2) + 4) % 12) + 1
  const nakshatraIdx = (seed + day * 3) % 27

  const houseFor = (base: number, offset: number) => ((base + offset - 1) % 12) + 1

  const planets = [
    { grahaId: 1, name: 'Sun', rashiIndex: sunRashi - 1, houseNumber: houseFor(ascRashi, sunRashi - ascRashi + 12), degree: day + 5.3, nakshatraIndex: nakshatraIdx, pada: ((day % 4) + 1), isRetrograde: false, dignity: sunRashi === 1 ? 'Exalted' : sunRashi === 7 ? 'Debilitated' : 'Neutral' },
    { grahaId: 2, name: 'Moon', rashiIndex: moonRashi - 1, houseNumber: houseFor(ascRashi, moonRashi - ascRashi + 12), degree: day * 1.3 % 30, nakshatraIndex: (nakshatraIdx + 3) % 27, pada: ((day * 2) % 4 + 1), isRetrograde: false, dignity: moonRashi === 2 ? 'Exalted' : moonRashi === 8 ? 'Debilitated' : 'Neutral' },
    { grahaId: 3, name: 'Mars', rashiIndex: rng(3), houseNumber: houseFor(ascRashi, rng(3) + 1), degree: 14.7 + rng(4), nakshatraIndex: (nakshatraIdx + 6) % 27, pada: 2, isRetrograde: false, dignity: rng(3) === 3 ? 'Exalted' : rng(3) === 9 ? 'Debilitated' : 'Own' },
    { grahaId: 4, name: 'Mercury', rashiIndex: ((sunRashi + 1) % 12), houseNumber: houseFor(ascRashi, 2), degree: 22.1, nakshatraIndex: (nakshatraIdx + 9) % 27, pada: 3, isRetrograde: seed % 5 === 0, dignity: 'Friendly' },
    { grahaId: 5, name: 'Jupiter', rashiIndex: rng(5), houseNumber: houseFor(ascRashi, rng(5)), degree: 8.9 + rng(6), nakshatraIndex: (nakshatraIdx + 12) % 27, pada: 1, isRetrograde: seed % 4 === 0, dignity: rng(5) === 3 ? 'Exalted' : rng(5) === 9 ? 'Debilitated' : 'Neutral' },
    { grahaId: 6, name: 'Venus', rashiIndex: rng(7), houseNumber: houseFor(ascRashi, rng(7)), degree: 17.4 + rng(8), nakshatraIndex: (nakshatraIdx + 15) % 27, pada: 4, isRetrograde: false, dignity: rng(7) === 11 ? 'Exalted' : rng(7) === 5 ? 'Debilitated' : 'Neutral' },
    { grahaId: 7, name: 'Saturn', rashiIndex: rng(9), houseNumber: houseFor(ascRashi, rng(9)), degree: 25.6 + rng(10), nakshatraIndex: (nakshatraIdx + 18) % 27, pada: 2, isRetrograde: seed % 3 === 0, dignity: rng(9) === 6 ? 'Exalted' : rng(9) === 0 ? 'Debilitated' : 'Neutral' },
    { grahaId: 8, name: 'Rahu', rashiIndex: rng(11), houseNumber: houseFor(ascRashi, rng(11)), degree: 11.2, nakshatraIndex: (nakshatraIdx + 21) % 27, pada: 3, isRetrograde: true, dignity: 'Neutral' },
    { grahaId: 9, name: 'Ketu', rashiIndex: (rng(11) + 6) % 12, houseNumber: houseFor(ascRashi, (rng(11) + 6) % 12), degree: 11.2, nakshatraIndex: (nakshatraIdx + 21) % 27, pada: 3, isRetrograde: true, dignity: 'Neutral' },
  ]

  const birthNakshatraRuler = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'][nakshatraIdx % 9]
  const startIdx = DASHA_SEQUENCE.indexOf(birthNakshatraRuler)

  const mahadashas = []
  let currentDate = new Date(year, month - 1, day)
  const elapsed = (nakshatraIdx % 13) * 365 * 0.5
  currentDate = new Date(currentDate.getTime() - elapsed * 24 * 60 * 60 * 1000)

  for (let i = 0; i < 9; i++) {
    const planet = DASHA_SEQUENCE[(startIdx + i) % 9]
    const years = DASHA_YEARS[planet as keyof typeof DASHA_YEARS]
    const start = new Date(currentDate)
    currentDate = new Date(currentDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000)
    mahadashas.push({ planet, startDate: start.toISOString(), endDate: currentDate.toISOString(), years })
  }

  const now = new Date()
  const currentMaha = mahadashas.find(m => new Date(m.startDate) <= now && new Date(m.endDate) >= now) || mahadashas[0]
  const mahaLordIdx = DASHA_SEQUENCE.indexOf(currentMaha.planet)
  const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000
  let antarStart = new Date(currentMaha.startDate)
  let currentAntar = { planet: currentMaha.planet, startDate: currentMaha.startDate, endDate: currentMaha.endDate }
  for (let i = 0; i < 9; i++) {
    const antarLord = DASHA_SEQUENCE[(mahaLordIdx + i) % 9]
    const antarYears = (DASHA_YEARS[currentMaha.planet as keyof typeof DASHA_YEARS] * DASHA_YEARS[antarLord as keyof typeof DASHA_YEARS]) / 120
    const antarEnd = new Date(antarStart.getTime() + antarYears * MS_PER_YEAR)
    if (now >= antarStart && now < antarEnd) { currentAntar = { planet: antarLord, startDate: antarStart.toISOString(), endDate: antarEnd.toISOString() }; break }
    antarStart = antarEnd
  }

  // Use the comprehensive yoga detection engine (40+ yogas)
  const planetInputs: PlanetInput[] = planets.map(p => ({
    ...p,
    grahaId: String(p.grahaId),
  }))
  const detectedYogas = detectYogas(planetInputs, ascRashi - 1)
  const yogas = detectedYogas.map(y => ({
    name: y.name,
    type: y.type,
    strength: y.strength,
    description: y.description,
  }))
  if (yogas.length === 0) {
    yogas.push({ name: 'Dharma Karma Yoga', type: 'Miscellaneous', strength: 'Moderate', description: 'An alignment between dharma (9th) and karma (10th) lords suggests spiritual purpose guiding your life path.' })
  }

  // Use comprehensive dosha detection (7+ doshas)
  const detectedDoshas = detectDoshas(planetInputs, ascRashi - 1)
  const doshas = detectedDoshas.map(d => ({
    name: d.name,
    severity: d.severity,
    description: d.description,
  }))

  return {
    id: generateId(),
    name,
    birthDate,
    birthTime: birthTime || `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    birthPlace,
    birthLat: 19.076 + (seed % 10) * 0.1,
    birthLon: 72.877 + (seed % 10) * 0.1,
    ascendant: { rashiIndex: ascRashi - 1, degree: 15.3 + day % 15, nakshatraIndex: nakshatraIdx, pada: (day % 4) + 1 },
    planets,
    dashas: { mahadashas, currentMahadasha: currentMaha, currentAntardasha: currentAntar },
    yogas,
    doshas,
    createdAt: new Date().toISOString(),
  }
}

// ─── North Indian Chart ────────────────────────────────────────────────────

interface ChartProps {
  kundli: KundliData
  size?: number
}

function computeHouseGrid(S: number, pad: number) {
  const s = S - 2 * pad
  const c = s / 4
  const o = pad
  return [
    { house: 12, x: o,        y: o,        w: c, h: c },
    { house: 1,  x: o + c,    y: o,        w: c * 2, h: c },
    { house: 2,  x: o + c*3,  y: o,        w: c, h: c },
    { house: 11, x: o,        y: o + c,    w: c, h: c * 2 },
    { house: 3,  x: o + c*3,  y: o + c,    w: c, h: c * 2 },
    { house: 10, x: o,        y: o + c*3,  w: c, h: c },
    { house: 9,  x: o + c,    y: o + c*3,  w: c, h: c },
    { house: 8,  x: o + c*2,  y: o + c*3,  w: c, h: c },
    { house: 7,  x: o + c*3,  y: o + c*3,  w: c, h: c },
    { house: 4,  x: o + c*3,  y: o + c*2,  w: c, h: c },
  ].filter(cell => cell.w > 0 && cell.h > 0)
}

function NorthIndianChart({ kundli, size = 380 }: ChartProps) {
  const S = size
  const C = S / 2
  const pad = 10

  const houseGrid = computeHouseGrid(S, pad)

  const planetsByHouse: Record<number, string[]> = {}
  for (let h = 1; h <= 12; h++) planetsByHouse[h] = []
  const ascHouse = kundli.ascendant.rashiIndex + 1
  planetsByHouse[1] = ['Asc']
  kundli.planets.forEach(p => {
    const h = p.houseNumber
    if (h >= 1 && h <= 12) {
      planetsByHouse[h].push(PLANET_SYMBOLS[p.name] ?? p.name.slice(0, 2))
    }
  })

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="w-full max-w-xs sm:max-w-sm">
      <rect x={0} y={0} width={S} height={S} rx={4} fill="rgba(6,22,40,0.9)" stroke="rgba(255,179,71,0.3)" strokeWidth={1} />
      {houseGrid.map(cell => {
        const planets = planetsByHouse[cell.house] ?? []
        const isLagna = cell.house === 1
        return (
          <g key={cell.house}>
            <rect
              x={cell.x} y={cell.y} width={cell.w} height={cell.h}
              fill={isLagna ? 'rgba(255,179,71,0.08)' : 'rgba(13,33,55,0.4)'}
              stroke={isLagna ? 'rgba(255,179,71,0.6)' : 'rgba(255,179,71,0.15)'}
              strokeWidth={isLagna ? 1.5 : 0.5}
            />
            <text x={cell.x + 5} y={cell.y + 13} fill="rgba(255,179,71,0.4)" fontSize={9} fontFamily="Cinzel, serif">{cell.house}</text>
            <text x={cell.x + cell.w / 2} y={cell.y + 22} fill="rgba(255,179,71,0.6)" fontSize={11} textAnchor="middle" fontFamily="serif">
              {RASHIS[(cell.house + ascHouse - 3 + 12) % 12]?.symbol ?? ''}
            </text>
            {planets.map((planet, i) => (
              <text
                key={planet}
                x={cell.x + cell.w / 2}
                y={cell.y + 36 + i * 12}
                fill={planet === 'Asc' ? '#FFB347' : '#7DF9FF'}
                fontSize={planet === 'Asc' ? 8 : 9}
                textAnchor="middle"
                fontFamily="Cinzel, serif"
                fontWeight={planet === 'Asc' ? 'bold' : 'normal'}
              >{planet}</text>
            ))}
          </g>
        )
      })}
      <text x={C} y={C - 8} fill="rgba(255,179,71,0.3)" fontSize={8} textAnchor="middle" fontFamily="Cinzel, serif">Vedic</text>
      <text x={C} y={C + 4} fill="rgba(255,179,71,0.3)" fontSize={8} textAnchor="middle" fontFamily="Cinzel, serif">Kundli</text>
    </svg>
  )
}

// ─── Cinematic Loading Sequence ────────────────────────────────────────────

const LOADING_PHASES = [
  { label: 'Consulting the Ephemeris...', sub: 'Aligning with cosmic coordinates' },
  { label: 'Calculating Planetary Positions...', sub: 'Placing the Navagrahas' },
  { label: 'Placing the Houses...', sub: 'Drawing the twelve bhava' },
  { label: 'Your Kundli is Ready!', sub: 'The cosmic map awaits' },
]

const PLANETS_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']

function CinematicLoader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const [visiblePlanets, setVisiblePlanets] = useState<number>(0)
  const [strokeDash, setStrokeDash] = useState(0)
  const [flashGold, setFlashGold] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 0 → 1 at 1s
    timers.push(setTimeout(() => setPhase(1), 1000))

    // Planet reveal during phase 1 (1s–2s): reveal each planet ~100ms apart
    for (let i = 0; i < 9; i++) {
      timers.push(setTimeout(() => setVisiblePlanets(i + 1), 1000 + i * 110))
    }

    // Phase 1 → 2 at 2s
    timers.push(setTimeout(() => setPhase(2), 2000))

    // Animate stroke dash during phase 2 (2s–3s)
    timers.push(setTimeout(() => {
      let dash = 0
      const interval = setInterval(() => {
        dash += 8
        setStrokeDash(Math.min(dash, 400))
        if (dash >= 400) clearInterval(interval)
      }, 30)
      return () => clearInterval(interval)
    }, 2000))

    // Phase 2 → 3 at 3s
    timers.push(setTimeout(() => setPhase(3), 3000))

    // Flash gold at 3s
    timers.push(setTimeout(() => setFlashGold(true), 3000))

    // Complete at 4s
    timers.push(setTimeout(() => onComplete(), 4000))

    return () => timers.forEach(t => clearTimeout(t))
  }, [onComplete])

  const cx = 120
  const cy = 120
  const r = 80

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cosmos"
    >
      {/* Gold flash overlay */}
      <AnimatePresence>
        {flashGold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,179,71,0.4) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center gap-8 px-6 max-w-sm w-full">
        {/* SVG animation area */}
        <div className="relative w-60 h-60">
          <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0">
            {/* Mandala / spinning star — phase 0 */}
            <AnimatePresence>
              {phase === 0 && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }}
                  style={{ transformOrigin: '120px 120px' }}
                >
                  {[0, 45, 90, 135].map((angle) => (
                    <g key={angle} transform={`rotate(${angle} 120 120)`}>
                      <line x1="120" y1="40" x2="120" y2="200" stroke="rgba(255,179,71,0.5)" strokeWidth="1.5" />
                    </g>
                  ))}
                  {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((angle, i) => (
                    <polygon
                      key={i}
                      points="120,60 127,80 120,75 113,80"
                      transform={`rotate(${angle} 120 120)`}
                      fill="rgba(255,179,71,0.3)"
                    />
                  ))}
                  <circle cx="120" cy="120" r="35" fill="none" stroke="rgba(255,179,71,0.4)" strokeWidth="1" />
                  <circle cx="120" cy="120" r="55" fill="none" stroke="rgba(255,179,71,0.2)" strokeWidth="0.5" strokeDasharray="4 4" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Planets on circle — phase 1 */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,179,71,0.15)" strokeWidth="1" />
                  {PLANETS_ORDER.slice(0, visiblePlanets).map((planet, i) => {
                    const angle = (i / 9) * 2 * Math.PI - Math.PI / 2
                    const x = cx + r * Math.cos(angle)
                    const y = cy + r * Math.sin(angle)
                    const color = PLANET_COLORS[planet] ?? '#FFB347'
                    return (
                      <motion.g key={planet} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                        <circle cx={x} cy={y} r={5} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                        <text x={x} y={y - 9} textAnchor="middle" fill={color} fontSize="7" fontFamily="Cinzel, serif">{planet.slice(0, 2)}</text>
                      </motion.g>
                    )
                  })}
                  <circle cx={cx} cy={cy} r={6} fill="rgba(255,179,71,0.3)" stroke="rgba(255,179,71,0.6)" strokeWidth="1" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* House grid SVG drawing — phase 2 */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect x="60" y="60" width="120" height="120" fill="none"
                    stroke="rgba(255,179,71,0.5)" strokeWidth="1.5"
                    strokeDasharray="400"
                    strokeDashoffset={400 - strokeDash}
                  />
                  <line x1="120" y1="60" x2="120" y2="180" stroke="rgba(255,179,71,0.3)" strokeWidth="0.8"
                    strokeDasharray="400" strokeDashoffset={Math.max(0, 400 - strokeDash * 1.5)} />
                  <line x1="60" y1="120" x2="180" y2="120" stroke="rgba(255,179,71,0.3)" strokeWidth="0.8"
                    strokeDasharray="400" strokeDashoffset={Math.max(0, 400 - strokeDash * 1.5)} />
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((h, i) => {
                    const hx = 68 + (i % 4) * 30
                    const hy = 68 + Math.floor(i / 4) * 30
                    return (
                      <text key={h} x={hx} y={hy} fill="rgba(255,179,71,0.5)" fontSize="7" fontFamily="Cinzel, serif">{h}</text>
                    )
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Ready checkmark / star — phase 3 */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <circle cx={cx} cy={cy} r={40} fill="rgba(255,179,71,0.1)" stroke="rgba(255,179,71,0.5)" strokeWidth="1.5" />
                  <text x={cx} y={cy + 8} textAnchor="middle" fill="#FFB347" fontSize="28" fontFamily="serif">✦</text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* Phase text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-1"
          >
            <p className="font-cinzel text-lg text-gold">{LOADING_PHASES[phase]?.label}</p>
            <p className="font-cormorant text-slate-400 text-sm">{LOADING_PHASES[phase]?.sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* Phase progress dots */}
        <div className="flex gap-2">
          {LOADING_PHASES.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i <= phase ? '#FFB347' : 'rgba(255,179,71,0.2)' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Dasha Timeline ─────────────────────────────────────────────────────────

function DashaView({ kundli }: { kundli: KundliData }) {
  const now = new Date()
  const { currentMahadasha, currentAntardasha, mahadashas } = kundli.dashas
  const [showAntardashas, setShowAntardashas] = useState<string | null>(null)

  // Compute antardasha periods within a mahadasha
  function getAntardashas(mahaStart: string, mahaEnd: string, mahaPlanet: string) {
    const totalMs = new Date(mahaEnd).getTime() - new Date(mahaStart).getTime()
    const mahaYears = DASHA_YEARS[mahaPlanet as keyof typeof DASHA_YEARS]
    const startIdx = DASHA_SEQUENCE.indexOf(mahaPlanet)
    const antars: { planet: string; start: Date; end: Date; years: number }[] = []
    let current = new Date(mahaStart)

    for (let i = 0; i < 9; i++) {
      const planet = DASHA_SEQUENCE[(startIdx + i) % 9]
      const antarYears = (DASHA_YEARS[planet as keyof typeof DASHA_YEARS] * mahaYears) / 120
      const antarMs = (antarYears / mahaYears) * totalMs
      const end = new Date(current.getTime() + antarMs)
      antars.push({ planet, start: new Date(current), end, years: antarYears })
      current = end
    }
    return antars
  }

  // Compute pratyantar dashas within an antardasha
  function getPratyantars(antarStart: Date, antarEnd: Date, antarPlanet: string) {
    const totalMs = antarEnd.getTime() - antarStart.getTime()
    const antarYears = DASHA_YEARS[antarPlanet as keyof typeof DASHA_YEARS]
    const startIdx = DASHA_SEQUENCE.indexOf(antarPlanet)
    const prats: { planet: string; start: Date; end: Date }[] = []
    let current = new Date(antarStart)

    for (let i = 0; i < 9; i++) {
      const planet = DASHA_SEQUENCE[(startIdx + i) % 9]
      const pratYears = (DASHA_YEARS[planet as keyof typeof DASHA_YEARS] * antarYears) / 120
      const pratMs = (pratYears / antarYears) * totalMs
      const end = new Date(current.getTime() + pratMs)
      prats.push({ planet, start: new Date(current), end })
      current = end
    }
    return prats
  }

  // Find current antardasha and pratyantar
  const currentMahaAntars = getAntardashas(currentMahadasha.startDate, currentMahadasha.endDate, currentMahadasha.planet)
  const activeAntar = currentMahaAntars.find(a => a.start <= now && a.end >= now)
  const activePrats = activeAntar ? getPratyantars(activeAntar.start, activeAntar.end, activeAntar.planet) : []
  const activePrat = activePrats.find(p => p.start <= now && p.end >= now)

  return (
    <div className="space-y-4">
      <div className="glass-card-dark p-4 rounded-xl">
        <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">Current Period</div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3">
            <div className="text-xs text-gold/50 font-cinzel">Mahadasha</div>
            <div className="text-xl font-cinzel text-gold">{currentMahadasha.planet}</div>
            <div className="text-xs text-slate-400 mt-1">
              Until {new Date(currentMahadasha.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-3">
            <div className="text-xs text-cyan-400/70 font-cinzel">Antardasha</div>
            <div className="text-xl font-cinzel text-cyan-300">{activeAntar?.planet ?? currentAntardasha.planet}</div>
            <div className="text-xs text-slate-400 mt-1">
              Until {activeAntar ? activeAntar.end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : new Date(currentAntardasha.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          {activePrat && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3">
              <div className="text-xs text-purple-400/70 font-cinzel">Pratyantar</div>
              <div className="text-xl font-cinzel text-purple-300">{activePrat.planet}</div>
              <div className="text-xs text-slate-400 mt-1">
                Until {activePrat.end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>
        {activeAntar && DASHA_DESCRIPTIONS[activeAntar.planet] && (
          <p className="text-xs font-cormorant text-slate-400 mt-3 leading-relaxed">
            <span className="text-gold/50 font-cinzel">Antardasha Theme:</span> {DASHA_DESCRIPTIONS[activeAntar.planet]}
          </p>
        )}
      </div>

      <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">Life Dasha Timeline</div>
      <div className="space-y-2">
        {mahadashas.map((dasha, idx) => {
          const start = new Date(dasha.startDate)
          const end = new Date(dasha.endDate)
          const isCurrent = start <= now && end >= now
          const isPast = end < now
          const color = PLANET_COLORS[dasha.planet] ?? '#888'
          const isExpanded = showAntardashas === dasha.planet
          const antars = isExpanded ? getAntardashas(dasha.startDate, dasha.endDate, dasha.planet) : []

          return (
            <div key={idx}
              className={`rounded-xl p-3 border transition-all cursor-pointer ${isCurrent ? 'border-gold/40 bg-gold/5' : isPast ? 'border-stardust/30 bg-stardust/10 opacity-60' : 'border-stardust/20 bg-stardust/5'}`}
              onClick={() => setShowAntardashas(isExpanded ? null : dasha.planet)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-cinzel text-sm" style={{ color: isCurrent ? color : undefined }}>{dasha.planet} Mahadasha</span>
                  {isCurrent && <span className="text-xs bg-gold/20 text-gold px-2 rounded-full">Now</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{dasha.years}y</span>
                  {isExpanded ? <ChevronUp size={12} className="text-gold/40" /> : <ChevronDown size={12} className="text-gold/40" />}
                </div>
              </div>
              {isCurrent && DASHA_DESCRIPTIONS[dasha.planet] && (
                <p className="text-xs font-cormorant text-slate-400 mb-2 leading-relaxed">{DASHA_DESCRIPTIONS[dasha.planet]}</p>
              )}
              <div className="h-1.5 bg-stardust/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  background: color,
                  width: isCurrent ? `${Math.min(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100, 100)}%` : isPast ? '100%' : '0%',
                  opacity: isPast ? 0.5 : 1
                }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{start.getFullYear()}</span>
                <span>{end.getFullYear()}</span>
              </div>

              {/* Antardasha breakdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="mt-3 pt-3 border-t border-stardust/20 space-y-1.5">
                      <div className="font-cinzel text-[10px] text-cyan-400/60 uppercase tracking-wider mb-1">Antardasha Periods</div>
                      {antars.map((antar, ai) => {
                        const aColor = PLANET_COLORS[antar.planet] ?? '#888'
                        const aIsCurrent = antar.start <= now && antar.end >= now
                        const aIsPast = antar.end < now
                        return (
                          <div key={ai} className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg ${aIsCurrent ? 'bg-cyan-500/10 border border-cyan-500/20' : ''}`}>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: aColor }} />
                            <span className="font-cinzel w-14 flex-shrink-0" style={{ color: aIsCurrent ? aColor : aIsPast ? '#666' : '#999' }}>{antar.planet}</span>
                            <span className={`text-[10px] font-cormorant flex-1 ${aIsPast ? 'text-slate-600' : 'text-slate-400'}`}>
                              {antar.start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })} — {antar.end.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-slate-500 font-cormorant">{antar.years.toFixed(1)}y</span>
                            {aIsCurrent && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 rounded font-cinzel">Active</span>}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Planets Table (Improved) ───────────────────────────────────────────────

function dignityStyle(dignity: string): string {
  switch (dignity) {
    case 'Exalted': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
    case 'Own': return 'bg-green-500/20 text-green-300 border border-green-500/30'
    case 'Friendly': return 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
    case 'Debilitated': return 'bg-red-500/20 text-red-300 border border-red-500/30'
    case 'Enemy': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
    default: return 'bg-stardust/30 text-slate-400 border border-stardust/40'
  }
}

function PlanetsTable({ kundli }: { kundli: KundliData }) {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {kundli.planets.map(planet => {
        const rashi = RASHIS[planet.rashiIndex]
        const nakshatra = NAKSHATRAS[planet.nakshatraIndex]
        const color = PLANET_COLORS[planet.name] ?? '#ccc'
        const interp = PLANET_INTERPRETATIONS[planet.name]?.[rashi?.name ?? ''] ?? PLANET_INTERPRETATIONS[planet.name]?.default ?? ''
        const strength = getDignityStrength(planet.dignity ?? 'Neutral')
        const aspects = getPlanetAspects(planet.name, planet.houseNumber)
        const houseInfo = HOUSE_SIGNIFICATIONS[planet.houseNumber]
        const isExpanded = expandedPlanet === planet.name

        return (
          <motion.div
            key={planet.grahaId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-stardust/20 bg-stardust/5 hover:bg-stardust/10 transition-all cursor-pointer overflow-hidden"
            onClick={() => setExpandedPlanet(isExpanded ? null : planet.name)}
          >
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                    <span className="font-cinzel text-xs font-bold" style={{ color }}>{PLANET_SYMBOLS[planet.name]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-sm text-white">{planet.name}</span>
                      {planet.isRetrograde && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 rounded font-cinzel">℞</span>}
                      <span className={`text-[10px] font-cinzel px-1.5 rounded ${dignityStyle(planet.dignity ?? 'Neutral')}`}>{planet.dignity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-cormorant mt-0.5">
                      <span>{rashi?.symbol} {rashi?.name}</span>
                      <span>·</span>
                      <span>H{planet.houseNumber}</span>
                      <span>·</span>
                      <span>{planet.degree.toFixed(1)}°</span>
                      <span>·</span>
                      <span>{nakshatra} P{planet.pada}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Strength bar */}
                  <div className="w-16 hidden sm:block">
                    <div className="h-1.5 bg-stardust/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ background: color }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 block text-right">{strength}%</span>
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-gold/40" /> : <ChevronDown size={14} className="text-gold/40" />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3 border-t border-stardust/20 pt-3">
                    {/* Interpretation */}
                    <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{interp}</p>

                    {/* House info */}
                    {houseInfo && (
                      <div className="bg-stardust/20 rounded-lg p-2.5">
                        <span className="text-[10px] font-cinzel text-gold/50 uppercase">House {planet.houseNumber} — {houseInfo.name}</span>
                        <p className="text-xs font-cormorant text-slate-400 mt-0.5">{houseInfo.rules}</p>
                      </div>
                    )}

                    {/* Aspects */}
                    <div>
                      <span className="text-[10px] font-cinzel text-gold/50 uppercase">Aspects Houses</span>
                      <div className="flex gap-1.5 mt-1">
                        {aspects.map(h => (
                          <span key={h} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stardust/30 text-xs font-cinzel text-slate-300 border border-stardust/40">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strength bar (mobile) */}
                    <div className="sm:hidden">
                      <span className="text-[10px] font-cinzel text-gold/50 uppercase">Strength</span>
                      <div className="h-2 bg-stardust/40 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full" style={{ background: color, width: `${strength}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500">{strength}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Yoga Cards (Improved) ─────────────────────────────────────────────────

function strengthConfig(strength: string) {
  switch (strength) {
    case 'Excellent': return { border: 'border-purple-500/40', bg: 'bg-purple-500/5', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', glow: 'shadow-[0_0_20px_rgba(147,51,234,0.2)]', animated: true }
    case 'Strong': return { border: 'border-gold/40', bg: 'bg-gold/5', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', glow: '', animated: false }
    case 'Moderate': return { border: 'border-blue-500/30', bg: 'bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', glow: '', animated: false }
    default: return { border: 'border-stardust/30', bg: 'bg-stardust/5', badge: 'bg-stardust/20 text-slate-400 border-stardust/40', glow: '', animated: false }
  }
}

const YOGA_REMEDIES: Record<string, string[]> = {
  'Gajakesari Yoga': ['Worship Jupiter on Thursdays', 'Wear yellow sapphire (Pukhraj)', 'Donate yellow items on Thursdays', 'Chant Guru Beej Mantra: Om Gram Grim Grom Sah Gurave Namah'],
  'Raja Yoga': ['Strengthen the lagna lord', 'Worship the Sun or ruling planet', 'Practice Surya Namaskar daily'],
  'Malavya Yoga': ['Worship Goddess Lakshmi on Fridays', 'Wear diamond or white sapphire', 'Offer white flowers on Fridays'],
  'Dharma Karma Yoga': ['Perform charity on auspicious days', 'Study and practice dharma texts', 'Serve parents and teachers'],
  'Budhaditya Yoga': ['Worship Sun on Sundays at sunrise', 'Offer water to Sun daily', 'Chant Aditya Hridayam', 'Wear Ruby or Emerald after consultation'],
  'Chandra-Mangal Yoga': ['Worship Lord Hanuman on Tuesdays', 'Donate red items on Tuesdays', 'Practice Moon meditation on Full Moon nights'],
  'Amala Yoga': ['Maintain ethical conduct in all dealings', 'Serve the community selflessly', 'Worship Lord Vishnu regularly'],
  'Ruchaka Yoga': ['Worship Lord Hanuman', 'Wear Red Coral after consultation', 'Practice physical discipline and martial arts', 'Donate to military/police charities'],
  'Hamsa Yoga': ['Study scriptures regularly', 'Worship Lord Vishnu or Jupiter', 'Wear Yellow Sapphire after consultation', 'Teach and share knowledge'],
  'Sasa Yoga': ['Worship Lord Shani on Saturdays', 'Serve the elderly and disabled', 'Wear Blue Sapphire after consultation', 'Practice patience and discipline'],
  'Bhadra Yoga': ['Worship Lord Vishnu on Wednesdays', 'Wear Emerald after consultation', 'Practice intellectual pursuits and communication skills'],
  'Saraswati Yoga': ['Worship Goddess Saraswati', 'Dedicate time to arts and learning', 'Keep books and instruments clean', 'Chant Saraswati Vandana daily'],
  'Dharma-Karma Adhipati Yoga': ['Honor your dharma path daily', 'Serve teachers and elders', 'Perform charity on Thursdays and Saturdays'],
  'Viparita Raja Yoga': ['Trust the transformation process', 'Chant Maha Mrityunjaya Mantra', 'Donate to the needy on Saturdays'],
  'Neechabhanga Raja Yoga': ['Strengthen the cancelling planet with its gemstone', 'Perform remedies for the debilitated planet', 'Practice patience — results come after initial struggle'],
  'Lakshmi Yoga': ['Worship Goddess Lakshmi on Fridays', 'Keep finances organized', 'Donate food on Purnima', 'Chant Sri Sukta daily'],
  'Sunapha Yoga': ['Strengthen the planet behind Moon', 'Practice meditation during moonrise', 'Maintain emotional stability through routine'],
  'Anapha Yoga': ['Strengthen the planet ahead of Moon', 'Practice creative pursuits', 'Wear Pearl for Moon strength'],
  'Durudhara Yoga': ['Maintain balance between material and spiritual', 'Wear Pearl or Moonstone', 'Practice gratitude meditation'],
  'Kemadruma Yoga': ['Urgently strengthen Moon — wear Pearl', 'Chant Chandra Beej Mantra daily', 'Donate white items on Mondays', 'Keep water and milk near bed at night'],
  'Adhi Yoga': ['Worship benefic planets (Jupiter, Venus, Mercury)', 'Practice leadership with humility', 'Donate on Wednesdays, Thursdays, Fridays'],
  'Vesi Yoga': ['Worship the planet in 2nd from Sun', 'Practice Surya Namaskar at sunrise', 'Strengthen the involved planet'],
  'Vasi Yoga': ['Worship the planet in 12th from Sun', 'Offer water to Sun at sunrise', 'Practice service-oriented activities'],
  'Kaal Sarpa Dosha': ['Perform Kaal Sarpa Puja at Trimbakeshwar', 'Chant Rahu Beej Mantra 108 times daily', 'Donate black sesame seeds on Saturdays', 'Keep silver Naga idol at home'],
  'Grahan Yoga': ['Perform Grahan Dosha Shanti Puja', 'Donate black cloth on Saturdays', 'Chant mantra of the afflicted luminary (Sun/Moon)'],
  'Shakata Yoga': ['Strengthen Jupiter with Yellow Sapphire', 'Worship Lord Vishnu on Thursdays', 'Donate yellow items to Brahmins'],
  'Sanyasa Yoga': ['Embrace spiritual practices', 'Practice meditation and detachment', 'Serve a spiritual community'],
  'Moksha Yoga': ['Dedicate time to spiritual sadhana', 'Study Vedantic texts', 'Practice selfless service'],
  'Mahabhagya Yoga': ['Express gratitude for blessings daily', 'Use fortune to help others', 'Maintain humility despite success'],
}

function YogasView({ kundli }: { kundli: KundliData }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {kundli.yogas.length === 0 && (
        <div className="text-center py-8 text-slate-400 font-cormorant">No notable yogas detected.</div>
      )}
      {kundli.yogas.map((yoga, i) => {
        const cfg = strengthConfig(yoga.strength)
        const icon = YOGA_ICONS[yoga.name] ?? YOGA_ICONS.default
        const isExpanded = expanded === i
        const remedies = YOGA_REMEDIES[yoga.name] ?? []

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border transition-all cursor-pointer ${cfg.border} ${cfg.bg} ${cfg.glow} p-4`}
            onClick={() => setExpanded(isExpanded ? null : i)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <h3 className="font-cinzel text-base text-gold">{yoga.name}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-cinzel text-slate-400 bg-stardust/40 px-2 py-0.5 rounded-full">{yoga.type}</span>
                    <span className={`text-xs font-cinzel px-2 py-0.5 rounded-full border ${cfg.badge}`}>{yoga.strength}</span>
                    {cfg.animated && (
                      <span className="text-xs font-cinzel px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                        Excellent
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={16} className="text-gold/40 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gold/40 flex-shrink-0 mt-1" />}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3 border-t border-stardust/20 mt-3">
                    <p className="font-cormorant text-slate-300 text-sm leading-relaxed">{yoga.description}</p>
                    {remedies.length > 0 && (
                      <div>
                        <div className="text-xs font-cinzel text-gold/60 uppercase tracking-wider mb-2">Remedies</div>
                        <ul className="space-y-1">
                          {remedies.map((remedy, ri) => (
                            <li key={ri} className="flex items-start gap-2 text-sm font-cormorant text-slate-400">
                              <span className="text-gold/40 mt-0.5">•</span>
                              {remedy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {kundli.doshas.length > 0 && (
        <>
          <h3 className="font-cinzel text-sm text-red-400/80 uppercase tracking-wider mt-4">Doshas</h3>
          {kundli.doshas.map((dosha, i) => (
            <div key={i} className="glass-card p-4 border border-red-500/20">
              <div className="flex items-center justify-between">
                <h4 className="font-cinzel text-sm text-red-300">⚠ {dosha.name}</h4>
                <span className="text-xs bg-red-500/10 text-red-300 px-2 rounded-full border border-red-500/20">{dosha.severity}</span>
              </div>
              <p className="font-cormorant text-slate-400 text-sm mt-2">{dosha.description}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ─── Chart Section Header ──────────────────────────────────────────────────

function ChartHeader({ kundli }: { kundli: KundliData }) {
  const lagna = RASHIS[kundli.ascendant.rashiIndex]
  const nakshatra = NAKSHATRAS[kundli.ascendant.nakshatraIndex]

  return (
    <div className="text-center space-y-3 mb-2">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-cinzel text-2xl sm:text-3xl font-bold"
        style={{ textShadow: '0 0 30px rgba(255,179,71,0.4)' }}
      >
        <span className="text-gold-gradient">{kundli.name}</span>
        <span className="text-slate-300"> · Kundli</span>
      </motion.h2>

      {/* Birth details pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-cormorant text-slate-300 bg-stardust/40 border border-stardust/60 px-3 py-1 rounded-full">
          <Calendar size={10} className="text-gold/60" />
          {(() => { const [y,m,d] = kundli.birthDate.split('-').map(Number); return new Date(y, m-1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); })()}
        </span>
        {kundli.birthTime && (
          <span className="flex items-center gap-1.5 text-xs font-cormorant text-slate-300 bg-stardust/40 border border-stardust/60 px-3 py-1 rounded-full">
            <Clock size={10} className="text-gold/60" />
            {kundli.birthTime}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs font-cormorant text-slate-300 bg-stardust/40 border border-stardust/60 px-3 py-1 rounded-full">
          <MapPin size={10} className="text-gold/60" />
          {kundli.birthPlace}
        </span>
      </div>

      {/* Lagna + Nakshatra badges */}
      <div className="flex flex-wrap justify-center gap-2">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 text-sm font-cinzel bg-gold/10 border border-gold/40 text-gold px-3 py-1 rounded-full"
          style={{ boxShadow: '0 0 12px rgba(255,179,71,0.2)' }}
        >
          {lagna?.symbol} {lagna?.name} Lagna
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 text-sm font-cinzel bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full"
        >
          ✦ {nakshatra} Nakshatra
        </motion.span>
      </div>

      <p className="text-xs text-slate-500 font-cormorant">
        Calculated using Lahiri Ayanamsa · Parashari System · Vimshottari Dasha
      </p>
    </div>
  )
}

// ─── Create Form ───────────────────────────────────────────────────────────

interface BirthFormData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
}

function CreateKundliForm({ onComplete, initialData }: { onComplete: (data: KundliData) => void; initialData?: BirthFormData | null }) {
  const [form, setForm] = useState<BirthFormData>(initialData ?? { name: '', birthDate: '', birthTime: '', birthPlace: '' })
  const [loading, setLoading] = useState(false)
  const [showCinematic, setShowCinematic] = useState(false)
  const [pendingData, setPendingData] = useState<KundliData | null>(null)
  const [error, setError] = useState('')

  const update = (k: keyof BirthFormData, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleCalculate() {
    if (!form.name || !form.birthDate || !form.birthPlace) {
      setError('Please fill name, birth date, and birth place.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Try backend API first (real ephemeris), fall back to client-side
      const result = await calculateKundli(form.name, form.birthDate, form.birthTime, form.birthPlace)
      let data: KundliData
      if (result.source === 'api' && result.data) {
        data = result.data
      } else {
        data = computeMockKundli(form.birthDate, form.birthTime, form.birthPlace, form.name)
      }
      setPendingData(data)
      setShowCinematic(true)
    } catch {
      const data = computeMockKundli(form.birthDate, form.birthTime, form.birthPlace, form.name)
      setPendingData(data)
      setShowCinematic(true)
    } finally {
      setLoading(false)
    }
  }

  function handleCinematicComplete() {
    setShowCinematic(false)
    if (pendingData) onComplete(pendingData)
  }

  return (
    <>
      <AnimatePresence>
        {showCinematic && <CinematicLoader onComplete={handleCinematicComplete} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="glass-card p-6 space-y-5">
          <div className="text-center mb-2">
            <div className="text-4xl mb-2">⬡</div>
            <h2 className="font-cinzel text-xl text-gold">Create Your Kundli</h2>
            <p className="font-cormorant text-slate-400 mt-1">Enter your birth details for an accurate Vedic chart</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm font-cormorant">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Your full name"
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
                <Calendar size={10} className="inline mr-1" />Birth Date
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => update('birthDate', e.target.value)}
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
                <Clock size={10} className="inline mr-1" />Birth Time <span className="text-slate-500 normal-case">(optional but recommended)</span>
              </label>
              <input
                type="time"
                value={form.birthTime}
                onChange={e => update('birthTime', e.target.value)}
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-1.5">
                <MapPin size={10} className="inline mr-1" />Birth Place
              </label>
              <input
                type="text"
                value={form.birthPlace}
                onChange={e => update('birthPlace', e.target.value)}
                placeholder="City, Country (e.g., Mumbai, India)"
                className="w-full bg-stardust/40 border border-stardust/60 rounded-xl px-4 py-3 text-white font-cormorant text-base placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-saffron to-gold text-cosmos font-cinzel font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw size={16} className="animate-spin" /> Preparing Chart...</>
            ) : (
              <><Star size={16} /> Calculate Kundli</>
            )}
          </button>

          <p className="text-xs text-center text-slate-500 font-cormorant">
            Uses Lahiri ayanamsa • Parashari system • Vimshottari dasha
          </p>
        </div>
      </motion.div>
    </>
  )
}

// ─── Kundli Landing ────────────────────────────────────────────────────────

function KundliLanding({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center space-y-8"
    >
      <div>
        <div className="text-7xl mb-4">⬡</div>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
          Your Vedic Birth Chart
        </h1>
        <p className="font-cormorant text-slate-300 text-lg leading-relaxed">
          The Kundli is the cosmic map of your soul — a precise snapshot of the sky at the moment
          of your birth. It reveals your dharma, karma, relationships, and the sacred arc of your life.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '🪐', title: 'Planetary Positions', desc: 'See where all 9 grahas sat at your birth' },
          { icon: '🌊', title: 'Dasha Periods', desc: 'Navigate your life\'s cosmic seasons' },
          { icon: '✨', title: 'Yogas & Doshas', desc: 'Discover auspicious combinations and remedies' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="font-cinzel text-sm text-gold mb-1">{item.title}</div>
            <p className="font-cormorant text-slate-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-saffron to-gold text-cosmos font-cinzel font-bold px-8 py-4 rounded-full hover:shadow-gold-glow transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={18} />
        Create Your Kundli
      </button>

      <div className="glass-card-dark p-5 text-left">
        <div className="font-cinzel text-xs text-gold/60 uppercase tracking-wider mb-2">Sacred Text</div>
        <p className="font-devanagari text-slate-300 text-base">
          "ग्रहाणां फलदाता त्वं ग्रहाणां फलनाशकः। ग्रहपीडां शमं नेतुं स्वयमेव जनार्दन॥"
        </p>
        <p className="font-cormorant text-slate-400 text-sm mt-2 italic">
          "You are the giver and remover of planetary results. O Janardhana, you yourself pacify planetary afflictions."
        </p>
      </div>
    </motion.div>
  )
}

// ─── Chart View ────────────────────────────────────────────────────────────

const CHART_TABS = ['Chart', 'Planets', 'Dasha', 'Yogas', 'Ashtakvarga', 'Strength'] as const
type ChartTab = typeof CHART_TABS[number]

// ─── Ashtakvarga View ──────────────────────────────────────────────────────

function AshtakvargaView({ kundli }: { kundli: KundliData }) {
  const planetInputs: PlanetInput[] = kundli.planets.map(p => ({ ...p, grahaId: String(p.grahaId) }))
  const result = useMemo(() => computeAshtakvarga(planetInputs, kundli.ascendant.rashiIndex), [kundli])
  const maxBindu = Math.max(...result.sarvashtakvarga)

  return (
    <div className="space-y-6">
      {/* Sarvashtakvarga overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider">Sarvashtakvarga</h3>
          <span className="text-xs font-cormorant text-slate-400">Total: {result.totalBindus} bindus</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {result.sarvashtakvarga.map((score, i) => {
            const rashi = RASHIS[i]
            const isStrong = result.strongHouses.includes(i + 1)
            const isWeak = result.weakHouses.includes(i + 1)
            const pct = (score / maxBindu) * 100
            return (
              <div key={i} className={`text-center p-2 rounded-xl border ${isStrong ? 'border-green-500/30 bg-green-500/5' : isWeak ? 'border-red-500/20 bg-red-500/5' : 'border-stardust/20 bg-stardust/5'}`}>
                <div className="text-lg">{rashi?.symbol}</div>
                <div className={`text-sm font-cinzel font-bold ${isStrong ? 'text-green-400' : isWeak ? 'text-red-400' : 'text-white'}`}>{score}</div>
                <div className="h-1 bg-stardust/30 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isStrong ? '#22c55e' : isWeak ? '#ef4444' : '#FFB347' }} />
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">{rashi?.name?.slice(0, 4)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strong/Weak houses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="font-cinzel text-xs text-green-400/70 uppercase tracking-wider mb-2">Strong Houses (28+ bindus)</div>
          {result.strongHouses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.strongHouses.map(h => (
                <span key={h} className="inline-flex items-center gap-1 text-sm font-cinzel text-green-300 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                  H{h} · {RASHIS[(h + kundli.ascendant.rashiIndex - 1) % 12]?.symbol} {result.sarvashtakvarga[(h + kundli.ascendant.rashiIndex - 1) % 12]}
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-slate-500 font-cormorant">No houses with 28+ bindus</p>}
        </div>
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="font-cinzel text-xs text-red-400/70 uppercase tracking-wider mb-2">Weak Houses (&lt;25 bindus)</div>
          {result.weakHouses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.weakHouses.map(h => (
                <span key={h} className="inline-flex items-center gap-1 text-sm font-cinzel text-red-300 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                  H{h} · {RASHIS[(h + kundli.ascendant.rashiIndex - 1) % 12]?.symbol} {result.sarvashtakvarga[(h + kundli.ascendant.rashiIndex - 1) % 12]}
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-slate-500 font-cormorant">No houses below 25 bindus</p>}
        </div>
      </div>

      {/* Per-planet Ashtakvarga */}
      <div>
        <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider mb-3">Planet-wise Bindus</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-cinzel">
            <thead>
              <tr className="border-b border-stardust/30">
                <th className="text-left text-gold/50 py-2 px-1">Planet</th>
                {RASHIS.map(r => <th key={r.id} className="text-center text-gold/40 py-2 px-1">{r.symbol}</th>)}
                <th className="text-center text-gold/50 py-2 px-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map(planet => {
                const scores = result.planetScores[planet] ?? new Array(12).fill(0)
                const total = scores.reduce((a: number, b: number) => a + b, 0)
                const color = PLANET_COLORS[planet] ?? '#ccc'
                return (
                  <tr key={planet} className="border-b border-stardust/10 hover:bg-stardust/10">
                    <td className="py-2 px-1" style={{ color }}>{PLANET_SYMBOLS[planet]}</td>
                    {scores.map((s: number, i: number) => (
                      <td key={i} className={`text-center py-2 px-1 ${s >= 5 ? 'text-green-400' : s <= 2 ? 'text-red-400/60' : 'text-slate-400'}`}>{s}</td>
                    ))}
                    <td className="text-center py-2 px-1 font-bold text-white">{total}</td>
                  </tr>
                )
              })}
              <tr className="border-t border-gold/20">
                <td className="py-2 px-1 text-gold font-bold">SAV</td>
                {result.sarvashtakvarga.map((s, i) => (
                  <td key={i} className={`text-center py-2 px-1 font-bold ${s >= 28 ? 'text-green-400' : s < 25 ? 'text-red-400' : 'text-white'}`}>{s}</td>
                ))}
                <td className="text-center py-2 px-1 font-bold text-gold">{result.totalBindus}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <p className="text-xs font-cormorant text-slate-400">
          Ashtakvarga is a system of 8-fold strength analysis. Each planet receives benefic points (bindus) from 7 planets plus the Ascendant.
          Houses with 28+ bindus in Sarvashtakvarga are strong for transits. Houses below 25 indicate areas needing attention.
        </p>
      </div>
    </div>
  )
}

// ─── Shadbala (Strength) View ─────────────────────────────────────────────

function ShadbalaView({ kundli }: { kundli: KundliData }) {
  const planetInputs: PlanetInput[] = kundli.planets.map(p => ({ ...p, grahaId: String(p.grahaId) }))
  const [y, m] = kundli.birthDate.split('-').map(Number)
  const birthHour = kundli.birthTime ? parseInt(kundli.birthTime.split(':')[0]) : 12
  const result = useMemo(() => computeShadbala(planetInputs, kundli.ascendant.rashiIndex, m, birthHour), [kundli])

  const BALA_LABELS = [
    { key: 'sthana' as const, label: 'Sthana', desc: 'Positional', color: '#FFB347' },
    { key: 'dig' as const, label: 'Dig', desc: 'Directional', color: '#7DF9FF' },
    { key: 'kala' as const, label: 'Kala', desc: 'Temporal', color: '#FFD700' },
    { key: 'chesta' as const, label: 'Chesta', desc: 'Motional', color: '#FF6B6B' },
    { key: 'naisargika' as const, label: 'Naisargika', desc: 'Natural', color: '#9B87F5' },
    { key: 'drik' as const, label: 'Drik', desc: 'Aspectual', color: '#FFB6C1' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider">Shadbala — Six-fold Planetary Strength</h3>
      </div>

      {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map(planet => {
        const entry = result.planets[planet]
        if (!entry) return null
        const color = PLANET_COLORS[planet] ?? '#ccc'

        return (
          <motion.div
            key={planet}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${entry.isStrong ? 'border-green-500/20 bg-green-500/[0.02]' : 'border-red-500/20 bg-red-500/[0.02]'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                  <span className="font-cinzel text-xs font-bold" style={{ color }}>{PLANET_SYMBOLS[planet]}</span>
                </div>
                <div>
                  <span className="font-cinzel text-sm text-white">{planet}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-cinzel px-1.5 rounded ${entry.isStrong ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                      {entry.isStrong ? 'Strong' : 'Weak'}
                    </span>
                    <span className="text-xs text-slate-400 font-cormorant">{entry.percentage}% of required</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-cinzel font-bold" style={{ color }}>{entry.total.toFixed(0)}</span>
                <span className="text-xs text-slate-500 font-cormorant block">total rupas</span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {BALA_LABELS.map(bala => {
                const val = entry[bala.key]
                return (
                  <div key={bala.key} className="text-center">
                    <div className="h-12 bg-stardust/20 rounded-lg relative overflow-hidden flex items-end justify-center">
                      <motion.div
                        className="w-full rounded-t-sm"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(val, 100)}%` }}
                        transition={{ duration: 0.6 }}
                        style={{ background: bala.color, opacity: 0.6 }}
                      />
                    </div>
                    <div className="text-[9px] font-cinzel text-slate-500 mt-1">{bala.label}</div>
                    <div className="text-[10px] font-cinzel" style={{ color: bala.color }}>{val.toFixed(0)}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}

      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <p className="text-xs font-cormorant text-slate-400">
          Shadbala measures planetary strength through 6 factors: Sthana (positional/dignity), Dig (directional),
          Kala (temporal — day/night birth), Chesta (motional/retrograde), Naisargika (natural), and Drik (aspectual).
          A planet above 100% of its required minimum is considered strong.
        </p>
      </div>
    </div>
  )
}

// ─── Divisional Charts ────────────────────────────────────────────────────

type DivisionalChart = 'D1' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12'

const DIVISIONAL_CHARTS: { key: DivisionalChart; name: string; purpose: string }[] = [
  { key: 'D1', name: 'Rashi', purpose: 'Overall life' },
  { key: 'D3', name: 'Drekkana', purpose: 'Siblings & courage' },
  { key: 'D4', name: 'Chaturthamsa', purpose: 'Property & fortune' },
  { key: 'D7', name: 'Saptamsa', purpose: 'Children & progeny' },
  { key: 'D9', name: 'Navamsha', purpose: 'Marriage & dharma' },
  { key: 'D10', name: 'Dasamsa', purpose: 'Career & profession' },
  { key: 'D12', name: 'Dwadasamsa', purpose: 'Parents & ancestry' },
]

function computeDivisionalChart(kundli: KundliData, division: number): KundliData {
  function getDivisionalRashi(rashiIndex: number, degree: number, div: number): number {
    const partSize = 30 / div
    const part = Math.floor((degree % 30) / partSize)

    if (div === 3) {
      // Drekkana: 1st=same, 2nd=5th from, 3rd=9th from
      const offsets = [0, 4, 8]
      return (rashiIndex + offsets[part % 3]) % 12
    }
    if (div === 4) {
      // Chaturthamsa: starts from sign, 4th, 7th, 10th
      return (rashiIndex + part * 3) % 12
    }
    if (div === 7) {
      // Saptamsa: odd signs start from same sign, even start from 7th
      const start = rashiIndex % 2 === 0 ? rashiIndex : (rashiIndex + 6) % 12
      return (start + part) % 12
    }
    if (div === 9) {
      // Navamsha: based on element
      const FIRE = [0, 4, 8], EARTH = [1, 5, 9], AIR = [2, 6, 10]
      let startSign: number
      if (FIRE.includes(rashiIndex)) startSign = 0
      else if (EARTH.includes(rashiIndex)) startSign = 9
      else if (AIR.includes(rashiIndex)) startSign = 6
      else startSign = 3
      return (startSign + part) % 12
    }
    if (div === 10) {
      // Dasamsa: odd signs start from same, even from 9th
      const start = rashiIndex % 2 === 0 ? rashiIndex : (rashiIndex + 8) % 12
      return (start + part) % 12
    }
    if (div === 12) {
      // Dwadasamsa: starts from same sign, each 2.5 degrees
      return (rashiIndex + part) % 12
    }
    return rashiIndex
  }

  const ascD = getDivisionalRashi(kundli.ascendant.rashiIndex, kundli.ascendant.degree % 30, division)
  const divPlanets = kundli.planets.map(p => {
    const dRashi = getDivisionalRashi(p.rashiIndex, p.degree % 30, division)
    const house = ((dRashi - ascD + 12) % 12) + 1
    return { ...p, rashiIndex: dRashi, houseNumber: house }
  })

  return { ...kundli, planets: divPlanets, ascendant: { ...kundli.ascendant, rashiIndex: ascD } }
}

// Navamsha (D9) calculation
function computeNavamsha(kundli: KundliData): KundliData {
  const FIRE_SIGNS = [0, 4, 8]   // Mesha, Simha, Dhanu
  const EARTH_SIGNS = [1, 5, 9]  // Vrishabha, Kanya, Makara
  const AIR_SIGNS = [2, 6, 10]   // Mithuna, Tula, Kumbha
  const WATER_SIGNS = [3, 7, 11] // Karka, Vrischika, Meena

  function getNavamshaRashi(rashiIndex: number, degree: number): number {
    const navamshaNum = Math.floor(degree / (30 / 9)) // 0-8 within the sign
    let startSign: number
    if (FIRE_SIGNS.includes(rashiIndex)) startSign = 0      // Aries
    else if (EARTH_SIGNS.includes(rashiIndex)) startSign = 9 // Capricorn
    else if (AIR_SIGNS.includes(rashiIndex)) startSign = 6   // Libra
    else startSign = 3                                        // Cancer (water)
    return (startSign + navamshaNum) % 12
  }

  const d9Planets = kundli.planets.map(p => {
    const d9Rashi = getNavamshaRashi(p.rashiIndex, p.degree % 30)
    const ascD9 = getNavamshaRashi(kundli.ascendant.rashiIndex, kundli.ascendant.degree % 30)
    const house = ((d9Rashi - ascD9 + 12) % 12) + 1
    return { ...p, rashiIndex: d9Rashi, houseNumber: house }
  })

  const ascD9Rashi = getNavamshaRashi(kundli.ascendant.rashiIndex, kundli.ascendant.degree % 30)

  return {
    ...kundli,
    planets: d9Planets,
    ascendant: { ...kundli.ascendant, rashiIndex: ascD9Rashi },
  }
}

function kundliToChartData(k: KundliData) {
  const RASHI_NAMES = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena']
  const NAKSHATRA_NAMES_SHORT = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','P.Phalguni','U.Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','P.Ashadha','U.Ashadha','Shravana','Dhanishtha','Shatabhisha','P.Bhadrapada','U.Bhadrapada','Revati']
  const PLANET_ABBR: Record<string, string> = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' }
  const planets: Record<number, string[]> = {}
  for (const p of k.planets) {
    const h = p.houseNumber
    if (!planets[h]) planets[h] = []
    planets[h].push(PLANET_ABBR[p.name] || p.name.slice(0, 2))
  }
  return {
    planets,
    ascendantRashi: RASHI_NAMES[k.ascendant.rashiIndex] || 'Mesha',
    nakshatra: NAKSHATRA_NAMES_SHORT[k.ascendant.nakshatraIndex] || 'Ashwini',
  }
}

function ShareButtons({ kundli }: { kundli: KundliData }) {
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const chartData = kundliToChartData(kundli)
  const userInfo = { name: kundli.name, birthDate: kundli.birthDate, birthTime: kundli.birthTime, birthPlace: kundli.birthPlace }

  async function handleDownload() {
    setSharing(true)
    try {
      const blob = await generateChartImage(chartData, userInfo)
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${kundli.name.replace(/\s+/g, '-')}-kundli.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch { /* silent */ }
    setSharing(false)
  }

  async function handleCopy() {
    try {
      const blob = await generateChartImage(chartData, userInfo)
      if (blob) {
        const ok = await copyChartToClipboard(blob)
        if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
      }
    } catch { /* silent */ }
  }

  async function handleShare() {
    setSharing(true)
    try {
      const blob = await generateChartImage(chartData, userInfo)
      if (blob) await shareChart(blob, `${kundli.name}'s Kundli`)
    } catch { /* silent */ }
    setSharing(false)
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleDownload} disabled={sharing} className="flex items-center gap-1.5 text-xs font-cinzel text-slate-400 border border-stardust/40 hover:border-gold/30 hover:text-gold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
        <Download size={12} /> Download
      </button>
      <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-cinzel text-slate-400 border border-stardust/40 hover:border-gold/30 hover:text-gold px-3 py-1.5 rounded-lg transition-all">
        {copied ? <><Check size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
      </button>
      <button onClick={handleShare} disabled={sharing} className="flex items-center gap-1.5 text-xs font-cinzel text-slate-400 border border-stardust/40 hover:border-gold/30 hover:text-gold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
        <Share2 size={12} /> Share
      </button>
    </div>
  )
}

function KundliChartView({ kundli, onNew, onEdit }: { kundli: KundliData; onNew: () => void; onEdit: () => void }) {
  const [activeTab, setActiveTab] = useState<ChartTab>('Chart')
  const [chartMode, setChartMode] = useState<DivisionalChart>('D1')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Cinematic header */}
      <div className="glass-card p-5 shimmer-border">
        <ChartHeader kundli={kundli} />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-xs font-cinzel text-gold/70 border border-gold/20 hover:border-gold/40 px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={12} />Edit
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-2 text-xs font-cinzel text-gold/70 border border-gold/20 hover:border-gold/40 px-3 py-2 rounded-xl transition-colors"
          >
            <Plus size={12} />New Chart
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stardust/30 rounded-xl">
        {CHART_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-cinzel transition-all ${
              activeTab === tab
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Chart' && (
            <div className="glass-card p-6 space-y-4">
              {/* Divisional chart selector + share */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-1 bg-stardust/30 rounded-lg p-0.5 overflow-x-auto">
                  {DIVISIONAL_CHARTS.map(dc => (
                    <button
                      key={dc.key}
                      onClick={() => setChartMode(dc.key)}
                      className={`px-2 py-1 rounded-md text-xs font-cinzel transition-all whitespace-nowrap ${chartMode === dc.key ? 'bg-gold/20 text-gold border border-gold/30' : 'text-slate-400 hover:text-slate-200'}`}
                      title={`${dc.name} — ${dc.purpose}`}
                    >
                      {dc.key}
                    </button>
                  ))}
                </div>
                <ShareButtons kundli={kundli} />
              </div>

              {/* Current chart label */}
              {(() => {
                const dc = DIVISIONAL_CHARTS.find(d => d.key === chartMode)
                return dc ? (
                  <div className="text-center">
                    <span className="text-xs font-cormorant text-slate-400">{dc.name} — {dc.purpose}</span>
                  </div>
                ) : null
              })()}

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider text-center mb-3">
                    {chartMode === 'D1' ? 'North Indian Chart (Rashi)' : `${DIVISIONAL_CHARTS.find(d => d.key === chartMode)?.name ?? ''} Chart (${chartMode})`}
                  </h3>
                  <NorthIndianChart
                    kundli={chartMode === 'D1' ? kundli : computeDivisionalChart(kundli, parseInt(chartMode.slice(1)))}
                    size={320}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-cinzel text-sm text-gold/60 uppercase tracking-wider">
                    {chartMode === 'D1' ? 'Planet Positions' : `${chartMode} Positions`}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {(chartMode === 'D1' ? kundli : computeDivisionalChart(kundli, parseInt(chartMode.slice(1)))).planets.map(p => {
                      const rashi = RASHIS[p.rashiIndex]
                      const color = PLANET_COLORS[p.name] ?? '#ccc'
                      return (
                        <div key={p.grahaId} className="flex items-center justify-between py-2 border-b border-stardust/20 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <span className="font-cinzel text-sm" style={{ color }}>
                              {p.name}{p.isRetrograde ? ' ℞' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-cormorant">
                            <span>{rashi?.symbol} {rashi?.name}</span>
                            <span className="text-slate-600">H{p.houseNumber}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Planets' && (
            <div className="glass-card p-5">
              <PlanetsTable kundli={kundli} />
            </div>
          )}

          {activeTab === 'Dasha' && (
            <div className="glass-card p-5">
              <DashaView kundli={kundli} />
            </div>
          )}

          {activeTab === 'Yogas' && (
            <div className="space-y-4">
              <div className="glass-card p-5">
                <YogasView kundli={kundli} />
              </div>
              <KarmicAxisSection kundli={kundli} />
            </div>
          )}

          {activeTab === 'Ashtakvarga' && (
            <div className="glass-card p-5">
              <AshtakvargaView kundli={kundli} />
            </div>
          )}

          {activeTab === 'Strength' && (
            <div className="glass-card p-5">
              <ShadbalaView kundli={kundli} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Kundli Page ──────────────────────────────────────────────────────

type KundliView = 'landing' | 'create' | 'chart'

export default function KundliPage() {
  const { kundlis, addKundli, getActiveKundli, setActiveKundli, activeKundliId, addXP } = useStore()
  const activeKundli = getActiveKundli()

  const [view, setView] = useState<KundliView>(activeKundli ? 'chart' : 'landing')
  const [editData, setEditData] = useState<BirthFormData | null>(null)

  function handleKundliComplete(data: KundliData) {
    addKundli(data)
    addXP(50, 'KUNDLI_CREATED')
    setView('chart')
  }

  const displayKundli = getActiveKundli() ?? kundlis[0] ?? null

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {kundlis.length > 0 && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 items-center">
            {kundlis.map(k => (
              <button
                key={k.id}
                onClick={() => { setActiveKundli(k.id); setView('chart') }}
                className={`flex-shrink-0 glass-card px-3 py-1.5 text-xs font-cinzel transition-all ${
                  activeKundliId === k.id
                    ? 'text-gold border border-gold/60 bg-gold/10'
                    : 'text-gold/70 border border-gold/20 hover:border-gold/40'
                }`}
              >
                {k.name}
              </button>
            ))}
            <button
              onClick={() => { setEditData(null); setView('create') }}
              className="flex-shrink-0 glass-card px-2.5 py-1.5 text-xs font-cinzel text-gold/70 border border-gold/20 hover:border-gold/40 hover:bg-gold/10 transition-all"
              title="New Chart"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <KundliLanding onStart={() => setView('create')} />
          </motion.div>
        )}
        {view === 'create' && (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4 max-w-lg mx-auto">
              <button
                onClick={() => setView(displayKundli ? 'chart' : 'landing')}
                className="flex items-center gap-1 text-sm font-cinzel text-gold/60 hover:text-gold transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
            </div>
            <CreateKundliForm onComplete={handleKundliComplete} initialData={editData} />
          </motion.div>
        )}
        {view === 'chart' && displayKundli && (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <KundliChartView
              kundli={displayKundli}
              onNew={() => { setEditData(null); setView('create') }}
              onEdit={() => {
                setEditData({
                  name: displayKundli.name,
                  birthDate: displayKundli.birthDate,
                  birthTime: displayKundli.birthTime,
                  birthPlace: displayKundli.birthPlace,
                })
                setView('create')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
