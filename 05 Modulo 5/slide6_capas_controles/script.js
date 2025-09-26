// Activar capas y controles visuales
let map;
let trafficLayer;
let transitLayer;
let bicyclingLayer;

// Inicializar mapa con controles
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 10,
    // Controles del mapa
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: false,
    scaleControl: false,
    myLocationControl: false,
    gestureHandling: 'auto'
  });
  
  // Inicializar capas
  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();
  bicyclingLayer = new google.maps.BicyclingLayer();
}

// Controlar visibilidad de capas
function toggleTrafficLayer() {
  const checkbox = document.getElementById('trafficLayer');
  if (checkbox.checked) {
    trafficLayer.setMap(map);
  } else {
    trafficLayer.setMap(null);
  }
}

function toggleTransitLayer() {
  const checkbox = document.getElementById('transitLayer');
  if (checkbox.checked) {
    transitLayer.setMap(map);
  } else {
    transitLayer.setMap(null);
  }
}

function toggleBicyclingLayer() {
  const checkbox = document.getElementById('bicyclingLayer');
  if (checkbox.checked) {
    bicyclingLayer.setMap(map);
  } else {
    bicyclingLayer.setMap(null);
  }
}

// Controlar controles del mapa
function toggleMapTypeControl() {
  const checkbox = document.getElementById('mapTypeControl');
  map.setOptions({ mapTypeControl: checkbox.checked });
}

function toggleFullscreenControl() {
  const checkbox = document.getElementById('fullscreenControl');
  map.setOptions({ fullscreenControl: checkbox.checked });
}

function toggleZoomControl() {
  const checkbox = document.getElementById('zoomControl');
  map.setOptions({ zoomControl: checkbox.checked });
}

function toggleStreetViewControl() {
  const checkbox = document.getElementById('streetViewControl');
  map.setOptions({ streetViewControl: checkbox.checked });
}

function toggleScaleControl() {
  const checkbox = document.getElementById('scaleControl');
  map.setOptions({ scaleControl: checkbox.checked });
}

function toggleMyLocation() {
  const checkbox = document.getElementById('myLocationEnabled');
  map.setOptions({ 
    myLocationControl: checkbox.checked,
    myLocationButtonEnabled: checkbox.checked
  });
}

function toggleGestureHandling() {
  const checkbox = document.getElementById('gestureHandling');
  map.setOptions({ 
    gestureHandling: checkbox.checked ? 'cooperative' : 'auto'
  });
}

// Función para cambiar tipo de mapa
function changeMapType(mapType) {
  map.setMapTypeId(mapType);
}

// Función para activar/desactivar todas las capas
function toggleAllLayers(enable) {
  document.getElementById('trafficLayer').checked = enable;
  document.getElementById('transitLayer').checked = enable;
  document.getElementById('bicyclingLayer').checked = enable;
  
  toggleTrafficLayer();
  toggleTransitLayer();
  toggleBicyclingLayer();
}

// Función para resetear controles
function resetControls() {
  // Desactivar todas las capas
  toggleAllLayers(false);
  
  // Resetear controles a valores por defecto
  document.getElementById('mapTypeControl').checked = true;
  document.getElementById('fullscreenControl').checked = true;
  document.getElementById('zoomControl').checked = true;
  document.getElementById('streetViewControl').checked = false;
  document.getElementById('scaleControl').checked = false;
  document.getElementById('myLocationEnabled').checked = false;
  document.getElementById('gestureHandling').checked = false;
  
  // Aplicar cambios
  toggleMapTypeControl();
  toggleFullscreenControl();
  toggleZoomControl();
  toggleStreetViewControl();
  toggleScaleControl();
  toggleMyLocation();
  toggleGestureHandling();
}

// Inicializar cuando se carga la página
window.onload = initMap;
