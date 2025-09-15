import 'dart:async';
import 'package:flutter/material.dart';
import '../models/place_prediction.dart';
import '../services/places_service.dart';

/// Widget de autocompletado para direcciones con overlay de sugerencias
class AddressAutocomplete extends StatefulWidget {
  final String? initialValue;
  final String hintText;
  final ValueChanged<PlacePrediction> onPlaceSelected;
  final ValueChanged<String> onTextChanged;
  final PlacesService placesService;
  final double? latitude;
  final double? longitude;
  final bool restrictToCountry;
  final bool enabled;

  const AddressAutocomplete({
    super.key,
    this.initialValue,
    this.hintText = 'Buscar dirección...',
    required this.onPlaceSelected,
    required this.onTextChanged,
    required this.placesService,
    this.latitude,
    this.longitude,
    this.restrictToCountry = true,
    this.enabled = true,
  });

  @override
  State<AddressAutocomplete> createState() => _AddressAutocompleteState();
}

class _AddressAutocompleteState extends State<AddressAutocomplete> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final LayerLink _layerLink = LayerLink();
  Timer? _debounceTimer;

  List<PlacePrediction> _predictions = [];
  bool _isLoading = false;
  bool _showOverlay = false;
  String? _sessionToken;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialValue != null) {
      _controller.text = widget.initialValue!;
    }

    _focusNode.addListener(_onFocusChanged);
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _focusNode.removeListener(_onFocusChanged);
    _controller.removeListener(_onTextChanged);
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _onFocusChanged() {
    if (_focusNode.hasFocus) {
      // Generar nuevo session token al enfocar
      _sessionToken = _generateSessionToken();
      if (_controller.text.isNotEmpty) {
        _searchPredictions(_controller.text);
      }
    } else {
      // Ocultar overlay al perder el foco
      Future.delayed(const Duration(milliseconds: 200), () {
        if (mounted) {
          setState(() {
            _showOverlay = false;
          });
        }
      });
    }
  }

  void _onTextChanged() {
    final text = _controller.text;
    widget.onTextChanged(text);

    if (text.isEmpty) {
      setState(() {
        _predictions.clear();
        _showOverlay = false;
        _errorMessage = null;
      });
      return;
    }

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _searchPredictions(text);
    });
  }

  String _generateSessionToken() {
    final random = DateTime.now().millisecondsSinceEpoch;
    return random.toString();
  }

  Future<void> _searchPredictions(String query) async {
    if (query.length < 2) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final predictions = await widget.placesService.getPlacePredictions(
        input: query,
        sessionToken: _sessionToken,
        latitude: widget.latitude,
        longitude: widget.longitude,
        restrictToCountry: widget.restrictToCountry,
      );

      if (mounted) {
        setState(() {
          _predictions = predictions;
          _showOverlay = predictions.isNotEmpty && _focusNode.hasFocus;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _predictions.clear();
          _showOverlay = false;
          _isLoading = false;
        });
      }
    }
  }

  void _selectPrediction(PlacePrediction prediction) {
    _controller.text = prediction.description;
    _focusNode.unfocus();

    setState(() {
      _showOverlay = false;
      _predictions.clear();
    });

    widget.onPlaceSelected(prediction);
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _controller,
            focusNode: _focusNode,
            enabled: widget.enabled,
            decoration: InputDecoration(
              hintText: widget.hintText,
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: Padding(
                        padding: EdgeInsets.all(12.0),
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : _controller.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _controller.clear();
                        setState(() {
                          _predictions.clear();
                          _showOverlay = false;
                          _errorMessage = null;
                        });
                      },
                    )
                  : null,
              border: const OutlineInputBorder(),
              errorText: _errorMessage,
            ),
          ),
          if (_showOverlay && _predictions.isNotEmpty)
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: const Offset(0, 60),
              child: Material(
                elevation: 8,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  constraints: const BoxConstraints(maxHeight: 300),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _predictions.length,
                    itemBuilder: (context, index) {
                      final prediction = _predictions[index];
                      return ListTile(
                        leading: const Icon(Icons.location_on, size: 20),
                        title: Text(
                          prediction.mainText ?? prediction.description,
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                        subtitle: prediction.secondaryText != null
                            ? Text(prediction.secondaryText!)
                            : null,
                        onTap: () => _selectPrediction(prediction),
                        dense: true,
                      );
                    },
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
