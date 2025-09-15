/// Modelo para representar los componentes de una dirección
class AddressComponents {
  final String? streetNumber;
  final String? route;
  final String? neighborhood;
  final String? city;
  final String? state;
  final String? country;
  final String? postalCode;
  final String? formattedAddress;
  final double? latitude;
  final double? longitude;

  const AddressComponents({
    this.streetNumber,
    this.route,
    this.neighborhood,
    this.city,
    this.state,
    this.country,
    this.postalCode,
    this.formattedAddress,
    this.latitude,
    this.longitude,
  });

  /// Constructor desde Place Details API
  factory AddressComponents.fromPlaceDetails(Map<String, dynamic> data) {
    final components =
        data['result']['address_components'] as List<dynamic>? ?? [];
    final formattedAddress = data['result']['formatted_address'] as String?;
    final geometry = data['result']['geometry'] as Map<String, dynamic>?;
    final location = geometry?['location'] as Map<String, dynamic>?;

    double? latitude;
    double? longitude;
    if (location != null) {
      latitude = (location['lat'] as num?)?.toDouble();
      longitude = (location['lng'] as num?)?.toDouble();
    }

    String? streetNumber;
    String? route;
    String? neighborhood;
    String? city;
    String? state;
    String? country;
    String? postalCode;

    for (final component in components) {
      final types = List<String>.from(component['types'] ?? []);

      if (types.contains('street_number')) {
        streetNumber = component['long_name'] as String?;
      } else if (types.contains('route')) {
        route = component['long_name'] as String?;
      } else if (types.contains('sublocality') ||
          types.contains('sublocality_level_1')) {
        neighborhood = component['long_name'] as String?;
      } else if (types.contains('locality')) {
        city = component['long_name'] as String?;
      } else if (types.contains('administrative_area_level_1')) {
        state = component['long_name'] as String?;
      } else if (types.contains('country')) {
        country = component['long_name'] as String?;
      } else if (types.contains('postal_code')) {
        postalCode = component['long_name'] as String?;
      }
    }

    return AddressComponents(
      streetNumber: streetNumber,
      route: route,
      neighborhood: neighborhood,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
      formattedAddress: formattedAddress,
      latitude: latitude,
      longitude: longitude,
    );
  }

  /// Constructor desde Geocoding API
  factory AddressComponents.fromGeocoding(Map<String, dynamic> data) {
    final components = data['address_components'] as List<dynamic>? ?? [];
    final formattedAddress = data['formatted_address'] as String?;
    final geometry = data['geometry'] as Map<String, dynamic>?;
    final location = geometry?['location'] as Map<String, dynamic>?;

    double? latitude;
    double? longitude;
    if (location != null) {
      latitude = (location['lat'] as num?)?.toDouble();
      longitude = (location['lng'] as num?)?.toDouble();
    }

    String? streetNumber;
    String? route;
    String? neighborhood;
    String? city;
    String? state;
    String? country;
    String? postalCode;

    for (final component in components) {
      final types = List<String>.from(component['types'] ?? []);

      if (types.contains('street_number')) {
        streetNumber = component['long_name'] as String?;
      } else if (types.contains('route')) {
        route = component['long_name'] as String?;
      } else if (types.contains('sublocality') ||
          types.contains('sublocality_level_1')) {
        neighborhood = component['long_name'] as String?;
      } else if (types.contains('locality')) {
        city = component['long_name'] as String?;
      } else if (types.contains('administrative_area_level_1')) {
        state = component['long_name'] as String?;
      } else if (types.contains('country')) {
        country = component['long_name'] as String?;
      } else if (types.contains('postal_code')) {
        postalCode = component['long_name'] as String?;
      }
    }

    return AddressComponents(
      streetNumber: streetNumber,
      route: route,
      neighborhood: neighborhood,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
      formattedAddress: formattedAddress,
      latitude: latitude,
      longitude: longitude,
    );
  }

  /// Valida si la dirección tiene los componentes mínimos necesarios
  bool get isValid {
    return (streetNumber?.isNotEmpty == true || route?.isNotEmpty == true) &&
        city?.isNotEmpty == true &&
        state?.isNotEmpty == true &&
        country?.isNotEmpty == true;
  }

  /// Obtiene la dirección completa formateada
  String get fullAddress {
    final parts = <String>[];

    if (streetNumber?.isNotEmpty == true) parts.add(streetNumber!);
    if (route?.isNotEmpty == true) parts.add(route!);
    if (neighborhood?.isNotEmpty == true) parts.add(neighborhood!);
    if (city?.isNotEmpty == true) parts.add(city!);
    if (state?.isNotEmpty == true) parts.add(state!);
    if (postalCode?.isNotEmpty == true) parts.add(postalCode!);
    if (country?.isNotEmpty == true) parts.add(country!);

    return parts.join(', ');
  }

  AddressComponents copyWith({
    String? streetNumber,
    String? route,
    String? neighborhood,
    String? city,
    String? state,
    String? country,
    String? postalCode,
    String? formattedAddress,
    double? latitude,
    double? longitude,
  }) {
    return AddressComponents(
      streetNumber: streetNumber ?? this.streetNumber,
      route: route ?? this.route,
      neighborhood: neighborhood ?? this.neighborhood,
      city: city ?? this.city,
      state: state ?? this.state,
      country: country ?? this.country,
      postalCode: postalCode ?? this.postalCode,
      formattedAddress: formattedAddress ?? this.formattedAddress,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }

  @override
  String toString() {
    return 'AddressComponents(streetNumber: $streetNumber, route: $route, neighborhood: $neighborhood, city: $city, state: $state, country: $country, postalCode: $postalCode)';
  }
}
