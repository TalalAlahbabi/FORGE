/* =========================================================
   FORGE Service Worker — offline-first, auto-update
   ========================================================= */

const CACHE_VERSION = "forge-v2.2.0"
const CACHE_NAME = `forge-cache-${CACHE_VERSION}`

// Core files to cache on install — relative paths so it works under any subdirectory
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/apple-touch-icon.png"
]

// ===== INSTALL =====
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS).catch(err => {
                // Don't fail install if some assets miss — cache what we can
                console.warn("[SW] Some assets failed to cache:", err)
            }))
            .then(() => self.skipWaiting())
    )
})

// ===== ACTIVATE — clean old caches =====
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter(k => k.startsWith("forge-cache-") && k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    )
})

// ===== FETCH =====
// Strategy:
// - HTML navigations: network-first (so updates show up), cache fallback for offline
// - Everything else (CSS/JS/images/fonts): cache-first (fast, offline-friendly)
// - Third-party requests (YouTube, Gemini, fonts): network-only (don't cache, don't break offline)
self.addEventListener("fetch", (event) => {
    const req = event.request

    // Only handle GET
    if (req.method !== "GET") return

    const url = new URL(req.url)

    // Third-party: skip — let the browser handle it normally
    if (url.origin !== location.origin) return

    // HTML / navigation requests: network-first
    if (req.mode === "navigate" || req.destination === "document") {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    // Cache a copy of the latest
                    const copy = res.clone()
                    caches.open(CACHE_NAME).then(c => c.put(req, copy))
                    return res
                })
                .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
        )
        return
    }

    // Everything else: cache-first
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached
            return fetch(req).then((res) => {
                // Only cache successful same-origin responses
                if (res.ok && res.type === "basic") {
                    const copy = res.clone()
                    caches.open(CACHE_NAME).then(c => c.put(req, copy))
                }
                return res
            }).catch(() => {
                // If it's an image, we could return a placeholder here
                return new Response("", { status: 503, statusText: "Offline" })
            })
        })
    )
})

// ===== UPDATE MESSAGE HANDLER =====
// Allows the page to tell the SW to skip waiting when a new version is ready
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting()
    }
})
