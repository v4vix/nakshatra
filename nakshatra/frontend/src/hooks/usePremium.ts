import { useState, useCallback, useEffect } from 'react'
import {
  hasPlan,
  refreshSubscriptionState,
  restorePurchases,
  getSubscriptionState,
  type PlanId,
  type SubscriptionState,
} from '@/lib/purchases'
import { isNative } from '@/lib/native'

/**
 * Hook for premium subscription state and gating.
 *
 * On native (iOS/Android): Uses RevenueCat for real IAP validation.
 * On web: Falls back to localStorage (for dev/testing only).
 */
export function usePremium() {
  const [subscription, setSubscription] = useState<SubscriptionState>(getSubscriptionState)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [restoring, setRestoring] = useState(false)

  // Sync state on mount and when returning to app
  useEffect(() => {
    refreshSubscriptionState().then(setSubscription)

    // Re-check when app comes back to foreground
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshSubscriptionState().then(setSubscription)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const isPremium = subscription.plan !== 'free'
  const currentPlan = subscription.plan

  /**
   * Dev/testing only: manually set premium status.
   * On native, this is ignored — use real purchases.
   */
  const upgradeToPremium = useCallback((plan: PlanId = 'pro') => {
    if (isNative) return // Only real purchases on native
    localStorage.setItem('nakshatra_premium', 'true')
    localStorage.setItem('nakshatra_plan', plan)
    setSubscription({
      plan,
      isActive: true,
      expiresAt: null,
      willRenew: false,
    })
  }, [])

  const downgradeToPremium = useCallback(() => {
    if (isNative) return
    localStorage.removeItem('nakshatra_premium')
    localStorage.removeItem('nakshatra_plan')
    setSubscription({
      plan: 'free',
      isActive: false,
      expiresAt: null,
      willRenew: false,
    })
  }, [])

  /**
   * Gate a callback behind premium status.
   * If not premium, shows the upgrade modal instead.
   */
  const requirePremium = useCallback(
    (callback: () => void, requiredPlan: PlanId = 'pro') => {
      if (hasPlan(requiredPlan)) {
        callback()
      } else {
        setShowUpgradeModal(true)
      }
    },
    []
  )

  /**
   * Restore purchases from App Store / Play Store.
   */
  const handleRestore = useCallback(async () => {
    setRestoring(true)
    try {
      const state = await restorePurchases()
      setSubscription(state)
    } finally {
      setRestoring(false)
    }
  }, [])

  return {
    isPremium,
    currentPlan,
    subscription,
    upgradeToPremium,
    downgradeToPremium,
    showUpgradeModal,
    setShowUpgradeModal,
    requirePremium,
    restorePurchases: handleRestore,
    restoring,
  }
}
