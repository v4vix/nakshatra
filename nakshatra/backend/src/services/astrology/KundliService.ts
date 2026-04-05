import { ephemerisService, PlanetaryData, AscendantData } from './EphemerisService';
import { dashaService, CompleteDashaSequence, NAKSHATRA_LORDS } from './DashaService';

export interface BirthData {
  name: string;
  dateOfBirth: string;   // ISO 8601 format: "1990-05-15T14:30:00"
  latitude: number;      // decimal degrees, positive = north
  longitude: number;     // decimal degrees, positive = east
  timezone: number;      // UTC offset in hours (e.g., 5.5 for IST)
  place?: string;
}

export interface PlanetInChart {
  planet: string;
  rashi: string;
  rashiIndex: number;
  house: number;
  degree: number;
  degreeInRashi: number;
  nakshatra: string;
  pada: number;
  isRetrograde: boolean;
}

export interface YogaInfo {
  name: string;
  description: string;
  planets: string[];
  isPresent: boolean;
}

export interface DoshaInfo {
  name: string;
  description: string;
  isPresent: boolean;
  severity: 'mild' | 'moderate' | 'strong' | 'none';
  remedies: string[];
}

export interface KundliChart {
  // Basic info
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;

  // Lagna
  lagna: AscendantData;
  lagnaName: string;

  // All 9 grahas
  planets: Record<string, PlanetInChart>;

  // House cusps (whole sign system)
  houses: Array<{ houseNumber: number; rashiIndex: number; rashiName: string }>;

  // Derived info
  moonSign: string;
  sunSign: string;
  birthNakshatra: string;
  birthNakshatraPada: number;
  birthNakshatraLord: string;

  // Yogas
  yogas: YogaInfo[];
  presentYogas: string[];

  // Doshas
  doshas: DoshaInfo[];
  presentDoshas: string[];

  // Dasha
  dashaSequence: CompleteDashaSequence;
  currentDashaString: string;

  // Ayanamsa
  lahiriAyanamsa: number;
  julianDay: number;
}

// ─── Yoga Detection ───────────────────────────────────────────────────────────

function detectGajaKesari(planets: Record<string, PlanetInChart>): boolean {
  const moon = planets['Moon'];
  const jupiter = planets['Jupiter'];
  if (!moon || !jupiter) return false;
  const diff = Math.abs(moon.house - jupiter.house);
  const circDiff = Math.min(diff, 12 - diff);
  // Gaja Kesari: Jupiter in kendra (1, 4, 7, 10) from Moon — circular distance
  return [0, 3, 6, 9].includes(circDiff);
}

function detectPanchaMahapurusha(planets: Record<string, PlanetInChart>, lagnaRashiIndex: number): YogaInfo[] {
  const yogas: YogaInfo[] = [];

  // Mars in own sign (Mesha=0, Vrishchika=7) or exaltation (Makara=9) in kendra
  const mars = planets['Mars'];
  if (mars) {
    const inOwnOrExalt = [0, 7, 9].includes(mars.rashiIndex);
    const inKendra = [1, 4, 7, 10].includes(mars.house);
    if (inOwnOrExalt && inKendra) {
      yogas.push({ name: 'Ruchaka Yoga', description: 'Mars in own/exalted sign in a kendra house. Bestows courage, military prowess, strong physique, and leadership abilities.', planets: ['Mars'], isPresent: true });
    }
  }

  // Mercury in own sign (Mithuna=2, Kanya=5) or exaltation (Kanya=5) in kendra
  const mercury = planets['Mercury'];
  if (mercury) {
    const inOwnOrExalt = [2, 5].includes(mercury.rashiIndex);
    const inKendra = [1, 4, 7, 10].includes(mercury.house);
    if (inOwnOrExalt && inKendra) {
      yogas.push({ name: 'Bhadra Yoga', description: 'Mercury in own/exalted sign in a kendra house. Grants intelligence, eloquence, business acumen, and administrative skill.', planets: ['Mercury'], isPresent: true });
    }
  }

  // Jupiter in own sign (Dhanu=8, Meena=11) or exaltation (Karka=3) in kendra
  const jupiter = planets['Jupiter'];
  if (jupiter) {
    const inOwnOrExalt = [8, 11, 3].includes(jupiter.rashiIndex);
    const inKendra = [1, 4, 7, 10].includes(jupiter.house);
    if (inOwnOrExalt && inKendra) {
      yogas.push({ name: 'Hamsa Yoga', description: 'Jupiter in own/exalted sign in a kendra house. Confers wisdom, spiritual knowledge, justice, generosity, and elevated social status.', planets: ['Jupiter'], isPresent: true });
    }
  }

  // Venus in own sign (Vrishabha=1, Tula=6) or exaltation (Meena=11) in kendra
  const venus = planets['Venus'];
  if (venus) {
    const inOwnOrExalt = [1, 6, 11].includes(venus.rashiIndex);
    const inKendra = [1, 4, 7, 10].includes(venus.house);
    if (inOwnOrExalt && inKendra) {
      yogas.push({ name: 'Malavya Yoga', description: 'Venus in own/exalted sign in a kendra house. Bestows beauty, artistic talent, sensual refinement, wealth, and happy relationships.', planets: ['Venus'], isPresent: true });
    }
  }

  // Saturn in own sign (Makara=9, Kumbha=10) or exaltation (Tula=6) in kendra
  const saturn = planets['Saturn'];
  if (saturn) {
    const inOwnOrExalt = [9, 10, 6].includes(saturn.rashiIndex);
    const inKendra = [1, 4, 7, 10].includes(saturn.house);
    if (inOwnOrExalt && inKendra) {
      yogas.push({ name: 'Shasha Yoga', description: 'Saturn in own/exalted sign in a kendra house. Grants administrative authority, discipline, longevity, and mastery over servants and subordinates.', planets: ['Saturn'], isPresent: true });
    }
  }

  return yogas;
}

function detectRajYogas(planets: Record<string, PlanetInChart>, lagnaRashiIndex: number): YogaInfo[] {
  const yogas: YogaInfo[] = [];

  // Simple Dhana Yoga: Lords of 2nd and 11th house conjunct or mutually aspected
  // For brevity, check if Moon and Jupiter are in 1st, 5th, or 9th house (Lakshmi Yoga variant)
  const moon = planets['Moon'];
  const jupiter = planets['Jupiter'];
  const venus = planets['Venus'];

  if (jupiter && [1, 5, 9].includes(jupiter.house)) {
    yogas.push({
      name: 'Guru Kendra/Trikona Yoga',
      description: 'Jupiter in a kendra or trikona house (1st, 5th, 9th) is highly auspicious. Brings wisdom, prosperity, and spiritual blessings to the chart.',
      planets: ['Jupiter'],
      isPresent: true,
    });
  }

  if (moon && jupiter) {
    const diff = Math.abs(moon.house - jupiter.house);
    if ([0, 3, 6, 9].includes(diff)) {
      yogas.push({
        name: 'Gaja Kesari Yoga',
        description: 'Jupiter in a kendra position from the Moon. One of the most celebrated yogas in Jyotish. Bestows intelligence, fame, good character, wealth, and a life of honor and service.',
        planets: ['Moon', 'Jupiter'],
        isPresent: true,
      });
    }
  }

  if (venus && [1, 4, 7, 10].includes(venus.house)) {
    yogas.push({
      name: 'Shukra Kendra Yoga',
      description: 'Venus in a kendra house enhances the chart with artistic grace, material prosperity, and harmonious relationships.',
      planets: ['Venus'],
      isPresent: true,
    });
  }

  return yogas;
}

function detectMangalDosha(planets: Record<string, PlanetInChart>): DoshaInfo {
  const mars = planets['Mars'];
  if (!mars) {
    return { name: 'Mangal Dosha', description: 'Mars placement in houses 1, 2, 4, 7, 8, or 12 creates Mangal Dosha.', isPresent: false, severity: 'none', remedies: [] };
  }

  const mangalHouses = [1, 2, 4, 7, 8, 12];
  const isPresent = mangalHouses.includes(mars.house);

  let severity: 'mild' | 'moderate' | 'strong' | 'none' = 'none';
  if (isPresent) {
    if ([7, 8].includes(mars.house)) severity = 'strong';
    else if ([1, 4].includes(mars.house)) severity = 'moderate';
    else severity = 'mild';
  }

  return {
    name: 'Mangal Dosha',
    description: `Mars is in the ${mars.house}${['st','nd','rd','th'][Math.min(mars.house-1,3)] || 'th'} house. Mars in houses 1, 2, 4, 7, 8, or 12 creates Mangal Dosha, which may affect partnerships and marriage unless the partner also has Mangal Dosha or other cancellation factors are present.`,
    isPresent,
    severity,
    remedies: isPresent ? [
      'Kuja (Mangal) puja and Hanuman Chalisa recitation on Tuesdays',
      'Wearing red coral (Moonga) after consulting a Jyotishi',
      'Marriage after age 28 reduces the intensity',
      'Matching with a partner who also has Mangal Dosha cancels the effect',
      'Offering red flowers to Lord Hanuman or Skanda on Tuesdays',
    ] : [],
  };
}

function detectKaalSarpDosha(planets: Record<string, PlanetInChart>): DoshaInfo {
  const rahu = planets['Rahu'];
  const ketu = planets['Ketu'];

  if (!rahu || !ketu) {
    return { name: 'Kaal Sarp Dosha', description: 'Rahu-Ketu axis not computed.', isPresent: false, severity: 'none', remedies: [] };
  }

  // Check if all planets fall between Rahu and Ketu (by house number)
  const rahulHouse = rahu.house;
  const ketuHouse = ketu.house;

  const otherPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planetHouses = otherPlanets.map(p => planets[p]?.house || 0).filter(h => h > 0);

  // Determine the arc from Rahu to Ketu going forward (Rahu→Ketu arc)
  // Build the set of house numbers strictly between Rahu and Ketu (exclusive)
  const rahuToKetuArc = new Set<number>();
  let current = rahulHouse;
  while (true) {
    current = (current % 12) + 1; // next house
    if (current === ketuHouse) break;
    rahuToKetuArc.add(current);
  }
  rahuToKetuArc.add(rahulHouse);
  rahuToKetuArc.add(ketuHouse);

  // All planets must lie within the Rahu→Ketu arc (not in the opposite arc)
  let allInArc = planetHouses.every(h => rahuToKetuArc.has(h));

  const isPresent = allInArc;

  return {
    name: 'Kaal Sarp Dosha',
    description: isPresent
      ? `All seven grahas are hemmed between Rahu (house ${rahulHouse}) and Ketu (house ${ketuHouse}). Kaal Sarp Dosha indicates past-life karmic debts, obstacles in life's flow, and periods of intense challenge alternating with breakthrough. It is a powerful spiritual configuration that ultimately drives the soul toward liberation.`
      : `Planets are not confined between the Rahu-Ketu axis. Kaal Sarp Dosha is not present.`,
    isPresent,
    severity: isPresent ? 'strong' : 'none',
    remedies: isPresent ? [
      'Kaal Sarp Dosha puja at Trimbakeshwar (Nashik) or Ujjain Mahakaleshwar',
      'Recitation of Maha Mrityunjaya Mantra 108 times daily',
      'Wearing Gomed (Hessonite Garnet) for Rahu with astrological guidance',
      'Nagabali ritual to pacify the serpent deities',
      'Charity and service to others, especially on Rahu and Ketu days',
      'Meditation and spiritual practice to transcend the karmic pattern',
    ] : [],
  };
}

// ─── KundliService ────────────────────────────────────────────────────────────

export class KundliService {
  /**
   * Compute a complete Vedic birth chart from birth data.
   */
  async computeKundli(birthData: BirthData): Promise<KundliChart> {
    // Parse birth datetime and adjust for timezone
    const localDate = new Date(birthData.dateOfBirth);
    const utcDate = new Date(localDate.getTime() - birthData.timezone * 60 * 60 * 1000);

    const julianDay = ephemerisService.dateToJulianDay(utcDate);
    const ayanamsa = ephemerisService.computeLahiriAyanamsa(julianDay);

    // Compute Lagna
    const lagna = ephemerisService.getAscendant(julianDay, birthData.latitude, birthData.longitude);
    const lagnaRashiIndex = lagna.rashiIndex;

    // Compute all planetary positions
    const allPositions = ephemerisService.getAllPlanetPositions(julianDay);

    // Assign houses (whole-sign system)
    const planetsInChart: Record<string, PlanetInChart> = {};

    for (const [planet, data] of Object.entries(allPositions)) {
      const house = ephemerisService.getHouseFromLagna(data.rashiIndex, lagnaRashiIndex);
      planetsInChart[planet] = {
        planet,
        rashi: data.rashiName,
        rashiIndex: data.rashiIndex,
        house,
        degree: parseFloat(data.siderealLongitude.toFixed(2)),
        degreeInRashi: parseFloat(data.degreeInRashi.toFixed(2)),
        nakshatra: data.nakshatraName,
        pada: data.pada,
        isRetrograde: data.isRetrograde,
      };
    }

    // Whole-sign houses array
    const houses = Array.from({ length: 12 }, (_, i) => {
      const rashiIdx = (lagnaRashiIndex + i) % 12;
      const rashiNames = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
      return { houseNumber: i + 1, rashiIndex: rashiIdx, rashiName: rashiNames[rashiIdx] };
    });

    // Derived values
    const moonData = allPositions['Moon'];
    const sunData = allPositions['Sun'];
    const birthNakshatra = moonData?.nakshatraName || 'Unknown';
    const birthNakshatraIndex = moonData?.nakshatraIndex ?? 0;
    const birthNakshatraPada = moonData?.pada ?? 1;
    const birthNakshatraLord = NAKSHATRA_LORDS[birthNakshatra === 'Unknown' ? 0 : birthNakshatraIndex];

    // Dasha calculation
    const moonDegreeInNakshatra = moonData?.degreeInNakshatra ?? 0;
    const dashaSequence = dashaService.computeFullSequence(
      new Date(birthData.dateOfBirth),
      birthNakshatraIndex,
      moonDegreeInNakshatra
    );

    let currentDashaString = 'Dasha calculation unavailable';
    if (dashaSequence.currentDasha) {
      currentDashaString = dashaService.formatDashaString(dashaSequence.currentDasha);
    }

    // Yoga detection
    const panchaMahapurusha = detectPanchaMahapurusha(planetsInChart, lagnaRashiIndex);
    const rajYogas = detectRajYogas(planetsInChart, lagnaRashiIndex);
    const allYogas = [...panchaMahapurusha, ...rajYogas];

    const presentYogas = allYogas.filter(y => y.isPresent).map(y => y.name);

    // Dosha detection
    const mangalDosha = detectMangalDosha(planetsInChart);
    const kaalSarpDosha = detectKaalSarpDosha(planetsInChart);
    const allDoshas = [mangalDosha, kaalSarpDosha];
    const presentDoshas = allDoshas.filter(d => d.isPresent).map(d => d.name);

    return {
      name: birthData.name,
      dateOfBirth: birthData.dateOfBirth,
      placeOfBirth: birthData.place || `${birthData.latitude.toFixed(2)}°N, ${birthData.longitude.toFixed(2)}°E`,
      latitude: birthData.latitude,
      longitude: birthData.longitude,

      lagna,
      lagnaName: lagna.rashiName,

      planets: planetsInChart,
      houses,

      moonSign: moonData?.rashiName || 'Unknown',
      sunSign: sunData?.rashiName || 'Unknown',
      birthNakshatra,
      birthNakshatraPada,
      birthNakshatraLord,

      yogas: allYogas,
      presentYogas,

      doshas: allDoshas,
      presentDoshas,

      dashaSequence,
      currentDashaString,

      lahiriAyanamsa: parseFloat(ayanamsa.toFixed(4)),
      julianDay: parseFloat(julianDay.toFixed(4)),
    };
  }

  /**
   * Get list of all 27 Nakshatras with metadata.
   */
  getAllNakshatras() {
    const nakshatraData = [
      { index: 0, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head', quality: 'Kshipra (Swift)', rashi: 'Mesha', startDegree: 0 },
      { index: 1, name: 'Bharani', lord: 'Venus', deity: 'Yama', symbol: 'Yoni (Womb)', quality: 'Ugra (Fierce)', rashi: 'Mesha', startDegree: 13.333 },
      { index: 2, name: 'Krittika', lord: 'Sun', deity: 'Agni', symbol: 'Razor/Flame', quality: 'Mishra (Mixed)', rashi: 'Mesha/Vrishabha', startDegree: 26.666 },
      { index: 3, name: 'Rohini', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot/Temple', quality: 'Dhruva (Fixed)', rashi: 'Vrishabha', startDegree: 40 },
      { index: 4, name: 'Mrigashira', lord: 'Mars', deity: 'Soma/Chandra', symbol: 'Deer Head', quality: 'Mridu (Soft)', rashi: 'Vrishabha/Mithuna', startDegree: 53.333 },
      { index: 5, name: 'Ardra', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop/Diamond', quality: 'Tikshna (Sharp)', rashi: 'Mithuna', startDegree: 66.666 },
      { index: 6, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', symbol: 'Quiver of Arrows', quality: 'Chara (Movable)', rashi: 'Mithuna/Karka', startDegree: 80 },
      { index: 7, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Flower/Arrow/Circle', quality: 'Laghu (Light)', rashi: 'Karka', startDegree: 93.333 },
      { index: 8, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas (Serpents)', symbol: 'Coiled Serpent', quality: 'Tikshna (Sharp)', rashi: 'Karka', startDegree: 106.666 },
      { index: 9, name: 'Magha', lord: 'Ketu', deity: 'Pitrs (Ancestors)', symbol: 'Royal Throne', quality: 'Ugra (Fierce)', rashi: 'Simha', startDegree: 120 },
      { index: 10, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', symbol: 'Front Legs of Bed', quality: 'Ugra (Fierce)', rashi: 'Simha', startDegree: 133.333 },
      { index: 11, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', symbol: 'Back Legs of Bed', quality: 'Dhruva (Fixed)', rashi: 'Simha/Kanya', startDegree: 146.666 },
      { index: 12, name: 'Hasta', lord: 'Moon', deity: 'Savitar/Surya', symbol: 'Hand/Fist', quality: 'Kshipra (Swift)', rashi: 'Kanya', startDegree: 160 },
      { index: 13, name: 'Chitra', lord: 'Mars', deity: 'Vishvakarma', symbol: 'Bright Jewel/Pearl', quality: 'Mridu (Soft)', rashi: 'Kanya/Tula', startDegree: 173.333 },
      { index: 14, name: 'Swati', lord: 'Rahu', deity: 'Vayu', symbol: 'Young Sprout/Sword', quality: 'Chara (Movable)', rashi: 'Tula', startDegree: 186.666 },
      { index: 15, name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni', symbol: 'Forked/Potter\'s Wheel', quality: 'Mishra (Mixed)', rashi: 'Tula/Vrishchika', startDegree: 200 },
      { index: 16, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus/Staff', quality: 'Mridu (Soft)', rashi: 'Vrishchika', startDegree: 213.333 },
      { index: 17, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', symbol: 'Circular Amulet/Earring', quality: 'Tikshna (Sharp)', rashi: 'Vrishchika', startDegree: 226.666 },
      { index: 18, name: 'Mula', lord: 'Ketu', deity: 'Nirriti/Alakshmi', symbol: 'Roots Tied Together', quality: 'Tikshna (Sharp)', rashi: 'Dhanu', startDegree: 240 },
      { index: 19, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas (Waters)', symbol: 'Fan/Winnowing Basket', quality: 'Ugra (Fierce)', rashi: 'Dhanu', startDegree: 253.333 },
      { index: 20, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishve Devas', symbol: 'Elephant Tusk/Small Bed', quality: 'Dhruva (Fixed)', rashi: 'Dhanu/Makara', startDegree: 266.666 },
      { index: 21, name: 'Shravana', lord: 'Moon', deity: 'Vishnu', symbol: 'Ear/Three Footprints', quality: 'Chara (Movable)', rashi: 'Makara', startDegree: 280 },
      { index: 22, name: 'Dhanishtha', lord: 'Mars', deity: 'Ashta Vasus', symbol: 'Drum/Flute', quality: 'Kshipra (Swift)', rashi: 'Makara/Kumbha', startDegree: 293.333 },
      { index: 23, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty Circle/Thousand Stars', quality: 'Chara (Movable)', rashi: 'Kumbha', startDegree: 306.666 },
      { index: 24, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapad', symbol: 'Swords/Two Front Legs of Funeral Bed', quality: 'Ugra (Fierce)', rashi: 'Kumbha/Meena', startDegree: 320 },
      { index: 25, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya', symbol: 'Two Back Legs of Funeral Bed/Serpent', quality: 'Dhruva (Fixed)', rashi: 'Meena', startDegree: 333.333 },
      { index: 26, name: 'Revati', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish/Drum', quality: 'Mridu (Soft)', rashi: 'Meena', startDegree: 346.666 },
    ];
    return nakshatraData;
  }

  /**
   * Get all 12 Rashis with metadata.
   */
  getAllRashis() {
    return [
      { index: 0, name: 'Mesha', english: 'Aries', lord: 'Mars', element: 'Fire', quality: 'Cardinal', gender: 'Male', startDegree: 0 },
      { index: 1, name: 'Vrishabha', english: 'Taurus', lord: 'Venus', element: 'Earth', quality: 'Fixed', gender: 'Female', startDegree: 30 },
      { index: 2, name: 'Mithuna', english: 'Gemini', lord: 'Mercury', element: 'Air', quality: 'Mutable', gender: 'Male', startDegree: 60 },
      { index: 3, name: 'Karka', english: 'Cancer', lord: 'Moon', element: 'Water', quality: 'Cardinal', gender: 'Female', startDegree: 90 },
      { index: 4, name: 'Simha', english: 'Leo', lord: 'Sun', element: 'Fire', quality: 'Fixed', gender: 'Male', startDegree: 120 },
      { index: 5, name: 'Kanya', english: 'Virgo', lord: 'Mercury', element: 'Earth', quality: 'Mutable', gender: 'Female', startDegree: 150 },
      { index: 6, name: 'Tula', english: 'Libra', lord: 'Venus', element: 'Air', quality: 'Cardinal', gender: 'Male', startDegree: 180 },
      { index: 7, name: 'Vrishchika', english: 'Scorpio', lord: 'Mars', element: 'Water', quality: 'Fixed', gender: 'Female', startDegree: 210 },
      { index: 8, name: 'Dhanu', english: 'Sagittarius', lord: 'Jupiter', element: 'Fire', quality: 'Mutable', gender: 'Male', startDegree: 240 },
      { index: 9, name: 'Makara', english: 'Capricorn', lord: 'Saturn', element: 'Earth', quality: 'Cardinal', gender: 'Female', startDegree: 270 },
      { index: 10, name: 'Kumbha', english: 'Aquarius', lord: 'Saturn', element: 'Air', quality: 'Fixed', gender: 'Male', startDegree: 300 },
      { index: 11, name: 'Meena', english: 'Pisces', lord: 'Jupiter', element: 'Water', quality: 'Mutable', gender: 'Female', startDegree: 330 },
    ];
  }

  /**
   * Get all 9 Vedic Grahas (planets) with metadata.
   */
  getAllGrahas() {
    return [
      { name: 'Sun', sanskrit: 'Surya', element: 'Fire', nature: 'Malefic', ownSign: ['Simha'], exaltation: 'Mesha (10°)', debilitation: 'Tula (10°)', karakaFor: ['Soul', 'Father', 'Authority', 'Vitality'] },
      { name: 'Moon', sanskrit: 'Chandra', element: 'Water', nature: 'Benefic', ownSign: ['Karka'], exaltation: 'Vrishabha (3°)', debilitation: 'Vrishchika (3°)', karakaFor: ['Mind', 'Mother', 'Emotions', 'Public'] },
      { name: 'Mercury', sanskrit: 'Budha', element: 'Earth/Air', nature: 'Neutral', ownSign: ['Mithuna', 'Kanya'], exaltation: 'Kanya (15°)', debilitation: 'Meena (15°)', karakaFor: ['Intelligence', 'Communication', 'Trade', 'Siblings'] },
      { name: 'Venus', sanskrit: 'Shukra', element: 'Water', nature: 'Benefic', ownSign: ['Vrishabha', 'Tula'], exaltation: 'Meena (27°)', debilitation: 'Kanya (27°)', karakaFor: ['Love', 'Beauty', 'Wealth', 'Spouse (male)'] },
      { name: 'Mars', sanskrit: 'Mangal', element: 'Fire', nature: 'Malefic', ownSign: ['Mesha', 'Vrishchika'], exaltation: 'Makara (28°)', debilitation: 'Karka (28°)', karakaFor: ['Courage', 'Siblings', 'Property', 'Energy'] },
      { name: 'Jupiter', sanskrit: 'Guru/Brihaspati', element: 'Ether', nature: 'Benefic', ownSign: ['Dhanu', 'Meena'], exaltation: 'Karka (5°)', debilitation: 'Makara (5°)', karakaFor: ['Wisdom', 'Children', 'Guru', 'Dharma', 'Wealth'] },
      { name: 'Saturn', sanskrit: 'Shani', element: 'Air', nature: 'Malefic', ownSign: ['Makara', 'Kumbha'], exaltation: 'Tula (20°)', debilitation: 'Mesha (20°)', karakaFor: ['Karma', 'Discipline', 'Servants', 'Longevity', 'Delays'] },
      { name: 'Rahu', sanskrit: 'Rahu', element: 'Air/Ether', nature: 'Malefic', ownSign: ['Kumbha (by some)'], exaltation: 'Mithuna/Vrishabha (debate)', debilitation: 'Dhanu/Vrishchika (debate)', karakaFor: ['Worldly Desires', 'Foreign Lands', 'Unconventional Path', 'Karma'] },
      { name: 'Ketu', sanskrit: 'Ketu', element: 'Fire/Ether', nature: 'Malefic', ownSign: ['Vrishchika (by some)'], exaltation: 'Dhanu/Vrishchika (debate)', debilitation: 'Mithuna/Vrishabha (debate)', karakaFor: ['Moksha', 'Spirituality', 'Past Lives', 'Renunciation'] },
    ];
  }
}

export const kundliService = new KundliService();
