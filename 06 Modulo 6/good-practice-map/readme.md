# 🗺️ Demo Educativo: Google Maps Avanzado

## Descripción

Este demo educativo muestra las mejores prácticas para implementar Google Maps con **lazy loading**, **rate limiting**, **Static Maps**, **renderizado condicional** y **clusterización de marcadores**. La aplicación demuestra técnicas avanzadas de optimización de rendimiento y manejo eficiente de APIs.

## 🚀 Características Implementadas

### 1. **Manejo de Límites de API**
- ✅ **Rate Limiting**: Control de frecuencia de llamadas con colas y delays
- ✅ **Batch Processing**: Agrupación de peticiones usando `Promise.all`
- ✅ **Monitorización**: Contador de llamadas, tiempos de respuesta y logs de errores
- ✅ **Caché en Memoria**: Evita llamadas repetidas con TTL de 5 minutos

### 2. **Carga Eficiente**
- ✅ **Lazy Load del Mapa**: No inicializa `google.maps.Map` hasta interacción o viewport
- ✅ **Static Maps Preview**: Imagen estática como placeholder inicial
- ✅ **Renderizado Condicional**: Adapta comportamiento según dispositivo/conexión

### 3. **Clusterización de Marcadores**
- ✅ **Librería Oficial**: Usa `@googlemaps/markerclusterer` de Google
- ✅ **Agrupación Inteligente**: Marcadores cercanos se agrupan automáticamente
- ✅ **Zoom Dinámico**: Clusters se expanden al hacer zoom
- ✅ **Control de Usuario**: Switch para habilitar/deshabilitar clusterización
- ✅ **Persistencia**: Configuración guardada en localStorage

### 4. **UX/Accesibilidad**
- ✅ **Estados de Carga**: Indicadores visuales durante la carga
- ✅ **Mensajes Claros**: Feedback para errores y limitaciones
- ✅ **Controles Accesibles**: `aria-label` y navegación con teclado
- ✅ **Responsive Design**: Adaptado para móviles y desktop

## 🏗️ Arquitectura del Sistema

### Clases Principales

#### `DeviceDetector`
```javascript
// Detecta características del dispositivo y conexión
DeviceDetector.isMobile()           // true si ancho < 768px
DeviceDetector.isSlowConnection()   // true si conexión lenta
DeviceDetector.getRenderMode()      // 'conservative' o 'interactive'
```

#### `RateLimiter`
```javascript
// Maneja rate limiting y batch processing
RateLimiter.queueRequest(url, resolve, reject)  // Encola petición
RateLimiter.processBatch(batch)                 // Procesa lote de peticiones
```

#### `CacheManager`
```javascript
// Gestiona caché en memoria con TTL
CacheManager.get(key)    // Obtiene del caché
CacheManager.set(key, data)  // Guarda en caché
```

#### `StaticMapManager`
```javascript
// Genera URLs de Static Maps API
StaticMapManager.generateStaticMapUrl(center, zoom, size)
StaticMapManager.loadStaticMap()  // Carga placeholder estático
```

#### `LazyMapLoader`
```javascript
// Carga diferida del script de Google Maps
LazyMapLoader.loadGoogleMapsScript()        // Carga script dinámicamente
LazyMapLoader.initializeInteractiveMap()    // Inicializa mapa interactivo
```

#### `GeocodingService`
```javascript
// Servicio de geocodificación con caché
GeocodingService.geocodeAddress(address)           // Geocodifica una dirección
GeocodingService.batchGeocodeAddresses(addresses)  // Procesa múltiples direcciones
```

#### `IntersectionObserverManager`
```javascript
// Maneja carga basada en viewport
IntersectionObserverManager.setupIntersectionObserver()  // Configura observer
IntersectionObserverManager.setupClickToLoad()           // Modo click-to-load
IntersectionObserverManager.setupViewportLoad()          // Modo viewport-load
```

#### `MarkerClusterManager`
```javascript
// Gestiona clusterización de marcadores usando librería oficial
MarkerClusterManager.initializeClusterer()              // Inicializa clusterer
MarkerClusterManager.addMarker(position, title, address) // Agrega marcador
MarkerClusterManager.toggleClustering(enabled)          // Habilita/deshabilita clustering
MarkerClusterManager.getMarkerCount()                   // Obtiene número de marcadores
```

#### `PersistenceManager`
```javascript
// Maneja persistencia de configuraciones
PersistenceManager.saveIntersectionObserverState(enabled)  // Guarda estado del observer
PersistenceManager.loadIntersectionObserverState()         // Carga estado del observer
PersistenceManager.saveMarkerClusteringState(enabled)      // Guarda estado de clustering
PersistenceManager.loadMarkerClusteringState()             // Carga estado de clustering
```

## 📱 Comportamiento por Dispositivo

### **Modo Conservador** (Móviles/Conexión Lenta)
- Solo muestra **Static Maps** como placeholder
- Requiere **click manual** para cargar mapa interactivo
- Optimizado para ahorrar datos y batería

### **Modo Interactivo** (Desktop/Conexión Rápida)
- **Lazy load automático** cuando el mapa entra al viewport
- Carga inmediata del mapa interactivo
- Experiencia completa sin interacción manual

## 🔧 Configuración

### Variables de Configuración
```javascript
const CONFIG = {
    API_KEY: 'tu-api-key-aqui',
    DEFAULT_CENTER: { lat: 21.1230729, lng: -101.6650775 },
    DEFAULT_ZOOM: 11,
    STATIC_MAP_SIZE: '600x400',
    RATE_LIMIT_DELAY: 1000,        // 1 segundo entre llamadas
    BATCH_SIZE: 3,                  // Máximo 3 direcciones por lote
    CACHE_TTL: 300000,              // 5 minutos en caché
    MOBILE_BREAKPOINT: 768,         // Punto de quiebre móvil
    SLOW_CONNECTION_TYPES: ['slow-2g', '2g', '3g']
};
```

## 🚀 Instalación y Uso

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar API Key
Edita `index.js` y reemplaza `CONFIG.API_KEY` con tu clave de Google Maps API.

### 3. Ejecutar Servidor
```bash
npm start
```

### 4. Abrir en Navegador
Visita `http://localhost:3000`

## 📊 Panel de Métricas

La aplicación incluye un panel de métricas en tiempo real que muestra:

- **Llamadas realizadas**: Contador total de peticiones a la API
- **Tiempo promedio**: Tiempo promedio de respuesta en milisegundos
- **Errores**: Número de llamadas fallidas
- **Caché hits**: Número de resultados obtenidos del caché
- **Marcadores**: Número total de marcadores en el mapa

## 🧪 Panel de Pruebas

### Geocodificación Individual
- Ingresa una dirección en el campo de texto
- Haz clic en "Geocodificar" o presiona Enter
- Ve los resultados en tiempo real

### Procesamiento por Lotes
- Ingresa múltiples direcciones separadas por `;`
- Haz clic en "Procesar Lote"
- Observa el rate limiting en acción

### Clusterización de Marcadores
- **Habilitar/Deshabilitar**: Usa el switch en el panel de controles
- **Agrupación Automática**: Los marcadores cercanos se agrupan automáticamente
- **Zoom Dinámico**: Haz zoom para ver marcadores individuales
- **Persistencia**: La configuración se guarda automáticamente

## 📝 Logs de API

Todos los eventos de la API se registran en tiempo real:
- ✅ **Éxito**: Llamadas completadas correctamente
- ❌ **Error**: Errores de red o API
- ℹ️ **Info**: Información general (caché hits, etc.)
- ⚠️ **Advertencia**: Situaciones que requieren atención

## 🔒 Consideraciones de Seguridad

### Restricciones de API Key
```javascript
// Configura tu API key con estas restricciones:
// 1. HTTP referrers: tu-dominio.com/*
// 2. APIs habilitadas: Maps JavaScript API, Geocoding API, Static Maps API
// 3. Cuotas diarias: Configura límites apropiados
```

### Monitoreo de Cuotas
- Usa **Cloud Monitoring** para alertas de cuotas
- Configura **budgets** en Google Cloud Console
- Implementa **circuit breakers** para límites críticos

## 🎯 Casos de Uso Educativos

### 1. **Optimización de Rendimiento**
- Compara carga inicial con/sin lazy loading
- Observa el impacto del caché en tiempos de respuesta
- Analiza el comportamiento en diferentes tipos de conexión

### 2. **Manejo de APIs**
- Experimenta con rate limiting y batch processing
- Observa cómo se manejan los errores de cuota
- Ve el efecto del caché en llamadas repetidas

### 3. **UX Adaptativa**
- Prueba en diferentes dispositivos y tamaños de pantalla
- Simula conexiones lentas en DevTools
- Compara modos conservador vs interactivo

## 🛠️ Extensiones Posibles

### Backend para Batch Real
```javascript
// Para batch real de ciertos endpoints, implementa:
app.post('/api/batch-geocode', async (req, res) => {
    const { addresses } = req.body;
    // Procesar en lote en el servidor
    const results = await processBatchGeocoding(addresses);
    res.json(results);
});
```

### Circuit Breaker
```javascript
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.failureThreshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }
    // Implementar lógica de circuit breaker
}
```

### Métricas Avanzadas
```javascript
// Integrar con servicios de monitoreo
const metrics = {
    trackApiCall(endpoint, duration, success) {
        // Enviar a Google Analytics, DataDog, etc.
    }
};
```

## 📚 Recursos Adicionales

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Static Maps API](https://developers.google.com/maps/documentation/maps-static)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Marker Clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation)

## 🤝 Contribuciones

Este demo es educativo y está abierto a mejoras. Algunas áreas de mejora:

- Implementar Web Workers para procesamiento pesado
- Agregar más tipos de mapas (satelital, híbrido)
- Personalizar iconos de clusters
- Agregar más métricas de rendimiento
- Mejorar la accesibilidad con screen readers
- Implementar animaciones de transición entre clusters

---

**Nota**: Este demo utiliza una API key de ejemplo. Para uso en producción, reemplaza con tu propia clave y configura las restricciones apropiadas.