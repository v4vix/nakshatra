import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useTranslation } from '@/i18n'
import { getCurrentTransits, getUpcomingTransits } from '@/lib/transits'
import { RASHI_DATA, NAKSHATRA_NAMES, DASHA_YEARS, DASHA_SEQUENCE } from '@/lib/vedic-constants'
import {
  ArrowLeft, TrendingUp, Heart, Briefcase, Brain, Star, Shield, Calendar,
  Moon, Sun, Plane, Users, Sparkles, AlertTriangle, ChevronDown, ChevronUp,
  Zap, Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Types ──────────────────────────────────────────────────────────────────

interface YearPrediction {
  area: string
  icon: React.ReactNode
  rating: number
  summary: string
  advice: string
  remedy: string
  keyMonths: string
  color: string
}

interface MonthlyTransit {
  month: string
  monthIndex: number
  theme: string
  majorTransit: string
  impactRating: number
  favorability: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult'
  details: string
}

interface SadeSatiInfo {
  active: boolean
  phase: 'Rising' | 'Peak' | 'Setting' | null
  description: string
  severity: number
  advice: string
}

interface VarshfalInfo {
  munthaHouse: number
  munthaSign: string
  yearLord: string
  yearLordElement: string
  themes: string[]
}

interface DashaInfo {
  mahadasha: string
  antardasha: string
  mahadashaEnd: string
  antardashaEnd: string
  interaction: string
}

interface LuckyFactors {
  colors: string[]
  numbers: number[]
  day: string
  gemstone: string
  metal: string
  deity: string
}

// ─── Varshfal Week-day Lord Cycle ───────────────────────────────────────────
// The Varshfal year lord follows the weekday-planet cycle based on the day
// the solar return falls on. We approximate using birth date.

const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

function getYearLord(birthDate: string, currentYear: number): string {
  // Approximate solar return date (same month/day as birth in current year)
  const bd = new Date(birthDate)
  const solarReturn = new Date(currentYear, bd.getMonth(), bd.getDate())
  const dayOfWeek = solarReturn.getDay()
  return WEEKDAY_LORDS[dayOfWeek]
}

function calculateAge(birthDate: string): number {
  const bd = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const monthDiff = today.getMonth() - bd.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) age--
  return Math.max(0, age)
}

// ─── Sade Sati Detection ────────────────────────────────────────────────────

function detectSadeSati(moonRashiIndex: number): SadeSatiInfo {
  const transits = getCurrentTransits()
  const saturnTransit = transits.find(t => t.planet === 'Saturn')
  if (!saturnTransit) return { active: false, phase: null, description: '', severity: 0, advice: '' }

  const saturnRashiIndex = RASHI_DATA.findIndex(r => r.name === saturnTransit.rashi)
  const diff = ((saturnRashiIndex - moonRashiIndex) + 12) % 12

  if (diff === 11) {
    return {
      active: true,
      phase: 'Rising',
      description: `Saturn transits your 12th house from Moon (${RASHI_DATA[saturnRashiIndex].name}). The rising phase of Sade Sati brings subtle changes -- increased expenses, sleep disturbances, and a feeling of being unsettled. This is the beginning of Saturn's 7.5-year transit near your Moon sign, initiating a period of deep karmic lessons.`,
      severity: 3,
      advice: 'Focus on spiritual practices and meditation. Avoid unnecessary expenditures. Chant "Om Sham Shanaischaraya Namah" 108 times on Saturdays. Donate black sesame seeds and mustard oil on Saturdays. Wear an iron ring on the middle finger.',
    }
  }
  if (diff === 0) {
    return {
      active: true,
      phase: 'Peak',
      description: `Saturn directly transits over your Moon sign (${RASHI_DATA[moonRashiIndex].name}). This is the peak phase of Sade Sati, the most intense period. Emotional turbulence, mental stress, health issues related to stress, and significant life restructuring are common. Relationships and career face their toughest tests, but this is also when the greatest transformation occurs.`,
      severity: 5,
      advice: 'This is Saturn\'s most powerful teaching phase. Practice daily meditation and pranayama. Serve the elderly and disadvantaged. Light a sesame oil lamp on Saturdays. Wear a blue sapphire only after proper astrological consultation. Maintain discipline in diet and sleep schedule.',
    }
  }
  if (diff === 1) {
    return {
      active: true,
      phase: 'Setting',
      description: `Saturn transits your 2nd house from Moon (${RASHI_DATA[saturnRashiIndex].name}). The setting phase of Sade Sati affects family harmony, speech, and accumulated wealth. Financial pressures may continue, but the intensity is gradually reducing. Family relationships require careful nurturing during this phase.`,
      severity: 4,
      advice: 'Guard your speech -- avoid harsh words. Be conservative with finances. Continue Saturday fasting. Donate to the elderly. The hardest lessons are behind you; maintain the discipline you have built.',
    }
  }

  return { active: false, phase: null, description: '', severity: 0, advice: '' }
}

// ─── Varshfal Calculator ────────────────────────────────────────────────────

function calculateVarshfal(
  birthDate: string,
  lagnaIndex: number,
  currentYear: number
): VarshfalInfo {
  const age = calculateAge(birthDate)
  const munthaHouse = (age % 12) + 1
  const munthaSignIndex = (lagnaIndex + age) % 12
  const munthaSign = RASHI_DATA[munthaSignIndex].name
  const yearLord = getYearLord(birthDate, currentYear)

  const yearLordElement = (() => {
    switch (yearLord) {
      case 'Sun': return 'Fire'
      case 'Moon': return 'Water'
      case 'Mars': return 'Fire'
      case 'Mercury': return 'Earth'
      case 'Jupiter': return 'Ether'
      case 'Venus': return 'Water'
      case 'Saturn': return 'Air'
      default: return 'Mixed'
    }
  })()

  const themes: string[] = []
  if (munthaHouse <= 3) themes.push('Personal growth and self-improvement dominate the year')
  else if (munthaHouse <= 6) themes.push('Focus on relationships, creativity, and overcoming obstacles')
  else if (munthaHouse <= 9) themes.push('Partnerships, transformation, and fortune take center stage')
  else themes.push('Career achievements, social expansion, and spiritual completion')

  if (yearLord === 'Jupiter') themes.push('Expansion, wisdom, and blessings from the guru')
  else if (yearLord === 'Venus') themes.push('Artistic expression, romance, and material comforts')
  else if (yearLord === 'Saturn') themes.push('Discipline, hard work, and karmic rewards')
  else if (yearLord === 'Mars') themes.push('Courage, action, and decisive energy')
  else if (yearLord === 'Mercury') themes.push('Communication, intellect, and business acumen')
  else if (yearLord === 'Sun') themes.push('Authority, leadership, and recognition')
  else if (yearLord === 'Moon') themes.push('Emotional growth, intuition, and nurturing energy')

  const munthaLord = RASHI_DATA[munthaSignIndex].ruler
  if (munthaLord === yearLord) themes.push('Muntha lord and Year lord are the same -- a powerfully focused year')

  return { munthaHouse, munthaSign, yearLord, yearLordElement, themes }
}

// ─── Lucky Factors ──────────────────────────────────────────────────────────

function getLuckyFactors(yearLord: string): LuckyFactors {
  const factorsMap: Record<string, LuckyFactors> = {
    Sun: { colors: ['Gold', 'Orange', 'Ruby Red'], numbers: [1, 4, 10], day: 'Sunday', gemstone: 'Ruby (Manik)', metal: 'Gold', deity: 'Lord Surya' },
    Moon: { colors: ['White', 'Silver', 'Pearl'], numbers: [2, 7, 11], day: 'Monday', gemstone: 'Pearl (Moti)', metal: 'Silver', deity: 'Lord Shiva' },
    Mars: { colors: ['Red', 'Coral', 'Scarlet'], numbers: [3, 9, 18], day: 'Tuesday', gemstone: 'Red Coral (Moonga)', metal: 'Copper', deity: 'Lord Hanuman' },
    Mercury: { colors: ['Green', 'Emerald', 'Olive'], numbers: [5, 14, 23], day: 'Wednesday', gemstone: 'Emerald (Panna)', metal: 'Bronze', deity: 'Lord Vishnu' },
    Jupiter: { colors: ['Yellow', 'Saffron', 'Golden'], numbers: [3, 12, 21], day: 'Thursday', gemstone: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', deity: 'Lord Brihaspati' },
    Venus: { colors: ['White', 'Pink', 'Cream'], numbers: [6, 15, 24], day: 'Friday', gemstone: 'Diamond (Heera)', metal: 'Silver', deity: 'Goddess Lakshmi' },
    Saturn: { colors: ['Blue', 'Black', 'Dark Purple'], numbers: [8, 17, 26], day: 'Saturday', gemstone: 'Blue Sapphire (Neelam)', metal: 'Iron', deity: 'Lord Shani Dev' },
  }
  return factorsMap[yearLord] || factorsMap.Sun
}

// ─── Monthly Transit Generator ──────────────────────────────────────────────

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function generateMonthlyTransits(rashiIndex: number, currentYear: number): MonthlyTransit[] {
  return MONTH_NAMES.map((month, i) => {
    const monthStart = new Date(currentYear, i, 1)
    const monthEnd = new Date(currentYear, i + 1, 0)
    const startTransits = getCurrentTransits(monthStart)
    const endTransits = getCurrentTransits(monthEnd)

    // Detect sign changes for major planets
    const majorPlanets = ['Jupiter', 'Saturn', 'Mars', 'Venus', 'Mercury', 'Sun']
    const changes: string[] = []
    for (const planet of majorPlanets) {
      const start = startTransits.find(t => t.planet === planet)
      const end = endTransits.find(t => t.planet === planet)
      if (start && end && start.rashi !== end.rashi) {
        changes.push(`${planet} moves from ${start.rashi} to ${end.rashi}`)
      }
      if (start && end && start.isRetrograde !== end.isRetrograde) {
        changes.push(`${planet} turns ${end.isRetrograde ? 'retrograde' : 'direct'}`)
      }
    }

    // Calculate Jupiter and Saturn positions for this month
    const midMonth = new Date(currentYear, i, 15)
    const midTransits = getCurrentTransits(midMonth)
    const jupiter = midTransits.find(t => t.planet === 'Jupiter')
    const saturn = midTransits.find(t => t.planet === 'Saturn')
    const jupiterFrom = jupiter ? ((RASHI_DATA.findIndex(r => r.name === jupiter.rashi) - rashiIndex + 12) % 12) + 1 : 5
    const saturnFrom = saturn ? ((RASHI_DATA.findIndex(r => r.name === saturn.rashi) - rashiIndex + 12) % 12) + 1 : 3

    const jupiterGood = [1, 2, 5, 7, 9, 11].includes(jupiterFrom)
    const saturnGood = [3, 6, 11].includes(saturnFrom)
    const saturnBad = [1, 4, 8, 10, 12].includes(saturnFrom)

    let impactRating: number
    let favorability: MonthlyTransit['favorability']
    if (jupiterGood && saturnGood) { impactRating = 5; favorability = 'excellent' }
    else if (jupiterGood && !saturnBad) { impactRating = 4; favorability = 'good' }
    else if (!jupiterGood && saturnBad) { impactRating = 2; favorability = 'challenging' }
    else if (saturnBad && changes.some(c => c.includes('retrograde'))) { impactRating = 1; favorability = 'difficult' }
    else { impactRating = 3; favorability = 'neutral' }

    const themes = [
      'Fresh starts and renewed energy',
      'Financial planning and resource management',
      'Communication breakthroughs and learning',
      'Domestic harmony and inner peace',
      'Creative expression and romantic energy',
      'Health focus and daily routine optimization',
      'Partnership developments and negotiations',
      'Deep transformation and hidden gains',
      'Travel, higher learning, and spiritual quests',
      'Career milestones and public recognition',
      'Social expansion and wish fulfillment',
      'Spiritual reflection and closure of cycles',
    ]

    return {
      month,
      monthIndex: i,
      theme: themes[i],
      majorTransit: changes.length > 0 ? changes.join('; ') : `Stable planetary positions in ${RASHI_DATA[(rashiIndex + i) % 12].western}`,
      impactRating,
      favorability,
      details: `Jupiter transits ${jupiterFrom}th from Moon. Saturn transits ${saturnFrom}th from Moon.${changes.length > 0 ? ' ' + changes[0] + '.' : ''}`,
    }
  })
}

// ─── Life Area Predictions (Expanded 8 areas) ──────────────────────────────

function generatePredictions(rashiIndex: number, nakshatraIndex: number): YearPrediction[] {
  const transits = getCurrentTransits()
  const jupiterRashi = transits.find(t => t.planet === 'Jupiter')?.rashi || 'Meena'
  const saturnRashi = transits.find(t => t.planet === 'Saturn')?.rashi || 'Meena'
  const marsRashi = transits.find(t => t.planet === 'Mars')?.rashi || 'Mesha'
  const venusRashi = transits.find(t => t.planet === 'Venus')?.rashi || 'Vrishabha'

  const jupiterFromMoon = ((RASHI_DATA.findIndex(r => r.name === jupiterRashi) - rashiIndex + 12) % 12) + 1
  const saturnFromMoon = ((RASHI_DATA.findIndex(r => r.name === saturnRashi) - rashiIndex + 12) % 12) + 1
  const marsFromMoon = ((RASHI_DATA.findIndex(r => r.name === marsRashi) - rashiIndex + 12) % 12) + 1
  const venusFromMoon = ((RASHI_DATA.findIndex(r => r.name === venusRashi) - rashiIndex + 12) % 12) + 1

  const jupiterBenefic = [1, 2, 5, 7, 9, 11].includes(jupiterFromMoon)
  const saturnChallenge = [1, 2, 12].includes(saturnFromMoon)
  const marsEnergized = [3, 6, 10, 11].includes(marsFromMoon)
  const venusBlessing = [1, 4, 5, 7, 9, 11].includes(venusFromMoon)

  return [
    {
      area: 'Career & Profession',
      icon: <Briefcase size={18} />,
      rating: jupiterBenefic ? (marsEnergized ? 5 : 4) : saturnChallenge ? 2 : 3,
      summary: jupiterBenefic
        ? `Jupiter's transit through your ${jupiterFromMoon}th house brings powerful expansion to career matters. This is a year of upward mobility, recognition from authority figures, and potentially significant promotions or role changes. Your professional reputation receives a boost, and networking opens doors that were previously closed. Those in business may see expansion into new markets or product lines.`
        : saturnChallenge
        ? `Saturn's demanding transit near your Moon sign calls for extraordinary patience and perseverance in career matters. The work may feel unrewarding, promotions delayed, and office dynamics challenging. However, this is Saturn teaching through restriction -- the foundations you lay now through sheer discipline will support your career for decades. Do not make impulsive exits from current positions.`
        : `A year of steady, incremental career progress. While no dramatic shifts are expected, consistent effort in skill development and relationship building at work will compound over time. Mercury's periodic transits through career-relevant houses bring opportunities for important conversations with management.`,
      advice: jupiterBenefic ? 'Take bold steps: apply for promotions, pitch ideas, and network actively. Jupiter rewards initiative.' : 'Be patient and disciplined. Avoid impulsive job changes. Document your achievements quietly.',
      remedy: jupiterBenefic ? 'Wear yellow on Thursdays. Donate to educational causes. Chant Guru mantra before important meetings.' : 'Light a mustard oil lamp on Saturdays. Serve elders. Wear dark blue on Saturdays.',
      keyMonths: jupiterBenefic ? 'March, July, November' : 'April, August, October',
      color: 'text-blue-400',
    },
    {
      area: 'Love & Relationships',
      icon: <Heart size={18} />,
      rating: venusBlessing ? (jupiterFromMoon === 7 ? 5 : 4) : saturnChallenge ? 2 : 3,
      summary: jupiterFromMoon === 7
        ? `Jupiter blesses your 7th house of partnerships, making this an extraordinary year for love and commitment. Existing relationships deepen profoundly, and single individuals have strong chances of meeting their life partner. Marriages initiated this year carry Jupiter's blessings of wisdom and growth. Venus's position in your ${venusFromMoon}th house adds charm and attraction to your personality.`
        : venusBlessing
        ? `Venus graces your chart favorably from the ${venusFromMoon}th house, enhancing romantic prospects and bringing warmth to all close relationships. Existing partnerships benefit from renewed passion and understanding. Social events become more frequent and enjoyable. Creative collaborations with partners yield beautiful results.`
        : saturnChallenge
        ? `Saturn's stern influence tests the strength of your closest bonds. Long-standing resentments may surface, and communication requires extra care. However, relationships that survive Saturn's scrutiny emerge stronger and more authentic. This is a period for mature love -- not fairytale romance, but deep, committed partnership forged through shared challenges.`
        : `Relationships maintain a steady rhythm this year. Venus transits will bring periodic romantic highs, particularly when Venus aspects your 7th house. Focus on consistent emotional availability rather than grand gestures.`,
      advice: jupiterFromMoon === 7 ? 'Open your heart fully. Plan commitments for Jupiter-favorable Thursdays.' : 'Practice patience, active listening, and honest communication daily.',
      remedy: 'Offer white flowers to Goddess Lakshmi on Fridays. Wear white or pink. Gift sweets to couples.',
      keyMonths: venusBlessing ? 'February, May, September' : 'January, June, October',
      color: 'text-pink-400',
    },
    {
      area: 'Finance & Wealth',
      icon: <TrendingUp size={18} />,
      rating: jupiterBenefic ? (jupiterFromMoon === 2 || jupiterFromMoon === 11 ? 5 : 4) : saturnChallenge ? 2 : 3,
      summary: (jupiterFromMoon === 2 || jupiterFromMoon === 11)
        ? `Jupiter directly influences your wealth houses, creating an exceptional year for financial growth. The 2nd house connection expands savings and family wealth, while 11th house connection multiplies gains from all sources. Investments made this year, particularly in education, real estate, or gold, are likely to appreciate significantly. Multiple income sources may emerge.`
        : jupiterBenefic
        ? `Jupiter's positive placement supports overall financial growth, though the impact is indirect. Investments in knowledge and skills will eventually translate to better earnings. Avoid speculative ventures and focus on solid, long-term wealth-building strategies. Mutual funds and systematic investment plans are favored over lump-sum commitments.`
        : saturnChallenge
        ? `Saturn demands financial discipline and austerity. Unexpected expenses related to health or home repairs may arise. This is not the year for risky investments or large purchases on credit. Build an emergency fund if you haven't already. The silver lining: Saturn rewards frugality, and savings accumulated during this transit will serve you well in the years ahead.`
        : `Financial stability is maintained with gradual improvements. Mid-year brings better earning potential as Mercury and Venus transit favorable houses. Avoid lending large sums to friends or relatives. Focus on clearing any existing debts.`,
      advice: jupiterBenefic ? 'Invest in long-term assets. Donate generously on Thursdays to activate Jupiter\'s blessings for wealth.' : 'Budget meticulously. Build a 6-month emergency fund. Avoid lending or borrowing.',
      remedy: 'Keep a brass bowl of turmeric water in the northeast corner of your home. Donate food grains on Thursdays.',
      keyMonths: jupiterBenefic ? 'March, June, November' : 'January, May, September',
      color: 'text-green-400',
    },
    {
      area: 'Health & Wellness',
      icon: <Shield size={18} />,
      rating: saturnChallenge ? 2 : marsEnergized ? 4 : 3,
      summary: saturnChallenge
        ? `Saturn's transit demands heightened attention to physical and mental health. Chronic conditions, particularly related to bones, joints, teeth, and the nervous system, may require medical attention. Mental health is equally important -- anxiety and depressive episodes may intensify if not proactively managed. However, this is an excellent period for establishing sustainable health routines that will serve you for years. Ayurvedic treatments are particularly effective during Saturn transits.`
        : marsEnergized
        ? `Mars energizes your chart from a favorable position in the ${marsFromMoon}th house, boosting physical vitality and competitive drive. Athletic performance peaks during Mars-favorable periods. However, Mars can also bring accidents through overconfidence -- exercise caution in sports and while driving. Channel this energy through structured exercise programs, martial arts, or competitive sports.`
        : `Generally stable health with normal seasonal fluctuations. Pay attention to digestive health as Mercury's transits may affect the stomach and intestines. Regular walks, moderate exercise, and seasonal Ayurvedic routines will maintain your wellbeing. Preventive checkups mid-year are recommended.`,
      advice: saturnChallenge ? 'Prioritize regular medical checkups. Practice yoga daily, especially on Saturdays. Maintain strict sleep hygiene.' : 'Stay active with daily exercise. Include seasonal fruits and maintain hydration.',
      remedy: saturnChallenge ? 'Chant Maha Mrityunjaya mantra 11 times daily. Donate medicines to the needy on Saturdays.' : 'Offer water to the Sun every morning. Practice Surya Namaskar at sunrise.',
      keyMonths: saturnChallenge ? 'February, June, October' : 'April, August, December',
      color: 'text-red-400',
    },
    {
      area: 'Spiritual Growth',
      icon: <Star size={18} />,
      rating: saturnChallenge ? 5 : jupiterBenefic ? 4 : 3,
      summary: saturnChallenge
        ? `Paradoxically, Saturn's most challenging transit is the greatest catalyst for spiritual awakening. When material comforts are restricted, the soul naturally turns inward. This is a profoundly transformative year for meditation, self-inquiry, and connecting with your dharmic purpose. Past-life karmas surface for resolution. Teachers and spiritual guides may appear at unexpected moments. Pilgrimage to holy sites brings lasting peace and clarity.`
        : jupiterBenefic
        ? `Jupiter, the guru planet, favorably positioned in your chart, amplifies spiritual receptivity and wisdom. Sacred texts reveal deeper meanings, meditation practice deepens spontaneously, and synchronicities increase. This is an ideal year to begin formal study of Jyotish, Vedanta, or any spiritual tradition. Connection with a guru or spiritual community strengthens.`
        : `Steady spiritual practice yields cumulative benefits this year. The key is consistency rather than intensity. Even 15 minutes of daily meditation creates a powerful foundation. Attend satsangs and spiritual gatherings during festival seasons for amplified energy.`,
      advice: 'Establish a daily sadhana of at least 20 minutes. Visit temples on auspicious days. Practice gratitude journaling.',
      remedy: 'Light a ghee lamp daily at your home altar. Read or listen to the Bhagavad Gita regularly. Fast on Ekadashi.',
      keyMonths: 'All months are spiritually potent; April and November are peaks',
      color: 'text-purple-400',
    },
    {
      area: 'Education & Knowledge',
      icon: <Brain size={18} />,
      rating: jupiterBenefic ? (jupiterFromMoon === 5 || jupiterFromMoon === 9 ? 5 : 4) : 3,
      summary: (jupiterFromMoon === 5 || jupiterFromMoon === 9)
        ? `Jupiter directly illuminates your houses of learning and higher wisdom, making this a stellar year for education. Competitive exam results favor you strongly. Higher studies, research, and academic publications receive divine support. Those seeking admission to prestigious institutions have enhanced prospects. Learning feels effortless, and intellectual curiosity leads to valuable discoveries and connections.`
        : jupiterBenefic
        ? `Jupiter's general beneficence supports all learning endeavors. Professional certifications, online courses, and skill upgrades are particularly favored. The mind is sharp and retentive. Language learning, technical skills, and creative arts all benefit from this transit. Study groups and intellectual discussions with peers produce breakthrough insights.`
        : `A good year for self-directed study and focused learning. Mercury's periodic favorable transits bring clarity of thought and quick comprehension. Avoid spreading yourself too thin across too many subjects -- depth over breadth yields the best results this year. Read widely but study one subject deeply.`,
      advice: jupiterBenefic ? 'Enroll in advanced courses. Start certifications. Teach others to deepen your own understanding.' : 'Focus on mastering one skill deeply rather than dabbling in many.',
      remedy: 'Offer yellow flowers at a Vishnu temple on Thursdays. Donate books to students. Keep a yellow sapphire or turmeric in your study area.',
      keyMonths: jupiterBenefic ? 'January, May, September' : 'March, July, November',
      color: 'text-cyan-400',
    },
    {
      area: 'Family & Home',
      icon: <Users size={18} />,
      rating: venusBlessing ? 4 : saturnChallenge ? 2 : 3,
      summary: venusBlessing
        ? `Venus's favorable position brings warmth and harmony to family relationships. Home renovation or beautification projects are well-starred. Family celebrations and gatherings bring joy and strengthen bonds. Parent-child relationships improve, and elders in the family provide valuable guidance. Property-related matters resolve in your favor during Venus-strong periods.`
        : saturnChallenge
        ? `Saturn's influence on family matters requires patience and emotional maturity. Elderly family members may need extra care and attention. Property disputes or ancestral issues may surface and demand resolution. The positive aspect is that addressing these long-standing family patterns creates healing for generations. Maintain boundaries while showing compassion.`
        : `Family life follows a comfortable rhythm with minor fluctuations. The 4th house receives mixed influences -- moments of deep contentment alternate with minor domestic disagreements. Prioritize quality time with family members. Home improvements during favorable transits yield lasting satisfaction.`,
      advice: venusBlessing ? 'Plan family celebrations. Invest in home improvements. Spend quality time with parents.' : 'Practice patience with family. Address old issues with compassion, not confrontation.',
      remedy: 'Keep the northeast corner of your home clean and well-lit. Offer food to ancestors on Amavasya. Plant a Tulsi in your home.',
      keyMonths: venusBlessing ? 'April, July, December' : 'February, June, November',
      color: 'text-amber-400',
    },
    {
      area: 'Travel & Adventure',
      icon: <Plane size={18} />,
      rating: jupiterFromMoon === 9 || jupiterFromMoon === 12 ? 5 : marsEnergized ? 4 : 3,
      summary: (jupiterFromMoon === 9 || jupiterFromMoon === 12)
        ? `Jupiter illuminates your travel and foreign-connection houses, making this a landmark year for journeys. Long-distance travel, especially to sacred sites or for higher education, brings lasting rewards. Foreign connections prove valuable for career and personal growth. Pilgrimage travel is especially auspicious and transformative. Immigration or relocation plans receive cosmic support.`
        : marsEnergized
        ? `Mars provides the energy and courage for adventurous travel. Short trips for competitive events, sports, or business negotiations are well-aspected. However, be cautious while driving and during adventure sports -- Mars can bring accidents through overconfidence. Road trips and outdoor activities are more favored than air travel during Mars-dominant periods.`
        : `Moderate travel activity this year. Domestic trips for family occasions and short business journeys proceed smoothly. Plan any major international trips during months when Jupiter or Venus transit your 9th or 12th houses. Avoid travel on Rahu-Ketu axis days for smoother journeys.`,
      advice: jupiterFromMoon === 9 ? 'Plan a pilgrimage or educational trip abroad. Apply for foreign opportunities.' : 'Travel for specific purposes rather than wanderlust. Plan meticulously.',
      remedy: 'Carry a small Hanuman idol while traveling. Offer coconut at a Ganesha temple before long journeys. Chant travel-safety mantras.',
      keyMonths: jupiterFromMoon === 9 ? 'March, July, October' : 'May, August, December',
      color: 'text-teal-400',
    },
  ]
}

// ─── Dasha Context ──────────────────────────────────────────────────────────

function getDashaContext(
  dashas: { currentMahadasha: { planet: string; endDate: string }; currentAntardasha: { planet: string; endDate: string } } | null,
  rashiIndex: number
): DashaInfo {
  if (!dashas) {
    return {
      mahadasha: 'Unknown',
      antardasha: 'Unknown',
      mahadashaEnd: 'N/A',
      antardashaEnd: 'N/A',
      interaction: 'Generate your Kundli to see how your current Dasha period interacts with this year\'s planetary transits. The Mahadasha-Antardasha combination fundamentally colors every prediction and transit interpretation.',
    }
  }

  const md = dashas.currentMahadasha.planet
  const ad = dashas.currentAntardasha.planet
  const transits = getCurrentTransits()
  const jupiter = transits.find(t => t.planet === 'Jupiter')
  const saturn = transits.find(t => t.planet === 'Saturn')

  const interactions: string[] = []

  if (md === 'Jupiter' || ad === 'Jupiter') {
    interactions.push('Jupiter dasha period amplifies all Jupiter transit benefits. Growth, wisdom, and expansion are doubled.')
  }
  if (md === 'Saturn' || ad === 'Saturn') {
    interactions.push('Saturn dasha period intensifies Saturn transit effects. Discipline and karmic lessons are in sharp focus.')
  }
  if (md === 'Venus' || ad === 'Venus') {
    interactions.push('Venus period brings heightened sensitivity to beauty, relationships, and material comforts. Creative and romantic pursuits flourish.')
  }
  if (md === 'Rahu' || ad === 'Rahu') {
    interactions.push('Rahu period brings ambition and unconventional opportunities. Foreign connections and technology-related ventures are highlighted.')
  }
  if (md === 'Mars' || ad === 'Mars') {
    interactions.push('Mars period fuels courage and competitive drive. Property matters and sibling relationships are activated.')
  }
  if (md === 'Mercury' || ad === 'Mercury') {
    interactions.push('Mercury period sharpens intellect and communication. Business, writing, and analytical work receive a boost.')
  }
  if (md === 'Sun' || ad === 'Sun') {
    interactions.push('Sun period emphasizes authority, father, government connections, and personal identity.')
  }
  if (md === 'Moon' || ad === 'Moon') {
    interactions.push('Moon period heightens emotions, intuition, and connection with mother. Mental peace requires conscious effort.')
  }
  if (md === 'Ketu' || ad === 'Ketu') {
    interactions.push('Ketu period brings spiritual insights but may cause detachment from material goals. Past-life patterns emerge.')
  }

  if (interactions.length === 0) {
    interactions.push(`The ${md}-${ad} dasha combination brings its own unique energy to the year's transits.`)
  }

  return {
    mahadasha: md,
    antardasha: ad,
    mahadashaEnd: new Date(dashas.currentMahadasha.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    antardashaEnd: new Date(dashas.currentAntardasha.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    interaction: interactions.join(' '),
  }
}

// ─── Key Planetary Events for the Year ──────────────────────────────────────

interface KeyPlanetaryEvent {
  date: string
  planet: string
  event: string
  impact: 'positive' | 'neutral' | 'challenging'
  description: string
}

function generateKeyEvents(rashiIndex: number, currentYear: number): KeyPlanetaryEvent[] {
  const events: KeyPlanetaryEvent[] = []
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Scan each month boundary for major planetary sign changes and retrogrades
  for (let m = 0; m < 12; m++) {
    const midMonth = new Date(currentYear, m, 15)
    const nextMidMonth = new Date(currentYear, m + 1, 15)
    const currentTransitsData = getCurrentTransits(midMonth)
    const nextTransitsData = getCurrentTransits(nextMidMonth)

    const majorPlanets = ['Jupiter', 'Saturn', 'Mars', 'Venus', 'Mercury']
    for (const planet of majorPlanets) {
      const cur = currentTransitsData.find(t => t.planet === planet)
      const next = nextTransitsData.find(t => t.planet === planet)
      if (!cur || !next) continue

      // Sign change
      if (cur.rashi !== next.rashi) {
        const fromHouse = ((RASHI_DATA.findIndex(r => r.name === cur.rashi) - rashiIndex + 12) % 12) + 1
        const toHouse = ((RASHI_DATA.findIndex(r => r.name === next.rashi) - rashiIndex + 12) % 12) + 1
        const goodHouses = [1, 2, 5, 7, 9, 11]
        const impact: KeyPlanetaryEvent['impact'] = goodHouses.includes(toHouse) ? 'positive' : [6, 8, 12].includes(toHouse) ? 'challenging' : 'neutral'

        events.push({
          date: `${MONTH_NAMES_SHORT[m]}`,
          planet,
          event: `${planet} enters ${next.rashi}`,
          impact,
          description: `${planet} moves from your ${fromHouse}th house to ${toHouse}th house. ${impact === 'positive' ? 'Favorable placement.' : impact === 'challenging' ? 'Requires caution.' : 'Mixed results.'}`,
        })
      }

      // Retrograde transitions
      if (cur.isRetrograde !== next.isRetrograde) {
        events.push({
          date: `${MONTH_NAMES_SHORT[m]}`,
          planet,
          event: `${planet} turns ${next.isRetrograde ? 'retrograde' : 'direct'}`,
          impact: next.isRetrograde ? 'challenging' : 'positive',
          description: next.isRetrograde
            ? `${planet} retrograde slows related matters. Review, revise, and reflect.`
            : `${planet} resumes direct motion. Stalled matters begin to move forward.`,
        })
      }
    }
  }

  // Sort by month and limit
  return events.slice(0, 15)
}

// ─── Annual Transit Summary ─────────────────────────────────────────────────

interface AnnualPlanetSummary {
  planet: string
  glyph: string
  color: string
  signsCovered: string[]
  housesVisited: number[]
  retroPeriods: string[]
  overallImpact: 'highly favorable' | 'favorable' | 'neutral' | 'challenging'
  yearSummary: string
}

function generateAnnualTransitSummary(rashiIndex: number, currentYear: number): AnnualPlanetSummary[] {
  const PLANET_GLYPHS: Record<string, string> = { Jupiter: '♃', Saturn: '♄', Mars: '♂', Venus: '♀', Mercury: '☿' }
  const PLANET_COLORS: Record<string, string> = { Jupiter: '#FFD700', Saturn: '#4169E1', Mars: '#FF4444', Venus: '#FF69B4', Mercury: '#32CD32' }

  return ['Jupiter', 'Saturn', 'Mars', 'Venus', 'Mercury'].map(planet => {
    const signSet = new Set<string>()
    const houseSet = new Set<number>()
    const retroMonths: string[] = []
    let favorableMonths = 0

    const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let m = 0; m < 12; m++) {
      const midMonth = new Date(currentYear, m, 15)
      const transitsData = getCurrentTransits(midMonth)
      const pt = transitsData.find(t => t.planet === planet)
      if (!pt) continue

      signSet.add(pt.rashi)
      const house = ((RASHI_DATA.findIndex(r => r.name === pt.rashi) - rashiIndex + 12) % 12) + 1
      houseSet.add(house)

      if (pt.isRetrograde) retroMonths.push(MONTH_NAMES_SHORT[m])

      const goodHouses = planet === 'Saturn' ? [3, 6, 11] : [1, 2, 5, 7, 9, 11]
      if (goodHouses.includes(house)) favorableMonths++
    }

    const favorableRatio = favorableMonths / 12
    const overallImpact: AnnualPlanetSummary['overallImpact'] =
      favorableRatio >= 0.7 ? 'highly favorable' :
      favorableRatio >= 0.5 ? 'favorable' :
      favorableRatio >= 0.3 ? 'neutral' : 'challenging'

    const summaryMap: Record<string, string> = {
      Jupiter: `Jupiter transits through ${Array.from(signSet).join(' and ')} this year, visiting your ${Array.from(houseSet).map(h => h + 'th').join(', ')} house(s). As the planet of wisdom and expansion, its placement ${overallImpact === 'highly favorable' || overallImpact === 'favorable' ? 'brings growth opportunities and blessings' : 'requires patience and strategic planning'}.`,
      Saturn: `Saturn moves through ${Array.from(signSet).join(' and ')}, influencing your ${Array.from(houseSet).map(h => h + 'th').join(', ')} house(s). Saturn's transit ${overallImpact === 'favorable' || overallImpact === 'highly favorable' ? 'rewards discipline and hard work' : 'tests resilience and demands structure'}.`,
      Mars: `Mars energizes ${Array.from(signSet).join(', ')} this year, activating your ${Array.from(houseSet).map(h => h + 'th').join(', ')} house(s). This ${overallImpact === 'favorable' ? 'fuels ambition and achievement' : 'requires channeling energy constructively'}.`,
      Venus: `Venus graces ${Array.from(signSet).join(', ')}, touching your ${Array.from(houseSet).map(h => h + 'th').join(', ')} house(s). Love, beauty, and material comforts are ${overallImpact === 'favorable' || overallImpact === 'highly favorable' ? 'enhanced' : 'tested for authenticity'}.`,
      Mercury: `Mercury transits multiple signs including ${Array.from(signSet).slice(0, 3).join(', ')}, passing through your ${Array.from(houseSet).map(h => h + 'th').join(', ')} house(s). Communication and commerce are ${overallImpact === 'favorable' ? 'favored' : 'requiring extra attention to detail'}.`,
    }

    return {
      planet,
      glyph: PLANET_GLYPHS[planet] || '',
      color: PLANET_COLORS[planet] || '#FFF',
      signsCovered: Array.from(signSet),
      housesVisited: Array.from(houseSet).sort((a, b) => a - b),
      retroPeriods: retroMonths,
      overallImpact,
      yearSummary: summaryMap[planet] || '',
    }
  })
}

// ─── Favorability Badge ─────────────────────────────────────────────────────

function FavorabilityBadge({ favorability }: { favorability: MonthlyTransit['favorability'] }) {
  const config = {
    excellent: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Excellent' },
    good: { bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400', label: 'Good' },
    neutral: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Neutral' },
    challenging: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', label: 'Challenging' },
    difficult: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', label: 'Difficult' },
  }
  const c = config[favorability]
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.bg} ${c.border} ${c.text} border`}>
      {c.label}
    </span>
  )
}

// ─── Star Rating Component ──────────────────────────────────────────────────

function StarRating({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} className={s <= rating ? 'text-gold fill-gold' : 'text-white/10'} />
      ))}
    </div>
  )
}

// ─── Collapsible Section ────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
  accentColor = 'gold',
}: {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  accentColor?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border border-${accentColor}/20 bg-${accentColor}/5 hover:bg-${accentColor}/10 transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-${accentColor}`}>{icon}</span>
          <h2 className="text-sm font-cinzel font-semibold text-white/90">{title}</h2>
        </div>
        {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function YearAheadPage() {
  const { t } = useTranslation()
  const { getActiveKundli, kundlis } = useStore()
  const currentYear = new Date().getFullYear()
  const [expandedPrediction, setExpandedPrediction] = useState<number | null>(null)

  // Pull actual user data from Kundli
  const activeKundli = getActiveKundli()
  const moonPlanet = activeKundli?.planets.find(p => p.name === 'Moon')
  const sunPlanet = activeKundli?.planets.find(p => p.name === 'Sun')

  const rashiIndex = moonPlanet?.rashiIndex ?? 10 // Default Kumbha if no kundli
  const nakshatraIndex = moonPlanet?.nakshatraIndex ?? 6 // Default Punarvasu
  const lagnaIndex = activeKundli?.ascendant.rashiIndex ?? rashiIndex
  const birthDate = activeKundli?.birthDate ?? '2000-01-15'
  const hasKundli = !!activeKundli

  // Compute all data
  const predictions = useMemo(() => generatePredictions(rashiIndex, nakshatraIndex), [rashiIndex, nakshatraIndex])
  const overallRating = Math.round(predictions.reduce((s, p) => s + p.rating, 0) / predictions.length * 10) / 10
  const sadeSati = useMemo(() => detectSadeSati(rashiIndex), [rashiIndex])
  const varshfal = useMemo(() => calculateVarshfal(birthDate, lagnaIndex, currentYear), [birthDate, lagnaIndex, currentYear])
  const monthlyTransits = useMemo(() => generateMonthlyTransits(rashiIndex, currentYear), [rashiIndex, currentYear])
  const luckyFactors = useMemo(() => getLuckyFactors(varshfal.yearLord), [varshfal.yearLord])
  const dashaInfo = useMemo(() => getDashaContext(activeKundli?.dashas ?? null, rashiIndex), [activeKundli, rashiIndex])
  const keyEvents = useMemo(() => generateKeyEvents(rashiIndex, currentYear), [rashiIndex, currentYear])
  const annualTransitSummary = useMemo(() => generateAnnualTransitSummary(rashiIndex, currentYear), [rashiIndex, currentYear])

  const currentMonth = new Date().getMonth()

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-cinzel text-white">{currentYear} Year Ahead</h1>
          <p className="text-sm text-white/40 font-cormorant">
            {RASHI_DATA[rashiIndex].symbol} {RASHI_DATA[rashiIndex].name} ({RASHI_DATA[rashiIndex].western})
            {hasKundli ? ` \u2022 ${activeKundli.name}` : ' \u2022 Default chart'}
          </p>
        </div>
      </div>

      {/* No Kundli Warning */}
      {!hasKundli && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-300 text-xs font-medium">Using default chart data</p>
              <p className="text-amber-300/60 text-xs mt-0.5">
                Generate your Kundli for personalized predictions based on your exact birth details.
              </p>
              <Link to="/kundli" className="text-gold text-xs underline mt-1 inline-block">
                Generate Kundli
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl mb-6 border border-gold/20 text-center glass-card"
        style={{ background: 'linear-gradient(135deg, rgba(255,179,71,0.08), rgba(168,85,247,0.08))' }}
      >
        <p className="text-gold/60 text-xs uppercase tracking-widest mb-2 font-cinzel">Overall {currentYear} Rating</p>
        <div className="flex justify-center gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <motion.span
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: s * 0.12, type: 'spring', stiffness: 200 }}
            >
              <Star size={28} className={s <= Math.round(overallRating) ? 'text-gold fill-gold' : 'text-white/15'} />
            </motion.span>
          ))}
        </div>
        <p className="text-white text-3xl font-cinzel font-bold">{overallRating}/5</p>
        <p className="text-white/40 text-sm mt-1 font-cormorant">
          Based on Jupiter-Saturn transits from {RASHI_DATA[rashiIndex].name} Moon
        </p>
      </motion.div>

      {/* Sade Sati Alert */}
      {sadeSati.active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-5 rounded-2xl border border-red-500/30 bg-red-500/[0.06]"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-red-400" />
            <h2 className="text-sm font-cinzel font-bold text-red-300">
              Sade Sati Active -- {sadeSati.phase} Phase
            </h2>
            <div className="ml-auto flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full ${s <= sadeSati.severity ? 'bg-red-400' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-white/60 text-sm font-cormorant leading-relaxed mb-3">
            {sadeSati.description}
          </p>
          <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
            <p className="text-gold/80 text-xs font-medium mb-1">Remedies & Guidance</p>
            <p className="text-gold/60 text-xs leading-relaxed">{sadeSati.advice}</p>
          </div>
        </motion.div>
      )}

      {/* Varshfal Section */}
      <CollapsibleSection title="Varshfal (Solar Return)" icon={<Sun size={16} />} defaultOpen={true} accentColor="gold">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-xl border border-gold/15 bg-gold/[0.04]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider">Year Lord</p>
            <p className="text-white font-cinzel font-bold text-lg">{varshfal.yearLord}</p>
            <p className="text-white/40 text-xs">{varshfal.yearLordElement} element</p>
          </div>
          <div className="p-3 rounded-xl border border-gold/15 bg-gold/[0.04]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider">Muntha</p>
            <p className="text-white font-cinzel font-bold text-lg">{varshfal.munthaSign}</p>
            <p className="text-white/40 text-xs">House {varshfal.munthaHouse} from Lagna</p>
          </div>
        </div>
        <div className="space-y-2">
          {varshfal.themes.map((theme, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
              <Sparkles size={12} className="text-gold/60 mt-0.5 shrink-0" />
              <p className="text-white/60 text-xs font-cormorant leading-relaxed">{theme}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Dasha Context */}
      <CollapsibleSection title="Dasha Period Context" icon={<Moon size={16} />} defaultOpen={true} accentColor="purple-400">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-xl border border-purple-500/15 bg-purple-500/[0.04]">
            <p className="text-purple-400/50 text-[10px] uppercase tracking-wider">Mahadasha</p>
            <p className="text-white font-cinzel font-bold">{dashaInfo.mahadasha}</p>
            <p className="text-white/40 text-[10px]">Until {dashaInfo.mahadashaEnd}</p>
          </div>
          <div className="p-3 rounded-xl border border-purple-500/15 bg-purple-500/[0.04]">
            <p className="text-purple-400/50 text-[10px] uppercase tracking-wider">Antardasha</p>
            <p className="text-white font-cinzel font-bold">{dashaInfo.antardasha}</p>
            <p className="text-white/40 text-[10px]">Until {dashaInfo.antardashaEnd}</p>
          </div>
        </div>
        <p className="text-white/50 text-xs font-cormorant leading-relaxed p-2 rounded-lg bg-white/[0.02]">
          {dashaInfo.interaction}
        </p>
      </CollapsibleSection>

      {/* Lucky Factors */}
      <CollapsibleSection title={`Lucky Factors for ${currentYear}`} icon={<Sparkles size={16} />} accentColor="gold">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1">Lucky Colors</p>
            <p className="text-white/80 text-sm font-cormorant">{luckyFactors.colors.join(', ')}</p>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1">Lucky Numbers</p>
            <p className="text-white/80 text-sm font-cormorant">{luckyFactors.numbers.join(', ')}</p>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1">Lucky Day</p>
            <p className="text-white/80 text-sm font-cormorant">{luckyFactors.day}</p>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1">Gemstone</p>
            <p className="text-white/80 text-sm font-cormorant">{luckyFactors.gemstone}</p>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1">Metal</p>
            <p className="text-white/80 text-sm font-cormorant">{luckyFactors.metal}</p>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="text-gold/50 text-[10px] uppercase tracking-wider mb-1">Ruling Deity</p>
            <p className="text-white/80 text-sm font-cormorant">{luckyFactors.deity}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Key Planetary Events */}
      {keyEvents.length > 0 && (
        <CollapsibleSection title={`Key Planetary Events of ${currentYear}`} icon={<Zap size={16} />} defaultOpen={true} accentColor="saffron">
          <div className="relative pl-5 border-l-2 border-white/10 space-y-3 ml-1">
            {keyEvents.map((evt, i) => (
              <motion.div
                key={`${evt.planet}-${evt.date}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative"
              >
                <div
                  className={`absolute -left-[23px] w-2.5 h-2.5 rounded-full border-2 ${
                    evt.impact === 'positive' ? 'border-green-400 bg-green-400/30' :
                    evt.impact === 'challenging' ? 'border-red-400 bg-red-400/30' :
                    'border-yellow-400 bg-yellow-400/30'
                  }`}
                />
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-cinzel text-white/60">{evt.date}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      evt.impact === 'positive' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                      evt.impact === 'challenging' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {evt.impact}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm font-cinzel mb-1">{evt.event}</p>
                  <p className="text-white/40 text-xs font-cormorant leading-relaxed">{evt.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Annual Transit Overview */}
      <CollapsibleSection title="Annual Planetary Overview" icon={<Target size={16} />} accentColor="celestial">
        <div className="space-y-3">
          {annualTransitSummary.map((ps, i) => (
            <motion.div
              key={ps.planet}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg" style={{ color: ps.color }}>{ps.glyph}</span>
                  <h3 className="text-white font-cinzel font-medium text-sm">{ps.planet}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  ps.overallImpact === 'highly favorable' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                  ps.overallImpact === 'favorable' ? 'bg-green-500/15 border-green-500/30 text-green-400' :
                  ps.overallImpact === 'challenging' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                  'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                }`}>
                  {ps.overallImpact}
                </span>
              </div>
              <p className="text-white/50 text-xs font-cormorant leading-relaxed mb-2">{ps.yearSummary}</p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <span className="text-white/20">Signs:</span>
                  {ps.signsCovered.map(s => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 text-white/50">{s}</span>
                  ))}
                </div>
                {ps.retroPeriods.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-red-400/60">
                    <span>Rx:</span>
                    <span>{ps.retroPeriods.join(', ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Life Area Predictions */}
      <CollapsibleSection title="Life Area Predictions" icon={<Star size={16} />} defaultOpen={true} accentColor="gold">
        <div className="space-y-3">
          {predictions.map((pred, i) => {
            const isExpanded = expandedPrediction === i
            return (
              <motion.div
                key={pred.area}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPrediction(isExpanded ? null : i)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={pred.color}>{pred.icon}</span>
                      <h3 className="text-white font-medium text-sm font-cinzel">{pred.area}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={pred.rating} />
                      {isExpanded
                        ? <ChevronUp size={14} className="text-white/30" />
                        : <ChevronDown size={14} className="text-white/30" />}
                    </div>
                  </div>
                  <p className="text-white/50 text-sm font-cormorant leading-relaxed line-clamp-2">
                    {pred.summary}
                  </p>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-white/50 text-sm font-cormorant leading-relaxed">
                          {pred.summary}
                        </p>
                        <div className="p-3 rounded-lg bg-gold/5 border border-gold/15">
                          <p className="text-gold/80 text-xs font-medium mb-1">Advice</p>
                          <p className="text-gold/60 text-xs leading-relaxed">{pred.advice}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                          <p className="text-purple-400/80 text-xs font-medium mb-1">Remedy</p>
                          <p className="text-purple-400/60 text-xs leading-relaxed">{pred.remedy}</p>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
                          <Calendar size={12} className="text-white/30" />
                          <p className="text-white/40 text-xs">
                            <span className="text-white/60 font-medium">Key months:</span> {pred.keyMonths}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </CollapsibleSection>

      {/* Monthly Transit Breakdown */}
      <CollapsibleSection title="Monthly Transit Breakdown" icon={<Calendar size={16} />} defaultOpen={true} accentColor="blue-400">
        <div className="space-y-2">
          {monthlyTransits.map((mt, i) => {
            const isPast = i < currentMonth
            const isCurrent = i === currentMonth

            return (
              <motion.div
                key={mt.month}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-gold/40 bg-gold/[0.08] ring-1 ring-gold/20'
                    : isPast
                    ? 'border-white/5 bg-white/[0.01] opacity-50'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-cinzel font-bold ${isCurrent ? 'text-gold' : 'text-white/70'}`}>
                      {mt.month.slice(0, 3)}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-gold/20 text-gold border border-gold/30">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FavorabilityBadge favorability={mt.favorability} />
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= mt.impactRating ? 'bg-gold' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-xs font-cormorant mb-1">{mt.theme}</p>
                <p className="text-white/30 text-[10px] leading-relaxed">{mt.majorTransit}</p>
              </motion.div>
            )
          })}
        </div>
      </CollapsibleSection>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/15 text-center"
      >
        <p className="text-purple-400/50 text-xs font-cormorant leading-relaxed">
          Predictions are based on planetary transits from your Moon sign, Varshfal calculations,
          and Vimshottari Dasha analysis. For the most accurate results, ensure your Kundli is
          generated with precise birth time and location.
        </p>
      </motion.div>
    </div>
  )
}
