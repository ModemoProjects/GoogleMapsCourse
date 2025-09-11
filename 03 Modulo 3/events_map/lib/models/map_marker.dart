import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapMarker {
  final String id;
  final LatLng position;
  final String title;
  final String snippet;
  final DateTime createdAt;
  final bool isDraggable;

  MapMarker({
    required this.id,
    required this.position,
    required this.title,
    required this.snippet,
    required this.createdAt,
    this.isDraggable = true,
  });

  MapMarker copyWith({
    String? id,
    LatLng? position,
    String? title,
    String? snippet,
    DateTime? createdAt,
    bool? isDraggable,
  }) {
    return MapMarker(
      id: id ?? this.id,
      position: position ?? this.position,
      title: title ?? this.title,
      snippet: snippet ?? this.snippet,
      createdAt: createdAt ?? this.createdAt,
      isDraggable: isDraggable ?? this.isDraggable,
    );
  }

  String get coordinatesText {
    return '${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}';
  }

  String get formattedTime {
    return '${createdAt.hour.toString().padLeft(2, '0')}:'
        '${createdAt.minute.toString().padLeft(2, '0')}:'
        '${createdAt.second.toString().padLeft(2, '0')}';
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'position': {'lat': position.latitude, 'lng': position.longitude},
      'title': title,
      'snippet': snippet,
      'createdAt': createdAt.toIso8601String(),
      'isDraggable': isDraggable,
    };
  }

  factory MapMarker.fromJson(Map<String, dynamic> json) {
    return MapMarker(
      id: json['id'],
      position: LatLng(json['position']['lat'], json['position']['lng']),
      title: json['title'],
      snippet: json['snippet'],
      createdAt: DateTime.parse(json['createdAt']),
      isDraggable: json['isDraggable'] ?? true,
    );
  }
}
