// ============================================================
// NAKSHATRA APP - Core Type Definitions
// ============================================================

// ----- Vedic Astrology Core Types -----

export type GanaType = 'Deva' | 'Manushya' | 'Rakshasa';
export type NadiType = 'Aadi' | 'Madhya' | 'Antya';
export type ElementType = 'Fire' | 'Earth' | 'Air' | 'Water' | 'Ether';
export type QualityType = 'Cardinal' | 'Fixed' | 'Mutable';
export type NatureType = 'Benefic' | 'Malefic' | 'Neutral';
export type DignityType = 'Exalted' | 'Own' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated';
export type Direction = 'North' | 'NE' | 'East' | 'SE' | 'South' | 'SW' | 'West' | 'NW' | 'Center';

export interface Nakshatra {
  id: number;                   // 1-27
  name: string;                 // English name
  sanskritName: string;         // Devanagari script
  symbol: string;               // e.g. "Horse Head"
  rulingPlanet: string;         // Graha name
  deity: string;                // ruling deity
  startDegree: number;          // sidereal longitude start (0-360)
  endDegree: number;            // sidereal longitude end (0-360)
  rashiId: number;              // 1-12, primary rashi
  gana: GanaType;
  nadi: NadiType;
  element: ElementType;
  quality: string[];            // personality traits
  gemstone: string;
  color: string;
  dashaYears: number;           // Vimshottari dasha years of ruling planet
  bodyPart: string;
  animal: string;               // yoni animal
}

export interface Rashi {
  id: number;                   // 1-12
  name: string;                 // Vedic name e.g. "Mesha"
  westernName: string;          // Western name e.g. "Aries"
  symbol: string;               // Unicode symbol
  rulingPlanet: string;
  element: ElementType;
  quality: QualityType;
  startDegree: number;          // 0-330 in 30-degree steps
  endDegree: number;
  personalityTraits: string[];
  bodyParts: string[];
  favorableActivities: string[];
  unfavorableActivities: string[];
  compatibleRashis: number[];   // rashiIds
  vedicDescription: string;
}

export interface Graha {
  id: number;                   // 1-9
  name: string;                 // English
  sanskritName: string;         // e.g. "Surya"
  symbol: string;               // Unicode symbol
  mahadashaYears: number;       // Vimshottari years
  exaltationSign: number | null;   // rashiId
  debilitationSign: number | null; // rashiId
  ownSigns: number[];           // rashiIds
  mooltrikonSign: number | null;
  nature: NatureType;
  friendlyPlanets: string[];
  neutralPlanets: string[];
  enemyPlanets: string[];
  color: string;
  gemstone: string;
  day: string;
  direction: Direction;
  metal: string;
  deity: string;
  karakatwa: string[];          // significations/rulerships
  bodyParts: string[];
  diseases: string[];
  professions: string[];
}

export interface PlanetaryPosition {
  grahaId: number;
  rashiId: number;
  houseNumber: number;          // 1-12
  degree: number;               // degree within sign (0-29.99)
  totalDegree: number;          // absolute sidereal longitude (0-359.99)
  nakshatraId: number;          // 1-27
  pada: number;                 // 1-4
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: DignityType;
}

export interface HouseCusp {
  houseNumber: number;
  rashiId: number;
  degree: number;
  nakshatraId: number;
}

export interface DashaPeriod {
  lordName: string;
  grahaId: number;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  antardasha?: DashaPeriod[];
  pratyantardasha?: DashaPeriod[];
}

export interface DashaSequence {
  currentMahadasha: DashaPeriod;
  currentAntardasha?: DashaPeriod;
  currentPratyantardasha?: DashaPeriod;
  upcomingPeriods: DashaPeriod[];
  allMahadashas: DashaPeriod[];
}

export interface DetectedYoga {
  name: string;
  type: 'Raj' | 'Dhana' | 'Nabhasa' | 'Dosha' | 'Miscellaneous';
  description: string;
  strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  affectedHouses: number[];
  involvedPlanets: string[];
  effects: string;
}

export interface DetectedDosha {
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  description: string;
  remedies: string[];
  affectedAreas: string[];
}

export interface Kundli {
  id: string;
  userId: string;
  name: string;
  birthDate: Date;
  birthTime: string;            // "HH:MM"
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa: 'Lahiri' | 'Raman' | 'KP' | 'Fagan-Bradley';
  ascendantDegree: number;
  ascendantRashiId: number;
  ascendantNakshatraId: number;
  positions: PlanetaryPosition[];
  houseCusps: HouseCusp[];
  dashaSequence: DashaSequence;
  yogas: DetectedYoga[];
  doshas: DetectedDosha[];
  createdAt: Date;
  notes?: string;
}

// ----- Tarot Types -----

export type ArcanaType = 'Major' | 'Minor';
export type SuitType = 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | null;
export type CourtType = 'Page' | 'Knight' | 'Queen' | 'King' | null;
export type SpreadType = 'Single' | 'Three Card' | 'Celtic Cross' | 'Horseshoe' | 'Past Present Future' | 'Yes No';

export interface TarotMeanings {
  general: string;
  love: string;
  career: string;
  spiritual: string;
  keywords: string[];
}

export interface TarotCard {
  id: number;                   // 0-77
  name: string;
  arcana: ArcanaType;
  suit: SuitType;
  number: number | null;        // 0-10 for Major (0=Fool, 10=Wheel), 1-14 for Minor
  court: CourtType;
  element: ElementType | null;
  astrologicalAssociation: string;
  upright: TarotMeanings;
  reversed: TarotMeanings;
  imageryDescription: string;
  numerologicalValue: number;
}

export interface DrawnCard {
  card: TarotCard;
  position: string;             // e.g. "Past", "Present", "Future"
  isReversed: boolean;
  interpretation?: string;      // LLM-generated
}

export interface TarotReading {
  id: string;
  userId: string;
  spreadType: SpreadType;
  question: string;
  cards: DrawnCard[];
  overallInterpretation?: string;
  createdAt: Date;
  xpEarned: number;
}

// ----- Numerology Types -----

export interface NumerologyProfile {
  // Core numbers
  lifePath: number;
  expression: number;           // Destiny number
  soulUrge: number;             // Heart's Desire
  personality: number;
  birthdayNumber: number;
  maturityNumber: number;

  // Cycle numbers
  personalYear: number;
  personalMonth: number;
  personalDay: number;

  // Pinnacles (4 life stages)
  pinnacles: [number, number, number, number];
  pinnacleAges: [number, number, number];

  // Challenges
  challenges: [number, number, number, number];

  // Bridge numbers
  lifePathExpressionBridge: number;
  soulUrgePersonalityBridge: number;

  // Missing numbers (karmic lessons)
  missingNumbers: number[];

  // Karmic debt numbers present
  karmicDebtNumbers: number[];

  // System used
  system: 'Pythagorean' | 'Chaldean';

  // Input data
  fullName: string;
  birthDate: Date;
}

export interface NumerologyMeaning {
  number: number;
  title: string;
  positiveTraits: string[];
  negativeTraits: string[];
  lifePurpose: string;
  idealCareers: string[];
  relationships: string;
  challenges: string;
  famousExamples: string[];
  color: string;
  planet: string;
  tarotCard: string;
}

// ----- Vastu Types -----

export interface VastuZone {
  direction: Direction;
  deity: string;
  element: ElementType;
  planet: string;               // Graha name
  idealRooms: string[];
  defectsToAvoid: string[];
  remedies: string[];
  colors: string[];
  materials: string[];
  activities: string[];
  bodyPart: string;
  effects: {
    positive: string[];
    negative: string[];
  };
}

export interface VastuDefect {
  zone: Direction;
  defect: string;
  severity: 'Minor' | 'Moderate' | 'Major';
  remedy: string;
}

export interface VastuAnalysis {
  id: string;
  userId: string;
  propertyType: 'Home' | 'Office' | 'Plot';
  address: string;
  facingDirection: Direction;
  zones: VastuZone[];
  defectsFound: VastuDefect[];
  score: number;                // 0-100
  recommendations: string[];
  createdAt: Date;
}

// ----- User & Gamification Types -----

export type CosmicRank =
  | 'Stardust Seeker'
  | 'Cosmic Apprentice'
  | 'Nakshatra Wanderer'
  | 'Rashi Explorer'
  | 'Graha Devotee'
  | 'Dasha Navigator'
  | 'Yoga Practitioner'
  | 'Jyotish Scholar'
  | 'Cosmic Sage'
  | 'Jyotisha Guru';

export type XPAction =
  | 'KUNDLI_CREATED'
  | 'KUNDLI_SHARED'
  | 'TAROT_READING'
  | 'TAROT_DAILY_PULL'
  | 'NUMEROLOGY_CALCULATED'
  | 'VASTU_ANALYZED'
  | 'SHLOKA_READ'
  | 'SHLOKA_QUIZ_CORRECT'
  | 'DAILY_CHALLENGE_COMPLETE'
  | 'STREAK_MAINTAINED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'FIRST_LOGIN'
  | 'PROFILE_COMPLETED'
  | 'FRIEND_REFERRED';

export interface XPTransaction {
  id: string;
  userId: string;
  action: XPAction;
  xpAmount: number;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type AchievementCategory =
  | 'Kundli'
  | 'Tarot'
  | 'Numerology'
  | 'Vastu'
  | 'Streak'
  | 'Scripture'
  | 'Exploration'
  | 'Mastery';

export type AchievementRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  icon: string;                 // icon name or emoji
  condition: string;            // human-readable condition
  secretUntilUnlocked: boolean;
  prerequisiteIds?: string[];   // achievements required first
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt: Date;
  progress?: number;            // for partial achievements (0-100)
  isNew: boolean;
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  totalActiveDays: number;
  weeklyActivity: boolean[];    // last 7 days
  monthlyActivity: boolean[];   // last 30 days
}

export interface DailyChallenge {
  id: string;
  date: Date;
  type: 'Nakshatra Quiz' | 'Tarot Reflection' | 'Shloka Study' | 'Numerology Puzzle' | 'Vastu Tip';
  title: string;
  description: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  xpReward: number;
  timeLimit?: number;           // seconds
  hint?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  birthDate?: Date;
  birthTime?: string;
  birthPlace?: string;
  timezone?: string;

  // Gamification
  totalXP: number;
  level: number;
  cosmicRank: CosmicRank;
  xpToNextLevel: number;

  // Activity
  streak: StreakData;
  achievements: UserAchievement[];
  xpHistory: XPTransaction[];

  // Content
  kundlis: string[];            // Kundli IDs
  tarotReadings: string[];      // TarotReading IDs
  numerologyProfiles: string[]; // NumerologyProfile IDs
  vastuAnalyses: string[];      // VastuAnalysis IDs

  // Preferences
  preferredAyanamsa: 'Lahiri' | 'Raman' | 'KP';
  preferredNumerologySystem: 'Pythagorean' | 'Chaldean';
  notificationsEnabled: boolean;
  dailyChallengeReminder: boolean;
  theme: 'light' | 'dark' | 'cosmic';

  createdAt: Date;
  lastActiveAt: Date;
}

// ----- Scripture Types -----

export type ScriptureType =
  | 'Bhagavad Gita'
  | 'Upanishad'
  | 'Vedas'
  | 'Yoga Sutras'
  | 'Brahma Sutras'
  | 'Ramayana'
  | 'Mahabharata'
  | 'Puranas';

export interface Shloka {
  id: string;
  scriptureType: ScriptureType;
  scripture: string;            // specific scripture name e.g. "Mandukya Upanishad"
  chapter: number | string;
  verse: string;                // can be "2:47" format
  sanskritText: string;
  transliteration: string;
  translation: string;
  meaning: string;              // deeper spiritual meaning
  keywords: string[];
  relatedTopics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// ----- LLM Types -----

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'gemini';

export type LLMContextType =
  | 'kundli_interpretation'
  | 'nakshatra_reading'
  | 'tarot_reading'
  | 'numerology_reading'
  | 'vastu_analysis'
  | 'dasha_prediction'
  | 'yoga_explanation'
  | 'dosha_remedy'
  | 'shloka_explanation'
  | 'general_astrology';

export interface LLMRequest {
  contextType: LLMContextType;
  userQuestion?: string;
  data: Record<string, unknown>;
  language?: 'en' | 'hi' | 'sa';
  detailLevel?: 'brief' | 'standard' | 'detailed';
  userId?: string;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model: string;
  tokensUsed?: number;
  cached: boolean;
  generatedAt: Date;
}

// ----- Level & Rank Utilities -----

export const RANK_THRESHOLDS: Record<CosmicRank, number> = {
  'Stardust Seeker': 0,
  'Cosmic Apprentice': 500,
  'Nakshatra Wanderer': 1500,
  'Rashi Explorer': 3500,
  'Graha Devotee': 7000,
  'Dasha Navigator': 12000,
  'Yoga Practitioner': 20000,
  'Jyotish Scholar': 35000,
  'Cosmic Sage': 60000,
  'Jyotisha Guru': 100000,
};

export const XP_PER_LEVEL = 1000;

export function getLevelFromXP(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function getRankFromXP(totalXP: number): CosmicRank {
  const ranks = Object.entries(RANK_THRESHOLDS) as [CosmicRank, number][];
  let currentRank: CosmicRank = 'Stardust Seeker';
  for (const [rank, threshold] of ranks) {
    if (totalXP >= threshold) {
      currentRank = rank;
    }
  }
  return currentRank;
}

export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  return currentLevel * XP_PER_LEVEL - totalXP;
}
