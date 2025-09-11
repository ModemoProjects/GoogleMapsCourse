# 🗺️ Ejemplo de Elementos en Google Maps

Este proyecto demuestra cómo crear y manipular diferentes tipos de elementos en Google Maps usando la API de JavaScript.

## ✨ Características

### 🎨 Elementos del Mapa
- **Polylines**: Rutas y trayectorias
- **Polygons**: Áreas delimitadas
- **Circles**: Zonas de influencia
- **Markers**: Puntos de interés

### 🛠️ Funcionalidades
- **Herramientas de Dibujo**: DrawingManager de Google Maps
- **Mediciones**: Cálculos automáticos de distancias y áreas
- **Modo Edición**: Arrastra puntos para modificar elementos
- **Exportar/Importar**: Guarda y carga configuraciones

## 🚀 Cómo Usar

### 1. Iniciar el Servidor
```bash
npm start
```

### 2. Abrir en el Navegador
```
http://localhost:3000
```

### 3. Usar las Herramientas
1. **Activar Herramientas de Dibujo** para crear elementos
2. **Marcar Mediciones** para ver cálculos automáticos
3. **Usar Modo Edición** para modificar elementos existentes
4. **Exportar Datos** para guardar tu trabajo
5. **Importar Datos** para cargar configuraciones guardadas

## 🎛️ Controles Disponibles

### Elementos del Mapa
- ☑️ **Polylines (Rutas)** - Muestra/oculta rutas
- ☑️ **Polygons (Áreas)** - Muestra/oculta áreas
- ☑️ **Circles (Zonas)** - Muestra/oculta círculos

### Funcionalidades
- ☑️ **📏 Mediciones** - Panel de mediciones dinámico
- ☑️ **🛠️ Herramientas de Dibujo** - DrawingManager de Google Maps
- ☑️ **✏️ Modo Edición** - Edición interactiva de elementos

### Acciones
- 🗑️ **Limpiar Todo** - Elimina todos los elementos
- 💾 **Exportar Datos** - Descarga configuración en JSON
- 📁 **Importar Datos** - Carga configuración desde archivo

## 🔧 Tecnologías Utilizadas

- **Google Maps JavaScript API** - Mapa base y funcionalidades
- **Google Maps Geometry Library** - Cálculos precisos
- **Google Maps Drawing Library** - Herramientas de dibujo
- **HTML5/CSS3** - Interfaz de usuario
- **JavaScript ES6+** - Lógica de la aplicación
- **Node.js + Express** - Servidor local

## 📁 Estructura del Proyecto

```
draw-map/
├── index.html          # Página principal
├── index.js           # Lógica de la aplicación
├── style.css          # Estilos CSS
├── server.js          # Servidor Express
├── package.json       # Dependencias
└── readme.md          # Documentación
```

## 🎯 Funcionalidades Detalladas

### Herramientas de Dibujo
- **Marcadores**: Puntos de interés con iconos personalizados
- **Polylines**: Rutas con estilos y animaciones
- **Polygons**: Áreas con colores y opacidad
- **Circles**: Zonas de influencia con radio configurable

### Sistema de Mediciones
- **Cálculos Automáticos**: Usando Google Maps Geometry Library
- **Panel Dinámico**: Se actualiza automáticamente
- **Múltiples Unidades**: Distancias en km, áreas en km²
- **Contadores**: Muestra cantidad de elementos

### Modo Edición
- **Marcadores Arrastrables**: Para modificar elementos
- **Actualización Automática**: Mediciones se actualizan
- **Instrucciones Visuales**: Guía para el usuario

### Exportación/Importación
- **Formato JSON**: Datos estructurados y legibles
- **Preserva Estilos**: Colores, opacidad, etc.
- **Metadatos**: Fecha de exportación incluida
- **Validación**: Verifica estructura de datos

## 🌟 Características Especiales

- **Mapa Limpio**: Inicia sin elementos predefinidos
- **Interfaz Moderna**: Diseño responsive y atractivo
- **Logs de Consola**: Para debugging y seguimiento
- **Manejo de Errores**: Mensajes informativos
- **Animaciones**: Efectos visuales atractivos

## 📱 Responsive Design

La interfaz se adapta a diferentes tamaños de pantalla:
- **Desktop**: Panel de controles a la derecha
- **Tablet**: Controles optimizados
- **Mobile**: Interfaz adaptada para touch

## 🔍 Debugging

Abre la consola del navegador para ver:
- Estado de carga de Google Maps
- Creación de elementos
- Cálculos de mediciones
- Errores y advertencias

## 🎨 Personalización

Puedes modificar fácilmente:
- **Colores**: En las funciones de dibujo
- **Estilos**: En el archivo CSS
- **Ubicación**: Cambiar coordenadas del centro
- **Zoom**: Ajustar nivel inicial

¡Disfruta creando mapas interactivos! 🗺️✨