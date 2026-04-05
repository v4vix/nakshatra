// Vimshottari Dasha Calculator
// Classical system from Parashari Jyotish
// Total cycle: 120 years

export interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface AntarDashaPeriod {
  mahadashaPlanet: string;
  antardashaPlant: string;
  startDate: Date;
  endDate: Date;
}

export interface PratyantarDashaPeriod {
  mahadashaPlanet: string;
  antardashaPlant: string;
  pratyantarPlant: string;
  startDate: Date;
  endDate: Date;
}

export interface CurrentDashaInfo {
  mahadasha: DashaPeriod;
  antardasha: AntarDashaPeriod;
  pratyantardasha: PratyantarDashaPeriod;
  yearsElapsedInMaha: number;
  percentElapsedInMaha: number;
  remainingYearsInAntara: number;
}

export interface CompleteDashaSequence {
  allMahadashas: DashaPeriod[];
  currentDasha: CurrentDashaInfo | null;
  birthNakshatraLord: string;
  nakshatraCompletionFraction: number;
}

// Vimshottari Dasha years for each planet
export const DASHA_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

// Total Vimshottari cycle = 120 years
const TOTAL_VIMSHOTTARI_YEARS = 120;

// Nakshatra lords in sequence (27 nakshatras, repeating the 9-planet cycle 3 times)
export const NAKSHATRA_LORDS: string[] = [
  'Ketu',    // 0  Ashwini
  'Venus',   // 1  Bharani
  'Sun',     // 2  Krittika
  'Moon',    // 3  Rohini
  'Mars',    // 4  Mrigashira
  'Rahu',    // 5  Ardra
  'Jupiter', // 6  Punarvasu
  'Saturn',  // 7  Pushya
  'Mercury', // 8  Ashlesha
  'Ketu',    // 9  Magha
  'Venus',   // 10 Purva Phalguni
  'Sun',     // 11 Uttara Phalguni
  'Moon',    // 12 Hasta
  'Mars',    // 13 Chitra
  'Rahu',    // 14 Swati
  'Jupiter', // 15 Vishakha
  'Saturn',  // 16 Anuradha
  'Mercury', // 17 Jyeshtha
  'Ketu',    // 18 Mula
  'Venus',   // 19 Purva Ashadha
  'Sun',     // 20 Uttara Ashadha
  'Moon',    // 21 Shravana
  'Mars',    // 22 Dhanishtha
  'Rahu',    // 23 Shatabhisha
  'Jupiter', // 24 Purva Bhadrapada
  'Saturn',  // 25 Uttara Bhadrapada
  'Mercury', // 26 Revati
];

// Ordered dasha sequence starting from Ketu
const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

/**
 * Add fractional years to a Date.
 * Handles leap years by using millisecond arithmetic.
 */
function addYears(date: Date, years: number): Date {
  const ms = years * 365.25 * 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + ms);
}

/**
 * Compute the difference in fractional years between two dates.
 */
function yearsBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export class DashaService {
  /**
   * Calculate the starting dasha planet and the fraction already elapsed
   * at birth, based on Moon's nakshatra and degree within it.
   *
   * @param nakshatraIndex - 0-26, Moon's birth nakshatra
   * @param degreeInNakshatra - degrees Moon has traversed within the nakshatra (0 to 13.333)
   * @returns { startPlanet, elapsedFraction } where elapsedFraction is 0-1
   */
  private getBirthDashaStartInfo(nakshatraIndex: number, degreeInNakshatra: number): {
    startPlanet: string;
    elapsedFraction: number;
  } {
    const nakshatraSpan = 360 / 27; // 13.333... degrees per nakshatra
    const startPlanet = NAKSHATRA_LORDS[nakshatraIndex];
    const elapsedFraction = degreeInNakshatra / nakshatraSpan;

    return { startPlanet, elapsedFraction };
  }

  /**
   * Compute the full 120-year Vimshottari Dasha sequence from birth date.
   *
   * @param birthDate - Date of birth
   * @param moonNakshatraIndex - 0-26
   * @param moonDegreeInNakshatra - degrees within nakshatra (0 to ~13.333)
   */
  computeFullSequence(
    birthDate: Date,
    moonNakshatraIndex: number,
    moonDegreeInNakshatra: number
  ): CompleteDashaSequence {
    const { startPlanet, elapsedFraction } = this.getBirthDashaStartInfo(moonNakshatraIndex, moonDegreeInNakshatra);

    const startPlanetIndex = DASHA_ORDER.indexOf(startPlanet);
    const startPlanetTotalYears = DASHA_YEARS[startPlanet];

    // Years already elapsed in the starting dasha at birth
    const elapsedYearsInFirstDasha = elapsedFraction * startPlanetTotalYears;
    const remainingYearsInFirstDasha = startPlanetTotalYears - elapsedYearsInFirstDasha;

    const mahadashas: DashaPeriod[] = [];
    let currentDate = birthDate;

    // First dasha: anchor at the THEORETICAL start (before birth) so that
    // Antardasha sub-periods are placed correctly relative to birth.
    // The birth falls mid-dasha; using birthDate as startDate would misplace all Antardashas.
    const firstTheoreticalStart = addYears(birthDate, -elapsedYearsInFirstDasha);
    const firstEndDate = addYears(birthDate, remainingYearsInFirstDasha);
    mahadashas.push({
      planet: startPlanet,
      startDate: firstTheoreticalStart,
      endDate: firstEndDate,
      durationYears: startPlanetTotalYears,
    });
    currentDate = firstEndDate;

    // Subsequent full dashas (complete the 120-year cycle)
    let totalYearsAccounted = remainingYearsInFirstDasha;
    let planetIdx = (startPlanetIndex + 1) % 9;

    while (totalYearsAccounted < TOTAL_VIMSHOTTARI_YEARS) {
      const planet = DASHA_ORDER[planetIdx];
      const years = DASHA_YEARS[planet];
      const endDate = addYears(currentDate, years);

      mahadashas.push({
        planet,
        startDate: new Date(currentDate),
        endDate,
        durationYears: years,
      });

      currentDate = endDate;
      totalYearsAccounted += years;
      planetIdx = (planetIdx + 1) % 9;
    }

    const now = new Date();
    const currentDasha = this.getCurrentDashaInfo(mahadashas, now);

    return {
      allMahadashas: mahadashas,
      currentDasha,
      birthNakshatraLord: startPlanet,
      nakshatraCompletionFraction: parseFloat((1 - elapsedFraction).toFixed(4)),
    };
  }

  /**
   * Find and compute current Mahadasha, Antardasha, and Pratyantardasha.
   */
  getCurrentDashaInfo(mahadashas: DashaPeriod[], referenceDate: Date): CurrentDashaInfo | null {
    const currentMaha = mahadashas.find(
      d => referenceDate >= d.startDate && referenceDate < d.endDate
    );

    if (!currentMaha) return null;

    // Compute Antardashas within current Mahadasha
    const antardashas = this.computeAntardashas(currentMaha);

    const currentAntar = antardashas.find(
      a => referenceDate >= a.startDate && referenceDate < a.endDate
    );

    if (!currentAntar) return null;

    // Compute Pratyantardashas within current Antardasha
    const pratyantardashas = this.computePratyantardashas(currentAntar, currentMaha.durationYears);

    const currentPratyar = pratyantardashas.find(
      p => referenceDate >= p.startDate && referenceDate < p.endDate
    ) || pratyantardashas[0];

    const yearsElapsedInMaha = yearsBetween(currentMaha.startDate, referenceDate);
    const percentElapsedInMaha = parseFloat(
      ((yearsElapsedInMaha / currentMaha.durationYears) * 100).toFixed(1)
    );

    const remainingYearsInAntara = parseFloat(
      yearsBetween(referenceDate, currentAntar.endDate).toFixed(2)
    );

    return {
      mahadasha: currentMaha,
      antardasha: currentAntar,
      pratyantardasha: currentPratyar,
      yearsElapsedInMaha: parseFloat(yearsElapsedInMaha.toFixed(2)),
      percentElapsedInMaha,
      remainingYearsInAntara,
    };
  }

  /**
   * Compute 9 Antardashas (sub-periods) within a Mahadasha.
   * Antardasha duration = (Maha planet years × Antar planet years) / 120 years
   */
  computeAntardashas(mahadasha: DashaPeriod): AntarDashaPeriod[] {
    const mahaIdx = DASHA_ORDER.indexOf(mahadasha.planet);
    const antardashas: AntarDashaPeriod[] = [];
    let currentDate = new Date(mahadasha.startDate);

    for (let i = 0; i < 9; i++) {
      const antarPlanet = DASHA_ORDER[(mahaIdx + i) % 9];
      const antarYears = (mahadasha.durationYears * DASHA_YEARS[antarPlanet]) / TOTAL_VIMSHOTTARI_YEARS;
      const endDate = addYears(currentDate, antarYears);

      antardashas.push({
        mahadashaPlanet: mahadasha.planet,
        antardashaPlant: antarPlanet,
        startDate: new Date(currentDate),
        endDate,
      });

      currentDate = endDate;
    }

    return antardashas;
  }

  /**
   * Compute Pratyantardashas within an Antardasha.
   * Pratyar duration = (Antar years × Pratyar planet years) / 120
   * where Antar years = (Maha years × Antar planet years) / 120
   */
  computePratyantardashas(antardasha: AntarDashaPeriod, mahaDurationYears: number): PratyantarDashaPeriod[] {
    const antarIdx = DASHA_ORDER.indexOf(antardasha.antardashaPlant);
    const antarTotalYears = (mahaDurationYears * DASHA_YEARS[antardasha.antardashaPlant]) / TOTAL_VIMSHOTTARI_YEARS;
    const pratyantardashas: PratyantarDashaPeriod[] = [];
    let currentDate = new Date(antardasha.startDate);

    for (let i = 0; i < 9; i++) {
      const pratyarPlanet = DASHA_ORDER[(antarIdx + i) % 9];
      const pratyarYears = (antarTotalYears * DASHA_YEARS[pratyarPlanet]) / TOTAL_VIMSHOTTARI_YEARS;
      const endDate = addYears(currentDate, pratyarYears);

      pratyantardashas.push({
        mahadashaPlanet: antardasha.mahadashaPlanet,
        antardashaPlant: antardasha.antardashaPlant,
        pratyantarPlant: pratyarPlanet,
        startDate: new Date(currentDate),
        endDate,
      });

      currentDate = endDate;
    }

    return pratyantardashas;
  }

  /**
   * Format dasha period as a human-readable string.
   */
  formatDashaString(dasha: CurrentDashaInfo): string {
    const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    return [
      `Mahadasha: ${dasha.mahadasha.planet} (${formatDate(dasha.mahadasha.startDate)} – ${formatDate(dasha.mahadasha.endDate)}) [${dasha.percentElapsedInMaha}% elapsed]`,
      `Antardasha: ${dasha.antardasha.mahadashaPlanet}/${dasha.antardasha.antardashaPlant} (until ${formatDate(dasha.antardasha.endDate)}) [${dasha.remainingYearsInAntara.toFixed(1)} years remaining]`,
      `Pratyantardasha: ${dasha.pratyantardasha.mahadashaPlanet}/${dasha.pratyantardasha.antardashaPlant}/${dasha.pratyantardasha.pratyantarPlant} (until ${formatDate(dasha.pratyantardasha.endDate)})`,
    ].join('\n');
  }
}

export const dashaService = new DashaService();
