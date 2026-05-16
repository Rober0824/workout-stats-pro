var CACHE = 'wsp-v1';
var ASSETS = [
  '/workout-stats-pro/workout_stats_pro.html',
  '/workout-stats-pro/Pista_Minibasket.png',
  '/workout-stats-pro/Workout_Stats_Logo.png',
  '/workout-stats-pro/apple-touch-icon.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Solo cachear assets propios, dejar pasar Supabase y CDN
  var url = e.request.url;
  if(url.indexOf('supabase')>=0 || url.indexOf('jsdelivr')>=0 || url.indexOf('anthropic')>=0){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(res){
        // Cachear respuestas nuevas de nuestro dominio
        if(res.ok && url.indexOf('rober0824.github.io')>=0){
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      });
    }).catch(function(){
      // Offline fallback: devolver el HTML principal
      return caches.match('/workout-stats-pro/workout_stats_pro.html');
    })
  );
});
