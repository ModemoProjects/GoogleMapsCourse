import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapConfig {
  final LatLng initialCenter;
  final double initialZoom;
  final MapType initialMapType;
  final bool enableTapEvents;
  final bool enableDragEvents;
  final int maxEvents;
  final bool enableHapticFeedback;
  final bool enableAnimations;

  const MapConfig({
    this.initialCenter = const LatLng(21.1230729, -101.6650775), // León, Guanajuato
    this.initialZoom = 11.0,
    this.initialMapType = MapType.normal,
    this.enableTapEvents = true,
    this.enableDragEvents = true,
    this.maxEvents = 50,
    this.enableHapticFeedback = true,
    this.enableAnimations = true,
  });

  MapConfig copyWith({
    LatLng? initialCenter,
    double? initialZoom,
    MapType? initialMapType,
    bool? enableTapEvents,
    bool? enableDragEvents,
    int? maxEvents,
    bool? enableHapticFeedback,
    bool? enableAnimations,
  }) {
    return MapConfig(
      initialCenter: initialCenter ?? this.initialCenter,
      initialZoom: initialZoom ?? this.initialZoom,
      initialMapType: initialMapType ?? this.initialMapType,
      enableTapEvents: enableTapEvents ?? this.enableTapEvents,
      enableDragEvents: enableDragEvents ?? this.enableDragEvents,
      maxEvents: maxEvents ?? this.maxEvents,
      enableHapticFeedback: enableHapticFeedback ?? this.enableHapticFeedback,
      enableAnimations: enableAnimations ?? this.enableAnimations,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'initialCenter': {
        'lat': initialCenter.latitude,
        'lng': initialCenter.longitude,
      },
      'initialZoom': initialZoom,
      'initialMapType': initialMapType.index,
      'enableTapEvents': enableTapEvents,
      'enableDragEvents': enableDragEvents,
      'maxEvents': maxEvents,
      'enableHapticFeedback': enableHapticFeedback,
      'enableAnimations': enableAnimations,
    };
  }

  factory MapConfig.fromJson(Map<String, dynamic> json) {
    return MapConfig(
      initialCenter: LatLng(
        json['initialCenter']['lat'],
        json['initialCenter']['lng'],
      ),
      initialZoom: json['initialZoom'].toDouble(),
      initialMapType: MapType.values[json['initialMapType']],
      enableTapEvents: json['enableTapEvents'],
      enableDragEvents: json['enableDragEvents'],
      maxEvents: json['maxEvents'],
      enableHapticFeedback: json['enableHapticFeedback'],
      enableAnimations: json['enableAnimations'],
    );
  }
}
