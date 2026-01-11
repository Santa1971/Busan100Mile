const CACHE_NAME = 'busan100m-v1';
const ASSETS = [
    './',
    './index.html',
    './course.html',
    './schedule.html',
    './registration.html',
    './notices.html',
    './community.html',
    './results.html',
    './gallery.html',
    './css/styles.css',
    './js/app.js',
    './js/navigation.js',
    './assets/main_logo.jpg',
    './assets/logo.png',
    './assets/hero_dark_bg.jpg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    // API calls should not be cached by SW in this strategy, or use Network First
    if (e.request.url.includes('script.google.com')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
