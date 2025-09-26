// Alternar entre estilos claro y oscuro
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class ThemeMapController {
  final GoogleMapController? _controller;
  bool _isDarkMode = false;
  
  ThemeMapController(this._controller);
  
  static const String lightStyle = '''
  [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#c9c9c9"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#000000"}]
    }
  ]
  ''';
  
  static const String darkStyle = '''
  [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#212121"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#2c2c2c"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#ffffff"}]
    }
  ]
  ''';
  
  static const String highContrastStyle = '''
  [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#0000ff"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffff00"}]
    }
  ]
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
  
  Future<void> applyHighContrast() async {
    await _controller?.setMapStyle(highContrastStyle);
  }
  
  bool get isDarkMode => _isDarkMode;
}

// Widget de ejemplo para usar el controlador
class ThemeMapWidget extends StatefulWidget {
  @override
  _ThemeMapWidgetState createState() => _ThemeMapWidgetState();
}

class _ThemeMapWidgetState extends State<ThemeMapWidget> {
  GoogleMapController? _mapController;
  ThemeMapController? _themeController;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Estilos Base: Claro/Oscuro'),
        actions: [
          IconButton(
            icon: Icon(_themeController?.isDarkMode == true 
                ? Icons.light_mode 
                : Icons.dark_mode),
            onPressed: () async {
              await _themeController?.toggleTheme();
              setState(() {});
            },
            tooltip: 'Alternar Tema',
          ),
          IconButton(
            icon: Icon(Icons.contrast),
            onPressed: () => _themeController?.applyHighContrast(),
            tooltip: 'Alto Contraste',
          ),
        ],
      ),
      body: GoogleMap(
        onMapCreated: (GoogleMapController controller) {
          _mapController = controller;
          _themeController = ThemeMapController(controller);
          
          // Aplicar tema basado en el sistema
          _themeController?.applyThemeBasedOnSystem(
            Theme.of(context).brightness
          );
        },
        initialCameraPosition: CameraPosition(
          target: LatLng(-34.397, 150.644),
          zoom: 10.0,
        ),
      ),
    );
  }
}
