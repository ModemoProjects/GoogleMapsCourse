import 'screens/map_screen.dart';
import 'services/map_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

/// Punto de entrada principal de la aplicación
/// Configura el provider de estado y la interfaz de usuario
void main() {
  runApp(const MyApp());
}

/// Widget raíz de la aplicación que configura:
/// - Provider para manejo de estado global
/// - Tema de la aplicación
/// - Pantalla principal (MapScreen)
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      // Proporciona el servicio de mapa a toda la aplicación
      create: (context) => MapService(),
      child: MaterialApp(
        title: 'Mapa Interactivo',
        debugShowCheckedModeBanner: false, // Oculta el banner de debug
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          fontFamily: 'Roboto', // Fuente principal de la aplicación
        ),
        home: const MapScreen(), // Pantalla principal
      ),
    );
  }
}
