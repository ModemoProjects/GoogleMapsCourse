# Slide 5: Estilos temáticos por caso de uso (retail, movilidad, logística)

## JavaScript (Google Maps JS API)
```js
// Estilo temático para retail - resaltar comercios y ocultar POIs irrelevantes
const retailStyle = [
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi.attraction",
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
    stylers: [{ visibility: "off" }]
  }
];

// Estilo para logística - enfocar en vías principales
const logisticsStyle = [
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2ecc71" }, { weight: 2.0 }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];

// Aplicar estilo según caso de uso
function applyThematicStyle(useCase) {
  const style = useCase === 'retail' ? retailStyle : logisticsStyle;
  map.setOptions({ styles: style });
}
```

## Flutter (google_maps_flutter)
```dart
// Estilos temáticos para diferentes casos de uso
class ThematicMapStyles {
  // Estilo para retail - resaltar comercios
  static const String retailStyle = '''
  [
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [{"visibility": "on"}]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "labels", 
      "stylers": [{"visibility": "off"}]
    }
  ]
  ''';
  
  // Estilo para logística - enfocar en vías
  static const String logisticsStyle = '''
  [
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#2ecc71"}, {"weight": 2.0}]
    }
  ]
  ''';
  
  static Future<void> applyStyle(GoogleMapController controller, String useCase) async {
    final style = useCase == 'retail' ? retailStyle : logisticsStyle;
    await controller.setMapStyle(style);
  }
}
```

## Notas
- Los estilos temáticos mejoran la experiencia según el contexto de uso.
- Considera la legibilidad de etiquetas al ocultar/mostrar POIs.

## Conceptos Clave
- **Retail**: Resalta comercios y estaciones de tránsito, oculta atracciones turísticas
- **Logística**: Enfoca en vías principales y centros de distribución, oculta elementos no relevantes
- **Movilidad**: Resalta transporte público y rutas peatonales, ideal para navegación urbana
- **Ocultación Selectiva**: Usar `visibility: "off"` para ocultar POIs no relevantes
- **Resaltado**: Usar colores llamativos y `visibility: "on"` para elementos importantes
- **Contexto de Uso**: Cada estilo está optimizado para un caso de uso específico
