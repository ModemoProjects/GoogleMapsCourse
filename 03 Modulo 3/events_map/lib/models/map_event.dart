import 'package:google_maps_flutter/google_maps_flutter.dart';

enum EventType {
  click,
  drag,
  zoom,
  markerClick,
  markerDrag,
  mapTypeChange,
  markerAdded,
  markerRemoved,
}

class MapEvent {
  final String id;
  final EventType type;
  final DateTime timestamp;
  final String description;
  final LatLng? position;
  final Map<String, dynamic>? data;

  MapEvent({
    required this.id,
    required this.type,
    required this.timestamp,
    required this.description,
    this.position,
    this.data,
  });

  String get icon {
    switch (type) {
      case EventType.click:
        return '👆';
      case EventType.drag:
        return '👋';
      case EventType.zoom:
        return '🔍';
      case EventType.markerClick:
        return '📍';
      case EventType.markerDrag:
        return '✋';
      case EventType.mapTypeChange:
        return '🗺️';
      case EventType.markerAdded:
        return '➕';
      case EventType.markerRemoved:
        return '➖';
    }
  }

  String get formattedTime {
    return '${timestamp.hour.toString().padLeft(2, '0')}:'
        '${timestamp.minute.toString().padLeft(2, '0')}:'
        '${timestamp.second.toString().padLeft(2, '0')}';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'timestamp': timestamp.toIso8601String(),
      'description': description,
      'position': position != null
          ? {'lat': position!.latitude, 'lng': position!.longitude}
          : null,
      'data': data,
    };
  }

  factory MapEvent.fromJson(Map<String, dynamic> json) {
    return MapEvent(
      id: json['id'],
      type: EventType.values.firstWhere((e) => e.name == json['type']),
      timestamp: DateTime.parse(json['timestamp']),
      description: json['description'],
      position: json['position'] != null
          ? LatLng(json['position']['lat'], json['position']['lng'])
          : null,
      data: json['data'],
    );
  }
}
