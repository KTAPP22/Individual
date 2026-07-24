const CACHE_NAME = 'karthud-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/styles.css',
  './src/types/telemetry.js',
  './src/services/apexTimingService.js',
  './src/services/supabaseExporter.js',
  './src/components/PitboardHUD.js',
  './src/components/Leaderboard.js',
  './src/components/KartAnalysis.js',
  './src/components/SettingsModal.js',
  './src/components/FlagBanner.js',
  './src/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => Promise.resolve());
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
