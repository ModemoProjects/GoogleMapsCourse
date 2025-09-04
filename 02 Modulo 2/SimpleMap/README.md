# SimpleMap - Aplicación Android con Google Maps

Una aplicación Android moderna desarrollada con Kotlin y Jetpack Compose que integra Google Maps de manera nativa, proporcionando una experiencia de usuario fluida y moderna.

## 📱 Descripción del Proyecto

SimpleMap es una aplicación de demostración que muestra las capacidades de integración de Google Maps en aplicaciones Android modernas. La aplicación utiliza las últimas tecnologías de Android, incluyendo Jetpack Compose para la UI y las APIs más recientes de Google Maps.

## ✅ Estado del Proyecto

**Funcionalidades Implementadas:**
- ✅ Integración completa de Google Maps con Compose
- ✅ Interfaz de usuario moderna con Material Design 3
- ✅ Botón flotante para centrar en ubicación específica
- ✅ Marcador personalizado en ubicación por defecto
- ✅ Controles de zoom y navegación del mapa
- ✅ Soporte para ubicación del usuario
- ✅ Configuración de permisos de ubicación
- ✅ Edge-to-edge display para experiencia inmersiva

## 🛠️ Aspectos Técnicos

### Arquitectura y Tecnologías

**Lenguaje:** Kotlin 2.0.21  
**UI Framework:** Jetpack Compose con Material Design 3  
**Maps SDK:** Google Maps Compose 4.3.3  
**Target SDK:** Android 36 (API 36)  
**Minimum SDK:** Android 33 (API 33)  

### Dependencias Principales

```kotlin
// Google Maps
implementation("com.google.maps.android:maps-compose:4.3.3")
implementation("com.google.android.gms:play-services-maps:18.2.0")

// Jetpack Compose
implementation(platform("androidx.compose:compose-bom:2024.09.00"))
implementation("androidx.compose.ui:ui")
implementation("androidx.compose.material3:material3")
```

### Configuración de Ubicación

La aplicación está configurada con León, Guanajuato como ubicación por defecto:

```kotlin
val defaultLocation = LatLng(21.1230729, -101.6650775) // León, Gto
```

### Permisos Requeridos

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## 🎨 Características de UI/UX

### Diseño Moderno
- **Material Design 3:** Implementación completa del sistema de diseño más reciente
- **Edge-to-Edge:** Aprovecha toda la pantalla para una experiencia inmersiva
- **Floating Action Button:** Botón flotante con icono de ubicación para centrar el mapa
- **Controles Intuitivos:** Zoom y navegación táctil optimizados

### Interactividad
- **Clics en el Mapa:** Manejo de eventos de clic para futuras funcionalidades
- **Centrado Automático:** Botón para volver a la ubicación por defecto
- **Marcador Informativo:** Marcador con título y descripción personalizados

## 🚀 Casos de Uso Reales

### Aplicaciones de Demostración
- **Portfolio de Desarrollador:** Muestra habilidades en integración de mapas
- **Prototipo de Aplicación:** Base para aplicaciones de geolocalización
- **Aprendizaje:** Ejemplo educativo de Google Maps en Android

### Extensiones Potenciales
- **Navegación:** Integración con Google Directions API
- **Búsqueda de Lugares:** Implementación de Places API
- **Rutas Personalizadas:** Cálculo y visualización de rutas
- **Marcadores Múltiples:** Gestión de múltiples ubicaciones

## ⚙️ Requisitos Técnicos y Configuración

### Prerrequisitos
- **Android Studio:** Versión más reciente recomendada
- **SDK:** Android 33 o superior
- **Google Play Services:** Requerido en el dispositivo
- **Conexión a Internet:** Necesaria para cargar mapas

### Configuración de API Key

1. **Obtener API Key:**
   - Visita [Google Cloud Console](https://console.cloud.google.com/)
   - Crea o selecciona un proyecto
   - Habilita "Maps SDK for Android"
   - Genera una API key

2. **Configurar en la Aplicación:**
   ```xml
   <!-- app/src/main/res/values/strings.xml -->
   <string name="google_maps_api_key">TU_API_KEY_AQUI</string>
   ```

3. **Verificar Configuración:**
   ```xml
   <!-- app/src/main/AndroidManifest.xml -->
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="@string/google_maps_api_key" />
   ```

### Compilación y Ejecución

```bash
# Sincronizar proyecto
./gradlew build

# Ejecutar en dispositivo/emulador
./gradlew installDebug
```

## 📁 Estructura del Proyecto

```
app/src/main/
├── java/com/neo/simplemap/
│   ├── MainActivity.kt              # Actividad principal con Compose
│   ├── MapScreen.kt                 # Componente principal del mapa
│   └── ui/theme/                    # Tema y estilos de la aplicación
├── res/
│   ├── values/
│   │   └── strings.xml              # Recursos de texto y API key
│   └── mipmap/                      # Iconos de la aplicación
└── AndroidManifest.xml              # Configuración y permisos
```

### Archivos Clave

- **`MainActivity.kt`:** Punto de entrada de la aplicación con configuración de Compose
- **`MapScreen.kt`:** Lógica principal del mapa con Google Maps Compose
- **`strings.xml`:** Configuración de la API key de Google Maps
- **`AndroidManifest.xml`:** Permisos y metadatos de la aplicación

## 🔧 Solución de Problemas

### Error: "Google Maps no se puede cargar"
- ✅ Verificar que la API key esté configurada correctamente
- ✅ Confirmar que Maps SDK for Android esté habilitado
- ✅ Verificar que el dispositivo tenga Google Play Services

### Error: "Permisos de ubicación requeridos"
- ✅ La aplicación solicita permisos automáticamente
- ✅ Verificar configuración de permisos en AndroidManifest.xml

### Problemas de Compilación
- ✅ Sincronizar proyecto con Gradle Files
- ✅ Verificar que todas las dependencias estén actualizadas
- ✅ Limpiar y reconstruir el proyecto

## 🚀 Extensiones Futuras

### Funcionalidades Planificadas
- **Búsqueda de Lugares:** Integración con Places API
- **Navegación:** Google Directions API para rutas
- **Marcadores Personalizados:** Gestión de múltiples ubicaciones
- **Modo Offline:** Caché de mapas para uso sin conexión
- **Temas Personalizados:** Diferentes estilos de mapa

### Mejoras Técnicas
- **Arquitectura MVVM:** Implementación de ViewModel y LiveData
- **Inyección de Dependencias:** Hilt para gestión de dependencias
- **Testing:** Pruebas unitarias y de integración
- **CI/CD:** Automatización de builds y despliegues

## 📚 Recursos Adicionales

- [Google Maps Android SDK](https://developers.google.com/maps/documentation/android-sdk)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Material Design 3](https://m3.material.io/)
- [Android Developer Guide](https://developer.android.com/guide)

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y de demostración.

---

**Desarrollado con ❤️ usando Kotlin, Jetpack Compose y Google Maps**