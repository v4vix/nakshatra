/**
 * Daily Cosmic Push Notification Service
 *
 * Generates personalized Vedic astrology notifications based on the current day's
 * nakshatra, tithi, planetary hora, vara (weekday), and other panchanga elements.
 */

// ─── Vedic Constants ─────────────────────────────────────────────────────────

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
] as const;

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
] as const;

const VARA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
const VARA_ENGLISH = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** Hora sequence follows Chaldean order, starting from the planet ruling the day */
const HORA_SEQUENCE = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'] as const;

/** Hora start indices for each weekday (Sun=0) in HORA_SEQUENCE */
const HORA_DAY_START = [3, 6, 2, 5, 1, 4, 0] as const;

const NEW_MOON_EPOCH = new Date('2025-01-29T12:36:00Z').getTime();
const LUNAR_CYCLE_MS = 29.530588853 * 24 * 60 * 60 * 1000;

// ─── Nakshatra Qualities ──────────────────────────────────────────────────────

const NAKSHATRA_QUALITIES: Record<string, { themes: string[]; emoji: string }> = {
  Ashwini:            { themes: ['healing', 'speed', 'new beginnings'], emoji: '🐎' },
  Bharani:            { themes: ['transformation', 'discipline', 'creativity'], emoji: '🔥' },
  Krittika:           { themes: ['purification', 'courage', 'determination'], emoji: '🗡️' },
  Rohini:             { themes: ['creativity', 'romance', 'beauty', 'abundance'], emoji: '🌹' },
  Mrigashira:         { themes: ['seeking', 'curiosity', 'travel'], emoji: '🦌' },
  Ardra:              { themes: ['storms', 'transformation', 'intensity'], emoji: '⛈️' },
  Punarvasu:          { themes: ['renewal', 'return', 'home', 'wisdom'], emoji: '🏹' },
  Pushya:             { themes: ['nourishment', 'prosperity', 'devotion'], emoji: '🌼' },
  Ashlesha:           { themes: ['mysticism', 'kundalini', 'deep insight'], emoji: '🐍' },
  Magha:              { themes: ['royalty', 'ancestors', 'authority'], emoji: '👑' },
  'Purva Phalguni':   { themes: ['pleasure', 'relaxation', 'love', 'arts'], emoji: '🎭' },
  'Uttara Phalguni':  { themes: ['friendship', 'patronage', 'contracts'], emoji: '🤝' },
  Hasta:              { themes: ['skill', 'craftsmanship', 'manifestation'], emoji: '✋' },
  Chitra:             { themes: ['creativity', 'architecture', 'beauty'], emoji: '💎' },
  Swati:              { themes: ['independence', 'movement', 'flexibility'], emoji: '🌬️' },
  Vishakha:           { themes: ['ambition', 'determination', 'goal-setting'], emoji: '🎯' },
  Anuradha:           { themes: ['devotion', 'friendship', 'success'], emoji: '🌟' },
  Jyeshtha:           { themes: ['seniority', 'protection', 'occult'], emoji: '🛡️' },
  Mula:               { themes: ['roots', 'investigation', 'destruction of old'], emoji: '⚡' },
  'Purva Ashadha':    { themes: ['invincibility', 'purification', 'water'], emoji: '🌊' },
  'Uttara Ashadha':   { themes: ['victory', 'leadership', 'universal goals'], emoji: '🏔️' },
  Shravana:           { themes: ['learning', 'listening', 'knowledge'], emoji: '👂' },
  Dhanishtha:         { themes: ['wealth', 'music', 'fame'], emoji: '🥁' },
  Shatabhisha:        { themes: ['healing', 'solitude', 'mysticism'], emoji: '💫' },
  'Purva Bhadrapada': { themes: ['intensity', 'penance', 'occult fire'], emoji: '🔱' },
  'Uttara Bhadrapada':{ themes: ['wisdom', 'depth', 'cosmic sleep'], emoji: '🐉' },
  Revati:             { themes: ['nourishment', 'journeys', 'completion'], emoji: '🐟' },
};

// ─── Planetary Hora Qualities ────────────────────────────────────────────────

const HORA_QUALITIES: Record<string, { good: string[]; avoid: string[] }> = {
  Sun:     { good: ['authority talks', 'government work', 'leadership'], avoid: ['new partnerships'] },
  Moon:    { good: ['travel', 'public interactions', 'creativity'], avoid: ['starting conflicts'] },
  Mars:    { good: ['physical activity', 'competition', 'important meetings'], avoid: ['surgery', 'risky travel'] },
  Mercury: { good: ['communication', 'writing', 'business deals', 'study'], avoid: ['emotional decisions'] },
  Jupiter: { good: ['spiritual practices', 'teaching', 'charity', 'investments'], avoid: ['negative thinking'] },
  Venus:   { good: ['romance', 'arts', 'buying luxuries', 'socializing'], avoid: ['aggression'] },
  Saturn:  { good: ['discipline', 'organization', 'hard work', 'meditation'], avoid: ['starting new ventures'] },
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  birthNakshatra?: string;
  birthRashi?: string;
  moonSign?: string;
  timezone?: number; // UTC offset in hours
}

export interface CosmicNotification {
  title: string;
  body: string;
  data: {
    type: 'daily_forecast' | 'hora_alert' | 'tithi_alert' | 'retrograde_warning' | 'festival_reminder';
    deepLink: string;
    nakshatra?: string;
    tithi?: string;
    vara?: string;
  };
}

export interface DailyForecast {
  nakshatra: string;
  nakshatraLord: string;
  nakshatraEmoji: string;
  tithi: string;
  tithiNumber: number;
  paksha: 'Shukla' | 'Krishna';
  vara: string;
  varaPlanet: string;
  currentHoraPlanet: string;
  nextHoraTime: string;
  nextHoraPlanet: string;
  isAuspiciousTithi: boolean;
  isEkadashi: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
  notifications: CosmicNotification[];
}

// ─── Computation Helpers ─────────────────────────────────────────────────────

/**
 * Get the approximate Moon nakshatra for a given date.
 * Uses a simplified cycle: Moon traverses all 27 nakshatras in ~27.32 days.
 */
function getMoonNakshatra(date: Date): { index: number; name: string; lord: string } {
  const NAKSHATRA_CYCLE_MS = 27.32166 * 24 * 60 * 60 * 1000;
  const refDate = new Date('2025-01-14T00:00:00Z'); // Moon was in Ashwini around this date
  const elapsed = date.getTime() - refDate.getTime();
  const cyclePosition = ((elapsed % NAKSHATRA_CYCLE_MS) + NAKSHATRA_CYCLE_MS) % NAKSHATRA_CYCLE_MS;
  const index = Math.floor((cyclePosition / NAKSHATRA_CYCLE_MS) * 27) % 27;
  return {
    index,
    name: NAKSHATRA_NAMES[index],
    lord: NAKSHATRA_LORDS[index],
  };
}

/**
 * Get the approximate tithi (lunar day) for a given date.
 * Based on the synodic month cycle from a known new moon epoch.
 */
function getTithi(date: Date): { index: number; name: string; paksha: 'Shukla' | 'Krishna' } {
  const elapsed = date.getTime() - NEW_MOON_EPOCH;
  const lunarDay = ((elapsed % LUNAR_CYCLE_MS) + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS;
  const tithiIndex = Math.floor((lunarDay / LUNAR_CYCLE_MS) * 30) % 30;
  return {
    index: tithiIndex,
    name: TITHI_NAMES[tithiIndex],
    paksha: tithiIndex < 15 ? 'Shukla' : 'Krishna',
  };
}

/**
 * Get the planetary hora for a given date/time.
 * Each hora lasts ~1 hour; the first hora of the day is ruled by the day's planet.
 */
function getCurrentHora(date: Date): { planet: string; horaNumber: number; nextPlanet: string; nextHoraTime: Date } {
  const dayOfWeek = date.getDay(); // 0=Sun
  const startOfDay = new Date(date);
  startOfDay.setHours(6, 0, 0, 0); // Vedic day starts at ~6 AM (sunrise approximation)

  let hoursFromSunrise = (date.getTime() - startOfDay.getTime()) / (60 * 60 * 1000);
  if (hoursFromSunrise < 0) hoursFromSunrise += 24;

  const horaNumber = Math.floor(hoursFromSunrise) % 24;
  const startIndex = HORA_DAY_START[dayOfWeek];

  const currentHoraIndex = (startIndex + horaNumber) % 7;
  const nextHoraIndex = (startIndex + horaNumber + 1) % 7;

  const nextHoraTime = new Date(startOfDay);
  nextHoraTime.setHours(startOfDay.getHours() + horaNumber + 1);

  return {
    planet: HORA_SEQUENCE[currentHoraIndex],
    horaNumber,
    nextPlanet: HORA_SEQUENCE[nextHoraIndex],
    nextHoraTime,
  };
}

const AUSPICIOUS_TITHIS = new Set([2, 3, 5, 7, 11, 12, 13, 15]);

// ─── Main Notification Generator ─────────────────────────────────────────────

/**
 * Generate personalized cosmic notification text based on today's panchanga.
 */
export function generateDailyForecast(userProfile?: UserProfile): DailyForecast {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Panchanga elements
  const nakshatra = getMoonNakshatra(now);
  const tithi = getTithi(now);
  const vara = VARA_ENGLISH[dayOfWeek];
  const varaPlanet = VARA_PLANETS[dayOfWeek];
  const hora = getCurrentHora(now);

  const nakshatraQuality = NAKSHATRA_QUALITIES[nakshatra.name] || { themes: ['cosmic energy'], emoji: '✨' };
  const isEkadashi = tithi.name === 'Ekadashi';
  const isPurnima = tithi.name === 'Purnima';
  const isAmavasya = tithi.name === 'Amavasya';
  const isAuspiciousTithi = AUSPICIOUS_TITHIS.has(tithi.index + 1);

  const notifications: CosmicNotification[] = [];

  // ── Primary: Daily nakshatra notification ────────────────────────────────
  const themeStr = nakshatraQuality.themes.slice(0, 2).join(' and ');
  notifications.push({
    title: `${nakshatraQuality.emoji} Moon in ${nakshatra.name} today`,
    body: `Excellent for ${themeStr}. ${nakshatra.lord} energy guides the day — align your intentions.`,
    data: {
      type: 'daily_forecast',
      deepLink: '/dashboard',
      nakshatra: nakshatra.name,
      tithi: tithi.name,
      vara,
    },
  });

  // ── Tithi-specific notifications ─────────────────────────────────────────
  if (isEkadashi) {
    notifications.push({
      title: '✨ Ekadashi today',
      body: `${tithi.paksha} Paksha Ekadashi — auspicious for fasting, meditation, and spiritual practices. Vishnu worship is especially powerful.`,
      data: { type: 'tithi_alert', deepLink: '/dashboard', tithi: tithi.name, vara },
    });
  }

  if (isPurnima) {
    notifications.push({
      title: '🌕 Purnima — Full Moon today',
      body: 'The Moon is at full strength. Excellent for meditation, charity, and manifesting intentions. Emotions run high — channel them wisely.',
      data: { type: 'tithi_alert', deepLink: '/dashboard', tithi: tithi.name, vara },
    });
  }

  if (isAmavasya) {
    notifications.push({
      title: '🌑 Amavasya — New Moon today',
      body: 'A day for introspection and honoring ancestors. Avoid starting new ventures. Rest and reset your spiritual energy.',
      data: { type: 'tithi_alert', deepLink: '/dashboard', tithi: tithi.name, vara },
    });
  }

  // ── Hora alert ───────────────────────────────────────────────────────────
  const horaQuality = HORA_QUALITIES[hora.planet];
  if (horaQuality) {
    const goodActivity = horaQuality.good[0];
    const horaTimeStr = hora.nextHoraTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    notifications.push({
      title: `🕉️ ${hora.planet} Hora active now`,
      body: `Best time for ${goodActivity}. Next hora (${hora.nextPlanet}) begins at ${horaTimeStr}.`,
      data: { type: 'hora_alert', deepLink: '/dashboard', vara },
    });
  }

  // ── Personalized notification (if user has birth nakshatra) ──────────────
  if (userProfile?.birthNakshatra) {
    const birthNakIdx = NAKSHATRA_NAMES.indexOf(userProfile.birthNakshatra as any);
    if (birthNakIdx >= 0) {
      const transitRelation = getTransitRelation(birthNakIdx, nakshatra.index);
      if (transitRelation) {
        notifications.push({
          title: `🌙 Personal Transit Alert`,
          body: transitRelation,
          data: { type: 'daily_forecast', deepLink: '/dashboard', nakshatra: nakshatra.name },
        });
      }
    }
  }

  // ── Vara (weekday) specific tip ──────────────────────────────────────────
  const varaTip = getVaraTip(dayOfWeek);
  if (varaTip) {
    notifications.push({
      title: `${varaTip.emoji} ${vara} Wisdom`,
      body: varaTip.message,
      data: { type: 'daily_forecast', deepLink: '/dashboard', vara },
    });
  }

  return {
    nakshatra: nakshatra.name,
    nakshatraLord: nakshatra.lord,
    nakshatraEmoji: nakshatraQuality.emoji,
    tithi: tithi.name,
    tithiNumber: tithi.index + 1,
    paksha: tithi.paksha,
    vara,
    varaPlanet,
    currentHoraPlanet: hora.planet,
    nextHoraTime: hora.nextHoraTime.toISOString(),
    nextHoraPlanet: hora.nextPlanet,
    isAuspiciousTithi,
    isEkadashi,
    isPurnima,
    isAmavasya,
    notifications,
  };
}

// ─── Transit Relation Helper ─────────────────────────────────────────────────

function getTransitRelation(birthNakIdx: number, transitNakIdx: number): string | null {
  const distance = ((transitNakIdx - birthNakIdx) + 27) % 27;

  // Key transit relationships
  if (distance === 0) {
    return 'Moon transits your birth nakshatra today — a powerful day for self-reflection and setting intentions aligned with your core nature.';
  }
  if (distance === 10 || distance === 19) {
    return 'Moon is in a supportive trine to your birth nakshatra — favorable for important decisions and creative pursuits.';
  }
  if (distance === 14) {
    return 'Moon opposes your birth nakshatra — balance your emotions today. Good for gaining perspective through others.';
  }
  return null;
}

// ─── Weekday Tips ────────────────────────────────────────────────────────────

function getVaraTip(dayOfWeek: number): { emoji: string; message: string } | null {
  const tips: Record<number, { emoji: string; message: string }> = {
    0: { emoji: '☀️', message: 'Sunday is ruled by the Sun — honor your vitality. Visit temples, practice gratitude, and wear red or orange.' },
    1: { emoji: '🌙', message: 'Monday is ruled by the Moon — focus on emotions and intuition. White clothing and water offerings are auspicious.' },
    2: { emoji: '🔥', message: 'Tuesday is ruled by Mars — channel your energy into action. Great for physical challenges and courage.' },
    3: { emoji: '☿️', message: 'Wednesday is ruled by Mercury — ideal for learning, communication, and business. Green is your color today.' },
    4: { emoji: '🪐', message: 'Thursday is ruled by Jupiter — the most auspicious day for spiritual growth. Wear yellow and seek wisdom.' },
    5: { emoji: '♀️', message: 'Friday is ruled by Venus — embrace beauty, art, and love. Excellent for relationships and creative projects.' },
    6: { emoji: '🪐', message: 'Saturday is ruled by Saturn — practice discipline and patience. Honor hard work and serve those in need.' },
  };
  return tips[dayOfWeek] || null;
}

// ─── Export for Testing ──────────────────────────────────────────────────────

export const _internal = {
  getMoonNakshatra,
  getTithi,
  getCurrentHora,
  getTransitRelation,
  getVaraTip,
};
