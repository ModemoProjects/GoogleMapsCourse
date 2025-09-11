# 🗺️ León, Guanajuato - Mapa Interactivo

Una aplicación Flutter que replica la funcionalidad de Google Maps con markers animados y InfoWindows personalizados para explorar los lugares más destacados de León, Guanajuato.

## ✨ Características Principales

### 🎯 Funcionalidades del Mapa
- **Mapa Interactivo**: Usando `google_maps_flutter` con 4 ubicaciones en León, Guanajuato
- **Markers Personalizados**: Íconos de colores diferentes con animaciones únicas
- **InfoWindows Avanzados**: Información detallada con imágenes de alta calidad
- **Sidebar de Navegación**: Panel lateral con efectos glassmorphism
- **Diseño Responsive**: Adaptación automática a diferentes tamaños de pantalla

### 🎨 Ubicaciones Incluidas
- 🍽️ **Restaurante El Buen Sabor** - Comida mexicana tradicional
- 🌳 **Parque Principal de León** - Área verde en el corazón de la ciudad
- 🏛️ **Museo de Arte Contemporáneo** - Exposiciones de arte moderno
- 🛍️ **Plaza del Sol** - Centro comercial con más de 200 tiendas

### 🎭 Animaciones Personalizadas
- **Restaurante & Centro Comercial**: Animación de rebote
- **Parque**: Animación de caída
- **Museo**: Animación de rotación 360°

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
- Flutter SDK (versión 3.9.2 o superior)
- Dart SDK
- Android Studio / Xcode para desarrollo móvil
- API Key de Google Maps

### 2. Configuración de la API Key

#### Para Android:
1. Abre `android/app/src/main/AndroidManifest.xml`
2. Reemplaza `TU_API_KEY_AQUI` con tu API Key de Google Maps:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_REAL_AQUI" />
```

#### Para iOS:
1. Abre `ios/Runner/AppDelegate.swift`
2. Agrega tu API Key:
```swift
GMSServices.provideAPIKey("TU_API_KEY_REAL_AQUI")
```

### 3. Instalación de Dependencias
```bash
flutter pub get
```

### 4. Ejecutar la Aplicación
```bash
# Para Android
flutter run

# Para iOS
flutter run -d ios

# Para Web
flutter run -d chrome
```

## 📦 Dependencias Utilizadas

```yaml
dependencies:
  flutter:
    sdk: flutter
  google_maps_flutter: ^2.5.0
  cached_network_image: ^3.3.0
  animations: ^2.0.8
  provider: ^6.1.1
  http: ^1.1.0
```

## 🏗️ Estructura del Proyecto

```
lib/
├── main.dart                 # Punto de entrada de la aplicación
├── models/
│   └── location_model.dart   # Modelo de datos para ubicaciones
├── screens/
│   └── map_screen.dart       # Pantalla principal del mapa
├── widgets/
│   ├── custom_marker.dart    # Widget para markers personalizados
│   ├── info_window_widget.dart # Widget para InfoWindows
│   ├── sidebar_widget.dart   # Widget del sidebar de navegación
│   └── location_button.dart  # Botones de ubicación
├── services/
│   └── map_service.dart      # Servicio para gestión del mapa
└── utils/
    └── constants.dart        # Constantes y configuraciones
```

## 🎨 Características de Diseño

### Colores y Estilos
- **Sidebar**: Gradiente azul-púrpura (#667eea a #764ba2)
- **Botones**: Efecto glassmorphism con transparencia
- **InfoWindows**: Fondo blanco con sombras elegantes
- **Animaciones**: Transiciones suaves de 300ms

### Layout Responsive
- **Desktop**: Sidebar lateral de 300px
- **Móvil**: Sidebar superior colapsable
- **Tablet**: Adaptación automática del tamaño

## 🔧 Funcionalidades Técnicas

### Gestión de Estado
- **Provider**: Para manejo del estado del mapa
- **ChangeNotifier**: Para notificaciones de cambios
- **Consumer**: Para widgets reactivos

### Animaciones
- **AnimationController**: Para control de animaciones
- **Tween**: Para interpolación de valores
- **CurvedAnimation**: Para curvas de animación personalizadas

### Navegación
- **Centrado automático**: Al seleccionar ubicaciones
- **Zoom inteligente**: Nivel de zoom óptimo para cada ubicación
- **Gestos**: Pan, zoom y tap en el mapa

## 📱 Características Móviles

- **Gestos de zoom y pan** en el mapa
- **Vibración** al tocar markers (opcional)
- **Navegación con gestos** intuitiva
- **Optimización de rendimiento** para dispositivos móviles
- **Manejo de orientación** de pantalla

## 🛠️ Desarrollo

### Comandos Útiles
```bash
# Limpiar proyecto
flutter clean

# Obtener dependencias
flutter pub get

# Ejecutar tests
flutter test

# Análisis de código
flutter analyze

# Formatear código
dart format .
```

### Hot Reload
La aplicación soporta hot reload para desarrollo rápido. Los cambios en el código se reflejan inmediatamente sin perder el estado de la aplicación.

## 🐛 Solución de Problemas

### Error de API Key
Si ves un error relacionado con la API Key de Google Maps:
1. Verifica que hayas configurado correctamente la API Key
2. Asegúrate de que la API Key tenga permisos para Google Maps
3. Revisa que no haya espacios extra en la configuración

### Problemas de Permisos
Para Android, asegúrate de que los permisos estén configurados en `AndroidManifest.xml`.
Para iOS, verifica que los permisos de ubicación estén en `Info.plist`.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, por favor abre un issue en el repositorio.

---

**¡Disfruta explorando León, Guanajuato! 🎉**
