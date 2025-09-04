import { getMapStyle } from './map-styles.js';

let map;
let currentMapType = 'roadmap';
let customMapType = null;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 21.1230729, lng: -101.6650775 },
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Agregar listener para cambios de zoom y centro
    map.addListener('zoom_changed', updateInfo);
    map.addListener('center_changed', updateInfo);

    // Configurar botones de cambio de tipo de mapa
    setupMapTypeButtons();
    
    // Configurar controles personalizados
    setupCustomControls();

    // Actualizar información inicial
    updateInfo();
}

function setupMapTypeButtons() {
    const buttons = document.querySelectorAll('.map-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const mapType = button.getAttribute('data-type');
            
            if (mapType === 'custom') {
                toggleCustomPanel();
                return;
            }
            
            changeMapType(mapType);

            // Actualizar estado activo de los botones
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function setupCustomControls() {
    // Control de zoom
    const zoomSlider = document.getElementById('custom-zoom');
    const zoomValue = document.getElementById('zoom-value');
    
    zoomSlider.addEventListener('input', (e) => {
        zoomValue.textContent = e.target.value;
    });

    // Botón de aplicar personalización
    const applyBtn = document.getElementById('apply-custom');
    applyBtn.addEventListener('click', applyCustomMapType);
}

function toggleCustomPanel() {
    const panel = document.getElementById('custom-panel');
    const customBtn = document.getElementById('custom');
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        customBtn.classList.add('active');
        
        // Desactivar otros botones
        document.querySelectorAll('.map-btn:not(.custom-btn)').forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        panel.classList.add('hidden');
        customBtn.classList.remove('active');
    }
}

function applyCustomMapType() {
    const styleSelect = document.getElementById('custom-style');
    const zoomSlider = document.getElementById('custom-zoom');
    
    const selectedStyle = styleSelect.value;
    const zoom = parseInt(zoomSlider.value);
    
    // Aplicar zoom personalizado
    map.setZoom(zoom);
    
    // Obtener estilo personalizado desde el archivo separado
    const customStyle = getMapStyle(selectedStyle);
    
    if (customStyle) {
        // Crear nuevo tipo de mapa personalizado
        customMapType = new google.maps.StyledMapType(customStyle, {
            name: `Estilo ${selectedStyle}`
        });
        
        // Aplicar el estilo personalizado
        map.mapTypes.set('custom', customMapType);
        map.setMapTypeId('custom');
        
        currentMapType = 'custom';
        
        // Actualizar información
        updateInfo();
        
        // Mostrar confirmación
        showMapTypeChangeEffect(`personalizado (${selectedStyle})`);
        
        // Actualizar estado del botón personalizado
        document.getElementById('custom').classList.add('active');
    }
}

function changeMapType(mapType) {
    let googleMapType;

    switch (mapType) {
        case 'roadmap':
            googleMapType = google.maps.MapTypeId.ROADMAP;
            break;
        case 'satellite':
            googleMapType = google.maps.MapTypeId.SATELLITE;
            break;
        case 'hybrid':
            googleMapType = google.maps.MapTypeId.HYBRID;
            break;
        case 'terrain':
            googleMapType = google.maps.MapTypeId.TERRAIN;
            break;
        default:
            googleMapType = google.maps.MapTypeId.ROADMAP;
    }

    map.setMapTypeId(googleMapType);
    currentMapType = mapType;
    
    // Ocultar panel personalizado si está abierto
    document.getElementById('custom-panel').classList.add('hidden');
    document.getElementById('custom').classList.remove('active');

    // Actualizar información mostrada
    updateInfo();

    // Agregar efecto visual de confirmación
    showMapTypeChangeEffect(mapType);
}

function updateInfo() {
    const center = map.getCenter();
    const zoom = map.getZoom();

    document.getElementById('current-type').textContent = currentMapType;
    document.getElementById('coordinates').textContent =
        `${center.lat().toFixed(3)}, ${center.lng().toFixed(3)}`;
    document.getElementById('zoom-level').textContent = zoom;
    
    // Actualizar información del estilo personalizado
    if (currentMapType === 'custom') {
        const styleSelect = document.getElementById('custom-style');
        document.getElementById('custom-style-info').textContent = 
            styleSelect.options[styleSelect.selectedIndex].text;
    } else {
        document.getElementById('custom-style-info').textContent = 'Ninguno';
    }
}

function showMapTypeChangeEffect(mapType) {
    const mapElement = document.getElementById('map');

    // Agregar clase de transición
    mapElement.classList.add('map-transition');

    // Mostrar notificación temporal
    const notification = document.createElement('div');
    notification.className = 'map-notification';
    notification.textContent = `Cambiado a: ${mapType.toUpperCase()}`;

    document.body.appendChild(notification);

    // Remover notificación después de 2 segundos
    setTimeout(() => {
        notification.remove();
        mapElement.classList.remove('map-transition');
    }, 2000);
}

// Inicializar mapa cuando se carga la página
initMap();