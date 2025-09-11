import 'dart:math';
import 'dart:async';
import '../models/map_event.dart';
import '../models/map_marker.dart';
import '../models/map_config.dart';
import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapProvider extends ChangeNotifier {
  // Configuración del mapa
  MapConfig _config = const MapConfig();
  MapConfig get config => _config;

  // Estado del mapa
  LatLng _currentCenter = const LatLng(
    21.1230729,
    -101.6650775,
  ); // Centro: León, Guanajuato
  double _currentZoom = 11.0; // Zoom inicial
  MapType _currentMapType = MapType.normal; // Tipo de mapa
  LatLng? _lastTappedPosition; // Última posición tocada

  // Marcadores del mapa
  final Map<String, MapMarker> _markers = {};
  Map<String, MapMarker> get markers => Map.unmodifiable(_markers);

  // Log de eventos del mapa
  final List<MapEvent> _events = [];
  List<MapEvent> get events => List.unmodifiable(_events);

  // Estadísticas
  int _tapCount = 0;
  int _zoomCount = 0;
  int _dragCount = 0;

  // Getters
  LatLng get currentCenter => _currentCenter;
  double get currentZoom => _currentZoom;
  MapType get currentMapType => _currentMapType;
  LatLng? get lastTappedPosition => _lastTappedPosition;
  int get tapCount => _tapCount;
  int get zoomCount => _zoomCount;
  int get dragCount => _dragCount;
  int get markerCount => _markers.length;

  // Controladores
  final Completer<GoogleMapController> _mapController =
      Completer<GoogleMapController>();
  GoogleMapController? get mapController =>
      _mapController.isCompleted ? null : null;

  // Debouncing para eventos de movimiento
  Timer? _dragDebounceTimer;
  Timer? _zoomDebounceTimer;

  MapProvider() {
    _loadConfig();
  }

  // Cargar configuración guardada
  Future<void> _loadConfig() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final configJson = prefs.getString('map_config');
      if (configJson != null) {
        // Aquí podrías deserializar la configuración si fuera necesario
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading config: $e');
    }
  }

  // Guardar configuración
  Future<void> _saveConfig() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('map_config', _config.toJson().toString());
    } catch (e) {
      debugPrint('Error saving config: $e');
    }
  }

  // Inicializar el controlador del mapa
  void onMapCreated(GoogleMapController controller) {
    if (!_mapController.isCompleted) {
      _mapController.complete(controller);
    }
  }

  // Actualizar centro del mapa
  void updateCenter(LatLng center) {
    _currentCenter = center;
    notifyListeners();
  }

  // Actualizar zoom del mapa
  void updateZoom(double zoom) {
    _currentZoom = zoom;
    notifyListeners();
  }

  // Cambiar tipo de mapa
  void changeMapType(MapType mapType) {
    _currentMapType = mapType;
    _addEvent(
      MapEvent(
        id: _generateId(),
        type: EventType.mapTypeChange,
        timestamp: DateTime.now(),
        description: 'Tipo de mapa cambiado a ${_getMapTypeName(mapType)}',
        data: {'mapType': mapType.index},
      ),
    );
    notifyListeners();
  }

  // Manejar toque en el mapa
  void onMapTap(LatLng position) {
    if (!_config.enableTapEvents) return;

    _lastTappedPosition = position;
    _tapCount++;

    _addEvent(
      MapEvent(
        id: _generateId(),
        type: EventType.click,
        timestamp: DateTime.now(),
        description: 'Toque en el mapa',
        position: position,
        data: {
          'coordinates':
              '${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}',
        },
      ),
    );

    if (_config.enableHapticFeedback) {
      Vibration.vibrate(duration: 50);
    }

    notifyListeners();
  }

  // Manejar arrastre del mapa
  void onMapDrag(LatLng newCenter) {
    if (!_config.enableDragEvents) return;

    _currentCenter = newCenter;
    _dragDebounceTimer?.cancel();
    _dragDebounceTimer = Timer(const Duration(milliseconds: 500), () {
      _dragCount++;

      _addEvent(
        MapEvent(
          id: _generateId(),
          type: EventType.drag,
          timestamp: DateTime.now(),
          description: 'Arrastre del mapa completado',
          position: newCenter,
          data: {
            'coordinates':
                '${newCenter.latitude.toStringAsFixed(6)}, ${newCenter.longitude.toStringAsFixed(6)}',
          },
        ),
      );

      notifyListeners();
    });
  }

  // Manejar cambio de zoom
  void onCameraMove(CameraPosition position) {
    _zoomDebounceTimer?.cancel();
    _zoomDebounceTimer = Timer(const Duration(milliseconds: 500), () {
      if ((position.zoom - _currentZoom).abs() > 0.1) {
        _currentZoom = position.zoom;
        _zoomCount++;

        _addEvent(
          MapEvent(
            id: _generateId(),
            type: EventType.zoom,
            timestamp: DateTime.now(),
            description: 'Zoom cambiado a ${position.zoom.toStringAsFixed(1)}',
            position: position.target,
            data: {'zoom': position.zoom},
          ),
        );

        notifyListeners();
      }
    });
  }

  // Agregar marcador
  void addMarker(LatLng position) {
    final marker = MapMarker(
      id: _generateId(),
      position: position,
      title: 'Marcador ${_markers.length + 1}',
      snippet:
          'Coordenadas: ${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}',
      createdAt: DateTime.now(),
    );

    _markers[marker.id] = marker;

    _addEvent(
      MapEvent(
        id: _generateId(),
        type: EventType.markerAdded,
        timestamp: DateTime.now(),
        description: 'Marcador agregado',
        position: position,
        data: {'markerId': marker.id},
      ),
    );

    if (_config.enableHapticFeedback) {
      Vibration.vibrate(duration: 100);
    }

    notifyListeners();
  }

  // Agregar marcador en el centro
  void addMarkerAtCenter() {
    addMarker(_currentCenter);
  }

  // Eliminar marcador
  void removeMarker(String markerId) {
    final marker = _markers.remove(markerId);
    if (marker != null) {
      _addEvent(
        MapEvent(
          id: _generateId(),
          type: EventType.markerRemoved,
          timestamp: DateTime.now(),
          description: 'Marcador eliminado',
          position: marker.position,
          data: {'markerId': markerId},
        ),
      );
      notifyListeners();
    }
  }

  // Limpiar todos los marcadores
  void clearAllMarkers() {
    _markers.clear();
    _addEvent(
      MapEvent(
        id: _generateId(),
        type: EventType.markerRemoved,
        timestamp: DateTime.now(),
        description: 'Todos los marcadores eliminados',
        data: {'count': _markers.length},
      ),
    );
    notifyListeners();
  }

  // Manejar toque en marcador
  void onMarkerTap(String markerId) {
    _addEvent(
      MapEvent(
        id: _generateId(),
        type: EventType.markerClick,
        timestamp: DateTime.now(),
        description:
            'Toque en marcador: ${_markers[markerId]?.title ?? 'Desconocido'}',
        position: _markers[markerId]?.position,
        data: {'markerId': markerId},
      ),
    );

    if (_config.enableHapticFeedback) {
      Vibration.vibrate(duration: 30);
    }

    notifyListeners();
  }

  // Manejar arrastre de marcador
  void onMarkerDrag(String markerId, LatLng newPosition) {
    final marker = _markers[markerId];
    if (marker != null) {
      _markers[markerId] = marker.copyWith(position: newPosition);

      _addEvent(
        MapEvent(
          id: _generateId(),
          type: EventType.markerDrag,
          timestamp: DateTime.now(),
          description: 'Marcador arrastrado: ${marker.title}',
          position: newPosition,
          data: {'markerId': markerId, 'oldPosition': marker.position},
        ),
      );

      notifyListeners();
    }
  }

  // Agregar evento
  void _addEvent(MapEvent event) {
    _events.insert(
      0,
      event,
    ); // Insertar al inicio para mostrar los más recientes

    // Limitar el número de eventos
    if (_events.length > _config.maxEvents) {
      _events.removeRange(_config.maxEvents, _events.length);
    }
  }

  // Limpiar eventos
  void clearEvents() {
    _events.clear();
    notifyListeners();
  }

  // Toggle eventos de toque
  void toggleTapEvents() {
    _config = _config.copyWith(enableTapEvents: !_config.enableTapEvents);
    _saveConfig();
    notifyListeners();
  }

  // Toggle eventos de arrastre
  void toggleDragEvents() {
    _config = _config.copyWith(enableDragEvents: !_config.enableDragEvents);
    _saveConfig();
    notifyListeners();
  }

  // Obtener nombre del tipo de mapa
  String _getMapTypeName(MapType mapType) {
    switch (mapType) {
      case MapType.normal:
        return 'Normal';
      case MapType.satellite:
        return 'Satélite';
      case MapType.hybrid:
        return 'Híbrido';
      case MapType.terrain:
        return 'Terreno';
      case MapType.none:
        return 'Ninguno';
    }
  }

  // Generar ID único
  String _generateId() {
    return DateTime.now().millisecondsSinceEpoch.toString() +
        Random().nextInt(1000).toString();
  }

  // Animar a una posición específica
  Future<void> animateToPosition(LatLng position, {double? zoom}) async {
    if (_mapController.isCompleted) {
      final controller = await _mapController.future;
      await controller.animateCamera(
        CameraUpdate.newLatLngZoom(position, zoom ?? _currentZoom),
      );
    }
  }

  @override
  void dispose() {
    _dragDebounceTimer?.cancel();
    _zoomDebounceTimer?.cancel();
    super.dispose();
  }
}
