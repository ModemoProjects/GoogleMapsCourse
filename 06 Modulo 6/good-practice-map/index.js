/**
 * Demo Educativo: Google Maps con Lazy Load, Rate Limiting y Static Maps
 * 
 * Este módulo implementa:
 * - Carga diferida del script de Google Maps con IntersectionObserver
 * - Static Maps como placeholder inicial
 * - Renderizado condicional basado en dispositivo y conexión
 * - Rate limiting y batch processing para APIs
 * - Monitorización de llamadas y métricas
 * - Caché en memoria para evitar llamadas repetidas
 */

// ===== CONFIGURACIÓN Y CONSTANTES =====
const CONFIG = {
    API_KEY: 'AIzaSyACnySD7qVyCSIrSZujmtSFlHesnd3eKos',
    DEFAULT_CENTER: { lat: 21.1230729, lng: -101.6650775 },
    DEFAULT_ZOOM: 11,
    STATIC_MAP_SIZE: '600x400',
    RATE_LIMIT_DELAY: 1000, // 1 segundo entre llamadas
    BATCH_SIZE: 3, // Máximo 3 direcciones por lote
    CACHE_TTL: 300000, // 5 minutos en caché
    MOBILE_BREAKPOINT: 768,
    SLOW_CONNECTION_TYPES: ['slow-2g', '2g', '3g']
};

// ===== VARIABLES GLOBALES =====
let map = null;
let isMapLoaded = false;
let isMapLoading = false;
let staticMapUrl = '';
let intersectionObserverEnabled = false;
let intersectionObserver = null;
let markers = [];
let markerClusterer = null;
let clusteringEnabled = true;

// ===== CONFIGURACIÓN DE PERSISTENCIA =====
const STORAGE_KEYS = {
    INTERSECTION_OBSERVER: 'google_maps_intersection_observer_enabled',
    MARKER_CLUSTERING: 'google_maps_marker_clustering_enabled'
};

// ===== SISTEMA DE PERSISTENCIA =====
class PersistenceManager {
    static saveIntersectionObserverState(enabled) {
        try {
            localStorage.setItem(STORAGE_KEYS.INTERSECTION_OBSERVER, JSON.stringify(enabled));
            this.logApiCall('info', `Estado del IntersectionObserver guardado: ${enabled ? 'habilitado' : 'deshabilitado'}`);
        } catch (error) {
            this.logApiCall('error', `Error al guardar estado del switch: ${error.message}`);
        }
    }

    static loadIntersectionObserverState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.INTERSECTION_OBSERVER);
            if (saved !== null) {
                const enabled = JSON.parse(saved);
                this.logApiCall('info', `Estado del IntersectionObserver cargado: ${enabled ? 'habilitado' : 'deshabilitado'}`);
                return enabled;
            }
        } catch (error) {
            this.logApiCall('error', `Error al cargar estado del switch: ${error.message}`);
        }
        return false; // Valor por defecto
    }

    static saveMarkerClusteringState(enabled) {
        try {
            localStorage.setItem(STORAGE_KEYS.MARKER_CLUSTERING, JSON.stringify(enabled));
            this.logApiCall('info', `Clusterización de marcadores guardada: ${enabled ? 'habilitada' : 'deshabilitada'}`);
        } catch (error) {
            this.logApiCall('error', `Error al guardar estado de clusterización: ${error.message}`);
        }
    }

    static loadMarkerClusteringState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.MARKER_CLUSTERING);
            if (saved !== null) {
                const enabled = JSON.parse(saved);
                this.logApiCall('info', `Clusterización de marcadores cargada: ${enabled ? 'habilitada' : 'deshabilitada'}`);
                return enabled;
            }
        } catch (error) {
            this.logApiCall('error', `Error al cargar estado de clusterización: ${error.message}`);
        }
        return true; // Valor por defecto (habilitado)
    }

    static clearAllSettings() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.logApiCall('info', 'Todas las configuraciones guardadas han sido eliminadas');
        } catch (error) {
            this.logApiCall('error', `Error al limpiar configuraciones: ${error.message}`);
        }
    }

    static logApiCall(type, message) {
        RateLimiter.logApiCall(type, message, 0);
    }
}

// Métricas de API
const metrics = {
    apiCalls: 0,
    totalResponseTime: 0,
    errors: 0,
    cacheHits: 0,
    startTime: Date.now()
};

// Caché en memoria
const cache = new Map();

// Cola de rate limiting
const requestQueue = [];
let isProcessingQueue = false;

// ===== UTILIDADES DE DETECCIÓN DE DISPOSITIVO =====
class DeviceDetector {
    static getScreenWidth() {
        return window.innerWidth || document.documentElement.clientWidth;
    }

    static getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }

    static isMobile() {
        return this.getScreenWidth() < CONFIG.MOBILE_BREAKPOINT;
    }

    static isSlowConnection() {
        const connectionType = this.getConnectionType();
        return CONFIG.SLOW_CONNECTION_TYPES.includes(connectionType);
    }

    static getRenderMode() {
        if (this.isMobile() || this.isSlowConnection()) {
            return 'conservative'; // Solo Static Maps
        }
        return 'interactive'; // Lazy load automático
    }
}

// ===== SISTEMA DE RATE LIMITING Y BATCH PROCESSING =====
class RateLimiter {
    static async processQueue() {
        if (isProcessingQueue || requestQueue.length === 0) return;
        
        isProcessingQueue = true;
        
        while (requestQueue.length > 0) {
            const batch = requestQueue.splice(0, CONFIG.BATCH_SIZE);
            await this.processBatch(batch);
            
            if (requestQueue.length > 0) {
                await this.delay(CONFIG.RATE_LIMIT_DELAY);
            }
        }
        
        isProcessingQueue = false;
    }

    static async processBatch(batch) {
        const promises = batch.map(request => this.executeRequest(request));
        
        try {
            const results = await Promise.all(promises);
            results.forEach((result, index) => {
                if (batch[index].resolve) {
                    batch[index].resolve(result);
                }
            });
        } catch (error) {
            batch.forEach(request => {
                if (request.reject) {
                    request.reject(error);
                }
            });
        }
    }

    static async executeRequest(request) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(request.url);
            const data = await response.json();
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, false);
            
            this.logApiCall('success', `Llamada exitosa: ${request.url}`, responseTime);
            
            return { success: true, data, responseTime };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true);
            
            this.logApiCall('error', `Error en llamada: ${request.url} - ${error.message}`, responseTime);
            
            return { success: false, error: error.message, responseTime };
        }
    }

    static queueRequest(url, resolve, reject) {
        requestQueue.push({ url, resolve, reject });
        this.processQueue();
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static updateMetrics(responseTime, isError) {
        metrics.apiCalls++;
        metrics.totalResponseTime += responseTime;
        if (isError) metrics.errors++;
        
        this.updateMetricsUI();
    }

    static updateMetricsUI() {
        document.getElementById('api-calls-count').textContent = metrics.apiCalls;
        document.getElementById('error-count').textContent = metrics.errors;
        document.getElementById('cache-hits').textContent = metrics.cacheHits;
        document.getElementById('marker-count').textContent = MarkerClusterManager.getMarkerCount();
        
        const avgTime = metrics.apiCalls > 0 ? 
            Math.round(metrics.totalResponseTime / metrics.apiCalls) : 0;
        document.getElementById('avg-response-time').textContent = `${avgTime}ms`;
    }

    static logApiCall(type, message, responseTime) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `[${timestamp}] ${message} (${responseTime}ms)`;
        
        const logsContainer = document.getElementById('api-logs');
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
}

// ===== SISTEMA DE CACHÉ =====
class CacheManager {
    static get(key) {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > CONFIG.CACHE_TTL) {
            cache.delete(key);
            return null;
        }
        
        metrics.cacheHits++;
        RateLimiter.updateMetricsUI();
        return item.data;
    }

    static set(key, data) {
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    static clear() {
        cache.clear();
        metrics.cacheHits = 0;
        RateLimiter.updateMetricsUI();
    }
}


// ===== SISTEMA DE CLUSTERIZACIÓN DE MARCADORES =====
class MarkerClusterManager {
    static initializeClusterer() {
        if (!map || !window.markerClusterer) {
            this.logApiCall('error', 'MarkerClusterer no está disponible');
            return;
        }
        
        try {
            // Usar la librería oficial de Google
            markerClusterer = new window.markerClusterer.MarkerClusterer({
                map: map,
                markers: markers
            });
            
            this.logApiCall('success', 'MarkerClusterer inicializado correctamente');
            
        } catch (error) {
            this.logApiCall('error', `Error al inicializar MarkerClusterer: ${error.message}`);
        }
    }

    static addMarker(position, title, address = '') {
        if (!map) return null;
        
        const marker = new google.maps.Marker({
            position: position,
            map: null, // No agregar al mapa directamente
            title: title
        });

        // Agregar información adicional al marcador
        marker.address = address;
        marker.geocodingResult = { address, position };
        
        markers.push(marker);
        
        // Aplicar clusterización o mostrar individualmente
        if (clusteringEnabled) {
            if (markerClusterer) {
                markerClusterer.addMarker(marker);
            } else {
                // Si no hay clusterer, mostrar individualmente
                marker.setMap(map);
            }
        } else {
            // Mostrar individualmente
            marker.setMap(map);
        }
        
        this.logApiCall('info', `Marcador agregado: ${title} (Total: ${markers.length})`);
        
        // Actualizar métricas
        RateLimiter.updateMetricsUI();
        
        return marker;
    }

    static clearAllMarkers() {
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        
        if (markerClusterer) {
            markerClusterer.clearMarkers();
        }
        
        this.logApiCall('info', 'Todos los marcadores han sido eliminados');
        
        // Actualizar métricas
        RateLimiter.updateMetricsUI();
    }

    static toggleClustering(enabled) {
        clusteringEnabled = enabled;
        
        if (!map) return;
        
        if (enabled) {
            // Habilitar clustering
            this.logApiCall('info', 'Habilitando clusterización de marcadores...');
            
            // Remover marcadores del mapa individual
            markers.forEach(marker => marker.setMap(null));
            
            // Inicializar clusterer si no existe
            if (!markerClusterer) {
                this.initializeClusterer();
            }
            
            // Agregar marcadores al clusterer
            if (markerClusterer) {
                markerClusterer.addMarkers(markers);
            }
            
            this.logApiCall('info', 'Clusterización de marcadores habilitada');
        } else {
            // Deshabilitar clustering
            this.logApiCall('info', 'Deshabilitando clusterización de marcadores...');
            
            if (markerClusterer) {
                markerClusterer.clearMarkers();
            }
            
            // Agregar marcadores individualmente al mapa
            markers.forEach(marker => marker.setMap(map));
            
            this.logApiCall('info', 'Clusterización de marcadores deshabilitada');
        }
    }

    static getMarkerCount() {
        return markers.length;
    }

    static logApiCall(type, message) {
        RateLimiter.logApiCall(type, message, 0);
    }
}

// ===== SISTEMA DE STATIC MAPS =====
class StaticMapManager {
    static generateStaticMapUrl(center, zoom, size = CONFIG.STATIC_MAP_SIZE) {
        const params = new URLSearchParams({
            center: `${center.lat},${center.lng}`,
            zoom: zoom.toString(),
            size: size,
            maptype: 'roadmap',
            markers: `color:red|${center.lat},${center.lng}`,
            key: CONFIG.API_KEY
        });
        
        return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    }

    static async loadStaticMap() {
        const staticMapUrl = this.generateStaticMapUrl(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);
        const staticMapImage = document.getElementById('static-map-image');
        
        staticMapImage.src = staticMapUrl;
        staticMapImage.alt = `Mapa estático centrado en ${CONFIG.DEFAULT_CENTER.lat}, ${CONFIG.DEFAULT_CENTER.lng}`;
        
        this.logApiCall('info', 'Static Map cargado como placeholder');
    }

    static logApiCall(type, message) {
        RateLimiter.logApiCall(type, message, 0);
    }
}

// ===== SISTEMA DE CARGA DIFERIDA =====
class LazyMapLoader {
    static async loadGoogleMapsScript() {
        if (window.google && window.google.maps) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.API_KEY}&libraries=geometry&language=es-419&callback=initGoogleMaps`;
            script.async = true;
            script.defer = true;
            
            window.initGoogleMaps = () => {
                this.logApiCall('success', 'Script de Google Maps cargado exitosamente');
                resolve();
            };
            
            script.onerror = () => {
                this.logApiCall('error', 'Error al cargar el script de Google Maps');
                reject(new Error('No se pudo cargar Google Maps'));
            };
            
            document.head.appendChild(script);
        });
    }

    static async initializeInteractiveMap() {
        if (isMapLoaded || isMapLoading) return;
        
        isMapLoading = true;
        this.showLoadingState();
        
        try {
            await this.loadGoogleMapsScript();
            
    const { Map } = await google.maps.importLibrary("maps");
            
    map = new Map(document.getElementById("map"), {
                center: CONFIG.DEFAULT_CENTER,
                zoom: CONFIG.DEFAULT_ZOOM,
                mapTypeId: 'roadmap',
                gestureHandling: 'greedy'
            });

            // Inicializar clusterización
            MarkerClusterManager.initializeClusterer();
            
            // Agregar marcador por defecto
            MarkerClusterManager.addMarker(CONFIG.DEFAULT_CENTER, 'Ubicación por defecto');

            isMapLoaded = true;
            isMapLoading = false;
            
            this.hideLoadingState();
            this.showInteractiveMap();
            
            this.logApiCall('success', 'Mapa interactivo inicializado correctamente');
            
        } catch (error) {
            isMapLoading = false;
            this.hideLoadingState();
            this.logApiCall('error', `Error al inicializar mapa: ${error.message}`);
        }
    }

    static showLoadingState() {
        const loadingElement = document.getElementById('map-loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    static hideLoadingState() {
        const loadingElement = document.getElementById('map-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    static showInteractiveMap() {
        const staticContainer = document.getElementById('static-map-container');
        const interactiveContainer = document.getElementById('interactive-map-container');
        
        if (staticContainer) staticContainer.style.display = 'none';
        if (interactiveContainer) interactiveContainer.style.display = 'block';
    }

    static logApiCall(type, message) {
        RateLimiter.logApiCall(type, message, 0);
    }
}

// ===== SISTEMA DE GEOCODING =====
class GeocodingService {
    static async geocodeAddress(address) {
        const cacheKey = `geocode_${address}`;
        const cachedResult = CacheManager.get(cacheKey);
        
        if (cachedResult) {
            this.logApiCall('info', `Resultado obtenido del caché para: ${address}`);
            return cachedResult;
        }

        return new Promise((resolve, reject) => {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${CONFIG.API_KEY}&language=es-419`;
            
            RateLimiter.queueRequest(url, (result) => {
                if (result.success) {
                    CacheManager.set(cacheKey, result.data);
                    resolve(result.data);
                } else {
                    reject(new Error(result.error));
                }
            }, reject);
        });
    }

    static async batchGeocodeAddresses(addresses) {
        const results = [];
        const errors = [];
        
        for (const address of addresses) {
            try {
                const result = await this.geocodeAddress(address);
                results.push({ address, result });
            } catch (error) {
                errors.push({ address, error: error.message });
            }
        }
        
        return { results, errors };
    }

    static logApiCall(type, message) {
        RateLimiter.logApiCall(type, message, 0);
    }
}

// ===== SISTEMA DE INTERSECTION OBSERVER =====
class IntersectionObserverManager {
    static setupIntersectionObserver() {
        // Cargar estado guardado
        intersectionObserverEnabled = PersistenceManager.loadIntersectionObserverState();
        
        // Configurar el switch
        this.setupSwitch();
        
        // Aplicar estado cargado
        if (intersectionObserverEnabled) {
            this.logApiCall('info', 'IntersectionObserver habilitado desde configuración guardada');
            this.enableIntersectionObserver();
        } else {
            this.logApiCall('info', 'IntersectionObserver deshabilitado - usa el switch para habilitar');
        }
    }

    static setupSwitch() {
        const switchElement = document.getElementById('intersection-observer-switch');
        const descriptionElement = document.getElementById('switch-description');
        
        if (switchElement && descriptionElement) {
            // Configurar estado inicial desde localStorage
            switchElement.checked = intersectionObserverEnabled;
            this.updateDescription();
            
            // Agregar event listener
            switchElement.addEventListener('change', (e) => {
                intersectionObserverEnabled = e.target.checked;
                this.updateDescription();
                
                // Guardar estado en localStorage
                PersistenceManager.saveIntersectionObserverState(intersectionObserverEnabled);
                
                if (intersectionObserverEnabled) {
                    this.enableIntersectionObserver();
                } else {
                    this.disableIntersectionObserver();
                }
            });
        }
    }

    static updateDescription() {
        const descriptionElement = document.getElementById('switch-description');
        if (descriptionElement) {
            if (intersectionObserverEnabled) {
                descriptionElement.textContent = 'Carga automática por viewport habilitada';
            } else {
                descriptionElement.textContent = 'Carga automática por viewport deshabilitada';
            }
        }
    }

    static enableIntersectionObserver() {
        if (isMapLoaded || isMapLoading) {
            this.logApiCall('warning', 'No se puede habilitar IntersectionObserver - mapa ya cargado');
            return;
        }

        this.logApiCall('info', 'IntersectionObserver habilitado - configurando carga por viewport');
        this.setupViewportLoad();
    }

    static disableIntersectionObserver() {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
            intersectionObserver = null;
            this.logApiCall('info', 'IntersectionObserver deshabilitado - desconectado');
        }
    }

    static setupViewportLoad() {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
        }

        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isMapLoaded && !isMapLoading && intersectionObserverEnabled) {
                    this.logApiCall('info', 'Mapa entró al viewport - iniciando carga automática');
                    LazyMapLoader.initializeInteractiveMap();
                    intersectionObserver.disconnect();
                }
            });
        }, {
            threshold: 0.1
        });

        const mapContainer = document.getElementById('static-map-container');
        if (mapContainer) {
            intersectionObserver.observe(mapContainer);
            this.logApiCall('info', 'IntersectionObserver configurado - observando contenedor del mapa');
        }
    }

    static logApiCall(type, message) {
        RateLimiter.logApiCall(type, message, 0);
    }
}

// ===== SISTEMA DE UI Y EVENTOS =====
class UIManager {
    static initializeEventListeners() {
        // Botón de geocoding individual
        const geocodingBtn = document.getElementById('geocoding-btn');
        const geocodingInput = document.getElementById('geocoding-input');
        
        if (geocodingBtn && geocodingInput) {
            geocodingBtn.addEventListener('click', () => {
                this.handleSingleGeocoding(geocodingInput.value);
            });
            
            geocodingInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSingleGeocoding(geocodingInput.value);
                }
            });
        }

        // Botón de geocoding en lote
        const batchBtn = document.getElementById('batch-geocoding-btn');
        const batchInput = document.getElementById('batch-input');
        
        if (batchBtn && batchInput) {
            batchBtn.addEventListener('click', () => {
                this.handleBatchGeocoding(batchInput.value);
            });
        }

        // Botón de limpiar logs
        const clearLogsBtn = document.getElementById('clear-logs');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                this.clearLogs();
            });
        }

        // Botón de limpiar configuración
        const clearSettingsBtn = document.getElementById('clear-settings-btn');
        if (clearSettingsBtn) {
            clearSettingsBtn.addEventListener('click', () => {
                this.clearSettings();
            });
        }

        // Switch de clusterización de marcadores
        const clusteringSwitch = document.getElementById('marker-clustering-switch');
        const clusteringDescription = document.getElementById('clustering-description');
        
        if (clusteringSwitch && clusteringDescription) {
            // Cargar estado guardado
            clusteringEnabled = PersistenceManager.loadMarkerClusteringState();
            clusteringSwitch.checked = clusteringEnabled;
            this.updateClusteringDescription();
            
            // Event listener
            clusteringSwitch.addEventListener('change', (e) => {
                clusteringEnabled = e.target.checked;
                this.updateClusteringDescription();
                
                // Guardar estado
                PersistenceManager.saveMarkerClusteringState(clusteringEnabled);
                
                // Aplicar cambio
                MarkerClusterManager.toggleClustering(clusteringEnabled);
            });
        }

    }

    static async handleSingleGeocoding(address) {
        if (!address.trim()) return;
        
        this.addResult('info', `Geocodificando: ${address}`);
        
        // Cargar mapa interactivo si no está cargado
        if (!isMapLoaded && !isMapLoading) {
            this.addResult('info', 'Activando mapa interactivo...');
            await LazyMapLoader.initializeInteractiveMap();
        }
        
        try {
            const result = await GeocodingService.geocodeAddress(address);
            const location = result.results[0]?.geometry?.location;
            
            if (location) {
                this.addResult('success', `Coordenadas encontradas: ${location.lat}, ${location.lng}`);
                
                // Actualizar mapa si está cargado
                if (map) {
                    map.setCenter(location);
                    MarkerClusterManager.addMarker(location, address, address);
                }
            } else {
                this.addResult('error', 'No se encontraron coordenadas para esta dirección');
            }
        } catch (error) {
            this.addResult('error', `Error: ${error.message}`);
        }
    }

    static async handleBatchGeocoding(addressesText) {
        if (!addressesText.trim()) return;
        
        const addresses = addressesText.split(';').map(addr => addr.trim()).filter(addr => addr);
        
        if (addresses.length === 0) return;
        
        this.addResult('info', `Procesando lote de ${addresses.length} direcciones`);
        
        // Cargar mapa interactivo si no está cargado
        if (!isMapLoaded && !isMapLoading) {
            this.addResult('info', 'Activando mapa interactivo...');
            await LazyMapLoader.initializeInteractiveMap();
        }
        
        try {
            const { results, errors } = await GeocodingService.batchGeocodeAddresses(addresses);
            
            results.forEach(({ address, result }) => {
                const location = result.results[0]?.geometry?.location;
                if (location) {
                    this.addResult('success', `${address}: ${location.lat}, ${location.lng}`);
                    
                    // Agregar marcador al mapa si está cargado
                    if (map) {
                        MarkerClusterManager.addMarker(location, address, address);
                    }
                }
            });
            
            errors.forEach(({ address, error }) => {
                this.addResult('error', `${address}: ${error}`);
            });
            
        } catch (error) {
            this.addResult('error', `Error en procesamiento por lotes: ${error.message}`);
        }
    }

    static addResult(type, message) {
        const resultsContainer = document.getElementById('api-results');
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${type}`;
        resultItem.textContent = message;
        
        resultsContainer.appendChild(resultItem);
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    static clearLogs() {
        const logsContainer = document.getElementById('api-logs');
        logsContainer.innerHTML = '';
    }

    static clearSettings() {
        if (confirm('¿Estás seguro de que quieres limpiar toda la configuración guardada? Esto reseteará ambos switches a su estado por defecto.')) {
            // Limpiar localStorage
            PersistenceManager.clearAllSettings();
            
            // Resetear estados
            intersectionObserverEnabled = false;
            clusteringEnabled = true;
            
            // Actualizar UI
            const switchElement = document.getElementById('intersection-observer-switch');
            const clusteringSwitch = document.getElementById('marker-clustering-switch');
            
            if (switchElement) {
                switchElement.checked = false;
            }
            if (clusteringSwitch) {
                clusteringSwitch.checked = true;
            }
            
            // Deshabilitar IntersectionObserver si está activo
            IntersectionObserverManager.disableIntersectionObserver();
            
            // Aplicar clusterización por defecto
            MarkerClusterManager.toggleClustering(true);
            
            // Actualizar descripciones
            IntersectionObserverManager.updateDescription();
            this.updateClusteringDescription();
            
            this.addResult('info', 'Configuración limpiada - switches reseteados a estado por defecto');
        }
    }

    static updateClusteringDescription() {
        const descriptionElement = document.getElementById('clustering-description');
        if (descriptionElement) {
            if (clusteringEnabled) {
                descriptionElement.textContent = 'Agrupa marcadores cercanos para mejor rendimiento';
            } else {
                descriptionElement.textContent = 'Marcadores individuales - sin agrupación';
            }
        }
    }

    static updateDeviceInfo() {
        document.getElementById('screen-width').textContent = DeviceDetector.getScreenWidth();
        document.getElementById('connection-type').textContent = DeviceDetector.getConnectionType();
        document.getElementById('render-mode').textContent = DeviceDetector.getRenderMode();
    }
}

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
class App {
    static async initialize() {
        try {
            // Actualizar información del dispositivo
            UIManager.updateDeviceInfo();
            
            // Cargar Static Map como placeholder
            await StaticMapManager.loadStaticMap();
            
            // Configurar IntersectionObserver con switch
            IntersectionObserverManager.setupIntersectionObserver();
            
            // Inicializar event listeners
            UIManager.initializeEventListeners();
            
            // Actualizar métricas iniciales
            RateLimiter.updateMetricsUI();
            
            console.log('✅ Aplicación inicializada correctamente');
            console.log('ℹ️ El mapa interactivo se activará al realizar geocodificación');
            console.log('⚙️ Usa el switch para habilitar carga automática por viewport');
            console.log('💾 La configuración del switch se guarda automáticamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
        }
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
});

// ===== EXPORTAR PARA USO GLOBAL =====
window.GeocodingService = GeocodingService;
window.CacheManager = CacheManager;
window.RateLimiter = RateLimiter;
