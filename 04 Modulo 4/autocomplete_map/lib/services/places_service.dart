import 'dart:math';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/place_prediction.dart';
import '../models/address_components.dart';

/// Servicio para interactuar con las APIs de Google Places y Geocoding
class PlacesService {
  static const String _baseUrl = 'https://maps.googleapis.com/maps/api';
  static const String _placesEndpoint = '$_baseUrl/place/autocomplete/json';
  static const String _placeDetailsEndpoint = '$_baseUrl/place/details/json';
  static const String _geocodingEndpoint = '$_baseUrl/geocode/json';

  final String apiKey;
  final String language;
  final String region;

  PlacesService({
    required this.apiKey,
    this.language = 'es-419',
    this.region = 'MX',
  });

  /// Genera un session token único para agrupar búsquedas relacionadas
  String _generateSessionToken() {
    final random = Random();
    final bytes = List<int>.generate(16, (i) => random.nextInt(256));
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  /// Obtiene predicciones de autocompletado
  Future<List<PlacePrediction>> getPlacePredictions({
    required String input,
    String? sessionToken,
    double? latitude,
    double? longitude,
    int radius = 50000, // 50km por defecto
    bool restrictToCountry = true,
  }) async {
    try {
      final token = sessionToken ?? _generateSessionToken();

      final queryParams = <String, String>{
        'input': input,
        'key': apiKey,
        'language': language,
        'sessiontoken': token,
      };

      // Agregar sesgo por ubicación si se proporciona
      if (latitude != null && longitude != null) {
        queryParams['location'] = '$latitude,$longitude';
        queryParams['radius'] = radius.toString();
      }

      // Restringir por país si está habilitado
      if (restrictToCountry) {
        queryParams['components'] = 'country:$region';
      }

      final uri = Uri.parse(
        _placesEndpoint,
      ).replace(queryParameters: queryParams);

      print('🔍 Buscando predicciones para: $input');
      final startTime = DateTime.now();

      final response = await http.get(uri);
      final endTime = DateTime.now();
      final duration = endTime.difference(startTime).inMilliseconds;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['status'] == 'OK') {
          final predictions = (data['predictions'] as List)
              .map((json) => PlacePrediction.fromJson(json))
              .toList();

          print(
            '✅ Predicciones encontradas: ${predictions.length} en ${duration}ms',
          );
          return predictions;
        } else {
          print(
            '❌ Error en Places API: ${data['status']} - ${data['error_message']}',
          );
          throw Exception('Error en Places API: ${data['status']}');
        }
      } else {
        print('❌ Error HTTP: ${response.statusCode}');
        throw Exception('Error HTTP: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error al obtener predicciones: $e');
      rethrow;
    }
  }

  /// Obtiene detalles de un lugar específico
  Future<AddressComponents> getPlaceDetails({
    required String placeId,
    String? sessionToken,
  }) async {
    try {
      final queryParams = <String, String>{
        'place_id': placeId,
        'key': apiKey,
        'language': language,
        'fields': 'place_id,formatted_address,address_components,geometry',
      };

      if (sessionToken != null) {
        queryParams['sessiontoken'] = sessionToken;
      }

      final uri = Uri.parse(
        _placeDetailsEndpoint,
      ).replace(queryParameters: queryParams);

      print('📍 Obteniendo detalles del lugar: $placeId');
      final startTime = DateTime.now();

      final response = await http.get(uri);
      final endTime = DateTime.now();
      final duration = endTime.difference(startTime).inMilliseconds;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['status'] == 'OK') {
          final addressComponents = AddressComponents.fromPlaceDetails(data);
          print('✅ Detalles obtenidos en ${duration}ms');
          return addressComponents;
        } else {
          print(
            '❌ Error en Place Details API: ${data['status']} - ${data['error_message']}',
          );
          throw Exception('Error en Place Details API: ${data['status']}');
        }
      } else {
        print('❌ Error HTTP: ${response.statusCode}');
        throw Exception('Error HTTP: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error al obtener detalles del lugar: $e');
      rethrow;
    }
  }

  /// Realiza geocoding directo (búsqueda por texto)
  Future<AddressComponents> geocodeAddress({
    required String address,
    double? latitude,
    double? longitude,
    bool restrictToCountry = true,
  }) async {
    try {
      final queryParams = <String, String>{
        'address': address,
        'key': apiKey,
        'language': language,
      };

      // Agregar sesgo por ubicación si se proporciona
      if (latitude != null && longitude != null) {
        queryParams['location'] = '$latitude,$longitude';
        queryParams['radius'] = '50000';
      }

      // Restringir por país si está habilitado
      if (restrictToCountry) {
        queryParams['components'] = 'country:$region';
      }

      final uri = Uri.parse(
        _geocodingEndpoint,
      ).replace(queryParameters: queryParams);

      print('🌍 Geocodificando dirección: $address');
      final startTime = DateTime.now();

      final response = await http.get(uri);
      final endTime = DateTime.now();
      final duration = endTime.difference(startTime).inMilliseconds;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['status'] == 'OK') {
          final results = data['results'] as List;
          if (results.isNotEmpty) {
            final addressComponents = AddressComponents.fromGeocoding(
              results.first,
            );
            print('✅ Geocodificación exitosa en ${duration}ms');
            return addressComponents;
          } else {
            throw Exception('No se encontraron resultados para la dirección');
          }
        } else {
          print(
            '❌ Error en Geocoding API: ${data['status']} - ${data['error_message']}',
          );
          throw Exception('Error en Geocoding API: ${data['status']}');
        }
      } else {
        print('❌ Error HTTP: ${response.statusCode}');
        throw Exception('Error HTTP: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error al geocodificar dirección: $e');
      rethrow;
    }
  }

  /// Realiza reverse geocoding (coordenadas a dirección)
  Future<AddressComponents> reverseGeocode({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final queryParams = <String, String>{
        'latlng': '$latitude,$longitude',
        'key': apiKey,
        'language': language,
      };

      final uri = Uri.parse(
        _geocodingEndpoint,
      ).replace(queryParameters: queryParams);

      print('🔄 Reverse geocoding para: $latitude, $longitude');
      final startTime = DateTime.now();

      final response = await http.get(uri);
      final endTime = DateTime.now();
      final duration = endTime.difference(startTime).inMilliseconds;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['status'] == 'OK') {
          final results = data['results'] as List;
          if (results.isNotEmpty) {
            final addressComponents = AddressComponents.fromGeocoding(
              results.first,
            );
            print('✅ Reverse geocoding exitoso en ${duration}ms');
            return addressComponents;
          } else {
            throw Exception(
              'No se encontraron resultados para las coordenadas',
            );
          }
        } else {
          print(
            '❌ Error en Reverse Geocoding API: ${data['status']} - ${data['error_message']}',
          );
          throw Exception('Error en Reverse Geocoding API: ${data['status']}');
        }
      } else {
        print('❌ Error HTTP: ${response.statusCode}');
        throw Exception('Error HTTP: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error al hacer reverse geocoding: $e');
      rethrow;
    }
  }
}
