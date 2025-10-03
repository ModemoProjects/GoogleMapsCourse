# Ejemplos Prácticos - Módulo 8: Resolución de Problemas y Soporte

## 🚨 Ejemplos de Errores Comunes

### 1. Error de API Key Inválida

**Problema**: El mapa no se carga y aparece un error en la consola.

```html
<!-- ❌ INCORRECTO -->
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_AQUI">
</script>
```

**Error en consola**:
```
Google Maps JavaScript API error: RefererNotAllowedMapError
Tu sitio web (http://localhost:3000) no está autorizado para usar esta API key.
```

**✅ Solución**:
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar tu proyecto
3. Ir a "APIs y servicios" > "Credenciales"
4. Editar tu API key
5. En "Restricciones de aplicación", agregar:
   - `localhost:*` (para desarrollo)
   - `https://tu-dominio.com` (para producción)

### 2. Error de Facturación No Habilitada

**Problema**: El mapa se carga pero aparece un mensaje de error.

```javascript
// ❌ INCORRECTO - Sin verificar facturación
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: { lat: -25.363, lng: 131.044 },
    });
}
```

**Error**:
```
BillingNotEnabledMapError: Billing has not been enabled for this project.
```

**✅ Solución**:
1. Ir a Google Cloud Console
2. Ir a "Facturación"
3. Vincular una cuenta de facturación
4. Configurar método de pago
5. Verificar límites de cuota

### 3. Error de Librería No Cargada

**Problema**: Intentas usar Places API pero no funciona.

```javascript
// ❌ INCORRECTO - Librería no cargada
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: { lat: -25.363, lng: 131.044 },
    });
    
    // Esto fallará porque la librería 'places' no está cargada
    const autocomplete = new google.maps.places.Autocomplete(input);
}
```

**Error**:
```
LibraryNotLoadedError: places
```

**✅ Solución**:
```html
<!-- ✅ CORRECTO - Cargar librerías necesarias -->
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=places,geometry">
</script>
```

## ⚡ Ejemplos de Optimización de Rendimiento

### 1. Clustering de Marcadores

**Problema**: Mapa con muchos marcadores se vuelve lento.

```javascript
// ❌ INCORRECTO - Muchos marcadores sin clustering
function addManyMarkers(map) {
    const markers = [];
    
    // Crear 1000 marcadores
    for (let i = 0; i < 1000; i++) {
        const marker = new google.maps.Marker({
            position: {
                lat: Math.random() * 180 - 90,
                lng: Math.random() * 360 - 180
            },
            map: map,
            title: `Marcador ${i}`
        });
        markers.push(marker);
    }
    
    return markers;
}
```

**✅ Solución con Clustering**:
```html
<!-- Cargar librería de clustering -->
<script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js"></script>
```

```javascript
// ✅ CORRECTO - Con clustering
function addManyMarkersWithClustering(map) {
    const markers = [];
    
    // Crear marcadores
    for (let i = 0; i < 1000; i++) {
        const marker = new google.maps.Marker({
            position: {
                lat: Math.random() * 180 - 90,
                lng: Math.random() * 360 - 180
            },
            title: `Marcador ${i}`
        });
        markers.push(marker);
    }
    
    // Crear clusterer
    const markerClusterer = new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        maxZoom: 15,
        gridSize: 50
    });
    
    return { markers, markerClusterer };
}
```

### 2. Lazy Loading de Datos

**Problema**: Cargar todos los datos al inicio hace que la página sea lenta.

```javascript
// ❌ INCORRECTO - Cargar todos los datos al inicio
function loadAllData() {
    fetch('/api/all-locations')
        .then(response => response.json())
        .then(data => {
            // Cargar 10,000 ubicaciones de una vez
            data.forEach(location => {
                addMarker(location);
            });
        });
}
```

**✅ Solución con Lazy Loading**:
```javascript
// ✅ CORRECTO - Cargar datos bajo demanda
function loadDataInBounds(map) {
    const bounds = map.getBounds();
    
    // Solo cargar datos visibles en el mapa
    fetch(`/api/locations?bounds=${bounds.toUrlValue()}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(location => {
                addMarker(location);
            });
        });
}

// Cargar datos cuando cambie la vista del mapa
google.maps.event.addListener(map, 'bounds_changed', function() {
    loadDataInBounds(map);
});
```

### 3. Debouncing de Eventos

**Problema**: Demasiados eventos de cambio de mapa causan muchas llamadas API.

```javascript
// ❌ INCORRECTO - Sin debouncing
google.maps.event.addListener(map, 'bounds_changed', function() {
    // Se ejecuta muchas veces mientras el usuario mueve el mapa
    searchNearbyPlaces();
});
```

**✅ Solución con Debouncing**:
```javascript
// ✅ CORRECTO - Con debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSearch = debounce(searchNearbyPlaces, 500);

google.maps.event.addListener(map, 'bounds_changed', function() {
    debouncedSearch();
});
```

## 🛠️ Ejemplos de Herramientas de Debug

### 1. Verificación de API Key

```javascript
// Función para verificar si la API key es válida
function verifyApiKey() {
    try {
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: { lat: -25.363, lng: 131.044 },
        });
        
        console.log("✅ API key válida");
        return true;
    } catch (error) {
        console.error("❌ Error con API key:", error.message);
        return false;
    }
}
```

### 2. Monitoreo de Uso de Cuota

```javascript
// Función para monitorear el uso de la API
function monitorApiUsage() {
    // Interceptar requests a Google Maps API
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (url.includes('maps.googleapis.com')) {
            console.log('📍 Request a Google Maps API:', url);
            
            return originalFetch.apply(this, args)
                .then(response => {
                    console.log('✅ Response status:', response.status);
                    return response;
                })
                .catch(error => {
                    console.error('❌ Error en request:', error);
                    throw error;
                });
        }
        return originalFetch.apply(this, args);
    };
}
```

### 3. Checklist de Debugging Automatizado

```javascript
// Función para ejecutar checklist de debugging
function runDebugChecklist() {
    const checklist = {
        apiKeyValid: false,
        billingEnabled: false,
        librariesLoaded: false,
        networkConnected: false
    };
    
    // Verificar API key
    try {
        new google.maps.Map(document.createElement('div'));
        checklist.apiKeyValid = true;
    } catch (error) {
        console.error('API key inválida:', error.message);
    }
    
    // Verificar librerías cargadas
    checklist.librariesLoaded = typeof google.maps.places !== 'undefined';
    
    // Verificar conexión de red
    checklist.networkConnected = navigator.onLine;
    
    // Mostrar resultados
    console.table(checklist);
    
    return checklist;
}
```

## 📚 Ejemplos de Uso de Documentación

### 1. Búsqueda Rápida en Documentación

```javascript
// Función para buscar ejemplos en la documentación
function searchDocumentation(query) {
    const baseUrl = 'https://developers.google.com/maps/documentation/javascript/examples';
    const searchUrl = `${baseUrl}?q=${encodeURIComponent(query)}`;
    
    console.log(`🔍 Buscando en documentación: ${searchUrl}`);
    window.open(searchUrl, '_blank');
}

// Ejemplos de uso
searchDocumentation('marker clustering');
searchDocumentation('places autocomplete');
searchDocumentation('street view');
```

### 2. Verificación de Versión de API

```javascript
// Función para verificar la versión de la API
function checkApiVersion() {
    if (typeof google !== 'undefined' && google.maps) {
        console.log('📍 Google Maps API cargada');
        console.log('📅 Versión:', google.maps.version || 'No disponible');
        
        // Verificar si hay actualizaciones disponibles
        fetch('https://developers.google.com/maps/documentation/javascript/releases')
            .then(response => response.text())
            .then(html => {
                console.log('📰 Revisa las notas de versión para actualizaciones');
            });
    } else {
        console.error('❌ Google Maps API no está cargada');
    }
}
```

## 🎯 Ejemplos de Mejores Prácticas

### 1. Manejo de Errores Robusto

```javascript
// Función para inicializar mapa con manejo de errores
function initMapWithErrorHandling() {
    try {
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: { lat: -25.363, lng: 131.044 },
        });
        
        // Configurar listener para errores
        google.maps.event.addListener(map, 'error', function(error) {
            console.error('Error en mapa:', error);
            showErrorMessage('Error al cargar el mapa. Por favor, recarga la página.');
        });
        
        return map;
    } catch (error) {
        console.error('Error al inicializar mapa:', error);
        showErrorMessage('No se pudo inicializar el mapa. Verifica tu configuración.');
        return null;
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
```

### 2. Limpieza de Recursos

```javascript
// Función para limpiar recursos del mapa
function cleanupMapResources(map, markers, listeners) {
    // Limpiar marcadores
    if (markers) {
        markers.forEach(marker => {
            marker.setMap(null);
        });
    }
    
    // Limpiar listeners
    if (listeners) {
        listeners.forEach(listener => {
            google.maps.event.removeListener(listener);
        });
    }
    
    // Limpiar el mapa
    if (map) {
        google.maps.event.clearInstanceListeners(map);
    }
    
    console.log('🧹 Recursos del mapa limpiados');
}
```

### 3. Configuración de Producción

```javascript
// Configuración para producción
const productionConfig = {
    // Usar API key de producción
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    
    // Configurar restricciones
    restrictions: {
        allowedDomains: ['https://tu-dominio.com'],
        allowedIPs: ['192.168.1.0/24']
    },
    
    // Configurar límites de cuota
    quotaLimits: {
        requestsPerDay: 10000,
        requestsPerMinute: 100
    },
    
    // Configurar monitoreo
    monitoring: {
        enableLogging: true,
        logLevel: 'error',
        enableAlerts: true
    }
};

// Función para aplicar configuración de producción
function applyProductionConfig(config) {
    console.log('🚀 Aplicando configuración de producción');
    
    // Configurar logging
    if (config.monitoring.enableLogging) {
        setupErrorLogging(config.monitoring.logLevel);
    }
    
    // Configurar alertas
    if (config.monitoring.enableAlerts) {
        setupQuotaAlerts(config.quotaLimits);
    }
}

function setupErrorLogging(logLevel) {
    window.addEventListener('error', function(event) {
        if (event.message.includes('Google Maps')) {
            console.error('📍 Error de Google Maps:', event.error);
            
            // Enviar a servicio de logging
            if (logLevel === 'error') {
                sendToLoggingService(event.error);
            }
        }
    });
}

function setupQuotaAlerts(limits) {
    // Monitorear uso de cuota
    setInterval(() => {
        checkQuotaUsage(limits);
    }, 60000); // Cada minuto
}

function checkQuotaUsage(limits) {
    // Implementar verificación de cuota
    console.log('📊 Verificando uso de cuota...');
}
