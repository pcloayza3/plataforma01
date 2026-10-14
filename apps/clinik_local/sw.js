// ClinikLocal Service Worker - Cache-First v2.7 para Funcionamiento Offline 100% Autónomo
const CACHE_NAME = 'cliniklocal-v2.7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './landing.html',
  './styles.css',
  './landing.css',
  './app.js',
  './jspdf.min.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return; // Llamadas API pasan directo a red

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback inteligente para offline
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          if (event.request.url.includes('landing.html')) {
            return caches.match('./landing.html');
          }
          return caches.match('./index.html');
        }
      });
    })
  );
});
