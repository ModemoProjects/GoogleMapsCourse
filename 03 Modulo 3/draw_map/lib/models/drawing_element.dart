import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

enum DrawingType { polyline, polygon, circle }

class DrawingElement {
  final String id;
  final DrawingType type;
  final List<LatLng> points;
  final double? radius; // Para círculos
  final String? measurement; // Texto de medición
  final bool isVisible;
  final bool isEditable;

  DrawingElement({
    required this.id,
    required this.type,
    required this.points,
    this.radius,
    this.measurement,
    this.isVisible = true,
    this.isEditable = false,
  });

  DrawingElement copyWith({
    String? id,
    DrawingType? type,
    List<LatLng>? points,
    double? radius,
    String? measurement,
    bool? isVisible,
    bool? isEditable,
  }) {
    return DrawingElement(
      id: id ?? this.id,
      type: type ?? this.type,
      points: points ?? this.points,
      radius: radius ?? this.radius,
      measurement: measurement ?? this.measurement,
      isVisible: isVisible ?? this.isVisible,
      isEditable: isEditable ?? this.isEditable,
    );
  }

  // Convierte a Polyline para Google Maps
  Polyline toPolyline() {
    return Polyline(
      polylineId: PolylineId(id),
      points: points,
      color: Colors.blue,
      width: 3,
      visible: isVisible,
    );
  }

  // Convierte a Polygon para Google Maps
  Polygon toPolygon() {
    return Polygon(
      polygonId: PolygonId(id),
      points: points,
      fillColor: Colors.blue.withOpacity(0.3),
      strokeColor: Colors.blue,
      strokeWidth: 2,
      visible: isVisible,
    );
  }

  // Convierte a Circle para Google Maps
  Circle toCircle() {
    return Circle(
      circleId: CircleId(id),
      center: points.isNotEmpty ? points.first : const LatLng(0, 0),
      radius: radius ?? 100,
      fillColor: Colors.blue.withOpacity(0.3),
      strokeColor: Colors.blue,
      strokeWidth: 2,
      visible: isVisible,
    );
  }
}
