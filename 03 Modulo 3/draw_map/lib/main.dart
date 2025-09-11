import 'models/drawing_element.dart';
import 'package:flutter/material.dart';
import 'config/google_maps_config.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mapa de Dibujo Interactivo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const MapDrawingPage(),
    );
  }
}

class MapDrawingPage extends StatefulWidget {
  const MapDrawingPage({super.key});

  @override
  State<MapDrawingPage> createState() => _MapDrawingPageState();
}

class _MapDrawingPageState extends State<MapDrawingPage> {
  GoogleMapController? _mapController;
  Set<Polyline> _polylines = {};
  Set<Polygon> _polygons = {};
  Set<Circle> _circles = {};
  Set<Marker> _markers = {};

  List<DrawingElement> _drawingElements = [];

  // Controles de visibilidad
  bool _showPolylines = true;
  bool _showPolygons = true;
  bool _showCircles = true;
  bool _showMeasurements = true;
  bool _showSidePanel = true;

  // Configuración del mapa
  static const LatLng _initialPosition = LatLng(
    GoogleMapsConfig.initialLatitude,
    GoogleMapsConfig.initialLongitude,
  );
  static const double _initialZoom = GoogleMapsConfig.defaultZoom;

  @override
  void initState() {
    super.initState();
    _createHardcodedElements();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mapa de Dibujo Interactivo'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        elevation: 2,
        actions: [
          IconButton(
            icon: Icon(_showSidePanel ? Icons.menu_open : Icons.menu),
            onPressed: () {
              setState(() {
                _showSidePanel = !_showSidePanel;
              });
            },
            tooltip: _showSidePanel ? 'Ocultar Panel' : 'Mostrar Panel',
          ),
        ],
      ),
      body: Row(
        children: [
          // Panel de controles lateral
          if (_showSidePanel)
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 280,
              color: Colors.grey[100],
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        'Herramientas de Dibujo',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const Divider(),

                    // Controles de visibilidad
                    _buildVisibilityControls(),
                    const Divider(),

                    // Botón limpiar
                    _buildClearButton(),
                    const Divider(),

                    // Botón centrar mapa
                    _buildCenterButton(),
                    const Divider(),

                    // Lista de elementos
                    _buildElementsList(),
                  ],
                ),
              ),
            ),

          // Mapa
          Expanded(
            child: GoogleMap(
              onMapCreated: _onMapCreated,
              initialCameraPosition: const CameraPosition(
                target: _initialPosition,
                zoom: _initialZoom,
              ),
              polylines: _polylines,
              polygons: _polygons,
              circles: _circles,
              markers: _markers,
              onTap: _onMapTapped,
            ),
          ),
        ],
      ),
    );
  }

  void _createHardcodedElements() {
    // Crear elementos hardcodeados para demostración
    final elements = [
      // Línea 1
      DrawingElement(
        id: 'line_1',
        type: DrawingType.polyline,
        points: [
          const LatLng(21.1224, -101.6866), // León centro
          const LatLng(21.1324, -101.6766), // Norte
        ],
        measurement: '1.2 km',
      ),
      // Línea 2
      DrawingElement(
        id: 'line_2',
        type: DrawingType.polyline,
        points: [
          const LatLng(21.1124, -101.6966), // Sur
          const LatLng(21.1224, -101.6866), // León centro
          const LatLng(21.1324, -101.6966), // Este
        ],
        measurement: '2.1 km',
      ),
      // Polígono 1
      DrawingElement(
        id: 'polygon_1',
        type: DrawingType.polygon,
        points: [
          const LatLng(21.1250, -101.6900),
          const LatLng(21.1300, -101.6900),
          const LatLng(21.1300, -101.6850),
          const LatLng(21.1250, -101.6850),
        ],
        measurement: 'Área: 0.25 ha\nPerímetro: 2.0 km',
      ),
      // Círculo 1
      DrawingElement(
        id: 'circle_1',
        type: DrawingType.circle,
        points: [const LatLng(21.1200, -101.6800)],
        radius: 500, // 500 metros
        measurement: 'Área: 0.79 ha\nPerímetro: 3.14 km',
      ),
      // Círculo 2
      DrawingElement(
        id: 'circle_2',
        type: DrawingType.circle,
        points: [const LatLng(21.1350, -101.6750)],
        radius: 300, // 300 metros
        measurement: 'Área: 0.28 ha\nPerímetro: 1.88 km',
      ),
    ];

    setState(() {
      _drawingElements = elements;
      _updateMapElements();
    });
  }

  Widget _buildVisibilityControls() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Mostrar/Ocultar:',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          CheckboxListTile(
            title: const Text('Líneas'),
            value: _showPolylines,
            onChanged: (value) => setState(() {
              _showPolylines = value!;
              _updateMapElements();
            }),
          ),
          CheckboxListTile(
            title: const Text('Polígonos'),
            value: _showPolygons,
            onChanged: (value) => setState(() {
              _showPolygons = value!;
              _updateMapElements();
            }),
          ),
          CheckboxListTile(
            title: const Text('Círculos'),
            value: _showCircles,
            onChanged: (value) => setState(() {
              _showCircles = value!;
              _updateMapElements();
            }),
          ),
          CheckboxListTile(
            title: const Text('Mediciones'),
            value: _showMeasurements,
            onChanged: (value) => setState(() {
              _showMeasurements = value!;
              _updateMapElements();
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildClearButton() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: _clearAllElements,
          icon: const Icon(Icons.clear_all),
          label: const Text('Limpiar Todo'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildCenterButton() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: _centerMap,
          icon: const Icon(Icons.center_focus_strong),
          label: const Text('Centrar Mapa'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildElementsList() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Elementos:',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          // Usar un Container con altura fija para evitar overflow
          Container(
            height: 200, // Altura fija para la lista
            child: ListView.builder(
              itemCount: _drawingElements.length,
              itemBuilder: (context, index) {
                final element = _drawingElements[index];
                return Card(
                  child: ListTile(
                    leading: Icon(_getElementIcon(element.type)),
                    title: Text('${element.type.name} ${index + 1}'),
                    subtitle: element.measurement != null
                        ? Text(element.measurement!)
                        : null,
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: Icon(
                            element.isVisible
                                ? Icons.visibility
                                : Icons.visibility_off,
                          ),
                          onPressed: () => _toggleElementVisibility(index),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () => _deleteElement(index),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  IconData _getElementIcon(DrawingType type) {
    switch (type) {
      case DrawingType.polyline:
        return Icons.timeline;
      case DrawingType.polygon:
        return Icons.crop_square;
      case DrawingType.circle:
        return Icons.radio_button_unchecked;
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
  }

  void _centerMap() {
    if (_mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(_initialPosition, _initialZoom),
      );
    }
  }

  void _onMapTapped(LatLng position) {
    // Por ahora solo mostrar información del tap
    print('Tapped at: ${position.latitude}, ${position.longitude}');
  }

  void _updateMapElements() {
    _polylines.clear();
    _polygons.clear();
    _circles.clear();
    _markers.clear();

    for (final element in _drawingElements) {
      if (!element.isVisible) continue;

      switch (element.type) {
        case DrawingType.polyline:
          if (_showPolylines) {
            _polylines.add(element.toPolyline());
          }
          break;
        case DrawingType.polygon:
          if (_showPolygons) {
            _polygons.add(element.toPolygon());
          }
          break;
        case DrawingType.circle:
          if (_showCircles) {
            _circles.add(element.toCircle());
          }
          break;
      }

      // Agregar marcadores de medición si está habilitado
      if (_showMeasurements && element.measurement != null) {
        _markers.add(
          Marker(
            markerId: MarkerId('${element.id}_measurement'),
            position: element.points.first,
            infoWindow: InfoWindow(
              title: 'Medición',
              snippet: element.measurement,
            ),
          ),
        );
      }
    }
  }

  void _toggleElementVisibility(int index) {
    setState(() {
      _drawingElements[index] = _drawingElements[index].copyWith(
        isVisible: !_drawingElements[index].isVisible,
      );
      _updateMapElements();
    });
  }

  void _deleteElement(int index) {
    setState(() {
      _drawingElements.removeAt(index);
      _updateMapElements();
    });
  }

  void _clearAllElements() {
    setState(() {
      _drawingElements.clear();
      _polylines.clear();
      _polygons.clear();
      _circles.clear();
      _markers.clear();
    });
  }
}
