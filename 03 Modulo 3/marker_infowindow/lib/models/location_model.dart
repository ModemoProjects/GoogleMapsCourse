import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

enum LocationType {
  restaurant,
  park,
  museum,
  shopping,
}

class LocationModel {
  final String id;
  final String name;
  final LatLng position;
  final LocationType type;
  final String imageUrl;
  final String address;
  final String? phone;
  final String hours;
  final String? price;
  final String rating;
  final String description;

  const LocationModel({
    required this.id,
    required this.name,
    required this.position,
    required this.type,
    required this.imageUrl,
    required this.address,
    this.phone,
    required this.hours,
    this.price,
    required this.rating,
    required this.description,
  });

  String get emoji {
    switch (type) {
      case LocationType.restaurant:
        return '🍽️';
      case LocationType.park:
        return '🌳';
      case LocationType.museum:
        return '🏛️';
      case LocationType.shopping:
        return '🛍️';
    }
  }

  Color get markerColor {
    switch (type) {
      case LocationType.restaurant:
        return Colors.red;
      case LocationType.park:
        return Colors.green;
      case LocationType.museum:
        return Colors.blue;
      case LocationType.shopping:
        return Colors.orange;
    }
  }

  String get typeName {
    switch (type) {
      case LocationType.restaurant:
        return 'Restaurante';
      case LocationType.park:
        return 'Parque';
      case LocationType.museum:
        return 'Museo';
      case LocationType.shopping:
        return 'Centro Comercial';
    }
  }
}

// Datos de las ubicaciones en León, Guanajuato
final List<LocationModel> locations = [
  LocationModel(
    id: 'restaurant',
    name: 'Restaurante El Buen Sabor',
    position: LatLng(21.1230729, -101.6650775),
    type: LocationType.restaurant,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop&crop=center',
    address: 'Av. Principal 123, Centro, León, Gto.',
    phone: '+52 477 123 4567',
    hours: 'Lun-Dom: 8:00 AM - 10:00 PM',
    rating: '4.5 ⭐',
    description: 'Especialistas en comida mexicana tradicional con más de 20 años de experiencia.',
  ),
  LocationModel(
    id: 'park',
    name: 'Parque Principal de León',
    position: LatLng(21.1300, -101.6600),
    type: LocationType.park,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&crop=center',
    address: 'Centro Histórico, León, Gto.',
    hours: '24 horas',
    rating: '4.8 ⭐',
    description: 'Hermoso parque en el corazón de la ciudad con áreas verdes y fuentes.',
  ),
  LocationModel(
    id: 'museum',
    name: 'Museo de Arte Contemporáneo',
    position: LatLng(21.1100, -101.6700),
    type: LocationType.museum,
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center',
    address: 'Calle del Arte 456, León, Gto.',
    phone: '+52 477 987 6543',
    hours: 'Mar-Dom: 10:00 AM - 6:00 PM',
    price: 'Entrada: \$50 MXN',
    rating: '4.7 ⭐',
    description: 'Exposiciones de arte moderno y contemporáneo de artistas locales e internacionales.',
  ),
  LocationModel(
    id: 'shopping',
    name: 'Plaza del Sol',
    position: LatLng(21.1400, -101.6500),
    type: LocationType.shopping,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center',
    address: 'Blvd. López Mateos 789, León, Gto.',
    hours: 'Lun-Dom: 10:00 AM - 9:00 PM',
    rating: '4.6 ⭐',
    description: 'Centro comercial con más de 200 tiendas, restaurantes y entretenimiento.',
  ),
];
