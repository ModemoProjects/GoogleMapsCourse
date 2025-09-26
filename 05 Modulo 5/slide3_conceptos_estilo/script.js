// Aplicar un estilo JSON personalizado al mapa
const customStyle = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];

let map;

// Inicializar mapa con estilo personalizado
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
    styles: customStyle // Aplicar el estilo JSON
  });
}

// Aplicar estilo personalizado
function applyCustomStyle() {
  if (map) {
    map.setOptions({ styles: customStyle });
  }
}

// Restablecer al estilo por defecto
function resetStyle() {
  if (map) {
    map.setOptions({ styles: [] });
  }
}

// Inicializar cuando se carga la página
window.onload = initMap;
