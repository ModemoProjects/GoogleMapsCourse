# Configuración del Demo de Autocompletado de Direcciones

## 🔑 Configuración de API Key

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Places API**
   - **Geocoding API**
   - **Maps SDK for Android**
   - **Maps SDK for iOS**

### 2. Crear API Key

1. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
2. Copia la API key generada

### 3. Configurar Restricciones de Seguridad

#### Para Android:
- **Tipo de restricción**: Aplicaciones Android
- **Package name**: `com.example.autocomplete_map`
- **SHA-1 fingerprint**: Obtén con:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

#### Para iOS:
- **Tipo de restricción**: Aplicaciones iOS
- **Bundle ID**: `com.example.autocompleteMap`

### 4. Configurar en el Proyecto

#### Archivo .env
Crea un archivo `.env` en la raíz del proyecto:
```bash
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

#### Android (android/app/src/main/AndroidManifest.xml)
Reemplaza `TU_API_KEY_AQUI` con tu API key real:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="tu_api_key_aqui" />
```

#### iOS (ios/Runner/AppDelegate.swift)
Reemplaza `TU_API_KEY_AQUI` con tu API key real:
```swift
GMSServices.provideAPIKey("tu_api_key_aqui")
```

## 🚀 Ejecutar la Aplicación

```bash
flutter pub get
flutter run
```

## ⚠️ Notas Importantes

- **NUNCA** subas el archivo `.env` al control de versiones
- **SIEMPRE** configura restricciones de API key para producción
- **VERIFICA** que todas las APIs necesarias estén habilitadas
- **PRUEBA** en dispositivos reales para verificar la configuración

## 🐛 Solución de Problemas

### Error: "API Key no configurada"
- Verifica que el archivo `.env` existe y contiene la API key
- Asegúrate de que la API key es válida

### Error: "This API project is not authorized"
- Verifica las restricciones de la API key
- Asegúrate de que el package name/bundle ID coinciden

### Error: "ZERO_RESULTS"
- La búsqueda no encontró resultados
- Intenta con términos más generales

### Error: "OVER_QUERY_LIMIT"
- Has excedido el límite de consultas
- Verifica la facturación en Google Cloud Console
