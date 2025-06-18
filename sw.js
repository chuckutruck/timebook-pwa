const CACHE_NAME = "timebook-cache-v1";
const BASE_URL = "/timebook-pwa";
const urlsToCache = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/sw.js`,
  `${BASE_URL}/app.js`,
  `${BASE_URL}/icons/icon-192.png`,
  `${BASE_URL}/icons/icon-512.png`
];


self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
