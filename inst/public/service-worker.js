self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through fetch
    event.respondWith(
        fetch(event.request).catch(() => {
            // Return nothing or a fallback if offline to prevent "Uncaught (in promise)"
            return new Response(null, { status: 408, statusText: "Request Timeout" });
        })
    );
});
