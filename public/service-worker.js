const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  "/db.js",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
];

const STATIC_CACHE = "static-cache-v2";
const RUNTIME_CACHE = "runtime-cache-v1";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Installing cache:", STATIC_CACHE);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// The activate handler will take care of cleaning up old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log("Removing your old cache data", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // If not a GET request, return
  if (event.request.method !== "GET") {
    return;
  }
  // If request url includes '/api/', return a fetch request to the API
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(RUNTIME_CACHE)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              // With a network request failure, get the request from the cache.
              return caches.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }

  // Use cache first for all other requests for performance
  event.respondWith(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request);
        });
      })
      .catch((err) => console.log(err))
  );
});
