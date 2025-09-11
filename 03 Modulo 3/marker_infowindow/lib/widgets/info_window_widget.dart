import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/location_model.dart';
import '../utils/constants.dart';

class InfoWindowWidget extends StatelessWidget {
  final LocationModel location;
  final VoidCallback? onClose;

  const InfoWindowWidget({
    super.key,
    required this.location,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300.0,
      decoration: BoxDecoration(
        color: AppConstants.cardBackground,
        borderRadius: BorderRadius.circular(AppConstants.borderRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20.0,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Imagen de la ubicación
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(AppConstants.borderRadius),
              topRight: Radius.circular(AppConstants.borderRadius),
            ),
            child: Stack(
              children: [
                CachedNetworkImage(
                  imageUrl: location.imageUrl,
                  width: double.infinity,
                  height: 150.0,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    height: 150.0,
                    color: Colors.grey[300],
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  errorWidget: (context, url, error) => Container(
                    height: 150.0,
                    color: Colors.grey[300],
                    child: const Icon(
                      Icons.image_not_supported,
                      size: 50.0,
                      color: Colors.grey,
                    ),
                  ),
                ),
                // Overlay con gradiente
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.3),
                        ],
                      ),
                    ),
                  ),
                ),
                // Botón de cerrar
                if (onClose != null)
                  Positioned(
                    top: 8.0,
                    right: 8.0,
                    child: GestureDetector(
                      onTap: onClose,
                      child: Container(
                        width: 30.0,
                        height: 30.0,
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                          size: 18.0,
                        ),
                      ),
                    ),
                  ),
                // Tipo de ubicación
                Positioned(
                  top: 8.0,
                  left: 8.0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 4.0,
                    ),
                    decoration: BoxDecoration(
                      color: location.markerColor,
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Text(
                      location.typeName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Contenido de la información
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Nombre y calificación
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        location.name,
                        style: const TextStyle(
                          fontSize: 18.0,
                          fontWeight: FontWeight.bold,
                          color: AppConstants.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8.0,
                        vertical: 4.0,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8.0),
                        border: Border.all(
                          color: Colors.amber.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        location.rating,
                        style: const TextStyle(
                          fontSize: 12.0,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8.0),
                // Dirección
                Row(
                  children: [
                    const Icon(
                      Icons.location_on,
                      size: 16.0,
                      color: AppConstants.textSecondary,
                    ),
                    const SizedBox(width: 4.0),
                    Expanded(
                      child: Text(
                        location.address,
                        style: const TextStyle(
                          fontSize: 14.0,
                          color: AppConstants.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4.0),
                // Teléfono (si existe)
                if (location.phone != null) ...[
                  Row(
                    children: [
                      const Icon(
                        Icons.phone,
                        size: 16.0,
                        color: AppConstants.textSecondary,
                      ),
                      const SizedBox(width: 4.0),
                      Text(
                        location.phone!,
                        style: const TextStyle(
                          fontSize: 14.0,
                          color: AppConstants.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                ],
                // Horarios
                Row(
                  children: [
                    const Icon(
                      Icons.access_time,
                      size: 16.0,
                      color: AppConstants.textSecondary,
                    ),
                    const SizedBox(width: 4.0),
                    Expanded(
                      child: Text(
                        location.hours,
                        style: const TextStyle(
                          fontSize: 14.0,
                          color: AppConstants.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                // Precio (si existe)
                if (location.price != null) ...[
                  const SizedBox(height: 4.0),
                  Row(
                    children: [
                      const Icon(
                        Icons.attach_money,
                        size: 16.0,
                        color: AppConstants.textSecondary,
                      ),
                      const SizedBox(width: 4.0),
                      Text(
                        location.price!,
                        style: const TextStyle(
                          fontSize: 14.0,
                          color: AppConstants.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 12.0),
                // Descripción
                Text(
                  location.description,
                  style: const TextStyle(
                    fontSize: 14.0,
                    color: AppConstants.textPrimary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16.0),
                // Botón de acción
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      // Aquí podrías agregar funcionalidad como abrir en Google Maps
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: location.markerColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    child: const Text(
                      'Ver en Google Maps',
                      style: TextStyle(
                        fontSize: 14.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
