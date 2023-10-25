
const staticCacheName = 'static-caches-v3'
const dynamicCacheName = 'site-dynamic-v1'

//Array med filer
const assets = [
   './index.html',
   './src/App.css',
   './fallback.html'
]

// caches.open('my-cache')
//    .then(cache => {
//       cache.addAll(assets);
//    })

// Install Service Worker
self.addEventListener('install', event => {
   event.waitUntil(
      caches.open(staticCacheName)
         .then(cache => {
            cache.addAll(assets)
         })
   )
   console.log('Service Worker has been installed');
})

//SLETTER OVERSKYDENDE CACHES SOM IKKE ER staticCacheName
// Activate Service Worker
self.addEventListener('activate', event => {
   console.log('Service Worker has been activated');
   // sde nado mapisat komnetari
   event.waitUntil(
      //henter alle cache pakker
      caches.keys()
         .then(keys => {
            //filtere array med alle uactuelle cache pakker
            const filteredKeys = keys.filter(key => key !== staticCacheName)
            //mapper array og sletter pakker
            filteredKeys.map(key => {
               caches.delete(key)
            })
         })
   )
})
//TILFØJER SIDER(FILER) TIL CACHEN DYNAMISK
// Fetch event
self.addEventListener('fetch', event => {
   if (!(event.request.url.indexOf('http') === 0)) return
   // Kontroller svar på request
   event.respondWith(
      // Kig efter file match i cache 
      caches.match(event.request)
         .then(cacheRes => {
            // Returner match fra cache - ellers hent fil på server
            return cacheRes || fetch(event.request)
               .then(async fetchRes => {
                  // Tilføjer nye sider til cachen
                  return caches.open(dynamicCacheName)
                     .then(cache => {
                        // Bruger put til at tilføje sider til vores cache
                        // Læg mærke til metoden clone
                        cache.put(event.request.url, fetchRes.clone())
                        // Returnerer fetch request
                        return fetchRes
                     })
               })
         })
   )
})

// Funktion til styring af antal filer i en given cache
const limitCacheSize = (cacheName, numberOfAllowedFiles) => {
   // Åbn den angivede cache
   caches.open(cacheName)
      .then(cache => {
         // Hent array af cache keys 
         cache.keys()
            .then(keys => {
               // Hvis mængden af filer overstiger det tilladte
               if (keys.length > numberOfAllowedFiles) {
                  // Slet første index (ældste fil) og kør funktion igen indtil antal er nået
                  cache.delete(keys[0])
                     .then(limitCacheSize(cacheName, numberOfAllowedFiles))
               }
            })
      })

}
