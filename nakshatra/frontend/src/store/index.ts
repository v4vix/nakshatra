import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { generateId } from '../utils/generateId'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CosmicRank =
  | 'Stardust Seeker'
  | 'Lunar Apprentice'
  | 'Nakshatra Navigator'
  | 'Rashi Ranger'
  | 'Graha Guardian'
  | 'Dasha Master'
  | 'Vedic Visionary'
  | 'Cosmic Sage'
  | 'Jyotisha Guru'

export interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  birthLat?: number
  birthLon?: number
  avatar: string
  level: number
  xp: number
  xpToNextLevel: number
  rank: CosmicRank
  streakDays: number
  longestStreak: number
  lastActivityDate: string | null
  achievements: string[]
  completedChallenges: string[]
  kundliIds: string[]
  onboardingComplete: boolean
  role: 'user' | 'admin'
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  xpReward: number
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  unlockedAt?: string
}

export interface KundliData {
  id: string
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  birthLat: number
  birthLon: number
  ascendant: { rashiIndex: number; degree: number; nakshatraIndex: number; pada: number }
  planets: Array<{
    grahaId: number
    name: string
    rashiIndex: number
    houseNumber: number
    degree: number
    nakshatraIndex: number
    pada: number
    isRetrograde: boolean
    dignity: string
  }>
  dashas: {
    mahadashas: Array<{ planet: string; startDate: string; endDate: string; years: number }>
    currentMahadasha: { planet: string; startDate: string; endDate: string }
    currentAntardasha: { planet: string; startDate: string; endDate: string }
  }
  yogas: Array<{ name: string; type: string; strength: string; description: string }>
  doshas: Array<{ name: string; severity: string; description: string }>
  createdAt: string
}

export interface TarotReading {
  id: string
  spreadType: string
  question: string
  cards: Array<{ cardId: number; cardName: string; position: string; isReversed: boolean }>
  interpretation: string
  createdAt: string
}

export interface NumerologyProfile {
  fullName: string
  birthDate: string
  lifePathNumber: number
  expressionNumber: number
  soulUrgeNumber: number
  personalityNumber: number
  personalYearNumber: number
  interpretation: Record<string, string>
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface NakshatraStore {
  // User state
  user: UserProfile | null
  isOnboarded: boolean
  setUser: (user: UserProfile) => void
  updateUser: (partial: Partial<UserProfile>) => void
  logout: () => void

  // XP & Gamification
  addXP: (amount: number, action: string) => void
  unlockAchievement: (achievementId: string) => void
  updateStreak: () => void
  pendingAchievements: Achievement[]
  clearPendingAchievements: () => void

  // Kundli
  kundlis: KundliData[]
  activeKundliId: string | null
  addKundli: (kundli: KundliData) => void
  setActiveKundli: (id: string) => void
  getActiveKundli: () => KundliData | null

  // Tarot
  tarotReadings: TarotReading[]
  addTarotReading: (reading: TarotReading) => void

  // Numerology
  numerologyProfile: NumerologyProfile | null
  setNumerologyProfile: (profile: NumerologyProfile) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void

  // i18n
  language: 'en' | 'hi'
  setLanguage: (lang: 'en' | 'hi') => void
}

// XP thresholds per level (1-100)
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function getRankForLevel(level: number): CosmicRank {
  if (level >= 96) return 'Jyotisha Guru'
  if (level >= 81) return 'Cosmic Sage'
  if (level >= 66) return 'Vedic Visionary'
  if (level >= 51) return 'Dasha Master'
  if (level >= 36) return 'Graha Guardian'
  if (level >= 26) return 'Rashi Ranger'
  if (level >= 16) return 'Nakshatra Navigator'
  if (level >= 6) return 'Lunar Apprentice'
  return 'Stardust Seeker'
}

const DEFAULT_USER: UserProfile = {
  id: generateId(),
  username: 'cosmic_seeker',
  email: '',
  fullName: '',
  avatar: '🌟',
  level: 1,
  xp: 0,
  xpToNextLevel: xpForLevel(2),
  rank: 'Stardust Seeker',
  streakDays: 0,
  longestStreak: 0,
  lastActivityDate: null,
  achievements: [],
  completedChallenges: [],
  kundliIds: [],
  onboardingComplete: false,
  role: 'user',
}

export const useStore = create<NakshatraStore>()(
  devtools(
    persist(
      (set, get) => ({
        // User state
        user: null,
        isOnboarded: false,
        setUser: (user) => set({ user, isOnboarded: user.onboardingComplete }),
        updateUser: (partial) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...partial } : null,
          })),
        logout: () => set({ user: null, isOnboarded: false }),

        // XP & Gamification
        pendingAchievements: [],
        addXP: (amount, _action) => {
          const { user } = get()
          if (!user) return
          const newXP = user.xp + amount
          let newLevel = user.level
          let xpLeft = newXP
          while (xpLeft >= xpForLevel(newLevel + 1)) {
            xpLeft -= xpForLevel(newLevel + 1)
            newLevel++
          }
          const newRank = getRankForLevel(newLevel)
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  xp: newXP,
                  level: newLevel,
                  xpToNextLevel: xpForLevel(newLevel + 1),
                  rank: newRank,
                }
              : null,
          }))
        },
        unlockAchievement: (achievementId) => {
          const { user } = get()
          if (!user || user.achievements.includes(achievementId)) return
          set((state) => ({
            user: state.user
              ? { ...state.user, achievements: [...state.user.achievements, achievementId] }
              : null,
          }))
        },
        updateStreak: () => {
          const { user } = get()
          if (!user) return
          const today = new Date().toDateString()
          const lastActivity = user.lastActivityDate
          if (lastActivity === today) return

          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const isYesterday = lastActivity === yesterday.toDateString()
          const newStreak = isYesterday ? user.streakDays + 1 : 1
          const longestStreak = Math.max(newStreak, user.longestStreak)

          set((state) => ({
            user: state.user
              ? { ...state.user, streakDays: newStreak, longestStreak, lastActivityDate: today }
              : null,
          }))
        },
        clearPendingAchievements: () => set({ pendingAchievements: [] }),

        // Kundli
        kundlis: [],
        activeKundliId: null,
        addKundli: (kundli) =>
          set((state) => ({
            kundlis: [...state.kundlis.filter((k) => k.id !== kundli.id), kundli],
            activeKundliId: kundli.id,
          })),
        setActiveKundli: (id) => set({ activeKundliId: id }),
        getActiveKundli: () => {
          const { kundlis, activeKundliId } = get()
          return kundlis.find((k) => k.id === activeKundliId) ?? null
        },

        // Tarot
        tarotReadings: [],
        addTarotReading: (reading) =>
          set((state) => ({
            tarotReadings: [reading, ...state.tarotReadings].slice(0, 50),
          })),

        // Numerology
        numerologyProfile: null,
        setNumerologyProfile: (profile) => set({ numerologyProfile: profile }),

        // UI
        sidebarOpen: false,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        activeTab: 'dashboard',
        setActiveTab: (tab) => set({ activeTab: tab }),

        // i18n
        language: 'en',
        setLanguage: (lang) => set({ language: lang }),
      }),
      {
        name: 'nakshatra-store',
        partialize: (state) => ({
          user: state.user,
          isOnboarded: state.isOnboarded,
          kundlis: state.kundlis,
          activeKundliId: state.activeKundliId,
          tarotReadings: state.tarotReadings,
          numerologyProfile: state.numerologyProfile,
          language: state.language,
        }),
      }
    ),
    { name: 'NakshatraStore', enabled: import.meta.env.DEV }
  )
)

// Initialize default user if none exists
export function initializeUser(profileData?: Partial<UserProfile>) {
  const store = useStore.getState()
  if (!store.user) {
    store.setUser({ ...DEFAULT_USER, ...profileData })
  }
}
