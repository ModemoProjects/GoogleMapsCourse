# 🗺️ Cambio de Tipos de Mapa + Estilos Personalizados - Documentación Completa

## 📋 Descripción del Proyecto

Este proyecto Android demuestra cómo implementar un selector de tipos de mapa utilizando Google Maps API y Jetpack Compose. La aplicación permite cambiar dinámicamente entre **8 tipos diferentes** de mapa, incluyendo estilos personalizados con archivos JSON.

### 🗺️ **Tipos de Mapa Estándar**
- **Roadmap** (Normal): Vista estándar del mapa con calles y nombres
- **Satellite**: Vista satelital del terreno
- **Hybrid**: Combinación de vista satelital con información de calles
- **Terrain**: Vista topográfica con elevaciones y características del terreno

### 🎨 **Tipos de Mapa Personalizados**
- **Dark Mode**: Estilo oscuro para uso nocturno
- **Night Mode**: Estilo nocturno con colores suaves
- **Retro Style**: Estilo retro con colores sepia
- **High Contrast**: Estilo de alto contraste para accesibilidad

## ✅ **Estado del Proyecto: COMPLETADO Y FUNCIONANDO**

### 🚀 **Funcionalidades Implementadas**

#### 1. **Selector de Tipos de Mapa (8 tipos total)**
- **Roadmap** (Normal): Vista estándar con calles y nombres
- **Satellite**: Vista satelital del terreno
- **Hybrid**: Combinación satelital + información de calles
- **Terrain**: Vista topográfica con elevaciones
- **Dark Mode**: Estilo oscuro para uso nocturno
- **Night Mode**: Estilo nocturno con colores suaves
- **Retro Style**: Estilo retro con colores sepia
- **High Contrast**: Estilo de alto contraste para accesibilidad

#### 2. **Interfaz de Usuario Mejorada**
- **TopAppBar**: Título descriptivo "Cambio de Tipos de Mapa"
- **Selector expandido**: Panel flotante con separador visual
- **Separador**: Distinción clara entre tipos estándar y personalizados
- **Botones de acción**: Dos FABs funcionales
- **Indicador de estado**: Muestra el tipo actual seleccionado

#### 3. **Funcionalidades del Mapa**
- **Ubicación de ejemplo**: León, Guanajuato (coordenadas: 21.1230729, -101.6650775)
- **Zoom automático**: Botón para centrar y hacer zoom en la ubicación
- **Marcador**: Indicador visual de la ubicación seleccionada
- **Interactividad**: Clics en el mapa para futuras funcionalidades
- **Estilos personalizados**: 4 estilos JSON predefinidos
- **Cambio instantáneo**: Sin recargas del mapa

## 🔧 **Aspectos Técnicos**

### Estado Reactivo Expandido
```kotlin
// Estado del tipo de mapa seleccionado
var selectedMapType by remember { mutableStateOf(MapType.NORMAL) }

// Estado para el estilo personalizado
var customMapStyle by remember { mutableStateOf<MapStyleOptions?>(null) }

// Estado para mostrar/ocultar el selector
var showMapTypeSelector by remember { mutableStateOf(false) }

// Estilos personalizados predefinidos
val customStyles = remember {
    mapOf(
        "Dark Mode" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_dark),
        "Night Mode" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_night),
        "Retro Style" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_retro),
        "High Contrast" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_high_contrast)
    )
}
```

### Cambio Dinámico con Estilos Personalizados
```kotlin
// Aplicar estilo personalizado
customMapStyle = customStyles["Dark Mode"]
selectedMapType = MapType.NORMAL
mapProperties = mapProperties.copy(mapType = MapType.NORMAL)
```

### Control de Visibilidad del Selector
```kotlin
// Botón para mostrar/ocultar selector
FloatingActionButton(
    onClick = { 
        showMapTypeSelector = !showMapTypeSelector
    },
    containerColor = if (showMapTypeSelector) 
        MaterialTheme.colorScheme.error 
    else 
        MaterialTheme.colorScheme.primary
) {
    Icon(
        imageVector = if (showMapTypeSelector) Icons.Default.Close else Icons.Default.Settings,
        contentDescription = if (showMapTypeSelector) "Ocultar selector" else "Mostrar selector"
    )
}

// Selector condicional
if (showMapTypeSelector) {
    // Contenido del selector
}
```

### Función Auxiliar para Nombres
```kotlin
private fun getMapTypeName(mapType: Int): String {
    return when (mapType) {
        MapType.NORMAL -> "Roadmap"
        MapType.SATELLITE -> "Satellite"
        MapType.HYBRID -> "Hybrid"
        MapType.TERRAIN -> "Terrain"
        else -> "Desconocido"
    }
}
```

## 📱 **Características de la UI**

### Diseño Material 3
- **Colores**: Esquema de colores consistente
- **Iconos**: Representativos para cada tipo de mapa
- **Feedback visual**: Botón seleccionado resaltado
- **Transparencias**: Mejor legibilidad del mapa
- **Separadores**: Distinción visual entre categorías

### Iconos Utilizados
- **Roadmap**: `LocationOn` (📍)
- **Satellite**: `Star` (⭐)
- **Hybrid**: `CheckCircle` (✅)
- **Terrain**: `Info` (ℹ️)
- **Estilos personalizados**: Combinación de iconos básicos

### Control de Visibilidad
- **Estado cerrado**: Icono de engranaje (⚙️) con color primario
- **Estado abierto**: Icono de cerrar (❌) con color de error
- **Selector condicional**: Visible solo cuando se necesita
- **Transparencia mejorada**: 95% de opacidad para mejor legibilidad

## 🎨 **Estilos Personalizados**

### 🎨 **Dark Mode**
- Colores oscuros para uso nocturno
- Mejor para reducir fatiga visual
- Ideal para aplicaciones nocturnas

### 🌙 **Night Mode**
- Colores suaves y oscuros
- Reducción de brillo
- Perfecto para uso en la noche

### 🎭 **Retro Style**
- Colores sepia y vintage
- Estilo nostálgico
- Ideal para aplicaciones temáticas

### ⚫ **High Contrast**
- Máximo contraste blanco/negro
- Mejor accesibilidad
- Ideal para usuarios con problemas de visión

## 📊 **Tabla de Tipos de Mapa**

| Tipo | Constante | Descripción | Icono | Categoría |
|------|-----------|-------------|-------|-----------|
| **Roadmap** | `MapType.NORMAL` | Vista estándar con calles y nombres | 🗺️ | Estándar |
| **Satellite** | `MapType.SATELLITE` | Vista satelital del terreno | 🛰️ | Estándar |
| **Hybrid** | `MapType.HYBRID` | Satelital + información de calles | 🔄 | Estándar |
| **Terrain** | `MapType.TERRAIN` | Vista topográfica con elevaciones | ⛰️ | Estándar |
| **Dark Mode** | `MapStyleOptions` | Estilo oscuro para uso nocturno | ⭐ | Personalizado |
| **Night Mode** | `MapStyleOptions` | Estilo nocturno con colores suaves | ℹ️ | Personalizado |
| **Retro Style** | `MapStyleOptions` | Estilo retro con colores sepia | ✅ | Personalizado |
| **High Contrast** | `MapStyleOptions` | Estilo de alto contraste | 📍 | Personalizado |

## 🔍 **Casos de Uso Reales**

### Aplicaciones de Navegación
- **Roadmap**: Navegación por calles
- **Satellite**: Contexto del entorno
- **Hybrid**: Orientación urbana
- **Terrain**: Actividades al aire libre

### Análisis Geográfico
- Diferentes perspectivas del mismo terreno
- Comparación de vistas para análisis
- Contexto visual mejorado

### Personalización Temática
- **Modo nocturno**: Estilos oscuros para uso nocturno
- **Accesibilidad**: Alto contraste para usuarios con problemas de visión
- **Estilos temáticos**: Para diferentes aplicaciones
- **UX mejorada**: Selector solo visible cuando se necesita

## 🚀 **Extensiones Futuras**

### Funcionalidades Adicionales
- Editor visual de estilos personalizados
- Guardar preferencias del usuario
- Cambio automático según la hora del día
- Integración con sensores (GPS, orientación)
- Importar estilos JSON personalizados

### Mejoras de UX
- Animaciones de transición entre estilos
- Modo oscuro/claro automático
- Gestos de swipe para cambiar tipos
- Búsqueda de ubicaciones

## 📱 **Requisitos Técnicos**

### Dependencias
```kotlin
// Google Maps
implementation(libs.maps.compose)
implementation(libs.play.services.maps)

// Jetpack Compose
implementation(platform(libs.androidx.compose.bom))
implementation(libs.androidx.compose.ui)
implementation(libs.androidx.compose.material3)
```

### Configuración
- **API Key**: Configurar Google Maps API en `local.properties`
- **Permisos**: Ubicación y acceso a internet
- **SDK mínimo**: API 33 (Android 13)
- **Archivos de estilo**: JSON en `app/src/main/res/raw/`

## 🎯 **Comandos para Ejecutar**

```bash
# Compilar y ejecutar
./gradlew assembleDebug
./gradlew installDebug

# O desde Android Studio
# Build → Make Project
# Run → Run 'app'
```

## 📁 **Archivos del Proyecto**

### **Código Principal**
- `MapScreen.kt` - Componente principal del mapa con estilos personalizados
- `MainActivity.kt` - Actividad principal
- `AndroidManifest.xml` - Permisos y configuración

### **Estilos Personalizados**
- `map_style_dark.json` - Estilo oscuro para uso nocturno
- `map_style_night.json` - Estilo nocturno con colores suaves
- `map_style_retro.json` - Estilo retro con colores sepia
- `map_style_high_contrast.json` - Estilo de alto contraste

## 🎯 **Conclusión**

Este proyecto demuestra exitosamente cómo implementar un **selector de tipos de mapa funcional y elegante** en una aplicación Android moderna, incluyendo **estilos personalizados con JSON**. La combinación de **Jetpack Compose** con **Google Maps API** y **MapStyleOptions** proporciona:

- ✅ **Experiencia de usuario fluida** y responsiva
- ✅ **Código mantenible** y escalable
- ✅ **Interfaz moderna** siguiendo Material Design 3
- ✅ **Funcionalidad robusta** para cambio de tipos de mapa
- ✅ **Estilos personalizados** con archivos JSON
- ✅ **Separación visual** entre tipos estándar y personalizados
- ✅ **Control inteligente de visibilidad** para mejor UX

## 🔗 **Recursos Adicionales**

- **Documentación**: [Google Maps Android](https://developers.google.com/maps/documentation/android-sdk)
- **Jetpack Compose**: [Android Developers](https://developer.android.com/jetpack/compose)
- **Material Design**: [Material.io](https://material.io/design)

---

**¡Proyecto completado y listo para usar! 🎉**
