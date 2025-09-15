/**
 * Google Maps Places Demo - Búsqueda y Detalles de Lugares
 * 
 * Este demo implementa:
 * - Nearby Search con geolocalización y filtros avanzados
 * - Text Search y Find Place con Autocomplete
 * - Place Details con campos optimizados
 * - Paginación con next_page_token
 * - Sincronización de markers con panel lateral
 * - Restricciones geográficas (país/estado)
 * - Manejo de errores y accesibilidad
 * 
 * NOTA: Usa isOpen() en lugar de open_now (deprecado desde noviembre 2019)
 * Ver: https://goo.gle/js-open-now
 */

// Variables globales
let map;
let placesService;
let autocompleteService;
let geocoder;
let currentLocation = null;
let currentMarkers = [];
let currentResults = [];
let nextPageToken = null;
let selectedPlaceId = null;
let debounceTimer = null;

// Configuración por defecto
const DEFAULT_LOCATION = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México
const DEFAULT_ZOOM = 13;

// Campos optimizados para Place Details (para reducir costos de API)
const PLACE_DETAILS_FIELDS = [
    'place_id',
    'name',
    'formatted_address',
    'geometry',
    'opening_hours',
    'rating',
    'user_ratings_total',
    'photos',
    'website',
    'international_phone_number',
    'reviews',
    'price_level',
    'types',
    'vicinity'
];

/**
 * Inicialización del mapa y servicios de Google Maps
 */
async function initMap() {
    try {
        // Importar librerías necesarias
        const { Map } = await google.maps.importLibrary("maps");
        const { PlacesService } = await google.maps.importLibrary("places");
        const { Geocoder } = await google.maps.importLibrary("geocoding");
        
        // Inicializar mapa
        map = new Map(document.getElementById("map"), {
            center: DEFAULT_LOCATION,
            zoom: DEFAULT_ZOOM,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        });
        
        // Inicializar servicios
        placesService = new PlacesService(map);
        autocompleteService = new google.maps.places.AutocompleteService();
        geocoder = new Geocoder();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Intentar obtener ubicación del usuario
        requestUserLocation();
        
        console.log('Mapa y servicios inicializados correctamente');
        
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        showError('Error al cargar el mapa. Por favor, recarga la página.');
    }
}

/**
 * Configurar todos los event listeners
 */
function setupEventListeners() {
    // Botones principales
    document.getElementById('nearby-search-btn').addEventListener('click', performNearbySearch);
    document.getElementById('search-btn').addEventListener('click', performTextSearch);
    document.getElementById('clear-filters-btn').addEventListener('click', clearAllFilters);
    
    // Inputs con debounce
    const searchInputs = ['place-input', 'city-input', 'keyword-filter'];
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (inputId === 'place-input' || inputId === 'city-input') {
                    performTextSearch();
                }
            }, 300);
        });
    });
    
    // Filtros que activan búsqueda automática
    const autoSearchFilters = ['type-filter', 'price-min', 'price-max', 'radius-filter'];
    autoSearchFilters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', performNearbySearch);
    });
    
    // Checkboxes que activan búsqueda automática
    const checkboxFilters = ['open-now', 'restrict-country', 'restrict-state'];
    checkboxFilters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('click', performNearbySearch);
    });
    
    // Control de radio con valor visual
    const radiusSlider = document.getElementById('radius-filter');
    const radiusValue = document.getElementById('radius-value');
    
    // Establecer valor inicial
    radiusValue.textContent = `${radiusSlider.value}m`;
    
    radiusSlider.addEventListener('input', (e) => {
        radiusValue.textContent = `${e.target.value}m`;
    });
    
    // Botones de ubicación
    document.getElementById('request-location').addEventListener('click', requestUserLocation);
    document.getElementById('use-default-location').addEventListener('click', useDefaultLocation);
    
    // Panel lateral
    document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('load-more-btn').addEventListener('click', loadMoreResults);
    
    // Modal
    document.getElementById('close-modal').addEventListener('click', closePlaceDetailsModal);
    document.getElementById('place-details-modal').addEventListener('click', (e) => {
        if (e.target.id === 'place-details-modal') {
            closePlaceDetailsModal();
        }
    });
    
    // Configurar Autocomplete para inputs
    setupAutocomplete();
}

// Variables globales para Autocomplete
let placeAutocomplete = null;
let cityAutocomplete = null;

/**
 * Configurar Autocomplete para los inputs de búsqueda
 */
function setupAutocomplete() {
    const placeInput = document.getElementById('place-input');
    const cityInput = document.getElementById('city-input');
    
    // Limpiar autocompletes existentes
    if (placeAutocomplete) {
        google.maps.event.clearInstanceListeners(placeInput);
    }
    if (cityAutocomplete) {
        google.maps.event.clearInstanceListeners(cityInput);
    }
    
    // Obtener filtros actuales
    const filters = getSearchFilters();
    
    // Configuración base para place input
    let placeOptions = {
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
        types: ['establishment', 'geocode']
    };
    
    // Aplicar restricciones según filtros
    if (filters.restrictCountry) {
        const region = filters.region;
        placeOptions.componentRestrictions = { country: [region] };
        console.log(`Restricción por país aplicada: ${region}`);
    }
    
    if (filters.restrictState) {
        // Bounding box de Jalisco, MX
        const jaliscoBounds = {
            north: 22.75, south: 18.92, east: -101.57, west: -105.66
        };
        placeOptions.locationRestriction = jaliscoBounds;
        console.log('Restricción por estado aplicada: Jalisco, MX');
    }
    
    // 1) RESTRICCIÓN POR PAÍS (Autocomplete):
    placeAutocomplete = new google.maps.places.Autocomplete(placeInput, placeOptions);
    
    // 2) "RESTRICCIÓN POR ESTADO" (aprox.): usar locationRestriction (rectángulo sobre un estado)
    const cityOptions = {
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        types: ['(cities)']
    };
    
    if (filters.restrictState) {
        const jaliscoBounds = {
            north: 22.75, south: 18.92, east: -101.57, west: -105.66
        };
        cityOptions.locationRestriction = jaliscoBounds;
    }
    
    cityAutocomplete = new google.maps.places.Autocomplete(cityInput, cityOptions);
    
    // Event listeners para Autocomplete
    placeAutocomplete.addListener('place_changed', () => {
        const place = placeAutocomplete.getPlace();
        if (place.geometry) {
            handlePlaceSelection(place);
        }
    });
    
    cityAutocomplete.addListener('place_changed', () => {
        const place = cityAutocomplete.getPlace();
        if (place.geometry) {
            handleCitySelection(place);
        }
    });
}

/**
 * Solicitar ubicación del usuario
 */
function requestUserLocation() {
    if (!navigator.geolocation) {
        showError('La geolocalización no está disponible en este navegador.');
        useDefaultLocation();
        return;
    }
    
    showLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            map.setCenter(currentLocation);
            map.setZoom(15);
            
            hideLocationOverlay();
            showLoading(false);
            
            // Realizar búsqueda automática cerca del usuario
            performNearbySearch();
            
            console.log('Ubicación obtenida:', currentLocation);
        },
        (error) => {
            console.error('Error al obtener ubicación:', error);
            showError('No se pudo obtener tu ubicación. Usando ubicación por defecto.');
            useDefaultLocation();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
        }
    );
}

/**
 * Usar ubicación por defecto
 */
function useDefaultLocation() {
    currentLocation = DEFAULT_LOCATION;
    map.setCenter(currentLocation);
    map.setZoom(DEFAULT_ZOOM);
    
    hideLocationOverlay();
    showLoading(false);
    
    // Realizar búsqueda automática
    performNearbySearch();
}

/**
 * Ocultar overlay de ubicación
 */
function hideLocationOverlay() {
    document.getElementById('map-overlay').classList.add('hidden');
}

/**
 * Realizar búsqueda nearby con todos los filtros
 */
function performNearbySearch() {
    if (!currentLocation) {
        showError('No hay ubicación disponible. Por favor, permite el acceso a tu ubicación.');
        return;
    }
    
    // Reconfigurar Autocomplete si cambian las restricciones
    setupAutocomplete();
    
    const filters = getSearchFilters();
    
    // 4) Nearby con región y filtros:
    const request = {
        location: currentLocation,
        keyword: filters.keyword,
        type: filters.type,
        language: filters.language,
        region: filters.region
    };
    
    // Solo agregar propiedades si tienen valores válidos
    if (filters.minPrice !== undefined) {
        request.minPriceLevel = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
        request.maxPriceLevel = filters.maxPrice;
    }
    if (filters.openNow) {
        request.openNow = true;
        console.log('Filtro "Abierto ahora" aplicado en Nearby Search');
    }
    
    // IMPORTANTE: No se pueden usar radius y rankBy: DISTANCE al mismo tiempo
    // Google Maps requiere un radio mínimo de 100 metros para usar radius
    // Si el radio es menor a 100m, usamos rankBy: DISTANCE para obtener los más cercanos
    if (filters.radius && filters.radius >= 100) {
        // Si se especifica un radio válido (mínimo 100m), usarlo
        request.radius = filters.radius;
        console.log(`Usando radio: ${filters.radius}m`);
    } else {
        // Si no hay radio o es menor a 100m, usar rankBy DISTANCE para obtener los más cercanos
        request.rankBy = google.maps.places.RankBy.DISTANCE;
        console.log(`Usando rankBy: DISTANCE (radio: ${filters.radius}m)`);
    }
    
    showLoading(true);
    clearResults();
    
    placesService.nearbySearch(request, (results, status, pagination) => {
        showLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            handleSearchResults(results, pagination);
        } else {
            handleSearchError(status);
        }
    });
}

/**
 * Realizar búsqueda de texto
 */
function performTextSearch() {
    const query = document.getElementById('place-input').value.trim();
    const cityQuery = document.getElementById('city-input').value.trim();
    
    if (!query && !cityQuery) {
        return;
    }
    
    const filters = getSearchFilters();
    let searchQuery = query;
    
    // Si hay búsqueda de ciudad, combinar con query principal
    if (cityQuery && query) {
        searchQuery = `${query} en ${cityQuery}`;
    } else if (cityQuery) {
        searchQuery = cityQuery;
    }
    
    // 5) Text Search con query y región:
    const request = {
        query: searchQuery,
        region: filters.region,
        language: filters.language,
        type: filters.type
    };
    
    // Solo agregar propiedades si tienen valores válidos
    if (filters.minPrice !== undefined) {
        request.minprice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
        request.maxprice = filters.maxPrice;
    }
    if (filters.openNow) {
        request.openNow = true;
        console.log('Filtro "Abierto ahora" aplicado en Text Search');
    }
    
    showLoading(true);
    clearResults();
    
    placesService.textSearch(request, (results, status, pagination) => {
        showLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            handleSearchResults(results, pagination);
        } else {
            handleSearchError(status);
        }
    });
}

/**
 * Realizar Find Place search
 */
function performFindPlaceSearch(query) {
    const filters = getSearchFilters();
    
    // 6) Find Place con locationBias (círculo) y fields acotados:
    const request = {
        input: query,
        inputType: 'textquery',
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        locationBias: { 
            radius: 20000, 
            center: currentLocation || DEFAULT_LOCATION 
        }
    };
    
    placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            const place = results[0];
            handlePlaceSelection(place);
        } else {
            handleSearchError(status);
        }
    });
}

/**
 * Obtener filtros de búsqueda del formulario
 */
function getSearchFilters() {
    const openNowChecked = document.getElementById('open-now').checked;
    console.log(`Checkbox "Abierto ahora" está: ${openNowChecked ? 'marcado' : 'desmarcado'}`);
    
    return {
        type: document.getElementById('type-filter').value,
        keyword: document.getElementById('keyword-filter').value.trim(),
        radius: parseInt(document.getElementById('radius-filter').value),
        minPrice: document.getElementById('price-min').value ? parseInt(document.getElementById('price-min').value) : undefined,
        maxPrice: document.getElementById('price-max').value ? parseInt(document.getElementById('price-max').value) : undefined,
        openNow: openNowChecked,
        language: document.getElementById('language-filter').value,
        region: document.getElementById('region-filter').value,
        restrictCountry: document.getElementById('restrict-country').checked,
        restrictState: document.getElementById('restrict-state').checked
    };
}

/**
 * Manejar resultados de búsqueda
 */
function handleSearchResults(results, pagination) {
    currentResults = results;
    nextPageToken = pagination ? pagination.nextPage : null;
    
    displayResults(results);
    displayMarkers(results);
    
    // Mostrar/ocultar botón de paginación
    const paginationDiv = document.getElementById('pagination');
    if (nextPageToken) {
        paginationDiv.classList.remove('hidden');
    } else {
        paginationDiv.classList.add('hidden');
    }
    
    console.log(`Encontrados ${results.length} lugares`);
}

/**
 * Mostrar resultados en el panel lateral
 */
function displayResults(results) {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    
    if (results.length === 0) {
        resultsList.innerHTML = '<p class="no-results">No se encontraron lugares que coincidan con tu búsqueda.</p>';
        return;
    }
    
    results.forEach((place, index) => {
        const resultItem = createResultItem(place, index);
        resultsList.appendChild(resultItem);
    });
}

/**
 * Crear elemento de resultado
 */
function createResultItem(place, index) {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.setAttribute('data-place-id', place.place_id);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Ver detalles de ${place.name}`);
    
    // Información básica
    const name = place.name || 'Sin nombre';
    const address = place.vicinity || place.formatted_address || 'Dirección no disponible';
    const rating = place.rating ? place.rating.toFixed(1) : 'N/A';
    const userRatingsTotal = place.user_ratings_total || 0;
    const priceLevel = place.price_level !== undefined ? '$'.repeat(place.price_level + 1) : '';
    
    // Estado de apertura - usando isOpen() en lugar de open_now (deprecado)
    const openingHours = place.opening_hours;
    let openStatus = '';
    if (openingHours && typeof openingHours.isOpen === 'function') {
        try {
            // isOpen() puede requerir una fecha específica, usar la fecha actual
            const now = new Date();
            const isOpen = openingHours.isOpen(now);
            if (isOpen === true) openStatus = '<span class="open-now">🟢 Abierto ahora</span>';
            else if (isOpen === false) openStatus = '<span class="closed-now">🔴 Cerrado ahora</span>';
        } catch (error) {
            console.warn('Error al verificar estado de apertura:', error);
        }
    }
    
    item.innerHTML = `
        <div class="result-content">
            <h3>${name}</h3>
            <p class="address">${address}</p>
            <div class="rating">
                <span class="stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}</span>
                <span class="rating-text">${rating} (${userRatingsTotal} reseñas)</span>
            </div>
            ${openStatus}
            ${priceLevel ? `<div class="price-level">${priceLevel}</div>` : ''}
        </div>
    `;
    
    // Event listeners
    item.addEventListener('click', () => selectPlace(place.place_id, index));
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectPlace(place.place_id, index);
        }
    });
    
    return item;
}

/**
 * Seleccionar lugar
 */
function selectPlace(placeId, index) {
    selectedPlaceId = placeId;
    
    // Actualizar UI
    document.querySelectorAll('.result-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-place-id="${placeId}"]`).classList.add('active');
    
    // Centrar mapa en el lugar
    const place = currentResults[index];
    if (place.geometry) {
        map.setCenter(place.geometry.location);
        map.setZoom(16);
    }
    
    // Mostrar detalles
    showPlaceDetails(placeId);
}

/**
 * Mostrar markers en el mapa
 */
function displayMarkers(results) {
    // Limpiar markers anteriores
    clearMarkers();
    
    results.forEach((place, index) => {
        if (place.geometry) {
            const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
                animation: google.maps.Animation.DROP
            });
            
            // Info window
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="info-window">
                        <h3>${place.name || 'Sin nombre'}</h3>
                        <p>${place.vicinity || place.formatted_address || 'Dirección no disponible'}</p>
                        ${place.rating ? `<p>⭐ ${place.rating.toFixed(1)} (${place.user_ratings_total || 0} reseñas)</p>` : ''}
                        <button onclick="selectPlace('${place.place_id}', ${index})">Ver detalles</button>
                    </div>
                `
            });
            
            marker.addListener('click', () => {
                selectPlace(place.place_id, index);
            });
            
            currentMarkers.push(marker);
        }
    });
}

/**
 * Limpiar markers del mapa
 */
function clearMarkers() {
    currentMarkers.forEach(marker => marker.setMap(null));
    currentMarkers = [];
}

/**
 * Limpiar resultados
 */
function clearResults() {
    currentResults = [];
    nextPageToken = null;
    clearMarkers();
    document.getElementById('results-list').innerHTML = '';
    document.getElementById('pagination').classList.add('hidden');
}

/**
 * Mostrar detalles del lugar
 */
function showPlaceDetails(placeId) {
    const request = {
        placeId: placeId,
        fields: PLACE_DETAILS_FIELDS
    };
    
    placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayPlaceDetails(place);
        } else {
            showError('Error al cargar los detalles del lugar.');
        }
    });
}

/**
 * Mostrar detalles en modal
 */
function displayPlaceDetails(place) {
    try {
        const modal = document.getElementById('place-details-modal');
        const nameElement = document.getElementById('place-name');
        const contentElement = document.getElementById('place-details-content');
        
        nameElement.textContent = place.name || 'Sin nombre';
        
        // Construir contenido del modal
        let content = '';
    
    // Información básica
    content += `
        <div class="place-detail-section">
            <h3>Información</h3>
            <p><strong>Dirección:</strong> ${place.formatted_address || 'No disponible'}</p>
            <p><strong>Teléfono:</strong> ${place.international_phone_number || 'No disponible'}</p>
            <p><strong>Página web:</strong> ${place.website ? `<a href="${place.website}" target="_blank">${place.website}</a>` : 'No disponible'}</p>
        </div>
    `;
    
    // Calificación y reseñas
    if (place.rating) {
        const rating = place.rating.toFixed(1);
        const totalRatings = place.user_ratings_total || 0;
        content += `
            <div class="place-detail-section">
                <h3>Calificación</h3>
                <p><strong>Puntuación:</strong> ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))} ${rating}/5</p>
                <p><strong>Total de reseñas:</strong> ${totalRatings}</p>
            </div>
        `;
    }
    
    // Horarios
    if (place.opening_hours) {
        const hours = place.opening_hours;
        let hoursText = '';
        
        // Usar isOpen() en lugar de open_now (deprecado)
        if (hours && typeof hours.isOpen === 'function') {
            try {
                // isOpen() puede requerir una fecha específica, usar la fecha actual
                const now = new Date();
                const isOpen = hours.isOpen(now);
                hoursText += `<p><strong>Estado:</strong> ${isOpen ? '🟢 Abierto ahora' : '🔴 Cerrado ahora'}</p>`;
            } catch (error) {
                console.warn('Error al verificar estado de apertura en detalles:', error);
                // Fallback: mostrar horarios sin estado actual
                hoursText += `<p><strong>Estado:</strong> Información no disponible</p>`;
            }
        }
        
        if (hours.weekday_text) {
            hoursText += '<p><strong>Horarios:</strong></p><ul>';
            hours.weekday_text.forEach(day => {
                hoursText += `<li>${day}</li>`;
            });
            hoursText += '</ul>';
        }
        
        content += `
            <div class="place-detail-section">
                <h3>Horarios</h3>
                ${hoursText}
            </div>
        `;
    }
    
    // Fotos
    if (place.photos && place.photos.length > 0) {
        content += `
            <div class="place-detail-section">
                <h3>Fotos</h3>
                <div class="place-photos">
        `;
        
        place.photos.slice(0, 6).forEach(photo => {
            try {
                const photoUrl = photo.getUrl({ maxWidth: 300, maxHeight: 200 });
                content += `<img src="${photoUrl}" alt="Foto del lugar" class="place-photo" onclick="window.open('${photoUrl}', '_blank')">`;
            } catch (error) {
                console.warn('Error al obtener URL de foto:', error);
            }
        });
        
        content += `
                </div>
            </div>
        `;
    }
    
    // Reseñas
    if (place.reviews && place.reviews.length > 0) {
        content += `
            <div class="place-detail-section">
                <h3>Reseñas Recientes</h3>
                <div class="place-reviews">
        `;
        
        place.reviews.slice(0, 3).forEach(review => {
            try {
                const rating = review.rating || 0;
                const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
                const relativeTime = review.time ? new Date(review.time * 1000).toLocaleDateString() : '';
                
                content += `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="review-author">${review.author_name || 'Usuario anónimo'}</span>
                            <span class="review-rating">${stars} ${rating}/5</span>
                        </div>
                        <p class="review-text">${review.text || 'Sin texto'}</p>
                        ${relativeTime ? `<small>${relativeTime}</small>` : ''}
                    </div>
                `;
            } catch (error) {
                console.warn('Error al procesar reseña:', error);
            }
        });
        
        content += `
                </div>
            </div>
        `;
    }
    
    // Acciones
    content += `
        <div class="place-actions">
            ${place.website ? `<a href="${place.website}" target="_blank" class="website-btn">Ver sitio web</a>` : ''}
            ${place.international_phone_number ? `<button class="phone-btn" onclick="window.open('tel:${place.international_phone_number}')">Llamar</button>` : ''}
        </div>
    `;
    
    contentElement.innerHTML = content;
    modal.classList.remove('hidden');
    
    } catch (error) {
        console.error('Error al mostrar detalles del lugar:', error);
        showError('Error al mostrar los detalles del lugar. Por favor, intenta de nuevo.');
    }
}

/**
 * Cerrar modal de detalles
 */
function closePlaceDetailsModal() {
    document.getElementById('place-details-modal').classList.add('hidden');
}

/**
 * Cargar más resultados (paginación)
 */
function loadMoreResults() {
    if (!nextPageToken) return;
    
    showLoading(true);
    
    placesService.nearbySearch({
        pageToken: nextPageToken
    }, (results, status, pagination) => {
        showLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            currentResults = currentResults.concat(results);
            nextPageToken = pagination ? pagination.nextPage : null;
            
            displayResults(currentResults);
            displayMarkers(currentResults);
            
            if (!nextPageToken) {
                document.getElementById('pagination').classList.add('hidden');
            }
        } else {
            handleSearchError(status);
        }
    });
}

/**
 * Manejar selección de lugar desde Autocomplete
 */
function handlePlaceSelection(place) {
    if (place.geometry) {
        map.setCenter(place.geometry.location);
        map.setZoom(16);
        
        // Realizar búsqueda nearby alrededor del lugar seleccionado
        currentLocation = place.geometry.location;
        performNearbySearch();
    }
}

/**
 * Manejar selección de ciudad
 */
function handleCitySelection(place) {
    if (place.geometry) {
        currentLocation = place.geometry.location;
        map.setCenter(currentLocation);
        map.setZoom(13);
        
        // Realizar búsqueda nearby en la ciudad
        performNearbySearch();
    }
}

/**
 * Manejar errores de búsqueda
 */
function handleSearchError(status) {
    let errorMessage = 'Error en la búsqueda.';
    
    switch (status) {
        case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
            errorMessage = 'No se encontraron lugares que coincidan con tu búsqueda.';
            break;
        case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
            errorMessage = 'Se ha excedido el límite de consultas. Intenta más tarde.';
            break;
        case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
            errorMessage = 'Solicitud denegada. Verifica la configuración de la API.';
            break;
        case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
            errorMessage = 'Solicitud inválida. Verifica los parámetros de búsqueda.';
            break;
    }
    
    showError(errorMessage);
}

/**
 * Mostrar error
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Mostrar/ocultar loading
 */
function showLoading(show) {
    const loadingDiv = document.getElementById('loading-indicator');
    if (show) {
        loadingDiv.classList.remove('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

/**
 * Limpiar todos los filtros
 */
function clearAllFilters() {
    document.getElementById('place-input').value = '';
    document.getElementById('city-input').value = '';
    document.getElementById('keyword-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('open-now').checked = false;
    document.getElementById('radius-filter').value = '1000';
    document.getElementById('radius-value').textContent = '1000m';
    document.getElementById('language-filter').value = 'es-419';
    document.getElementById('region-filter').value = 'mx';
    document.getElementById('restrict-country').checked = false;
    document.getElementById('restrict-state').checked = false;
    
    clearResults();
}

/**
 * Alternar panel lateral
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    
    sidebar.classList.toggle('collapsed');
    toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '→' : '←';
}

// Hacer funciones globales para uso en HTML
window.selectPlace = selectPlace;
window.closePlaceDetailsModal = closePlaceDetailsModal;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initMap);