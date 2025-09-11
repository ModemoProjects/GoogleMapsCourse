# Mapa de Dibujo Interactivo

Una aplicación Flutter que permite dibujar y medir elementos en Google Maps de forma interactiva.

## Características

- **Dibujo de elementos**: Polylines, polígonos y círculos
- **Mediciones automáticas**: Distancias, áreas y perímetros
- **Controles de visibilidad**: Mostrar/ocultar diferentes tipos de elementos
- **Modo edición**: Arrastrar y modificar elementos existentes
- **Gestión de elementos**: Lista de elementos con opciones de visibilidad y eliminación
- **Limpieza**: Botón para limpiar todos los elementos del mapa

## Configuración

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Maps SDK para Android y iOS
4. Crea credenciales (API Key)
5. Configura las restricciones de la API key para mayor seguridad

### 2. Configurar la API Key

Reemplaza `TU_API_KEY_AQUI` en los siguientes archivos con tu API key real:

- `lib/config/google_maps_config.dart`
- `android/app/src/main/AndroidManifest.xml`
- `ios/Runner/AppDelegate.swift`

### 3. Instalar dependencias

```bash
flutter pub get
```

### 4. Ejecutar la aplicación

```bash
flutter run
```

## Uso

### Dibujo de elementos

1. **Líneas (Polylines)**:
   - Selecciona "Línea" en el modo de dibujo
   - Toca dos puntos en el mapa para crear una línea
   - La distancia se calcula automáticamente

2. **Polígonos**:
   - Selecciona "Polígono" en el modo de dibujo
   - Toca múltiples puntos en el mapa
   - Mantén presionado para completar el polígono
   - Se calculan automáticamente el área y perímetro

3. **Círculos**:
   - Selecciona "Círculo" en el modo de dibujo
   - Toca el centro del círculo
   - Toca otro punto para definir el radio
   - Se calculan automáticamente el área y perímetro

### Controles de visibilidad

- Usa los checkboxes para mostrar/ocultar diferentes tipos de elementos
- Las mediciones se pueden mostrar/ocultar independientemente

### Gestión de elementos

- La lista lateral muestra todos los elementos creados
- Cada elemento muestra su medición correspondiente
- Usa los botones de visibilidad y eliminación para gestionar elementos individuales
- El botón "Limpiar Todo" elimina todos los elementos del mapa

## Estructura del proyecto

```
lib/
├── main.dart                 # Pantalla principal con Google Maps
├── models/
│   └── drawing_element.dart  # Modelo de datos para elementos de dibujo
├── utils/
│   └── measurement_utils.dart # Utilidades para cálculos de medición
└── config/
    └── google_maps_config.dart # Configuración de Google Maps
```

## Dependencias

- `google_maps_flutter`: Plugin de Google Maps para Flutter
- `geolocator`: Para cálculos de distancia y área
- `vector_math`: Para cálculos geométricos

## Notas importantes

- Asegúrate de configurar correctamente la API key de Google Maps
- La aplicación requiere permisos de ubicación para funcionar correctamente
- Los cálculos de área son aproximaciones y pueden variar según la proyección utilizada
