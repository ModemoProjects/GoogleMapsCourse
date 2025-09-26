/**
 * Google Maps Demo Integral con Temas Conmutables
 * 
 * Este demo incluye:
 * - 6 temas conmutables (claro, oscuro, minimalista, movilidad, retail, logística)
 * - Overlays dinámicos según el tema seleccionado
 * - Places Details con horarios de apertura
 * - Capa de tráfico en tiempo real
 * - Persistencia de configuración en localStorage
 * - Accesibilidad completa
 */

// Variables globales
let map;
let trafficLayer;
let currentTheme = 'light';
let currentOverlays = {
    polylines: [],
    polygons: [],
    circles: [],
    markers: [],
    infoWindows: []
};

// Cache para estilos cargados
let stylesCache = {};
let stylesConfig = null;

// Cargar configuración de estilos
async function loadStylesConfig() {
    try {
        const response = await fetch('./styles/styles-config.json');
        stylesConfig = await response.json();
        console.log('Configuración de estilos cargada:', stylesConfig);
    } catch (error) {
        console.error('Error al cargar configuración de estilos:', error);
        // Fallback a configuración básica
        stylesConfig = {
            themes: {
                light: { file: 'light.json', name: 'Tema Claro', icon: '🌞' },
                dark: { file: 'dark.json', name: 'Tema Oscuro', icon: '🌙' },
                minimal: { file: 'minimal.json', name: 'Mapa Minimalista', icon: '📊' },
                mobility: { file: 'mobility.json', name: 'Movilidad', icon: '🚗' },
                retail: { file: 'retail.json', name: 'Retail', icon: '🛍️' },
                logistics: { file: 'logistics.json', name: 'Logística', icon: '📦' }
            },
            defaultTheme: 'light',
            basePath: './styles/',
            cacheEnabled: true,
            fallbackToEmpty: true
        };
    }
}

// Cargar estilos de un tema específico
async function loadThemeStyles(themeName) {
    // Verificar cache si está habilitado
    if (stylesConfig?.cacheEnabled && stylesCache[themeName]) {
        console.log(`Estilos del tema '${themeName}' cargados desde cache`);
        return stylesCache[themeName];
    }

    try {
        const themeConfig = stylesConfig?.themes[themeName];
        if (!themeConfig) {
            throw new Error(`Tema '${themeName}' no encontrado en configuración`);
        }

        const filePath = `${stylesConfig.basePath}${themeConfig.file}`;
        console.log(`Cargando estilos desde: ${filePath}`);
        
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const styles = await response.json();
        
        // Filtrar comentarios y metadatos, solo mantener estilos de Google Maps
        const mapStyles = styles.filter(style => 
            style.elementType || style.featureType
        );
        
        // Guardar en cache si está habilitado
        if (stylesConfig?.cacheEnabled) {
            stylesCache[themeName] = mapStyles;
        }
        
        console.log(`Estilos del tema '${themeName}' cargados exitosamente:`, mapStyles.length, 'reglas');
        return mapStyles;
        
    } catch (error) {
        console.error(`Error al cargar estilos del tema '${themeName}':`, error);
        
        // Fallback según configuración
        if (stylesConfig?.fallbackToEmpty) {
            console.log(`Usando estilos vacíos como fallback para tema '${themeName}'`);
            return [];
        } else {
            throw error;
        }
    }
}

// Obtener estilos de un tema (con cache y fallback)
async function getThemeStyles(themeName) {
    try {
        return await loadThemeStyles(themeName);
    } catch (error) {
        console.warn(`No se pudieron cargar estilos para '${themeName}', usando tema claro como fallback`);
        return await loadThemeStyles('light');
    }
}

// Datos de ejemplo para cada tema
const sampleData = {
    // Coordenadas de León, Guanajuato, México
    center: { lat: 21.1230729, lng: -101.6650775 },
    
    // Rutas de ejemplo para tema movilidad
    mobilityRoutes: [
        {
            path: [
                { lat: 21.1230729, lng: -101.6650775 },
                { lat: 21.1300000, lng: -101.6600000 },
                { lat: 21.1350000, lng: -101.6550000 },
                { lat: 21.1400000, lng: -101.6500000 }
            ],
            color: "#ff5722",
            weight: 4
        },
        {
            path: [
                { lat: 21.1200000, lng: -101.6700000 },
                { lat: 21.1250000, lng: -101.6650000 },
                { lat: 21.1300000, lng: -101.6600000 }
            ],
            color: "#2196f3",
            weight: 3
        }
    ],
    
    // POIs comerciales para tema retail
    retailPOIs: [
        {
            position: { lat: 21.1230729, lng: -101.6650775 },
            title: "Plaza Mayor León",
            placeId: "ChIJN1t_tDeuK4sR8sqRj6f4x8E",
            type: "shopping_mall"
        },
        {
            position: { lat: 21.1300000, lng: -101.6600000 },
            title: "Centro Comercial Galerías",
            placeId: "ChIJN1t_tDeuK4sR8sqRj6f4x8E",
            type: "shopping_mall"
        },
        {
            position: { lat: 21.1350000, lng: -101.6550000 },
            title: "Restaurante El Patio",
            placeId: "ChIJN1t_tDeuK4sR8sqRj6f4x8E",
            type: "restaurant"
        }
    ],
    
    // Zonas de cobertura para tema logística
    logisticsZones: [
        {
            center: { lat: 21.1230729, lng: -101.6650775 },
            radius: 5000, // 5km
            color: "#4caf50",
            fillColor: "#4caf50",
            fillOpacity: 0.2,
            title: "Zona Centro"
        },
        {
            center: { lat: 21.1300000, lng: -101.6600000 },
            radius: 3000, // 3km
            color: "#2196f3",
            fillColor: "#2196f3",
            fillOpacity: 0.2,
            title: "Zona Norte"
        },
        {
            center: { lat: 21.1150000, lng: -101.6700000 },
            radius: 4000, // 4km
            color: "#ff9800",
            fillColor: "#ff9800",
            fillOpacity: 0.2,
            title: "Zona Sur"
        }
    ],
    
    // Puntos de distribución para logística
    distributionPoints: [
        {
            position: { lat: 21.1230729, lng: -101.6650775 },
            title: "Centro de Distribución Principal",
            type: "warehouse"
        },
        {
            position: { lat: 21.1300000, lng: -101.6600000 },
            title: "Punto de Carga Norte",
            type: "loading_dock"
        },
        {
            position: { lat: 21.1150000, lng: -101.6700000 },
            title: "Almacén Sur",
            type: "warehouse"
        }
    ]
};

// Inicialización del mapa
async function initMap() {
    try {
        // Cargar configuración de estilos
        await loadStylesConfig();
        
        // Ocultar loading
        document.getElementById('loading').style.display = 'none';
        
        // Importar librerías necesarias
        const { Map } = await google.maps.importLibrary("maps");
        const { PlacesService } = await google.maps.importLibrary("places");
        
        // Cargar estilos del tema inicial
        const initialStyles = await getThemeStyles(currentTheme);
        
        // Crear el mapa
        map = new Map(document.getElementById("map"), {
            center: sampleData.center,
            zoom: 12,
            styles: initialStyles,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            mapTypeId: 'roadmap'
        });
        
        // Inicializar capa de tráfico
        trafficLayer = new google.maps.TrafficLayer();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Restaurar tema guardado
        restoreTheme();
        
        // Aplicar tema inicial
        await applyTheme(currentTheme);
        
        console.log('Mapa inicializado correctamente');
        
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        document.getElementById('loading').innerHTML = '<p>Error al cargar el mapa. Verifica tu conexión a internet.</p>';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Selector de tema
    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', async (e) => {
        currentTheme = e.target.value;
        await applyTheme(currentTheme);
        saveTheme(currentTheme);
    });
    
    // Toggle de tráfico
    const trafficToggle = document.getElementById('traffic-toggle');
    trafficToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            trafficLayer.setMap(map);
        } else {
            trafficLayer.setMap(null);
        }
    });
    
    // Botón de cargar POIs retail
    const loadRetailPOIs = document.getElementById('load-retail-pois');
    loadRetailPOIs.addEventListener('click', loadRetailData);
    
    // Botón de cargar datos logísticos
    const loadLogisticsData = document.getElementById('load-logistics-data');
    loadLogisticsData.addEventListener('click', loadLogisticsDataClickEvent);
    
    // Cerrar panel de información
    const closeInfo = document.getElementById('close-info');
    closeInfo.addEventListener('click', () => {
        document.getElementById('info-panel').style.display = 'none';
    });
}

// Aplicar tema seleccionado
async function applyTheme(theme) {
    try {
        // Limpiar overlays existentes
        clearOverlays();
        
        // Cargar estilos del tema
        const themeStyles = await getThemeStyles(theme);
        
        // Aplicar estilos del mapa
        map.setOptions({ styles: themeStyles });
        
        // Mostrar/ocultar controles específicos del tema
        hideAllThemeControls();
        
        switch (theme) {
            case 'mobility':
                showMobilityTheme();
                break;
            case 'retail':
                showRetailTheme();
                break;
            case 'logistics':
                showLogisticsTheme();
                break;
            case 'minimal':
                showMinimalTheme();
                break;
            default:
                // Tema claro u oscuro - sin overlays adicionales
                break;
        }
        
        // Actualizar UI
        updateThemeUI(theme);
        
        console.log(`Tema '${theme}' aplicado exitosamente`);
        
    } catch (error) {
        console.error(`Error al aplicar tema '${theme}':`, error);
        // Intentar con tema claro como fallback
        if (theme !== 'light') {
            console.log('Intentando aplicar tema claro como fallback...');
            await applyTheme('light');
        }
    }
}

// Mostrar tema de movilidad
function showMobilityTheme() {
    document.getElementById('mobility-controls').style.display = 'block';
    
    // Cargar rutas de ejemplo
    loadMobilityRoutes();
}

// Mostrar tema retail
function showRetailTheme() {
    document.getElementById('retail-controls').style.display = 'block';
}

// Mostrar tema logística
function showLogisticsTheme() {
    document.getElementById('logistics-controls').style.display = 'block';
}

// Mostrar tema minimalista
function showMinimalTheme() {
    // El tema minimalista solo cambia los estilos, no agrega overlays
}

// Ocultar todos los controles de tema
function hideAllThemeControls() {
    const controls = document.querySelectorAll('.theme-control-group');
    controls.forEach(control => {
        control.style.display = 'none';
    });
}

// Actualizar UI según el tema
function updateThemeUI(theme) {
    const themeSelect = document.getElementById('theme-select');
    themeSelect.value = theme;
}

// Cargar rutas de movilidad
function loadMobilityRoutes() {
    sampleData.mobilityRoutes.forEach(route => {
        const polyline = new google.maps.Polyline({
            path: route.path,
            geodesic: true,
            strokeColor: route.color,
            strokeOpacity: 1.0,
            strokeWeight: route.weight
        });
        
        polyline.setMap(map);
        currentOverlays.polylines.push(polyline);
    });
}

// Cargar datos retail
function loadRetailData() {
    sampleData.retailPOIs.forEach(poi => {
        const marker = new google.maps.Marker({
            position: poi.position,
            map: map,
            title: poi.title,
            icon: {
                url: getMarkerIcon(poi.type),
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        // Agregar click listener para Places Details
        marker.addListener('click', () => {
            loadPlaceDetails(poi.placeId, poi.title);
        });
        
        currentOverlays.markers.push(marker);
    });
}

// Cargar datos logísticos
function loadLogisticsDataClickEvent() {
    // Cargar zonas de cobertura
    sampleData.logisticsZones.forEach(zone => {
        const circle = new google.maps.Circle({
            strokeColor: zone.color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: zone.fillColor,
            fillOpacity: zone.fillOpacity,
            map: map,
            center: zone.center,
            radius: zone.radius
        });
        
        currentOverlays.circles.push(circle);
    });
    
    // Cargar puntos de distribución
    sampleData.distributionPoints.forEach(point => {
        const marker = new google.maps.Marker({
            position: point.position,
            map: map,
            title: point.title,
            icon: {
                url: getMarkerIcon(point.type),
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        currentOverlays.markers.push(marker);
    });
}

// Obtener icono según el tipo
function getMarkerIcon(type) {
    const icons = {
        shopping_mall: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        restaurant: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        warehouse: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        loading_dock: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    };
    return icons[type] || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
}

// Cargar detalles de un lugar usando Places API
function loadPlaceDetails(placeId, placeName) {
    const service = new google.maps.places.PlacesService(map);
    
    const request = {
        placeId: placeId,
        fields: ['name', 'opening_hours', 'rating', 'user_ratings_total', 'formatted_address', 'website', 'photos']
    };
    
    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayPlaceDetails(place);
        } else {
            // Mostrar datos de ejemplo si no se puede cargar
            displayPlaceDetails({
                name: placeName,
                formatted_address: "Dirección no disponible",
                rating: 4.2,
                user_ratings_total: 150,
                opening_hours: {
                    open_now: true,
                    weekday_text: [
                        "Lunes: 9:00 AM – 10:00 PM",
                        "Martes: 9:00 AM – 10:00 PM",
                        "Miércoles: 9:00 AM – 10:00 PM",
                        "Jueves: 9:00 AM – 10:00 PM",
                        "Viernes: 9:00 AM – 11:00 PM",
                        "Sábado: 9:00 AM – 11:00 PM",
                        "Domingo: 10:00 AM – 9:00 PM"
                    ]
                }
            });
        }
    });
}

// Mostrar detalles del lugar en el panel lateral
function displayPlaceDetails(place) {
    const infoPanel = document.getElementById('info-panel');
    const placeName = document.getElementById('place-name');
    const placeDetails = document.getElementById('place-details');
    
    placeName.textContent = place.name || 'Nombre no disponible';
    
    let detailsHTML = `
        <div class="place-info">
            <p><strong>Dirección:</strong> ${place.formatted_address || 'No disponible'}</p>
    `;
    
    if (place.rating) {
        detailsHTML += `<p><strong>Calificación:</strong> ${place.rating}/5 (${place.user_ratings_total || 0} reseñas)</p>`;
    }
    
    if (place.website) {
        detailsHTML += `<p><strong>Sitio web:</strong> <a href="${place.website}" target="_blank">${place.website}</a></p>`;
    }
    
    if (place.opening_hours) {
        const isOpen = place.opening_hours.open_now;
        detailsHTML += `
            <div class="opening-hours">
                <p><strong>Estado:</strong> <span class="${isOpen ? 'open' : 'closed'}">${isOpen ? 'Abierto ahora' : 'Cerrado'}</span></p>
                <details>
                    <summary>Horarios de apertura</summary>
                    <ul>
        `;
        
        if (place.opening_hours.weekday_text) {
            place.opening_hours.weekday_text.forEach(day => {
                detailsHTML += `<li>${day}</li>`;
            });
        }
        
        detailsHTML += `
                    </ul>
                </details>
            </div>
        `;
    } else {
        detailsHTML += '<p><em>Horarios no disponibles</em></p>';
    }
    
    detailsHTML += '</div>';
    
    placeDetails.innerHTML = detailsHTML;
    infoPanel.style.display = 'block';
}

// Limpiar todos los overlays
function clearOverlays() {
    // Limpiar polylines
    currentOverlays.polylines.forEach(polyline => polyline.setMap(null));
    currentOverlays.polylines = [];
    
    // Limpiar polígonos
    currentOverlays.polygons.forEach(polygon => polygon.setMap(null));
    currentOverlays.polygons = [];
    
    // Limpiar círculos
    currentOverlays.circles.forEach(circle => circle.setMap(null));
    currentOverlays.circles = [];
    
    // Limpiar marcadores
    currentOverlays.markers.forEach(marker => marker.setMap(null));
    currentOverlays.markers = [];
    
    // Cerrar info windows
    currentOverlays.infoWindows.forEach(infoWindow => infoWindow.close());
    currentOverlays.infoWindows = [];
}

// Guardar tema en localStorage
function saveTheme(theme) {
    localStorage.setItem('mapTheme', theme);
}

// Restaurar tema desde localStorage
function restoreTheme() {
    const savedTheme = localStorage.getItem('mapTheme');
    if (savedTheme && mapStyles[savedTheme]) {
        currentTheme = savedTheme;
    }
}

// Inicializar la aplicación
initMap();