# Estilos JSON para Google Maps Demo

Este directorio contiene los archivos de estilos JSON para cada tema del demo de Google Maps.

## 📁 Estructura de Archivos

```
styles/
├── styles-config.json     # Configuración central de temas
├── styles-utils.js        # Utilidades para manejo de estilos
├── light.json            # Tema claro (estilo por defecto)
├── dark.json             # Tema oscuro
├── minimal.json          # Mapa minimalista
├── mobility.json         # Tema movilidad
├── retail.json           # Tema retail
└── logistics.json        # Tema logística
```

## 🎨 Formato de Archivos JSON

Cada archivo de tema sigue esta estructura:

```json
[
  {
    "comment": "Descripción del tema",
    "description": "Uso y características",
    "useCase": "Casos de uso específicos",
    "features": ["Característica 1", "Característica 2"]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  }
]
```

### Metadatos (Opcional)
- `comment`: Descripción breve del tema
- `description`: Descripción detallada
- `useCase`: Casos de uso específicos
- `features`: Lista de características principales

### Estilos de Google Maps
- `featureType`: Tipo de feature (road, water, poi, etc.)
- `elementType`: Tipo de elemento (geometry, labels, etc.)
- `stylers`: Array de estilos a aplicar

## 🔧 Configuración Central

El archivo `styles-config.json` contiene la configuración central:

```json
{
  "version": "1.0.0",
  "description": "Configuración central de estilos",
  "themes": {
    "light": {
      "file": "light.json",
      "name": "Tema Claro",
      "icon": "🌞",
      "description": "Estilo por defecto",
      "useCase": "Aplicaciones generales",
      "features": ["Colores naturales", "Máxima legibilidad"]
    }
  },
  "defaultTheme": "light",
  "basePath": "./styles/",
  "cacheEnabled": true,
  "fallbackToEmpty": true
}
```

## 🚀 Uso en el Código

### Cargar Estilos
```javascript
// Cargar configuración
await loadStylesConfig();

// Cargar estilos de un tema
const styles = await getThemeStyles('dark');

// Aplicar al mapa
map.setOptions({ styles: styles });
```

### Cache de Estilos
Los estilos se cargan una vez y se almacenan en cache para mejor rendimiento:

```javascript
// Cache habilitado por defecto
stylesCache['dark'] = styles;

// Verificar cache
if (stylesCache['dark']) {
    return stylesCache['dark'];
}
```

## 📝 Crear Nuevos Temas

### 1. Crear Archivo JSON
```json
[
  {
    "comment": "Mi Nuevo Tema",
    "description": "Descripción del tema",
    "useCase": "Casos de uso",
    "features": ["Características"]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ff0000" }]
  }
]
```

### 2. Actualizar Configuración
```json
{
  "themes": {
    "miTema": {
      "file": "mi-tema.json",
      "name": "Mi Tema",
      "icon": "🎨",
      "description": "Mi tema personalizado"
    }
  }
}
```

### 3. Usar en el Código
```javascript
// El tema se carga automáticamente
await applyTheme('miTema');
```

## 🛠️ Utilidades

El archivo `styles-utils.js` proporciona funciones auxiliares:

```javascript
// Validar estilo
const isValid = isValidMapStyle(style);

// Filtrar estilos válidos
const validStyles = filterValidStyles(styles);

// Crear estilo de color
const colorStyle = createColorStyle('road', 'geometry', '#ff0000');

// Crear estilo de visibilidad
const visibilityStyle = createVisibilityStyle('poi', 'labels', 'off');
```

## 🎯 Tipos de Features Soportados

### Elementos Geográficos
- `road` - Carreteras y calles
- `water` - Cuerpos de agua
- `landscape` - Paisaje natural
- `administrative` - Límites administrativos

### Puntos de Interés (POI)
- `poi` - Puntos de interés generales
- `poi.business` - Negocios
- `poi.attraction` - Atracciones
- `poi.shopping_mall` - Centros comerciales
- `poi.restaurant` - Restaurantes

### Elementos de Estilo
- `geometry` - Forma y color del elemento
- `labels` - Etiquetas de texto
- `labels.text` - Texto de las etiquetas
- `labels.icon` - Iconos de las etiquetas

## 🔍 Propiedades de Stylers

### Colores
```json
{ "color": "#ff0000" }           // Color hexadecimal
{ "color": "rgb(255,0,0)" }      // Color RGB
{ "color": "hsl(0,100%,50%)" }   // Color HSL
```

### Visibilidad
```json
{ "visibility": "on" }           // Visible
{ "visibility": "off" }          // Oculto
{ "visibility": "simplified" }   // Simplificado
```

### Opacidad
```json
{ "opacity": 0.5 }               // 50% de opacidad
{ "opacity": 1.0 }               // 100% de opacidad
```

### Peso
```json
{ "weight": 2 }                  // Grosor de línea
{ "weight": 4 }                  // Grosor mayor
```

## 🐛 Solución de Problemas

### Estilos no se cargan
1. Verificar que el archivo JSON existe
2. Validar sintaxis JSON
3. Revisar la consola para errores
4. Verificar configuración en `styles-config.json`

### Estilos no se aplican
1. Verificar que el tema existe en la configuración
2. Validar que los estilos son válidos para Google Maps
3. Revisar la consola para errores de validación

### Cache de estilos
1. Limpiar cache: `stylesCache = {}`
2. Deshabilitar cache en configuración
3. Recargar la página

## 📚 Recursos Adicionales

- [Google Maps Style Reference](https://developers.google.com/maps/documentation/javascript/style-reference)
- [Map Styling Wizard](https://mapstyle.withgoogle.com/)
- [JSON Validator](https://jsonlint.com/)

---

**Nota**: Los metadatos (comment, description, etc.) se filtran automáticamente antes de aplicar los estilos al mapa.
