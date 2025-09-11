let map;
let polylines = [];
let polygons = [];
let circles = [];
let measurementInfo = null;
let editMode = false;
let draggableMarkers = [];
let drawingManager = null;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { DrawingManager } = await google.maps.importLibrary("drawing");
    
    // Crear el mapa centrado en León, Guanajuato
    map = new Map(document.getElementById("map"), {
        center: { lat: 21.1230729, lng: -101.6650775 },
        zoom: 12,
        mapId: "DEMO_MAP_ID"
    });

    // Crear controles personalizados
    createControls();
    
    // El mapa inicia limpio - los usuarios pueden crear elementos con las herramientas
}

function createControls() {
    // Crear panel de controles
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    
    controlPanel.innerHTML = `
        <h3>🎛️ Controles del Mapa</h3>
        <div class="control-group">
            <label><input type="checkbox" id="togglePolylines"> Polylines (Rutas)</label>
        </div>
        <div class="control-group">
            <label><input type="checkbox" id="togglePolygons"> Polygons (Áreas)</label>
        </div>
        <div class="control-group">
            <label><input type="checkbox" id="toggleCircles"> Circles (Zonas)</label>
        </div>
        <div class="control-group">
            <label><input type="checkbox" id="toggleMeasurements"> 📏 Mediciones</label>
        </div>
        <div class="control-group">
            <label><input type="checkbox" id="toggleDrawingTools"> 🛠️ Herramientas de Dibujo</label>
        </div>
        <div class="control-group">
            <label><input type="checkbox" id="toggleEditMode"> ✏️ Modo Edición</label>
        </div>
        <button id="clearAll" class="clear-button">🗑️ Limpiar Todo</button>
        <button id="exportData" class="export-button">💾 Exportar Datos</button>
        <button id="importData" class="import-button">📁 Importar Datos</button>
        <input type="file" id="fileInput" accept=".json" style="display: none;">
    `;
    
    document.body.appendChild(controlPanel);
    
    // Event listeners para los controles
    document.getElementById('togglePolylines').addEventListener('change', togglePolylines);
    document.getElementById('togglePolygons').addEventListener('change', togglePolygons);
    document.getElementById('toggleCircles').addEventListener('change', toggleCircles);
    document.getElementById('toggleMeasurements').addEventListener('change', toggleMeasurements);
    document.getElementById('toggleDrawingTools').addEventListener('change', toggleDrawingTools);
    document.getElementById('toggleEditMode').addEventListener('change', toggleEditMode);
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('exportData').addEventListener('click', exportMapData);
    document.getElementById('importData').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', importMapData);
}

function drawPolylines() {
    // Ruta 1: Centro histórico de León
    const route1 = [
        { lat: 21.1215, lng: -101.6685 }, // Plaza Principal
        { lat: 21.1220, lng: -101.6670 }, // Catedral
        { lat: 21.1235, lng: -101.6660 }, // Teatro Manuel Doblado
        { lat: 21.1250, lng: -101.6650 }, // Mercado
        { lat: 21.1245, lng: -101.6635 }  // Zona Rosa
    ];
    
    const polyline1 = new google.maps.Polyline({
        path: route1,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map,
        // Agregar animación de pulso
        icons: [{
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.8
            },
            offset: '0%',
            repeat: '20px'
        }]
    });
    
    // Ruta 2: Ruta comercial
    const route2 = [
        { lat: 21.1200, lng: -101.6700 },
        { lat: 21.1180, lng: -101.6680 },
        { lat: 21.1160, lng: -101.6660 },
        { lat: 21.1140, lng: -101.6640 }
    ];
    
    const polyline2 = new google.maps.Polyline({
        path: route2,
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map,
        // Agregar animación de línea punteada
        icons: [{
            icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#0000FF"
            },
            offset: '0%',
            repeat: '10px'
        }]
    });
    
    polylines.push(polyline1, polyline2);
}

function drawPolygons() {
    // Área 1: Zona Centro
    const centroArea = [
        { lat: 21.1200, lng: -101.6700 },
        { lat: 21.1200, lng: -101.6650 },
        { lat: 21.1250, lng: -101.6650 },
        { lat: 21.1250, lng: -101.6700 }
    ];
    
    const polygon1 = new google.maps.Polygon({
        paths: centroArea,
        strokeColor: "#00FF00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00FF00",
        fillOpacity: 0.2,
        map: map
    });
    
    // Área 2: Zona Industrial
    const industrialArea = [
        { lat: 21.1100, lng: -101.6600 },
        { lat: 21.1100, lng: -101.6550 },
        { lat: 21.1150, lng: -101.6550 },
        { lat: 21.1150, lng: -101.6600 }
    ];
    
    const polygon2 = new google.maps.Polygon({
        paths: industrialArea,
        strokeColor: "#FF8000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF8000",
        fillOpacity: 0.3,
        map: map
    });
    
    polygons.push(polygon1, polygon2);
}

function drawCircles() {
    // Círculo 1: Zona de influencia del centro
    const circle1 = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.15,
        map: map,
        center: { lat: 21.1225, lng: -101.6675 },
        radius: 1000 // 1km en metros
    });
    
    // Agregar efecto de pulso al círculo 1
    setInterval(() => {
        const currentOpacity = circle1.get('fillOpacity');
        const newOpacity = currentOpacity === 0.15 ? 0.3 : 0.15;
        circle1.set('fillOpacity', newOpacity);
    }, 2000);
    
    // Círculo 2: Zona de influencia comercial
    const circle2 = new google.maps.Circle({
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.15,
        map: map,
        center: { lat: 21.1180, lng: -101.6650 },
        radius: 800 // 800m en metros
    });
    
    // Círculo 3: Zona residencial
    const circle3 = new google.maps.Circle({
        strokeColor: "#00AA00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00AA00",
        fillOpacity: 0.15,
        map: map,
        center: { lat: 21.1300, lng: -101.6600 },
        radius: 1200 // 1.2km en metros
    });
    
    circles.push(circle1, circle2, circle3);
}

function addMarkers() {
    // Marcadores de puntos de interés
    const markers = [
        {
            position: { lat: 21.1215, lng: -101.6685 },
            title: "Plaza Principal",
            content: "Centro histórico de León"
        },
        {
            position: { lat: 21.1220, lng: -101.6670 },
            title: "Catedral de León",
            content: "Catedral Basílica de Nuestra Señora de la Luz"
        },
        {
            position: { lat: 21.1180, lng: -101.6650 },
            title: "Zona Comercial",
            content: "Área comercial principal"
        }
    ];
    
    markers.forEach((markerData, index) => {
        const marker = new google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.title,
            // Agregar animación de caída
            animation: google.maps.Animation.DROP,
            // Icono personalizado con efecto de pulso
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 15,
                fillColor: index === 0 ? '#FF0000' : index === 1 ? '#00FF00' : '#0000FF',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${markerData.title}</h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 14px;">${markerData.content}</p>
                    <div style="margin-top: 8px; font-size: 12px; color: #95a5a6;">
                        Lat: ${markerData.position.lat.toFixed(6)}<br>
                        Lng: ${markerData.position.lng.toFixed(6)}
                    </div>
                </div>
            `
        });
        
        // Efecto de hover
        marker.addListener("mouseover", () => {
            marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 20,
                fillColor: index === 0 ? '#FF0000' : index === 1 ? '#00FF00' : '#0000FF',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 4
            });
        });
        
        marker.addListener("mouseout", () => {
            marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 15,
                fillColor: index === 0 ? '#FF0000' : index === 1 ? '#00FF00' : '#0000FF',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
            });
        });
        
        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });
    });
}

// Funciones de control
function togglePolylines() {
    const isVisible = document.getElementById('togglePolylines').checked;
    
    if (isVisible && polylines.length === 0) {
        // Si está marcado pero no hay polylines, redibujar
        drawPolylines();
    } else {
        // Si no está marcado o ya existen, solo mostrar/ocultar
        polylines.forEach(polyline => {
            polyline.setMap(isVisible ? map : null);
        });
    }
}

function togglePolygons() {
    const isVisible = document.getElementById('togglePolygons').checked;
    
    if (isVisible && polygons.length === 0) {
        // Si está marcado pero no hay polygons, redibujar
        drawPolygons();
    } else {
        // Si no está marcado o ya existen, solo mostrar/ocultar
        polygons.forEach(polygon => {
            polygon.setMap(isVisible ? map : null);
        });
    }
}

function toggleCircles() {
    const isVisible = document.getElementById('toggleCircles').checked;
    
    if (isVisible && circles.length === 0) {
        // Si está marcado pero no hay circles, redibujar
        drawCircles();
    } else {
        // Si no está marcado o ya existen, solo mostrar/ocultar
        circles.forEach(circle => {
            circle.setMap(isVisible ? map : null);
        });
    }
}

function clearAll() {
    // Limpiar polylines
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = [];
    
    // Limpiar polygons
    polygons.forEach(polygon => polygon.setMap(null));
    polygons = [];
    
    // Limpiar circles
    circles.forEach(circle => circle.setMap(null));
    circles = [];
    
    // Desmarcar checkboxes
    document.getElementById('togglePolylines').checked = false;
    document.getElementById('togglePolygons').checked = false;
    document.getElementById('toggleCircles').checked = false;
}

function redrawElements() {
    // Redibujar elementos si están marcados los checkboxes
    if (document.getElementById('togglePolylines').checked) {
        drawPolylines();
    }
    if (document.getElementById('togglePolygons').checked) {
        drawPolygons();
    }
    if (document.getElementById('toggleCircles').checked) {
        drawCircles();
    }
}

// Función para calcular distancia entre dos puntos usando Google Maps Geometry
function calculateDistance(point1, point2) {
    return google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000; // Convertir a km
}

// Función para calcular área de un polígono usando Google Maps Geometry
function calculatePolygonArea(points) {
    if (points.length < 3) return 0;
    return google.maps.geometry.spherical.computeArea(points) / 1000000; // Convertir a km²
}

// Función para calcular longitud de una polyline usando Google Maps Geometry
function calculatePolylineLength(path) {
    let totalLength = 0;
    for (let i = 0; i < path.getLength() - 1; i++) {
        const point1 = path.getAt(i);
        const point2 = path.getAt(i + 1);
        totalLength += google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
    }
    return totalLength / 1000; // Convertir a km
}

function toggleMeasurements() {
    const isVisible = document.getElementById('toggleMeasurements').checked;
    
    if (isVisible) {
        showMeasurements();
    } else {
        hideMeasurements();
    }
}

function showMeasurements() {
    // Eliminar panel existente si existe
    if (measurementInfo) {
        measurementInfo.remove();
        measurementInfo = null;
    }
    
    measurementInfo = document.createElement('div');
    measurementInfo.className = 'measurement-panel';
    measurementInfo.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 300px;
        backdrop-filter: blur(10px);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    // Calcular mediciones
    let measurementsHTML = `<h4 style="margin: 0 0 10px 0; color: #2c3e50;">📏 Mediciones</h4>
        <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 10px; text-align: center;">
            Total: ${polylines.length} polylines, ${polygons.length} polygons, ${circles.length} circles
        </div>`;
    
    // Mediciones de polylines usando Google Maps Geometry
    if (polylines.length > 0) {
        measurementsHTML += '<div style="margin-bottom: 10px;"><strong>Polylines (Google Maps Geometry):</strong></div>';
        polylines.forEach((polyline, index) => {
            const path = polyline.getPath();
            const totalDistance = calculatePolylineLength(path);
            measurementsHTML += `<div style="font-size: 12px; color: #7f8c8d; margin-left: 10px;">
                Ruta ${index + 1}: ${totalDistance.toFixed(2)} km
            </div>`;
        });
    }
    
    // Mediciones de polygons usando Google Maps Geometry
    if (polygons.length > 0) {
        measurementsHTML += '<div style="margin: 10px 0;"><strong>Polygons (Google Maps Geometry):</strong></div>';
        polygons.forEach((polygon, index) => {
            const path = polygon.getPath();
            const points = [];
            for (let i = 0; i < path.getLength(); i++) {
                const point = path.getAt(i);
                points.push(new google.maps.LatLng(point.lat(), point.lng()));
            }
            const area = calculatePolygonArea(points);
            measurementsHTML += `<div style="font-size: 12px; color: #7f8c8d; margin-left: 10px;">
                Área ${index + 1}: ${area.toFixed(2)} km²
            </div>`;
        });
    }
    
    // Mediciones de circles
    if (circles.length > 0) {
        measurementsHTML += '<div style="margin: 10px 0;"><strong>Circles:</strong></div>';
        circles.forEach((circle, index) => {
            const radius = circle.getRadius();
            const area = Math.PI * (radius / 1000) * (radius / 1000); // Convertir a km²
            measurementsHTML += `<div style="font-size: 12px; color: #7f8c8d; margin-left: 10px;">
                Círculo ${index + 1}: Radio ${(radius / 1000).toFixed(2)} km, Área ${area.toFixed(2)} km²
            </div>`;
        });
    }
    
    // Si no hay elementos, mostrar mensaje
    if (polylines.length === 0 && polygons.length === 0 && circles.length === 0) {
        measurementsHTML += `
            <div style="text-align: center; color: #95a5a6; font-style: italic; margin-top: 20px;">
                No hay elementos para medir.<br>
                <small>Usa las herramientas de dibujo para crear elementos.</small>
            </div>
        `;
    }
    
    measurementInfo.innerHTML = measurementsHTML;
    document.body.appendChild(measurementInfo);
}

function hideMeasurements() {
    if (measurementInfo) {
        measurementInfo.remove();
        measurementInfo = null;
    }
}

function updateMeasurementsIfVisible() {
    if (document.getElementById('toggleMeasurements').checked) {
        showMeasurements();
    }
}

function exportMapData() {
    const mapData = {
        polylines: polylines.map(polyline => {
            const path = polyline.getPath();
            const coordinates = [];
            for (let i = 0; i < path.getLength(); i++) {
                const point = path.getAt(i);
                coordinates.push({
                    lat: point.lat(),
                    lng: point.lng()
                });
            }
            return {
                coordinates,
                strokeColor: polyline.get('strokeColor'),
                strokeOpacity: polyline.get('strokeOpacity'),
                strokeWeight: polyline.get('strokeWeight')
            };
        }),
        polygons: polygons.map(polygon => {
            const path = polygon.getPath();
            const coordinates = [];
            for (let i = 0; i < path.getLength(); i++) {
                const point = path.getAt(i);
                coordinates.push({
                    lat: point.lat(),
                    lng: point.lng()
                });
            }
            return {
                coordinates,
                strokeColor: polygon.get('strokeColor'),
                fillColor: polygon.get('fillColor'),
                strokeOpacity: polygon.get('strokeOpacity'),
                fillOpacity: polygon.get('fillOpacity')
            };
        }),
        circles: circles.map(circle => ({
            center: {
                lat: circle.getCenter().lat(),
                lng: circle.getCenter().lng()
            },
            radius: circle.getRadius(),
            strokeColor: circle.get('strokeColor'),
            fillColor: circle.get('fillColor'),
            strokeOpacity: circle.get('strokeOpacity'),
            fillOpacity: circle.get('fillOpacity')
        })),
        exportDate: new Date().toISOString()
    };
    
    // Crear y descargar archivo JSON
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapa-datos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Mostrar mensaje de confirmación
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    message.textContent = '✅ Datos exportados exitosamente';
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

function importMapData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const mapData = JSON.parse(e.target.result);
            loadMapData(mapData);
            showImportSuccess();
        } catch (error) {
            showImportError('Error al leer el archivo JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    event.target.value = '';
}

function loadMapData(mapData) {
    // Limpiar elementos existentes
    clearAll();
    
    // Cargar polylines
    if (mapData.polylines && Array.isArray(mapData.polylines)) {
        mapData.polylines.forEach(polylineData => {
            const polyline = new google.maps.Polyline({
                path: polylineData.coordinates,
                geodesic: true,
                strokeColor: polylineData.strokeColor || "#FF0000",
                strokeOpacity: polylineData.strokeOpacity || 1.0,
                strokeWeight: polylineData.strokeWeight || 4,
                map: map
            });
            polylines.push(polyline);
        });
    }
    
    // Cargar polygons
    if (mapData.polygons && Array.isArray(mapData.polygons)) {
        mapData.polygons.forEach(polygonData => {
            const polygon = new google.maps.Polygon({
                paths: polygonData.coordinates,
                strokeColor: polygonData.strokeColor || "#00FF00",
                strokeOpacity: polygonData.strokeOpacity || 0.8,
                strokeWeight: polygonData.strokeWeight || 2,
                fillColor: polygonData.fillColor || "#00FF00",
                fillOpacity: polygonData.fillOpacity || 0.2,
                map: map
            });
            polygons.push(polygon);
        });
    }
    
    // Cargar circles
    if (mapData.circles && Array.isArray(mapData.circles)) {
        mapData.circles.forEach(circleData => {
            const circle = new google.maps.Circle({
                center: circleData.center,
                radius: circleData.radius,
                strokeColor: circleData.strokeColor || "#FF0000",
                strokeOpacity: circleData.strokeOpacity || 0.8,
                strokeWeight: circleData.strokeWeight || 2,
                fillColor: circleData.fillColor || "#FF0000",
                fillOpacity: circleData.fillOpacity || 0.15,
                map: map
            });
            circles.push(circle);
        });
    }
    
    // Actualizar checkboxes para mostrar elementos cargados
    if (polylines.length > 0) {
        document.getElementById('togglePolylines').checked = true;
    }
    if (polygons.length > 0) {
        document.getElementById('togglePolygons').checked = true;
    }
    if (circles.length > 0) {
        document.getElementById('toggleCircles').checked = true;
    }
    
    // Actualizar mediciones si están visibles
    updateMeasurementsIfVisible();
}

function showImportSuccess() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    message.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">✅ Datos importados exitosamente</div>
        <div style="font-size: 12px; opacity: 0.9;">
            Polylines: ${polylines.length} | Polygons: ${polygons.length} | Circles: ${circles.length}
        </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

function showImportError(errorMessage) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        text-align: center;
    `;
    message.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">❌ Error al importar</div>
        <div style="font-size: 12px; opacity: 0.9;">${errorMessage}</div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
    }, 5000);
}

function toggleEditMode() {
    editMode = document.getElementById('toggleEditMode').checked;
    
    if (editMode) {
        enableEditMode();
    } else {
        disableEditMode();
    }
}

function enableEditMode() {
    // Hacer polylines editables
    polylines.forEach((polyline, polylineIndex) => {
        const path = polyline.getPath();
        
        // Crear marcadores arrastrables para cada punto
        for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            const marker = new google.maps.Marker({
                position: { lat: point.lat(), lng: point.lng() },
                map: map,
                draggable: true,
                title: `Punto ${i + 1} - Arrastra para editar`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#FF0000',
                    fillOpacity: 0.8,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                }
            });
            
            // Event listener para cuando se arrastra el marcador
            marker.addListener('dragend', function() {
                const newPosition = marker.getPosition();
                path.setAt(i, newPosition);
                
                // Actualizar mediciones si están visibles
                updateMeasurementsIfVisible();
            });
            
            draggableMarkers.push(marker);
        }
    });
    
    // Hacer circles editables
    circles.forEach((circle, circleIndex) => {
        const center = circle.getCenter();
        const marker = new google.maps.Marker({
            position: { lat: center.lat(), lng: center.lng() },
            map: map,
            draggable: true,
            title: `Centro del círculo ${circleIndex + 1} - Arrastra para mover`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#0000FF',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            }
        });
        
        marker.addListener('dragend', function() {
            const newPosition = marker.getPosition();
            circle.setCenter(newPosition);
            
            // Actualizar mediciones si están visibles
            updateMeasurementsIfVisible();
        });
        
        draggableMarkers.push(marker);
    });
    
    // Mostrar instrucciones
    showEditInstructions();
}

function disableEditMode() {
    // Eliminar todos los marcadores de edición
    draggableMarkers.forEach(marker => {
        marker.setMap(null);
    });
    draggableMarkers = [];
    
    // Ocultar instrucciones
    hideEditInstructions();
}

function showEditInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'edit-instructions';
    instructions.style.cssText = `
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        background: rgba(52, 152, 219, 0.95);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 250px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    instructions.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">✏️ Modo Edición</h4>
        <p style="margin: 0; font-size: 12px; line-height: 1.4;">
            • <strong>Puntos rojos:</strong> Arrastra para editar polylines<br>
            • <strong>Puntos azules:</strong> Arrastra para mover círculos<br>
            • Los cambios se actualizan automáticamente
        </p>
    `;
    
    document.body.appendChild(instructions);
}

function hideEditInstructions() {
    const instructions = document.getElementById('edit-instructions');
    if (instructions) {
        document.body.removeChild(instructions);
    }
}

function toggleDrawingTools() {
    const isVisible = document.getElementById('toggleDrawingTools').checked;
    
    if (isVisible) {
        enableDrawingTools();
    } else {
        disableDrawingTools();
    }
}

function enableDrawingTools() {
    if (drawingManager) {
        drawingManager.setMap(map);
        return;
    }
    
    // Crear el DrawingManager con herramientas de medición
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.MARKER,
                google.maps.drawing.OverlayType.POLYLINE,
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.CIRCLE
            ]
        },
        markerOptions: {
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF6B6B',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
            },
            animation: google.maps.Animation.DROP
        },
        polylineOptions: {
            strokeColor: '#4ECDC4',
            strokeWeight: 4,
            strokeOpacity: 0.8,
            geodesic: true
        },
        polygonOptions: {
            fillColor: '#45B7D1',
            fillOpacity: 0.3,
            strokeColor: '#45B7D1',
            strokeWeight: 2,
            strokeOpacity: 0.8
        },
        circleOptions: {
            fillColor: '#96CEB4',
            fillOpacity: 0.2,
            strokeColor: '#96CEB4',
            strokeWeight: 2,
            strokeOpacity: 0.8
        }
    });
    
    drawingManager.setMap(map);
    
    // Event listeners para cuando se completa un dibujo
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        const overlay = event.overlay;
        const type = event.type;
        
        // Agregar a las listas correspondientes
        if (type === google.maps.drawing.OverlayType.POLYLINE) {
            polylines.push(overlay);
        } else if (type === google.maps.drawing.OverlayType.POLYGON) {
            polygons.push(overlay);
        } else if (type === google.maps.drawing.OverlayType.CIRCLE) {
            circles.push(overlay);
        }
        
        // Actualizar mediciones si están visibles
        updateMeasurementsIfVisible();
        
        // Mostrar información del elemento creado
        showDrawingInfo(type, overlay);
    });
    
    // Mostrar instrucciones
    showDrawingInstructions();
}

function disableDrawingTools() {
    if (drawingManager) {
        drawingManager.setMap(null);
    }
    hideDrawingInstructions();
}

function showDrawingInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'drawing-instructions';
    instructions.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(46, 204, 113, 0.95);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 400px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    
    instructions.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">🛠️ Herramientas de Dibujo</h4>
        <p style="margin: 0; font-size: 12px; line-height: 1.4;">
            Usa las herramientas de la barra superior para dibujar elementos en el mapa.<br>
            Las mediciones se calcularán automáticamente usando Google Maps Geometry.
        </p>
    `;
    
    document.body.appendChild(instructions);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        if (document.getElementById('drawing-instructions')) {
            document.body.removeChild(instructions);
        }
    }, 5000);
}

function hideDrawingInstructions() {
    const instructions = document.getElementById('drawing-instructions');
    if (instructions) {
        document.body.removeChild(instructions);
    }
}

function showDrawingInfo(type, overlay) {
    let info = '';
    let measurements = '';
    
    if (type === google.maps.drawing.OverlayType.POLYLINE) {
        const path = overlay.getPath();
        const length = calculatePolylineLength(path);
        info = 'Polyline creada';
        measurements = `Longitud: ${length.toFixed(2)} km`;
    } else if (type === google.maps.drawing.OverlayType.POLYGON) {
        const path = overlay.getPath();
        const points = [];
        for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            points.push(new google.maps.LatLng(point.lat(), point.lng()));
        }
        const area = calculatePolygonArea(points);
        info = 'Polygon creado';
        measurements = `Área: ${area.toFixed(2)} km²`;
    } else if (type === google.maps.drawing.OverlayType.CIRCLE) {
        const radius = overlay.getRadius();
        const area = Math.PI * (radius / 1000) * (radius / 1000);
        info = 'Círculo creado';
        measurements = `Radio: ${(radius / 1000).toFixed(2)} km, Área: ${area.toFixed(2)} km²`;
    } else if (type === google.maps.drawing.OverlayType.MARKER) {
        const position = overlay.getPosition();
        info = 'Marcador creado';
        measurements = `Lat: ${position.lat().toFixed(6)}, Lng: ${position.lng().toFixed(6)}`;
    }
    
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    message.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">✅ ${info}</div>
        <div style="font-size: 12px; opacity: 0.9;">${measurements}</div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

// Inicializar el mapa
initMap();