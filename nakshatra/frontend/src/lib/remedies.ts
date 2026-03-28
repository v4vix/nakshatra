// ============================================================
// Personalized Vedic Remedies Engine
// Comprehensive remedy database organized by planet with
// mantras, gemstones, donations, lifestyle, and rituals.
// ============================================================

import { NAKSHATRA_LORDS, RASHI_DATA, VARA_PLANETS } from '@/lib/vedic-constants'

// ─── Types ──────────────────────────────────────────────────────────────────

export type RemedyType = 'mantra' | 'gemstone' | 'donation' | 'lifestyle' | 'ritual'
export type Difficulty = 'easy' | 'medium' | 'advanced'

export interface Remedy {
  id: string
  planet: string
  type: RemedyType
  name: string
  description: string
  howTo: string
  frequency: 'daily' | 'weekly' | 'onOccasion'
  bestDay: string
  bestTime: string
  difficulty: Difficulty
  isPremium: boolean
  icon: string
}

export interface PlanetStrength {
  planet: string
  strength: number // 0-100
  status: 'strong' | 'moderate' | 'weak'
  color: string
}

// ─── Remedy Database ────────────────────────────────────────────────────────

const REMEDIES: Remedy[] = [
  // ── Sun ──
  { id: 'sun-1', planet: 'Sun', type: 'mantra', name: 'Aditya Hrudayam', description: 'Powerful hymn praising the Sun God, bestowing courage and success.', howTo: 'Recite facing east during sunrise. Complete 108 repetitions using a rudraksha mala.', frequency: 'daily', bestDay: 'Sunday', bestTime: 'Sunrise (6-7 AM)', difficulty: 'medium', isPremium: false, icon: '\u{1F64F}' },
  { id: 'sun-2', planet: 'Sun', type: 'mantra', name: 'Gayatri Mantra', description: 'The most sacred Vedic mantra invoking the solar deity Savitri.', howTo: 'Chant "Om Bhur Bhuva Swaha, Tat Savitur Varenyam..." 108 times at dawn.', frequency: 'daily', bestDay: 'Sunday', bestTime: 'Brahma Muhurta (4-6 AM)', difficulty: 'easy', isPremium: false, icon: '\u2728' },
  { id: 'sun-3', planet: 'Sun', type: 'gemstone', name: 'Ruby (Manikya)', description: 'The king of gemstones, Ruby strengthens the Sun and boosts confidence, leadership, and vitality.', howTo: 'Wear a natural Ruby (minimum 3 carats) set in gold on the ring finger of the right hand. Energize on a Sunday morning.', frequency: 'onOccasion', bestDay: 'Sunday', bestTime: 'Morning during Shukla Paksha', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },
  { id: 'sun-4', planet: 'Sun', type: 'donation', name: 'Wheat & Jaggery Donation', description: 'Offering wheat and jaggery to the needy appeases a weak Sun.', howTo: 'Donate wheat, jaggery, and copper items to a temple or the poor on Sundays.', frequency: 'weekly', bestDay: 'Sunday', bestTime: 'Before noon', difficulty: 'easy', isPremium: false, icon: '\u{1F33E}' },
  { id: 'sun-5', planet: 'Sun', type: 'lifestyle', name: 'Surya Namaskar', description: '12 yoga postures saluting the Sun — boosts physical vitality and solar energy.', howTo: 'Perform 12 rounds of Surya Namaskar facing east at sunrise. Focus on breath synchronization.', frequency: 'daily', bestDay: 'Any day', bestTime: 'Sunrise', difficulty: 'easy', isPremium: false, icon: '\u{1F9D8}' },

  // ── Moon ──
  { id: 'moon-1', planet: 'Moon', type: 'mantra', name: 'Chandra Mantra', description: 'Calms the mind, improves emotional balance, and enhances intuition.', howTo: 'Chant "Om Shram Shreem Shroum Sah Chandramase Namah" 108 times facing the Moon.', frequency: 'daily', bestDay: 'Monday', bestTime: 'Evening (after sunset)', difficulty: 'easy', isPremium: false, icon: '\u{1F319}' },
  { id: 'moon-2', planet: 'Moon', type: 'gemstone', name: 'Pearl (Moti)', description: 'Natural Pearl strengthens emotional stability, mental peace, and relationships.', howTo: 'Wear a natural Pearl (minimum 5 carats) in silver on the little finger. Energize on Monday during Shukla Paksha.', frequency: 'onOccasion', bestDay: 'Monday', bestTime: 'Morning', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },
  { id: 'moon-3', planet: 'Moon', type: 'donation', name: 'Rice & Milk Offering', description: 'White-colored items strengthen the Moon\'s energy in your chart.', howTo: 'Donate rice, milk, white cloth, or silver to a temple on Mondays or Purnima.', frequency: 'weekly', bestDay: 'Monday', bestTime: 'Evening', difficulty: 'easy', isPremium: false, icon: '\u{1F35A}' },
  { id: 'moon-4', planet: 'Moon', type: 'lifestyle', name: 'Moon Gazing Meditation', description: 'Tratak (gazing) on the full moon calms the mind and enhances psychic abilities.', howTo: 'On Purnima night, sit comfortably and gaze at the moon for 10-15 minutes. Close eyes and visualize the cool moonlight.', frequency: 'weekly', bestDay: 'Monday', bestTime: 'Full Moon night', difficulty: 'easy', isPremium: false, icon: '\u{1F315}' },

  // ── Mars ──
  { id: 'mars-1', planet: 'Mars', type: 'mantra', name: 'Hanuman Chalisa', description: 'The 40 verses praising Lord Hanuman pacify Mars and grant courage and protection.', howTo: 'Recite Hanuman Chalisa on Tuesday mornings after bath. Visit a Hanuman temple if possible.', frequency: 'weekly', bestDay: 'Tuesday', bestTime: 'Morning (before 10 AM)', difficulty: 'easy', isPremium: false, icon: '\u{1F4AA}' },
  { id: 'mars-2', planet: 'Mars', type: 'gemstone', name: 'Red Coral (Moonga)', description: 'Red Coral boosts courage, vitality, and helps overcome enemies and obstacles.', howTo: 'Wear natural Red Coral (minimum 5 carats) in gold/copper on the ring finger. Energize on Tuesday.', frequency: 'onOccasion', bestDay: 'Tuesday', bestTime: 'Morning during Shukla Paksha', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },
  { id: 'mars-3', planet: 'Mars', type: 'donation', name: 'Red Lentil Donation', description: 'Red-colored items and lentils appease a malefic Mars.', howTo: 'Donate red lentils (masoor dal), red cloth, or jaggery on Tuesdays.', frequency: 'weekly', bestDay: 'Tuesday', bestTime: 'Before noon', difficulty: 'easy', isPremium: false, icon: '\u2764\uFE0F' },
  { id: 'mars-4', planet: 'Mars', type: 'ritual', name: 'Mangal Dosha Puja', description: 'Special puja to pacify Mars for those with Mangal Dosha in their chart.', howTo: 'Perform Kuja Dosha Nivarana puja at a Hanuman or Subramanya temple with a qualified priest.', frequency: 'onOccasion', bestDay: 'Tuesday', bestTime: 'Morning', difficulty: 'advanced', isPremium: true, icon: '\u{1F525}' },

  // ── Mercury ──
  { id: 'merc-1', planet: 'Mercury', type: 'mantra', name: 'Vishnu Sahasranama', description: 'The 1000 names of Lord Vishnu sharpen intellect and communication skills.', howTo: 'Recite or listen to Vishnu Sahasranama on Wednesdays. Even partial recitation is beneficial.', frequency: 'weekly', bestDay: 'Wednesday', bestTime: 'Morning', difficulty: 'medium', isPremium: false, icon: '\u{1F4DA}' },
  { id: 'merc-2', planet: 'Mercury', type: 'donation', name: 'Green Moong Donation', description: 'Green items strengthen Mercury and improve communication and business luck.', howTo: 'Donate green moong dal, green vegetables, or green cloth on Wednesdays.', frequency: 'weekly', bestDay: 'Wednesday', bestTime: 'Before noon', difficulty: 'easy', isPremium: false, icon: '\u{1F96C}' },
  { id: 'merc-3', planet: 'Mercury', type: 'lifestyle', name: 'Learning & Journaling', description: 'Mercury governs intellect. Regular learning and writing strengthens it.', howTo: 'Spend 30 minutes daily reading scripture or writing in a journal. Practice new skills on Wednesdays.', frequency: 'daily', bestDay: 'Wednesday', bestTime: 'Morning', difficulty: 'easy', isPremium: false, icon: '\u270D\uFE0F' },

  // ── Jupiter ──
  { id: 'jup-1', planet: 'Jupiter', type: 'mantra', name: 'Guru Mantra', description: 'Chanting Jupiter\'s beej mantra brings wisdom, prosperity, and spiritual growth.', howTo: 'Chant "Om Gram Greem Groum Sah Gurave Namah" 108 times using a turmeric mala.', frequency: 'daily', bestDay: 'Thursday', bestTime: 'Morning', difficulty: 'easy', isPremium: false, icon: '\u{1F4D6}' },
  { id: 'jup-2', planet: 'Jupiter', type: 'gemstone', name: 'Yellow Sapphire (Pukhraj)', description: 'The most powerful Jupiter gemstone — attracts wealth, wisdom, and marital bliss.', howTo: 'Wear natural Yellow Sapphire (minimum 3 carats) in gold on the index finger. Energize on Thursday.', frequency: 'onOccasion', bestDay: 'Thursday', bestTime: 'Morning during Shukla Paksha', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },
  { id: 'jup-3', planet: 'Jupiter', type: 'donation', name: 'Banana & Turmeric Offering', description: 'Yellow items please Jupiter and attract blessings of Guru.', howTo: 'Donate bananas, turmeric, yellow cloth, or gold to a temple or Brahmin on Thursdays.', frequency: 'weekly', bestDay: 'Thursday', bestTime: 'Before noon', difficulty: 'easy', isPremium: false, icon: '\u{1F34C}' },
  { id: 'jup-4', planet: 'Jupiter', type: 'lifestyle', name: 'Teach & Share Knowledge', description: 'Jupiter is the Guru planet. Teaching others strengthens its energy.', howTo: 'Volunteer to teach, mentor someone, or share your knowledge freely. Do this especially on Thursdays.', frequency: 'weekly', bestDay: 'Thursday', bestTime: 'Any time', difficulty: 'easy', isPremium: false, icon: '\u{1F393}' },

  // ── Venus ──
  { id: 'ven-1', planet: 'Venus', type: 'mantra', name: 'Lakshmi Mantra', description: 'Invoking Goddess Lakshmi through Venus\'s energy brings beauty, love, and prosperity.', howTo: 'Chant "Om Shree Mahalakshmyai Namah" 108 times on Fridays wearing white.', frequency: 'weekly', bestDay: 'Friday', bestTime: 'Morning or evening', difficulty: 'easy', isPremium: false, icon: '\u{1F338}' },
  { id: 'ven-2', planet: 'Venus', type: 'gemstone', name: 'Diamond / White Sapphire', description: 'Diamond amplifies Venus energy for love, creativity, luxury, and artistic talent.', howTo: 'Wear Diamond or White Sapphire in platinum/silver on the middle finger. Energize on Friday.', frequency: 'onOccasion', bestDay: 'Friday', bestTime: 'Morning during Shukla Paksha', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },
  { id: 'ven-3', planet: 'Venus', type: 'lifestyle', name: 'Artistic Practice', description: 'Venus governs arts and beauty. Creative expression strengthens it.', howTo: 'Engage in music, painting, dance, or any art form regularly, especially on Fridays.', frequency: 'weekly', bestDay: 'Friday', bestTime: 'Evening', difficulty: 'easy', isPremium: false, icon: '\u{1F3A8}' },

  // ── Saturn ──
  { id: 'sat-1', planet: 'Saturn', type: 'mantra', name: 'Shani Mantra', description: 'The beej mantra of Saturn reduces Sade Sati effects and builds patience.', howTo: 'Chant "Om Pram Preem Proum Sah Shanaischaraya Namah" 108 times on Saturdays.', frequency: 'weekly', bestDay: 'Saturday', bestTime: 'Evening', difficulty: 'easy', isPremium: false, icon: '\u{1F3AF}' },
  { id: 'sat-2', planet: 'Saturn', type: 'gemstone', name: 'Blue Sapphire (Neelam)', description: 'Extremely powerful stone — must be tested first. Brings sudden fortune or misfortune.', howTo: 'CAUTION: Trial wear for 3 days first. Wear in silver on middle finger ONLY after consulting an astrologer.', frequency: 'onOccasion', bestDay: 'Saturday', bestTime: 'Evening during Shukla Paksha', difficulty: 'advanced', isPremium: true, icon: '\u26A0\uFE0F' },
  { id: 'sat-3', planet: 'Saturn', type: 'donation', name: 'Black Sesame & Oil', description: 'Black items appease Saturn and reduce Sade Sati difficulties.', howTo: 'Donate black sesame seeds, mustard oil, black cloth, or iron items on Saturdays.', frequency: 'weekly', bestDay: 'Saturday', bestTime: 'Before sunset', difficulty: 'easy', isPremium: false, icon: '\u{1F311}' },
  { id: 'sat-4', planet: 'Saturn', type: 'lifestyle', name: 'Serve the Elderly', description: 'Saturn governs old age and karma. Serving elders pleases Saturn directly.', howTo: 'Help elderly people, visit old age homes, or volunteer at senior centers, especially on Saturdays.', frequency: 'weekly', bestDay: 'Saturday', bestTime: 'Any time', difficulty: 'easy', isPremium: false, icon: '\u{1F9D3}' },

  // ── Rahu ──
  { id: 'rahu-1', planet: 'Rahu', type: 'mantra', name: 'Durga Mantra', description: 'Goddess Durga protects against Rahu\'s illusions and obsessive tendencies.', howTo: 'Chant "Om Durgaye Namah" 108 times. Recite Durga Saptashati during Navaratri.', frequency: 'daily', bestDay: 'Saturday', bestTime: 'Evening', difficulty: 'medium', isPremium: false, icon: '\u{1F52E}' },
  { id: 'rahu-2', planet: 'Rahu', type: 'donation', name: 'Coconut Offering', description: 'Breaking a coconut at a temple dissolves Rahu\'s negative influences.', howTo: 'Offer a whole coconut at a Durga or Kali temple on Saturdays. Donate blue/black items.', frequency: 'weekly', bestDay: 'Saturday', bestTime: 'Evening', difficulty: 'easy', isPremium: false, icon: '\u{1F965}' },
  { id: 'rahu-3', planet: 'Rahu', type: 'gemstone', name: 'Hessonite (Gomed)', description: 'Hessonite garnet channels Rahu\'s energy positively for material success.', howTo: 'Wear Gomed (minimum 5 carats) in silver on the middle finger. Energize on Saturday evening.', frequency: 'onOccasion', bestDay: 'Saturday', bestTime: 'Evening during Krishna Paksha', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },

  // ── Ketu ──
  { id: 'ketu-1', planet: 'Ketu', type: 'mantra', name: 'Ganesha Mantra', description: 'Lord Ganesha removes obstacles created by Ketu and enhances spiritual insight.', howTo: 'Chant "Om Gam Ganapataye Namah" 108 times. Best done during sandhya kaal (twilight).', frequency: 'daily', bestDay: 'Tuesday', bestTime: 'Twilight', difficulty: 'easy', isPremium: false, icon: '\u{1F418}' },
  { id: 'ketu-2', planet: 'Ketu', type: 'donation', name: 'Blanket Donation', description: 'Ketu rules detachment. Warm donations help balance its energy.', howTo: 'Donate blankets, warm clothes, or seven-grain mix (sapta dhanya) on Tuesdays or during eclipses.', frequency: 'weekly', bestDay: 'Tuesday', bestTime: 'Morning', difficulty: 'easy', isPremium: false, icon: '\u{1F9E3}' },
  { id: 'ketu-3', planet: 'Ketu', type: 'lifestyle', name: 'Meditation & Spirituality', description: 'Ketu governs moksha. Deep meditation aligns with its spiritual energy.', howTo: 'Practice 20 minutes of silent meditation daily. Focus on detachment from material desires.', frequency: 'daily', bestDay: 'Any day', bestTime: 'Brahma Muhurta (4-6 AM)', difficulty: 'easy', isPremium: false, icon: '\u{1F9D8}' },
  { id: 'ketu-4', planet: 'Ketu', type: 'gemstone', name: "Cat's Eye (Lehsunia)", description: "Cat's Eye protects against hidden enemies and enhances spiritual wisdom.", howTo: "Wear Cat's Eye (minimum 3 carats) in silver on the little finger. Test for 3 days first.", frequency: 'onOccasion', bestDay: 'Tuesday', bestTime: 'Evening', difficulty: 'advanced', isPremium: true, icon: '\u{1F48E}' },
]

// ─── Public API ─────────────────────────────────────────────────────────────

export function getAllRemedies(): Remedy[] {
  return REMEDIES
}

export function getRemediesByPlanet(planet: string): Remedy[] {
  return REMEDIES.filter(r => r.planet === planet)
}

export function getRemediesByType(type: RemedyType): Remedy[] {
  return REMEDIES.filter(r => r.type === type)
}

export function getDailyRemedy(): Remedy {
  const dayPlanet = VARA_PLANETS[new Date().getDay()]
  const planetRemedies = REMEDIES.filter(r => r.planet === dayPlanet && !r.isPremium)
  // Pick based on day of year for variety
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return planetRemedies[doy % planetRemedies.length] || REMEDIES[0]
}

export function getPersonalizedRemedies(birthNakshatraIndex?: number, birthRashiIndex?: number): {
  weakPlanets: PlanetStrength[]
  recommended: Remedy[]
} {
  // Simplified strength analysis based on birth data
  const strengths: PlanetStrength[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ].map(planet => {
    let strength = 60 // baseline

    if (birthNakshatraIndex !== undefined) {
      const lord = NAKSHATRA_LORDS[birthNakshatraIndex]
      if (lord === planet) strength += 25
    }

    if (birthRashiIndex !== undefined) {
      const rashiLord = RASHI_DATA[birthRashiIndex]?.ruler
      if (rashiLord === planet) strength += 20
    }

    // Rahu/Ketu are generally considered weaker
    if (planet === 'Rahu' || planet === 'Ketu') strength -= 15

    const colors: Record<string, string> = {
      Sun: '#FFB347', Moon: '#C0C0FF', Mars: '#FF6B6B', Mercury: '#7DF9FF',
      Jupiter: '#FFD700', Venus: '#FFB6C1', Saturn: '#9B87F5', Rahu: '#888', Ketu: '#A0522D',
    }

    return {
      planet,
      strength: Math.min(100, Math.max(0, strength)),
      status: strength >= 70 ? 'strong' as const : strength >= 45 ? 'moderate' as const : 'weak' as const,
      color: colors[planet] || '#888',
    }
  })

  const weakPlanets = strengths.filter(s => s.status === 'weak' || s.status === 'moderate')
    .sort((a, b) => a.strength - b.strength)

  const recommended = weakPlanets.flatMap(wp =>
    REMEDIES.filter(r => r.planet === wp.planet && !r.isPremium).slice(0, 2)
  )

  return { weakPlanets: strengths, recommended }
}

export function getRemedyCategories(): { type: RemedyType; icon: string; label: string; count: number }[] {
  return [
    { type: 'mantra', icon: '\u{1F549}\uFE0F', label: 'Mantras', count: REMEDIES.filter(r => r.type === 'mantra').length },
    { type: 'gemstone', icon: '\u{1F48E}', label: 'Gemstones', count: REMEDIES.filter(r => r.type === 'gemstone').length },
    { type: 'donation', icon: '\u{1F381}', label: 'Donations', count: REMEDIES.filter(r => r.type === 'donation').length },
    { type: 'lifestyle', icon: '\u{1F9D8}', label: 'Lifestyle', count: REMEDIES.filter(r => r.type === 'lifestyle').length },
    { type: 'ritual', icon: '\u{1FA94}', label: 'Rituals', count: REMEDIES.filter(r => r.type === 'ritual').length },
  ]
}
