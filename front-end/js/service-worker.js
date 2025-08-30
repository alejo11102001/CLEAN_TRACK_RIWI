const CACHE_NAME = 'cleantrack-v1';
// Lista de archivos que componen la aplicación
const urlsToCache = [
'./mis-zonas-pro.html',
'./zonas_employee.css',
'./zones_employee.js',
'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
'https://riwi.io/wp-content/uploads/2023/07/Fondo-oscuro-1.png'
];

// Instala el Service Worker y guarda los archivos en caché
self.addEventListener('install', event => {
event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
    })
);
});

// Intercepta las peticiones y responde desde la caché si es posible
self.addEventListener('fetch', event => {
event.respondWith(
    caches.match(event.request)
    .then(response => {
        // Si el archivo está en caché, lo devuelve. Si no, lo busca en la red.
        return response || fetch(event.request);
    })
);
});