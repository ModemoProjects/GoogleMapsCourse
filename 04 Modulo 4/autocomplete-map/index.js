/**
 * Demo Autocompletar Direcciones con Google Maps JavaScript API
 * 
 * Características implementadas:
 * - Autocompletar con Places API (es-419)
 * - Parseo de address_components
 * - Sincronización con mapa
 * - Reverse geocoding
 * - Session tokens para optimización de costos
 * - Validación y accesibilidad
 * - Debounce y loading states
 * - Analítica básica
 * 
 * IMPORTANTE - DIFERENCIAS ENTRE APIs Y TOKENS:
 * 
 * ✅ CON SESSION TOKEN:
 * - Places API (Autocompletar + Place Details)
 * - Beneficio: Descuentos por agrupar búsquedas de una "sesión"
 * - Costo: Variable según caracteres escritos
 * 
 * ❌ SIN SESSION TOKEN:
 * - Geocoding API (Forward + Reverse Geocoding)
 * - Razón: Cada llamada es independiente con costo fijo
 * - No hay concepto de "sesión" ni descuentos por agrupar
 */

// Configuración de la API de Google Maps
const GOOGLE_MAPS_CONFIG = {
    key: 'AIzaSyACnySD7qVyCSIrSZujmtSFlHesnd3eKos', // Reemplaza con tu API key
    libraries: ['places', 'geometry'],
    language: 'es-419',
    region: 'MX'
};

// Variable para controlar si el mapa ya se inicializó
let mapInitialized = false;

// Variables globales
let map;
let autocomplete;
let geocoder;
let placesService;
let marker;
let infoWindow;
let sessionToken;
let searchStartTime;
let analyticsData = {};
let debounceTimer;

/**
 * Función principal de inicialización
 */
function initializeApp() {
    console.log('Inicializando demo de autocompletar...');
    
    // Cargar la API de Google Maps
    loadGoogleMapsAPI().then(googleMaps => {
        console.log('Google Maps API cargada:', googleMaps);
        
        // Inicializar servicios
        geocoder = new googleMaps.Geocoder();
        placesService = new googleMaps.places.PlacesService(document.createElement('div'));
        console.log('Servicios inicializados');
        
        // Inicializar el mapa
        initMap();
        
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
    if (mapInitialized) {
        console.log('Mapa ya inicializado, saltando...');
        return;
    }
    
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
        
        mapInitialized = true;
        console.log('Mapa inicializado correctamente');
        
        // Configurar autocompletar después de que el mapa esté listo
        setTimeout(() => {
            setupAutocomplete();
            setupEventListeners();
        }, 100);
        
    } catch (error) {
        console.error('Error al crear el mapa:', error);
        showError('Error al inicializar el mapa. Verifica la consola para más detalles.');
    }
}

/**
 * Configurar autocompletar
 * 
 * NOTA: Places API (Autocompletar + Place Details) SÍ usa session tokens
 * porque permite agrupar búsquedas de una "sesión" y obtener descuentos
 * en el costo de las llamadas.
 */
function setupAutocomplete() {
    const input = document.getElementById('addressInput');
    
    // No crear token aquí, se creará cuando el usuario empiece a escribir
    const options = {
        fields: ['place_id', 'geometry', 'formatted_address', 'address_components'],
        componentRestrictions: { country: 'mx' },
        types: ['address']
    };
    
    autocomplete = new google.maps.places.Autocomplete(input, options);
    
    // Eventos del autocompletar
    autocomplete.addListener('place_changed', handlePlaceSelection);
    
    console.log('Autocompletar configurado');
}

/**
 * Crear nuevo token de sesión para optimizar costos
 * 
 * OPTIMIZACIÓN: El token se crea solo cuando el usuario empieza a escribir,
 * no en cada focus del input. Esto reduce la creación innecesaria de tokens
 * y mejora el rendimiento.
 */
function createNewSessionToken() {
    sessionToken = new google.maps.places.AutocompleteSessionToken();
    console.log('Nuevo token de sesión creado (optimizado)');
}

/**
 * Manejar selección de lugar del autocompletar
 */
function handlePlaceSelection() {
    const place = autocomplete.getPlace();
    
    if (!place.place_id) {
        console.warn('No se seleccionó un lugar válido');
        return;
    }
    
    console.log('Lugar seleccionado:', place);
    
    // Registrar tiempo de búsqueda
    const searchTime = Date.now() - searchStartTime;
    analyticsData = {
        searchTime: searchTime,
        resultsCount: 0, // Se actualizará con el número de sugerencias
        usedReverseGeocoding: false
    };
    
    // Obtener detalles del lugar
    getPlaceDetails(place.place_id, place);
}

/**
 * Obtener detalles del lugar usando Places API
 */
function getPlaceDetails(placeId, place) {
    const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'address_components', 'geometry', 'types']
    };
    
    placesService.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            console.log('Detalles del lugar obtenidos:', result);
            parseAddressComponents(result);
            updateMapWithPlace(result);
            showAnalytics();
        } else {
            console.warn('Error al obtener detalles del lugar:', status);
            // Fallback: usar geocoding directo
            fallbackGeocoding(place.formatted_address);
        }
    });
}

/**
 * Parsear componentes de dirección de Google Places
 */
function parseAddressComponents(place) {
    const components = place.address_components || [];
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
 * Actualizar mapa con el lugar seleccionado
 */
function updateMapWithPlace(place) {
    if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        
        // Centrar mapa con animación
        map.panTo(location);
        map.setZoom(16);
        
        // Posicionar marcador
        marker.setPosition(location);
        marker.setVisible(true);
        
        // Mostrar InfoWindow
        const content = `
            <div class="info-window">
                <h4>${place.name || 'Ubicación seleccionada'}</h4>
                <p>${place.formatted_address}</p>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        console.log('Mapa actualizado con ubicación:', location.toString());
    }
}

/**
 * Fallback con geocoding directo
 * 
 * NOTA: Geocoding API (tanto forward como reverse) NO usa session tokens
 * porque cada llamada es independiente y tiene costo fijo.
 */
function fallbackGeocoding(address) {
    console.log('Usando geocoding de respaldo para:', address);
    
    // Geocoding directo (SIN token de sesión - no es necesario ni posible)
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const result = results[0];
            console.log('Geocoding exitoso:', result);
            parseAddressComponents(result);
            updateMapWithPlace(result);
            analyticsData.usedReverseGeocoding = true;
            showAnalytics();
        } else {
            showError('No se pudo encontrar la dirección especificada');
        }
    });
}

/**
 * Manejar clic en el mapa para reverse geocoding
 * 
 * NOTA IMPORTANTE: Reverse Geocoding (Geocoding API) NO requiere token de sesión
 * porque:
 * - Cada llamada tiene costo fijo independiente
 * - No hay concepto de "sesión" en Geocoding API
 * - No hay descuentos por agrupar llamadas con token
 * - Es diferente a Places API que SÍ beneficia de session tokens
 */
function handleMapClick(event) {
    const location = event.latLng;
    console.log('Clic en mapa:', location.toString());
    
    // Realizar reverse geocoding (SIN token de sesión - no es necesario)
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
 * Configurar event listeners
 */
function setupEventListeners() {
    const addressInput = document.getElementById('addressInput');
    const clearButton = document.getElementById('clearForm');
    const submitButton = document.getElementById('submitForm');
    const restrictCheckbox = document.getElementById('restrictToMexico');
    
    // Debounce en el input (300ms) y crear token de sesión
    addressInput.addEventListener('input', () => {
        // Crear token de sesión solo cuando el usuario empiece a escribir
        if (!sessionToken) {
            createNewSessionToken();
            autocomplete.set('sessionToken', sessionToken);
        }
        
        clearTimeout(debounceTimer);
        showLoading(true);
        searchStartTime = Date.now();
        
        debounceTimer = setTimeout(() => {
            showLoading(false);
        }, 300);
    });
    
    // Botón limpiar
    clearButton.addEventListener('click', clearForm);
    
    // Botón enviar
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleFormSubmit();
    });
    
    // Restricción por país
    restrictCheckbox.addEventListener('change', (e) => {
        updateAutocompleteRestrictions(e.target.checked);
    });
    
    // Enter en el input
    addressInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFormSubmit();
        }
    });
    
    console.log('Event listeners configurados');
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
    fallbackGeocoding(address);
}

/**
 * Actualizar restricciones del autocompletar
 */
function updateAutocompleteRestrictions(restrictToMexico) {
    if (autocomplete) {
        const options = {
            fields: ['place_id', 'geometry', 'formatted_address', 'address_components'],
            types: ['address']
        };
        
        // Solo agregar sessionToken si ya existe
        if (sessionToken) {
            options.sessionToken = sessionToken;
        }
        
        if (restrictToMexico) {
            options.componentRestrictions = { country: 'mx' };
        }
        
        // Recrear autocompletar con nuevas opciones
        const input = document.getElementById('addressInput');
        const currentValue = input.value;
        input.value = '';
        
        autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.addListener('place_changed', handlePlaceSelection);
        
        input.value = currentValue;
        
        console.log('Restricciones actualizadas:', restrictToMexico ? 'México' : 'Global');
    }
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
    map.setCenter({ lat: 19.4326, lng: -99.1332 });
    map.setZoom(10);
    
    // Crear nuevo token de sesión
    createNewSessionToken();
    
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
    indicator.style.display = show ? 'block' : 'none';
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
        <p><strong>Resultados de autocompletar:</strong> ${analyticsData.resultsCount}</p>
        <p><strong>Usó reverse geocoding:</strong> ${analyticsData.usedReverseGeocoding ? 'Sí' : 'No'}</p>
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
    console.log('DOM cargado, iniciando aplicación...');
    initializeApp();
});
