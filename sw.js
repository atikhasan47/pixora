/* ==================================================
   🔥 ATIK DAILY EARNING - SERVICE WORKER (PWA)
   ================================================== */
var CACHE_NAME = 'atik-cache-v2';
var urlsToCache = [
  './',
  './user.html',
  './manifest.json'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      console.log('✅ Cache opened');
      return cache.addAll(urlsToCache).catch(function(e){
        console.log('Cache addAll error:', e);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.map(function(name){
          if(name !== CACHE_NAME){
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  if(event.request.url.indexOf('firebasedatabase') >= 0 ||
     event.request.url.indexOf('firebaseio') >= 0 ||
     event.request.url.indexOf('highrevenueformat') >= 0 ||
     event.request.url.indexOf('profitableratecpm') >= 0 ||
     event.request.url.indexOf('googleapis') >= 0 ||
     event.request.url.indexOf('gstatic') >= 0){
    return;
  }
  
  event.respondWith(
    fetch(event.request).then(function(response){
      if(response && response.status === 200 && response.type === 'basic'){
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
