/* global caches, fetch, self */
const dataCacheName = 'postData-v1';

self.addEventListener('fetch', e => {
  console.log('[Service Worker] Fetch', e.request.url);
  const url = 'https://zerodaedalus.com/wp-json/wp/v2/posts?per_page=1';

  if (e.request.url.indexOf(url) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(cache => {
        return fetch(e.request).then(response => {
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    });
  }
});
