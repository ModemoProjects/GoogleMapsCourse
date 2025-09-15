import '../widgets/map_widget.dart';
import '../widgets/address_form.dart';
import 'package:flutter/material.dart';
import '../models/place_prediction.dart';
import '../services/places_service.dart';
import '../models/address_components.dart';
import '../widgets/address_autocomplete.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Pantalla principal del demo de autocompletado de direcciones
class AddressDemoScreen extends StatefulWidget {
  const AddressDemoScreen({super.key});

  @override
  State<AddressDemoScreen> createState() => _AddressDemoScreenState();
}

class _AddressDemoScreenState extends State<AddressDemoScreen> {
  late PlacesService _placesService;

  String _searchQuery = '';
  AddressComponents? _addressComponents;
  String? _sessionToken;
  bool _isLoading = false;
  bool _restrictToCountry = true;
  String? _errorMessage;

  // Coordenadas por defecto (León, Guanajuato)
  double _userLatitude = 21.1224;
  double _userLongitude = -101.6866;

  @override
  void initState() {
    super.initState();
    _initializeService();
  }

  void _initializeService() {
    final apiKey = dotenv.env['GOOGLE_MAPS_API_KEY'];
    if (apiKey == null || apiKey.isEmpty) {
      setState(() {
        _errorMessage =
            'API Key no configurada. Por favor, configura GOOGLE_MAPS_API_KEY en el archivo .env';
      });
      return;
    }

    _placesService = PlacesService(
      apiKey: apiKey,
      language: 'es-419',
      region: 'MX',
    );
  }

  void _onSearchQueryChanged(String query) {
    setState(() {
      _searchQuery = query;
      _errorMessage = null;
    });
  }

  void _onPlaceSelected(PlacePrediction prediction) {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    _getPlaceDetails(prediction);
  }

  Future<void> _getPlaceDetails(PlacePrediction prediction) async {
    try {
      final addressComponents = await _placesService.getPlaceDetails(
        placeId: prediction.placeId,
        sessionToken: _sessionToken,
      );

      if (mounted) {
        setState(() {
          _addressComponents = addressComponents;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error al obtener detalles: $e';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _searchDirectly() async {
    if (_searchQuery.trim().isEmpty) {
      setState(() {
        _errorMessage = 'Por favor, ingresa una dirección para buscar';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final addressComponents = await _placesService.geocodeAddress(
        address: _searchQuery,
        latitude: _userLatitude,
        longitude: _userLongitude,
        restrictToCountry: _restrictToCountry,
      );

      if (mounted) {
        setState(() {
          _addressComponents = addressComponents;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error en la búsqueda: $e';
          _isLoading = false;
        });
      }
    }
  }

  void _onLocationSelected(AddressComponents addressComponents) {
    // Si es un tap en mapa (identificado por 'TAP_ON_MAP'), hacer reverse geocoding
    if (addressComponents.formattedAddress == 'TAP_ON_MAP' &&
        addressComponents.latitude != null &&
        addressComponents.longitude != null) {
      _performReverseGeocoding(
        addressComponents.latitude!,
        addressComponents.longitude!,
      );
    } else {
      // Si ya tenemos una dirección completa, solo actualizar el estado
      setState(() {
        _addressComponents = addressComponents;
      });
    }
  }

  Future<void> _performReverseGeocoding(
    double latitude,
    double longitude,
  ) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final addressComponents = await _placesService.reverseGeocode(
        latitude: latitude,
        longitude: longitude,
      );

      if (mounted) {
        setState(() {
          _addressComponents = addressComponents;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error en reverse geocoding: $e';
          _isLoading = false;
        });
      }
    }
  }

  void _onAddressChanged(AddressComponents addressComponents) {
    setState(() {
      _addressComponents = addressComponents;
    });
  }

  void _clearAll() {
    setState(() {
      _searchQuery = '';
      _addressComponents = null;
      _sessionToken = null;
      _errorMessage = null;
    });
  }

  void _generateNewSessionToken() {
    setState(() {
      _sessionToken = DateTime.now().millisecondsSinceEpoch.toString();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Demo de Autocompletado de Direcciones'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _generateNewSessionToken,
            tooltip: 'Nueva sesión',
          ),
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: _clearAll,
            tooltip: 'Limpiar todo',
          ),
        ],
      ),
      body: _errorMessage != null && _errorMessage!.contains('API Key')
          ? _buildApiKeyError()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildSearchSection(),
                  const SizedBox(height: 16),
                  _buildSettingsSection(),
                  const SizedBox(height: 16),
                  if (_addressComponents != null) ...[
                    AddressForm(
                      addressComponents: _addressComponents,
                      onAddressChanged: _onAddressChanged,
                    ),
                    const SizedBox(height: 16),
                  ],
                  MapWidget(
                    addressComponents: _addressComponents,
                    onLocationSelected: _onLocationSelected,
                    initialLatitude: _userLatitude,
                    initialLongitude: _userLongitude,
                    isLoading: _isLoading,
                  ),
                  if (_errorMessage != null) ...[
                    const SizedBox(height: 16),
                    _buildErrorMessage(),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildApiKeyError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'API Key no configurada',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                // En un caso real, podrías abrir la configuración o mostrar instrucciones
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Consulta el README para configurar la API key',
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.help),
              label: const Text('Ver instrucciones'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Buscar Dirección',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            AddressAutocomplete(
              initialValue: _searchQuery,
              hintText: 'Escribe una dirección...',
              onTextChanged: _onSearchQueryChanged,
              onPlaceSelected: _onPlaceSelected,
              placesService: _placesService,
              latitude: _userLatitude,
              longitude: _userLongitude,
              restrictToCountry: _restrictToCountry,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _searchDirectly,
                    icon: _isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.search),
                    label: Text(_isLoading ? 'Buscando...' : 'Buscar'),
                  ),
                ),
                const SizedBox(width: 16),
                OutlinedButton.icon(
                  onPressed: _clearAll,
                  icon: const Icon(Icons.clear),
                  label: const Text('Limpiar'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Configuración',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Restringir a México'),
              subtitle: const Text('Solo mostrar resultados de México'),
              value: _restrictToCountry,
              onChanged: (value) {
                setState(() {
                  _restrictToCountry = value;
                });
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.info_outline),
              title: const Text('Información de la sesión'),
              subtitle: Text('Token: ${_sessionToken ?? 'No generado'}'),
              trailing: IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _generateNewSessionToken,
                tooltip: 'Generar nuevo token',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorMessage() {
    return Card(
      color: Colors.red.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.error, color: Colors.red.shade700),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _errorMessage!,
                style: TextStyle(color: Colors.red.shade700),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                setState(() {
                  _errorMessage = null;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
