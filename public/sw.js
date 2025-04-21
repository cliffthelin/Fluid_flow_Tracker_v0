const CACHE_NAME = "my-uro-log-v1"
const urlsToCache = ["/", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.json", "/globals.css"]

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  // Activate the service worker immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  // Claim clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache, then network
self.addEventListener("fetch", (event) => {
  // Skip IndexedDB requests
  if (
    event.request.url.includes("indexeddb") ||
    event.request.url.includes("idb") ||
    event.request.url.includes("dexie")
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            // Don't cache API requests or other dynamic content
            if (!event.request.url.includes("/api/")) {
              cache.put(event.request, responseToCache)
            }
          })

          return response
        })
        .catch(() => {
          // If fetch fails (offline), try to return a fallback
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }
        })
    }),
  )
})

// Handle periodic sync for data backup
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "backup-uro-log-data") {
    event.waitUntil(backupUroLogData())
  }
})

// Function to backup data periodically
async function backupUroLogData() {
  // This would be implemented if you had a backend to sync with
  console.log("Performing periodic backup of UroLog data")

  // You could implement a mechanism to save data to the user's cloud storage
  // or create a local backup in a different storage mechanism
}
