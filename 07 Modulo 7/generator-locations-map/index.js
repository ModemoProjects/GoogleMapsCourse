/**
 * Generador de Ubicaciones Verificadas
 * Aplicación web para generar ubicaciones aleatorias con direcciones completas verificadas
 * usando las APIs de Google Maps (Maps JavaScript API, Geocoding API, Places API)
 */

// Variables globales
let map = null;
let geocoder = null;
let markers = [];
let searchInProgress = false;
let searchCancelled = false;

// Configuración de áreas predefinidas
const AREAS_CONFIG = {
    'mexico-city': {
        center: { lat: 19.4326, lng: -99.1332 },
        radius: 15
    },
    'guadalajara': {
        center: { lat: 20.6597, lng: -103.3496 },
        radius: 12
    },
    'monterrey': {
        center: { lat: 25.6866, lng: -100.3161 },
        radius: 10
    },
    'leon': {
        center: { lat: 21.1230729, lng: -101.6650775 },
        radius: 12
    }
};

// Estadísticas de búsqueda
const searchStats = {
    apiCalls: 0,
    verified: 0,
    failed: 0,
    totalTime: 0,
    startTime: null
};

// Cache para evitar consultas repetidas
const geocodeCache = new Map();

// Configuración de concurrencia y reintentos
const CONFIG = {
    MAX_CONCURRENT_REQUESTS: 3,
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000, // 1 segundo base
    MAX_ATTEMPTS_PER_LOCATION: 10
};

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateStatusDisplay();
});

/**
 * Configuración de event listeners para la interfaz
 */
function initializeEventListeners() {
    // Botón de búsqueda
    document.getElementById('searchBtn').addEventListener('click', startSearch);
    
    // Botón de cancelación
    document.getElementById('cancelBtn').addEventListener('click', cancelSearch);
    
    // Botón de exportación
    document.getElementById('exportBtn').addEventListener('click', exportToJSON);
    
    // Cambio en el área de búsqueda
    document.getElementById('searchArea').addEventListener('change', toggleCustomAreaConfig);
    
    // Validación de entrada en tiempo real
    document.getElementById('numLocations').addEventListener('input', validateInputs);
}

/**
 * Alternar la configuración de área personalizada
 */
function toggleCustomAreaConfig() {
    const customConfig = document.getElementById('customAreaConfig');
    const searchArea = document.getElementById('searchArea').value;
    
    if (searchArea === 'custom') {
        customConfig.style.display = 'block';
    } else {
        customConfig.style.display = 'none';
    }
}

/**
 * Validar las entradas del usuario
 */
function validateInputs() {
    const numLocations = parseInt(document.getElementById('numLocations').value);
    const searchBtn = document.getElementById('searchBtn');
    
    if (numLocations && numLocations > 0 && numLocations <= 100) {
        searchBtn.disabled = false;
    } else {
        searchBtn.disabled = true;
    }
}

/**
 * Obtener la configuración del área de búsqueda
 */
function getSearchAreaConfig() {
    const searchArea = document.getElementById('searchArea').value;
    
    if (searchArea === 'custom') {
        return {
            center: {
                lat: parseFloat(document.getElementById('centerLat').value) || 19.4326,
                lng: parseFloat(document.getElementById('centerLng').value) || -99.1332
            },
            radius: parseInt(document.getElementById('radius').value) || 10
        };
    }
    
    return AREAS_CONFIG[searchArea] || AREAS_CONFIG['mexico-city'];
}

/**
 * Generar coordenadas aleatorias dentro del área especificada
 * @param {Object} areaConfig - Configuración del área (center, radius)
 * @param {number} count - Número de coordenadas a generar
 * @returns {Array} Array de coordenadas {lat, lng}
 */
function generateRandomCoordinates(areaConfig, count) {
    const coordinates = [];
    const { center, radius } = areaConfig;
    
    // Convertir radio de km a grados (aproximado)
    const latRange = radius / 111; // 1 grado de latitud ≈ 111 km
    const lngRange = radius / (111 * Math.cos(center.lat * Math.PI / 180));
    
    for (let i = 0; i < count; i++) {
        // Generar coordenadas aleatorias dentro del área circular
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;
        
        const lat = center.lat + (distance / 111) * Math.cos(angle);
        const lng = center.lng + (distance / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
        
        coordinates.push({ lat, lng });
    }
    
    return coordinates;
}

/**
 * Realizar reverse geocoding con manejo de errores y reintentos
 * @param {Object} coordinate - Coordenada {lat, lng}
 * @param {number} retryCount - Número de reintentos realizados
 * @returns {Promise<Object|null>} Resultado del geocoding o null si falla
 */
async function performReverseGeocoding(coordinate, retryCount = 0) {
    const cacheKey = `${coordinate.lat.toFixed(4)},${coordinate.lng.toFixed(4)}`;
    
    // Verificar cache primero
    if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey);
    }
    
    try {
        const startTime = Date.now();
        
        // Crear instancia de Geocoder si no existe
        if (!geocoder) {
            const { Geocoder } = await google.maps.importLibrary("geocoding");
            geocoder = new Geocoder();
        }
        
        const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: coordinate }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                    resolve(results[0]);
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Actualizar estadísticas
        searchStats.apiCalls++;
        searchStats.totalTime += responseTime;
        
        // Cachear resultado
        geocodeCache.set(cacheKey, result);
        
        return result;
        
    } catch (error) {
        console.warn(`Error en reverse geocoding (intento ${retryCount + 1}):`, error);
        
        // Implementar backoff exponencial para reintentos
        if (retryCount < CONFIG.MAX_RETRIES) {
            const delay = CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));
            return performReverseGeocoding(coordinate, retryCount + 1);
        }
        
        searchStats.failed++;
        return null;
    }
}

/**
 * Validar si una dirección tiene todos los componentes requeridos
 * @param {Object} geocodeResult - Resultado del geocoding
 * @returns {Object} Objeto con validación y componentes extraídos
 */
function validateAddressComponents(geocodeResult) {
    const requiredComponents = [
        'street_number',
        'route',
        'locality',
        'administrative_area_level_1',
        'country',
        'postal_code'
    ];
    
    const addressComponents = geocodeResult.address_components || [];
    const extractedComponents = {};
    
    // Extraer componentes de la dirección
    addressComponents.forEach(component => {
        component.types.forEach(type => {
            if (requiredComponents.includes(type)) {
                extractedComponents[type] = component.long_name;
            }
        });
    });
    
    // Verificar que todos los componentes requeridos estén presentes
    const isValid = requiredComponents.every(component => 
        extractedComponents[component] && extractedComponents[component].trim() !== ''
    );
    
    return {
        isValid,
        components: extractedComponents,
        formattedAddress: geocodeResult.formatted_address
    };
}

/**
 * Procesar coordenadas en lotes con límite de concurrencia
 * @param {Array} coordinates - Array de coordenadas a procesar
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Array>} Array de ubicaciones verificadas
 */
async function processCoordinatesInBatches(coordinates, onProgress) {
    const verifiedLocations = [];
    const batchSize = CONFIG.MAX_CONCURRENT_REQUESTS;
    
    for (let i = 0; i < coordinates.length; i += batchSize) {
        if (searchCancelled) break;
        
        const batch = coordinates.slice(i, i + batchSize);
        const batchPromises = batch.map(async (coordinate) => {
            if (searchCancelled) return null;
            
            // Intentar hasta MAX_ATTEMPTS_PER_LOCATION veces
            for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS_PER_LOCATION; attempt++) {
                if (searchCancelled) return null;
                
                const geocodeResult = await performReverseGeocoding(coordinate);
                if (!geocodeResult) continue;
                
                const validation = validateAddressComponents(geocodeResult);
                if (validation.isValid) {
                    searchStats.verified++;
                    return {
                        lat: coordinate.lat,
                        lng: coordinate.lng,
                        direccion: validation.formattedAddress,
                        componentes: validation.components,
                        estado: 'Verificada'
                    };
                }
            }
            
            searchStats.failed++;
            return null;
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(result => result !== null);
        verifiedLocations.push(...validResults);
        
        // Actualizar progreso
        const progress = Math.min(100, (verifiedLocations.length / parseInt(document.getElementById('numLocations').value)) * 100);
        onProgress(progress, verifiedLocations.length);
        
        // Pequeña pausa entre lotes para evitar rate limiting
        if (i + batchSize < coordinates.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return verifiedLocations;
}

/**
 * Inicializar el mapa de Google Maps (carga diferida)
 */
async function initializeMap() {
    if (map) return; // El mapa ya está inicializado
    
    try {
        const { Map } = await google.maps.importLibrary("maps");
        
        // Obtener configuración del área de búsqueda
        const areaConfig = getSearchAreaConfig();
        
        map = new Map(document.getElementById("map"), {
            center: areaConfig.center,
            zoom: 12,
            mapTypeId: 'roadmap',
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });
        
        // Limpiar placeholder
        const mapElement = document.getElementById('map');
        mapElement.innerHTML = '';
        mapElement.style.background = 'transparent';
        
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        showNotification('Error al cargar el mapa de Google Maps', 'error');
    }
}

/**
 * Agregar marcadores al mapa
 * @param {Array} locations - Array de ubicaciones verificadas
 */
function addMarkersToMap(locations) {
    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    if (!map || locations.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    locations.forEach((location, index) => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.direccion,
            label: (index + 1).toString(),
            animation: google.maps.Animation.DROP
        });
        
        // InfoWindow con detalles de la ubicación
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 300px;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Ubicación ${index + 1}</h4>
                    <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.4;">${location.direccion}</p>
                    <div style="font-size: 12px; color: #7f8c8d;">
                        <strong>Coordenadas:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
                    </div>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
        bounds.extend(marker.getPosition());
    });
    
    // Ajustar la vista del mapa para mostrar todos los marcadores
    if (locations.length > 1) {
        map.fitBounds(bounds);
    } else if (locations.length === 1) {
        map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
        map.setZoom(15);
    }
}

/**
 * Mostrar ubicaciones en la lista de resultados
 * @param {Array} locations - Array de ubicaciones verificadas
 */
function displayResults(locations) {
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = `${locations.length} ubicaciones`;
    
    if (locations.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results">
                <p>No se encontraron ubicaciones verificadas.</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = locations.map((location, index) => `
        <div class="result-item">
            <div class="result-header">
                <span class="result-coords">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</span>
                <span class="result-status">${location.estado}</span>
            </div>
            <div class="result-address">${location.direccion}</div>
            <div class="result-components">
                <strong>Componentes:</strong><br>
                ${Object.entries(location.componentes).map(([key, value]) => 
                    `<span style="margin-right: 10px;"><strong>${key}:</strong> ${value}</span>`
                ).join('<br>')}
            </div>
        </div>
    `).join('');
}

/**
 * Actualizar la visualización del estado de búsqueda
 */
function updateStatusDisplay() {
    document.getElementById('apiCalls').textContent = searchStats.apiCalls;
    document.getElementById('verifiedCount').textContent = searchStats.verified;
    document.getElementById('failedCount').textContent = searchStats.failed;
    
    const avgTime = searchStats.apiCalls > 0 ? 
        Math.round(searchStats.totalTime / searchStats.apiCalls) : 0;
    document.getElementById('avgTime').textContent = `${avgTime}ms`;
}

/**
 * Actualizar la barra de progreso
 * @param {number} progress - Porcentaje de progreso (0-100)
 * @param {number} verifiedCount - Número de ubicaciones verificadas
 */
function updateProgress(progress, verifiedCount) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
    
    updateStatusDisplay();
}

/**
 * Iniciar la búsqueda de ubicaciones
 */
async function startSearch() {
    if (searchInProgress) return;
    
    // Validar entradas
    const numLocations = parseInt(document.getElementById('numLocations').value);
    if (!numLocations || numLocations < 1 || numLocations > 100) {
        showNotification('Por favor, ingresa un número válido de ubicaciones (1-100)', 'error');
        return;
    }
    
    // Reiniciar estado
    searchInProgress = true;
    searchCancelled = false;
    resetSearchStats();
    
    // Actualizar UI
    document.getElementById('searchBtn').disabled = true;
    document.getElementById('cancelBtn').disabled = false;
    document.getElementById('exportBtn').disabled = true;
    
    // Limpiar resultados anteriores
    document.getElementById('resultsList').innerHTML = `
        <div class="no-results">
            <p>Buscando ubicaciones verificadas...</p>
        </div>
    `;
    
    try {
        // Inicializar mapa (carga diferida)
        await initializeMap();
        
        // Obtener configuración del área
        const areaConfig = getSearchAreaConfig();
        
        // Generar coordenadas aleatorias (más de las necesarias para compensar fallos)
        const totalCoordinates = Math.min(numLocations * 3, 200); // Límite de seguridad
        const coordinates = generateRandomCoordinates(areaConfig, totalCoordinates);
        
        showNotification(`Iniciando búsqueda de ${numLocations} ubicaciones verificadas...`, 'info');
        
        // Procesar coordenadas en lotes
        const verifiedLocations = await processCoordinatesInBatches(
            coordinates, 
            updateProgress
        );
        
        if (searchCancelled) {
            showNotification('Búsqueda cancelada por el usuario', 'warning');
            return;
        }
        
        // Mostrar resultados
        displayResults(verifiedLocations);
        addMarkersToMap(verifiedLocations);
        
        // Habilitar exportación si hay resultados
        if (verifiedLocations.length > 0) {
            document.getElementById('exportBtn').disabled = false;
            showNotification(
                `Búsqueda completada: ${verifiedLocations.length} ubicaciones verificadas encontradas`, 
                'success'
            );
        } else {
            showNotification('No se encontraron ubicaciones verificadas. Intenta con un área diferente.', 'warning');
        }
        
    } catch (error) {
        console.error('Error durante la búsqueda:', error);
        showNotification('Error durante la búsqueda. Verifica tu conexión y configuración.', 'error');
    } finally {
        // Restaurar estado de UI
        searchInProgress = false;
        document.getElementById('searchBtn').disabled = false;
        document.getElementById('cancelBtn').disabled = true;
    }
}

/**
 * Cancelar la búsqueda en progreso
 */
function cancelSearch() {
    searchCancelled = true;
    searchInProgress = false;
    
    document.getElementById('searchBtn').disabled = false;
    document.getElementById('cancelBtn').disabled = true;
    
    showNotification('Cancelando búsqueda...', 'warning');
}

/**
 * Reiniciar estadísticas de búsqueda
 */
function resetSearchStats() {
    searchStats.apiCalls = 0;
    searchStats.verified = 0;
    searchStats.failed = 0;
    searchStats.totalTime = 0;
    searchStats.startTime = Date.now();
    
    updateStatusDisplay();
    updateProgress(0, 0);
}

/**
 * Exportar resultados a archivo JSON
 */
function exportToJSON() {
    const resultsList = document.getElementById('resultsList');
    const resultItems = resultsList.querySelectorAll('.result-item');
    
    if (resultItems.length === 0) {
        showNotification('No hay resultados para exportar', 'warning');
        return;
    }
    
    // Extraer datos de los elementos DOM
    const exportData = Array.from(resultItems).map((item, index) => {
        const coords = item.querySelector('.result-coords').textContent.split(', ');
        const address = item.querySelector('.result-address').textContent;
        
        // Extraer componentes del texto
        const componentsText = item.querySelector('.result-components').textContent;
        const components = {};
        
        // Parsear componentes (formato: "key: value")
        const componentMatches = componentsText.match(/(\w+):\s*([^,\n]+)/g);
        if (componentMatches) {
            componentMatches.forEach(match => {
                const [key, value] = match.split(': ').map(s => s.trim());
                components[key] = value;
            });
        }
        
        return {
            lat: parseFloat(coords[0]),
            lng: parseFloat(coords[1]),
            direccion: address,
            componentes: components,
            estado: 'Verificada'
        };
    });
    
    // Crear y descargar archivo JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ubicaciones_verificadas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    showNotification(`Archivo JSON descargado: ${exportData.length} ubicaciones`, 'success');
}

/**
 * Mostrar notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos de notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        maxWidth: '400px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Colores según tipo
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Inicialización automática
console.log('Generador de Ubicaciones Verificadas - Aplicación inicializada');
