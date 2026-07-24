const CACHE_NAME = 'karthud-v2.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/styles.css',
  './src/types/telemetry.js',
  './src/services/apexTimingService.js',
  './src/services/supabaseExporter.js',
  './src/components/PitboardHUD.js',
  './src/components/SettingsModal.js',
  './src/components/TimingModal.js',
  './src/app.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => Promise.resolve());
    })
  );
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

// Network-First Strategy to guarantee instant updates on desktop PC & mobile
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
