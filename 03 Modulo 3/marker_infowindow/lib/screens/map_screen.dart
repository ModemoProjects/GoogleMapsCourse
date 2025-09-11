import '../utils/constants.dart';
import '../services/map_service.dart';
import 'package:flutter/material.dart';
import '../models/location_model.dart';
import '../widgets/custom_marker.dart';
import 'package:provider/provider.dart';
import '../widgets/sidebar_widget.dart';
import '../widgets/info_window_widget.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Pantalla principal que muestra el mapa interactivo con:
/// - Mapa de Google Maps con markers personalizados
/// - Sidebar con lista de ubicaciones
/// - Botones de control (toggle sidebar, centrar vista)
/// - InfoWindow personalizado para mostrar detalles
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with TickerProviderStateMixin {
  // Controlador para la animación de fade-in de la pantalla
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  // Conjunto de markers que se muestran en el mapa
  Set<Marker> _markers = {};

  // Indica si el mapa está completamente cargado y listo
  bool _isMapReady = false;

  @override
  void initState() {
    super.initState();
    // Configurar animación de fade-in para una transición suave
    _fadeController = AnimationController(
      duration: AppConstants.animationDuration,
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _fadeController.forward(); // Iniciar animación inmediatamente
  }

  @override
  void dispose() {
    // Limpiar recursos para evitar memory leaks
    _fadeController.dispose();
    super.dispose();
  }

  /// Callback que se ejecuta cuando el mapa de Google Maps está listo
  /// Aquí se inicializan los markers y se configura el estado inicial
  Future<void> _onMapCreated(GoogleMapController controller) async {
    final mapService = Provider.of<MapService>(context, listen: false);
    mapService.initializeMap(controller);

    // Crear markers personalizados estáticos para todas las ubicaciones
    _markers = await CustomMarker.createMarkers(
      locations: locations,
      activeLocationId: mapService.activeLocationId,
      onTap: (location) => mapService.selectLocation(location),
    );

    setState(() {
      _isMapReady = true; // Marcar el mapa como listo para mostrar
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // AppBar con título y gradiente personalizado
      appBar: AppBar(
        title: const Text(
          'León, Guanajuato',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppConstants.primaryColor,
        elevation: 0, // Sin elevación para un look más moderno
        centerTitle: true,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: AppConstants.sidebarGradient, // Gradiente personalizado
          ),
        ),
      ),
      body: FadeTransition(
        opacity: _fadeAnimation, // Aplicar animación de fade-in
        child: Consumer<MapService>(
          builder: (context, mapService, child) {
            return Stack(
              children: [
                // Mapa de Google Maps principal
                GoogleMap(
                  onMapCreated: _onMapCreated,
                  initialCameraPosition: const CameraPosition(
                    target: LatLng(21.1230729, -101.6650775), // Centro de León
                    zoom: AppConstants.defaultZoom,
                  ),
                  markers: _markers, // Markers personalizados
                  mapType: MapType.normal,
                  zoomControlsEnabled: false, // Controles personalizados
                  myLocationButtonEnabled: false,
                  mapToolbarEnabled: false,
                  onTap: (position) => mapService
                      .clearSelection(), // Limpiar selección al tocar el mapa
                  onCameraMove: (position) {
                    // Callback para movimientos de cámara (futuras mejoras)
                  },
                ),

                // Sidebar deslizable con lista de ubicaciones
                Positioned(left: 0, top: 0, bottom: 0, child: SidebarWidget()),

                // Botón para abrir/cerrar el sidebar
                Positioned(
                  top: 8.0,
                  left: mapService.isSidebarOpen
                      ? AppConstants.sidebarWidth + 16.0
                      : 16.0,
                  child: AnimatedContainer(
                    duration: AppConstants.animationDuration,
                    child: FloatingActionButton(
                      onPressed: () => mapService.toggleSidebar(),
                      backgroundColor: AppConstants.primaryColor,
                      child: Icon(
                        mapService.isSidebarOpen ? Icons.menu_open : Icons.menu,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),

                // Botón para centrar la vista en todas las ubicaciones
                Positioned(
                  top: 80.0,
                  left: mapService.isSidebarOpen
                      ? AppConstants.sidebarWidth + 16.0
                      : 16.0,
                  child: FloatingActionButton(
                    onPressed: () => mapService.fitAllMarkers(),
                    backgroundColor: AppConstants.secondaryColor,
                    mini: true,
                    child: const Icon(Icons.my_location, color: Colors.white),
                  ),
                ),

                // InfoWindow personalizado que aparece cuando se selecciona una ubicación
                if (mapService.selectedLocation != null)
                  Positioned(
                    bottom: 20.0,
                    left: 20.0,
                    right: 20.0,
                    child: InfoWindowWidget(
                      location: mapService.selectedLocation!,
                      onClose: () => mapService.clearSelection(),
                    ),
                  ),

                // Pantalla de carga mientras se inicializa el mapa
                if (!_isMapReady)
                  Container(
                    color: Colors.white,
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppConstants.primaryColor,
                            ),
                          ),
                          SizedBox(height: 16.0),
                          Text(
                            'Cargando mapa...',
                            style: TextStyle(
                              fontSize: 16.0,
                              color: AppConstants.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}
