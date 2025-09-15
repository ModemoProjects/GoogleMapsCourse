import 'package:flutter/material.dart';
import '../models/address_components.dart';

/// Formulario para mostrar y editar los componentes de una dirección
class AddressForm extends StatefulWidget {
  final AddressComponents? addressComponents;
  final ValueChanged<AddressComponents> onAddressChanged;
  final bool readOnly;

  const AddressForm({
    super.key,
    this.addressComponents,
    required this.onAddressChanged,
    this.readOnly = false,
  });

  @override
  State<AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<AddressForm> {
  late TextEditingController _streetNumberController;
  late TextEditingController _routeController;
  late TextEditingController _neighborhoodController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _countryController;
  late TextEditingController _postalCodeController;

  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }

  void _initializeControllers() {
    _streetNumberController = TextEditingController(
      text: widget.addressComponents?.streetNumber ?? '',
    );
    _routeController = TextEditingController(
      text: widget.addressComponents?.route ?? '',
    );
    _neighborhoodController = TextEditingController(
      text: widget.addressComponents?.neighborhood ?? '',
    );
    _cityController = TextEditingController(
      text: widget.addressComponents?.city ?? '',
    );
    _stateController = TextEditingController(
      text: widget.addressComponents?.state ?? '',
    );
    _countryController = TextEditingController(
      text: widget.addressComponents?.country ?? '',
    );
    _postalCodeController = TextEditingController(
      text: widget.addressComponents?.postalCode ?? '',
    );
  }

  @override
  void didUpdateWidget(AddressForm oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.addressComponents != oldWidget.addressComponents) {
      _updateControllers();
    }
  }

  void _updateControllers() {
    _streetNumberController.text = widget.addressComponents?.streetNumber ?? '';
    _routeController.text = widget.addressComponents?.route ?? '';
    _neighborhoodController.text = widget.addressComponents?.neighborhood ?? '';
    _cityController.text = widget.addressComponents?.city ?? '';
    _stateController.text = widget.addressComponents?.state ?? '';
    _countryController.text = widget.addressComponents?.country ?? '';
    _postalCodeController.text = widget.addressComponents?.postalCode ?? '';
  }

  void _notifyChange() {
    if (!widget.readOnly) {
      final addressComponents = AddressComponents(
        streetNumber: _streetNumberController.text.trim().isEmpty
            ? null
            : _streetNumberController.text.trim(),
        route: _routeController.text.trim().isEmpty
            ? null
            : _routeController.text.trim(),
        neighborhood: _neighborhoodController.text.trim().isEmpty
            ? null
            : _neighborhoodController.text.trim(),
        city: _cityController.text.trim().isEmpty
            ? null
            : _cityController.text.trim(),
        state: _stateController.text.trim().isEmpty
            ? null
            : _stateController.text.trim(),
        country: _countryController.text.trim().isEmpty
            ? null
            : _countryController.text.trim(),
        postalCode: _postalCodeController.text.trim().isEmpty
            ? null
            : _postalCodeController.text.trim(),
      );
      widget.onAddressChanged(addressComponents);
    }
  }

  @override
  void dispose() {
    _streetNumberController.dispose();
    _routeController.dispose();
    _neighborhoodController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _countryController.dispose();
    _postalCodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detalles de la Dirección',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 1,
                  child: TextFormField(
                    controller: _streetNumberController,
                    readOnly: widget.readOnly,
                    decoration: InputDecoration(
                      labelText: 'Número',
                      hintText: '123',
                      prefixIcon: const Icon(Icons.numbers),
                    ),
                    onChanged: (_) => _notifyChange(),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 3,
                  child: TextFormField(
                    controller: _routeController,
                    readOnly: widget.readOnly,
                    decoration: InputDecoration(
                      labelText: 'Calle',
                      hintText: 'Av. Reforma',
                      prefixIcon: const Icon(Icons.route),
                    ),
                    onChanged: (_) => _notifyChange(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _neighborhoodController,
              readOnly: widget.readOnly,
              decoration: InputDecoration(
                labelText: 'Colonia',
                hintText: 'Centro',
                prefixIcon: const Icon(Icons.location_city),
              ),
              onChanged: (_) => _notifyChange(),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _cityController,
                    readOnly: widget.readOnly,
                    decoration: InputDecoration(
                      labelText: 'Ciudad',
                      hintText: 'Ciudad de México',
                      prefixIcon: const Icon(Icons.location_city),
                    ),
                    onChanged: (_) => _notifyChange(),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _stateController,
                    readOnly: widget.readOnly,
                    decoration: InputDecoration(
                      labelText: 'Estado',
                      hintText: 'CDMX',
                      prefixIcon: const Icon(Icons.map),
                    ),
                    onChanged: (_) => _notifyChange(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _countryController,
                    readOnly: widget.readOnly,
                    decoration: InputDecoration(
                      labelText: 'País',
                      hintText: 'México',
                      prefixIcon: const Icon(Icons.public),
                    ),
                    onChanged: (_) => _notifyChange(),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _postalCodeController,
                    readOnly: widget.readOnly,
                    decoration: InputDecoration(
                      labelText: 'Código Postal',
                      hintText: '06000',
                      prefixIcon: const Icon(Icons.local_post_office),
                    ),
                    onChanged: (_) => _notifyChange(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (widget.addressComponents?.formattedAddress != null) ...[
              const Divider(),
              Text(
                'Dirección Completa:',
                style: Theme.of(
                  context,
                ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  widget.addressComponents!.formattedAddress!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ],
            if (widget.addressComponents != null) ...[
              const SizedBox(height: 16),
              _buildValidationStatus(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildValidationStatus() {
    final isValid = widget.addressComponents!.isValid;
    final missingFields = <String>[];

    if (widget.addressComponents!.streetNumber?.isEmpty == true &&
        widget.addressComponents!.route?.isEmpty == true) {
      missingFields.add('Calle o número');
    }
    if (widget.addressComponents!.city?.isEmpty == true) {
      missingFields.add('Ciudad');
    }
    if (widget.addressComponents!.state?.isEmpty == true) {
      missingFields.add('Estado');
    }
    if (widget.addressComponents!.country?.isEmpty == true) {
      missingFields.add('País');
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isValid
            ? Colors.green.withOpacity(0.1)
            : Colors.orange.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isValid ? Colors.green : Colors.orange,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isValid ? Icons.check_circle : Icons.warning,
            color: isValid ? Colors.green : Colors.orange,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isValid
                  ? 'Dirección completa y válida'
                  : 'Faltan campos: ${missingFields.join(', ')}',
              style: TextStyle(
                color: isValid ? Colors.green[700] : Colors.orange[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
