import 'location_button.dart';
import '../utils/constants.dart';
import '../services/map_service.dart';
import 'package:flutter/material.dart';
import '../models/location_model.dart';
import 'package:provider/provider.dart';

class SidebarWidget extends StatelessWidget {
  const SidebarWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<MapService>(
      builder: (context, mapService, child) {
        return AnimatedContainer(
          duration: AppConstants.animationDuration,
          width: mapService.isSidebarOpen ? AppConstants.sidebarWidth : 0,
          child: mapService.isSidebarOpen
              ? Container(
                  decoration: BoxDecoration(
                    gradient: AppConstants.sidebarGradient,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 20.0,
                        offset: const Offset(5, 0),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Header del sidebar
                      Container(
                        padding: EdgeInsets.only(
                          top: 20.0,
                          left: 20.0,
                          right: 20.0,
                          bottom: 20.0,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.map,
                                  color: Colors.white,
                                  size: 28.0,
                                ),
                                const SizedBox(width: 12.0),
                                const Expanded(
                                  child: Text(
                                    'León, Guanajuato',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 20.0,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => mapService.toggleSidebar(),
                                  icon: const Icon(
                                    Icons.close,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8.0),
                            Text(
                              'Explora los lugares más destacados',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 14.0,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Lista de ubicaciones
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: ListView.builder(
                            itemCount: locations.length,
                            itemBuilder: (context, index) {
                              final location = locations[index];
                              final isActive =
                                  mapService.activeLocationId == location.id;

                              return LocationButton(
                                location: location,
                                isActive: isActive,
                                onTap: () {
                                  mapService.selectLocation(location);
                                  mapService
                                      .toggleSidebar(); // Cerrar sidebar automáticamente
                                },
                              );
                            },
                          ),
                        ),
                      ),
                      // Panel de instrucciones
                      Container(
                        margin: const EdgeInsets.all(16.0),
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: AppConstants.glassmorphismColor,
                          borderRadius: BorderRadius.circular(
                            AppConstants.borderRadius,
                          ),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.info_outline,
                                  color: Colors.white,
                                  size: 20.0,
                                ),
                                const SizedBox(width: 8.0),
                                const Text(
                                  'Instrucciones',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8.0),
                            Text(
                              '• Toca cualquier botón para centrar el mapa\n'
                              '• Toca un marcador para ver más información\n'
                              '• Usa gestos para navegar por el mapa',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 12.0,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              : const SizedBox.shrink(),
        );
      },
    );
  }
}
