import '../widgets/events_panel.dart';
import 'package:flutter/material.dart';
import '../widgets/control_panel.dart';
import 'package:provider/provider.dart';
import '../providers/map_provider.dart';
import '../widgets/custom_info_window.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with TickerProviderStateMixin {
  String? _selectedMarkerId; // ID del marcador seleccionado
  late AnimationController
  _markerAnimationController; // Controlador de animaciones
  bool _isMapReady = false; // Estado de carga del mapa

  @override
  void initState() {
    super.initState();
    // Configurar animación para marcadores
    _markerAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _markerAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<MapProvider>(
        builder: (context, mapProvider, child) {
          return Stack(
            children: [
              // Google Maps - Componente principal del mapa
              GoogleMap(
                onMapCreated: (GoogleMapController controller) {
                  print('✅ Mapa creado correctamente');
                  mapProvider.onMapCreated(controller);
                  if (mounted) {
                    setState(() {
                      _isMapReady = true;
                      print('✅ _isMapReady = true');
                    });
                  }
                },
                initialCameraPosition: const CameraPosition(
                  target: LatLng(
                    21.1230729,
                    -101.6650775,
                  ), // Centro: León, Guanajuato
                  zoom: 11.0, // Zoom inicial
                ),
                mapType: mapProvider.currentMapType, // Tipo de mapa actual
                onTap: (LatLng position) {
                  // Agregar marcador al tocar el mapa
                  mapProvider.onMapTap(position);
                  if (mapProvider.config.enableTapEvents) {
                    mapProvider.addMarker(position);
                    _addMarkerWithAnimation(position);
                  }
                },
                onCameraMove: (CameraPosition position) {
                  // Actualizar posición de la cámara
                  mapProvider.updateCenter(position.target);
                  mapProvider.onCameraMove(position);
                },
                markers: _buildMarkers(mapProvider), // Marcadores del mapa
                myLocationEnabled: true, // Mostrar ubicación actual
                myLocationButtonEnabled: false,
                zoomControlsEnabled: true, // Controles de zoom
                mapToolbarEnabled: false,
                onCameraIdle: () {
                  // Evento cuando la cámara deja de moverse
                  if (mapProvider.config.enableDragEvents) {
                    mapProvider.onMapDrag(mapProvider.currentCenter);
                  }
                },
              ),

              // Indicador de carga - SOLO si no está listo
              if (!_isMapReady)
                Container(
                  color: Colors.white.withOpacity(0.9),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text(
                          'Cargando mapa...',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // Panel de eventos flotante (esquina superior derecha)
              if (_isMapReady) const EventsPanel(),

              // InfoWindow personalizado para marcadores seleccionados
              if (_isMapReady && _selectedMarkerId != null)
                Positioned(
                  bottom: 200,
                  left: 16,
                  right: 16,
                  child: CustomInfoWindow(
                    marker: mapProvider.markers[_selectedMarkerId]!,
                    onDelete: () {
                      mapProvider.removeMarker(_selectedMarkerId!);
                      setState(() {
                        _selectedMarkerId = null;
                      });
                    },
                  ),
                ),

              // Panel de controles deslizable (parte inferior)
              if (_isMapReady) const ControlPanel(),
            ],
          );
        },
      ),
    );
  }

  // Construir marcadores con animación de caída
  Set<Marker> _buildMarkers(MapProvider mapProvider) {
    return mapProvider.markers.values.map((marker) {
      return Marker(
        markerId: MarkerId(marker.id),
        position: marker.position,
        infoWindow: InfoWindow(title: marker.title, snippet: marker.snippet),
        draggable: marker.isDraggable, // Marcadores arrastrables
        onTap: () {
          // Seleccionar marcador al tocarlo
          mapProvider.onMarkerTap(marker.id);
          setState(() {
            _selectedMarkerId = marker.id;
          });
        },
        onDragEnd: (newPosition) {
          // Actualizar posición al arrastrar marcador
          mapProvider.onMarkerDrag(marker.id, newPosition);
        },
        icon: BitmapDescriptor.defaultMarkerWithHue(_getMarkerColor(marker.id)),
      );
    }).toSet();
  }

  double _getMarkerColor(String markerId) {
    final hash = markerId.hashCode;
    return (hash % 360).toDouble();
  }

  // Animación de caída para nuevos marcadores
  void _addMarkerWithAnimation(LatLng position) {
    _markerAnimationController.forward().then((_) {
      _markerAnimationController.reset();
    });
  }
}
