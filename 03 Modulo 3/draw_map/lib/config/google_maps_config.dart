class GoogleMapsConfig {
  // IMPORTANTE: Reemplaza esta clave con tu propia API key de Google Maps
  // Obtén tu API key en: https://console.cloud.google.com/google/maps-apis
  static const String apiKey = 'AIzaSyALQc7iuBQ1xc39pSP8sci_ynfh1WAYREE';

  // Configuración por defecto del mapa
  static const double defaultZoom = 10.0;
  static const double minZoom = 3.0;
  static const double maxZoom = 20.0;

  // Posición inicial (León, Guanajuato, México)
  static const double initialLatitude = 21.1224;
  static const double initialLongitude = -101.6866;
}
