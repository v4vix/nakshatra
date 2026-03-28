import { useState, useEffect, useCallback } from 'react'

// Extend the BeforeInstallPromptEvent type which is not in the standard lib
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker (production only — dev mode SW caching breaks HMR)
    if ('serviceWorker' in navigator && !import.meta.env.DEV) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          if (import.meta.env.DEV) console.log('[PWA] Service worker registered, scope:', registration.scope)
        })
        .catch((err) => {
          if (import.meta.env.DEV) console.error('[PWA] Service worker registration failed:', err)
        })
    } else if ('serviceWorker' in navigator && import.meta.env.DEV) {
      // Unregister any existing SW in dev to prevent stale cache issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister())
      })
    }

    // Check if app is already running in standalone (installed) mode
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    if (standaloneQuery.matches || (navigator as Navigator & { standalone?: boolean }).standalone) {
      setIsInstalled(true)
    }

    // Listen for display-mode changes (user may install while app is open)
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true)
    }
    standaloneQuery.addEventListener('change', handleDisplayModeChange)

    // Capture the install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      if (import.meta.env.DEV) console.log('[PWA] App installed')
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      standaloneQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        if (import.meta.env.DEV) console.log('[PWA] User accepted the install prompt')
      } else {
        if (import.meta.env.DEV) console.log('[PWA] User dismissed the install prompt')
      }
      setDeferredPrompt(null)
      setIsInstallable(false)
      return outcome === 'accepted'
    } catch (err) {
      if (import.meta.env.DEV) console.error('[PWA] Install prompt failed:', err)
      return false
    }
  }, [deferredPrompt])

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      if (import.meta.env.DEV) console.warn('[PWA] Notifications not supported in this browser')
      return false
    }

    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (err) {
      if (import.meta.env.DEV) console.error('[PWA] Notification permission request failed:', err)
      return false
    }
  }, [])

  const subscribeToPush = useCallback(
    async (vapidPublicKey?: string): Promise<PushSubscription | null> => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

      try {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()
        if (existingSubscription) return existingSubscription

        if (!vapidPublicKey) return null

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        })
        return subscription
      } catch (err) {
        if (import.meta.env.DEV) console.error('[PWA] Push subscription failed:', err)
        return null
      }
    },
    []
  )

  return {
    isInstallable,
    isInstalled,
    installApp,
    requestNotificationPermission,
    subscribeToPush,
  }
}
