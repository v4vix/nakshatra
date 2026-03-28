// ============================================================
// Shared Vedic Astrology Constants
// Centralised source of truth for Nakshatra, Rashi, Planet,
// Tithi, Vara, Yoga, Karana, and related lookup data.
// ============================================================

// ─── Nakshatra Names (27) ─────────────────────────────────────────────────────

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;

export type NakshatraName = (typeof NAKSHATRA_NAMES)[number];

export const NAKSHATRAS_DEVANAGARI = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्व आषाढ़', 'उत्तर आषाढ़', 'श्रवण', 'धनिष्ठा',
  'शतभिषा', 'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती',
] as const;

// ─── Nakshatra Lords (Vimshottari cycle, repeating 9-planet pattern) ──────────

export const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
] as const;

// ─── Auspicious Nakshatras ────────────────────────────────────────────────────

export const AUSPICIOUS_NAKSHATRAS = new Set<NakshatraName>([
  'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
  'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttara Phalguni',
  'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati', 'Shravana',
]);

// ─── Nakshatra Classification Arrays (indexed 0-26) ──────────────────────────

/** 0=Deva, 1=Manushya, 2=Rakshasa */
export const NAKSHATRA_GANA = [
  0, 2, 0, 0, 1, 2, 0, 0, 2, 2, 2, 0, 0, 2, 0, 2, 0, 2,
  2, 1, 0, 0, 2, 2, 1, 0, 0,
] as const;

/** 0=Aadi, 1=Madhya, 2=Antya */
export const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0,
  0, 1, 2, 2, 1, 0, 0, 1, 2,
] as const;

/** Yoni animal index (0=Horse, 1=Elephant, 2=Sheep, 3=Snake, 4=Dog, 5=Cat,
 *  6=Rat, 7=Cow, 8=Buffalo, 9=Tiger, 10=Deer, 11=Monkey, 12=Lion, 13=Mongoose) */
export const NAKSHATRA_YONI = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 9, 3, 10, 4, 12,
  4, 3, 8, 7, 2, 0, 2, 5, 13,
] as const;

/** 0=Shudra, 1=Vaishya, 2=Kshatriya, 3=Brahmin */
export const NAKSHATRA_VARNA = [
  3, 3, 2, 0, 0, 2, 3, 3, 0, 2, 3, 2, 3, 0, 0, 0, 2, 3,
  3, 2, 3, 1, 0, 3, 2, 0, 1,
] as const;

// ─── Rashi (12 Signs) ─────────────────────────────────────────────────────────

export interface RashiEntry {
  id: number;
  name: string;
  western: string;
  symbol: string;
  ruler: string;
  element: string;
}

export const RASHI_DATA: RashiEntry[] = [
  { id: 1, name: 'Mesha', western: 'Aries', symbol: '\u2648', ruler: 'Mars', element: 'Fire' },
  { id: 2, name: 'Vrishabha', western: 'Taurus', symbol: '\u2649', ruler: 'Venus', element: 'Earth' },
  { id: 3, name: 'Mithuna', western: 'Gemini', symbol: '\u264A', ruler: 'Mercury', element: 'Air' },
  { id: 4, name: 'Karka', western: 'Cancer', symbol: '\u264B', ruler: 'Moon', element: 'Water' },
  { id: 5, name: 'Simha', western: 'Leo', symbol: '\u264C', ruler: 'Sun', element: 'Fire' },
  { id: 6, name: 'Kanya', western: 'Virgo', symbol: '\u264D', ruler: 'Mercury', element: 'Earth' },
  { id: 7, name: 'Tula', western: 'Libra', symbol: '\u264E', ruler: 'Venus', element: 'Air' },
  { id: 8, name: 'Vrischika', western: 'Scorpio', symbol: '\u264F', ruler: 'Mars', element: 'Water' },
  { id: 9, name: 'Dhanu', western: 'Sagittarius', symbol: '\u2650', ruler: 'Jupiter', element: 'Fire' },
  { id: 10, name: 'Makara', western: 'Capricorn', symbol: '\u2651', ruler: 'Saturn', element: 'Earth' },
  { id: 11, name: 'Kumbha', western: 'Aquarius', symbol: '\u2652', ruler: 'Saturn', element: 'Air' },
  { id: 12, name: 'Meena', western: 'Pisces', symbol: '\u2653', ruler: 'Jupiter', element: 'Water' },
];

/** Convenience arrays derived from RASHI_DATA */
export const RASHI_NAMES = RASHI_DATA.map((r) => r.name);
export const RASHI_SYMBOLS = RASHI_DATA.map((r) => r.symbol);
export const RASHI_LORDS = RASHI_DATA.map((r) => r.ruler);

// ─── Planet / Graha Helpers ───────────────────────────────────────────────────

/** The seven visible planets used in compatibility / cosmic match */
export const PLANETS_7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

/** Full Navagraha order (nine planets including shadow planets) */
export const NAVAGRAHA_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;

export type PlanetName = (typeof NAVAGRAHA_ORDER)[number];

export const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFB347', Moon: '#C0C0FF', Mars: '#FF6B6B', Mercury: '#7DF9FF',
  Jupiter: '#FFD700', Venus: '#FFB6C1', Saturn: '#9B87F5',
  Rahu: '#888', Ketu: '#A0522D',
};

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

/** Planet friendship table: +1 friend, 0 neutral, -1 enemy */
export const PLANET_FRIENDSHIP: Record<string, Record<string, number>> = {
  Sun:     { Sun: 0,  Moon: 1,  Mars: 1,  Mercury: -1, Jupiter: 1,  Venus: -1, Saturn: -1 },
  Moon:    { Sun: 1,  Moon: 0,  Mars: -1, Mercury: 1,  Jupiter: 1,  Venus: 1,  Saturn: -1 },
  Mars:    { Sun: 1,  Moon: 1,  Mars: 0,  Mercury: -1, Jupiter: 1,  Venus: -1, Saturn: -1 },
  Mercury: { Sun: 1,  Moon: -1, Mars: -1, Mercury: 0,  Jupiter: -1, Venus: 1,  Saturn: 1  },
  Jupiter: { Sun: 1,  Moon: 1,  Mars: 1,  Mercury: -1, Jupiter: 0,  Venus: -1, Saturn: -1 },
  Venus:   { Sun: -1, Moon: -1, Mars: -1, Mercury: 1,  Jupiter: -1, Venus: 0,  Saturn: 1  },
  Saturn:  { Sun: -1, Moon: -1, Mars: -1, Mercury: 1,  Jupiter: -1, Venus: 1,  Saturn: 0  },
};

// ─── Dasha ────────────────────────────────────────────────────────────────────

export const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'] as const;
export const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// ─── Vara (Weekday) ───────────────────────────────────────────────────────────

export const VARA_NAMES = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'] as const;
export const VARA_DEVANAGARI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'] as const;
export const VARA_ENGLISH = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const VARA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export const VARA_PLANET_ICONS = ['☀️', '🌙', '🔴', '☿', '🪐', '♀', '🪐'] as const;
export const VARA_PLANET_COLORS = [
  'text-amber-400', 'text-slate-300', 'text-red-400',
  'text-green-400', 'text-yellow-400', 'text-pink-400', 'text-blue-400',
] as const;
export const VARA_PLANET_BG = [
  'bg-amber-500/10 border-amber-500/25',
  'bg-slate-500/10 border-slate-400/20',
  'bg-red-500/10 border-red-500/25',
  'bg-green-500/10 border-green-500/20',
  'bg-yellow-500/10 border-yellow-500/25',
  'bg-pink-500/10 border-pink-500/20',
  'bg-blue-500/10 border-blue-500/20',
] as const;

// ─── Tithi ────────────────────────────────────────────────────────────────────

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
] as const;

export const TITHI_DEVANAGARI = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या',
] as const;

export const AUSPICIOUS_TITHIS = new Set([2, 3, 5, 7, 11, 12, 13, 15]);

// ─── Yoga (27 daily yogas) ────────────────────────────────────────────────────

export const YOGAS_27 = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarman', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
] as const;

export const YOGAS_DEVANAGARI = [
  'विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन',
  'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड',
  'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र',
  'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव',
  'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म',
  'इन्द्र', 'वैधृति',
] as const;

export const AUSPICIOUS_YOGAS = new Set([
  'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Sukarman',
  'Dhriti', 'Vriddhi', 'Dhruva', 'Harshana', 'Siddhi',
  'Variyan', 'Shiva', 'Siddha', 'Sadhya', 'Shubha',
  'Shukla', 'Brahma', 'Indra',
]);

// ─── Karana ───────────────────────────────────────────────────────────────────

export const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'] as const;
export const KARANAS_DEVANAGARI = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गरजा', 'वणिज', 'विष्टि', 'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'] as const;

// ─── Rahu Kalam / Gulika / Yamaganda Periods ──────────────────────────────────

/** Rahu Kalam period index per weekday (Sun=0). 1-indexed slot from 6 AM. */
export const RAHU_KALAM_PERIODS = [1, 8, 7, 5, 6, 4, 3] as const;
export const GULIKA_KALAM_PERIODS = [7, 6, 5, 4, 3, 2, 1] as const;
export const YAMAGANDA_PERIODS = [4, 3, 2, 1, 8, 7, 6] as const;

// ─── Lunar Epoch ──────────────────────────────────────────────────────────────

export const NEW_MOON_EPOCH = new Date('2025-01-29T12:36:00Z').getTime();
export const LUNAR_CYCLE_MS = 29.530588853 * 24 * 60 * 60 * 1000;
