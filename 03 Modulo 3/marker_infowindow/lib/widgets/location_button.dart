import '../utils/constants.dart';
import 'package:flutter/material.dart';
import '../models/location_model.dart';

class LocationButton extends StatefulWidget {
  final LocationModel location;
  final bool isActive;
  final VoidCallback onTap;

  const LocationButton({
    super.key,
    required this.location,
    required this.isActive,
    required this.onTap,
  });

  @override
  State<LocationButton> createState() => _LocationButtonState();
}

class _LocationButtonState extends State<LocationButton> {
  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4.0),
        decoration: BoxDecoration(
          gradient: widget.isActive
              ? AppConstants.sidebarGradient
              : AppConstants.glassmorphismGradient,
          borderRadius: BorderRadius.circular(AppConstants.borderRadius),
          border: Border.all(
            color: widget.isActive
                ? Colors.white.withOpacity(0.3)
                : Colors.white.withOpacity(0.1),
            width: 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8.0,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.onTap,
            borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            child: Container(
              height: AppConstants.buttonHeight,
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              child: Row(
                children: [
                  // Emoji estático
                  Container(
                    width: 40.0,
                    height: 40.0,
                    decoration: BoxDecoration(
                      color: widget.location.markerColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20.0),
                      border: Border.all(
                        color: widget.location.markerColor,
                        width: 2.0,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        widget.location.emoji,
                        style: const TextStyle(fontSize: 20.0),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  // Información de la ubicación
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          widget.location.name,
                          style: TextStyle(
                            fontSize: 14.0,
                            fontWeight: FontWeight.bold,
                            color: widget.isActive
                                ? Colors.white
                                : AppConstants.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2.0),
                        Text(
                          widget.location.typeName,
                          style: TextStyle(
                            fontSize: 12.0,
                            color: widget.isActive
                                ? Colors.white.withOpacity(0.8)
                                : AppConstants.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Indicador de estado activo
                  if (widget.isActive)
                    Container(
                      width: 8.0,
                      height: 8.0,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
