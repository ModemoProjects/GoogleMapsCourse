# Slide 3: Conceptos de estilo: ¿qué se puede personalizar?

## JavaScript (Google Maps JS API)
```html
<!-- Script básico de carga con 'language=es-419' y libraries necesarias -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=maps&language=es-419"></script>
```

```js
// Snippet mínimo y comentado que muestre la idea de la diapositiva
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
  }
];

// Inicializar mapa con estilo personalizado
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
    styles: customStyle // Aplicar el estilo JSON
  });
}
```

## Flutter (google_maps_flutter)
```dart
// Snippet mínimo y comentado que muestre la idea en Flutter
class MapStyleController {
  final GoogleMapController? _controller;
  
  MapStyleController(this._controller);
  
  // Estilo JSON como string
  static const String customStyle = '''
  [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#f5f5f5"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#c9c9c9"}]
    }
  ]
  ''';
  
  Future<void> applyCustomStyle() async {
    await _controller?.setMapStyle(customStyle);
  }
}
```

## Notas
- Los estilos se definen como arrays JSON con reglas de `featureType`, `elementType` y `stylers`.
- En Flutter, el estilo se pasa como string JSON al método `setMapStyle()`.

## Conceptos Clave
- **featureType**: Tipo de elemento del mapa (all, water, road, poi, etc.)
- **elementType**: Parte específica del elemento (geometry, labels, icons, etc.)
- **stylers**: Array de propiedades de estilo (color, visibility, weight, etc.)
- **Aplicación**: Los estilos se aplican al mapa usando `map.setOptions({styles: style})` en JS o `controller.setMapStyle(style)` en Flutter
