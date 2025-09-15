# Demo de Autocompletado de Direcciones con Google Maps

Este proyecto demuestra la implementación de un sistema completo de autocompletado de direcciones usando Google Maps API, Places API y Geocoding API en Flutter.

## 🚀 Características

- **Autocompletado de direcciones** con debounce (300ms) y session tokens
- **Place Details** para obtener componentes de dirección estructurados
- **Reverse geocoding** al hacer tap en el mapa
- **Geocoding directo** para búsquedas por texto
- **Localización en español** (es-419)
- **Modo claro/oscuro** automático
- **Validación de direcciones** con indicadores visuales
- **Sesgo por ubicación** (León, Guanajuato) y restricción por país (México)
- **Interfaz responsive** con navegación por teclado
- **Manejo de errores** y rate limiting
- **Analítica básica** en consola

## 📋 Requisitos

- Flutter SDK 3.9.2 o superior
- API Key de Google Maps con las siguientes APIs habilitadas:
  - Places API
  - Geocoding API
  - Maps SDK for Android
  - Maps SDK for iOS

## ⚙️ Configuración

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Places API
   - Geocoding API
   - Maps SDK for Android
   - Maps SDK for iOS
4. Ve a "Credenciales" y crea una API Key
5. Configura las restricciones de seguridad:

#### Para Android:
- **Restricción de aplicación**: Android apps
- **Package name**: `com.example.autocomplete_map` (o el que uses)
- **SHA-1 certificate fingerprint**: Obtén con:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

#### Para iOS:
- **Restricción de aplicación**: iOS apps
- **Bundle ID**: `com.example.autocompleteMap` (o el que uses)

#### Para Web (opcional):
- **Restricción de aplicación**: HTTP referrers
- **Sitios web**: `localhost:3000` (para desarrollo)

### 2. Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   touch .env
   ```

2. Agrega tu API key al archivo `.env`:
   ```
   GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

3. **IMPORTANTE**: Nunca subas el archivo `.env` al control de versiones. Está incluido en `.gitignore`.

### 3. Instalar Dependencias

```bash
flutter pub get
```

### 4. Configurar Plataformas

#### Android
1. Agrega tu API key en `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data android:name="com.google.android.geo.API_KEY"
              android:value="tu_api_key_aqui"/>
   ```

#### iOS
1. Agrega tu API key en `ios/Runner/AppDelegate.swift`:
   ```swift
   GMSServices.provideAPIKey("tu_api_key_aqui")
   ```

## 🏃‍♂️ Ejecutar la Aplicación

```bash
flutter run
```

## 📱 Funcionalidades del Demo

### Flujo A: Autocompletado → Place Details
1. Escribe en el campo "Dirección"
2. Selecciona una sugerencia de la lista
3. Los campos del formulario se llenan automáticamente
4. El mapa se centra en la ubicación seleccionada

### Flujo B: Búsqueda Directa
1. Escribe una dirección completa
2. Presiona "Buscar"
3. Se realiza geocoding directo
4. Los campos se llenan con los resultados

### Flujo C: Tap en Mapa
1. Toca cualquier punto en el mapa
2. Se realiza reverse geocoding
3. Los campos se actualizan con la nueva ubicación

### Flujo D: Limpiar Todo
1. Presiona "Limpiar" o el botón de limpiar
2. Se resetea el formulario, token de sesión y estado del mapa

## 🔧 Configuración Avanzada

### Cambiar País de Restricción
En `lib/screens/address_demo_screen.dart`:
```dart
_placesService = PlacesService(
  apiKey: apiKey,
  language: 'es-419',
  region: 'MX', // Cambia por el código de país deseado
);
```

### Cambiar Idioma
En `lib/main.dart`:
```dart
locale: const Locale('es', 'MX'), // Cambia por el idioma deseado
```

### Ajustar Debounce
En `lib/widgets/address_autocomplete.dart`:
```dart
final Debounce _debounce = Debounce(const Duration(milliseconds: 300));
```

## 🐛 Solución de Problemas

### Error: "API Key no configurada"
- Verifica que el archivo `.env` existe y contiene la API key
- Asegúrate de que la API key es válida y tiene las APIs habilitadas

### Error: "This API project is not authorized"
- Verifica las restricciones de la API key
- Asegúrate de que el package name/bundle ID coinciden

### Error: "ZERO_RESULTS"
- La búsqueda no encontró resultados
- Intenta con términos más generales o verifica la ortografía

### Error: "OVER_QUERY_LIMIT"
- Has excedido el límite de consultas
- Verifica la facturación en Google Cloud Console

## 📊 Analítica

El demo incluye logging básico en consola:
- Tiempo de respuesta de las APIs
- Número de sugerencias encontradas
- Errores y fallbacks
- Uso de session tokens

## 🔒 Seguridad

- **Nunca** hardcodees la API key en el código
- Usa variables de entorno para almacenar la API key
- Configura restricciones de API key apropiadas
- Considera usar un proxy/backend para ocultar la API key en producción

## 📚 Dependencias Principales

- `google_maps_flutter`: Widget de mapa de Google
- `geocoding`: Geocoding nativo de Flutter
- `http`: Cliente HTTP para APIs de Google
- `flutter_dotenv`: Manejo de variables de entorno
- `permission_handler`: Manejo de permisos
- `debounce`: Debounce para autocompletado

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación de [Google Maps Platform](https://developers.google.com/maps/documentation)
2. Consulta la documentación de [Flutter](https://flutter.dev/docs)
3. Abre un issue en este repositorio