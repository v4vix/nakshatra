/**
 * Auth store for Nakshatra — separate from main Zustand store.
 * Source of truth is the server session, not localStorage.
 */

import { create } from 'zustand'
import * as authApi from '@/services/auth'
import type { AuthUser } from '@/services/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (params: { username: string; email: string; password: string; fullName: string }) => Promise<boolean>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  updateProfile: (updates: Parameters<typeof authApi.updateProfile>[0]) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authApi.login(email, password)
      set({ user, isAuthenticated: true, isLoading: false })
      // Sync tier to localStorage for PremiumGate compatibility
      localStorage.setItem('nakshatra_plan', user.tier)
      if (user.tier !== 'free') localStorage.setItem('nakshatra_premium', 'true')
      return true
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  register: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authApi.register(params)
      set({ user, isAuthenticated: true, isLoading: false })
      localStorage.setItem('nakshatra_plan', user.tier)
      return true
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      return false
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch { /* ignore */ }
    set({ user: null, isAuthenticated: false })
    localStorage.removeItem('nakshatra_plan')
    localStorage.removeItem('nakshatra_premium')
    localStorage.removeItem('nakshatra-store')
  },

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const user = await authApi.getMe()
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false })
        localStorage.setItem('nakshatra_plan', user.tier)
        if (user.tier !== 'free') localStorage.setItem('nakshatra_premium', 'true')
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateProfile: async (updates) => {
    try {
      const user = await authApi.updateProfile(updates)
      set({ user })
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  clearError: () => set({ error: null }),
}))
