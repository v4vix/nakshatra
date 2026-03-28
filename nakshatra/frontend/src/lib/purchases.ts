/**
 * Nakshatra In-App Purchases — RevenueCat + Capacitor
 *
 * Handles Apple IAP & Google Play Billing through RevenueCat's unified SDK.
 * Falls back gracefully when running in browser (web).
 *
 * RevenueCat free tier: up to $2,500/mo tracked revenue.
 *
 * Setup checklist:
 * 1. Create RevenueCat project at https://app.revenuecat.com
 * 2. Add Apple App Store & Google Play Store apps
 * 3. Create products: nakshatra_pro_monthly, nakshatra_pro_yearly,
 *    nakshatra_guru_monthly, nakshatra_guru_yearly
 * 4. Create entitlements: "pro", "guru"
 * 5. Create offerings: "default" with the 4 packages
 * 6. Set VITE_REVENUECAT_KEY in environment
 */

import { isNative, platform } from './native'

// Product identifiers (must match App Store Connect / Play Console)
export const PRODUCTS = {
  PRO_MONTHLY: 'nakshatra_pro_monthly',
  PRO_YEARLY: 'nakshatra_pro_yearly',
  GURU_MONTHLY: 'nakshatra_guru_monthly',
  GURU_YEARLY: 'nakshatra_guru_yearly',
} as const

export type PlanId = 'free' | 'pro' | 'guru'
export type BillingPeriod = 'monthly' | 'yearly'

export interface SubscriptionState {
  plan: PlanId
  isActive: boolean
  expiresAt: string | null
  willRenew: boolean
}

// Cache subscription state in memory
let cachedState: SubscriptionState = {
  plan: 'free',
  isActive: false,
  expiresAt: null,
  willRenew: false,
}

let initialized = false

/**
 * Initialize RevenueCat SDK. Call once on app startup.
 */
export async function initPurchases(userId?: string): Promise<void> {
  if (!isNative || initialized) return

  const apiKey = import.meta.env.VITE_REVENUECAT_KEY
  if (!apiKey) {
    if (import.meta.env.DEV) console.warn('[Purchases] No RevenueCat API key configured')
    return
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')

    await Purchases.configure({
      apiKey,
      appUserID: userId || undefined,
    })

    initialized = true
    await refreshSubscriptionState()
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Purchases] Init failed:', err)
  }
}

/**
 * Fetch current subscription status from RevenueCat.
 */
export async function refreshSubscriptionState(): Promise<SubscriptionState> {
  if (!isNative || !initialized) {
    return cachedState
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { customerInfo } = await Purchases.getCustomerInfo()

    const hasGuru = customerInfo.entitlements.active['guru'] !== undefined
    const hasPro = customerInfo.entitlements.active['pro'] !== undefined

    let plan: PlanId = 'free'
    let expiresAt: string | null = null

    if (hasGuru) {
      plan = 'guru'
      expiresAt = customerInfo.entitlements.active['guru']?.expirationDate ?? null
    } else if (hasPro) {
      plan = 'pro'
      expiresAt = customerInfo.entitlements.active['pro']?.expirationDate ?? null
    }

    cachedState = {
      plan,
      isActive: plan !== 'free',
      expiresAt,
      willRenew: true, // RevenueCat handles this
    }

    // Sync with localStorage for offline access
    if (plan !== 'free') {
      localStorage.setItem('nakshatra_premium', 'true')
      localStorage.setItem('nakshatra_plan', plan)
    } else {
      localStorage.removeItem('nakshatra_premium')
      localStorage.removeItem('nakshatra_plan')
    }

    return cachedState
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Purchases] Refresh failed:', err)
    return cachedState
  }
}

/**
 * Get available subscription offerings (prices from store).
 */
export async function getOfferings() {
  if (!isNative || !initialized) return null

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const result = await Purchases.getOfferings()
    return (result as any)?.offerings?.current ?? (result as any)?.current ?? null
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Purchases] Get offerings failed:', err)
    return null
  }
}

/**
 * Purchase a specific package from an offering.
 */
export async function purchasePackage(packageToPurchase: unknown): Promise<boolean> {
  if (!isNative || !initialized) return false

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await (Purchases as any).purchasePackage({ aPackage: packageToPurchase })
    await refreshSubscriptionState()
    return cachedState.isActive
  } catch (err: any) {
    // User cancelled — not an error
    if (err?.code === 1 || err?.userCancelled) return false
    if (import.meta.env.DEV) console.error('[Purchases] Purchase failed:', err)
    return false
  }
}

/**
 * Restore purchases (e.g., after reinstall or new device).
 */
export async function restorePurchases(): Promise<SubscriptionState> {
  if (!isNative || !initialized) return cachedState

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await Purchases.restorePurchases()
    return await refreshSubscriptionState()
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Purchases] Restore failed:', err)
    return cachedState
  }
}

/**
 * Get cached subscription state (synchronous).
 */
export function getSubscriptionState(): SubscriptionState {
  return { ...cachedState }
}

/**
 * Check if user has a specific plan or higher.
 */
export function hasPlan(requiredPlan: PlanId): boolean {
  if (requiredPlan === 'free') return true

  // Web fallback: check localStorage
  if (!isNative) {
    const stored = localStorage.getItem('nakshatra_plan')
    if (requiredPlan === 'pro') return stored === 'pro' || stored === 'guru'
    if (requiredPlan === 'guru') return stored === 'guru'
    return false
  }

  if (requiredPlan === 'pro') {
    return cachedState.plan === 'pro' || cachedState.plan === 'guru'
  }
  return cachedState.plan === 'guru'
}
