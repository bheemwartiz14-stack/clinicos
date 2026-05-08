const CACHE_NAME = "mediclinicpro-v1";
const APP_SHELL = ["/dashboard", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ offline: true }), {
            headers: { "content-type": "application/json" },
            status: 503,
          }),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/dashboard"))),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "clinic-sync") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "SYNC_REQUESTED" });
        }
      }),
    );
  }
});
