// ============================================================
// Planetary Transit Engine
// Calculates approximate current positions of all 9 Vedic planets
// using simplified astronomical formulas.
// ============================================================

import { NAKSHATRA_NAMES, RASHI_DATA } from '@/lib/vedic-constants'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlanetTransit {
  planet: string
  glyph: string
  longitude: number
  rashi: string
  rashiSymbol: string
  rashiDegree: number
  nakshatra: string
  nakshatraPada: number
  isRetrograde: boolean
  color: string
  dailyMotion: number
}

export interface TransitEvent {
  date: Date
  planet: string
  glyph: string
  description: string
  type: 'sign_change' | 'retrograde' | 'direct' | 'exaltation' | 'debilitation'
  color: string
}

export interface HouseTransit {
  house: number
  planets: string[]
  effect: string
  nature: 'benefic' | 'malefic' | 'mixed'
}

// ─── Epoch & Mean Daily Motions ─────────────────────────────────────────────

// J2000.0 epoch: January 1, 2000, 12:00 TT
const J2000 = new Date('2000-01-01T12:00:00Z').getTime()

// Approximate mean longitudes at J2000 (tropical, degrees)
const EPOCH_LONGITUDES: Record<string, number> = {
  Sun: 280.46,
  Moon: 218.32,
  Mars: 355.45,
  Mercury: 252.25,
  Jupiter: 34.40,
  Venus: 181.98,
  Saturn: 49.94,
  Rahu: 125.04,    // Mean node
  Ketu: 305.04,    // Rahu + 180
}

// Mean daily motion in degrees
const DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mars: 0.5240,
  Mercury: 1.3833,
  Jupiter: 0.0831,
  Venus: 1.2000,
  Saturn: 0.0335,
  Rahu: -0.0530,   // Always retrograde
  Ketu: -0.0530,
}

// Ayanamsa (Lahiri) — approximate for 2024-2027 era
const AYANAMSA = 24.16

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mars: '\u2642', Mercury: '\u263F',
  Jupiter: '\u2643', Venus: '\u2640', Saturn: '\u2644',
  Rahu: '\u260A', Ketu: '\u260B',
}

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFB347', Moon: '#C0C0FF', Mars: '#FF6B6B', Mercury: '#7DF9FF',
  Jupiter: '#FFD700', Venus: '#FFB6C1', Saturn: '#9B87F5',
  Rahu: '#888888', Ketu: '#A0522D',
}

// Exaltation signs (rashi index 0-11)
const EXALTATION: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
}
const DEBILITATION: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0,
}

// ─── Approximate retrograde periods (simplified) ────────────────────────────

function isRetrograde(planet: string, daysSinceEpoch: number): boolean {
  if (planet === 'Rahu' || planet === 'Ketu') return true
  if (planet === 'Sun' || planet === 'Moon') return false

  // Simplified retrograde detection using synodic periods
  const synodicPeriods: Record<string, number> = {
    Mercury: 115.88, Mars: 779.94, Jupiter: 398.88, Venus: 583.9, Saturn: 378.09,
  }
  const retroFraction: Record<string, number> = {
    Mercury: 0.19, Mars: 0.09, Jupiter: 0.30, Venus: 0.07, Saturn: 0.31,
  }

  const period = synodicPeriods[planet]
  if (!period) return false
  const phase = ((daysSinceEpoch % period) + period) % period
  return phase / period > (1 - retroFraction[planet])
}

// ─── Main Calculation ───────────────────────────────────────────────────────

export function getCurrentTransits(date?: Date): PlanetTransit[] {
  const now = date || new Date()
  const daysSinceEpoch = (now.getTime() - J2000) / (1000 * 60 * 60 * 24)

  return Object.keys(EPOCH_LONGITUDES).map(planet => {
    // Calculate tropical longitude
    let tropicalLon = (EPOCH_LONGITUDES[planet] + DAILY_MOTION[planet] * daysSinceEpoch) % 360
    if (tropicalLon < 0) tropicalLon += 360

    // Convert to sidereal (Vedic)
    let siderealLon = (tropicalLon - AYANAMSA + 360) % 360

    // Determine rashi
    const rashiIndex = Math.floor(siderealLon / 30)
    const rashiDegree = siderealLon % 30
    const rashi = RASHI_DATA[rashiIndex]

    // Determine nakshatra
    const nakshatraIndex = Math.floor(siderealLon / (360 / 27))
    const nakshatraPada = Math.floor((siderealLon % (360 / 27)) / (360 / 108)) + 1

    const retro = isRetrograde(planet, daysSinceEpoch)

    return {
      planet,
      glyph: PLANET_GLYPHS[planet],
      longitude: siderealLon,
      rashi: rashi.name,
      rashiSymbol: rashi.symbol,
      rashiDegree: Math.round(rashiDegree * 100) / 100,
      nakshatra: NAKSHATRA_NAMES[nakshatraIndex] || NAKSHATRA_NAMES[0],
      nakshatraPada,
      isRetrograde: retro,
      color: PLANET_COLORS[planet],
      dailyMotion: Math.abs(DAILY_MOTION[planet]),
    }
  })
}

// ─── Transit-to-Natal Analysis ──────────────────────────────────────────────

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Self, personality & new beginnings',
  2: 'Wealth, speech & family values',
  3: 'Courage, siblings & communication',
  4: 'Home, mother & emotional peace',
  5: 'Creativity, children & intelligence',
  6: 'Health, enemies & daily work',
  7: 'Marriage, partnerships & business',
  8: 'Transformation, longevity & occult',
  9: 'Luck, dharma & higher learning',
  10: 'Career, reputation & authority',
  11: 'Gains, friendships & aspirations',
  12: 'Spirituality, losses & liberation',
}

const BENEFICS = new Set(['Jupiter', 'Venus', 'Moon', 'Mercury'])
const MALEFICS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'])

export function getTransitToNatal(
  transits: PlanetTransit[],
  ascendantRashiIndex: number
): HouseTransit[] {
  const houses: HouseTransit[] = []

  for (let h = 1; h <= 12; h++) {
    const houseRashiIndex = (ascendantRashiIndex + h - 1) % 12
    const houseRashi = RASHI_DATA[houseRashiIndex].name
    const planetsInHouse = transits.filter(t => t.rashi === houseRashi)

    if (planetsInHouse.length === 0) continue

    const planetNames = planetsInHouse.map(p => p.planet)
    const beneficCount = planetNames.filter(p => BENEFICS.has(p)).length
    const maleficCount = planetNames.filter(p => MALEFICS.has(p)).length
    const nature: 'benefic' | 'malefic' | 'mixed' =
      beneficCount > maleficCount ? 'benefic' :
      maleficCount > beneficCount ? 'malefic' : 'mixed'

    const effects = planetsInHouse.map(p => {
      const action = BENEFICS.has(p.planet) ? 'expansion' : 'transformation'
      return `${p.planet} brings ${action} to ${HOUSE_MEANINGS[h]?.split(',')[0]?.toLowerCase() || 'this area'}`
    })

    houses.push({
      house: h,
      planets: planetNames,
      effect: effects.join('. ') + '.',
      nature,
    })
  }

  return houses
}

// ─── Upcoming Transit Events ────────────────────────────────────────────────

export function getUpcomingTransits(days: number = 30, fromDate?: Date): TransitEvent[] {
  const start = fromDate || new Date()
  const events: TransitEvent[] = []
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

  for (const planet of planets) {
    // Skip Moon — changes signs too frequently
    if (planet === 'Moon') continue

    let prevTransit = getCurrentTransits(start).find(t => t.planet === planet)!

    for (let d = 1; d <= days; d++) {
      const checkDate = new Date(start.getTime() + d * 24 * 60 * 60 * 1000)
      const current = getCurrentTransits(checkDate).find(t => t.planet === planet)!

      // Sign change
      if (current.rashi !== prevTransit.rashi) {
        const rashiData = RASHI_DATA.find(r => r.name === current.rashi)
        let desc = `${planet} enters ${current.rashi} (${rashiData?.western || ''})`

        // Check exaltation/debilitation
        const rashiIdx = RASHI_DATA.findIndex(r => r.name === current.rashi)
        let type: TransitEvent['type'] = 'sign_change'
        if (EXALTATION[planet] === rashiIdx) {
          desc += ' — Exalted!'
          type = 'exaltation'
        } else if (DEBILITATION[planet] === rashiIdx) {
          desc += ' — Debilitated'
          type = 'debilitation'
        }

        events.push({
          date: checkDate,
          planet,
          glyph: PLANET_GLYPHS[planet],
          description: desc,
          type,
          color: PLANET_COLORS[planet],
        })
      }

      // Retrograde change
      if (current.isRetrograde !== prevTransit.isRetrograde) {
        events.push({
          date: checkDate,
          planet,
          glyph: PLANET_GLYPHS[planet],
          description: `${planet} goes ${current.isRetrograde ? 'Retrograde' : 'Direct'} in ${current.rashi}`,
          type: current.isRetrograde ? 'retrograde' : 'direct',
          color: PLANET_COLORS[planet],
        })
      }

      prevTransit = current
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}
