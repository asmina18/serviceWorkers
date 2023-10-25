
const staticCacheName = 'static-caches-v3'    // Navnet på den statiske cache
const dynamicCacheName = 'site-dynamic-v1'  // Navnet på den dynamiske cache

// Et array med filer, der skal caches
const assets = [
   './index.html',
   './css/styles.css',
   './fallback.html'
]

// caches.open('my-cache')
//    .then(cache => {
//       cache.addAll(assets);
//    })

// Installer Service Worker
self.addEventListener('install', event => {
   event.waitUntil(
      // Åbn den statiske cache og tilføj de specificerede ressourcer
      caches.open(staticCacheName)
         .then(cache => {
            cache.addAll(assets)
         })
   )
   console.log('Service Worker has been installed'); // Besked om, at Service Worker er blevet installeret
})

//SLETTER OVERSKYDENDE CACHES SOM IKKE ER staticCacheName
// Activate Service Worker
self.addEventListener('activate', event => {
   console.log('Service Worker has been activated');  // Besked om, at Service Worker er blevet aktiveret
   event.waitUntil(
      // Hent en liste over alle caches
      caches.keys()
         .then(keys => {
            // Filtrer listen for at fjerne caches, der ikke matcher den aktuelle statiske cache
            const filteredKeys = keys.filter(key => key !== staticCacheName)
            // Gennemgå den filtrerede liste og slet caches
            filteredKeys.map(key => {
               caches.delete(key)
            })
         })
   )
})
// Håndtering af anmodninger og dynamisk caching af sider
/// Fetch event
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
         .catch(() => {
            return caches.match('fallback.html')
         }
         ))
})

// Funktion til at styre størrelsen af cachen for dynamiske filer
const limitCacheSize = (cacheName, numberOfAllowedFiles) => {
   // Åbn den angivede cache
   caches.open(cacheName)
      .then(cache => {
         // Hent array af cache keys 
         cache.keys()
            .then(keys => {
               // Hvis antallet af filer overskrider det tilladte
               if (keys.length > numberOfAllowedFiles) {
                  // Slet den ældste fil (første indeks) og kør funktionen igen, indtil det ønskede antal er nået
                  cache.delete(keys[0])
                     .then(() => limitCacheSize(cacheName, numberOfAllowedFiles))
               }
            })
      })
   // Start styring af størrelsen på den dynamiske cache med en grænse på 2 filer
   limitCacheSize(dynamicCacheName, 2)

}
