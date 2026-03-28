// ============================================================
// Frontend Push Notification Service
// Handles permission, subscription, local scheduling, and prefs.
// ============================================================

const PREFS_KEY = 'nakshatra-notification-prefs'

export interface NotificationPreferences {
  enabled: boolean
  dailyForecast: boolean
  muhurtaAlerts: boolean
  retrogradeWarnings: boolean
  festivalReminders: boolean
  quietHoursStart: string // "22:00"
  quietHoursEnd: string   // "06:00"
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  dailyForecast: true,
  muhurtaAlerts: true,
  retrogradeWarnings: true,
  festivalReminders: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
}

export function getNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

export function setNotificationPreferences(prefs: Partial<NotificationPreferences>): NotificationPreferences {
  const current = getNotificationPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem(PREFS_KEY, JSON.stringify(updated))
  return updated
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'
  const result = await Notification.requestPermission()
  return result
}

export async function sendTestNotification(): Promise<boolean> {
  const perm = await requestNotificationPermission()
  if (perm !== 'granted') return false

  new Notification('Nakshatra Cosmic Alert', {
    body: 'Your notifications are working! You will receive daily cosmic guidance.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'test-notification',
  })
  return true
}

export async function subscribeToPush(userId?: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    })

    const apiBase = import.meta.env.VITE_API_URL || ''
    await fetch(`${apiBase}/api/v1/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, userId }),
    })
    return true
  } catch {
    return false
  }
}
