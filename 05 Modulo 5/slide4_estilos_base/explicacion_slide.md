# Slide 4: Estilos base: claro/oscuro y alto contraste

## JavaScript (Google Maps JS API)
```js
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
  }
];

// Función para alternar entre temas
function toggleMapTheme(isDark) {
  map.setOptions({ 
    styles: isDark ? darkStyle : lightStyle 
  });
}

// Toggle con botón
document.getElementById('themeToggle').addEventListener('click', function() {
  const isDark = this.checked;
  toggleMapTheme(isDark);
});
```

## Flutter (google_maps_flutter)
```dart
// Alternar entre estilos claro y oscuro
class ThemeMapController {
  final GoogleMapController? _controller;
  bool _isDarkMode = false;
  
  ThemeMapController(this._controller);
  
  static const String lightStyle = '''
  [{"featureType": "all", "elementType": "geometry.fill", "stylers": [{"color": "#ffffff"}]}]
  ''';
  
  static const String darkStyle = '''
  [{"featureType": "all", "elementType": "geometry.fill", "stylers": [{"color": "#212121"}]}]
  ''';
  
  Future<void> toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    final style = _isDarkMode ? darkStyle : lightStyle;
    await _controller?.setMapStyle(style);
  }
  
  // Usar con Theme.of(context).brightness
  Future<void> applyThemeBasedOnSystem(Brightness brightness) async {
    final style = brightness == Brightness.dark ? darkStyle : lightStyle;
    await _controller?.setMapStyle(style);
  }
}
```

## Notas
- El modo oscuro mejora la experiencia en condiciones de poca luz.
- El alto contraste se logra aumentando la diferencia entre colores de vías y POIs.

## Conceptos Clave
- **Modo Claro**: Colores claros de fondo con texto oscuro para mejor legibilidad diurna
- **Modo Oscuro**: Colores oscuros de fondo con texto claro para mejor experiencia nocturna
- **Alto Contraste**: Colores muy contrastantes para mejorar accesibilidad
- **Integración con Sistema**: En Flutter se puede integrar con `Theme.of(context).brightness` para detección automática
- **Toggle Dinámico**: Cambio de tema en tiempo real sin recargar la página
