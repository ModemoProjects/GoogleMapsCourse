import 'dart:math';
import 'package:geolocator/geolocator.dart';
import 'package:vector_math/vector_math.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MeasurementUtils {
  // Calcula la distancia entre dos puntos en metros
  static double calculateDistance(LatLng point1, LatLng point2) {
    return Geolocator.distanceBetween(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude,
    );
  }

  // Calcula la distancia total de una polyline
  static double calculatePolylineLength(List<LatLng> points) {
    if (points.length < 2) return 0.0;

    double totalDistance = 0.0;
    for (int i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(points[i], points[i + 1]);
    }
    return totalDistance;
  }

  // Calcula el área de un polígono usando la fórmula de Shoelace
  static double calculatePolygonArea(List<LatLng> points) {
    if (points.length < 3) return 0.0;

    // Convertir coordenadas geográficas a coordenadas planas (aproximación)
    List<Vector2> planePoints = points.map((point) {
      // Conversión simple de lat/lng a coordenadas planas
      // En una implementación real, usarías una proyección más precisa
      double x = point.longitude * 111320 * cos(point.latitude * pi / 180);
      double y = point.latitude * 110540;
      return Vector2(x, y);
    }).toList();

    double area = 0.0;
    int n = planePoints.length;

    for (int i = 0; i < n; i++) {
      int j = (i + 1) % n;
      area += planePoints[i].x * planePoints[j].y;
      area -= planePoints[j].x * planePoints[i].y;
    }

    return (area.abs() / 2) / 10000; // Convertir a hectáreas
  }

  // Calcula el área de un círculo
  static double calculateCircleArea(double radius) {
    return pi * radius * radius / 10000; // Convertir a hectáreas
  }

  // Calcula el perímetro de un polígono
  static double calculatePolygonPerimeter(List<LatLng> points) {
    if (points.length < 3) return 0.0;

    double perimeter = 0.0;
    for (int i = 0; i < points.length; i++) {
      int nextIndex = (i + 1) % points.length;
      perimeter += calculateDistance(points[i], points[nextIndex]);
    }
    return perimeter;
  }

  // Calcula el perímetro de un círculo
  static double calculateCirclePerimeter(double radius) {
    return 2 * pi * radius;
  }

  // Formatea la distancia en unidades apropiadas
  static String formatDistance(double distanceInMeters) {
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.toStringAsFixed(1)} m';
    } else {
      return '${(distanceInMeters / 1000).toStringAsFixed(2)} km';
    }
  }

  // Formatea el área en unidades apropiadas
  static String formatArea(double areaInHectares) {
    if (areaInHectares < 0.01) {
      return '${(areaInHectares * 10000).toStringAsFixed(1)} m²';
    } else if (areaInHectares < 1) {
      return '${(areaInHectares * 100).toStringAsFixed(1)} ares';
    } else {
      return '${areaInHectares.toStringAsFixed(2)} ha';
    }
  }
}
