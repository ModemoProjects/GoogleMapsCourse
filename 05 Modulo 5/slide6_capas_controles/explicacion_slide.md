# Slide 6: Capas y controles visuales

## JavaScript (Google Maps JS API)
```js
// Activar capas y controles visuales
function initializeMapWithLayers() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 10,
    // Controles del mapa
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: false,
    scaleControl: true
  });
  
  // Activar capa de tráfico
  const trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
  
  // Activar capa de transporte público
  const transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap(map);
  
  // Controlar visibilidad de capas
  document.getElementById('toggleTraffic').addEventListener('click', function() {
    trafficLayer.setMap(trafficLayer.getMap() ? null : map);
  });
}
```

## Flutter (google_maps_flutter)
```dart
// Configurar capas y controles en Flutter
class MapLayersController {
  final GoogleMapController? _controller;
  
  MapLayersController(this._controller);
  
  // Configuración del mapa con controles
  static const GoogleMapOptions mapOptions = GoogleMapOptions(
    mapType: MapType.normal,
    myLocationEnabled: true,
    myLocationButtonEnabled: true,
    zoomControlsEnabled: true,
    compassEnabled: true,
    mapToolbarEnabled: true,
  );
  
  // Activar/desactivar ubicación del usuario
  Future<void> toggleMyLocation(bool enabled) async {
    // Nota: En Flutter, esto se controla desde el widget GoogleMap
    // myLocationEnabled: enabled
  }
  
  // Cambiar tipo de mapa
  Future<void> setMapType(MapType mapType) async {
    // Se controla desde el widget GoogleMap con mapType: mapType
  }
}
```

## Notas
- Las capas de tráfico y transporte tienen costo adicional en Google Maps.
- En Flutter, algunas capas se controlan a nivel de widget, no de controller.

## Conceptos Clave
- **Capas de Información**: Tráfico, transporte público, ciclovías
- **Controles del Mapa**: Selector de tipo, pantalla completa, zoom, Street View, escala
- **Mi Ubicación**: Mostrar y centrar en la ubicación del usuario
- **Gestión de Visibilidad**: Activar/desactivar capas dinámicamente
- **Costo Adicional**: Las capas de tráfico y transporte requieren facturación adicional
- **Limitaciones en Flutter**: Algunas capas no están disponibles directamente como en JavaScript
