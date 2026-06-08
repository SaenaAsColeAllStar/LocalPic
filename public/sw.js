const CACHE_NAME = 'localpic-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Just cache some basic assets here. 
      // Vite handles all the hashed assets, but we'll use a fetch listener below to cache everything dynamically for a true offline PWA experience.
      return cache.addAll(['/', '/index.html', '/manifest.json', '/icon.svg']);
    }).catch(err => {
      console.warn('Failed to precache assets:', err);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      const fetchRequest = event.request.clone();
      
      return fetch(fetchRequest).then(response => {
        // Only cache successful dynamic requests from http/https (e.g. ignore chrome-extension://)
        if (!response || response.status !== 200 || response.type !== 'basic' || !event.request.url.startsWith('http')) {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Optional fallback for pure offline without cache
      });
    })
  );
});
