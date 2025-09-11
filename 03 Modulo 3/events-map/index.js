// Variables globales
let map;
let markers = [];
let clickEventsEnabled = true;
let dragEventsEnabled = true;
let stats = {
    clicks: 0,
    markers: 0,
    zooms: 0
};

// Inicialización del mapa
async function initMap() {
    const { Map, Marker, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    // Crear el mapa
    map = new Map(document.getElementById("map"), {
        center: { lat: 21.1230729, lng: -101.6650775 },
        zoom: 11,
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    });

    // Configurar eventos del mapa
    setupMapEvents();
    
    // Configurar controles de la interfaz
    setupControls();
    
    // Actualizar información inicial
    updateMapInfo();
    
    console.log('️ Mapa inicializado correctamente');
}

// Configurar eventos del mapa
function setupMapEvents() {
    // Evento de clic en el mapa
    map.addListener('click', (event) => {
        if (!clickEventsEnabled) return;
        
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Actualizar estadísticas
        stats.clicks++;
        updateStats();
        
        // Actualizar información del último clic
        document.getElementById('last-click').textContent = 
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // Agregar marcador en el punto clicado
        addMarker(event.latLng, `Clic #${stats.clicks}`);
        
        // Log del evento
        logEvent('click', `Clic en: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        
        console.log(`🖱️ Clic en: ${lat}, ${lng}`);
    });

    // Evento de arrastre
    map.addListener('drag', () => {
        if (!dragEventsEnabled) return;
        logEvent('drag', 'Mapa arrastrado');
    });

    // Evento de fin de arrastre
    map.addListener('dragend', () => {
        if (!dragEventsEnabled) return;
        updateMapInfo();
        logEvent('dragend', 'Arrastre finalizado');
    });

    // Evento de zoom
    map.addListener('zoom_changed', () => {
        stats.zooms++;
        updateStats();
        updateMapInfo();
        logEvent('zoom', `Zoom cambiado a: ${map.getZoom()}`);
    });

    // Evento de cambio de centro
    map.addListener('center_changed', () => {
        updateMapInfo();
    });

    // Evento de cambio de tipo de mapa
    map.addListener('maptypeid_changed', () => {
        logEvent('maptype', `Tipo de mapa: ${map.getMapTypeId()}`);
    });

    // Evento de clic derecho
    map.addListener('rightclick', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        logEvent('rightclick', `Clic derecho en: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });

    // Evento de doble clic
    map.addListener('dblclick', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        logEvent('dblclick', `Doble clic en: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });

    // Evento de mouse sobre el mapa
    map.addListener('mousemove', (event) => {
        // Solo loggear ocasionalmente para no saturar
        if (Math.random() < 0.01) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            logEvent('mousemove', `Mouse: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    });
}

// Configurar controles de la interfaz
function setupControls() {
    // Toggle de eventos de clic
    document.getElementById('toggle-click-events').addEventListener('click', () => {
        clickEventsEnabled = !clickEventsEnabled;
        const btn = document.getElementById('toggle-click-events');
        btn.textContent = clickEventsEnabled ? 'Desactivar Clics' : 'Activar Clics';
        btn.className = clickEventsEnabled ? 'btn btn-primary' : 'btn btn-secondary';
        logEvent('control', `Eventos de clic ${clickEventsEnabled ? 'activados' : 'desactivados'}`);
    });

    // Toggle de eventos de arrastre
    document.getElementById('toggle-drag-events').addEventListener('click', () => {
        dragEventsEnabled = !dragEventsEnabled;
        const btn = document.getElementById('toggle-drag-events');
        btn.textContent = dragEventsEnabled ? 'Desactivar Arrastre' : 'Activar Arrastre';
        btn.className = dragEventsEnabled ? 'btn btn-primary' : 'btn btn-secondary';
        logEvent('control', `Eventos de arrastre ${dragEventsEnabled ? 'activados' : 'desactivados'}`);
    });

    // Agregar marcador
    document.getElementById('add-marker-btn').addEventListener('click', () => {
        const center = map.getCenter();
        addMarker(center, `Marcador #${markers.length + 1}`);
        logEvent('control', 'Marcador agregado');
    });

    // Limpiar marcadores
    document.getElementById('clear-markers-btn').addEventListener('click', () => {
        clearMarkers();
        logEvent('control', 'Marcadores limpiados');
    });

    // Cambiar tipo de mapa
    document.getElementById('map-type').addEventListener('change', (event) => {
        map.setMapTypeId(event.target.value);
        logEvent('control', `Tipo de mapa cambiado a: ${event.target.value}`);
    });

    // Limpiar log
    document.getElementById('clear-log-btn').addEventListener('click', () => {
        document.getElementById('events-list').innerHTML = '';
        logEvent('control', 'Log limpiado');
    });
}

// Agregar marcador
function addMarker(position, title) {
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        draggable: true
    });

    // InfoWindow para el marcador
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h4>${title}</h4>
                <p><strong>Latitud:</strong> ${position.lat().toFixed(6)}</p>
                <p><strong>Longitud:</strong> ${position.lng().toFixed(6)}</p>
                <button onclick="removeMarker('${markers.length}')" style="margin-top: 10px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Eliminar</button>
            </div>
        `
    });

    // Eventos del marcador
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
        logEvent('marker', `Clic en marcador: ${title}`);
    });

    marker.addListener('drag', () => {
        logEvent('marker', `Arrastrando marcador: ${title}`);
    });

    marker.addListener('dragend', () => {
        const newPos = marker.getPosition();
        logEvent('marker', `Marcador ${title} movido a: ${newPos.lat().toFixed(6)}, ${newPos.lng().toFixed(6)}`);
    });

    markers.push({ marker, infoWindow });
    stats.markers = markers.length;
    updateStats();
    
    console.log(` Marcador agregado: ${title}`);
}

// Eliminar marcador específico
function removeMarker(index) {
    if (markers[index]) {
        markers[index].marker.setMap(null);
        markers[index].infoWindow.close();
        markers.splice(index, 1);
        stats.markers = markers.length;
        updateStats();
        logEvent('marker', `Marcador eliminado`);
    }
}

// Limpiar todos los marcadores
function clearMarkers() {
    markers.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
    });
    markers = [];
    stats.markers = 0;
    updateStats();
}

// Actualizar información del mapa
function updateMapInfo() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    document.getElementById('center-coords').textContent = 
        `${center.lat().toFixed(6)}, ${center.lng().toFixed(6)}`;
    document.getElementById('zoom-level').textContent = zoom;
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('click-count').textContent = stats.clicks;
    document.getElementById('marker-count').textContent = stats.markers;
    document.getElementById('zoom-count').textContent = stats.zooms;
}

// Log de eventos
function logEvent(type, message) {
    const eventsList = document.getElementById('events-list');
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    const timestamp = new Date().toLocaleTimeString();
    const typeIcon = getEventIcon(type);
    
    eventItem.innerHTML = `
        <strong>${typeIcon} ${type.toUpperCase()}</strong><br>
        <span style="color: #666; font-size: 0.8em;">${timestamp}</span><br>
        <span>${message}</span>
    `;
    
    eventsList.insertBefore(eventItem, eventsList.firstChild);
    
    // Limitar a 50 eventos
    while (eventsList.children.length > 50) {
        eventsList.removeChild(eventsList.lastChild);
    }
}

// Obtener icono para tipo de evento
function getEventIcon(type) {
    const icons = {
        click: '️',
        drag: '',
        dragend: '✋',
        zoom: '',
        maptype: '🗺️',
        rightclick: '🖱️',
        dblclick: '️🖱️',
        mousemove: '️',
        marker: '',
        control: ''
    };
    return icons[type] || '📝';
}

// Inicializar la aplicación
initMap();

// Hacer funciones globales para uso en HTML
window.removeMarker = removeMarker;