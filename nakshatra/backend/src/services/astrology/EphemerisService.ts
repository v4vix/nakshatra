// Vedic Ephemeris Service
// Implements simplified but accurate astronomical formulas based on Jean Meeus
// "Astronomical Algorithms" (2nd ed.) adapted for Vedic (sidereal) astrology

export interface PlanetaryData {
  planet: string;
  tropicalLongitude: number;   // degrees, 0-360
  siderealLongitude: number;   // tropical minus Lahiri ayanamsa
  rashiIndex: number;          // 0=Mesha ... 11=Meena
  rashiName: string;
  degreeInRashi: number;
  nakshatraIndex: number;      // 0-26
  nakshatraName: string;
  pada: number;                // 1-4
  degreeInNakshatra: number;
  isRetrograde: boolean;
  speed: number;               // degrees per day (negative = retrograde)
}

export interface AscendantData {
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number;
  rashiName: string;
  degreeInRashi: number;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
}

const RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrishchika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Degrees per nakshatra = 360/27 = 13.333...
const NAKSHATRA_SPAN = 360 / 27;

// Keplerian orbital elements at J2000.0 (epoch 2000 Jan 1.5)
// [a (AU), e, I (°), L (°), long_peri (°), long_node (°)]
// Rates per century: [da, de, dI, dL, dlong_peri, dlong_node]
// Source: NASA/JPL approximate planetary positions
const KEPLERIAN_ELEMENTS: Record<string, { a: number; e: number; I: number; L: number; lp: number; ln: number; da: number; de: number; dI: number; dL: number; dlp: number; dln: number }> = {
  Mercury: { a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.25032350, lp: 77.45779628, ln: 48.33076593, da: 0.00000037, de: 0.00001906, dI: -0.00594749, dL: 149472.67411175, dlp: 0.16047689, dln: -0.12534081 },
  Venus: { a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.97909950, lp: 131.60246718, ln: 76.67984255, da: 0.00000390, de: -0.00004107, dI: -0.00078890, dL: 58517.81538729, dlp: 0.00268329, dln: -0.27769418 },
  Mars: { a: 1.52371034, e: 0.09339410, I: 1.84969142, L: -4.55343205, lp: -23.94362959, ln: 49.55953891, da: 0.00001847, de: 0.00007882, dI: -0.00813131, dL: 19140.30268499, dlp: 0.44441088, dln: -0.29257343 },
  Jupiter: { a: 5.20288700, e: 0.04838624, I: 1.30439695, L: 34.39644051, lp: 14.72847983, ln: 100.47390909, da: -0.00011607, de: -0.00013253, dI: -0.00183714, dL: 3034.74612775, dlp: 0.21252668, dln: 0.20469106 },
  Saturn: { a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, lp: 92.59887831, ln: 113.66242448, da: -0.00125060, de: -0.00050991, dI: 0.00193609, dL: 1222.49362201, dlp: -0.41897216, dln: -0.28867794 },
  Uranus: { a: 19.18916464, e: 0.04725744, I: 0.77263783, L: 313.23810451, lp: 170.95427630, ln: 74.01692503, da: -0.00196176, de: -0.00004397, dI: -0.00242939, dL: 428.48202785, dlp: 0.40805281, dln: 0.04240589 },
  Neptune: { a: 30.06992276, e: 0.00859048, I: 1.77004347, L: -55.12002969, lp: 44.96476227, ln: 131.78422574, da: 0.00026291, de: 0.00005105, dI: 0.00035372, dL: 218.45945325, dlp: -0.32241464, dln: -0.00508664 },
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export class EphemerisService {
  /**
   * Convert a calendar date to Julian Day Number (JDN).
   * Implements the algorithm from Meeus Chapter 7.
   */
  dateToJulianDay(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day =
      date.getUTCDate() +
      date.getUTCHours() / 24 +
      date.getUTCMinutes() / 1440 +
      date.getUTCSeconds() / 86400;

    let Y = year;
    let M = month;

    if (M <= 2) {
      Y -= 1;
      M += 12;
    }

    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);

    return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5;
  }

  /**
   * Compute Lahiri ayanamsa for a given Julian Day.
   * Based on IAU 1956 Lahiri value: 23°15' at 1956.0
   * Rate: 50.2388475" per year = 0.01394690° per year
   */
  computeLahiriAyanamsa(julianDay: number): number {
    // T = Julian centuries from J2000.0
    const T = (julianDay - 2451545.0) / 36525.0;
    // Years from 1950.0
    const yearsFrom1950 = T * 100 + 50;
    const ayanamsa = 23.85 + 0.01396 * yearsFrom1950;
    return ayanamsa;
  }

  /**
   * Convert tropical to sidereal longitude using Lahiri ayanamsa.
   */
  tropicalToSidereal(tropicalLongitude: number, julianDay: number): number {
    const ayanamsa = this.computeLahiriAyanamsa(julianDay);
    return normalizeAngle(tropicalLongitude - ayanamsa);
  }

  /**
   * Determine rashi (sign) from sidereal longitude.
   */
  getRashi(siderealLongitude: number): { rashiIndex: number; rashiName: string; degreeInRashi: number } {
    const lon = normalizeAngle(siderealLongitude);
    const rashiIndex = Math.floor(lon / 30);
    const degreeInRashi = lon - rashiIndex * 30;
    return {
      rashiIndex,
      rashiName: RASHI_NAMES[rashiIndex],
      degreeInRashi: parseFloat(degreeInRashi.toFixed(4)),
    };
  }

  /**
   * Determine nakshatra and pada from sidereal longitude.
   * Each nakshatra = 13°20' = 13.333... degrees
   * Each pada = 3°20' = 3.333... degrees
   */
  getNakshatra(siderealLongitude: number): { nakshatraIndex: number; nakshatraName: string; pada: number; degreeInNakshatra: number } {
    const lon = normalizeAngle(siderealLongitude);
    const nakshatraIndex = Math.floor(lon / NAKSHATRA_SPAN);
    const degreeInNakshatra = lon - nakshatraIndex * NAKSHATRA_SPAN;
    const pada = Math.floor(degreeInNakshatra / (NAKSHATRA_SPAN / 4)) + 1;

    return {
      nakshatraIndex,
      nakshatraName: NAKSHATRA_NAMES[nakshatraIndex],
      pada: Math.min(pada, 4),
      degreeInNakshatra: parseFloat(degreeInNakshatra.toFixed(4)),
    };
  }

  /**
   * Compute Sun's ecliptic longitude using simplified VSOP87.
   * Accurate to about 0.01 degrees.
   * Source: Meeus "Astronomical Algorithms" Chapter 25.
   */
  getSunPosition(julianDay: number): PlanetaryData {
    const T = (julianDay - 2451545.0) / 36525.0;

    // Geometric mean longitude of Sun (degrees)
    const L0 = normalizeAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

    // Mean anomaly of Sun (degrees)
    const M = normalizeAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mrad = toRad(M);

    // Equation of center
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
      0.000289 * Math.sin(3 * Mrad);

    // Sun's true longitude
    const sunTrueLon = L0 + C;

    // Apparent longitude (correct for aberration and nutation)
    const omega = normalizeAngle(125.04 - 1934.136 * T);
    const apparentLon = normalizeAngle(sunTrueLon - 0.00569 - 0.00478 * Math.sin(toRad(omega)));

    const tropical = normalizeAngle(apparentLon);
    const sidereal = this.tropicalToSidereal(tropical, julianDay);
    const rashi = this.getRashi(sidereal);
    const nakshatra = this.getNakshatra(sidereal);

    return {
      planet: 'Sun',
      tropicalLongitude: parseFloat(tropical.toFixed(4)),
      siderealLongitude: parseFloat(sidereal.toFixed(4)),
      rashiIndex: rashi.rashiIndex,
      rashiName: rashi.rashiName,
      degreeInRashi: rashi.degreeInRashi,
      nakshatraIndex: nakshatra.nakshatraIndex,
      nakshatraName: nakshatra.nakshatraName,
      pada: nakshatra.pada,
      degreeInNakshatra: nakshatra.degreeInNakshatra,
      isRetrograde: false, // Sun never retrogrades
      speed: 0.9856, // average degrees/day
    };
  }

  /**
   * Compute Moon's ecliptic longitude.
   * Uses the abridged Brown's theory formulas from Meeus Chapter 47.
   * Accurate to about 10 arcminutes.
   */
  getMoonPosition(julianDay: number): PlanetaryData {
    const T = (julianDay - 2451545.0) / 36525.0;
    const T2 = T * T;
    const T3 = T2 * T;
    const T4 = T3 * T;

    // Moon's mean longitude
    const L = normalizeAngle(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);

    // Moon's mean elongation
    const D = normalizeAngle(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);

    // Sun's mean anomaly
    const M = normalizeAngle(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);

    // Moon's mean anomaly
    const Mprime = normalizeAngle(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);

    // Moon's argument of latitude
    const F = normalizeAngle(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);

    // Further arguments
    const A1 = normalizeAngle(119.75 + 131.849 * T);
    const A2 = normalizeAngle(53.09 + 479264.290 * T);
    const A3 = normalizeAngle(313.45 + 481266.484 * T);

    // Eccentricity correction
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    const E2 = E * E;

    // Convert to radians
    const Drad = toRad(D);
    const Mrad = toRad(M);
    const Mprad = toRad(Mprime);
    const Frad = toRad(F);
    const A1rad = toRad(A1);
    const A2rad = toRad(A2);

    // Longitude summation (major periodic terms from Table 47.A, Meeus)
    let sumL =
      6288774 * Math.sin(Mprad) +
      1274027 * Math.sin(2 * Drad - Mprad) +
      658314 * Math.sin(2 * Drad) +
      213618 * Math.sin(2 * Mprad) +
      -185116 * E * Math.sin(Mrad) +
      -114332 * Math.sin(2 * Frad) +
      58793 * Math.sin(2 * Drad - 2 * Mprad) +
      57066 * E * Math.sin(2 * Drad - Mrad - Mprad) +
      53322 * Math.sin(2 * Drad + Mprad) +
      45758 * E * Math.sin(2 * Drad - Mrad) +
      -40923 * E * Math.sin(Mrad - Mprad) +
      -34720 * Math.sin(Drad) +
      -30383 * E * Math.sin(Mrad + Mprad) +
      15327 * Math.sin(2 * Drad - 2 * Frad) +
      -12528 * Math.sin(Mprad + 2 * Frad) +
      10980 * Math.sin(Mprad - 2 * Frad) +
      10675 * Math.sin(4 * Drad - Mprad) +
      10034 * Math.sin(3 * Mprad) +
      8548 * Math.sin(4 * Drad - 2 * Mprad) +
      -7888 * E * Math.sin(2 * Drad + Mrad - Mprad) +
      -6766 * E * Math.sin(2 * Drad + Mrad) +
      -5163 * Math.sin(Drad - Mprad) +
      4987 * E * Math.sin(Drad + Mrad) +
      4036 * E * Math.sin(2 * Drad - Mrad + Mprad) +
      3994 * Math.sin(2 * Drad + 2 * Mprad) +
      3861 * Math.sin(4 * Drad) +
      3665 * Math.sin(2 * Drad - 3 * Mprad) +
      -2689 * E * Math.sin(Mrad - 2 * Mprad) +
      -2602 * Math.sin(2 * Drad - Mprad + 2 * Frad) +
      2390 * E2 * Math.sin(2 * Drad - 2 * Mrad - Mprad) +
      -2348 * Math.sin(Drad + Mprad);

    // Additive terms for longitude
    sumL += 3958 * Math.sin(A1rad) + 1962 * Math.sin(L * Math.PI / 180 - Frad) + 318 * Math.sin(A2rad);

    const tropical = normalizeAngle(L + sumL / 1000000);
    const sidereal = this.tropicalToSidereal(tropical, julianDay);
    const rashi = this.getRashi(sidereal);
    const nakshatra = this.getNakshatra(sidereal);

    // Approximate daily speed of Moon
    const moonSpeed = 13.176; // degrees per day average

    return {
      planet: 'Moon',
      tropicalLongitude: parseFloat(tropical.toFixed(4)),
      siderealLongitude: parseFloat(sidereal.toFixed(4)),
      rashiIndex: rashi.rashiIndex,
      rashiName: rashi.rashiName,
      degreeInRashi: rashi.degreeInRashi,
      nakshatraIndex: nakshatra.nakshatraIndex,
      nakshatraName: nakshatra.nakshatraName,
      pada: nakshatra.pada,
      degreeInNakshatra: nakshatra.degreeInNakshatra,
      isRetrograde: false, // Moon never retrogrades
      speed: moonSpeed,
    };
  }

  /**
   * Compute approximate position for planets using Keplerian elements.
   * Accurate to ~1-2 degrees for most planets.
   * Source: Meeus, adapted from NASA JPL simplified orbital elements.
   */
  getPlanetPosition(planet: string, julianDay: number): PlanetaryData {
    const el = KEPLERIAN_ELEMENTS[planet];
    if (!el) {
      throw new Error(`Unknown planet: ${planet}`);
    }

    // T = Julian centuries from J2000.0
    const T = (julianDay - 2451545.0) / 36525.0;

    // Current orbital elements
    const a = el.a + el.da * T;
    const e = el.e + el.de * T;
    const L = normalizeAngle(el.L + el.dL * T);
    const lp = normalizeAngle(el.lp + el.dlp * T);

    // Mean anomaly
    const M = normalizeAngle(L - lp);
    const Mrad = toRad(M);

    // Solve Kepler's equation: E - e*sin(E) = M
    // Using iterative method
    let E = Mrad;
    for (let i = 0; i < 10; i++) {
      const dE = (Mrad - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
      E += dE;
      if (Math.abs(dE) < 1e-8) break;
    }

    // True anomaly
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // True longitude in heliocentric ecliptic
    const trueLon = normalizeAngle(toDeg(nu) + lp);

    // Convert heliocentric to geocentric (simplified, ignores ecliptic latitude)
    // For a rough geocentric position, we subtract Earth's heliocentric longitude
    const earthEl = {
      L: normalizeAngle(100.46457166 + 35999.37244981 * T),
      lp: normalizeAngle(102.93768193 + 0.32327364 * T),
      e: 0.01671022 - 0.00004204 * T,
    };
    const earthM = normalizeAngle(earthEl.L - earthEl.lp);
    const earthMrad = toRad(earthM);
    let earthE = earthMrad;
    for (let i = 0; i < 10; i++) {
      const dE = (earthMrad - earthE + earthEl.e * Math.sin(earthE)) / (1 - earthEl.e * Math.cos(earthE));
      earthE += dE;
      if (Math.abs(dE) < 1e-8) break;
    }
    const earthNu = 2 * Math.atan2(
      Math.sqrt(1 + earthEl.e) * Math.sin(earthE / 2),
      Math.sqrt(1 - earthEl.e) * Math.cos(earthE / 2)
    );
    const earthTrueLon = normalizeAngle(toDeg(earthNu) + earthEl.lp);

    // Planet's heliocentric distance
    const rPlanet = a * (1 - e * Math.cos(E));
    const rEarth = 1.000001018 * (1 - earthEl.e * Math.cos(earthE));

    // Geocentric ecliptic longitude (simplified flat ecliptic projection)
    const planetRad = toRad(trueLon);
    const earthRad = toRad(earthTrueLon);

    const dx = rPlanet * Math.cos(planetRad) - rEarth * Math.cos(earthRad);
    const dy = rPlanet * Math.sin(planetRad) - rEarth * Math.sin(earthRad);

    const geocentricLon = normalizeAngle(toDeg(Math.atan2(dy, dx)));

    const tropical = geocentricLon;
    const sidereal = this.tropicalToSidereal(tropical, julianDay);
    const rashi = this.getRashi(sidereal);
    const nakshatra = this.getNakshatra(sidereal);

    // Determine retrograde by computing position 1 day later
    const prevJD = julianDay - 1;
    let speed = 0;
    let isRetrograde = false;

    try {
      const prevT = (prevJD - 2451545.0) / 36525.0;
      const prevL = normalizeAngle(el.L + el.dL * prevT);
      const prevLp = normalizeAngle(el.lp + el.dlp * prevT);
      const prevM = normalizeAngle(prevL - prevLp);
      const prevMrad = toRad(prevM);
      let prevE = prevMrad;
      for (let i = 0; i < 10; i++) {
        const dE = (prevMrad - prevE + el.e * Math.sin(prevE)) / (1 - el.e * Math.cos(prevE));
        prevE += dE;
        if (Math.abs(dE) < 1e-8) break;
      }
      const prevNu = 2 * Math.atan2(
        Math.sqrt(1 + el.e) * Math.sin(prevE / 2),
        Math.sqrt(1 - el.e) * Math.cos(prevE / 2)
      );
      const prevTrueLon = normalizeAngle(toDeg(prevNu) + prevLp);

      const prevEarthL = normalizeAngle(100.46457166 + 35999.37244981 * prevT);
      const prevEarthLp = normalizeAngle(102.93768193 + 0.32327364 * prevT);
      const prevEarthM = normalizeAngle(prevEarthL - prevEarthLp);
      const prevEarthMrad = toRad(prevEarthM);
      let prevEarthE = prevEarthMrad;
      for (let i = 0; i < 10; i++) {
        const dE = (prevEarthMrad - prevEarthE + earthEl.e * Math.sin(prevEarthE)) / (1 - earthEl.e * Math.cos(prevEarthE));
        prevEarthE += dE;
        if (Math.abs(dE) < 1e-8) break;
      }
      const prevEarthNu = 2 * Math.atan2(
        Math.sqrt(1 + earthEl.e) * Math.sin(prevEarthE / 2),
        Math.sqrt(1 - earthEl.e) * Math.cos(prevEarthE / 2)
      );
      const prevEarthTrueLon = normalizeAngle(toDeg(prevEarthNu) + prevEarthLp);

      const prevRPlanet = a * (1 - el.e * Math.cos(prevE));
      const prevREarth = 1.000001018 * (1 - earthEl.e * Math.cos(prevEarthE));

      const prevDx = prevRPlanet * Math.cos(toRad(prevTrueLon)) - prevREarth * Math.cos(toRad(prevEarthTrueLon));
      const prevDy = prevRPlanet * Math.sin(toRad(prevTrueLon)) - prevREarth * Math.sin(toRad(prevEarthTrueLon));
      const prevGeoLon = normalizeAngle(toDeg(Math.atan2(prevDy, prevDx)));

      let deltaLon = tropical - prevGeoLon;
      if (deltaLon > 180) deltaLon -= 360;
      if (deltaLon < -180) deltaLon += 360;
      speed = parseFloat(deltaLon.toFixed(4));
      isRetrograde = speed < 0;
    } catch {
      isRetrograde = false;
      speed = 0;
    }

    return {
      planet,
      tropicalLongitude: parseFloat(tropical.toFixed(4)),
      siderealLongitude: parseFloat(sidereal.toFixed(4)),
      rashiIndex: rashi.rashiIndex,
      rashiName: rashi.rashiName,
      degreeInRashi: rashi.degreeInRashi,
      nakshatraIndex: nakshatra.nakshatraIndex,
      nakshatraName: nakshatra.nakshatraName,
      pada: nakshatra.pada,
      degreeInNakshatra: nakshatra.degreeInNakshatra,
      isRetrograde,
      speed,
    };
  }

  /**
   * Compute Rahu (North Node) and Ketu (South Node).
   * Mean lunar node, always retrograde.
   * Source: Meeus Chapter 47.
   */
  getNodalPositions(julianDay: number): { rahu: PlanetaryData; ketu: PlanetaryData } {
    const T = (julianDay - 2451545.0) / 36525.0;

    // Mean ascending node longitude
    const omega = normalizeAngle(
      125.0445479 - 1934.1362608 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000
    );

    const rahuTropical = normalizeAngle(omega);
    const ketuTropical = normalizeAngle(omega + 180);

    const rahuSidereal = this.tropicalToSidereal(rahuTropical, julianDay);
    const ketuSidereal = this.tropicalToSidereal(ketuTropical, julianDay);

    const rahuRashi = this.getRashi(rahuSidereal);
    const ketuRashi = this.getRashi(ketuSidereal);
    const rahuNak = this.getNakshatra(rahuSidereal);
    const ketuNak = this.getNakshatra(ketuSidereal);

    // Rahu moves approximately -0.053° per day (retrograde)
    const nodeSpeed = -0.053;

    const rahu: PlanetaryData = {
      planet: 'Rahu',
      tropicalLongitude: parseFloat(rahuTropical.toFixed(4)),
      siderealLongitude: parseFloat(rahuSidereal.toFixed(4)),
      rashiIndex: rahuRashi.rashiIndex,
      rashiName: rahuRashi.rashiName,
      degreeInRashi: rahuRashi.degreeInRashi,
      nakshatraIndex: rahuNak.nakshatraIndex,
      nakshatraName: rahuNak.nakshatraName,
      pada: rahuNak.pada,
      degreeInNakshatra: rahuNak.degreeInNakshatra,
      isRetrograde: true,
      speed: nodeSpeed,
    };

    const ketu: PlanetaryData = {
      planet: 'Ketu',
      tropicalLongitude: parseFloat(ketuTropical.toFixed(4)),
      siderealLongitude: parseFloat(ketuSidereal.toFixed(4)),
      rashiIndex: ketuRashi.rashiIndex,
      rashiName: ketuRashi.rashiName,
      degreeInRashi: ketuRashi.degreeInRashi,
      nakshatraIndex: ketuNak.nakshatraIndex,
      nakshatraName: ketuNak.nakshatraName,
      pada: ketuNak.pada,
      degreeInNakshatra: ketuNak.degreeInNakshatra,
      isRetrograde: true,
      speed: -nodeSpeed,
    };

    return { rahu, ketu };
  }

  /**
   * Compute the Ascendant (Lagna) for given Julian Day, latitude, and longitude.
   * Uses RAMC (Right Ascension of Midheaven) method.
   * Source: Meeus Chapter 15.
   */
  getAscendant(julianDay: number, lat: number, lon: number): AscendantData {
    const T = (julianDay - 2451545.0) / 36525.0;

    // Obliquity of the ecliptic (uses T from full JD — correct)
    const epsilon = 23.4392911 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
    const epsilonRad = toRad(epsilon);

    // Greenwich Mean Sidereal Time at 0h UT (degrees)
    // Must use T0 from JD at 0h UT — using full JD double-counts the diurnal rotation
    const JD0 = Math.floor(julianDay - 0.5) + 0.5;
    const T0 = (JD0 - 2451545.0) / 36525.0;
    const theta0 = normalizeAngle(100.4606184 + 36000.77004 * T0 + 0.000387933 * T0 * T0 - T0 * T0 * T0 / 38710000);

    // Local Sidereal Time (degrees)
    const UT = (julianDay - JD0) * 24;
    const LST = normalizeAngle(theta0 + 360.985647 * (UT / 24) + lon);

    // RAMC in radians
    const RAMC = toRad(LST);
    const latRad = toRad(lat);

    // Ascendant formula from Meeus Chapter 14.
    // atan2(-cos θ, sin ε tan φ + cos ε sin θ) yields the DESCENDING ecliptic point;
    // adding 180° gives the ASCENDING point (Lagna). No additional quadrant test needed.
    const y = -Math.cos(RAMC);
    const x = Math.sin(epsilonRad) * Math.tan(latRad) + Math.cos(epsilonRad) * Math.sin(RAMC);

    const ascTropical = normalizeAngle(toDeg(Math.atan2(y, x)) + 180);

    const siderealAsc = this.tropicalToSidereal(ascTropical, julianDay);
    const rashi = this.getRashi(siderealAsc);
    const nakshatra = this.getNakshatra(siderealAsc);

    return {
      tropicalLongitude: parseFloat(ascTropical.toFixed(4)),
      siderealLongitude: parseFloat(siderealAsc.toFixed(4)),
      rashiIndex: rashi.rashiIndex,
      rashiName: rashi.rashiName,
      degreeInRashi: rashi.degreeInRashi,
      nakshatraIndex: nakshatra.nakshatraIndex,
      nakshatraName: nakshatra.nakshatraName,
      pada: nakshatra.pada,
    };
  }

  /**
   * Compute positions of all nine Vedic grahas.
   */
  getAllPlanetPositions(julianDay: number): Record<string, PlanetaryData> {
    const planets: Record<string, PlanetaryData> = {};

    planets['Sun'] = this.getSunPosition(julianDay);
    planets['Moon'] = this.getMoonPosition(julianDay);
    planets['Mercury'] = this.getPlanetPosition('Mercury', julianDay);
    planets['Venus'] = this.getPlanetPosition('Venus', julianDay);
    planets['Mars'] = this.getPlanetPosition('Mars', julianDay);
    planets['Jupiter'] = this.getPlanetPosition('Jupiter', julianDay);
    planets['Saturn'] = this.getPlanetPosition('Saturn', julianDay);

    const nodes = this.getNodalPositions(julianDay);
    planets['Rahu'] = nodes.rahu;
    planets['Ketu'] = nodes.ketu;

    return planets;
  }

  /**
   * Determine which Bhava (house) a planet occupies in the whole-sign house system.
   * In Vedic whole-sign houses, each sign = one house, starting from the Lagna sign.
   */
  getHouseFromLagna(planetRashiIndex: number, lagnaRashiIndex: number): number {
    return ((planetRashiIndex - lagnaRashiIndex + 12) % 12) + 1;
  }
}

export const ephemerisService = new EphemerisService();
