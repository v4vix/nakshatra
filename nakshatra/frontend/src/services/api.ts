// Nakshatra API Service Layer
// Bridges frontend types with backend API endpoints

import type { KundliData } from '@/store'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

// ─── Geocoding (free Nominatim API) ──────────────────────────────────────────

interface GeoResult {
  lat: number
  lon: number
  timezone: number
}

// Simple city → coords cache to avoid repeated lookups
const geoCache = new Map<string, GeoResult>()

// Well-known Indian cities for instant lookup (covers 80%+ of users)
const KNOWN_CITIES: Record<string, GeoResult> = {
  'delhi': { lat: 28.6139, lon: 77.2090, timezone: 5.5 },
  'new delhi': { lat: 28.6139, lon: 77.2090, timezone: 5.5 },
  'mumbai': { lat: 19.0760, lon: 72.8777, timezone: 5.5 },
  'bangalore': { lat: 12.9716, lon: 77.5946, timezone: 5.5 },
  'bengaluru': { lat: 12.9716, lon: 77.5946, timezone: 5.5 },
  'chennai': { lat: 13.0827, lon: 80.2707, timezone: 5.5 },
  'kolkata': { lat: 22.5726, lon: 88.3639, timezone: 5.5 },
  'hyderabad': { lat: 17.3850, lon: 78.4867, timezone: 5.5 },
  'pune': { lat: 18.5204, lon: 73.8567, timezone: 5.5 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714, timezone: 5.5 },
  'jaipur': { lat: 26.9124, lon: 75.7873, timezone: 5.5 },
  'lucknow': { lat: 26.8467, lon: 80.9462, timezone: 5.5 },
  'kanpur': { lat: 26.4499, lon: 80.3319, timezone: 5.5 },
  'nagpur': { lat: 21.1458, lon: 79.0882, timezone: 5.5 },
  'indore': { lat: 22.7196, lon: 75.8577, timezone: 5.5 },
  'bhopal': { lat: 23.2599, lon: 77.4126, timezone: 5.5 },
  'patna': { lat: 25.6093, lon: 85.1376, timezone: 5.5 },
  'vadodara': { lat: 22.3072, lon: 73.1812, timezone: 5.5 },
  'surat': { lat: 21.1702, lon: 72.8311, timezone: 5.5 },
  'varanasi': { lat: 25.3176, lon: 82.9739, timezone: 5.5 },
  'chandigarh': { lat: 30.7333, lon: 76.7794, timezone: 5.5 },
  'coimbatore': { lat: 11.0168, lon: 76.9558, timezone: 5.5 },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366, timezone: 5.5 },
  'kochi': { lat: 9.9312, lon: 76.2673, timezone: 5.5 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185, timezone: 5.5 },
  'agra': { lat: 27.1767, lon: 78.0081, timezone: 5.5 },
  'nashik': { lat: 19.9975, lon: 73.7898, timezone: 5.5 },
  'ujjain': { lat: 23.1765, lon: 75.7885, timezone: 5.5 },
  'gurgaon': { lat: 28.4595, lon: 77.0266, timezone: 5.5 },
  'noida': { lat: 28.5355, lon: 77.3910, timezone: 5.5 },
  'guwahati': { lat: 26.1445, lon: 91.7362, timezone: 5.5 },
  'dehradun': { lat: 30.3165, lon: 78.0322, timezone: 5.5 },
  'ranchi': { lat: 23.3441, lon: 85.3096, timezone: 5.5 },
  'amritsar': { lat: 31.6340, lon: 74.8723, timezone: 5.5 },
  'allahabad': { lat: 25.4358, lon: 81.8463, timezone: 5.5 },
  'prayagraj': { lat: 25.4358, lon: 81.8463, timezone: 5.5 },
  // International cities
  'new york': { lat: 40.7128, lon: -74.0060, timezone: -5 },
  'london': { lat: 51.5074, lon: -0.1278, timezone: 0 },
  'dubai': { lat: 25.2048, lon: 55.2708, timezone: 4 },
  'singapore': { lat: 1.3521, lon: 103.8198, timezone: 8 },
  'sydney': { lat: -33.8688, lon: 151.2093, timezone: 11 },
  'toronto': { lat: 43.6532, lon: -79.3832, timezone: -5 },
  'san francisco': { lat: 37.7749, lon: -122.4194, timezone: -8 },
  'los angeles': { lat: 34.0522, lon: -118.2437, timezone: -8 },
  'chicago': { lat: 41.8781, lon: -87.6298, timezone: -6 },
  'kathmandu': { lat: 27.7172, lon: 85.3240, timezone: 5.75 },
  'colombo': { lat: 6.9271, lon: 79.8612, timezone: 5.5 },
  'dhaka': { lat: 23.8103, lon: 90.4125, timezone: 6 },
  'kuala lumpur': { lat: 3.1390, lon: 101.6869, timezone: 8 },
}

// Rough timezone estimation from longitude
function estimateTimezone(lon: number): number {
  return Math.round(lon / 15 * 2) / 2
}

async function geocodePlace(place: string): Promise<GeoResult> {
  const key = place.toLowerCase().trim()

  // Check known cities
  if (KNOWN_CITIES[key]) return KNOWN_CITIES[key]

  // Check words within the place string
  for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
    if (key.includes(city)) return coords
  }

  // Check cache
  if (geoCache.has(key)) return geoCache.get(key)!

  // Fallback to Nominatim (free, no API key needed)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'Nakshatra-VedicApp/1.0' }, signal: AbortSignal.timeout(4000) }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.length > 0) {
        const result: GeoResult = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          timezone: estimateTimezone(parseFloat(data[0].lon)),
        }
        geoCache.set(key, result)
        return result
      }
    }
  } catch {
    // Geocoding failed, use default
  }

  // Last resort: default to Delhi
  return { lat: 28.6139, lon: 77.2090, timezone: 5.5 }
}

// ─── Dignity mapping ─────────────────────────────────────────────────────────

const GRAHAS_BY_NAME: Record<string, number> = {
  Sun: 1, Moon: 2, Mars: 3, Mercury: 4, Jupiter: 5, Venus: 6, Saturn: 7, Rahu: 8, Ketu: 9,
}

const EXALTATION: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 2, Ketu: 8,
}
const DEBILITATION: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0, Rahu: 8, Ketu: 2,
}
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10], Rahu: [10], Ketu: [7],
}

function getDignity(planet: string, rashiIndex: number): string {
  if (EXALTATION[planet] === rashiIndex) return 'Exalted'
  if (DEBILITATION[planet] === rashiIndex) return 'Debilitated'
  if (OWN_SIGNS[planet]?.includes(rashiIndex)) return 'Own'
  return 'Neutral'
}

// ─── Backend response → KundliData mapping ───────────────────────────────────

interface BackendPlanet {
  planet: string
  rashi: string
  rashiIndex: number
  house: number
  degree: number
  degreeInRashi: number
  nakshatra: string
  pada: number
  isRetrograde: boolean
}

interface BackendKundliResponse {
  success: boolean
  kundli: {
    name: string
    dateOfBirth: string
    placeOfBirth: string
    latitude: number
    longitude: number
    lahiriAyanamsa: number
    lagna: { rashiName: string; rashiIndex: number; degree: number; nakshatra: string; pada: number }
    moonSign: string
    sunSign: string
    birthNakshatra: string
    birthNakshatraPada: number
    birthNakshatraLord: string
    planets: Record<string, BackendPlanet>
    houses: Array<{ houseNumber: number; rashiIndex: number; rashiName: string }>
    yogas: { present: string[]; details: Array<{ name: string; description: string; planets: string[]; isPresent: boolean }> }
    doshas: { present: string[]; details: Array<{ name: string; description: string; isPresent: boolean; severity: string; remedies: string[] }> }
    dasha: {
      current: string
      sequence: Array<{ planet: string; startDate: string; endDate: string; durationYears: number }>
      birthNakshatraLord: string
    }
  }
  interpretation?: string
}

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
]

function nakshatraNameToIndex(name: string): number {
  const idx = NAKSHATRA_NAMES.indexOf(name)
  return idx >= 0 ? idx : 0
}

function mapBackendToKundliData(
  resp: BackendKundliResponse,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): KundliData {
  const k = resp.kundli

  const planets = Object.values(k.planets).map((p: BackendPlanet) => ({
    grahaId: GRAHAS_BY_NAME[p.planet] ?? 0,
    name: p.planet,
    rashiIndex: p.rashiIndex,
    houseNumber: p.house,
    degree: p.degreeInRashi,
    nakshatraIndex: nakshatraNameToIndex(p.nakshatra),
    pada: p.pada,
    isRetrograde: p.isRetrograde,
    dignity: getDignity(p.planet, p.rashiIndex),
  }))

  // Map yogas
  const yogas = k.yogas.details.map(y => ({
    name: y.name,
    type: classifyYoga(y.name),
    strength: 'Strong',
    description: y.description,
  }))
  if (yogas.length === 0) {
    yogas.push({
      name: 'Dharma Karma Yoga',
      type: 'Miscellaneous',
      strength: 'Moderate',
      description: 'An alignment between dharma (9th) and karma (10th) lords suggests spiritual purpose guiding your life path.',
    })
  }

  // Map doshas
  const doshas = k.doshas.details
    .filter(d => d.isPresent)
    .map(d => ({
      name: d.name,
      severity: d.severity,
      description: d.description,
    }))

  // Map dasha sequence
  const mahadashas = k.dasha.sequence.map(d => ({
    planet: d.planet,
    startDate: d.startDate,
    endDate: d.endDate,
    years: d.durationYears,
  }))

  const now = new Date()
  const currentMaha = mahadashas.find(m => new Date(m.startDate) <= now && new Date(m.endDate) >= now) || mahadashas[0]
  const DASHA_SEQ = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
  const currentAntar = {
    planet: DASHA_SEQ[(DASHA_SEQ.indexOf(currentMaha.planet) + 3) % 9],
    startDate: currentMaha.startDate,
    endDate: currentMaha.endDate,
  }

  return {
    id: crypto.randomUUID(),
    name: k.name,
    birthDate,
    birthTime: birthTime || '12:00',
    birthPlace,
    birthLat: k.latitude,
    birthLon: k.longitude,
    ascendant: {
      rashiIndex: k.lagna.rashiIndex,
      degree: k.lagna.degree,
      nakshatraIndex: nakshatraNameToIndex(k.lagna.nakshatra),
      pada: k.lagna.pada,
    },
    planets,
    dashas: { mahadashas, currentMahadasha: currentMaha, currentAntardasha: currentAntar },
    yogas,
    doshas,
    createdAt: new Date().toISOString(),
  }
}

function classifyYoga(name: string): string {
  if (name.includes('Ruchaka') || name.includes('Bhadra') || name.includes('Hamsa') || name.includes('Malavya') || name.includes('Shasha'))
    return 'Pancha Mahapurusha'
  if (name.includes('Gaja Kesari') || name.includes('Chandra'))
    return 'Chandra'
  if (name.includes('Raj') || name.includes('Kendra') || name.includes('Trikona'))
    return 'Raj'
  if (name.includes('Dhana') || name.includes('Lakshmi'))
    return 'Dhana'
  return 'Miscellaneous'
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function calculateKundli(
  name: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string,
): Promise<{ data: KundliData; source: 'api' | 'local' }> {
  const geo = await geocodePlace(birthPlace)
  const dateOfBirth = `${birthDate}T${birthTime || '12:00'}`

  try {
    const res = await fetch(`${API_BASE}/kundli/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        dateOfBirth,
        latitude: geo.lat,
        longitude: geo.lon,
        timezone: geo.timezone,
        place: birthPlace,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (res.ok) {
      const resp: BackendKundliResponse = await res.json()
      if (resp.success) {
        return { data: mapBackendToKundliData(resp, birthDate, birthTime, birthPlace), source: 'api' }
      }
    }
  } catch {
    // Backend unavailable — fall through to local
  }

  // Return null to signal caller should use local fallback
  return { data: null as any, source: 'local' }
}

// ─── Oracle API ──────────────────────────────────────────────────────────────

export async function oracleChat(
  query: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/oracle/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK: 5, stream: true }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok || !res.body) {
      onError('Oracle service unavailable')
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const payload = JSON.parse(line.slice(6))
          if (payload.type === 'text') onChunk(payload.content)
          else if (payload.type === 'done') onDone()
          else if (payload.type === 'error') onError(payload.content)
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
    onDone()
  } catch {
    onError('Failed to connect to Oracle')
  }
}

// ─── Tarot API ───────────────────────────────────────────────────────────────

export async function drawTarotCards(count: number): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/tarot/draw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      return data.cards || null
    }
  } catch { /* fallback to local */ }
  return null
}

// ─── Numerology API ──────────────────────────────────────────────────────────

export async function calculateNumerology(fullName: string, dateOfBirth: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/numerology/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, dateOfBirth }),
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) return await res.json()
  } catch { /* fallback to local */ }
  return null
}

// ─── Scripture API ───────────────────────────────────────────────────────────

export async function getDailyShloka(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/scripture/daily`, { signal: AbortSignal.timeout(5000) })
    if (res.ok) return await res.json()
  } catch { /* fallback */ }
  return null
}

// ─── Vastu API ───────────────────────────────────────────────────────────────

export async function analyzeVastu(zones: string[]): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/vastu/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zones }),
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) return await res.json()
  } catch { /* fallback */ }
  return null
}

// ─── Health check ────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}
