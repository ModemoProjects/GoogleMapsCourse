// Definir estilos para modo claro y oscuro
const lightStyle = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }]
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
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#000000" }]
  }
];

const darkStyle = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ color: "#212121" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c2c2c" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  }
];

// Estilo de alto contraste
const highContrastStyle = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0000ff" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffff00" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  }
];

let map;

// Inicializar mapa
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 10,
    styles: lightStyle // Estilo inicial: claro
  });
}

// Función para alternar entre temas
function toggleMapTheme(isDark) {
  const themeLabel = document.getElementById('themeLabel');
  
  if (isDark) {
    map.setOptions({ styles: darkStyle });
    themeLabel.textContent = 'Modo Oscuro';
  } else {
    map.setOptions({ styles: lightStyle });
    themeLabel.textContent = 'Modo Claro';
  }
}

// Función para aplicar alto contraste
function applyHighContrast() {
  map.setOptions({ styles: highContrastStyle });
  document.getElementById('themeLabel').textContent = 'Alto Contraste';
}

// Inicializar cuando se carga la página
window.onload = initMap;
