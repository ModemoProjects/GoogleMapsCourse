// Configurar capas y controles en Flutter
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

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

// Widget de ejemplo para usar capas y controles
class LayersMapWidget extends StatefulWidget {
  @override
  _LayersMapWidgetState createState() => _LayersMapWidgetState();
}

class _LayersMapWidgetState extends State<LayersMapWidget> {
  GoogleMapController? _mapController;
  MapLayersController? _layersController;
  
  // Estado de las capas y controles
  bool _myLocationEnabled = true;
  bool _zoomControlsEnabled = true;
  bool _compassEnabled = true;
  bool _mapToolbarEnabled = true;
  MapType _mapType = MapType.normal;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Capas y Controles'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (String value) {
              switch(value) {
                case 'reset':
                  _resetControls();
                  break;
                case 'traffic':
                  _showTrafficInfo();
                  break;
              }
            },
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(
                value: 'reset',
                child: Row(
                  children: [
                    Icon(Icons.refresh),
                    SizedBox(width: 8),
                    Text('Resetear Controles'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'traffic',
                child: Row(
                  children: [
                    Icon(Icons.info),
                    SizedBox(width: 8),
                    Text('Info sobre Tráfico'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Panel de controles
          Container(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: SwitchListTile(
                        title: Text('Mi Ubicación'),
                        value: _myLocationEnabled,
                        onChanged: (bool value) {
                          setState(() {
                            _myLocationEnabled = value;
                          });
                        },
                      ),
                    ),
                    Expanded(
                      child: SwitchListTile(
                        title: Text('Controles Zoom'),
                        value: _zoomControlsEnabled,
                        onChanged: (bool value) {
                          setState(() {
                            _zoomControlsEnabled = value;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Expanded(
                      child: SwitchListTile(
                        title: Text('Brújula'),
                        value: _compassEnabled,
                        onChanged: (bool value) {
                          setState(() {
                            _compassEnabled = value;
                          });
                        },
                      ),
                    ),
                    Expanded(
                      child: SwitchListTile(
                        title: Text('Barra Herramientas'),
                        value: _mapToolbarEnabled,
                        onChanged: (bool value) {
                          setState(() {
                            _mapToolbarEnabled = value;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                // Selector de tipo de mapa
                Row(
                  children: [
                    Text('Tipo de Mapa: '),
                    Expanded(
                      child: DropdownButton<MapType>(
                        value: _mapType,
                        onChanged: (MapType? newValue) {
                          if (newValue != null) {
                            setState(() {
                              _mapType = newValue;
                            });
                          }
                        },
                        items: MapType.values.map<DropdownMenuItem<MapType>>((MapType value) {
                          return DropdownMenuItem<MapType>(
                            value: value,
                            child: Text(_getMapTypeName(value)),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Mapa
          Expanded(
            child: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;
                _layersController = MapLayersController(controller);
              },
              initialCameraPosition: CameraPosition(
                target: LatLng(-34.397, 150.644),
                zoom: 10.0,
              ),
              // Configuración de controles
              myLocationEnabled: _myLocationEnabled,
              myLocationButtonEnabled: _myLocationEnabled,
              zoomControlsEnabled: _zoomControlsEnabled,
              compassEnabled: _compassEnabled,
              mapToolbarEnabled: _mapToolbarEnabled,
              mapType: _mapType,
            ),
          ),
        ],
      ),
    );
  }
  
  void _resetControls() {
    setState(() {
      _myLocationEnabled = true;
      _zoomControlsEnabled = true;
      _compassEnabled = true;
      _mapToolbarEnabled = true;
      _mapType = MapType.normal;
    });
  }
  
  void _showTrafficInfo() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Información sobre Capas'),
          content: Text(
            'En Flutter, algunas capas como tráfico y transporte público '
            'no están disponibles directamente como en JavaScript. '
            'Estas funcionalidades requieren implementaciones adicionales '
            'o el uso de plugins específicos.'
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Cerrar'),
            ),
          ],
        );
      },
    );
  }
  
  String _getMapTypeName(MapType mapType) {
    switch(mapType) {
      case MapType.normal:
        return 'Normal';
      case MapType.satellite:
        return 'Satélite';
      case MapType.terrain:
        return 'Terreno';
      case MapType.hybrid:
        return 'Híbrido';
      case MapType.none:
        return 'Ninguno';
    }
  }
}
