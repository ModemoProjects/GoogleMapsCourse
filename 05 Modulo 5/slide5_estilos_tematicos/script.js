// Estilos temáticos para diferentes casos de uso

// Estilo para retail - resaltar comercios y ocultar POIs irrelevantes
const retailStyle = [
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi.business",
    elementType: "geometry.fill",
    stylers: [{ color: "#ff6b6b" }]
  },
  {
    featureType: "poi.attraction",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#ff6b6b" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "transit.station",
    elementType: "geometry.fill",
    stylers: [{ color: "#4ecdc4" }]
  }
];

// Estilo para logística - enfocar en vías principales y centros de distribución
const logisticsStyle = [
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2ecc71" }, { weight: 2.0 }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#27ae60" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi.business",
    elementType: "geometry.fill",
    stylers: [{ color: "#e74c3c" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];

// Estilo para movilidad - resaltar transporte público y rutas peatonales
const mobilityStyle = [
  {
    featureType: "transit.station",
    elementType: "geometry.fill",
    stylers: [{ color: "#3498db" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#3498db" }, { weight: 3.0 }]
  },
  {
    featureType: "road.pedestrian",
    elementType: "geometry",
    stylers: [{ color: "#9b59b6" }, { weight: 2.0 }]
  },
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.attraction",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];

let map;
let currentStyle = 'default';

// Inicializar mapa
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 12
  });
}

// Aplicar estilo según caso de uso
function applyThematicStyle(useCase) {
  const description = document.getElementById('description');
  const buttons = document.querySelectorAll('.theme-button');
  
  // Actualizar botones activos
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  let style = [];
  let descriptionText = '';
  
  switch(useCase) {
    case 'retail':
      style = retailStyle;
      descriptionText = 'Estilo optimizado para retail: resalta comercios, estaciones de tránsito y oculta atracciones turísticas. Ideal para aplicaciones de compras y servicios locales.';
      break;
    case 'logistics':
      style = logisticsStyle;
      descriptionText = 'Estilo para logística: enfoca en vías principales, centros de distribución y oculta elementos no relevantes. Perfecto para aplicaciones de entrega y transporte de mercancías.';
      break;
    case 'mobility':
      style = mobilityStyle;
      descriptionText = 'Estilo para movilidad: resalta transporte público, rutas peatonales y estaciones. Ideal para aplicaciones de navegación urbana y transporte público.';
      break;
    case 'default':
      style = [];
      descriptionText = 'Estilo por defecto de Google Maps: muestra todos los elementos con la apariencia estándar.';
      break;
  }
  
  map.setOptions({ styles: style });
  description.textContent = descriptionText;
  currentStyle = useCase;
}

// Inicializar cuando se carga la página
window.onload = initMap;
