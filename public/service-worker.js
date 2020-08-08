const FILES_TO_CACHE = ["/", "/index.html", "index.js", "favicon.ico"];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).catch(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

self.skipWaiting();
});

// activiate
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );

        return;
}});