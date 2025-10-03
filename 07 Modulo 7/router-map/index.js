// Planificador de Rutas - Google Maps JavaScript API
// Implementación completa con servicios de Places, Geocoding, Directions y Distance Matrix

let map;
let geocoder;
let placesService;
let directionsService;
let directionsRenderer;

// Estado de la aplicación
const appState = {
    locations: [],
    origin: null,
    routes: [],
    markers: [],
    polylines: [],
    isGenerating: false,
    cache: new Map() // Cache para evitar llamadas repetidas a la API
};

// Colores para las rutas de agentes (más contrastantes)
const routeColors = [
    '#FF0000', // Rojo brillante
    '#0000FF', // Azul brillante
    '#00FF00', // Verde brillante
    '#FF8000', // Naranja brillante
    '#8000FF', // Morado brillante
    '#00FFFF', // Cian brillante
    '#FFFF00', // Amarillo brillante
    '#FF0080', // Rosa brillante
    '#0080FF', // Azul claro brillante
    '#80FF00'  // Verde lima brillante
];

// Inicialización del mapa y servicios
async function initMap() {
    try {
    const { Map } = await google.maps.importLibrary("maps");
        const { Geocoder } = await google.maps.importLibrary("geocoding");
        const { PlacesService } = await google.maps.importLibrary("places");
        const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");

        // Inicializar mapa
    map = new Map(document.getElementById("map"), {
            center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
        zoom: 11,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        // Inicializar servicios
        geocoder = new Geocoder();
        placesService = new PlacesService(map);
        directionsService = new DirectionsService();
        directionsRenderer = new DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: true
        });
        directionsRenderer.setMap(map);

        // Configurar eventos
        setupEventListeners();
        
        console.log('Mapa y servicios inicializados correctamente');
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        showError('Error al cargar Google Maps. Verifica tu conexión a internet.');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Carga de ubicaciones desde archivo
    document.getElementById('json-file').addEventListener('change', handleFileLoad);
    
    // Carga de ubicaciones desde textarea
    document.getElementById('load-locations').addEventListener('click', loadLocationsFromTextarea);
    
    // Establecer origen
    document.getElementById('set-origin').addEventListener('click', setOrigin);
    
    // Generar rutas
    document.getElementById('generate-routes').addEventListener('click', generateRoutes);
    
    // Exportar rutas
    document.getElementById('export-routes').addEventListener('click', exportRoutes);
    
    // Centrar en todas las rutas
    document.getElementById('center-all').addEventListener('click', centerAllRoutes);
    
    // Limpiar rutas del mapa
    document.getElementById('clear-routes').addEventListener('click', clearRoutesFromMap);
    
    // Toggle clusters
    document.getElementById('toggle-clusters').addEventListener('click', toggleClusters);
    
    // Toggle clusters por agente
    document.getElementById('toggle-agent-clusters').addEventListener('click', toggleAgentClusters);
    
    // Validar campos en tiempo real
    document.getElementById('agents-count').addEventListener('input', validateForm);
    document.getElementById('work-hours').addEventListener('input', validateForm);
}

// Manejar carga de archivo JSON
function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            loadLocations(jsonData);
        } catch (error) {
            showError('Error al parsear el archivo JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Cargar ubicaciones desde textarea
function loadLocationsFromTextarea() {
    const textarea = document.getElementById('json-textarea');
    const jsonText = textarea.value.trim();
    
    if (!jsonText) {
        showError('Por favor ingresa datos JSON válidos');
        return;
    }

    try {
        const jsonData = JSON.parse(jsonText);
        loadLocations(jsonData);
    } catch (error) {
        showError('Error al parsear JSON: ' + error.message);
    }
}

// Cargar y validar ubicaciones
function loadLocations(locations) {
    if (!Array.isArray(locations)) {
        showError('El JSON debe ser un array de ubicaciones');
        return;
    }

    // Validar estructura de cada ubicación
    const validLocations = locations.filter((location, index) => {
        if (!location.lat || !location.lng || !location.direccion) {
            console.warn(`Ubicación ${index + 1} omitida: faltan campos requeridos`);
            return false;
        }
        
        if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            console.warn(`Ubicación ${index + 1} omitida: coordenadas inválidas`);
            return false;
        }
        
        return true;
    });

    if (validLocations.length === 0) {
        showError('No se encontraron ubicaciones válidas');
        return;
    }

    // Advertencia para muchas ubicaciones
    if (validLocations.length > 100) {
        showError(`Advertencia: ${validLocations.length} ubicaciones pueden causar procesamiento lento. Se recomienda máximo 100 ubicaciones.`);
    }

    // Limpiar marcadores anteriores
    clearMarkers();
    
    // Guardar ubicaciones válidas
    appState.locations = validLocations;
    
    // Crear marcadores en el mapa
    createLocationMarkers(validLocations);
    
    // Actualizar UI
    updateLocationCount(validLocations.length);
    validateForm();
    
    showSuccess(`${validLocations.length} ubicaciones cargadas correctamente`);
    
    // Centrar mapa en las ubicaciones
    centerMapOnLocations(validLocations);
}

// Crear marcadores para las ubicaciones
function createLocationMarkers(locations) {
    locations.forEach((location, index) => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.direccion,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        // Crear info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="custom-tooltip">
                    <strong>Ubicación ${index + 1}</strong><br>
                    ${location.direccion}<br>
                    <small>Estado: ${location.estado || 'No especificado'}</small>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        appState.markers.push(marker);
    });
}

// Establecer ubicación inicial
async function setOrigin() {
    const originInput = document.getElementById('origin-input').value.trim();
    
    if (!originInput) {
        showError('Por favor ingresa una dirección o coordenadas');
        return;
    }

    try {
        showProgress('Geocodificando ubicación inicial...');
        
        let originLocation;
        
        // Verificar si es coordenadas (lat,lng)
        const coordMatch = originInput.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
            originLocation = {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2])
            };
        } else {
            // Geocodificar dirección
            originLocation = await geocodeAddress(originInput);
        }

        if (!originLocation) {
            showError('No se pudo encontrar la ubicación especificada');
            return;
        }

        // Limpiar marcador de origen anterior
        clearOriginMarker();
        
        // Crear marcador de origen (azul)
        const originMarker = new google.maps.Marker({
            position: originLocation,
            map: map,
            title: 'Ubicación Inicial',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
            }
        });

        appState.origin = originLocation;
        appState.originMarker = originMarker;
        
        // Centrar mapa en el origen
        map.setCenter(originLocation);
        map.setZoom(13);
        
        hideProgress();
        showSuccess('Ubicación inicial establecida correctamente');
        validateForm();
        
    } catch (error) {
        hideProgress();
        showError('Error al establecer ubicación inicial: ' + error.message);
    }
}

// Geocodificar dirección
async function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lng: location.lng()
                });
            } else {
                reject(new Error('Geocodificación falló: ' + status));
            }
        });
    });
}

// Generar rutas usando algoritmo de optimización heurística
async function generateRoutes() {
    if (appState.isGenerating) return;
    
    const agentsCount = parseInt(document.getElementById('agents-count').value);
    const workHours = parseFloat(document.getElementById('work-hours').value);
    const travelMode = document.getElementById('travel-mode').value;
    const useTraffic = document.getElementById('use-traffic').checked;

    if (!validateForm()) return;

    appState.isGenerating = true;
    showProgress('Generando rutas optimizadas...');
    
    try {
        // Limpiar rutas anteriores
        clearRoutes();
        
        // Pre-clustering de puntos por número de agentes
        const clusters = preClusterLocations(appState.locations, agentsCount);
        
        // Generar rutas para cada agente
        const routes = [];
        let totalProgress = 0;
        
        for (let i = 0; i < agentsCount; i++) {
            const cluster = clusters[i] || [];
            if (cluster.length === 0) {
                console.warn(`Agente ${i + 1}: Sin ubicaciones asignadas`);
                totalProgress++;
                continue;
            }
            
            updateProgress(`Agente ${i + 1}: Agregando ubicaciones más cercanas consecutivamente (${cluster.length} disponibles)...`, (totalProgress / agentsCount) * 100);
            
            const route = await generateAgentRoute(
                cluster, 
                appState.origin, 
                workHours, 
                travelMode, 
                useTraffic,
                i
            );
            
            if (route) {
                routes.push(route);
                drawRoute(route, i);
                console.log(`Agente ${i + 1}: Ruta creada exitosamente con ${route.stops.length} paradas`);
            } else {
                console.warn(`Agente ${i + 1}: No se pudo crear ruta`);
            }
            
            // Limpiar marcadores de clusters después del primer agente
            if (i === 0 && appState.clusterMarkers) {
                appState.clusterMarkers.forEach(marker => marker.setMap(null));
                appState.clusterMarkers = [];
            }
            
            totalProgress++;
        }
        
        appState.routes = routes;
        
        // Actualizar UI
        updateRoutesControls(routes);
        updateSummary(routes);
        showRoutesControls();
        
        hideProgress();
        
        // Calcular estadísticas de cobertura
        const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
        const totalLocations = appState.locations.length;
        const coveragePercentage = ((totalStops / totalLocations) * 100).toFixed(1);
        
        // Mostrar mensaje de éxito con información de cobertura
        if (routes.length === agentsCount) {
            showSuccess(`${routes.length} rutas generadas - ${totalStops}/${totalLocations} ubicaciones cubiertas (${coveragePercentage}%)`);
        } else if (routes.length > 0) {
            const failedAgents = agentsCount - routes.length;
            showSuccess(`${routes.length} rutas generadas - ${totalStops}/${totalLocations} ubicaciones cubiertas (${coveragePercentage}%). ${failedAgents} agente(s) sin ruta.`);
            showSuggestions(agentsCount, routes.length, workHours);
        } else {
            showError('No se pudieron generar rutas. Revisa los parámetros.');
            showSuggestions(agentsCount, routes.length, workHours);
        }
        
    } catch (error) {
        hideProgress();
        showError('Error al generar rutas: ' + error.message);
    } finally {
        appState.isGenerating = false;
    }
}

// Pre-clustering basado en proximidad geográfica
function preClusterLocations(locations, k) {
    if (locations.length <= k) {
        return locations.map(loc => [loc]);
    }
    
    console.log(`Creando ${k} clusters geográficos para ${locations.length} ubicaciones`);
    
    // Usar algoritmo K-means geográfico
    const clusters = kMeansClustering(locations, k);
    
    // Mostrar información de clusters
    clusters.forEach((cluster, index) => {
        console.log(`Cluster ${index + 1}: ${cluster.length} ubicaciones`);
    });
    
    // Guardar clusters en el estado
    appState.clusters = clusters;
    
    // Visualizar clusters en el mapa
    visualizeClusters(clusters);
    
    // Validar clusters
    validateClusters(clusters, k);
    
    return clusters;
}

// Algoritmo K-means para clustering geográfico
function kMeansClustering(locations, k) {
    // Inicializar centroides aleatoriamente
    let centroids = initializeCentroids(locations, k);
    let clusters = Array(k).fill().map(() => []);
    let maxIterations = 10;
    let iteration = 0;
    
    while (iteration < maxIterations) {
        // Asignar cada ubicación al centroide más cercano
        clusters = Array(k).fill().map(() => []);
        
        locations.forEach(location => {
            let closestCentroidIndex = 0;
            let minDistance = Infinity;
            
            centroids.forEach((centroid, index) => {
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(location.lat, location.lng),
                    new google.maps.LatLng(centroid.lat, centroid.lng)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroidIndex = index;
                }
            });
            
            clusters[closestCentroidIndex].push(location);
        });
        
        // Calcular nuevos centroides
        const newCentroids = clusters.map(cluster => {
            if (cluster.length === 0) {
                // Si el cluster está vacío, mantener el centroide anterior
                return centroids[clusters.indexOf(cluster)];
            }
            
            const avgLat = cluster.reduce((sum, loc) => sum + loc.lat, 0) / cluster.length;
            const avgLng = cluster.reduce((sum, loc) => sum + loc.lng, 0) / cluster.length;
            
            return { lat: avgLat, lng: avgLng };
        });
        
        // Verificar convergencia
        let converged = true;
        for (let i = 0; i < k; i++) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(centroids[i].lat, centroids[i].lng),
                new google.maps.LatLng(newCentroids[i].lat, newCentroids[i].lng)
            );
            
            if (distance > 100) { // 100 metros de tolerancia
                converged = false;
                break;
            }
        }
        
        if (converged) {
            console.log(`K-means convergió en ${iteration + 1} iteraciones`);
            break;
        }
        
        centroids = newCentroids;
        iteration++;
    }
    
    // Balancear clusters si hay desequilibrios extremos
    clusters = balanceClusters(clusters, k);
    
    return clusters;
}

// Inicializar centroides usando método K-means++
function initializeCentroids(locations, k) {
    const centroids = [];
    
    // Primer centroide aleatorio
    const firstIndex = Math.floor(Math.random() * locations.length);
    centroids.push({ lat: locations[firstIndex].lat, lng: locations[firstIndex].lng });
    
    // Seleccionar centroides adicionales usando K-means++
    for (let i = 1; i < k; i++) {
        const distances = locations.map(location => {
            let minDistance = Infinity;
            
            centroids.forEach(centroid => {
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(location.lat, location.lng),
                    new google.maps.LatLng(centroid.lat, centroid.lng)
                );
                
                minDistance = Math.min(minDistance, distance);
            });
            
            return minDistance * minDistance; // Distancia al cuadrado
        });
        
        // Seleccionar ubicación con probabilidad proporcional a la distancia al cuadrado
        const totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
        let randomValue = Math.random() * totalDistance;
        
        for (let j = 0; j < locations.length; j++) {
            randomValue -= distances[j];
            if (randomValue <= 0) {
                centroids.push({ lat: locations[j].lat, lng: locations[j].lng });
                break;
            }
        }
    }
    
    return centroids;
}

// Balancear clusters para evitar desequilibrios extremos
function balanceClusters(clusters, k) {
    const maxIterations = 3;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const clusterSizes = clusters.map(cluster => cluster.length);
        const avgSize = clusterSizes.reduce((sum, size) => sum + size, 0) / k;
        
        // Buscar clusters muy desbalanceados
        for (let i = 0; i < k; i++) {
            for (let j = i + 1; j < k; j++) {
                const sizeDiff = Math.abs(clusterSizes[i] - clusterSizes[j]);
                
                // Si hay desbalance significativo (> 50% de diferencia)
                if (sizeDiff > avgSize * 0.5 && clusters[i].length > 0 && clusters[j].length > 0) {
                    // Intercambiar ubicaciones para balancear
                    if (clusterSizes[i] > clusterSizes[j]) {
                        const location = clusters[i].pop();
                        clusters[j].push(location);
                    } else {
                        const location = clusters[j].pop();
                        clusters[i].push(location);
                    }
                    
                    // Recalcular tamaños
                    clusterSizes[i] = clusters[i].length;
                    clusterSizes[j] = clusters[j].length;
                }
            }
        }
    }
    
    return clusters;
}

// Visualizar clusters en el mapa con diferentes colores
function visualizeClusters(clusters) {
    // Limpiar marcadores de clusters anteriores
    if (appState.clusterMarkers) {
        appState.clusterMarkers.forEach(marker => marker.setMap(null));
    }
    appState.clusterMarkers = [];
    
    // Colores para cada cluster (más contrastantes)
    const colors = [
        '#FF0000', // Rojo brillante
        '#0000FF', // Azul brillante
        '#00FF00', // Verde brillante
        '#FF8000', // Naranja brillante
        '#8000FF', // Morado brillante
        '#00FFFF', // Cian brillante
        '#FFFF00', // Amarillo brillante
        '#FF0080', // Rosa brillante
        '#0080FF', // Azul claro brillante
        '#80FF00'  // Verde lima brillante
    ];
    
    clusters.forEach((cluster, index) => {
        const color = colors[index % colors.length];
        
        // Crear marcadores para cada ubicación del cluster
        cluster.forEach(location => {
            const marker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: `${location.direccion} (Cluster ${index + 1})`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: color,
                    fillOpacity: 0.8,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                }
            });
            
            appState.clusterMarkers.push(marker);
        });
        
        // Crear círculo para mostrar el área del cluster
        if (cluster.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            cluster.forEach(location => {
                bounds.extend(new google.maps.LatLng(location.lat, location.lng));
            });
            
            const center = bounds.getCenter();
            const radius = Math.max(
                google.maps.geometry.spherical.computeDistanceBetween(
                    center, bounds.getNorthEast()
                ),
                500 // Radio mínimo de 500 metros
            );
            
            const circle = new google.maps.Circle({
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.1,
                map: map,
                center: center,
                radius: radius
            });
            
            appState.clusterMarkers.push(circle);
        }
    });
    
    console.log(`Clusters visualizados en el mapa con ${appState.clusterMarkers.length} elementos`);
}

// Validar que los clusters sean razonables
function validateClusters(clusters, k) {
    clusters.forEach((cluster, index) => {
        if (cluster.length === 0) {
            console.warn(`Cluster ${index + 1} está vacío. Considera reducir el número de agentes.`);
        } else if (cluster.length > 15) {
            console.warn(`Cluster ${index + 1} tiene ${cluster.length} ubicaciones. Puede ser difícil completar en el tiempo asignado.`);
        } else {
            console.log(`Cluster ${index + 1}: ${cluster.length} ubicaciones - OK`);
        }
    });
}


// Generar ruta para un agente específico
async function generateAgentRoute(locations, origin, maxHours, travelMode, useTraffic, agentIndex) {
    if (locations.length === 0) return null;
    
    try {
        // Calcular matriz de distancias (sin tráfico para optimización inicial)
        const distanceMatrix = await getDistanceMatrix(origin, locations, travelMode, false);
        
        // Optimizar orden de visitas usando nearest neighbor
        const optimizedOrder = optimizeVisitOrder(origin, locations, distanceMatrix, maxHours);
        
        if (optimizedOrder.length === 0) {
            // Intentar con menos ubicaciones o tiempo más flexible
            const fallbackOrder = createFallbackRoute(origin, locations, distanceMatrix, maxHours);
            
            if (fallbackOrder.length === 0) {
                console.warn(`Agente ${agentIndex + 1}: Ubicaciones muy lejanas o tiempo insuficiente. Considera aumentar las horas de trabajo o reducir el número de agentes.`);
                return null;
            } else {
                console.log(`Agente ${agentIndex + 1}: Ruta creada con ubicaciones más cercanas (${fallbackOrder.length}/${locations.length} ubicaciones)`);
                // Usar la ruta de respaldo
                const route = await getDirectionsRoute(origin, fallbackOrder, travelMode, useTraffic);
                
                if (route) {
                    route.agent = agentIndex + 1;
                    route.color = routeColors[agentIndex % routeColors.length];
                    route.mode = travelMode;
                    route.stops = fallbackOrder.map((loc, index) => ({
                        lat: loc.lat,
                        lng: loc.lng,
                        direccion: loc.direccion,
                        orden: index + 1
                    }));
                }
                
                return route;
            }
        }
        
        // Obtener ruta final con Directions API (con tráfico si está habilitado)
        const route = await getDirectionsRoute(origin, optimizedOrder, travelMode, useTraffic);
        
        if (route) {
            route.agent = agentIndex + 1;
            route.color = routeColors[agentIndex % routeColors.length];
            route.mode = travelMode;
            route.stops = optimizedOrder.map((loc, index) => ({
                lat: loc.lat,
                lng: loc.lng,
                direccion: loc.direccion,
                orden: index + 1
            }));
        }
        
        return route;
        
    } catch (error) {
        console.error(`Error generando ruta para agente ${agentIndex + 1}:`, error);
        return null;
    }
}

// Obtener matriz de distancias usando Distance Matrix API con procesamiento por lotes
async function getDistanceMatrix(origin, destinations, travelMode, useTraffic) {
    const cacheKey = `matrix_${origin.lat}_${origin.lng}_${destinations.length}_${travelMode}_${useTraffic}`;
    
    if (appState.cache.has(cacheKey)) {
        return appState.cache.get(cacheKey);
    }
    
    // Límite de Google Distance Matrix API: máximo 25 destinos por origen
    const MAX_DESTINATIONS = 25;
    
    if (destinations.length <= MAX_DESTINATIONS) {
        return await getDistanceMatrixBatch(origin, destinations, travelMode, useTraffic);
    } else {
        // Procesar en lotes si hay más de 25 destinos
        console.log(`Procesando ${destinations.length} destinos en lotes de ${MAX_DESTINATIONS}`);
        const batches = [];
        
        for (let i = 0; i < destinations.length; i += MAX_DESTINATIONS) {
            const batch = destinations.slice(i, i + MAX_DESTINATIONS);
            const batchNumber = Math.floor(i / MAX_DESTINATIONS) + 1;
            const totalBatches = Math.ceil(destinations.length / MAX_DESTINATIONS);
            
            console.log(`Procesando lote ${batchNumber}/${totalBatches} (${batch.length} destinos)`);
            const batchMatrix = await getDistanceMatrixBatch(origin, batch, travelMode, useTraffic);
            batches.push(batchMatrix);
        }
        
        // Combinar resultados de todos los lotes
        const combinedMatrix = batches.flat();
        appState.cache.set(cacheKey, combinedMatrix);
        return combinedMatrix;
    }
}

// Obtener matriz de distancias para un lote específico con retry y backoff
async function getDistanceMatrixBatch(origin, destinations, travelMode, useTraffic, retryCount = 0) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000 * Math.pow(2, retryCount); // Exponential backoff
    
    return new Promise((resolve, reject) => {
        const service = new google.maps.DistanceMatrixService();
        
        const request = {
            origins: [origin],
            destinations: destinations.map(dest => ({ lat: dest.lat, lng: dest.lng })),
            travelMode: travelMode,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        };
        
        // Nota: departureTime no es válida para DistanceMatrixService
        // Solo se puede usar con DirectionsService para obtener rutas con tráfico
        // El DistanceMatrixService usa tiempos promedio sin considerar tráfico actual
        
        service.getDistanceMatrix(request, (response, status) => {
            if (status === 'OK') {
                const matrix = response.rows[0].elements.map(element => ({
                    distance: element.distance.value,
                    duration: element.duration.value
                }));
                
                resolve(matrix);
            } else if (status === 'OVER_QUERY_LIMIT' && retryCount < MAX_RETRIES) {
                // Retry con backoff exponencial para OVER_QUERY_LIMIT
                console.log(`Retry ${retryCount + 1}/${MAX_RETRIES} después de ${RETRY_DELAY}ms`);
                setTimeout(() => {
                    getDistanceMatrixBatch(origin, destinations, travelMode, useTraffic, retryCount + 1)
                        .then(resolve)
                        .catch(reject);
                }, RETRY_DELAY);
            } else {
                reject(new Error('Distance Matrix API error: ' + status));
            }
        });
    });
}

// Optimizar orden de visitas para maximizar cobertura de puntos
function optimizeVisitOrder(origin, locations, distanceMatrix, maxHours) {
    const maxDurationSeconds = maxHours * 3600;
    
    // Algoritmo simple y efectivo: agregar ubicaciones más cercanas consecutivamente
    const route = consecutiveNearestNeighbor(origin, locations, distanceMatrix, maxDurationSeconds);
    
    return route;
}

// Algoritmo de vecino más cercano consecutivo
function consecutiveNearestNeighbor(origin, locations, distanceMatrix, maxDurationSeconds) {
    const route = [];
    const visited = new Set();
    let currentLocation = origin;
    let totalDuration = 0;
    
    console.log(`Iniciando algoritmo consecutivo para ${locations.length} ubicaciones con ${maxDurationSeconds/3600} horas disponibles`);
    
    // Ordenar ubicaciones por tiempo desde el origen
    const sortedLocations = locations.map((location, index) => ({
        location,
        index,
        distance: distanceMatrix[index].distance,
        duration: distanceMatrix[index].duration
    })).sort((a, b) => a.duration - b.duration);
    
    // Agregar ubicaciones una por una, empezando por la más cercana
    for (const { location, index, duration } of sortedLocations) {
        if (visited.has(index)) continue;
        
        // Para el primer punto, solo considerar el tiempo de ida + regreso
        // Para puntos adicionales, considerar el tiempo desde el punto anterior
        let timeToLocation;
        let timeFromLocationToOrigin;
        
        if (route.length === 0) {
            // Primer punto: tiempo desde origen + tiempo de regreso al origen
            timeToLocation = duration;
            timeFromLocationToOrigin = duration; // Asumir que el regreso toma el mismo tiempo
        } else {
            // Puntos adicionales: tiempo desde el punto anterior + tiempo de regreso al origen
            timeToLocation = duration; // Simplificado: usar tiempo desde origen
            timeFromLocationToOrigin = duration; // Simplificado: usar tiempo desde origen
        }
        
        const totalTimeIfAdded = totalDuration + timeToLocation + timeFromLocationToOrigin;
        
        console.log(`Evaluando ubicación ${index + 1}: ${location.direccion}`);
        console.log(`  - Tiempo al punto: ${Math.round(timeToLocation/60)} min`);
        console.log(`  - Tiempo de regreso: ${Math.round(timeFromLocationToOrigin/60)} min`);
        console.log(`  - Tiempo total si se agrega: ${Math.round(totalTimeIfAdded/60)} min`);
        console.log(`  - Tiempo disponible: ${Math.round(maxDurationSeconds/60)} min`);
        
        // Si esta ubicación cabe en el tiempo disponible
        if (totalTimeIfAdded <= maxDurationSeconds) {
            route.push(location);
            visited.add(index);
            totalDuration += timeToLocation;
            currentLocation = location;
            
            console.log(`✅ Agregada ubicación ${index + 1}. Tiempo restante: ${Math.round((maxDurationSeconds - totalTimeIfAdded)/60)} min`);
        } else {
            console.log(`❌ Ubicación ${index + 1} no cabe. Tiempo excedido por: ${Math.round((totalTimeIfAdded - maxDurationSeconds)/60)} min`);
            break; // No se pueden agregar más ubicaciones
        }
    }
    
    console.log(`Ruta final: ${route.length} ubicaciones visitadas de ${locations.length} disponibles`);
    return route;
}

// Crear ruta de respaldo usando algoritmo consecutivo
function createFallbackRoute(origin, locations, distanceMatrix, maxHours) {
    const maxDurationSeconds = maxHours * 3600;
    
    console.log(`Creando ruta de respaldo con algoritmo consecutivo`);
    
    // Usar el mismo algoritmo consecutivo pero con estimaciones más optimistas
    const route = consecutiveNearestNeighborOptimistic(origin, locations, distanceMatrix, maxDurationSeconds);
    
    return route;
}

// Algoritmo consecutivo con estimaciones optimistas
function consecutiveNearestNeighborOptimistic(origin, locations, distanceMatrix, maxDurationSeconds) {
    const route = [];
    const visited = new Set();
    let currentLocation = origin;
    let totalDuration = 0;
    
    // Ordenar ubicaciones por tiempo desde el origen
    const sortedLocations = locations.map((location, index) => ({
        location,
        index,
        distance: distanceMatrix[index].distance,
        duration: distanceMatrix[index].duration
    })).sort((a, b) => a.duration - b.duration);
    
    // Agregar ubicaciones una por una con estimaciones optimistas
    for (const { location, index, duration } of sortedLocations) {
        if (visited.has(index)) continue;
        
        // Usar estimación optimista: tiempo de regreso = tiempo de ida * 0.8
        const timeToLocation = duration;
        const timeFromLocationToOrigin = duration * 0.8; // 20% más optimista
        const totalTimeIfAdded = totalDuration + timeToLocation + timeFromLocationToOrigin;
        
        console.log(`Fallback evaluando ubicación ${index + 1}: ${Math.round(timeToLocation/60)} min ida + ${Math.round(timeFromLocationToOrigin/60)} min regreso = ${Math.round(totalTimeIfAdded/60)} min total`);
        
        if (totalTimeIfAdded <= maxDurationSeconds) {
            route.push(location);
            visited.add(index);
            totalDuration += timeToLocation;
            currentLocation = location;
            
            console.log(`✅ Fallback agregada ubicación ${index + 1}. Tiempo restante: ${Math.round((maxDurationSeconds - totalTimeIfAdded)/60)} min`);
        } else {
            console.log(`❌ Fallback: ubicación ${index + 1} no cabe ni con estimación optimista`);
            break;
        }
    }
    
    return route;
}

// Estimar tiempo de regreso al origen
function estimateReturnTime(fromLocation, toOrigin) {
    // Usar la misma distancia que se usó para ir al punto
    // El tiempo de regreso debería ser similar al tiempo de ida
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(fromLocation.lat, fromLocation.lng),
        new google.maps.LatLng(toOrigin.lat, toOrigin.lng)
    );
    
    // Usar velocidad promedio más realista: 40 km/h en ciudad
    const timeInSeconds = (distance / 1000) * 90; // 90 segundos por km = 40 km/h
    
    console.log(`Estimando tiempo de regreso: ${Math.round(distance/1000*100)/100} km = ${Math.round(timeInSeconds/60)} min`);
    
    return timeInSeconds;
}

// Obtener ruta usando Directions API
async function getDirectionsRoute(origin, waypoints, travelMode, useTraffic) {
    return new Promise((resolve, reject) => {
        const request = {
            origin: origin,
            destination: origin, // Regreso al origen
            waypoints: waypoints.map(wp => ({ location: { lat: wp.lat, lng: wp.lng } })),
            travelMode: travelMode,
            optimizeWaypoints: true,
            avoidHighways: false,
            avoidTolls: false
        };
        
        if (useTraffic && travelMode === 'DRIVING') {
            //request.departureTime = new Date();
            //request.trafficModel = google.maps.TrafficModel.BEST_GUESS;
        }
        
        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                const route = result.routes[0];
                resolve({
                    directions: route,
                    duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
                    distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
                    legs: route.legs
                });
            } else {
                reject(new Error('Directions API error: ' + status));
            }
        });
    });
}

// Dibujar ruta en el mapa
function drawRoute(route, agentIndex) {
    const polyline = new google.maps.Polyline({
        path: route.directions.overview_path,
        geodesic: true,
        strokeColor: route.color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map
    });
    
    appState.polylines.push(polyline);
}

// Actualizar controles de rutas
function updateRoutesControls(routes) {
    const routesList = document.getElementById('routes-list');
    routesList.innerHTML = '';
    
    routes.forEach((route, index) => {
        const routeItem = document.createElement('div');
        routeItem.className = 'route-item fade-in';
        
        const durationHours = (route.duration / 3600).toFixed(1);
        const distanceKm = (route.distance / 1000).toFixed(1);
        
        routeItem.innerHTML = `
            <div class="route-color" style="background-color: ${route.color}"></div>
            <div class="route-info">
                <strong>Agente ${route.agent}</strong>
                <small>${route.stops.length} paradas • ${durationHours}h • ${distanceKm}km</small>
            </div>
            <div class="route-controls">
                <button onclick="toggleRoute(${index})" class="toggle-btn">Mostrar</button>
                <button onclick="centerOnRoute(${index})">Centrar</button>
                <button onclick="toggleAgentCluster(${index})" class="cluster-btn">Cluster</button>
            </div>
        `;
        
        routesList.appendChild(routeItem);
    });
}

// Actualizar resumen
function updateSummary(routes) {
    const summaryContent = document.getElementById('summary-content');
    
    const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
    const totalDuration = routes.reduce((sum, route) => sum + route.duration, 0);
    const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
    const totalLocations = appState.locations.length;
    
    const avgDuration = (totalDuration / routes.length / 3600).toFixed(1);
    const avgDistance = (totalDistance / routes.length / 1000).toFixed(1);
    const coveragePercentage = ((totalStops / totalLocations) * 100).toFixed(1);
    
    // Calcular eficiencia de tiempo (cuánto se aprovecha del tiempo disponible)
    const workHours = parseFloat(document.getElementById('work-hours').value);
    const maxPossibleDuration = routes.length * workHours * 3600;
    const timeEfficiency = ((totalDuration / maxPossibleDuration) * 100).toFixed(1);
    
    // Determinar estado de la cobertura
    let coverageStatus = '';
    let coverageColor = '';
    if (coveragePercentage >= 90) {
        coverageStatus = 'Excelente cobertura';
        coverageColor = '#137333';
    } else if (coveragePercentage >= 70) {
        coverageStatus = 'Buena cobertura';
        coverageColor = '#1a73e8';
    } else if (coveragePercentage >= 50) {
        coverageStatus = 'Cobertura moderada';
        coverageColor = '#f9ab00';
    } else {
        coverageStatus = 'Cobertura limitada';
        coverageColor = '#d93025';
    }
    
    summaryContent.innerHTML = `
        <strong>Resumen de Rutas Generadas</strong><br><br>
        <strong>Agentes:</strong> ${routes.length}<br>
        <strong>Ubicaciones totales:</strong> ${totalLocations}<br>
        <strong>Ubicaciones visitadas:</strong> ${totalStops}<br>
        <strong>Cobertura:</strong> <span style="color: ${coverageColor}">${coveragePercentage}% - ${coverageStatus}</span><br><br>
        <strong>Duración promedio:</strong> ${avgDuration} horas<br>
        <strong>Distancia promedio:</strong> ${avgDistance} km<br>
        <strong>Eficiencia de tiempo:</strong> ${timeEfficiency}%<br>
        <strong>Paradas por agente:</strong> ${(totalStops / routes.length).toFixed(1)}<br><br>
        <small style="color: #666;">
            <strong>Nota:</strong> El algoritmo prioriza cubrir las horas de trabajo de manera eficiente.<br>
            No es obligatorio visitar todas las ubicaciones si esto optimiza el tiempo de los agentes.
        </small>
    `;
    
    document.getElementById('summary').style.display = 'block';
}

// Mostrar controles de rutas
function showRoutesControls() {
    document.getElementById('routes-controls').style.display = 'block';
    document.getElementById('export-routes').disabled = false;
}

// Toggle visibilidad de ruta (función global)
window.toggleRoute = function(routeIndex) {
    const polyline = appState.polylines[routeIndex];
    if (polyline) {
        polyline.setVisible(!polyline.getVisible());
        
        // Actualizar el texto del botón
        const button = document.querySelector(`[onclick="toggleRoute(${routeIndex})"]`);
        if (button) {
            button.textContent = polyline.getVisible() ? 'Ocultar' : 'Mostrar';
        }
    }
};

// Centrar en ruta específica (función global)
window.centerOnRoute = function(routeIndex) {
    const route = appState.routes[routeIndex];
    if (route && route.stops) {
        const bounds = new google.maps.LatLngBounds();
        
        // Agregar origen
        if (appState.origin) {
            bounds.extend(new google.maps.LatLng(appState.origin.lat, appState.origin.lng));
        }
        
        // Agregar paradas
        route.stops.forEach(stop => {
            bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
        });
        
        map.fitBounds(bounds);
    }
};

// Toggle cluster individual de agente (función global)
window.toggleAgentCluster = function(agentIndex) {
    const route = appState.routes[agentIndex];
    if (!route) return;
    
    // Verificar si ya hay marcadores de cluster individual para este agente
    const existingMarkers = appState.individualClusterMarkers?.[agentIndex];
    
    if (existingMarkers && existingMarkers.length > 0) {
        // Ocultar cluster individual
        existingMarkers.forEach(marker => marker.setMap(null));
        appState.individualClusterMarkers[agentIndex] = [];
        
        // Actualizar botón
        const button = document.querySelector(`[onclick="toggleAgentCluster(${agentIndex})"]`);
        if (button) {
            button.textContent = 'Cluster';
            button.style.background = '#6c757d';
        }
        
        showSuccess(`Cluster del Agente ${agentIndex + 1} ocultado`);
    } else {
        // Mostrar cluster individual
        showIndividualAgentCluster(agentIndex);
        
        // Actualizar botón
        const button = document.querySelector(`[onclick="toggleAgentCluster(${agentIndex})"]`);
        if (button) {
            button.textContent = 'Ocultar';
            button.style.background = '#e74c3c';
        }
        
        showSuccess(`Cluster del Agente ${agentIndex + 1} mostrado`);
    }
};

// Mostrar cluster individual de un agente específico
function showIndividualAgentCluster(agentIndex) {
    const route = appState.routes[agentIndex];
    if (!route || !route.stops || route.stops.length === 0) return;
    
    // Inicializar array de marcadores individuales si no existe
    if (!appState.individualClusterMarkers) {
        appState.individualClusterMarkers = [];
    }
    
    // Limpiar marcadores anteriores de este agente
    if (appState.individualClusterMarkers[agentIndex]) {
        appState.individualClusterMarkers[agentIndex].forEach(marker => marker.setMap(null));
    }
    appState.individualClusterMarkers[agentIndex] = [];
    
    const color = route.color;
    
    // Crear marcadores para cada ubicación del agente
    route.stops.forEach((stop, stopIndex) => {
        const marker = new google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: map,
            title: `Agente ${agentIndex + 1}: ${stop.direccion}`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: '#FFFFFF',
                strokeWeight: 4
            },
            label: {
                text: `${agentIndex + 1}`,
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 'bold'
            }
        });
        
        appState.individualClusterMarkers[agentIndex].push(marker);
    });
    
    // Crear círculo para mostrar el área del agente
    if (route.stops.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        
        // Agregar origen
        if (appState.origin) {
            bounds.extend(new google.maps.LatLng(appState.origin.lat, appState.origin.lng));
        }
        
        // Agregar todas las paradas del agente
        route.stops.forEach(stop => {
            bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
        });
        
        const center = bounds.getCenter();
        const radius = Math.max(
            google.maps.geometry.spherical.computeDistanceBetween(
                center, bounds.getNorthEast()
            ),
            1500 // Radio mínimo de 1.5 km
        );
        
        const circle = new google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 4,
            fillColor: color,
            fillOpacity: 0.15,
            map: map,
            center: center,
            radius: radius
        });
        
        appState.individualClusterMarkers[agentIndex].push(circle);
        
        // Agregar etiqueta del agente en el centro del círculo
        const label = new google.maps.Marker({
            position: center,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0,
                fillOpacity: 0
            },
            label: {
                text: `Agente ${agentIndex + 1}`,
                color: color,
                fontSize: '16px',
                fontWeight: 'bold',
                className: 'individual-agent-label'
            }
        });
        
        appState.individualClusterMarkers[agentIndex].push(label);
    }
    
    console.log(`Cluster individual del Agente ${agentIndex + 1} visualizado`);
}

// Centrar en todas las rutas
function centerAllRoutes() {
    if (appState.routes.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    // Agregar origen
    if (appState.origin) {
        bounds.extend(new google.maps.LatLng(appState.origin.lat, appState.origin.lng));
    }
    
    // Agregar todas las paradas
    appState.routes.forEach(route => {
        route.stops.forEach(stop => {
            bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
        });
    });
    
    map.fitBounds(bounds);
}

// Ocultar todas las rutas del mapa
function clearRoutesFromMap() {
    // Ocultar todas las polylines del mapa
    appState.polylines.forEach(polyline => polyline.setVisible(false));
    
    // Actualizar todos los botones de toggle a "Mostrar"
    const toggleButtons = document.querySelectorAll('[onclick*="toggleRoute"]');
    toggleButtons.forEach(button => {
        button.textContent = 'Mostrar';
    });
    
    showSuccess('Rutas ocultadas del mapa');
}

// Toggle visualización de clusters
function toggleClusters() {
    const button = document.getElementById('toggle-clusters');
    
    if (appState.clusterMarkers && appState.clusterMarkers.length > 0) {
        // Ocultar clusters
        appState.clusterMarkers.forEach(marker => marker.setMap(null));
        appState.clusterMarkers = [];
        button.textContent = 'Mostrar clusters';
        showSuccess('Clusters ocultados');
    } else if (appState.clusters && appState.clusters.length > 0) {
        // Mostrar clusters
        visualizeClusters(appState.clusters);
        button.textContent = 'Ocultar clusters';
        showSuccess('Clusters mostrados');
    } else {
        showError('No hay clusters para mostrar. Genera rutas primero.');
    }
}

// Toggle visualización de clusters por agente
function toggleAgentClusters() {
    const button = document.getElementById('toggle-agent-clusters');
    
    if (appState.agentClusterMarkers && appState.agentClusterMarkers.length > 0) {
        // Ocultar clusters por agente
        appState.agentClusterMarkers.forEach(marker => marker.setMap(null));
        appState.agentClusterMarkers = [];
        button.textContent = 'Mostrar clusters por agente';
        showSuccess('Clusters por agente ocultados');
    } else if (appState.routes && appState.routes.length > 0) {
        // Mostrar clusters por agente
        visualizeAgentClusters();
        button.textContent = 'Ocultar clusters por agente';
        showSuccess('Clusters por agente mostrados');
    } else {
        showError('No hay rutas para mostrar clusters por agente. Genera rutas primero.');
    }
}

// Visualizar clusters por agente individual
function visualizeAgentClusters() {
    // Limpiar marcadores de clusters por agente anteriores
    if (appState.agentClusterMarkers) {
        appState.agentClusterMarkers.forEach(marker => marker.setMap(null));
    }
    appState.agentClusterMarkers = [];
    
    // Colores para cada agente (mismos que las rutas)
    const colors = [
        '#FF0000', // Rojo brillante
        '#0000FF', // Azul brillante
        '#00FF00', // Verde brillante
        '#FF8000', // Naranja brillante
        '#8000FF', // Morado brillante
        '#00FFFF', // Cian brillante
        '#FFFF00', // Amarillo brillante
        '#FF0080', // Rosa brillante
        '#0080FF', // Azul claro brillante
        '#80FF00'  // Verde lima brillante
    ];
    
    appState.routes.forEach((route, agentIndex) => {
        if (!route || !route.stops || route.stops.length === 0) return;
        
        const color = colors[agentIndex % colors.length];
        
        // Crear marcadores para cada ubicación del agente
        route.stops.forEach((stop, stopIndex) => {
            const marker = new google.maps.Marker({
                position: { lat: stop.lat, lng: stop.lng },
                map: map,
                title: `Agente ${agentIndex + 1}: ${stop.direccion}`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: color,
                    fillOpacity: 0.8,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3
                },
                label: {
                    text: `${agentIndex + 1}`,
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }
            });
            
            appState.agentClusterMarkers.push(marker);
        });
        
        // Crear círculo para mostrar el área del agente
        if (route.stops.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            
            // Agregar origen
            if (appState.origin) {
                bounds.extend(new google.maps.LatLng(appState.origin.lat, appState.origin.lng));
            }
            
            // Agregar todas las paradas del agente
            route.stops.forEach(stop => {
                bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
            });
            
            const center = bounds.getCenter();
            const radius = Math.max(
                google.maps.geometry.spherical.computeDistanceBetween(
                    center, bounds.getNorthEast()
                ),
                1000 // Radio mínimo de 1 km
            );
            
            const circle = new google.maps.Circle({
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: color,
                fillOpacity: 0.1,
                map: map,
                center: center,
                radius: radius
            });
            
            appState.agentClusterMarkers.push(circle);
            
            // Agregar etiqueta del agente en el centro del círculo
            const label = new google.maps.Marker({
                position: center,
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 0,
                    fillOpacity: 0
                },
                label: {
                    text: `Agente ${agentIndex + 1}`,
                    color: color,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    className: 'agent-label'
                }
            });
            
            appState.agentClusterMarkers.push(label);
        }
    });
    
    console.log(`Clusters por agente visualizados con ${appState.agentClusterMarkers.length} elementos`);
}

// Exportar rutas a JSON
function exportRoutes() {
    if (appState.routes.length === 0) {
        showError('No hay rutas para exportar');
        return;
    }
    
    const exportData = appState.routes.map(route => ({
        agente: route.agent,
        color: route.color,
        modo: route.mode,
        duracion_prevista_seg: route.duration,
        distancia_m: route.distance,
        paradas: route.stops
    }));
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Crear y descargar archivo
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Rutas exportadas correctamente');
}

// Validar formulario
function validateForm() {
    const hasLocations = appState.locations.length > 0;
    const hasOrigin = appState.origin !== null;
    const agentsCount = parseInt(document.getElementById('agents-count').value);
    const workHours = parseFloat(document.getElementById('work-hours').value);
    
    const isValid = hasLocations && hasOrigin && agentsCount > 0 && workHours > 0;
    
    document.getElementById('generate-routes').disabled = !isValid;
    
    return isValid;
}

// Actualizar contador de ubicaciones
function updateLocationCount(count) {
    const countElement = document.getElementById('location-count');
    countElement.textContent = `${count} ubicaciones cargadas`;
    countElement.style.display = count > 0 ? 'block' : 'none';
}

// Centrar mapa en ubicaciones
function centerMapOnLocations(locations) {
    if (locations.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(location => {
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));
    });
    
    map.fitBounds(bounds);
}

// Limpiar marcadores
function clearMarkers() {
    appState.markers.forEach(marker => marker.setMap(null));
    appState.markers = [];
}

// Limpiar marcador de origen
function clearOriginMarker() {
    if (appState.originMarker) {
        appState.originMarker.setMap(null);
        appState.originMarker = null;
    }
}

// Limpiar rutas
function clearRoutes() {
    appState.polylines.forEach(polyline => polyline.setMap(null));
    appState.polylines = [];
    appState.routes = [];
}

// Mostrar progreso
function showProgress(message) {
    const progressContainer = document.getElementById('progress-container');
    const progressText = document.getElementById('progress-text');
    
    progressText.textContent = message;
    progressContainer.style.display = 'block';
}

// Actualizar progreso
function updateProgress(message, percentage) {
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    
    progressText.textContent = message;
    progressBar.style.setProperty('--progress', `${percentage}%`);
}

// Ocultar progreso
function hideProgress() {
    document.getElementById('progress-container').style.display = 'none';
}

// Mostrar mensaje de error
function showError(message) {
    const existingError = document.querySelector('.error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    document.getElementById('control-panel').appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Mostrar mensaje de éxito
function showSuccess(message) {
    const existingSuccess = document.querySelector('.success');
    if (existingSuccess) existingSuccess.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    document.getElementById('control-panel').appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 5000);
}

// Mostrar sugerencias cuando hay problemas
function showSuggestions(totalAgents, successfulRoutes, workHours) {
    const existingSuggestions = document.querySelector('.suggestions');
    if (existingSuggestions) existingSuggestions.remove();
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggestions';
    suggestionsDiv.style.cssText = `
        color: #1a73e8;
        background: #e8f0fe;
        padding: 12px;
        border-radius: 4px;
        margin-top: 10px;
        font-size: 12px;
        line-height: 1.4;
    `;
    
    const failedAgents = totalAgents - successfulRoutes;
    let suggestions = [];
    
    if (failedAgents > 0) {
        suggestions.push(`<strong>Sugerencias para mejorar las rutas:</strong>`);
        
        if (workHours < 6) {
            suggestions.push(`• Aumentar las horas de trabajo (actual: ${workHours}h, sugerido: 6-8h)`);
        }
        
        if (totalAgents > successfulRoutes * 1.5) {
            suggestions.push(`• Reducir el número de agentes (actual: ${totalAgents}, sugerido: ${Math.max(1, Math.floor(successfulRoutes * 1.2))})`);
        }
        
        if (appState.locations.length > totalAgents * 8) {
            suggestions.push(`• Considerar reducir el número de ubicaciones o aumentar agentes`);
        }
        
        suggestions.push(`• Verificar que el origen esté cerca de las ubicaciones`);
        suggestions.push(`• Probar con modo de viaje diferente (ej: caminando para distancias cortas)`);
    }
    
    suggestionsDiv.innerHTML = suggestions.join('<br>');
    document.getElementById('control-panel').appendChild(suggestionsDiv);
    
    setTimeout(() => suggestionsDiv.remove(), 10000);
}

// Inicializar aplicación
initMap();
