/* SEANS · çevrimdışı önbellek
   Veri siteye gömülü olduğu için uygulama kabuğu + veri.js önbelleğe alınınca
   site internetsiz de tam çalışır. Canlı tazeleme (jina, truncgil) araya girmez:
   yalnızca aynı kaynaklı GET istekleri ele alınır. */
const SURUM = "seans-v3-2026-07-29";
const KABUK = ["./", "./index.html", "./veri.js", "./manifest.json",
               "./ikon-192.png", "./ikon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // canlı veriye dokunma
  e.respondWith(
    fetch(e.request)
      .then(y => {
        if (y && y.ok) { const kopya = y.clone(); caches.open(SURUM).then(c => c.put(e.request, kopya)); }
        return y;
      })
      .catch(() => caches.match(e.request).then(v => v || caches.match("./index.html")))
  );
});
