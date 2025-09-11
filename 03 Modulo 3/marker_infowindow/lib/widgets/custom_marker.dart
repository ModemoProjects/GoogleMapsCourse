import 'dart:ui' as ui;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../models/location_model.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Clase utilitaria para crear markers personalizados para Google Maps
/// Genera markers con forma de gota, colores personalizados y efectos visuales
class CustomMarker {
  /// Crea un marker personalizado con forma de gota y emoji
  /// [location] - Datos de la ubicación a mostrar
  /// [isSelected] - Si el marker está seleccionado (más grande y con brillo)
  static Future<BitmapDescriptor> createCustomMarker({
    required LocationModel location,
    required bool isSelected,
  }) async {
    // Configurar canvas para dibujar el marker personalizado
    final ui.PictureRecorder recorder = ui.PictureRecorder();
    final Canvas canvas = Canvas(recorder);

    // Tamaño del marker (más grande si está seleccionado)
    final double size = isSelected ? 120.0 : 110.0;
    final double centerX = size / 2;
    final double centerY = size / 2;

    // Configurar pintura para el fondo del marker
    final Paint backgroundPaint = Paint()
      ..color = location.markerColor
      ..style = PaintingStyle.fill;

    // Crear path con forma de gota usando curvas Bézier
    final Path markerPath = Path();
    markerPath.moveTo(centerX, 0); // Punto superior
    markerPath.quadraticBezierTo(
      size,
      centerY - 10,
      size - 10,
      centerY + 5,
    ); // Lado derecho
    markerPath.quadraticBezierTo(
      size - 15,
      centerY + 15,
      centerX,
      size - 5,
    ); // Parte inferior derecha
    markerPath.quadraticBezierTo(
      15,
      centerY + 15,
      10,
      centerY + 5,
    ); // Parte inferior izquierda
    markerPath.quadraticBezierTo(0, centerY - 10, centerX, 0); // Lado izquierdo
    markerPath.close(); // Cerrar el path

    // Dibujar el fondo del marker
    canvas.drawPath(markerPath, backgroundPaint);

    // Crear efecto de sombra para dar profundidad
    final Paint shadowPaint = Paint()
      ..color = Colors.black.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2.0);

    canvas.drawPath(markerPath, shadowPaint);

    // Dibujar borde blanco para contraste
    final Paint borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    canvas.drawPath(markerPath, borderPaint);

    // Dibujar el emoji en el centro del marker
    final TextPainter textPainter = TextPainter(
      text: TextSpan(
        text: location.emoji,
        style: TextStyle(
          fontSize: isSelected
              ? 48.0
              : 44.0, // Tamaño mayor si está seleccionado
          fontFamily: 'Apple Color Emoji', // Fuente para emojis
        ),
      ),
      textDirection: TextDirection.ltr,
    );

    textPainter.layout();
    // Centrar el emoji en el marker
    textPainter.paint(
      canvas,
      Offset(centerX - textPainter.width / 2, centerY - textPainter.height / 2),
    );

    // Aplicar efectos de brillo si el marker está seleccionado
    if (isSelected) {
      // Brillo exterior con el color del marker
      final Paint glowPaint = Paint()
        ..color = location.markerColor.withOpacity(0.4)
        ..style = PaintingStyle.fill
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 15.0);

      canvas.drawPath(markerPath, glowPaint);

      // Brillo interior blanco para mayor intensidad
      final Paint innerGlowPaint = Paint()
        ..color = Colors.white.withOpacity(0.6)
        ..style = PaintingStyle.fill
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8.0);

      canvas.drawPath(markerPath, innerGlowPaint);
    }

    // Convertir el canvas a imagen PNG
    final ui.Picture picture = recorder.endRecording();
    final ui.Image image = await picture.toImage(size.toInt(), size.toInt());
    final ByteData? byteData = await image.toByteData(
      format: ui.ImageByteFormat.png,
    );

    // Retornar el descriptor de bitmap para usar en Google Maps
    return BitmapDescriptor.fromBytes(byteData!.buffer.asUint8List());
  }

  /// Crea un conjunto de markers personalizados para todas las ubicaciones
  /// [locations] - Lista de ubicaciones a mostrar en el mapa
  /// [activeLocationId] - ID de la ubicación actualmente seleccionada
  /// [onTap] - Callback que se ejecuta cuando se toca un marker
  static Future<Set<Marker>> createMarkers({
    required List<LocationModel> locations,
    required String? activeLocationId,
    required Function(LocationModel) onTap,
  }) async {
    final Set<Marker> markers = {};

    // Crear un marker personalizado para cada ubicación
    for (final location in locations) {
      final bool isSelected = activeLocationId == location.id;

      // Generar el icono personalizado para esta ubicación
      final BitmapDescriptor icon = await createCustomMarker(
        location: location,
        isSelected: isSelected,
      );

      // Crear el marker de Google Maps con el icono personalizado
      markers.add(
        Marker(
          markerId: MarkerId(location.id),
          position: location.position,
          icon: icon,
          onTap: () => onTap(location), // Callback personalizado
          infoWindow: InfoWindow(
            title: location.name,
            snippet: location.typeName,
          ),
        ),
      );
    }

    return markers;
  }
}
