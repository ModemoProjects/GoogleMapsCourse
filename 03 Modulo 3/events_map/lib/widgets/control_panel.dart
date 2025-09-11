import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/map_provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class ControlPanel extends StatelessWidget {
  const ControlPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<MapProvider>(
      builder: (context, mapProvider, child) {
        return Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF667eea),
                  Color(0xFF764ba2),
                ], // Gradiente azul-púrpura
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(15),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Handle para arrastrar el panel
                  Container(
                    width: 40,
                    height: 3,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Información básica del mapa
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildInfoCard(
                        'Centro',
                        '${mapProvider.currentCenter.latitude.toStringAsFixed(4)}, ${mapProvider.currentCenter.longitude.toStringAsFixed(4)}',
                      ),
                      _buildInfoCard(
                        'Zoom',
                        mapProvider.currentZoom.toStringAsFixed(1),
                      ),
                      _buildInfoCard(
                        'Marcadores',
                        mapProvider.markerCount.toString(),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Botones de control principales
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildControlButton(
                        'Agregar',
                        Icons.add_location,
                        () => mapProvider
                            .addMarkerAtCenter(), // Agregar marcador en el centro
                      ),
                      _buildControlButton(
                        'Limpiar',
                        Icons.clear_all,
                        () => mapProvider
                            .clearAllMarkers(), // Limpiar todos los marcadores
                      ),
                      _buildControlButton(
                        'Tipo',
                        Icons.map,
                        () => _showMapTypeDialog(
                          context,
                          mapProvider,
                        ), // Cambiar tipo de mapa
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white70, fontSize: 10),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton(String label, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMapTypeDialog(BuildContext context, MapProvider mapProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tipo de Mapa'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: MapType.values.map((type) {
            return ListTile(
              title: Text(_getMapTypeName(type)),
              leading: Radio<MapType>(
                value: type,
                groupValue: mapProvider.currentMapType,
                onChanged: (MapType? value) {
                  if (value != null) {
                    mapProvider.changeMapType(value);
                    Navigator.of(context).pop();
                  }
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  String _getMapTypeName(MapType type) {
    switch (type) {
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
}
