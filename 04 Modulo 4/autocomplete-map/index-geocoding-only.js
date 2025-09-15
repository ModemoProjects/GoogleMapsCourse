/**
 * Demo Autocompletar Direcciones con SOLO Geocoding API
 * 
 * Características implementadas:
 * - Autocompletar manual con Geocoding API
 * - Parseo de address_components
 * - Sincronización con mapa
 * - Reverse geocoding
 * - Validación y accesibilidad
 * - Debounce y loading states
 * - Analítica básica
 * 
 * VENTAJAS de usar solo Geocoding:
 * - Más simple - Una sola API
 * - Costo fijo y predecible
 * - Control total sobre las búsquedas
 * - Menos dependencias
 * 
 * DESVENTAJAS:
 * - Sin autocompletar nativo de Google
 * - Menos sugerencias inteligentes
 * - Sin session tokens (no hay optimización de costos)
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
let debounceTimer;
let suggestions = [];
let currentSuggestionIndex = -1;

/**
 * Función principal de inicialización
 */
function initializeApp() {
    console.log('Inicializando demo con SOLO Geocoding API...');
    
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
        
        console.log('Demo de Geocoding inicializado correctamente');
        
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
    const clearButton = document.getElementById('clearForm');
    const submitButton = document.getElementById('submitForm');
    
    // Autocompletar manual con debounce
    addressInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Limpiar sugerencias anteriores
        clearSuggestions();
        
        if (query.length < 3) {
            return;
        }
        
        // Debounce para evitar muchas llamadas
        clearTimeout(debounceTimer);
        showLoading(true);
        searchStartTime = Date.now();
        
        debounceTimer = setTimeout(() => {
            performGeocodingSearch(query);
        }, 300);
    });
    
    // Navegación por teclado en sugerencias
    addressInput.addEventListener('keydown', (e) => {
        if (suggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFormSubmit();
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateSuggestions(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateSuggestions(-1);
                break;
            case 'Enter':
                e.preventDefault();
                selectSuggestion();
                break;
            case 'Escape':
                clearSuggestions();
                break;
        }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.suggestions-container') && !e.target.closest('#addressInput')) {
            clearSuggestions();
        }
    });
    
    // Botón limpiar
    clearButton.addEventListener('click', clearForm);
    
    // Botón enviar
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleFormSubmit();
    });
    
    console.log('Event listeners configurados');
}

/**
 * Realizar búsqueda con Geocoding API
 */
function performGeocodingSearch(query) {
    console.log('Buscando con Geocoding:', query);
    
    // Opciones de búsqueda con restricciones básicas
    const request = {
        address: query,
        language: 'es-419',
        region: 'MX'
    };
    
    geocoder.geocode(request, (results, status) => {
        showLoading(false);
        
        if (status === 'OK' && results.length > 0) {
            console.log('Resultados encontrados:', results.length);
            
            // Mostrar sugerencias
            showSuggestions(results.slice(0, 5)); // Máximo 5 sugerencias
            
            // Actualizar analytics
            analyticsData = {
                searchTime: Date.now() - searchStartTime,
                resultsCount: results.length,
                usedReverseGeocoding: false
            };
            
        } else {
            console.log('No se encontraron resultados para:', query);
            clearSuggestions();
        }
    });
}

/**
 * Mostrar sugerencias de autocompletar
 */
function showSuggestions(results) {
    suggestions = results;
    currentSuggestionIndex = -1;
    
    const container = document.getElementById('suggestionsContainer');
    if (!container) {
        createSuggestionsContainer();
    }
    
    const suggestionsHTML = results.map((result, index) => `
        <div class="suggestion-item" data-index="${index}">
            <div class="suggestion-text">${result.formatted_address}</div>
            <div class="suggestion-types">${result.types.join(', ')}</div>
        </div>
    `).join('');
    
    container.innerHTML = suggestionsHTML;
    container.style.display = 'block';
    
    // Agregar event listeners a las sugerencias
    container.querySelectorAll('.suggestion-item').forEach((item, index) => {
        item.addEventListener('click', () => selectSuggestionByIndex(index));
    });
}

/**
 * Crear contenedor de sugerencias
 */
function createSuggestionsContainer() {
    const input = document.getElementById('addressInput');
    const container = document.createElement('div');
    container.id = 'suggestionsContainer';
    container.className = 'suggestions-container';
    container.style.display = 'none';
    
    input.parentNode.appendChild(container);
}

/**
 * Navegar por las sugerencias con teclado
 */
function navigateSuggestions(direction) {
    if (suggestions.length === 0) return;
    
    currentSuggestionIndex += direction;
    
    // Circular navigation
    if (currentSuggestionIndex < 0) {
        currentSuggestionIndex = suggestions.length - 1;
    } else if (currentSuggestionIndex >= suggestions.length) {
        currentSuggestionIndex = 0;
    }
    
    // Actualizar UI
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === currentSuggestionIndex);
    });
}

/**
 * Seleccionar sugerencia actual
 */
function selectSuggestion() {
    if (currentSuggestionIndex >= 0 && currentSuggestionIndex < suggestions.length) {
        selectSuggestionByIndex(currentSuggestionIndex);
    }
}

/**
 * Seleccionar sugerencia por índice
 */
function selectSuggestionByIndex(index) {
    if (index >= 0 && index < suggestions.length) {
        const result = suggestions[index];
        console.log('Sugerencia seleccionada:', result);
        
        // Llenar el input
        document.getElementById('addressInput').value = result.formatted_address;
        
        // Procesar el resultado
        processGeocodingResult(result);
        
        // Limpiar sugerencias
        clearSuggestions();
    }
}

/**
 * Limpiar sugerencias
 */
function clearSuggestions() {
    suggestions = [];
    currentSuggestionIndex = -1;
    
    const container = document.getElementById('suggestionsContainer');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
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
    
    // Mostrar analytics
    showAnalytics();
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
 * Manejar envío del formulario
 */
function handleFormSubmit() {
    const address = document.getElementById('addressInput').value.trim();
    
    if (!address) {
        showError('Por favor ingresa una dirección');
        return;
    }
    
    console.log('Buscando dirección:', address);
    showLoading(true);
    searchStartTime = Date.now();
    
    // Usar geocoding directo
    geocoder.geocode({ address: address }, (results, status) => {
        showLoading(false);
        
        if (status === 'OK' && results[0]) {
            const result = results[0];
            console.log('Geocoding exitoso:', result);
            processGeocodingResult(result);
        } else {
            showError('No se pudo encontrar la dirección especificada');
        }
    });
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
    
    // Limpiar sugerencias
    clearSuggestions();
    
    // Limpiar mapa
    marker.setVisible(false);
    infoWindow.close();
    
    // Centrar mapa en ubicación inicial
    map.setCenter({ lat: 21.1230729, lng: -101.6650775 });
    map.setZoom(10);
    
    // Limpiar analytics
    document.getElementById('analytics').style.display = 'none';
    
    // Limpiar timer de debounce
    clearTimeout(debounceTimer);
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
 * Mostrar información de analytics
 */
function showAnalytics() {
    const analyticsDiv = document.getElementById('analytics');
    const contentDiv = document.getElementById('analyticsContent');
    
    const content = `
        <p><strong>Tiempo de búsqueda:</strong> ${analyticsData.searchTime}ms</p>
        <p><strong>Resultados encontrados:</strong> ${analyticsData.resultsCount}</p>
        <p><strong>Usó reverse geocoding:</strong> ${analyticsData.usedReverseGeocoding ? 'Sí' : 'No'}</p>
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
    console.log('DOM cargado, iniciando aplicación con SOLO Geocoding...');
    initializeApp();
});
