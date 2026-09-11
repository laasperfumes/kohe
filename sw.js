// Kohe — service worker simples.
// Sempre busca a versão nova na internet; sem conexão, usa a última cópia salva.
const CACHE = "kohe-v2";

self.addEventListener("install", () => self.skipWaiting());
// Ao ativar, joga fora caches de versões antigas antes de assumir as abas.
// Sem isto, cada troca de versão deixaria o cache anterior ocupando espaço.
self.addEventListener("activate", event => event.waitUntil(
  caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(cache => cache.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./")))
  );
});
