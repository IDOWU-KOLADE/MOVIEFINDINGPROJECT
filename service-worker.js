const CACHE_NAME = "flickfind-v1";
const ASSETS = [
    "./movie.html",
    "./movie.css",
    "./JAVSCRIPT/movie.js",
    "./IMAGES/logo.png"
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});