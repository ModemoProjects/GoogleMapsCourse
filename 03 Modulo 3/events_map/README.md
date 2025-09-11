# Eventos en Google Maps - Flutter

Una aplicación Flutter completa que replica un demo de eventos en Google Maps con panel de controles deslizable y gestión de marcadores.

## 🚀 Características

### Estructura de la App
- **Pantalla principal** con mapa de Google Maps centrado
- **Panel de controles deslizable** desde abajo con información y botones
- **Panel de eventos flotante** en la esquina superior derecha
- **Diseño responsive** que funcione en móviles y tablets

### Funcionalidades del Mapa
- Mapa interactivo con Google Maps Flutter
- Centro inicial: León, Guanajuato (21.1230729, -101.6650775)
- Zoom inicial: 11
- Tipos de mapa: Roadmap, Satélite, Híbrido, Terreno
- Estilos personalizados del mapa

### Panel de Controles
- **Información del mapa:**
  - Coordenadas del centro actual
  - Nivel de zoom actual
  - Último punto tocado
- **Botones de control:**
  - Toggle para activar/desactivar eventos de toque
  - Toggle para activar/desactivar eventos de arrastre
  - Botón para agregar marcador en el centro
  - Botón para limpiar todos los marcadores
- **Selector de tipo de mapa** con dropdown
- **Estadísticas en tiempo real:**
  - Contador de toques realizados
  - Número de marcadores
  - Contador de eventos de zoom

### Gestión de Marcadores
- Agregar marcadores al tocar el mapa
- Marcadores arrastrables con animaciones
- InfoWindow personalizada con:
  - Título del marcador
  - Coordenadas exactas
  - Botón para eliminar marcador
- Animación de caída al agregar marcadores
- Eliminación individual de marcadores

### Panel de Eventos
- Log en tiempo real de todos los eventos
- Tipos de eventos a mostrar:
  - click - Toque en el mapa
  - drag - Arrastre del mapa
  - zoom - Cambio de zoom
  - marker_click - Toque en marcador
  - marker_drag - Arrastre de marcador
  - maptype_change - Cambio de tipo de mapa
- Timestamps para cada evento
- Iconos representativos para cada tipo
- Scroll automático al agregar nuevos eventos
- Botón para limpiar el log
- Límite de 50 eventos máximo

### Diseño Visual
- Tema moderno con gradientes y sombras
- Colores: Azul (#667eea) y púrpura (#764ba2)
- Animaciones suaves para transiciones
- Cards con bordes redondeados y sombras
- Botones con efectos hover y gradientes
- Panel deslizable con animaciones
- Responsive design para diferentes tamaños de pantalla

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd events_map
   ```

2. **Instalar dependencias:**
   ```bash
   flutter pub get
   ```

3. **Configurar Google Maps API Key:**
   - Obtén una API key de Google Maps Platform
   - Reemplaza la API key en `android/app/src/main/AndroidManifest.xml`:
     ```xml
     <meta-data android:name="com.google.android.geo.API_KEY" 
                android:value="TU_API_KEY_AQUI" />
     ```

4. **Ejecutar la aplicación:**
   ```bash
   flutter run
   ```

## 📱 Uso

### Interacciones del Mapa
- **Toque en mapa** → Agregar marcador + mostrar coordenadas
- **Arrastre de mapa** → Actualizar centro + log de evento
- **Zoom** → Actualizar nivel + contador
- **Toque en marcador** → Mostrar InfoWindow
- **Arrastre de marcador** → Actualizar posición + log
- **Cambio de tipo de mapa** → Actualizar visualización

### Panel de Controles
- Desliza hacia arriba desde abajo para abrir el panel
- Usa los toggles para activar/desactivar eventos
- Cambia el tipo de mapa con el dropdown
- Agrega marcadores en el centro o limpia todos
- Ve estadísticas en tiempo real

### Panel de Eventos
- Toca el ícono en la esquina superior derecha
- Ve todos los eventos en tiempo real
- Usa el botón de limpiar para borrar el log
- Los eventos se limitan a 50 para optimizar performance

## 🏗️ Arquitectura

### Estructura del Proyecto
```
lib/
├── models/
│   ├── map_config.dart      # Configuración del mapa
│   ├── map_event.dart       # Modelo de eventos
│   └── map_marker.dart      # Modelo de marcadores
├── providers/
│   └── map_provider.dart    # Gestión de estado
├── screens/
│   └── map_screen.dart      # Pantalla principal
├── widgets/
│   ├── control_panel.dart   # Panel de controles
│   ├── custom_info_window.dart # InfoWindow personalizada
│   └── events_panel.dart    # Panel de eventos
└── main.dart               # Punto de entrada
```

### Tecnologías Utilizadas
- **Flutter** - Framework de UI
- **Google Maps Flutter** - Integración con Google Maps
- **Provider** - Gestión de estado
- **SharedPreferences** - Persistencia local
- **Vibration** - Feedback háptico
- **Intl** - Formateo de fechas

## 🎨 Personalización

### Colores
Los colores principales se pueden cambiar en los widgets:
- Azul principal: `#667eea`
- Púrpura secundario: `#764ba2`

### Configuración
Modifica `MapConfig` en `lib/models/map_config.dart` para cambiar:
- Centro inicial del mapa
- Zoom inicial
- Límite de eventos
- Habilitar/deshabilitar funcionalidades

## 📋 Dependencias

```yaml
dependencies:
  flutter:
    sdk: flutter
  google_maps_flutter: ^2.5.0
  provider: ^6.1.1
  cupertino_icons: ^1.0.8
  shared_preferences: ^2.2.2
  intl: ^0.19.0
  vibration: ^1.8.4
  path_provider: ^2.1.2
```

## 🚀 Próximas Mejoras

- [ ] Persistencia de marcadores
- [ ] Exportar eventos a archivo
- [ ] Temas personalizables
- [ ] Modo offline
- [ ] Geolocalización automática
- [ ] Compartir ubicaciones

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📞 Soporte

Si tienes problemas o preguntas, por favor abre un issue en el repositorio.