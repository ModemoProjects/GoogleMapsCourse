// Estilos temáticos para diferentes casos de uso
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

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
      "featureType": "poi.business",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ff6b6b"}]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "labels", 
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#ff6b6b"}]
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
    },
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [{"visibility": "on"}]
    }
  ]
  ''';
  
  // Estilo para movilidad - transporte público
  static const String mobilityStyle = '''
  [
    {
      "featureType": "transit.station",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#3498db"}]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{"color": "#3498db"}, {"weight": 3.0}]
    },
    {
      "featureType": "road.pedestrian",
      "elementType": "geometry",
      "stylers": [{"color": "#9b59b6"}, {"weight": 2.0}]
    }
  ]
  ''';
  
  static Future<void> applyStyle(GoogleMapController controller, String useCase) async {
    String? style;
    
    switch(useCase) {
      case 'retail':
        style = retailStyle;
        break;
      case 'logistics':
        style = logisticsStyle;
        break;
      case 'mobility':
        style = mobilityStyle;
        break;
      case 'default':
        style = null;
        break;
    }
    
    await controller.setMapStyle(style);
  }
}

// Widget de ejemplo para usar estilos temáticos
class ThematicMapWidget extends StatefulWidget {
  @override
  _ThematicMapWidgetState createState() => _ThematicMapWidgetState();
}

class _ThematicMapWidgetState extends State<ThematicMapWidget> {
  GoogleMapController? _mapController;
  String _currentTheme = 'default';
  
  final Map<String, String> _themeDescriptions = {
    'retail': 'Estilo optimizado para retail: resalta comercios y estaciones de tránsito',
    'logistics': 'Estilo para logística: enfoca en vías principales y centros de distribución',
    'mobility': 'Estilo para movilidad: resalta transporte público y rutas peatonales',
    'default': 'Estilo por defecto de Google Maps'
  };
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Estilos Temáticos'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (String theme) async {
              if (_mapController != null) {
                await ThematicMapStyles.applyStyle(_mapController!, theme);
                setState(() {
                  _currentTheme = theme;
                });
              }
            },
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(
                value: 'retail',
                child: Row(
                  children: [
                    Icon(Icons.store, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Retail'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'logistics',
                child: Row(
                  children: [
                    Icon(Icons.local_shipping, color: Colors.green),
                    SizedBox(width: 8),
                    Text('Logística'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'mobility',
                child: Row(
                  children: [
                    Icon(Icons.directions_transit, color: Colors.blue),
                    SizedBox(width: 8),
                    Text('Movilidad'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'default',
                child: Row(
                  children: [
                    Icon(Icons.map, color: Colors.grey),
                    SizedBox(width: 8),
                    Text('Por Defecto'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16),
            child: Text(
              _themeDescriptions[_currentTheme] ?? '',
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ),
          Expanded(
            child: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;
              },
              initialCameraPosition: CameraPosition(
                target: LatLng(-34.397, 150.644),
                zoom: 12.0,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
