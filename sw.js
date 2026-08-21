const CACHE_NAME = "my-pwa-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",

    // CSS
    "./css/style.css",

    // JavaScript
    "./js/app.js",

    // Icons
    "./icons/icon-192.png",
    "./icons/icon-512.png"
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
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))

            );

        })

    );

    self.clients.claim();
});


// ===============================
// FETCH
// ===============================
self.addEventListener("fetch", event => {

    // Only handle GET requests
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                // Return cached file if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise request from network
                return fetch(event.request)
                    .then(networkResponse => {

                        // Cache successful responses
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(
                                        event.request,
                                        responseClone
                                    );
                                });
                        }

                        return networkResponse;

                    })
                    .catch(() => {

                        // Offline fallback
                        return caches.match("./index.html");

                    });

            })

    );
});
