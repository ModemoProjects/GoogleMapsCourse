function initMap(): void {
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 11,
      center: { lat: 21.1230729, lng: -101.6650775 },
    }
  );

  // Generar marcadores aleatorios alrededor del punto inicial
  generateRandomMarkers(map, { lat: 21.1230729, lng: -101.6650775 }, 10, 15000);
}

// Función para generar marcadores aleatorios en un radio específico
function generateRandomMarkers(
  map: google.maps.Map,
  center: { lat: number; lng: number },
  radiusKm: number,
  count: number
): void {
  // Array de iconos predefinidos de Google Maps
  const defaultIcons = [
    'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/brown-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/ltgreen-dot.png',
    'https://maps.google.com/mapfiles/ms/icons/red-pushpin.png',
    'https://maps.google.com/mapfiles/ms/icons/blue-pushpin.png',
    'https://maps.google.com/mapfiles/ms/icons/green-pushpin.png',
    'https://maps.google.com/mapfiles/ms/icons/yellow-pushpin.png',
    'https://maps.google.com/mapfiles/ms/icons/purple-pushpin.png',
    'https://maps.google.com/mapfiles/ms/icons/orange-pushpin.png'
  ];

  for (let i = 0; i < count; i++) {
    const randomPosition = getRandomPositionInRadius(center, radiusKm);
    const randomIcon = defaultIcons[Math.floor(Math.random() * defaultIcons.length)];

    // Crear el marcador
    const marker = new google.maps.Marker({
      position: randomPosition,
      map,
      title: `Marcador ${i + 1}`,
      // Usar iconos predefinidos de Google Maps
      icon: randomIcon
    });


    // Crear InfoWindow para el marcador
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Marcador ${i + 1}</h3>
          <p style="margin: 5px 0;"><strong>Latitud:</strong> ${randomPosition.lat.toFixed(6)}</p>
          <p style="margin: 5px 0;"><strong>Longitud:</strong> ${randomPosition.lng.toFixed(6)}</p>
          <p style="margin: 5px 0;"><strong>Distancia del centro:</strong> ${calculateDistance(center, randomPosition).toFixed(2)} km</p>
          <p style="margin: 5px 0;"><strong>Color del marcador:</strong> <span style="color: ${getColorFromIcon(randomIcon)};">${getColorFromIcon(randomIcon)}</span></p>
        </div>
      `
    });

    // Agregar evento de clic para mostrar InfoWindow
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

  }
}

// Función para calcular una posición aleatoria dentro de un radio
function getRandomPositionInRadius(
  center: { lat: number; lng: number },
  radiusKm: number
): { lat: number; lng: number } {
  // Convertir radio de km a grados (aproximadamente)
  const radiusInDegrees = radiusKm / 111.32;

  // Generar ángulo aleatorio
  const randomAngle = Math.random() * 2 * Math.PI;

  // Generar distancia aleatoria (raíz cuadrada para distribución uniforme)
  const randomDistance = Math.sqrt(Math.random()) * radiusInDegrees;

  // Calcular nueva posición
  const deltaLat = randomDistance * Math.cos(randomAngle);
  const deltaLng = randomDistance * Math.sin(randomAngle) / Math.cos(center.lat * Math.PI / 180);

  return {
    lat: center.lat + deltaLat,
    lng: center.lng + deltaLng
  };
}

// Función para calcular la distancia entre dos puntos en kilómetros
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Función para obtener el color del icono basado en la URL
function getColorFromIcon(iconUrl: string): string {
  if (iconUrl.includes('red')) return 'Rojo';
  if (iconUrl.includes('blue')) return 'Azul';
  if (iconUrl.includes('green')) return 'Verde';
  if (iconUrl.includes('yellow')) return 'Amarillo';
  if (iconUrl.includes('purple')) return 'Púrpura';
  if (iconUrl.includes('orange')) return 'Naranja';
  if (iconUrl.includes('pink')) return 'Rosa';
  if (iconUrl.includes('brown')) return 'Marrón';
  if (iconUrl.includes('ltblue')) return 'Azul Claro';
  if (iconUrl.includes('ltgreen')) return 'Verde Claro';
  return 'Desconocido';
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export { };
