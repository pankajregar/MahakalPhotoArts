const CACHE_NAME = "my-pwa-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json"
];


// ===============================
// INSTALL
// ===============================
self.addEventListener("install", event => {

    console.log("Service Worker: Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(APP_SHELL);
            })
    );

    self.skipWaiting();
});


// ===============================
// ACTIVATE
// ===============================
self.addEventListener("activate", event => {

    console.log("Service Worker: Activated");

    event.waitUntil(
        caches.keys().then(cacheNames => {

            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );

        })
    );

    self.clients.claim();
});


// ===============================
// FETCH
// ===============================
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .catch(() => {
                        return caches.match("./index.html");
                    });

            })

    );

});
