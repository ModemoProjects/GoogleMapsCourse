import 'package:flutter/material.dart';
import '../models/address_components.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Widget del mapa de Google con funcionalidades de tap y centrado
class MapWidget extends StatefulWidget {
  final AddressComponents? addressComponents;
  final ValueChanged<AddressComponents> onLocationSelected;
  final double? initialLatitude;
  final double? initialLongitude;
  final double initialZoom;
  final bool showMyLocationButton;
  final bool isLoading;

  const MapWidget({
    super.key,
    this.addressComponents,
    required this.onLocationSelected,
    this.initialLatitude,
    this.initialLongitude,
    this.initialZoom = 15.0,
    this.showMyLocationButton = true,
    this.isLoading = false,
  });

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  bool _isLoadingLocation = false;

  @override
  void initState() {
    super.initState();
    _updateMarkerFromAddress();
  }

  @override
  void didUpdateWidget(MapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.addressComponents != oldWidget.addressComponents) {
      _updateMarkerFromAddress();
    }
  }

  void _updateMarkerFromAddress() {
    if (widget.addressComponents?.formattedAddress != null) {
      // Usar las coordenadas reales de la dirección si están disponibles
      LatLng location;
      if (widget.addressComponents!.latitude != null &&
          widget.addressComponents!.longitude != null) {
        location = LatLng(
          widget.addressComponents!.latitude!,
          widget.addressComponents!.longitude!,
        );
      } else {
        // Fallback a coordenadas por defecto si no hay coordenadas (León, Gto)
        location = const LatLng(21.1224, -101.6866);
      }

      setState(() {
        _markers = {
          Marker(
            markerId: const MarkerId('selected_location'),
            position: location,
            infoWindow: InfoWindow(
              title: 'Ubicación Seleccionada',
              snippet: widget.addressComponents!.formattedAddress,
            ),
          ),
        };
      });

      // Animar la cámara a la nueva ubicación
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(location, widget.initialZoom),
      );
    }
  }

  Future<void> _centerOnMyLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      // Solicitar permisos de ubicación
      final status = await Permission.location.request();

      if (status.isGranted) {
        // En un caso real, usarías geolocator para obtener la ubicación actual
        // Por ahora, simulamos con coordenadas de León, Guanajuato
        const myLocation = LatLng(21.1224, -101.6866);

        setState(() {
          _markers.add(
            Marker(
              markerId: const MarkerId('my_location'),
              position: myLocation,
              infoWindow: const InfoWindow(
                title: 'Mi Ubicación',
                snippet: 'Ubicación actual',
              ),
              icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueBlue,
              ),
            ),
          );
        });

        // Animar la cámara a la ubicación actual
        await _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(myLocation, widget.initialZoom),
        );
      } else {
        _showLocationPermissionDialog();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al obtener ubicación: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
        });
      }
    }
  }

  void _showLocationPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Permisos de Ubicación'),
        content: const Text(
          'Para usar esta función, necesitamos acceso a tu ubicación. '
          'Puedes habilitarlo en la configuración de la aplicación.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              openAppSettings();
            },
            child: const Text('Configuración'),
          ),
        ],
      ),
    );
  }

  void _onMapTap(LatLng position) {
    setState(() {
      _markers = {
        Marker(
          markerId: const MarkerId('tapped_location'),
          position: position,
          infoWindow: InfoWindow(
            title: 'Ubicación Seleccionada',
            snippet: 'Obteniendo dirección...',
          ),
        ),
      };
    });

    // Crear AddressComponents con las coordenadas del tap
    // Usar un identificador especial para indicar que es un tap en mapa
    final tappedAddress = AddressComponents(
      latitude: position.latitude,
      longitude: position.longitude,
      formattedAddress: 'TAP_ON_MAP', // Identificador especial
    );

    widget.onLocationSelected(tappedAddress);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: 300,
          child: Stack(
            children: [
              GoogleMap(
                onMapCreated: (GoogleMapController controller) {
                  _mapController = controller;
                },
                initialCameraPosition: CameraPosition(
                  target: LatLng(
                    widget.initialLatitude ?? 21.1224,
                    widget.initialLongitude ?? -101.6866,
                  ),
                  zoom: widget.initialZoom,
                ),
                markers: _markers,
                onTap: _onMapTap,
                myLocationEnabled: false, // Se maneja manualmente
                myLocationButtonEnabled: false, // Se maneja manualmente
                mapType: MapType.normal,
                zoomControlsEnabled: true,
                compassEnabled: true,
                mapToolbarEnabled: false,
              ),
              if (widget.showMyLocationButton)
                Positioned(
                  top: 16,
                  right: 16,
                  child: FloatingActionButton(
                    mini: true,
                    onPressed: _isLoadingLocation ? null : _centerOnMyLocation,
                    child: _isLoadingLocation
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Icon(Icons.my_location),
                  ),
                ),
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: widget.isLoading
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Obteniendo dirección...',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        )
                      : const Text(
                          'Toca en el mapa para seleccionar una ubicación',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
