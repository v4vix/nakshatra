const CACHE_NAME = 'nakshatra-v2'
const STATIC_ASSETS = ['/', '/index.html']

// ─── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and non-http requests
  if (request.method !== 'GET') return
  if (!request.url.startsWith('http')) return

  // Skip SSE/streaming endpoints — never cache these
  if (request.url.includes('/oracle/chat') || request.url.includes('/llm/stream')) {
    return
  }

  // Skip Vite dev server internals — never cache HMR or dev deps
  if (request.url.includes('/.vite/') ||
      request.url.includes('/@vite/') ||
      request.url.includes('/@react-refresh') ||
      request.url.includes('node_modules/')) {
    return
  }

  // Skip WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') return

  if (request.url.includes('/api/')) {
    // Network-first for API calls, fall back to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
  } else if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    // Network-first for JS/CSS — prevents stale chunk issues
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
  } else {
    // Cache-first for other static assets (images, fonts, icons)
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return response
          })
      )
    )
  }
})

// ─── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Nakshatra', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Nakshatra'
  const options = {
    body: data.body || 'Your daily cosmic reading awaits ✦',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    vibrate: [100, 50, 100],
    tag: data.tag || 'nakshatra-notification',
    renotify: data.renotify || false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ─── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(targetUrl)
            return
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})

// ─── Push subscription change ──────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        // Send the new subscription to backend in production
        console.log('[SW] Push subscription renewed', subscription.endpoint)
      })
  )
})
