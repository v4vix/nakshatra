// ============================================================
// Vedic Astrology Calculations
// Self-contained module: Yoga Detection, Ashtakvarga,
// Shadbala, Dosha Detection, and Rahu/Ketu Interpretations
// ============================================================

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlanetInput {
  name: string;
  rashiIndex: number;     // 0-11
  houseNumber: number;    // 1-12
  degree: number;
  dignity: string;        // 'Exalted' | 'Own' | 'Moolatrikona' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated'
  isRetrograde: boolean;
  grahaId: string;
  nakshatraIndex: number; // 0-26
  pada: number;           // 1-4
}

export interface YogaResult {
  name: string;
  type: string;
  strength: 'Excellent' | 'Strong' | 'Moderate' | 'Mild';
  description: string;
  involved: string[];
}

export interface AshtakvargaResult {
  planetScores: Record<string, number[]>;
  sarvashtakvarga: number[];
  totalBindus: number;
  strongHouses: number[];
  weakHouses: number[];
}

export interface ShadbalaEntry {
  sthana: number;
  dig: number;
  kala: number;
  chesta: number;
  naisargika: number;
  drik: number;
  total: number;
  percentage: number;
  isStrong: boolean;
}

export interface ShadbalaResult {
  planets: Record<string, ShadbalaEntry>;
}

export interface DoshaResult {
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  description: string;
  remedies: string[];
}

// ─── Internal Constants ─────────────────────────────────────────────────────

const RASHI_LORDS: string[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const KENDRA_HOUSES = [1, 4, 7, 10];
const TRIKONA_HOUSES = [1, 5, 9];
const DUSTHANA_HOUSES = [6, 8, 12];
const UPACHAYA_HOUSES = [3, 6, 10, 11];

/** Exaltation rashi index (0-based) per planet */
const EXALTATION_RASHI: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
  Rahu: 1, Ketu: 7,
};

/** Debilitation rashi index (0-based) per planet — opposite of exaltation */
const DEBILITATION_RASHI: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0,
  Rahu: 7, Ketu: 1,
};

/** Own signs (rashi indices) for each planet */
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
  Rahu: [10],  // co-lord
  Ketu: [7],   // co-lord
};

const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus', 'Moon', 'Mercury']);
const NATURAL_MALEFICS = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);

const SEVEN_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Naisargika bala (natural strength) fixed values */
const NAISARGIKA_BALA: Record<string, number> = {
  Sun: 60, Moon: 51.4, Mars: 17.1, Mercury: 25.7,
  Jupiter: 34.3, Venus: 42.9, Saturn: 8.6,
};

/** Required minimum shadbala for each planet (in virupas) */
const SHADBALA_REQUIRED: Record<string, number> = {
  Sun: 390, Moon: 360, Mars: 300, Mercury: 420,
  Jupiter: 390, Venus: 330, Saturn: 300,
};

// ─── Utility Helpers ────────────────────────────────────────────────────────

function findPlanet(planets: PlanetInput[], name: string): PlanetInput | undefined {
  return planets.find(p => p.name === name);
}

function houseOf(planet: PlanetInput): number {
  return planet.houseNumber;
}

function rashiOf(planet: PlanetInput): number {
  return planet.rashiIndex;
}

function isInKendra(planet: PlanetInput): boolean {
  return KENDRA_HOUSES.includes(planet.houseNumber);
}

function isInTrikona(planet: PlanetInput): boolean {
  return TRIKONA_HOUSES.includes(planet.houseNumber);
}

function isInDusthana(planet: PlanetInput): boolean {
  return DUSTHANA_HOUSES.includes(planet.houseNumber);
}

function isExalted(planet: PlanetInput): boolean {
  return planet.dignity === 'Exalted' || planet.rashiIndex === EXALTATION_RASHI[planet.name];
}

function isOwnSign(planet: PlanetInput): boolean {
  return planet.dignity === 'Own' || planet.dignity === 'Moolatrikona' ||
    (OWN_SIGNS[planet.name]?.includes(planet.rashiIndex) ?? false);
}

function isDebilitated(planet: PlanetInput): boolean {
  return planet.dignity === 'Debilitated' || planet.rashiIndex === DEBILITATION_RASHI[planet.name];
}

function isExaltedOrOwn(planet: PlanetInput): boolean {
  return isExalted(planet) || isOwnSign(planet);
}

/** True if two planets are in the same rashi */
function conjunct(a: PlanetInput, b: PlanetInput): boolean {
  return a.rashiIndex === b.rashiIndex;
}

/** True if planet b is in a house relative to planet a */
function isInHouseFrom(base: PlanetInput, target: PlanetInput, offsets: number[]): boolean {
  for (const offset of offsets) {
    const h = ((base.houseNumber - 1 + offset) % 12) + 1;
    if (target.houseNumber === h) return true;
  }
  return false;
}

/** Get the rashi index that is `offset` signs from `baseRashi` */
function signFrom(baseRashi: number, offset: number): number {
  return ((baseRashi + offset) % 12 + 12) % 12;
}

/** Get the lord of a rashi */
function lordOf(rashiIndex: number): string {
  return RASHI_LORDS[rashiIndex % 12];
}

/** Get the lord of a house given ascendant rashi */
function houseLord(ascRashi: number, houseNum: number): string {
  const rashiIdx = (ascRashi + houseNum - 1) % 12;
  return RASHI_LORDS[rashiIdx];
}

/** Check if two planets are within the same sign or adjacent signs */
function areWithinSigns(a: PlanetInput, b: PlanetInput, maxDist: number): boolean {
  const diff = Math.abs(a.rashiIndex - b.rashiIndex);
  const dist = Math.min(diff, 12 - diff);
  return dist <= maxDist;
}

/** Check if a planet aspects a house (simplified Vedic aspects) */
function planetAspectsHouse(planet: PlanetInput, targetHouse: number): boolean {
  const diff = ((targetHouse - planet.houseNumber) % 12 + 12) % 12;
  // All planets aspect the 7th house from themselves
  if (diff === 6) return true;
  // Mars additionally aspects 4th and 8th
  if (planet.name === 'Mars' && (diff === 3 || diff === 7)) return true;
  // Jupiter additionally aspects 5th and 9th
  if (planet.name === 'Jupiter' && (diff === 4 || diff === 8)) return true;
  // Saturn additionally aspects 3rd and 10th
  if (planet.name === 'Saturn' && (diff === 2 || diff === 9)) return true;
  // Rahu/Ketu aspect 5th, 7th, 9th
  if ((planet.name === 'Rahu' || planet.name === 'Ketu') && (diff === 4 || diff === 8)) return true;
  return false;
}

// ============================================================
// 1. YOGA DETECTION
// ============================================================

export function detectYogas(planets: PlanetInput[], ascRashi: number): YogaResult[] {
  const yogas: YogaResult[] = [];

  const sun = findPlanet(planets, 'Sun');
  const moon = findPlanet(planets, 'Moon');
  const mars = findPlanet(planets, 'Mars');
  const mercury = findPlanet(planets, 'Mercury');
  const jupiter = findPlanet(planets, 'Jupiter');
  const venus = findPlanet(planets, 'Venus');
  const saturn = findPlanet(planets, 'Saturn');
  const rahu = findPlanet(planets, 'Rahu');
  const ketu = findPlanet(planets, 'Ketu');

  // ─── Pancha Mahapurusha Yogas (5) ────────────────────────────────────────

  const mahapurushaCheck = (planet: PlanetInput | undefined, yogaName: string, desc: string) => {
    if (!planet) return;
    if (isInKendra(planet) && isExaltedOrOwn(planet)) {
      yogas.push({
        name: yogaName,
        type: 'Pancha Mahapurusha',
        strength: isExalted(planet) ? 'Excellent' : 'Strong',
        description: desc,
        involved: [planet.name],
      });
    }
  };

  mahapurushaCheck(mars, 'Ruchaka Yoga',
    'Mars in kendra in own/exalted sign. Grants courage, leadership, physical strength, and military or administrative power.');
  mahapurushaCheck(mercury, 'Bhadra Yoga',
    'Mercury in kendra in own/exalted sign. Bestows sharp intellect, eloquent speech, business acumen, and scholarly abilities.');
  mahapurushaCheck(jupiter, 'Hamsa Yoga',
    'Jupiter in kendra in own/exalted sign. Confers wisdom, spirituality, good fortune, righteous conduct, and respect from society.');
  mahapurushaCheck(venus, 'Malavya Yoga',
    'Venus in kendra in own/exalted sign. Grants beauty, luxury, artistic talents, marital happiness, and material comforts.');
  mahapurushaCheck(saturn, 'Sasa Yoga',
    'Saturn in kendra in own/exalted sign. Bestows authority, discipline, political power, servants, and mastery over opponents.');

  // ─── Chandra (Moon) Yogas (8) ─────────────────────────────────────────────

  // Gajakesari Yoga: Jupiter in kendra from Moon
  if (moon && jupiter) {
    const moonToJup = ((jupiter.houseNumber - moon.houseNumber) % 12 + 12) % 12;
    if ([0, 3, 6, 9].includes(moonToJup)) {
      const strength = isExaltedOrOwn(jupiter) ? 'Excellent' : isInKendra(jupiter) ? 'Strong' : 'Moderate';
      yogas.push({
        name: 'Gajakesari Yoga',
        type: 'Chandra Yoga',
        strength,
        description: 'Jupiter in kendra from Moon. Bestows fame, wealth, intelligence, lasting reputation, and virtuous conduct.',
        involved: ['Moon', 'Jupiter'],
      });
    }
  }

  // Chandra-Mangal Yoga: Moon conjunct Mars
  if (moon && mars && conjunct(moon, mars)) {
    yogas.push({
      name: 'Chandra-Mangal Yoga',
      type: 'Chandra Yoga',
      strength: 'Moderate',
      description: 'Moon conjunct Mars. Creates wealth through self-effort, real estate, and bold initiatives. Strong emotional drive.',
      involved: ['Moon', 'Mars'],
    });
  }

  // Sunapha Yoga: Planets (not Sun) in 2nd from Moon
  if (moon) {
    const secondFromMoon = (moon.houseNumber % 12) + 1;
    const inSecond = planets.filter(p => p.name !== 'Sun' && p.name !== 'Moon' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === secondFromMoon);
    if (inSecond.length > 0) {
      yogas.push({
        name: 'Sunapha Yoga',
        type: 'Chandra Yoga',
        strength: 'Moderate',
        description: 'Planets in 2nd from Moon. Self-made prosperity, intelligence, and wealth acquired through personal efforts.',
        involved: ['Moon', ...inSecond.map(p => p.name)],
      });
    }
  }

  // Anapha Yoga: Planets (not Sun) in 12th from Moon
  if (moon) {
    const twelfthFromMoon = ((moon.houseNumber - 2 + 12) % 12) + 1;
    const inTwelfth = planets.filter(p => p.name !== 'Sun' && p.name !== 'Moon' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === twelfthFromMoon);
    if (inTwelfth.length > 0) {
      yogas.push({
        name: 'Anapha Yoga',
        type: 'Chandra Yoga',
        strength: 'Moderate',
        description: 'Planets in 12th from Moon. Gives good health, pleasing personality, and comfortable life with spiritual inclinations.',
        involved: ['Moon', ...inTwelfth.map(p => p.name)],
      });
    }
  }

  // Durudhara Yoga: Planets in both 2nd and 12th from Moon
  if (moon) {
    const secondFromMoon = (moon.houseNumber % 12) + 1;
    const twelfthFromMoon = ((moon.houseNumber - 2 + 12) % 12) + 1;
    const in2 = planets.filter(p => p.name !== 'Sun' && p.name !== 'Moon' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === secondFromMoon);
    const in12 = planets.filter(p => p.name !== 'Sun' && p.name !== 'Moon' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === twelfthFromMoon);
    if (in2.length > 0 && in12.length > 0) {
      yogas.push({
        name: 'Durudhara Yoga',
        type: 'Chandra Yoga',
        strength: 'Strong',
        description: 'Planets on both sides of Moon (2nd and 12th). Wealth, vehicles, property, generous nature, and enduring fame.',
        involved: ['Moon', ...in2.map(p => p.name), ...in12.map(p => p.name)],
      });
    }
  }

  // Kemadruma Yoga: No planets in 2nd or 12th from Moon (except Sun, Rahu, Ketu)
  if (moon) {
    const secondFromMoon = (moon.houseNumber % 12) + 1;
    const twelfthFromMoon = ((moon.houseNumber - 2 + 12) % 12) + 1;
    const supportingPlanets = planets.filter(p =>
      p.name !== 'Sun' && p.name !== 'Moon' && p.name !== 'Rahu' && p.name !== 'Ketu' &&
      (p.houseNumber === secondFromMoon || p.houseNumber === twelfthFromMoon));
    if (supportingPlanets.length === 0) {
      // Check cancellation: Moon in kendra or aspected by Jupiter
      const cancelled = isInKendra(moon) || (jupiter && planetAspectsHouse(jupiter, moon.houseNumber));
      if (!cancelled) {
        yogas.push({
          name: 'Kemadruma Yoga',
          type: 'Chandra Yoga',
          strength: 'Mild',
          description: 'No planets adjacent to Moon. May indicate periods of loneliness, financial instability, and lack of support. Severity depends on other factors.',
          involved: ['Moon'],
        });
      }
    }
  }

  // Adhi Yoga: Benefics in 6th, 7th, 8th from Moon
  if (moon) {
    const h6 = ((moon.houseNumber + 4) % 12) + 1;
    const h7 = ((moon.houseNumber + 5) % 12) + 1;
    const h8 = ((moon.houseNumber + 6) % 12) + 1;
    const beneficsIn678 = planets.filter(p =>
      NATURAL_BENEFICS.has(p.name) && p.name !== 'Moon' &&
      (p.houseNumber === h6 || p.houseNumber === h7 || p.houseNumber === h8));
    if (beneficsIn678.length >= 2) {
      yogas.push({
        name: 'Adhi Yoga',
        type: 'Chandra Yoga',
        strength: beneficsIn678.length >= 3 ? 'Excellent' : 'Strong',
        description: 'Benefics in 6th, 7th, and 8th from Moon. Confers leadership, authority, polite nature, wealth, and victory over enemies.',
        involved: ['Moon', ...beneficsIn678.map(p => p.name)],
      });
    }
  }

  // Amala Yoga: Natural benefic in 10th from Moon or Lagna
  {
    const tenthFromLagna = 10;
    const beneficIn10th = planets.filter(p =>
      NATURAL_BENEFICS.has(p.name) && p.houseNumber === tenthFromLagna);
    if (beneficIn10th.length > 0) {
      yogas.push({
        name: 'Amala Yoga',
        type: 'Chandra Yoga',
        strength: 'Moderate',
        description: 'Natural benefic in 10th house. Grants spotless reputation, righteous conduct, and lasting fame through virtuous deeds.',
        involved: beneficIn10th.map(p => p.name),
      });
    }
  }

  // ─── Solar Yogas (4) ──────────────────────────────────────────────────────

  // Budhaditya Yoga: Sun and Mercury conjunct
  if (sun && mercury && conjunct(sun, mercury)) {
    const strength: YogaResult['strength'] =
      isInKendra(sun) ? 'Strong' :
        isInTrikona(sun) ? 'Moderate' : 'Mild';
    yogas.push({
      name: 'Budhaditya Yoga',
      type: 'Solar Yoga',
      strength,
      description: 'Sun conjunct Mercury. Sharp intellect, eloquent communication, fame through knowledge, and administrative capability.',
      involved: ['Sun', 'Mercury'],
    });
  }

  // Vesi Yoga: Planet (not Moon) in 2nd from Sun
  if (sun) {
    const secondFromSun = (sun.houseNumber % 12) + 1;
    const inSecond = planets.filter(p => p.name !== 'Moon' && p.name !== 'Sun' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === secondFromSun);
    if (inSecond.length > 0) {
      yogas.push({
        name: 'Vesi Yoga',
        type: 'Solar Yoga',
        strength: inSecond.some(p => NATURAL_BENEFICS.has(p.name)) ? 'Strong' : 'Moderate',
        description: 'Planet in 2nd from Sun. Enhances speech, wealth, and status. Effect varies based on the planet involved.',
        involved: ['Sun', ...inSecond.map(p => p.name)],
      });
    }
  }

  // Vasi Yoga: Planet (not Moon) in 12th from Sun
  if (sun) {
    const twelfthFromSun = ((sun.houseNumber - 2 + 12) % 12) + 1;
    const inTwelfth = planets.filter(p => p.name !== 'Moon' && p.name !== 'Sun' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === twelfthFromSun);
    if (inTwelfth.length > 0) {
      yogas.push({
        name: 'Vasi Yoga',
        type: 'Solar Yoga',
        strength: inTwelfth.some(p => NATURAL_BENEFICS.has(p.name)) ? 'Strong' : 'Moderate',
        description: 'Planet in 12th from Sun. Confers charitable nature, power, and the ability to influence others.',
        involved: ['Sun', ...inTwelfth.map(p => p.name)],
      });
    }
  }

  // Ubhayachari Yoga: Planets on both sides of Sun (2nd and 12th)
  if (sun) {
    const secondFromSun = (sun.houseNumber % 12) + 1;
    const twelfthFromSun = ((sun.houseNumber - 2 + 12) % 12) + 1;
    const in2 = planets.filter(p => p.name !== 'Moon' && p.name !== 'Sun' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === secondFromSun);
    const in12 = planets.filter(p => p.name !== 'Moon' && p.name !== 'Sun' &&
      p.name !== 'Rahu' && p.name !== 'Ketu' && p.houseNumber === twelfthFromSun);
    if (in2.length > 0 && in12.length > 0) {
      yogas.push({
        name: 'Ubhayachari Yoga',
        type: 'Solar Yoga',
        strength: 'Strong',
        description: 'Planets flanking the Sun on both sides. Confers kinglike status, eloquence, balanced temperament, and lasting fame.',
        involved: ['Sun', ...in2.map(p => p.name), ...in12.map(p => p.name)],
      });
    }
  }

  // ─── Raj Yogas (6) ────────────────────────────────────────────────────────

  // Dharma-Karma Adhipati Yoga: Lords of 9th and 10th in conjunction or mutual aspect
  {
    const lord9 = houseLord(ascRashi, 9);
    const lord10 = houseLord(ascRashi, 10);
    const p9 = findPlanet(planets, lord9);
    const p10 = findPlanet(planets, lord10);
    if (p9 && p10 && lord9 !== lord10) {
      const areConjunct = conjunct(p9, p10);
      const mutualAspect = planetAspectsHouse(p9, p10.houseNumber) && planetAspectsHouse(p10, p9.houseNumber);
      if (areConjunct || mutualAspect) {
        yogas.push({
          name: 'Dharma-Karma Adhipati Yoga',
          type: 'Raj Yoga',
          strength: isInKendra(p9) || isInKendra(p10) ? 'Excellent' : 'Strong',
          description: 'Lords of 9th (dharma) and 10th (karma) houses conjunct or in mutual aspect. One of the most powerful Raj Yogas, granting authority, fame, and righteous power.',
          involved: [lord9, lord10],
        });
      }
    }
  }

  // General Kendra-Trikona Raj Yoga: Lord of a kendra conjunct lord of a trikona
  {
    const kendraLords = KENDRA_HOUSES.map(h => houseLord(ascRashi, h));
    const trikonaLords = TRIKONA_HOUSES.map(h => houseLord(ascRashi, h));
    const checked = new Set<string>();
    for (const kl of kendraLords) {
      for (const tl of trikonaLords) {
        if (kl === tl) continue;
        const key = [kl, tl].sort().join('-');
        if (checked.has(key)) continue;
        checked.add(key);
        const pk = findPlanet(planets, kl);
        const pt = findPlanet(planets, tl);
        if (pk && pt && conjunct(pk, pt)) {
          // Don't duplicate if it's specifically 9/10 lord combo already detected
          const is9_10 = (kl === houseLord(ascRashi, 10) && tl === houseLord(ascRashi, 9)) ||
            (tl === houseLord(ascRashi, 10) && kl === houseLord(ascRashi, 9));
          if (!is9_10) {
            yogas.push({
              name: 'Raj Yoga (Kendra-Trikona)',
              type: 'Raj Yoga',
              strength: 'Moderate',
              description: `Kendra lord (${kl}) conjunct Trikona lord (${tl}). Brings status elevation, power, and auspicious results in their combined dasha periods.`,
              involved: [kl, tl],
            });
          }
        }
      }
    }
  }

  // Viparita Raja Yoga: Lords of 6th, 8th, or 12th placed in other dusthana houses
  {
    const dusthanaLords = DUSTHANA_HOUSES.map(h => ({ house: h, lord: houseLord(ascRashi, h) }));
    for (const dl of dusthanaLords) {
      const p = findPlanet(planets, dl.lord);
      if (p && isInDusthana(p) && p.houseNumber !== dl.house) {
        yogas.push({
          name: 'Viparita Raja Yoga',
          type: 'Raj Yoga',
          strength: 'Moderate',
          description: `Lord of ${dl.house}th house placed in another dusthana. Sudden gains through adversity, victory over enemies, and unexpected rise in status.`,
          involved: [dl.lord],
        });
      }
    }
  }

  // Neechabhanga Raja Yoga: Debilitated planet with cancellation
  for (const p of planets) {
    if (!isDebilitated(p)) continue;
    if (p.name === 'Rahu' || p.name === 'Ketu') continue;
    const debRashi = p.rashiIndex;
    const lordOfDebSign = lordOf(debRashi);
    const exaltationLord = lordOf(EXALTATION_RASHI[p.name]);

    const lordOfDeb = findPlanet(planets, lordOfDebSign);
    const exaltLord = findPlanet(planets, exaltationLord);

    const cancelled = (lordOfDeb && isInKendra(lordOfDeb)) ||
      (exaltLord && isInKendra(exaltLord)) ||
      p.isRetrograde;

    if (cancelled) {
      yogas.push({
        name: 'Neechabhanga Raja Yoga',
        type: 'Raj Yoga',
        strength: p.isRetrograde ? 'Strong' : 'Moderate',
        description: `${p.name} is debilitated but cancellation conditions are met. Transforms weakness into extraordinary strength, often after initial struggles.`,
        involved: [p.name, ...(lordOfDeb && isInKendra(lordOfDeb) ? [lordOfDebSign] : [])],
      });
    }
  }

  // Lakshmi Yoga: Lord of 9th in kendra/trikona and strong, Venus strong
  if (venus) {
    const lord9 = houseLord(ascRashi, 9);
    const p9 = findPlanet(planets, lord9);
    if (p9 && (isInKendra(p9) || isInTrikona(p9)) && isExaltedOrOwn(p9) &&
      (isExaltedOrOwn(venus) || isInKendra(venus))) {
      yogas.push({
        name: 'Lakshmi Yoga',
        type: 'Raj Yoga',
        strength: 'Excellent',
        description: 'Lord of 9th strong in kendra/trikona with strong Venus. Bestows immense wealth, beauty, luxury, and all material comforts of the goddess Lakshmi.',
        involved: [lord9, 'Venus'],
      });
    }
  }

  // Saraswati Yoga: Jupiter, Venus, Mercury in kendras/trikonas/2nd, Jupiter strong
  if (jupiter && venus && mercury) {
    const goodHouses = [...KENDRA_HOUSES, ...TRIKONA_HOUSES, 2];
    if (goodHouses.includes(jupiter.houseNumber) &&
      goodHouses.includes(venus.houseNumber) &&
      goodHouses.includes(mercury.houseNumber) &&
      isExaltedOrOwn(jupiter)) {
      yogas.push({
        name: 'Saraswati Yoga',
        type: 'Raj Yoga',
        strength: 'Excellent',
        description: 'Jupiter, Venus, and Mercury in auspicious houses with strong Jupiter. Grants extraordinary learning, wisdom, literary talent, and mastery of arts and sciences.',
        involved: ['Jupiter', 'Venus', 'Mercury'],
      });
    }
  }

  // Parijata Yoga: Lagna lord in own/exalted sign, and its dispositor also in own/exalted
  {
    const lagnaLord = houseLord(ascRashi, 1);
    const pl = findPlanet(planets, lagnaLord);
    if (pl && isExaltedOrOwn(pl)) {
      const dispositor = lordOf(pl.rashiIndex);
      const pd = findPlanet(planets, dispositor);
      if (pd && isExaltedOrOwn(pd)) {
        yogas.push({
          name: 'Parijata Yoga',
          type: 'Raj Yoga',
          strength: 'Strong',
          description: 'Chain of dispositors in strong dignity. Confers gradual rise to prominence, increasing prosperity through middle and later life.',
          involved: [lagnaLord, dispositor],
        });
      }
    }
  }

  // ─── Dhana Yogas (4) ──────────────────────────────────────────────────────

  // Dhana Yoga variant 1: Lords of 2nd and 11th conjunct
  {
    const lord2 = houseLord(ascRashi, 2);
    const lord11 = houseLord(ascRashi, 11);
    const p2 = findPlanet(planets, lord2);
    const p11 = findPlanet(planets, lord11);
    if (p2 && p11 && lord2 !== lord11 && conjunct(p2, p11)) {
      yogas.push({
        name: 'Dhana Yoga (2-11 Lords)',
        type: 'Dhana Yoga',
        strength: 'Strong',
        description: 'Lords of 2nd (wealth) and 11th (gains) houses conjunct. Strong indication of wealth accumulation and steady income from multiple sources.',
        involved: [lord2, lord11],
      });
    }
  }

  // Dhana Yoga variant 2: Lord of 5th conjunct lord of 9th
  {
    const lord5 = houseLord(ascRashi, 5);
    const lord9 = houseLord(ascRashi, 9);
    const p5 = findPlanet(planets, lord5);
    const p9 = findPlanet(planets, lord9);
    if (p5 && p9 && lord5 !== lord9 && conjunct(p5, p9)) {
      yogas.push({
        name: 'Dhana Yoga (5-9 Lords)',
        type: 'Dhana Yoga',
        strength: 'Strong',
        description: 'Lords of 5th (purva punya) and 9th (fortune) conjunct. Wealth through past-life merit, speculation, and divine grace.',
        involved: [lord5, lord9],
      });
    }
  }

  // Dhana Yoga variant 3: Lord of 2nd in 11th or lord of 11th in 2nd
  {
    const lord2 = houseLord(ascRashi, 2);
    const lord11 = houseLord(ascRashi, 11);
    const p2 = findPlanet(planets, lord2);
    const p11 = findPlanet(planets, lord11);
    if (p2 && p2.houseNumber === 11) {
      yogas.push({
        name: 'Dhana Yoga (2nd Lord in 11th)',
        type: 'Dhana Yoga',
        strength: 'Moderate',
        description: 'Lord of 2nd house in 11th house. Wealth flows through networks, elder siblings, and fulfilled desires.',
        involved: [lord2],
      });
    }
    if (p11 && p11.houseNumber === 2) {
      yogas.push({
        name: 'Dhana Yoga (11th Lord in 2nd)',
        type: 'Dhana Yoga',
        strength: 'Moderate',
        description: 'Lord of 11th house in 2nd house. Gains accumulate as savings, family wealth increases steadily.',
        involved: [lord11],
      });
    }
  }

  // Dhana Yoga variant 4: Jupiter in 2nd or 11th, strong
  if (jupiter && (jupiter.houseNumber === 2 || jupiter.houseNumber === 11) && isExaltedOrOwn(jupiter)) {
    yogas.push({
      name: 'Dhana Yoga (Jupiter)',
      type: 'Dhana Yoga',
      strength: 'Strong',
      description: `Strong Jupiter in ${jupiter.houseNumber === 2 ? '2nd' : '11th'} house. Natural significator of wealth in a wealth house ensures financial prosperity and wisdom in financial matters.`,
      involved: ['Jupiter'],
    });
  }

  // ─── Spiritual Yogas (4) ──────────────────────────────────────────────────

  // Sanyasa Yoga: 4+ planets in one house (including at least one strong planet)
  {
    const houseCounts: Record<number, PlanetInput[]> = {};
    for (const p of planets) {
      if (!houseCounts[p.houseNumber]) houseCounts[p.houseNumber] = [];
      houseCounts[p.houseNumber].push(p);
    }
    for (const [, group] of Object.entries(houseCounts)) {
      if (group.length >= 4) {
        yogas.push({
          name: 'Sanyasa Yoga',
          type: 'Spiritual Yoga',
          strength: group.length >= 5 ? 'Strong' : 'Moderate',
          description: `${group.length} planets concentrated in one house. Indicates strong renunciation tendencies and potential for spiritual life or monasticism.`,
          involved: group.map(p => p.name),
        });
        break;
      }
    }
  }

  // Pravrajya Yoga: Saturn in 9th or 12th, aspected by/conjunct Moon
  if (saturn && moon && (saturn.houseNumber === 9 || saturn.houseNumber === 12)) {
    if (conjunct(saturn, moon) || planetAspectsHouse(moon, saturn.houseNumber)) {
      yogas.push({
        name: 'Pravrajya Yoga',
        type: 'Spiritual Yoga',
        strength: 'Moderate',
        description: 'Saturn in 9th/12th connected with Moon. Inclination toward renunciation, pilgrimage, and spiritual pursuits away from worldly life.',
        involved: ['Saturn', 'Moon'],
      });
    }
  }

  // Moksha Yoga: Ketu in 12th house, especially with Jupiter influence
  if (ketu && ketu.houseNumber === 12) {
    const jupInfluence = jupiter && (conjunct(ketu, jupiter) || planetAspectsHouse(jupiter, 12));
    yogas.push({
      name: 'Moksha Yoga',
      type: 'Spiritual Yoga',
      strength: jupInfluence ? 'Strong' : 'Moderate',
      description: 'Ketu in 12th house of liberation. Strong spiritual evolution, detachment from material world, and potential for enlightenment.',
      involved: ['Ketu', ...(jupInfluence ? ['Jupiter'] : [])],
    });
  }

  // Tapasvi Yoga: Saturn and Ketu conjunct or Saturn in Ketu nakshatra
  if (saturn && ketu) {
    if (conjunct(saturn, ketu)) {
      yogas.push({
        name: 'Tapasvi Yoga',
        type: 'Spiritual Yoga',
        strength: 'Moderate',
        description: 'Saturn conjunct Ketu. Austere nature, deep meditation ability, spiritual discipline through hardship and self-denial.',
        involved: ['Saturn', 'Ketu'],
      });
    }
  }

  // ─── Negative Yogas (5) ───────────────────────────────────────────────────

  // Kaal Sarpa Yoga: All 7 planets between Rahu-Ketu axis
  if (rahu && ketu) {
    const rahuH = rahu.houseNumber;
    const ketuH = ketu.houseNumber;
    const sevenPlanets = planets.filter(p =>
      p.name !== 'Rahu' && p.name !== 'Ketu');

    // Check if all planets are on one side of the Rahu-Ketu axis
    let allOnOneSide = true;
    const normalizedHouses = sevenPlanets.map(p => {
      let h = ((p.houseNumber - rahuH) % 12 + 12) % 12;
      return h;
    });
    const ketuNorm = ((ketuH - rahuH) % 12 + 12) % 12;

    const allBefore = normalizedHouses.every(h => h > 0 && h < ketuNorm);
    const allAfter = normalizedHouses.every(h => h > ketuNorm && h < 12);

    if (allBefore || allAfter) {
      yogas.push({
        name: 'Kaal Sarpa Yoga',
        type: 'Negative Yoga',
        strength: 'Moderate',
        description: 'All planets hemmed between Rahu and Ketu. Karmic constraints in early life, sudden upheavals, but also potential for extraordinary achievement after overcoming obstacles.',
        involved: ['Rahu', 'Ketu'],
      });
    }
  }

  // Grahan Yoga: Sun or Moon conjunct Rahu or Ketu
  if (sun && rahu && conjunct(sun, rahu)) {
    yogas.push({
      name: 'Grahan Yoga (Solar)',
      type: 'Negative Yoga',
      strength: 'Moderate',
      description: 'Sun conjunct Rahu. Challenges with father, authority figures, and self-confidence. Ego issues but also potential for unconventional success.',
      involved: ['Sun', 'Rahu'],
    });
  }
  if (sun && ketu && conjunct(sun, ketu)) {
    yogas.push({
      name: 'Grahan Yoga (Solar-Ketu)',
      type: 'Negative Yoga',
      strength: 'Mild',
      description: 'Sun conjunct Ketu. Detachment from ego and authority. Spiritual growth through surrender of pride.',
      involved: ['Sun', 'Ketu'],
    });
  }
  if (moon && rahu && conjunct(moon, rahu)) {
    yogas.push({
      name: 'Grahan Yoga (Lunar)',
      type: 'Negative Yoga',
      strength: 'Moderate',
      description: 'Moon conjunct Rahu. Mental restlessness, anxiety tendencies, obsessive thinking. Powerful intuition when channeled positively.',
      involved: ['Moon', 'Rahu'],
    });
  }
  if (moon && ketu && conjunct(moon, ketu)) {
    yogas.push({
      name: 'Grahan Yoga (Lunar-Ketu)',
      type: 'Negative Yoga',
      strength: 'Mild',
      description: 'Moon conjunct Ketu. Emotional detachment, psychic sensitivity. Past-life spiritual tendencies surfacing.',
      involved: ['Moon', 'Ketu'],
    });
  }

  // Shakat Yoga: Jupiter in 6th or 8th from Moon
  if (moon && jupiter) {
    const diff = ((jupiter.houseNumber - moon.houseNumber) % 12 + 12) % 12;
    if (diff === 5 || diff === 7) { // 6th or 8th from Moon
      // Cancelled if Jupiter is in kendra from Lagna
      if (!isInKendra(jupiter)) {
        yogas.push({
          name: 'Shakat Yoga',
          type: 'Negative Yoga',
          strength: 'Mild',
          description: 'Jupiter in 6th or 8th from Moon. Fluctuating fortune, periodic setbacks in otherwise good life. Wealth comes and goes cyclically.',
          involved: ['Jupiter', 'Moon'],
        });
      }
    }
  }

  // Daridra Yoga: Lord of 11th in dusthana
  {
    const lord11 = houseLord(ascRashi, 11);
    const p11 = findPlanet(planets, lord11);
    if (p11 && isInDusthana(p11)) {
      yogas.push({
        name: 'Daridra Yoga',
        type: 'Negative Yoga',
        strength: 'Mild',
        description: `Lord of 11th (gains) placed in ${p11.houseNumber}th house (dusthana). Obstacles in income, delayed gains, and financial struggles during related dasha periods.`,
        involved: [lord11],
      });
    }
  }

  // Kemdrum Yoga (distinct entry in negative — same as Kemadruma but for negative list)
  // Already handled under Chandra Yogas above

  // ─── Miscellaneous Yogas (5+) ─────────────────────────────────────────────

  // Akhanda Samrajya Yoga: Jupiter lord of 2nd, 5th, or 11th, in kendra from Moon/Lagna, and lord of 11th in kendra
  if (jupiter) {
    const jIsLord = [2, 5, 11].some(h => houseLord(ascRashi, h) === 'Jupiter');
    if (jIsLord && isInKendra(jupiter)) {
      const lord11 = houseLord(ascRashi, 11);
      const p11 = findPlanet(planets, lord11);
      if (p11 && isInKendra(p11)) {
        yogas.push({
          name: 'Akhanda Samrajya Yoga',
          type: 'Miscellaneous',
          strength: 'Excellent',
          description: 'Jupiter as lord of 2nd/5th/11th in kendra with 11th lord also in kendra. Unbroken sovereignty, massive authority, and enduring empire of influence.',
          involved: ['Jupiter', lord11],
        });
      }
    }
  }

  // Chaturmukha Yoga: Jupiter in kendra, lord of lagna in a fixed sign, lord of 10th in moveable sign
  if (jupiter && isInKendra(jupiter)) {
    const lagnaLord = houseLord(ascRashi, 1);
    const pl = findPlanet(planets, lagnaLord);
    const lord10 = houseLord(ascRashi, 10);
    const p10 = findPlanet(planets, lord10);
    const fixedSigns = [1, 4, 7, 10]; // Taurus, Leo, Scorpio, Aquarius
    const moveableSigns = [0, 3, 6, 9]; // Aries, Cancer, Libra, Capricorn
    if (pl && fixedSigns.includes(pl.rashiIndex) && p10 && moveableSigns.includes(p10.rashiIndex)) {
      yogas.push({
        name: 'Chaturmukha Yoga',
        type: 'Miscellaneous',
        strength: 'Strong',
        description: 'Jupiter in kendra, lagna lord in fixed sign, 10th lord in moveable sign. Four-faced Brahma yoga — wisdom recognized from all directions.',
        involved: ['Jupiter', lagnaLord, lord10],
      });
    }
  }

  // Kahala Yoga: Lords of 4th and 9th in mutual kendras, strong lagna lord
  {
    const lord4 = houseLord(ascRashi, 4);
    const lord9 = houseLord(ascRashi, 9);
    const p4 = findPlanet(planets, lord4);
    const p9 = findPlanet(planets, lord9);
    const lagnaLord = houseLord(ascRashi, 1);
    const pl = findPlanet(planets, lagnaLord);
    if (p4 && p9 && lord4 !== lord9 && isInKendra(p4) && isInKendra(p9) &&
      pl && (isExaltedOrOwn(pl) || isInKendra(pl))) {
      yogas.push({
        name: 'Kahala Yoga',
        type: 'Miscellaneous',
        strength: 'Strong',
        description: 'Lords of 4th and 9th in kendras with strong lagna lord. Brave, bold character with authority and success in competitive endeavors.',
        involved: [lord4, lord9, lagnaLord],
      });
    }
  }

  // Mahabhagya Yoga: For male birth (Sun, Moon, Lagna in odd signs) or female (even signs)
  // We check both possibilities since we don't know gender
  if (sun && moon) {
    const lagnaOdd = ascRashi % 2 === 0; // 0-indexed: Aries(0)=odd, Taurus(1)=even
    const sunOdd = sun.rashiIndex % 2 === 0;
    const moonOdd = moon.rashiIndex % 2 === 0;

    if (lagnaOdd && sunOdd && moonOdd) {
      yogas.push({
        name: 'Mahabhagya Yoga (Male)',
        type: 'Miscellaneous',
        strength: 'Strong',
        description: 'Lagna, Sun, and Moon all in odd signs (for male birth). Great fortune, long life, leadership, and widespread fame.',
        involved: ['Sun', 'Moon'],
      });
    }
    if (!lagnaOdd && !sunOdd && !moonOdd) {
      yogas.push({
        name: 'Mahabhagya Yoga (Female)',
        type: 'Miscellaneous',
        strength: 'Strong',
        description: 'Lagna, Sun, and Moon all in even signs (for female birth). Great fortune, long life, blessed children, and devoted partner.',
        involved: ['Sun', 'Moon'],
      });
    }
  }

  // Pushkala Yoga: Lagna lord and Moon sign lord conjunct, aspected by strong planet, Moon in a kendra
  if (moon) {
    const lagnaLord = houseLord(ascRashi, 1);
    const moonSignLord = lordOf(moon.rashiIndex);
    const pl = findPlanet(planets, lagnaLord);
    const pml = findPlanet(planets, moonSignLord);
    if (pl && pml && lagnaLord !== moonSignLord && conjunct(pl, pml) && isInKendra(moon)) {
      yogas.push({
        name: 'Pushkala Yoga',
        type: 'Miscellaneous',
        strength: 'Strong',
        description: 'Lagna lord and Moon-sign lord conjunct with Moon in kendra. Sweet speech, widespread fame, wealth, and honored by rulers.',
        involved: [lagnaLord, moonSignLord, 'Moon'],
      });
    }
  }

  // Chamara Yoga: Lagna lord exalted in kendra, aspected by Jupiter
  {
    const lagnaLord = houseLord(ascRashi, 1);
    const pl = findPlanet(planets, lagnaLord);
    if (pl && isExalted(pl) && isInKendra(pl) && jupiter && planetAspectsHouse(jupiter, pl.houseNumber)) {
      yogas.push({
        name: 'Chamara Yoga',
        type: 'Miscellaneous',
        strength: 'Excellent',
        description: 'Exalted lagna lord in kendra aspected by Jupiter. Royal honors, eloquent speech, long life, and scholarly reputation.',
        involved: [lagnaLord, 'Jupiter'],
      });
    }
  }

  // Parvata Yoga: Benefics in kendras, no malefics in kendras
  {
    const beneficsInKendra = planets.filter(p => NATURAL_BENEFICS.has(p.name) && isInKendra(p));
    const maleficsInKendra = planets.filter(p => NATURAL_MALEFICS.has(p.name) && isInKendra(p));
    if (beneficsInKendra.length >= 2 && maleficsInKendra.length === 0) {
      yogas.push({
        name: 'Parvata Yoga',
        type: 'Miscellaneous',
        strength: 'Strong',
        description: 'Multiple benefics in kendras with no malefic influence. Charitable, wealthy, prosperous, and famous. Leader respected by all.',
        involved: beneficsInKendra.map(p => p.name),
      });
    }
  }

  return yogas;
}


// ============================================================
// 2. ASHTAKVARGA SYSTEM
// ============================================================

/**
 * Standard Ashtakvarga benefic-point (bindu) contribution positions.
 * For each contributing body (rows), the positions (from itself) where it gives
 * a bindu to the scored planet (column key).
 *
 * Key = scored planet, value = Record<contributorName, positionsArray>
 * Positions are 1-indexed house offsets from the contributor.
 */
const ASHTAKVARGA_TABLE: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    Moon:    [3, 6, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus:   [6, 7, 12],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Asc:     [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun:     [3, 6, 7, 8, 10, 11],
    Moon:    [1, 3, 6, 7, 10, 11],
    Mars:    [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus:   [3, 4, 5, 7, 9, 10, 11],
    Saturn:  [3, 5, 6, 11],
    Asc:     [3, 6, 10, 11],
  },
  Mars: {
    Sun:     [3, 5, 6, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus:   [6, 8, 11, 12],
    Saturn:  [1, 4, 7, 8, 9, 10, 11],
    Asc:     [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun:     [5, 6, 9, 11, 12],
    Moon:    [2, 4, 6, 8, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Asc:     [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon:    [2, 5, 7, 9, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus:   [2, 5, 6, 9, 10, 11],
    Saturn:  [3, 5, 6, 12],
    Asc:     [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun:     [8, 11, 12],
    Moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars:    [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn:  [3, 4, 5, 8, 9, 10, 11],
    Asc:     [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun:     [1, 2, 4, 7, 8, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus:   [6, 11, 12],
    Saturn:  [3, 5, 6, 11],
    Asc:     [1, 3, 4, 6, 10, 11],
  },
};

export function computeAshtakvarga(planets: PlanetInput[], ascRashiIndex: number): AshtakvargaResult {
  const planetScores: Record<string, number[]> = {};
  const sarvashtakvarga: number[] = new Array(12).fill(0);

  // Build rashi lookup: planet name -> rashi index (0-11)
  const rashiLookup: Record<string, number> = {};
  for (const p of planets) {
    rashiLookup[p.name] = p.rashiIndex;
  }
  rashiLookup['Asc'] = ascRashiIndex;

  for (const scoredPlanet of SEVEN_PLANETS) {
    const scores = new Array(12).fill(0);
    const table = ASHTAKVARGA_TABLE[scoredPlanet];
    if (!table) continue;

    for (const [contributor, positions] of Object.entries(table)) {
      const contRashi = rashiLookup[contributor];
      if (contRashi === undefined) continue;

      for (const offset of positions) {
        // offset is 1-indexed: position 1 = same sign as contributor
        const targetRashi = (contRashi + offset - 1) % 12;
        scores[targetRashi] += 1;
      }
    }

    planetScores[scoredPlanet] = scores;
    for (let i = 0; i < 12; i++) {
      sarvashtakvarga[i] += scores[i];
    }
  }

  const totalBindus = sarvashtakvarga.reduce((s, v) => s + v, 0);

  // Map rashi indices to house numbers for strong/weak classification
  const strongHouses: number[] = [];
  const weakHouses: number[] = [];
  for (let i = 0; i < 12; i++) {
    const houseNum = ((i - ascRashiIndex + 12) % 12) + 1;
    if (sarvashtakvarga[i] >= 28) strongHouses.push(houseNum);
    if (sarvashtakvarga[i] < 25) weakHouses.push(houseNum);
  }

  return {
    planetScores,
    sarvashtakvarga,
    totalBindus,
    strongHouses: strongHouses.sort((a, b) => a - b),
    weakHouses: weakHouses.sort((a, b) => a - b),
  };
}


// ============================================================
// 3. SHADBALA CALCULATION
// ============================================================

export function computeShadbala(
  planets: PlanetInput[],
  ascRashiIndex: number,
  birthMonth: number,   // 1-12
  birthHour: number,    // 0-23 (decimal hours, e.g. 14.5 = 2:30 PM)
): ShadbalaResult {
  const result: ShadbalaResult = { planets: {} };
  const isDaytime = birthHour >= 6 && birthHour < 18;

  for (const planet of planets) {
    if (planet.name === 'Rahu' || planet.name === 'Ketu') continue;

    // ── Sthana Bala (Positional Strength) ──
    let sthana = 0;
    switch (planet.dignity) {
      case 'Exalted': sthana = 60; break;
      case 'Moolatrikona': sthana = 52; break;
      case 'Own': sthana = 45; break;
      case 'Friendly': sthana = 30; break;
      case 'Neutral': sthana = 15; break;
      case 'Enemy': sthana = 7; break;
      case 'Debilitated': sthana = 0; break;
      default: sthana = 15;
    }
    // Uchcha Bala component: closeness to exaltation degree
    if (EXALTATION_RASHI[planet.name] !== undefined) {
      const exaltRashi = EXALTATION_RASHI[planet.name];
      const distFromExalt = Math.abs(planet.rashiIndex - exaltRashi);
      const signDist = Math.min(distFromExalt, 12 - distFromExalt);
      sthana += Math.max(0, (6 - signDist)) * 5; // up to 30 more points
    }
    // Kendra/Trikona bonus
    if (isInKendra(planet)) sthana += 15;
    else if (isInTrikona(planet)) sthana += 10;
    else if (UPACHAYA_HOUSES.includes(planet.houseNumber)) sthana += 5;

    // ── Dig Bala (Directional Strength) ──
    let dig = 0;
    const pName = planet.name;
    const house = planet.houseNumber;
    // Jupiter/Mercury strong in 1st (East)
    if ((pName === 'Jupiter' || pName === 'Mercury') && house === 1) dig = 100;
    else if ((pName === 'Jupiter' || pName === 'Mercury') && house === 7) dig = 0;
    // Sun/Mars strong in 10th (South)
    else if ((pName === 'Sun' || pName === 'Mars') && house === 10) dig = 100;
    else if ((pName === 'Sun' || pName === 'Mars') && house === 4) dig = 0;
    // Moon/Venus strong in 4th (North)
    else if ((pName === 'Moon' || pName === 'Venus') && house === 4) dig = 100;
    else if ((pName === 'Moon' || pName === 'Venus') && house === 10) dig = 0;
    // Saturn strong in 7th (West)
    else if (pName === 'Saturn' && house === 7) dig = 100;
    else if (pName === 'Saturn' && house === 1) dig = 0;
    else {
      // Interpolated: compute based on distance from peak house
      const peakHouse =
        (pName === 'Jupiter' || pName === 'Mercury') ? 1 :
          (pName === 'Sun' || pName === 'Mars') ? 10 :
            (pName === 'Moon' || pName === 'Venus') ? 4 : 7;
      const dist = Math.abs(((house - peakHouse + 6 + 12) % 12) - 6);
      dig = Math.round(Math.max(0, (6 - dist) / 6 * 100));
    }

    // ── Kala Bala (Temporal Strength) ──
    let kala = 50; // base
    // Day/Night strength
    if (isDaytime) {
      if (['Sun', 'Jupiter', 'Mars'].includes(pName)) kala += 30;
      if (['Moon', 'Venus', 'Saturn'].includes(pName)) kala -= 15;
    } else {
      if (['Moon', 'Venus', 'Saturn'].includes(pName)) kala += 30;
      if (['Sun', 'Jupiter', 'Mars'].includes(pName)) kala -= 15;
    }
    if (pName === 'Mercury') kala += 15; // Mercury always gets some kala bonus

    // Seasonal (Ayana) component — simplified
    const isSunNorthward = birthMonth >= 1 && birthMonth <= 6; // Uttarayana approx
    if (isSunNorthward) {
      if (['Sun', 'Mars', 'Jupiter'].includes(pName)) kala += 10;
    } else {
      if (['Moon', 'Venus', 'Saturn'].includes(pName)) kala += 10;
    }
    kala = Math.min(100, Math.max(0, kala));

    // ── Chesta Bala (Motional Strength) ──
    let chesta = 50;
    if (pName === 'Sun' || pName === 'Moon') {
      // Sun and Moon don't retrograde — chesta based on speed (use default moderate)
      chesta = 50;
    } else {
      if (planet.isRetrograde) {
        chesta = 90; // Retrograde planets are strong in chesta bala
      } else {
        chesta = 40; // Direct motion — moderate
      }
    }

    // ── Naisargika Bala (Natural Strength) ──
    const naisargika = NAISARGIKA_BALA[pName] ?? 30;

    // ── Drik Bala (Aspectual Strength) ──
    let drik = 50; // neutral baseline
    for (const other of planets) {
      if (other.name === planet.name || other.name === 'Rahu' || other.name === 'Ketu') continue;
      if (planetAspectsHouse(other, planet.houseNumber) || conjunct(other, planet)) {
        if (NATURAL_BENEFICS.has(other.name)) {
          drik += 12;
        } else {
          drik -= 10;
        }
      }
    }
    // Rahu/Ketu malefic aspect
    for (const shadow of planets.filter(p => p.name === 'Rahu' || p.name === 'Ketu')) {
      if (conjunct(shadow, planet) || planetAspectsHouse(shadow, planet.houseNumber)) {
        drik -= 8;
      }
    }
    drik = Math.min(100, Math.max(0, drik));

    const total = sthana + dig + kala + chesta + naisargika + drik;
    const required = SHADBALA_REQUIRED[pName] ?? 350;
    // Scale total to approximate virupa range (our scores are in 0-100 per component,
    // so max ~600; required is ~300-420). Percentage = total/required*100
    const percentage = Math.round((total / required) * 100);

    result.planets[pName] = {
      sthana: Math.round(sthana),
      dig: Math.round(dig),
      kala: Math.round(kala),
      chesta: Math.round(chesta),
      naisargika: Math.round(naisargika * 10) / 10,
      drik: Math.round(drik),
      total: Math.round(total),
      percentage,
      isStrong: percentage >= 100,
    };
  }

  return result;
}


// ============================================================
// 4. DOSHA DETECTION
// ============================================================

export function detectDoshas(planets: PlanetInput[], ascRashiIndex: number): DoshaResult[] {
  const doshas: DoshaResult[] = [];

  const sun = findPlanet(planets, 'Sun');
  const moon = findPlanet(planets, 'Moon');
  const mars = findPlanet(planets, 'Mars');
  const jupiter = findPlanet(planets, 'Jupiter');
  const venus = findPlanet(planets, 'Venus');
  const saturn = findPlanet(planets, 'Saturn');
  const rahu = findPlanet(planets, 'Rahu');
  const ketu = findPlanet(planets, 'Ketu');

  // ── Mangal Dosha ──
  if (mars) {
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    const fromLagna = mangalHouses.includes(mars.houseNumber);

    let fromMoon = false;
    if (moon) {
      const marsFromMoon = ((mars.houseNumber - moon.houseNumber + 12) % 12) + 1;
      fromMoon = mangalHouses.includes(marsFromMoon);
    }

    let fromVenus = false;
    if (venus) {
      const marsFromVenus = ((mars.houseNumber - venus.houseNumber + 12) % 12) + 1;
      fromVenus = mangalHouses.includes(marsFromVenus);
    }

    if (fromLagna || fromMoon || fromVenus) {
      const count = [fromLagna, fromMoon, fromVenus].filter(Boolean).length;

      // Check cancellation conditions
      const cancelled =
        (mars.rashiIndex === 0 || mars.rashiIndex === 7 || mars.rashiIndex === 9) || // Mars in own/exalted sign
        (jupiter && (conjunct(jupiter, mars) || planetAspectsHouse(jupiter, mars.houseNumber))); // Jupiter aspect

      let severity: DoshaResult['severity'] = 'Mild';
      if (!cancelled) {
        severity = count >= 3 ? 'Severe' : count >= 2 ? 'Moderate' : 'Mild';
      }

      const sources = [
        fromLagna ? 'Lagna' : '',
        fromMoon ? 'Moon' : '',
        fromVenus ? 'Venus' : '',
      ].filter(Boolean).join(', ');

      doshas.push({
        name: 'Mangal Dosha',
        severity: cancelled ? 'Mild' : severity,
        description: `Mars in ${mars.houseNumber}th house from ${sources}. ${cancelled ? 'Dosha is partially cancelled.' : 'May affect marital harmony, requiring Mangal Dosha matching in compatibility.'}`,
        remedies: [
          'Chant Mangal (Mars) mantra: "Om Kraam Kreem Kraum Sah Bhaumaya Namah"',
          'Perform Kumbh Vivah ritual before marriage',
          'Worship Lord Hanuman on Tuesdays',
          'Donate red lentils, red cloth, or coral on Tuesdays',
          'Fast on Tuesdays and offer prayers at Mangal Nath temple',
        ],
      });
    }
  }

  // ── Kaal Sarpa Dosha ──
  if (rahu && ketu) {
    const rahuH = rahu.houseNumber;
    const ketuH = ketu.houseNumber;
    const sevenPlanets = planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu');

    const normalizedHouses = sevenPlanets.map(p =>
      ((p.houseNumber - rahuH) % 12 + 12) % 12);
    const ketuNorm = ((ketuH - rahuH) % 12 + 12) % 12;

    const allBefore = normalizedHouses.every(h => h > 0 && h < ketuNorm);
    const allAfter = normalizedHouses.every(h => h > ketuNorm && h < 12);

    if (allBefore || allAfter) {
      doshas.push({
        name: 'Kaal Sarpa Dosha',
        severity: (rahuH === 1 || rahuH === 7) ? 'Severe' : 'Moderate',
        description: 'All planets are hemmed between Rahu and Ketu axis. This creates karmic challenges, obstacles in early life, and spiritual lessons that must be addressed.',
        remedies: [
          'Perform Kaal Sarpa Dosha puja at Trimbakeshwar or Srikalahasti',
          'Chant Rahu mantra: "Om Raam Rahave Namah" 18,000 times',
          'Worship Lord Shiva with Rudrabhishek on Nag Panchami',
          'Donate black sesame seeds and blue cloth on Saturdays',
          'Keep a silver snake idol at home and offer milk on Nag Panchami',
        ],
      });
    }
  }

  // ── Pitru Dosha ──
  if (sun) {
    const sunAfflicted =
      (rahu && (conjunct(sun, rahu) || planetAspectsHouse(rahu, sun.houseNumber))) ||
      (ketu && (conjunct(sun, ketu) || planetAspectsHouse(ketu, sun.houseNumber))) ||
      (saturn && (conjunct(sun, saturn) || planetAspectsHouse(saturn, sun.houseNumber)));

    // Also check: Sun in 9th with malefic influence
    const sunIn9th = sun.houseNumber === 9;

    if (sunAfflicted || sunIn9th) {
      const afflictors = [
        rahu && (conjunct(sun, rahu) || planetAspectsHouse(rahu, sun.houseNumber)) ? 'Rahu' : '',
        ketu && (conjunct(sun, ketu) || planetAspectsHouse(ketu, sun.houseNumber)) ? 'Ketu' : '',
        saturn && (conjunct(sun, saturn) || planetAspectsHouse(saturn, sun.houseNumber)) ? 'Saturn' : '',
      ].filter(Boolean);

      doshas.push({
        name: 'Pitru Dosha',
        severity: afflictors.length >= 2 ? 'Severe' : sunIn9th ? 'Moderate' : 'Mild',
        description: `Sun afflicted by ${afflictors.join(', ') || 'malefic placement'}. Indicates ancestral karmic debt requiring propitiation of forefathers.`,
        remedies: [
          'Perform Pitru Tarpan during Pitru Paksha (16-day ancestor worship period)',
          'Offer water to the Sun at sunrise daily with the Gayatri Mantra',
          'Donate food to Brahmins on Amavasya (new moon)',
          'Perform Narayan Nagbali puja at Trimbakeshwar',
          'Plant a Peepal tree and water it regularly',
        ],
      });
    }
  }

  // ── Guru Chandal Dosha ──
  if (jupiter) {
    const jupRahu = rahu && conjunct(jupiter, rahu);
    const jupKetu = ketu && conjunct(jupiter, ketu);
    if (jupRahu || jupKetu) {
      const shadow = jupRahu ? 'Rahu' : 'Ketu';
      doshas.push({
        name: 'Guru Chandal Dosha',
        severity: jupRahu ? 'Moderate' : 'Mild',
        description: `Jupiter conjunct ${shadow}. May cause confusion in dharmic matters, challenges with teachers or gurus, and unconventional spiritual path.`,
        remedies: [
          'Chant Jupiter mantra: "Om Gram Greem Graum Sah Gurave Namah"',
          'Wear a yellow sapphire (Pukhraj) after consulting an astrologer',
          'Worship Lord Vishnu on Thursdays, offer yellow flowers and turmeric',
          'Donate yellow items (clothes, bananas, turmeric) on Thursdays',
          'Read Vishnu Sahasranama regularly',
        ],
      });
    }
  }

  // ── Shani Dosha (Sade Sati related) ──
  if (saturn && moon) {
    const satFromMoon = ((saturn.houseNumber - moon.houseNumber + 12) % 12) + 1;
    if ([1, 4, 7, 8].includes(satFromMoon)) {
      const severity: DoshaResult['severity'] =
        satFromMoon === 1 ? 'Severe' : // Saturn on Moon (Sade Sati peak)
          satFromMoon === 8 ? 'Moderate' : 'Mild';
      doshas.push({
        name: 'Shani Dosha',
        severity,
        description: `Saturn in ${satFromMoon}th from Moon. Creates pressure on emotional well-being, delays, and karmic lessons requiring patience and discipline.`,
        remedies: [
          'Chant Shani mantra: "Om Sham Shanaishcharaya Namah" on Saturdays',
          'Donate black items (sesame, mustard oil, iron) on Saturdays',
          'Visit Shani temple on Saturdays and light sesame oil lamp',
          'Feed crows and black dogs on Saturdays',
          'Wear a blue sapphire (Neelam) only after expert consultation',
        ],
      });
    }
  }

  // ── Nadi Dosha (type export — compatibility context) ──
  // Nadi Dosha is primarily a compatibility dosha (matching Moon nakshatras).
  // We detect if the native's nakshatra falls in a sensitive Nadi group.
  // Actual dosha assessment requires both charts — included as informational.

  // ── Grahan Dosha ──
  {
    const eclipseCombos: [PlanetInput | undefined, PlanetInput | undefined, string][] = [
      [sun, rahu, 'Sun-Rahu conjunction (Surya Grahan)'],
      [sun, ketu, 'Sun-Ketu conjunction (Surya Grahan)'],
      [moon, rahu, 'Moon-Rahu conjunction (Chandra Grahan)'],
      [moon, ketu, 'Moon-Ketu conjunction (Chandra Grahan)'],
    ];

    for (const [luminary, shadow, desc] of eclipseCombos) {
      if (luminary && shadow && conjunct(luminary, shadow)) {
        // Check if already captured as Grahan Yoga — still add as dosha with remedies
        const isLunarEclipse = luminary.name === 'Moon';
        doshas.push({
          name: 'Grahan Dosha',
          severity: luminary.name === 'Sun' && shadow!.name === 'Rahu' ? 'Severe' :
            isLunarEclipse && shadow!.name === 'Rahu' ? 'Moderate' : 'Mild',
          description: `${desc}. Born near an eclipse axis — may affect ${luminary.name === 'Sun' ? 'vitality, father, and authority' : 'mental peace, mother, and emotions'}.`,
          remedies: [
            `Chant ${luminary.name === 'Sun' ? 'Aditya Hridayam' : 'Chandra mantra'} regularly`,
            `Perform ${shadow!.name} shanti puja`,
            `Donate to charity on eclipse days`,
            `Worship Lord Shiva during Pradosh Vrat`,
            `Keep a ${luminary.name === 'Sun' ? 'ruby' : 'pearl'} energized and nearby (consult astrologer before wearing)`,
          ],
        });
      }
    }
  }

  return doshas;
}


// ============================================================
// 5. RAHU/KETU SIGN INTERPRETATIONS
// ============================================================

export const RAHU_KETU_INTERPRETATIONS: Record<string, Record<string, string>> = {
  Rahu: {
    Mesha: 'Rahu in Mesha — Intense desire for independence and pioneering action. Driven to be first, to lead, and to carve a unique identity. Can bring sudden courage and military or athletic ambitions. Obsessive about self-image and personal achievement. Must learn to temper aggression with wisdom.',
    Vrishabha: 'Rahu in Vrishabha (exalted) — Powerful material ambitions, desire for luxury, wealth, and sensory pleasures. Can amass great wealth through unconventional means. Strong attraction to beauty, fine arts, and gourmet experiences. Risk of overindulgence and possessiveness. Excellent placement for financial success.',
    Mithuna: 'Rahu in Mithuna — Amplified intellectual curiosity and communication abilities. Fascinated by media, technology, writing, and information exchange. Can become a powerful communicator or media personality. Risk of spreading misinformation or nervous restlessness. Must channel the mental energy productively.',
    Karka: 'Rahu in Karka — Deep desire for emotional security, home, and belonging. May feel like an outsider seeking acceptance. Strong attachment to mother and motherland. Can create unusual domestic situations or foreign residence. Emotional manipulation tendencies need awareness. Powerful intuitive abilities when positive.',
    Simha: 'Rahu in Simha — Burning desire for fame, recognition, and power. Drawn to politics, entertainment, and leadership roles. Can achieve celebrity status through unconventional paths. Risk of ego inflation and authoritarian tendencies. Creative brilliance when channeled properly. Challenges with father or authority figures.',
    Kanya: 'Rahu in Kanya — Obsessive attention to detail, health, and service. Can excel in medicine, technology, or analytical fields. Tendency toward hypochondria or obsessive health practices. Amplifies perfectionism to extraordinary levels. Success through mastering technical skills and systematic approaches.',
    Tula: 'Rahu in Tula — Strong desire for partnerships, harmony, and social status. Can bring unconventional relationships or foreign spouse. Diplomatic abilities amplified but may use charm manipulatively. Success in law, diplomacy, and luxury goods. Must learn authentic relating beyond social masks.',
    Vrischika: 'Rahu in Vrischika — Intense fascination with occult, transformation, and hidden knowledge. Powerful research abilities and psychological insight. Can bring sudden upheavals and transformative experiences. Risk of obsession with power, sexuality, or dark subjects. Extraordinary healing abilities when evolved.',
    Dhanu: 'Rahu in Dhanu — Desire to be seen as wise, spiritual, or righteous. May adopt foreign philosophies or unconventional spiritual paths. Can bring sudden religious or philosophical awakenings. Risk of spiritual bypassing or guru complex. Success through higher education, publishing, or international ventures.',
    Makara: 'Rahu in Makara — Ambitious drive for worldly status, career success, and authority. Can achieve remarkable professional heights through unconventional means. Fascination with political power and organizational structures. Risk of ruthless ambition. Excellent for careers in government, corporations, or public office.',
    Kumbha: 'Rahu in Kumbha — Strong desire for social change, innovation, and group influence. Natural affinity for technology, science, and humanitarian causes. Can become a powerful social reformer or tech innovator. Risk of detachment from personal relationships. Success through networking and progressive ideas.',
    Meena: 'Rahu in Meena — Deep fascination with spirituality, mysticism, and transcendence. Can bring vivid dreams, psychic experiences, and spiritual confusion. Desire for moksha through unconventional spiritual methods. Risk of escapism, addiction, or spiritual delusion. Powerful artistic and healing potential when channeled through discipline.',
  },
  Ketu: {
    Mesha: 'Ketu in Mesha — Past-life warrior energy; natural courage that needs no external validation. Detachment from ego and personal ambition. May struggle with initiative despite innate bravery. Spiritual warrior qualities. Headaches or head injuries possible. Liberation comes through selfless action and surrendering the need to be first.',
    Vrishabha: 'Ketu in Vrishabha — Past-life mastery of material comfort now creating detachment from wealth and luxury. May be indifferent to possessions despite having them. Voice or throat issues possible. Spiritual richness over material attachment. Can indicate sudden losses of wealth that catalyze spiritual growth.',
    Mithuna: 'Ketu in Mithuna — Past-life communicator now seeking silence and inner knowledge. May struggle with conventional education but possess intuitive understanding. Communication feels inadequate for the depth of inner knowing. Nervous system sensitivity. Spiritual gifts in meditation and contemplation over verbal expression.',
    Karka: 'Ketu in Karka — Past-life emotional mastery creating current detachment from home and mother. May feel emotionally distant or struggle with nurturing. Powerful psychic and intuitive abilities from past incarnations. Stomach or digestive sensitivities. Liberation through releasing emotional attachments and family karma.',
    Simha: 'Ketu in Simha — Past-life royalty or authority now seeking humility. Detached from fame and ego recognition. May struggle with creative expression despite innate talent. Heart-related sensitivities. Spiritual evolution through surrendering pride and serving others without need for applause.',
    Kanya: 'Ketu in Kanya — Past-life analytical mastery creating current disinterest in details and perfectionism. Intuitive problem-solving over systematic analysis. Health may be unpredictable. Excellent for spiritual healing abilities. Liberation through accepting imperfection and surrendering the need to control.',
    Tula: 'Ketu in Tula (debilitated) — Past-life relationship mastery now creating detachment from partnerships. May struggle with commitment or feel indifferent to social harmony. Can indicate unconventional relationship patterns. Liberation through finding inner balance without depending on others for completeness.',
    Vrischika: 'Ketu in Vrischika — Past-life occult mastery providing natural understanding of hidden realms. Intense spiritual depth without seeking it. May experience sudden transformations or near-death experiences. Powerful healing and tantric abilities from past lives. Liberation through surrendering control over life and death matters.',
    Dhanu: 'Ketu in Dhanu — Past-life spiritual teacher now questioning all doctrines. Natural wisdom that transcends organized religion. May feel disillusioned with gurus and institutions. Hip or thigh sensitivities. Liberation through direct experience of truth rather than following prescribed paths.',
    Makara: 'Ketu in Makara — Past-life authority and career mastery creating detachment from worldly ambition. May seem disinterested in career despite natural leadership abilities. Knee or bone sensitivities. Liberation through surrendering attachment to status and finding spiritual purpose beyond worldly achievements.',
    Kumbha: 'Ketu in Kumbha — Past-life humanitarian and innovator now detached from social causes and group identity. Natural understanding of technology and science without emotional investment. May feel alienated from groups. Liberation through individual spiritual practice rather than collective movements.',
    Meena: 'Ketu in Meena — Past-life spiritual adept with deep moksha energy. Natural meditation abilities and access to transcendent states. May feel this world is illusory. Feet sensitivities. The most spiritual Ketu placement — liberation is the natural trajectory. Must ground spiritual experiences in daily life to avoid escapism.',
  },
};


// ============================================================
// Nadi Dosha type export (for compatibility)
// ============================================================

export interface NadiDoshaInfo {
  nakshatraIndex: number;
  nadiType: 'Aadi' | 'Madhya' | 'Antya';
}

/** Nadi classification for each nakshatra (0-26) */
const NADI_MAP: ('Aadi' | 'Madhya' | 'Antya')[] = [
  'Aadi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Aadi',
  'Aadi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Aadi',
  'Aadi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Aadi',
  'Aadi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Aadi',
  'Aadi', 'Madhya', 'Antya',
];

export function getNadiInfo(nakshatraIndex: number): NadiDoshaInfo {
  return {
    nakshatraIndex,
    nadiType: NADI_MAP[nakshatraIndex % 27],
  };
}

/**
 * Check Nadi Dosha between two Moon nakshatras.
 * Returns true if both have the same Nadi (dosha present).
 */
export function hasNadiDosha(nakshatra1: number, nakshatra2: number): boolean {
  return NADI_MAP[nakshatra1 % 27] === NADI_MAP[nakshatra2 % 27];
}
