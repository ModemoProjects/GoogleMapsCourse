// Aplicar estilo personalizado usando MapStyleOptions
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

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
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [{"visibility": "off"}]
    }
  ]
  ''';
  
  Future<void> applyCustomStyle() async {
    await _controller?.setMapStyle(customStyle);
  }
  
  Future<void> resetStyle() async {
    await _controller?.setMapStyle(null);
  }
}

// Widget de ejemplo para usar el controlador
class StyledMapWidget extends StatefulWidget {
  @override
  _StyledMapWidgetState createState() => _StyledMapWidgetState();
}

class _StyledMapWidgetState extends State<StyledMapWidget> {
  GoogleMapController? _mapController;
  MapStyleController? _styleController;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Conceptos de Estilo'),
        actions: [
          IconButton(
            icon: Icon(Icons.palette),
            onPressed: () => _styleController?.applyCustomStyle(),
            tooltip: 'Aplicar Estilo Personalizado',
          ),
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: () => _styleController?.resetStyle(),
            tooltip: 'Restablecer Estilo',
          ),
        ],
      ),
      body: GoogleMap(
        onMapCreated: (GoogleMapController controller) {
          _mapController = controller;
          _styleController = MapStyleController(controller);
        },
        initialCameraPosition: CameraPosition(
          target: LatLng(-34.397, 150.644),
          zoom: 8.0,
        ),
      ),
    );
  }
}
