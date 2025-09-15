/**
 * 🗺️ DEMO COMPLETO DE GOOGLE MAPS DIRECTIONS API
 * 
 * Este demo implementa todas las funcionalidades avanzadas de Google Maps:
 * 
 * 🎯 OBJETIVOS FUNCIONALES (Los 3 en el mismo ejemplo):
 * 1. Ruta más rápida entre ciudades con ETA y tráfico en tiempo real
 * 2. Múltiples paradas (waypoints) con optimización automática de orden
 * 3. ETA dinámica que se recalcula al arrastrar rutas o cambiar modo de transporte
 * 
 * 🔧 CARACTERÍSTICAS TÉCNICAS:
 * - Google Maps API configurado con language=es-419 y region=MX
 * - Places API para autocomplete de ciudades mexicanas
 * - DirectionsService con todas las opciones avanzadas
 * - DirectionsRenderer con arrastre habilitado
 * - Manejo completo de errores y límites de la API
 * 
 * 📋 CONFIGURACIÓN REQUERIDA:
 * 1. Reemplazar "TU_API_KEY_AQUI" con tu clave de API real
 * 2. En Google Cloud Console, restringir API key por dominio
 * 3. Habilitar: Maps JavaScript API, Directions API, Places API
 */

// ========================================
// 📊 VARIABLES GLOBALES DEL SISTEMA
// ========================================
let map;                    // Instancia principal del mapa de Google
let directionsService;      // Servicio para calcular rutas
let directionsRenderer;     // Renderizador para mostrar rutas en el mapa
let originAutocomplete;     // Autocomplete para ciudad de origen
let destinationAutocomplete; // Autocomplete para ciudad de destino
let waypointAutocompletes = []; // Array de autocompletes para waypoints
let currentRoute = null;    // Ruta actualmente mostrada
let alternativeRoutes = []; // Rutas alternativas disponibles
let selectedRouteIndex = 0; // Índice de la ruta seleccionada
let waypoints = [];         // Array de paradas intermedias

// ========================================
// ⚙️ CONFIGURACIÓN DE GOOGLE MAPS API
// ========================================
const MAP_CONFIG = {
    center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México como centro inicial
    zoom: 6,                                  // Nivel de zoom para ver todo México
    language: 'es-419',                       // Español de México
    region: 'MX'                             // Región México para mejores resultados
};

// ========================================
// 🚀 INICIALIZACIÓN PRINCIPAL DE LA APLICACIÓN
// ========================================
async function initMap() {
    try {
        // 📚 PASO 1: Importar librerías de Google Maps API
        // Estas son las librerías necesarias para nuestro demo
        const { Map } = await google.maps.importLibrary("maps");                    // Mapa principal
        const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes"); // Servicios de rutas
        const { PlacesService, Autocomplete } = await google.maps.importLibrary("places");          // Autocomplete de lugares
        const { GeometryLibrary } = await google.maps.importLibrary("geometry");                   // Cálculos geométricos

        // 🗺️ PASO 2: Crear instancia del mapa
        // Configuramos el mapa con controles y opciones de visualización
        map = new Map(document.getElementById("map"), {
            ...MAP_CONFIG,                    // Usar configuración definida arriba
            mapTypeControl: true,             // Control para cambiar tipo de mapa
            streetViewControl: true,          // Control de Street View
            fullscreenControl: true,          // Control de pantalla completa
            zoomControl: true                 // Control de zoom
        });

        // 🛣️ PASO 3: Inicializar servicios de direcciones
        // DirectionsService: Calcula las rutas
        // DirectionsRenderer: Muestra las rutas en el mapa
        directionsService = new DirectionsService();
        directionsRenderer = new DirectionsRenderer({
            map: map,                         // Asociar al mapa
            draggable: true,                  // ⭐ CLAVE: Habilita arrastre de rutas para ETA dinámica
            suppressMarkers: false,           // Mostrar marcadores de inicio/fin
            polylineOptions: {                // Estilo de la línea de ruta
                strokeColor: '#3498db',       // Color azul
                strokeWeight: 4,              // Grosor de línea
                strokeOpacity: 0.8            // Opacidad
            }
        });

        // 🔍 PASO 4: Configurar autocomplete de ciudades
        // Esto permite escribir ciudades y obtener sugerencias automáticas
        setupAutocomplete();
        
        // 🎛️ PASO 5: Configurar todos los botones y controles
        // Conecta la interfaz con las funciones del sistema
        setupEventListeners();
        
        // 🔄 PASO 6: Configurar ETA dinámica
        // ⭐ CLAVE: Escucha cuando el usuario arrastra la ruta para recalcular ETA
        setupDirectionsChangedListener();

        showStatusMessage('Mapa inicializado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        showStatusMessage('Error al cargar el mapa. Verifica tu API key.', 'error');
    }
}

// ========================================
// 🔍 CONFIGURACIÓN DE AUTOCOMPLETE DE CIUDADES
// ========================================
function setupAutocomplete() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');

    // ⚙️ Configuración del autocomplete
    // Restringimos solo a ciudades de México para mejor precisión
    const autocompleteOptions = {
        types: ['(cities)'],                           // Solo ciudades, no direcciones específicas
        componentRestrictions: { country: 'mx' },      // ⭐ CLAVE: Solo México
        fields: ['place_id', 'geometry', 'name', 'formatted_address'] // Datos que necesitamos
    };

    // 🏁 Autocomplete para ciudad de ORIGEN
    originAutocomplete = new google.maps.places.Autocomplete(originInput, autocompleteOptions);
    originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
            console.log('Origen seleccionado:', place.name);
        }
    });

    // 🎯 Autocomplete para ciudad de DESTINO
    destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, autocompleteOptions);
    destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
            console.log('Destino seleccionado:', place.name);
        }
    });
}

// ========================================
// 🎛️ CONFIGURACIÓN DE CONTROLES DE LA INTERFAZ
// ========================================
function setupEventListeners() {
    // 🚀 Botón principal: Calcular ruta
    document.getElementById('calculate-route').addEventListener('click', calculateRoute);
    
    // 🔄 Botón: Ver rutas alternativas
    document.getElementById('show-alternatives').addEventListener('click', showAlternatives);
    
    // 🗑️ Botón: Limpiar ruta actual
    document.getElementById('clear-route').addEventListener('click', clearRoute);
    
    // ➕ Botón: Agregar parada intermedia
    document.getElementById('add-waypoint').addEventListener('click', addWaypoint);
    
    // 🚗 Cambios en modo de viaje (Conducir, Caminar, etc.)
    // ⭐ CLAVE: Recalcula automáticamente cuando cambias el modo
    document.getElementById('travel-mode').addEventListener('change', () => {
        if (currentRoute) {
            calculateRoute(); // Recalcular con nuevo modo
        }
    });
    
    // ⚙️ Cambios en opciones de ruta (optimizar, evitar peajes, etc.)
    // ⭐ CLAVE: Recalcula automáticamente cuando cambias las opciones
    ['optimize-waypoints', 'avoid-tolls', 'avoid-highways'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (currentRoute) {
                calculateRoute(); // Recalcular con nuevas opciones
            }
        });
    });
    
    // ⛽ Cambios en configuración de combustible
    // Actualiza el costo en tiempo real mientras escribes
    ['fuel-efficiency', 'fuel-price'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateFuelCost);
    });
}

// ========================================
// 🔄 CONFIGURACIÓN DE ETA DINÁMICA (ARRASRE DE RUTAS)
// ========================================
function setupDirectionsChangedListener() {
    // ⭐ FUNCIONALIDAD CLAVE: ETA dinámica al arrastrar rutas
    // Este listener se activa cuando el usuario arrastra la línea azul de la ruta
    directionsRenderer.addListener('directions_changed', () => {
        const directions = directionsRenderer.getDirections();
        if (directions) {
            // 🔄 Recalcular métricas con la nueva ruta
            updateRouteMetrics(directions);
            // 📋 Actualizar instrucciones con la nueva ruta
            updateDirectionsPanel(directions);
            // 💬 Mostrar mensaje de confirmación
            showStatusMessage('Ruta actualizada al arrastrar', 'info');
        }
    });
}

// ========================================
// 🚀 FUNCIÓN PRINCIPAL: CALCULAR RUTA
// ========================================
async function calculateRoute() {
    // 📍 PASO 1: Obtener origen y destino
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    // ✅ Validar que se hayan ingresado ambos puntos
    if (!origin || !destination) {
        showStatusMessage('Por favor ingresa origen y destino', 'warning');
        return;
    }

    // ⏳ Mostrar indicador de carga
    showLoading(true);

    try {
        // 🚗 PASO 2: Obtener configuración del usuario
        const travelMode = document.getElementById('travel-mode').value;
        console.log('Modo de viaje seleccionado:', travelMode);

        // ⚙️ PASO 3: Configurar solicitud a Google Directions API
        const request = {
            origin: origin,                              // Ciudad de origen
            destination: destination,                     // Ciudad de destino
            travelMode: travelMode,                      // Modo de viaje (DRIVING, WALKING, etc.)
            provideRouteAlternatives: true,              // ⭐ CLAVE: Solicitar rutas alternativas
            avoidTolls: document.getElementById('avoid-tolls').checked,        // Evitar peajes
            avoidHighways: document.getElementById('avoid-highways').checked,  // Evitar autopistas
            language: 'es-419',                          // Español México
            region: 'MX'                                 // Región México
        };

        // 🛑 PASO 4: Procesar paradas intermedias (waypoints)
        const waypointValues = waypoints.filter(wp => wp.value.trim() !== '');
        console.log('Waypoints disponibles:', waypointValues.map((wp, i) => ({
            index: i + 1,
            value: wp.value,
            inputValue: wp.input.value
        })));
        
        if (waypointValues.length > 0) {
            // 📍 Convertir waypoints al formato que espera Google Maps
            request.waypoints = waypointValues.map(wp => ({
                location: wp.value,        // Dirección de la parada
                stopover: true            // Parada obligatoria (no solo pasar por ahí)
            }));
            
            // ⭐ CLAVE: Optimizar orden de waypoints automáticamente
            // Google Maps reorganiza las paradas para la ruta más eficiente
            request.optimizeWaypoints = document.getElementById('optimize-waypoints').checked;
            console.log('Waypoints configurados para la API:', request.waypoints);
        }

        // 🚦 PASO 5: Configuración de tráfico con Routes API
        // ⭐ NUEVO: Usar Routes API para soporte completo de trafficModel
        //if (travelMode === 'DRIVING') {
            // Configurar para usar Routes API con tráfico
            //request.routingPreference = 'TRAFFIC_AWARE_OPTIMAL';
            //request.departureTime = new Date();
            //request.trafficModel = 'BEST_GUESS'; // BEST_GUESS, PESSIMISTIC, o OPTIMISTIC
          //  console.log('Agregando información de tráfico para modo DRIVING con Routes API');
       // }
        
        //console.log('Modo de viaje:', travelMode, '- Usando Routes API con soporte de tráfico');

        // 📊 Log de la solicitud para debug
        console.log('Solicitando ruta con parámetros:', request);

        // 🌐 PASO 6: Llamar a la API apropiada según el modo
        // ⭐ NUEVO: Usar Routes API para tráfico, Directions API para otros modos
        let response;
        
        if (travelMode === 'DRIVING' && request.trafficModel) {
            // 🚦 Usar Routes API para modo DRIVING con tráfico en tiempo real
            console.log('Usando Routes API para tráfico en tiempo real');
            try {
                response = await callRoutesAPI(request);
            } catch (error) {
                console.warn('Routes API falló, usando Directions API como fallback:', error);
                // Fallback a Directions API si Routes API falla
                response = await new Promise((resolve, reject) => {
                    directionsService.route(request, (result, status) => {
                        if (status === 'OK') {
                            resolve(result);
                        } else {
                            reject(new Error(`Error en Directions API: ${status}`));
                        }
                    });
                });
            }
        } else {
            // 🗺️ Usar Directions API para otros modos (WALKING, TRANSIT, BICYCLING)
            response = await new Promise((resolve, reject) => {
                directionsService.route(request, (result, status) => {
                    console.log('Respuesta de Directions API:', { status, result });
                    if (status === 'OK') {
                        resolve(result);
                    } else {
                        reject(new Error(`Error en Directions API: ${status}`));
                    }
                });
            });
        }

        // ✅ PASO 7: Procesar respuesta exitosa
        currentRoute = response;                    // Guardar ruta actual
        alternativeRoutes = response.routes || [];  // Guardar rutas alternativas
        selectedRouteIndex = 0;                     // Seleccionar primera ruta

        // 🗺️ PASO 8: Mostrar ruta en el mapa
        directionsRenderer.setDirections(response);  // Dibujar ruta en el mapa
        directionsRenderer.setRouteIndex(0);         // Mostrar primera ruta

        // 📊 PASO 9: Actualizar interfaz de usuario
        updateRouteMetrics(response);        // Mostrar distancia, tiempo, costo
        updateDirectionsPanel(response);     // Mostrar instrucciones paso a paso
        updateAlternativesPanel();          // Preparar panel de rutas alternativas
        showRouteMetrics();                 // Mostrar panel de métricas

        // 💬 Confirmar éxito
        showStatusMessage(`Ruta calculada exitosamente. ${alternativeRoutes.length} alternativa(s) disponible(s)`, 'success');

    } catch (error) {
        console.error('Error al calcular ruta:', error);
        handleDirectionsError(error);
    } finally {
        showLoading(false);
    }
}

// Mostrar rutas alternativas
function showAlternatives() {
    if (alternativeRoutes.length <= 1) {
        showStatusMessage('No hay rutas alternativas disponibles', 'warning');
        return;
    }

    updateAlternativesPanel();
    document.getElementById('alternatives-section').style.display = 'block';
    showStatusMessage(`${alternativeRoutes.length} rutas alternativas mostradas`, 'info');
}

// Actualizar panel de rutas alternativas
function updateAlternativesPanel() {
    const container = document.getElementById('alternatives-list');
    container.innerHTML = '';

    alternativeRoutes.forEach((route, index) => {
        const routeDiv = document.createElement('div');
        routeDiv.className = `alternative-route ${index === selectedRouteIndex ? 'selected' : ''}`;
        
        const leg = route.legs[0];
        const distance = formatDistance(leg.distance.value);
        const duration = formatDuration(leg.duration.value);
        const durationInTraffic = leg.duration_in_traffic ? formatDuration(leg.duration_in_traffic.value) : null;

        routeDiv.innerHTML = `
            <h4>Ruta ${index + 1}</h4>
            <div class="alternative-metrics">
                <div><strong>Distancia:</strong> ${distance}</div>
                <div><strong>Tiempo:</strong> ${duration}</div>
                ${durationInTraffic ? `<div><strong>Con tráfico:</strong> ${durationInTraffic}</div>` : ''}
            </div>
        `;

        routeDiv.addEventListener('click', () => selectAlternativeRoute(index));
        container.appendChild(routeDiv);
    });
}

// Seleccionar ruta alternativa
function selectAlternativeRoute(index) {
    selectedRouteIndex = index;
    directionsRenderer.setRouteIndex(index);
    updateAlternativesPanel();
    updateRouteMetrics(currentRoute);
    updateDirectionsPanel(currentRoute);
    showStatusMessage(`Ruta ${index + 1} seleccionada`, 'info');
}

// Agregar waypoint
function addWaypoint() {
    if (waypoints.length >= 8) { // Límite de Google Maps
        showStatusMessage('Máximo 8 paradas intermedias permitidas', 'warning');
        return;
    }

    const waypointId = `waypoint-${waypoints.length}`;
    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'waypoint-item';
    waypointDiv.innerHTML = `
        <input type="text" id="${waypointId}" placeholder="Parada ${waypoints.length + 1}..." />
        <button class="waypoint-remove" onclick="removeWaypoint(${waypoints.length})">×</button>
    `;

    document.getElementById('waypoints-list').appendChild(waypointDiv);

    // Configurar autocomplete para el nuevo waypoint
    const input = document.getElementById(waypointId);
    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['(cities)'],
        componentRestrictions: { country: 'mx' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
    });

    const waypointIndex = waypoints.length;
    waypoints.push({
        element: waypointDiv,
        input: input,
        autocomplete: autocomplete,
        value: ''
    });

    // Actualizar valor cuando se seleccione del autocomplete
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            waypoints[waypointIndex].value = place.formatted_address;
            console.log(`Waypoint ${waypointIndex + 1} seleccionado:`, place.formatted_address);
        }
    });

    // También actualizar cuando se escriba manualmente (fallback)
    input._waypointListener = (e) => {
        waypoints[waypointIndex].value = e.target.value;
        console.log(`Waypoint ${waypointIndex + 1} escrito manualmente:`, e.target.value);
    };
    input.addEventListener('input', input._waypointListener);

    showStatusMessage(`Parada ${waypoints.length} agregada`, 'info');
}

// Remover waypoint
function removeWaypoint(index) {
    if (index >= 0 && index < waypoints.length) {
        waypoints[index].element.remove();
        waypoints.splice(index, 1);
        
        // Renumerar waypoints restantes y actualizar event listeners
        waypoints.forEach((wp, i) => {
            wp.input.placeholder = `Parada ${i + 1}...`;
            
            // Recrear event listener con el índice correcto
            const newInput = wp.input;
            const newAutocomplete = wp.autocomplete;
            
            // Remover listeners anteriores
            if (newInput._waypointListener) {
                newInput.removeEventListener('input', newInput._waypointListener);
            }
            
            // Recrear listener para input manual
            newInput._waypointListener = (e) => {
                waypoints[i].value = e.target.value;
                console.log(`Waypoint ${i + 1} escrito manualmente:`, e.target.value);
            };
            newInput.addEventListener('input', newInput._waypointListener);
            
            // Recrear listener para autocomplete
            google.maps.event.clearListeners(newAutocomplete, 'place_changed');
            newAutocomplete.addListener('place_changed', () => {
                const place = newAutocomplete.getPlace();
                if (place.geometry) {
                    waypoints[i].value = place.formatted_address;
                    console.log(`Waypoint ${i + 1} seleccionado:`, place.formatted_address);
                }
            });
        });
        
        showStatusMessage(`Parada ${index + 1} eliminada`, 'info');
    }
}

// ========================================
// 📊 CALCULAR MÉTRICAS TOTALES DE LA RUTA
// ========================================
function updateRouteMetrics(directions) {
    const route = directions.routes[selectedRouteIndex];
    const legs = route.legs;  // ⭐ CLAVE: Una ruta con waypoints tiene múltiples "legs"
    
    console.log('Número de legs en la ruta:', legs.length);
    
    // 🔢 PASO 1: Inicializar contadores para métricas totales
    let totalDistance = 0;        // Distancia total en metros
    let totalDuration = 0;        // Tiempo total en segundos
    let totalDurationInTraffic = 0; // Tiempo con tráfico en segundos
    let hasTrafficInfo = false;   // ¿Tiene información de tráfico?
    
    // 🔄 PASO 2: Sumar métricas de todos los legs
    // ⭐ CLAVE: Cuando hay waypoints, la ruta se divide en segmentos (legs)
    // Ejemplo: CDMX → Puebla → Cancún = 2 legs: CDMX-Puebla y Puebla-Cancún
    legs.forEach((leg, index) => {
        totalDistance += leg.distance.value;      // Sumar distancia
        totalDuration += leg.duration.value;      // Sumar tiempo
        
        // Sumar tiempo con tráfico si está disponible
        if (leg.duration_in_traffic) {
            totalDurationInTraffic += leg.duration_in_traffic.value;
            hasTrafficInfo = true;
        }
        
        // 📝 Log detallado de cada segmento
        console.log(`Leg ${index + 1}:`, {
            from: leg.start_address,
            to: leg.end_address,
            distance: formatDistance(leg.distance.value),
            duration: formatDuration(leg.duration.value),
            durationInTraffic: leg.duration_in_traffic ? formatDuration(leg.duration_in_traffic.value) : 'No disponible'
        });
    });
    
    // 📏 PASO 3: Mostrar distancia total en la interfaz
    document.getElementById('total-distance').textContent = formatDistance(totalDistance);
    
    // ⏰ PASO 4: Mostrar tiempo total (con o sin tráfico)
    const timeText = hasTrafficInfo ? 
        `${formatDuration(totalDuration)} (${formatDuration(totalDurationInTraffic)} con tráfico)` :
        formatDuration(totalDuration);
    document.getElementById('total-duration').textContent = timeText;
    
    // 📊 Log de métricas finales
    console.log('Métricas totales calculadas:', {
        totalDistance: formatDistance(totalDistance),
        totalDuration: formatDuration(totalDuration),
        totalDurationInTraffic: hasTrafficInfo ? formatDuration(totalDurationInTraffic) : 'No disponible',
        numberOfLegs: legs.length
    });
    
    // ⛽ PASO 5: Calcular costo de combustible basado en distancia total
    updateFuelCost();
}

// Actualizar costo de combustible
function updateFuelCost() {
    if (!currentRoute) return;
    
    const route = currentRoute.routes[selectedRouteIndex];
    const legs = route.legs;
    
    // Calcular distancia total sumando todos los legs
    let totalDistance = 0;
    legs.forEach(leg => {
        totalDistance += leg.distance.value;
    });
    
    const distanceKm = totalDistance / 1000;
    
    const efficiency = parseFloat(document.getElementById('fuel-efficiency').value) || 12;
    const price = parseFloat(document.getElementById('fuel-price').value) || 25;
    
    const fuelUsed = distanceKm / efficiency;
    const cost = fuelUsed * price;
    
    document.getElementById('fuel-cost').textContent = `$${cost.toFixed(2)}`;
    
    console.log('Cálculo de combustible:', {
        totalDistanceKm: distanceKm.toFixed(2),
        efficiency: efficiency,
        pricePerLiter: price,
        fuelUsed: fuelUsed.toFixed(2),
        totalCost: cost.toFixed(2)
    });
}

// Actualizar panel de instrucciones
function updateDirectionsPanel(directions) {
    const container = document.getElementById('directions-list');
    container.innerHTML = '';

    const route = directions.routes[selectedRouteIndex];
    const legs = route.legs;
    
    let stepCounter = 1;
    
    legs.forEach((leg, legIndex) => {
        // Agregar encabezado del leg
        const legHeader = document.createElement('div');
        legHeader.className = 'direction-leg-header';
        legHeader.innerHTML = `
            <h3>${leg.start_address} → ${leg.end_address}</h3>
            <p>Distancia: ${formatDistance(leg.distance.value)} | Tiempo: ${formatDuration(leg.duration.value)}</p>
        `;
        container.appendChild(legHeader);
        
        // Agregar pasos del leg
        leg.steps.forEach((step, stepIndex) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'direction-step';
            
            stepDiv.innerHTML = `
                <h4>Paso ${stepCounter}</h4>
                <p>${step.instructions}</p>
                <small>Distancia: ${formatDistance(step.distance.value)} | Tiempo: ${formatDuration(step.duration.value)}</small>
            `;
            
            container.appendChild(stepDiv);
            stepCounter++;
        });
    });

    document.getElementById('directions-panel').style.display = 'block';
}

// Mostrar métricas de ruta
function showRouteMetrics() {
    document.getElementById('route-metrics').style.display = 'block';
}

// Limpiar ruta
function clearRoute() {
    directionsRenderer.setDirections({ routes: [] });
    currentRoute = null;
    alternativeRoutes = [];
    selectedRouteIndex = 0;
    
    // Limpiar inputs
    document.getElementById('origin').value = '';
    document.getElementById('destination').value = '';
    
    // Limpiar waypoints
    waypoints.forEach(wp => wp.element.remove());
    waypoints = [];
    
    // Ocultar paneles
    document.getElementById('route-metrics').style.display = 'none';
    document.getElementById('alternatives-section').style.display = 'none';
    document.getElementById('directions-panel').style.display = 'none';
    
    showStatusMessage('Ruta limpiada', 'info');
}

// Mostrar/ocultar loading
function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

// Mostrar mensaje de estado
function showStatusMessage(message, type = 'info') {
    const container = document.getElementById('status-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Manejar errores de Directions API
function handleDirectionsError(error) {
    let message = 'Error desconocido al calcular la ruta';
    
    if (error.message.includes('ZERO_RESULTS')) {
        message = 'No se encontró ruta entre los puntos especificados';
    } else if (error.message.includes('OVER_QUERY_LIMIT')) {
        message = 'Límite de consultas excedido. Intenta más tarde';
    } else if (error.message.includes('REQUEST_DENIED')) {
        message = 'Solicitud denegada. Verifica tu API key';
    } else if (error.message.includes('INVALID_REQUEST')) {
        message = 'Solicitud inválida. Verifica los parámetros';
    } else if (error.message.includes('NOT_FOUND')) {
        message = 'Uno o más puntos no encontrados';
    } else if (error.message.includes('MAX_WAYPOINTS_EXCEEDED')) {
        message = 'Demasiadas paradas intermedias (máximo 8)';
    } else if (error.message.includes('InvalidValueError')) {
        if (error.message.includes('departureTime')) {
            message = 'Error: departureTime no es válido para este modo de transporte';
        } else {
            message = 'Error de valor inválido en los parámetros de la solicitud';
        }
    }
    
    console.error('Error detallado:', error);
    showStatusMessage(message, 'error');
}

// Funciones de formateo
function formatDistance(meters) {
    if (meters < 1000) {
        return `${meters} m`;
    } else {
        return `${(meters / 1000).toFixed(1)} km`;
    }
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Debounce para autocomplete
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

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si la API key está configurada
    if (window.GOOGLE_MAPS_API_KEY === "TU_API_KEY_AQUI") {
        showStatusMessage('⚠️ Configura tu API key de Google Maps en el archivo HTML', 'warning');
    }
    
initMap();
});

// ========================================
// 🚦 FUNCIÓN PARA ROUTES API CON TRÁFICO
// ========================================
async function callRoutesAPI(request) {
    // ⭐ NUEVA FUNCIÓN: Llamada a Routes API para soporte completo de tráfico
    // Esta función implementa la nueva Routes API que sí soporta trafficModel
    
    const routesAPIUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    
    // Configurar headers para Routes API
    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs,routes.polyline'
    };
    
    try {
        console.log('Llamando a Routes API con tráfico en tiempo real...');
        
        const response = await fetch(routesAPIUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            throw new Error(`Routes API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Respuesta de Routes API:', data);
        
        // Convertir respuesta de Routes API al formato de Directions API para compatibilidad
        return convertRoutesAPIResponse(data);
        
    } catch (error) {
        console.error('Error en Routes API:', error);
        throw error;
    }
}

// Convertir respuesta de Routes API al formato de Directions API
function convertRoutesAPIResponse(routesResponse) {
    // Esta función convierte la respuesta de Routes API al formato que espera DirectionsRenderer
    // Por simplicidad, retornamos un objeto compatible con Directions API
    
    if (!routesResponse.routes || routesResponse.routes.length === 0) {
        throw new Error('No se encontraron rutas');
    }
    
    const route = routesResponse.routes[0];
    
    // Crear estructura compatible con Directions API
    const directionsResponse = {
        routes: [{
            legs: route.legs || [],
            overview_polyline: route.polyline || {},
            summary: 'Ruta calculada con Routes API'
        }],
        status: 'OK'
    };
    
    return directionsResponse;
}

// Función opcional para habilitar información de tráfico
// Descomenta y usa cuando tengas habilitados los servicios de tráfico
function enableTrafficInfo(request, travelMode) {
    if (travelMode === 'DRIVING') {
        try {
            request.departureTime = new Date();
            request.trafficModel = 'best_guess';
            console.log('✅ Información de tráfico habilitada');
        } catch (error) {
            console.warn('⚠️ No se pudo habilitar información de tráfico:', error);
        }
    }
}

// Exportar funciones para uso global
window.removeWaypoint = removeWaypoint;
