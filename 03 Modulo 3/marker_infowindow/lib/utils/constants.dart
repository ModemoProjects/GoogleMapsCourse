import 'package:flutter/material.dart';

class AppConstants {
  // Colores del tema
  static const Color primaryColor = Color(0xFF667eea);
  static const Color secondaryColor = Color(0xFF764ba2);
  static const Color glassmorphismColor = Color(0x40FFFFFF);
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF2D3748);
  static const Color textSecondary = Color(0xFF718096);

  // Gradientes
  static const LinearGradient sidebarGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryColor, secondaryColor],
  );

  static const LinearGradient glassmorphismGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0x40FFFFFF), Color(0x20FFFFFF)],
  );

  // Configuración del mapa
  static const double defaultZoom = 13.0;
  static const double markerZoom = 16.0;

  // Animaciones
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration bounceDuration = Duration(milliseconds: 600);
  static const Duration rotationDuration = Duration(milliseconds: 1000);

  // Tamaños
  static const double sidebarWidth = 300.0;
  static const double buttonHeight = 60.0;
  static const double borderRadius = 12.0;
  static const double elevation = 8.0;

  // API Key de Google Maps (debes reemplazar con tu propia API key)
  static const String googleMapsApiKey = '<Dummy-API-Key>';
}
