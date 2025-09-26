# Slide 6: Capas y Controles Visuales

## Descripción
Esta carpeta contiene ejemplos de cómo activar y desactivar capas y controles visuales en Google Maps.

## Archivos
- `index.html` - Página web con controles para capas y configuraciones
- `script.js` - Lógica JavaScript para gestionar capas y controles
- `flutter_example.dart` - Ejemplo equivalente en Flutter

## Capas Disponibles

### Capas de Información
- **Tráfico**: Muestra el estado del tráfico en tiempo real
- **Transporte Público**: Muestra estaciones y rutas de transporte público
- **Ciclovías**: Muestra rutas para bicicletas

### Controles del Mapa
- **Selector de Tipo de Mapa**: Cambiar entre normal, satélite, terreno, híbrido
- **Control de Pantalla Completa**: Expandir el mapa a pantalla completa
- **Controles de Zoom**: Botones + y - para zoom
- **Control de Street View**: Acceso a Street View
- **Escala del Mapa**: Mostrar escala de distancia
- **Mi Ubicación**: Mostrar y centrar en la ubicación del usuario

## Configuraciones Adicionales
- **Gestión de Gestos Cooperativa**: Requiere scroll + zoom para interactuar
- **Habilitar/Deshabilitar Controles**: Control granular de la interfaz

## Conceptos Clave
- Las capas de tráfico y transporte tienen costo adicional en Google Maps
- En Flutter, algunas capas se controlan a nivel de widget, no de controller
- Considera el ruido visual al activar múltiples capas simultáneamente

## Limitaciones en Flutter
- Las capas de tráfico y transporte público no están disponibles directamente
- Requieren implementaciones adicionales o plugins específicos
- Los controles se configuran principalmente a nivel de widget

## Uso
1. **JavaScript**: Reemplaza `TU_API_KEY` con tu clave de API
2. **Flutter**: Asegúrate de tener `google_maps_flutter` en tu `pubspec.yaml`
3. Usa los controles para activar/desactivar diferentes capas y configuraciones
