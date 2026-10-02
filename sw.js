/* Desarrollo: red sin caché HTTP ni precarga offline. No toca partidas. */
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' ||
      new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() =>
    new Response('Necesitas conexión para cargar Aventuras.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  ));
});
