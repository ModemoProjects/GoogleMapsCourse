/**
 * Demo Búsqueda Manual con Geocoding API y Sistema de Caché
 * 
 * Características implementadas:
 * - Búsqueda manual con botón (sin autocompletar automático)
 * - Sistema de caché inteligente con localStorage
 * - Parseo de address_components
 * - Sincronización con mapa
 * - Reverse geocoding
 * - Validación y accesibilidad
 * - Loading states y indicadores de caché
 * - Analítica básica y estadísticas de caché
 * 
 * VENTAJAS del sistema de caché:
 * - Respuestas instantáneas para búsquedas repetidas
 * - Reducción significativa de costos de API
 * - Mejor rendimiento y experiencia de usuario
 * - Persistencia en localStorage
 * - Limpieza automática de caché antiguo
 * 
 * CARACTERÍSTICAS del caché:
 * - TTL (Time To Live) configurable
 * - Limpieza automática de entradas expiradas
 * - Indicador visual de respuestas en caché
 * - Estadísticas de hit/miss del caché
 * - Validación de integridad de datos
 */

// Configuración de la API de Google Maps
const GOOGLE_MAPS_CONFIG = {
    key: 'AIzaSyACnySD7qVyCSIrSZujmtSFlHesnd3eKos', // Reemplaza con tu API key
    libraries: ['geometry'], // Solo geometry, sin places
    language: 'es-419',
    region: 'MX'
};

// Configuración del sistema de caché
const CACHE_CONFIG = {
    ttl: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    maxEntries: 100, // Máximo 100 entradas en caché
    keyPrefix: 'geocoding_cache_',
    statsKey: 'geocoding_cache_stats'
};

// Variables globales
let map;
let geocoder;
let marker;
let infoWindow;
let searchStartTime;
let analyticsData = {};
let lastSearchQuery = '';

// Estadísticas de caché
let cacheStats = {
    hits: 0,
    misses: 0,
    totalSearches: 0,
    cacheSize: 0,
    lastCleanup: Date.now()
};

/**
 * Función principal de inicialización
 */
function initializeApp() {
    console.log('Inicializando demo con sistema de caché...');
    
    // Cargar estadísticas de caché
    loadCacheStats();
    
    // Cargar la API de Google Maps
    loadGoogleMapsAPI().then(googleMaps => {
        console.log('Google Maps API cargada:', googleMaps);
        
        // Inicializar servicios
        geocoder = new googleMaps.Geocoder();
        console.log('Geocoder inicializado');
        
        // Inicializar el mapa
        initMap();
        
        // Configurar eventos
        setupEventListeners();
        
        // Limpiar caché expirado al inicio
        cleanupExpiredCache();
        
        // Mostrar estadísticas iniciales
        updateCacheStats();
        
        console.log('Demo de búsqueda con caché inicializado correctamente');
        
    }).catch(error => {
        console.error('Error al cargar Google Maps API:', error);
        showError('Error al cargar Google Maps. Verifica tu API key.');
    });
}

/**
 * Cargar la API de Google Maps
 */
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        // Crear un callback único para evitar conflictos
        const callbackName = 'initGoogleMapsCallback';
        window[callbackName] = () => {
            resolve(window.google.maps);
            delete window[callbackName];
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.key}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&language=${GOOGLE_MAPS_CONFIG.language}&region=${GOOGLE_MAPS_CONFIG.region}&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
            reject(new Error('Error al cargar Google Maps API'));
            delete window[callbackName];
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Inicializar el mapa
 */
function initMap() {
    console.log('Inicializando mapa...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Elemento del mapa no encontrado');
        return;
    }
    
    if (!window.google || !window.google.maps) {
        console.error('Google Maps API no está disponible');
        return;
    }
    
    const mapOptions = {
        center: { lat: 21.1230729, lng: -101.6650775 }, // León Gto
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    };
    
    try {
        map = new google.maps.Map(mapElement, mapOptions);
        console.log('Mapa creado exitosamente');
        
        // Crear marcador
        marker = new google.maps.Marker({
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });
        
        // Crear InfoWindow
        infoWindow = new google.maps.InfoWindow();
        
        // Evento de clic en el mapa
        map.addListener('click', handleMapClick);
        
        // Evento de arrastre del marcador
        marker.addListener('dragend', handleMarkerDrag);
        
        console.log('Mapa inicializado correctamente');
        
    } catch (error) {
        console.error('Error al crear el mapa:', error);
        showError('Error al inicializar el mapa. Verifica la consola para más detalles.');
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    const addressInput = document.getElementById('addressInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearForm');
    const clearCacheButton = document.getElementById('clearCache');
    
    // Búsqueda al presionar Enter en el input
    addressInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    // Botón de búsqueda principal
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });
    
    // Botón de limpiar
    clearButton.addEventListener('click', clearForm);
    
    // Botón de limpiar caché
    clearCacheButton.addEventListener('click', clearCache);
    
    // Validación en tiempo real del input
    addressInput.addEventListener('input', validateInput);
    
    console.log('Event listeners configurados');
}

/**
 * Validar input en tiempo real
 */
function validateInput() {
    const input = document.getElementById('addressInput');
    const searchButton = document.getElementById('searchButton');
    const value = input.value.trim();
    
    // Habilitar/deshabilitar botón según contenido
    if (value.length >= 3) {
        searchButton.disabled = false;
        searchButton.classList.remove('disabled');
    } else {
        searchButton.disabled = true;
        searchButton.classList.add('disabled');
    }
}

/**
 * Realizar búsqueda con sistema de caché
 */
function performSearch() {
    const address = document.getElementById('addressInput').value.trim();
    
    if (!address) {
        showError('Por favor ingresa una dirección');
        return;
    }
    
    if (address.length < 3) {
        showError('La dirección debe tener al menos 3 caracteres');
        return;
    }
    
    console.log('Realizando búsqueda con caché:', address);
    searchStartTime = Date.now();
    lastSearchQuery = address;
    
    // Normalizar la dirección para la clave del caché
    const cacheKey = normalizeAddress(address);
    
    // Verificar si existe en caché
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
        console.log('Resultado encontrado en caché');
        showCacheIndicator(true);
        processCachedResult(cachedResult);
        return;
    }
    
    // No está en caché, hacer búsqueda en API
    console.log('No encontrado en caché, consultando API');
    showCacheIndicator(false);
    showLoading(true);
    
    // Opciones de búsqueda con restricciones básicas
    const request = {
        address: address,
        language: 'es-419',
        region: 'MX'
    };
    
    geocoder.geocode(request, (results, status) => {
        showLoading(false);
        
        if (status === 'OK' && results.length > 0) {
            console.log('Resultados encontrados:', results.length);
            
            // Guardar en caché
            saveToCache(cacheKey, results[0]);
            
            // Procesar el primer resultado (más relevante)
            processGeocodingResult(results[0]);
            
            // Actualizar analytics
            analyticsData = {
                searchTime: Date.now() - searchStartTime,
                resultsCount: results.length,
                usedReverseGeocoding: false,
                searchType: 'Manual',
                fromCache: false
            };
            
            showAnalytics();
            
        } else {
            console.log('No se encontraron resultados para:', address);
            showError('No se encontraron resultados para esa dirección. Intenta con una dirección más específica.');
        }
    });
}

/**
 * Normalizar dirección para usar como clave de caché
 */
function normalizeAddress(address) {
    return address
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
}

/**
 * Obtener resultado del caché
 */
function getFromCache(key) {
    try {
        const cached = localStorage.getItem(CACHE_CONFIG.keyPrefix + key);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        
        // Verificar si ha expirado
        if (Date.now() > data.expiresAt) {
            localStorage.removeItem(CACHE_CONFIG.keyPrefix + key);
            return null;
        }
        
        // Actualizar estadísticas
        cacheStats.hits++;
        cacheStats.totalSearches++;
        saveCacheStats();
        
        console.log('Hit de caché para:', key);
        return data.result;
        
    } catch (error) {
        console.error('Error al leer del caché:', error);
        return null;
    }
}

/**
 * Guardar resultado en caché
 */
function saveToCache(key, result) {
    try {
        const cacheEntry = {
            result: result,
            expiresAt: Date.now() + CACHE_CONFIG.ttl,
            createdAt: Date.now()
        };
        
        localStorage.setItem(CACHE_CONFIG.keyPrefix + key, JSON.stringify(cacheEntry));
        
        // Actualizar estadísticas
        cacheStats.misses++;
        cacheStats.totalSearches++;
        cacheStats.cacheSize = getCacheSize();
        saveCacheStats();
        
        console.log('Resultado guardado en caché:', key);
        
        // Limpiar caché si excede el máximo
        if (cacheStats.cacheSize > CACHE_CONFIG.maxEntries) {
            cleanupOldCache();
        }
        
    } catch (error) {
        console.error('Error al guardar en caché:', error);
    }
}

/**
 * Procesar resultado desde caché
 */
function processCachedResult(result) {
    console.log('Procesando resultado desde caché:', result);
    
    // Parsear componentes de dirección
    parseAddressComponents(result);
    
    // Actualizar mapa
    updateMapWithLocation(result);
    
    // Actualizar analytics
    analyticsData = {
        searchTime: Date.now() - searchStartTime,
        resultsCount: 1,
        usedReverseGeocoding: false,
        searchType: 'Manual',
        fromCache: true
    };
    
    showAnalytics();
    updateCacheStats();
    
    // Mostrar mensaje de éxito
    showSuccess('Dirección encontrada en caché (respuesta instantánea)');
}

/**
 * Procesar resultado de Geocoding
 */
function processGeocodingResult(result) {
    console.log('Procesando resultado:', result);
    
    // Parsear componentes de dirección
    parseAddressComponents(result);
    
    // Actualizar mapa
    updateMapWithLocation(result);
    
    // Mostrar mensaje de éxito
    showSuccess('Dirección encontrada y guardada en caché');
}

/**
 * Parsear componentes de dirección de Geocoding
 */
function parseAddressComponents(result) {
    const components = result.address_components || [];
    const addressData = {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
    };
    
    console.log('Parseando componentes:', components);
    
    components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
            addressData.number = component.long_name;
        } else if (types.includes('route')) {
            addressData.street = component.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
            addressData.neighborhood = component.long_name;
        } else if (types.includes('locality')) {
            addressData.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
            addressData.state = component.long_name;
        } else if (types.includes('country')) {
            addressData.country = component.long_name;
        } else if (types.includes('postal_code')) {
            addressData.postalCode = component.long_name;
        }
    });
    
    console.log('Datos parseados:', addressData);
    
    // Llenar formulario
    fillForm(addressData);
    
    // Validar componentes faltantes
    validateAddressComponents(addressData);
}

/**
 * Llenar formulario con datos de dirección
 */
function fillForm(addressData) {
    document.getElementById('street').value = addressData.street;
    document.getElementById('number').value = addressData.number;
    document.getElementById('neighborhood').value = addressData.neighborhood;
    document.getElementById('city').value = addressData.city;
    document.getElementById('state').value = addressData.state;
    document.getElementById('country').value = addressData.country;
    document.getElementById('postalCode').value = addressData.postalCode;
    
    console.log('Formulario llenado con datos de dirección');
}

/**
 * Validar componentes de dirección y mostrar advertencias
 */
function validateAddressComponents(addressData) {
    const missingFields = [];
    
    if (!addressData.street) missingFields.push('Calle');
    if (!addressData.number) missingFields.push('Número');
    if (!addressData.neighborhood) missingFields.push('Colonia');
    if (!addressData.city) missingFields.push('Ciudad');
    if (!addressData.state) missingFields.push('Estado');
    if (!addressData.country) missingFields.push('País');
    if (!addressData.postalCode) missingFields.push('Código Postal');
    
    if (missingFields.length > 0) {
        showWarning(`Campos faltantes: ${missingFields.join(', ')}. Puedes editarlos manualmente.`);
        
        // Hacer campos editables
        makeFieldsEditable();
    }
}

/**
 * Hacer campos editables para corrección manual
 */
function makeFieldsEditable() {
    const fields = ['street', 'number', 'neighborhood', 'city', 'state', 'country', 'postalCode'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.readOnly = false;
        field.classList.add('editable');
    });
    
    console.log('Campos marcados como editables');
}

/**
 * Actualizar mapa con ubicación
 */
function updateMapWithLocation(result) {
    if (result.geometry && result.geometry.location) {
        const location = result.geometry.location;
        
        // Centrar mapa con animación
        map.panTo(location);
        map.setZoom(16);
        
        // Posicionar marcador
        marker.setPosition(location);
        marker.setVisible(true);
        
        // Mostrar InfoWindow
        const content = `
            <div class="info-window">
                <h4>Ubicación encontrada</h4>
                <p>${result.formatted_address}</p>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        console.log('Mapa actualizado con ubicación:', location.toString());
    }
}

/**
 * Manejar clic en el mapa para reverse geocoding
 */
function handleMapClick(event) {
    const location = event.latLng;
    console.log('Clic en mapa:', location.toString());
    
    // Realizar reverse geocoding
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const result = results[0];
            console.log('Reverse geocoding exitoso:', result);
            
            // Actualizar formulario
            parseAddressComponents(result);
            
            // Actualizar marcador
            marker.setPosition(location);
            marker.setVisible(true);
            
            // Mostrar InfoWindow
            const content = `
                <div class="info-window">
                    <h4>Ubicación seleccionada</h4>
                    <p>${result.formatted_address}</p>
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            
            // Actualizar analytics
            analyticsData.usedReverseGeocoding = true;
            showAnalytics();
        } else {
            showError('No se pudo obtener la dirección de esta ubicación');
        }
    });
}

/**
 * Manejar arrastre del marcador
 */
function handleMarkerDrag(event) {
    const location = event.latLng;
    console.log('Marcador arrastrado a:', location.toString());
    handleMapClick({ latLng: location });
}

/**
 * Limpiar formulario y resetear estado
 */
function clearForm() {
    console.log('Limpiando formulario...');
    
    // Limpiar campos
    document.getElementById('addressForm').reset();
    
    // Hacer campos de solo lectura
    const fields = ['street', 'number', 'neighborhood', 'city', 'state', 'country', 'postalCode'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.readOnly = true;
        field.classList.remove('editable');
    });
    
    // Limpiar mapa
    marker.setVisible(false);
    infoWindow.close();
    
    // Centrar mapa en ubicación inicial
    map.setCenter({ lat: 21.1230729, lng: -101.6650775 });
    map.setZoom(10);
    
    // Limpiar indicadores
    showCacheIndicator(false);
    showLoading(false);
    
    // Limpiar analytics
    document.getElementById('analytics').style.display = 'none';
    
    // Resetear botones
    validateInput();
    
    console.log('Formulario limpiado');
}

/**
 * Limpiar todo el caché
 */
function clearCache() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el caché?')) {
        try {
            // Limpiar todas las entradas del caché
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_CONFIG.keyPrefix)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Resetear estadísticas
            cacheStats = {
                hits: 0,
                misses: 0,
                totalSearches: 0,
                cacheSize: 0,
                lastCleanup: Date.now()
            };
            saveCacheStats();
            updateCacheStats();
            
            showSuccess('Caché limpiado completamente');
            console.log('Caché limpiado');
            
        } catch (error) {
            console.error('Error al limpiar caché:', error);
            showError('Error al limpiar el caché');
        }
    }
}

/**
 * Limpiar caché expirado
 */
function cleanupExpiredCache() {
    try {
        const keys = Object.keys(localStorage);
        let cleaned = 0;
        
        keys.forEach(key => {
            if (key.startsWith(CACHE_CONFIG.keyPrefix)) {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const data = JSON.parse(cached);
                    if (Date.now() > data.expiresAt) {
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            }
        });
        
        if (cleaned > 0) {
            console.log(`Caché limpiado: ${cleaned} entradas expiradas eliminadas`);
        }
        
        cacheStats.lastCleanup = Date.now();
        saveCacheStats();
        
    } catch (error) {
        console.error('Error al limpiar caché expirado:', error);
    }
}

/**
 * Limpiar caché antiguo (cuando excede el máximo)
 */
function cleanupOldCache() {
    try {
        const entries = [];
        const keys = Object.keys(localStorage);
        
        // Recopilar todas las entradas del caché
        keys.forEach(key => {
            if (key.startsWith(CACHE_CONFIG.keyPrefix)) {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const data = JSON.parse(cached);
                    entries.push({ key, createdAt: data.createdAt });
                }
            }
        });
        
        // Ordenar por fecha de creación (más antiguas primero)
        entries.sort((a, b) => a.createdAt - b.createdAt);
        
        // Eliminar las más antiguas
        const toRemove = entries.slice(0, entries.length - CACHE_CONFIG.maxEntries);
        toRemove.forEach(entry => {
            localStorage.removeItem(entry.key);
        });
        
        if (toRemove.length > 0) {
            console.log(`Caché optimizado: ${toRemove.length} entradas antiguas eliminadas`);
        }
        
        cacheStats.cacheSize = getCacheSize();
        saveCacheStats();
        
    } catch (error) {
        console.error('Error al limpiar caché antiguo:', error);
    }
}

/**
 * Obtener tamaño actual del caché
 */
function getCacheSize() {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith(CACHE_CONFIG.keyPrefix)).length;
}

/**
 * Cargar estadísticas del caché
 */
function loadCacheStats() {
    try {
        const saved = localStorage.getItem(CACHE_CONFIG.statsKey);
        if (saved) {
            cacheStats = { ...cacheStats, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Error al cargar estadísticas del caché:', error);
    }
}

/**
 * Guardar estadísticas del caché
 */
function saveCacheStats() {
    try {
        localStorage.setItem(CACHE_CONFIG.statsKey, JSON.stringify(cacheStats));
    } catch (error) {
        console.error('Error al guardar estadísticas del caché:', error);
    }
}

/**
 * Actualizar estadísticas del caché en la UI
 */
function updateCacheStats() {
    const statsDiv = document.getElementById('cacheStats');
    const contentDiv = document.getElementById('cacheStatsContent');
    
    if (!statsDiv || !contentDiv) return;
    
    const hitRate = cacheStats.totalSearches > 0 
        ? ((cacheStats.hits / cacheStats.totalSearches) * 100).toFixed(1)
        : 0;
    
    const content = `
        <p><strong>Entradas en caché:</strong> ${cacheStats.cacheSize}</p>
        <p><strong>Búsquedas totales:</strong> ${cacheStats.totalSearches}</p>
        <p><strong>Hits de caché:</strong> ${cacheStats.hits}</p>
        <p><strong>Misses de caché:</strong> ${cacheStats.misses}</p>
        <p><strong>Efectividad:</strong> ${hitRate}%</p>
        <p><strong>Última limpieza:</strong> ${new Date(cacheStats.lastCleanup).toLocaleString()}</p>
    `;
    
    contentDiv.innerHTML = content;
    statsDiv.style.display = 'block';
}

/**
 * Mostrar/ocultar indicador de caché
 */
function showCacheIndicator(show) {
    const indicator = document.getElementById('cacheIndicator');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

/**
 * Mostrar/ocultar indicador de carga
 */
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    console.error(message);
    alert(`Error: ${message}`);
}

/**
 * Mostrar mensaje de advertencia
 */
function showWarning(message) {
    console.warn(message);
    alert(`Advertencia: ${message}`);
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccess(message) {
    console.log(message);
    // Podrías implementar un toast o notificación más elegante aquí
}

/**
 * Mostrar información de analytics
 */
function showAnalytics() {
    const analyticsDiv = document.getElementById('analytics');
    const contentDiv = document.getElementById('analyticsContent');
    
    const content = `
        <p><strong>Tiempo de búsqueda:</strong> ${analyticsData.searchTime || 'N/A'}ms</p>
        <p><strong>Resultados encontrados:</strong> ${analyticsData.resultsCount || 'N/A'}</p>
        <p><strong>Usó reverse geocoding:</strong> ${analyticsData.usedReverseGeocoding ? 'Sí' : 'No'}</p>
        <p><strong>Tipo de búsqueda:</strong> ${analyticsData.searchType || 'Manual'}</p>
        <p><strong>Desde caché:</strong> ${analyticsData.fromCache ? 'Sí' : 'No'}</p>
        <p><strong>API utilizada:</strong> Geocoding API únicamente</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    `;
    
    contentDiv.innerHTML = content;
    analyticsDiv.style.display = 'block';
    
    console.log('Analytics mostrados:', analyticsData);
}

/**
 * Inicializar la aplicación cuando se carga la página
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando aplicación con sistema de caché...');
    initializeApp();
});
