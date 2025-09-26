# Slide 3: Conceptos de Estilo

## Descripción
Esta carpeta contiene ejemplos de cómo aplicar estilos JSON personalizados a mapas de Google Maps.

## Archivos
- `index.html` - Página web con ejemplo de JavaScript
- `script.js` - Lógica JavaScript para aplicar estilos
- `flutter_example.dart` - Ejemplo equivalente en Flutter

## Conceptos Clave
- Los estilos se definen como arrays JSON con reglas de `featureType`, `elementType` y `stylers`
- En Flutter, el estilo se pasa como string JSON al método `setMapStyle()`
- Los estilos permiten personalizar colores, visibilidad y apariencia de elementos del mapa

## Uso
1. **JavaScript**: Reemplaza `TU_API_KEY` con tu clave de API de Google Maps
2. **Flutter**: Asegúrate de tener `google_maps_flutter` en tu `pubspec.yaml`
