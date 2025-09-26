# Slide 4: Estilos Base - Claro/Oscuro

## Descripción
Esta carpeta contiene ejemplos de cómo implementar estilos base para modo claro, oscuro y alto contraste.

## Archivos
- `index.html` - Página web con toggle de tema
- `script.js` - Lógica JavaScript para alternar entre temas
- `flutter_example.dart` - Ejemplo equivalente en Flutter

## Características
- **Modo Claro**: Colores claros y texto oscuro para mejor legibilidad diurna
- **Modo Oscuro**: Colores oscuros y texto claro para mejor experiencia nocturna
- **Alto Contraste**: Colores contrastantes para mejorar accesibilidad

## Conceptos Clave
- El modo oscuro mejora la experiencia en condiciones de poca luz
- El alto contraste se logra aumentando la diferencia entre colores de vías y POIs
- En Flutter, se puede integrar con `Theme.of(context).brightness` para detección automática

## Uso
1. **JavaScript**: Reemplaza `TU_API_KEY` con tu clave de API
2. **Flutter**: Asegúrate de tener `google_maps_flutter` en tu `pubspec.yaml`
3. Usa el toggle para alternar entre modos claro y oscuro
