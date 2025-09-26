# Slide 7: Buenas prácticas, rendimiento y límites

## JavaScript (Google Maps JS API)
```js
// Buenas prácticas para rendimiento y gestión de estilos
class OptimizedMapManager {
  constructor() {
    this.map = null;
    this.styles = new Map(); // Cache de estilos
    this.isAnimating = false;
  }
  
  // Cargar estilos desde archivo JSON
  async loadStyleFromFile(stylePath) {
    if (this.styles.has(stylePath)) {
      return this.styles.get(stylePath);
    }
    
    try {
      const response = await fetch(stylePath);
      const style = await response.json();
      this.styles.set(stylePath, style);
      return style;
    } catch (error) {
      console.error('Error cargando estilo:', error);
      return [];
    }
  }
  
  // Aplicar estilo optimizado
  async applyStyle(stylePath) {
    const style = await this.loadStyleFromFile(stylePath);
    
    // Desactivar animaciones para mejor rendimiento
    this.map.setOptions({
      styles: style,
      gestureHandling: 'cooperative', // Requiere scroll + zoom
      disableDefaultUI: false,
      zoomControl: true
    });
  }
  
  // Limpiar recursos
  destroy() {
    this.styles.clear();
    this.map = null;
  }
}
```

## Flutter (google_maps_flutter)
```dart
// Buenas prácticas para Flutter
class OptimizedMapWidget extends StatefulWidget {
  @override
  _OptimizedMapWidgetState createState() => _OptimizedMapWidgetState();
}

class _OptimizedMapWidgetState extends State<OptimizedMapWidget> {
  GoogleMapController? _controller;
  String? _currentStyle;
  
  // Pre-cargar estilos desde assets
  Future<String> _loadStyleFromAssets(String assetPath) async {
    return await rootBundle.loadString(assetPath);
  }
  
  // Aplicar estilo sin rebuilds innecesarios
  Future<void> _applyStyle(String styleJson) async {
    if (_currentStyle == styleJson) return; // Evitar aplicaciones duplicadas
    
    await _controller?.setMapStyle(styleJson);
    _currentStyle = styleJson;
  }
  
  // Controlar markers para mejor rendimiento
  Set<Marker> _markers = {};
  
  void _addMarker(LatLng position) {
    setState(() {
      _markers.add(Marker(
        markerId: MarkerId(position.toString()),
        position: position,
      ));
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      onMapCreated: (GoogleMapController controller) {
        _controller = controller;
      },
      markers: _markers,
      // Configuración optimizada
      mapType: MapType.normal,
      myLocationEnabled: true,
      zoomControlsEnabled: true,
    );
  }
}
```

## Notas
- Cachea estilos JSON para evitar cargas repetidas.
- En Flutter, evita rebuilds innecesarios del widget GoogleMap.
- Considera el límite de 50,000 requests/día para estilos personalizados.

## Conceptos Clave
- **Cache de Estilos**: Almacenar estilos en memoria para evitar cargas repetidas
- **Pre-carga**: Cargar estilos comunes al inicio de la aplicación
- **Gestión de Memoria**: Limpiar recursos cuando no se necesiten
- **Límites de API**: 50,000 requests/día para estilos personalizados
- **Optimización de Markers**: Implementar clustering para muchos markers
- **Monitoreo de Uso**: Rastrear el uso de API para evitar límites
- **Fallbacks**: Implementar estilos por defecto cuando se alcancen los límites
- **Rendimiento**: Desactivar animaciones innecesarias y optimizar configuraciones
