import '../utils/constants.dart';
import 'package:flutter/material.dart';
import '../models/location_model.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Servicio principal que maneja el estado del mapa y la lógica de negocio
/// Utiliza ChangeNotifier para notificar cambios de estado a la UI
class MapService extends ChangeNotifier {
  // Controlador del mapa de Google Maps
  GoogleMapController? _mapController;

  // Conjunto de markers mostrados en el mapa
  Set<Marker> _markers = {};

  // Ubicación actualmente seleccionada
  LocationModel? _selectedLocation;

  // Estado del sidebar (abierto/cerrado)
  bool _isSidebarOpen = true;

  // ID de la ubicación activa (para resaltar en la UI)
  String? _activeLocationId;

  // Getters para acceder al estado desde la UI
  GoogleMapController? get mapController => _mapController;
  Set<Marker> get markers => _markers;
  LocationModel? get selectedLocation => _selectedLocation;
  bool get isSidebarOpen => _isSidebarOpen;
  String? get activeLocationId => _activeLocationId;

  /// Inicializa el controlador del mapa y crea los markers iniciales
  void initializeMap(GoogleMapController controller) {
    _mapController = controller;
    _createMarkers();
    notifyListeners();
  }

  /// Crea markers por defecto para todas las ubicaciones disponibles
  /// Utiliza colores diferentes según el tipo de ubicación
  void _createMarkers() {
    _markers = locations.map((location) {
      return Marker(
        markerId: MarkerId(location.id),
        position: location.position,
        icon: BitmapDescriptor.defaultMarkerWithHue(
          _getMarkerHue(location.type),
        ),
        onTap: () => _onMarkerTapped(location),
        infoWindow: InfoWindow(
          title: location.name,
          snippet: location.typeName,
        ),
      );
    }).toSet();
  }

  /// Retorna el color del marker según el tipo de ubicación
  double _getMarkerHue(LocationType type) {
    switch (type) {
      case LocationType.restaurant:
        return BitmapDescriptor.hueRed;
      case LocationType.park:
        return BitmapDescriptor.hueGreen;
      case LocationType.museum:
        return BitmapDescriptor.hueBlue;
      case LocationType.shopping:
        return BitmapDescriptor.hueOrange;
    }
  }

  /// Maneja el tap en un marker del mapa
  void _onMarkerTapped(LocationModel location) {
    _selectedLocation = location;
    _activeLocationId = location.id;
    notifyListeners();
  }

  /// Selecciona una ubicación y centra la cámara en ella
  void selectLocation(LocationModel location) {
    _selectedLocation = location;
    _activeLocationId = location.id;

    // Animar la cámara hacia la ubicación seleccionada
    _mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: location.position,
          zoom: AppConstants.markerZoom,
        ),
      ),
    );

    notifyListeners();
  }

  /// Limpia la selección actual
  void clearSelection() {
    _selectedLocation = null;
    _activeLocationId = null;
    notifyListeners();
  }

  /// Alterna el estado del sidebar (abrir/cerrar)
  void toggleSidebar() {
    _isSidebarOpen = !_isSidebarOpen;
    notifyListeners();
  }

  /// Establece el estado del sidebar explícitamente
  void setSidebarOpen(bool isOpen) {
    _isSidebarOpen = isOpen;
    notifyListeners();
  }

  /// Centra la cámara en una ubicación específica
  void centerOnLocation(LocationModel location) {
    _mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: location.position,
          zoom: AppConstants.markerZoom,
        ),
      ),
    );
  }

  /// Ajusta la cámara para mostrar todas las ubicaciones en pantalla
  void fitAllMarkers() {
    if (_markers.isEmpty) return;

    // Calcular los límites geográficos de todas las ubicaciones
    double minLat = locations.first.position.latitude;
    double maxLat = locations.first.position.latitude;
    double minLng = locations.first.position.longitude;
    double maxLng = locations.first.position.longitude;

    for (var location in locations) {
      minLat = minLat < location.position.latitude
          ? minLat
          : location.position.latitude;
      maxLat = maxLat > location.position.latitude
          ? maxLat
          : location.position.latitude;
      minLng = minLng < location.position.longitude
          ? minLng
          : location.position.longitude;
      maxLng = maxLng > location.position.longitude
          ? maxLng
          : location.position.longitude;
    }

    // Animar la cámara para mostrar todos los markers
    _mapController?.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        100.0, // padding en píxeles
      ),
    );
  }
}
