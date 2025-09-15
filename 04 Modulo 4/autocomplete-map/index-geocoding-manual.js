/**
 * Demo Búsqueda Manual con Geocoding API
 * 
 * Características implementadas:
 * - Búsqueda manual con botón (sin autocompletar automático)
 * - Parseo de address_components
 * - Sincronización con mapa
 * - Reverse geocoding
 * - Validación y accesibilidad
 * - Loading states
 * - Analítica básica
 * 
 * VENTAJAS de búsqueda manual:
 * - Control total del usuario sobre cuándo buscar
 * - Menos llamadas a la API (más eficiente)
 * - Mejor para usuarios que saben exactamente qué quieren
 * - Sin sugerencias automáticas que distraigan
 * - Costo predecible y controlado
 * 
 * DESVENTAJAS:
 * - Requiere acción del usuario para cada búsqueda
 * - No hay autocompletar en tiempo real
 * - Menos conveniente para exploración
 */

// Configuración de la API de Google Maps
const GOOGLE_MAPS_CONFIG = {
    key: 'AIzaSyACnySD7qVyCSIrSZujmtSFlHesnd3eKos', // Reemplaza con tu API key
    libraries: ['geometry'], // Solo geometry, sin places
    language: 'es-419',
    region: 'MX'
};

// Variables globales
let map;
let geocoder;
let marker;
let infoWindow;
let searchStartTime;
let analyticsData = {};
let lastSearchQuery = '';

/**
 * Función principal de inicialización
 */
function initializeApp() {
    console.log('Inicializando demo con búsqueda manual...');
    
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
        
        console.log('Demo de búsqueda manual inicializado correctamente');
        
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
 * Realizar búsqueda manual
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
    
    console.log('Realizando búsqueda manual:', address);
    showLoading(true);
    searchStartTime = Date.now();
    lastSearchQuery = address;
    
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
            
            // Procesar el primer resultado (más relevante)
            processGeocodingResult(results[0]);
            
            // Actualizar analytics
            analyticsData = {
                searchTime: Date.now() - searchStartTime,
                resultsCount: results.length,
                usedReverseGeocoding: false,
                searchType: 'Manual'
            };
            
            showAnalytics();
            
        } else {
            console.log('No se encontraron resultados para:', address);
            showError('No se encontraron resultados para esa dirección. Intenta con una dirección más específica.');
        }
    });
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
    showSuccess('Dirección encontrada y procesada correctamente');
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
    
    // Limpiar analytics
    document.getElementById('analytics').style.display = 'none';
    
    // Resetear botones
    validateInput();
    
    // Limpiar loading
    showLoading(false);
    
    console.log('Formulario limpiado');
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
    console.log('DOM cargado, iniciando aplicación con búsqueda manual...');
    initializeApp();
});
