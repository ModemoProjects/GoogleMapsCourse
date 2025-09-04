# 🌍 Ejemplo de Cambio de Tipo de Mapa - Google Maps API

Este proyecto es un ejemplo interactivo para presentaciones que demuestra cómo cambiar entre diferentes tipos de mapa utilizando la API de Google Maps, **incluyendo tipos de mapa completamente personalizados**.

## 📋 Tabla de Contenidos

- [✨ Características](#-características)
- [🚀 Instalación y Uso](#-instalación-y-uso)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [🎨 Tipos de Mapa Personalizados](#-tipos-de-mapa-personalizados)
- [📱 Responsive Design](#-responsive-design)
- [🔧 Personalización](#-personalización)
- [📚 Recursos Adicionales](#-recursos-adicionales)

## ✨ Características

### **Tipos de Mapa Estándar:**
- 🗺️ **Roadmap** - Vista estándar de calles y carreteras
- 🛰️ **Satellite** - Imágenes satelitales
- 🔀 **Hybrid** - Combinación de satélite con etiquetas de calles
- 🏔️ **Terrain** - Vista topográfica con elevaciones
- 🎨 **Personalizado** - Estilos completamente personalizables

### **Tipos de Mapa Personalizados:**
- 🌙 **Modo Nocturno** - Colores oscuros para uso nocturno
- 📺 **Estilo Retro** - Apariencia vintage y clásica
- ⚫ **Escala de Grises** - Vista monocromática
- ⚡ **Alto Contraste** - Máxima legibilidad
- 🌿 **Naturaleza** - Colores naturales y orgánicos

### **Controles Avanzados:**
- **Zoom personalizable** (1-20)
- **Aplicación en tiempo real** de estilos personalizados
- **Panel de configuración** expandible
- **Información en tiempo real** del estado del mapa

### **Interfaz Moderna:**
- Botones interactivos para cambiar tipo de mapa
- Panel de configuración personalizada expandible
- Panel de información en tiempo real
- Diseño atractivo con gradientes y sombras
- Notificaciones visuales al cambiar tipo de mapa
- Completamente responsivo para móviles y tablets

## 🚀 Instalación y Uso

### **Requisitos Previos:**
- Navegador web moderno con soporte para ES6 Modules
- Clave de API de Google Maps (opcional para desarrollo local)

### **Instalación:**
```bash
# Clonar o descargar el proyecto
cd change-map-type

# Instalar dependencias (opcional)
npm install

# Iniciar servidor local (opcional)
npm start
```

### **Uso Básico:**
1. **Abrir el proyecto:**
   ```bash
   # Opción 1: Abrir directamente en el navegador
   open index.html
   
   # Opción 2: Usar servidor local
   npm start
   # Luego abrir http://localhost:3000
   ```

2. **Cambiar tipo de mapa estándar:**
   - Haz clic en cualquiera de los 4 botones estándar
   - Observa cómo cambia instantáneamente la vista del mapa
   - El botón activo se resalta en rojo

3. **Usar tipos de mapa personalizados:**
   - Haz clic en el botón "🎨 Personalizado"
   - Se abrirá un panel de configuración
   - Selecciona el estilo deseado del menú desplegable
   - Ajusta el zoom con el slider
   - Haz clic en "✨ Aplicar Personalización"

4. **Información en tiempo real:**
   - El panel inferior muestra el tipo de mapa actual
   - Coordenadas del centro del mapa
   - Nivel de zoom actual
   - Estilo personalizado aplicado (si existe)

## 🏗️ Arquitectura del Proyecto

### **Estructura de Archivos:**
```
change-map-type/
├── index.html              # Página principal
├── index.js               # Lógica principal (ES6 Modules)
├── index-json-version.js  # Versión alternativa con JSON
├── map-styles.js          # Estilos personalizados (ES6)
├── map-styles.json        # Estilos en formato JSON
├── style.css              # Estilos CSS
├── server.js              # Servidor Express (opcional)
├── package.json           # Dependencias del proyecto
└── readme.md              # Documentación
```

### **Dos Opciones de Implementación:**

#### **🎯 Opción 1: ES6 Modules (Recomendado)**
**Archivos:** `index.html`, `index.js`, `map-styles.js`, `style.css`

**Ventajas:**
- ✅ **Módulos ES6** - Sintaxis moderna y estándar
- ✅ **Tree-shaking** - Solo se importa lo que se usa
- ✅ **Mejor rendimiento** - No hay peticiones HTTP adicionales
- ✅ **TypeScript friendly** - Fácil de convertir a TypeScript
- ✅ **Bundlers** - Compatible con Webpack, Vite, etc.

**Uso:**
```html
<script type="module" src="./index.js"></script>
```

#### **🎯 Opción 2: JSON + Fetch API**
**Archivos:** `index.html`, `index-json-version.js`, `map-styles.json`, `style.css`

**Ventajas:**
- ✅ **Separación clara** - Datos separados de lógica
- ✅ **Fácil edición** - JSON es fácil de leer y modificar
- ✅ **Reutilización** - Otros sistemas pueden usar el JSON
- ✅ **Sin compilación** - Funciona directamente en el navegador
- ✅ **Caching** - El navegador puede cachear el JSON

**Uso:**
```html
<script type="module" src="./index-json-version.js"></script>
```

### **Tecnologías Utilizadas:**
- **HTML5** - Estructura semántica con controles avanzados
- **CSS3** - Estilos modernos con gradientes, sombras y animaciones
- **JavaScript ES6+** - Lógica de cambio de tipo de mapa y estilos personalizados
- **Google Maps JavaScript API** - Funcionalidad del mapa y `StyledMapType`
- **Express.js** - Servidor local (opcional)
- **Node.js** - Entorno de ejecución del servidor

## 🎨 Tipos de Mapa Personalizados

### **Cómo Funcionan:**
Los tipos de mapa personalizados utilizan la API `google.maps.StyledMapType` que permite:

- **Modificar colores** de elementos específicos del mapa
- **Cambiar estilos** de calles, agua, parques, etc.
- **Crear temas** completamente únicos
- **Aplicar estilos** en tiempo real sin recargar la página

### **Estilos Incluidos:**

#### **🌙 Modo Nocturno**
- Colores oscuros para reducir fatiga visual
- Ideal para aplicaciones nocturnas
- Mejora la legibilidad en pantallas

#### **📺 Estilo Retro**
- Paleta de colores vintage y clásica
- Apariencia nostálgica y elegante
- Perfecto para aplicaciones temáticas

#### **⚫ Escala de Grises**
- Vista monocromática minimalista
- Enfoque en la estructura del mapa
- Ideal para impresión y accesibilidad

#### **⚡ Alto Contraste**
- Máxima legibilidad para accesibilidad
- Colores contrastantes para mejor visibilidad
- Cumple estándares de accesibilidad web

#### **🌿 Naturaleza**
- Colores orgánicos y naturales
- Paleta inspirada en la naturaleza
- Relajante y agradable a la vista

## 📱 Responsive Design

El ejemplo se adapta automáticamente a diferentes tamaños de pantalla:

### **Desktop (1200px+):**
- Layout horizontal con controles en grid
- Panel de información expandido
- Controles de zoom y personalización visibles

### **Tablet (768px - 1199px):**
- Controles reorganizados para mejor usabilidad
- Panel de información compacto
- Botones redimensionados para touch

### **Móvil (< 768px):**
- Controles apilados verticalmente
- Mapa optimizado para pantalla pequeña
- Navegación simplificada

## 🔧 Personalización

### **Configuración Básica:**
- **Ubicación del mapa:** Cambia las coordenadas en `index.js`
- **Estilos visuales:** Modifica colores y efectos en `style.css`
- **Tipos de mapa:** Agrega o quita opciones en el HTML y JavaScript
- **Información mostrada:** Personaliza el panel de información

### **Agregar Nuevos Estilos:**

#### **Opción 1 (ES6 Modules):**
```javascript
// En map-styles.js
export const mapStyles = {
  // ... estilos existentes
  "mi-nuevo-estilo": [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ff0000"}]
    }
  ]
};
```

#### **Opción 2 (JSON):**
```json
// En map-styles.json
{
  "mi-nuevo-estilo": [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ff0000"}]
    }
  ]
}
```

### **Modificar Estilos Existentes:**
- **Ambas opciones** permiten edición directa de colores y propiedades
- **JSON** es más fácil para no desarrolladores
- **JavaScript** permite lógica condicional y funciones

## 📚 Recursos Adicionales

### **Documentación Oficial:**
- [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/) - Herramienta visual para crear estilos
- [Documentación de StyledMapType](https://developers.google.com/maps/documentation/javascript/style-reference) - Referencia completa de la API
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) - Documentación principal

### **Tecnologías Web:**
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) - Guía de módulos JavaScript
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - API para peticiones HTTP
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) - Layout moderno con CSS

### **Herramientas de Desarrollo:**
- [Google Maps Platform](https://developers.google.com/maps) - Plataforma completa de mapas
- [Map Style Examples](https://developers.google.com/maps/documentation/javascript/examples/map-styles) - Ejemplos de estilos
- [Responsive Design Patterns](https://web.dev/responsive-web-design-basics/) - Patrones de diseño responsivo

## 📊 Comparación de Rendimiento

| Aspecto | ES6 Modules | JSON + Fetch |
|---------|-------------|---------------|
| **Tiempo de carga** | ⚡ Más rápido | 🐌 Ligeramente más lento |
| **Tamaño del bundle** | 📦 Incluido en bundle | 📄 Archivo separado |
| **Caching** | 🔄 Depende del bundle | 💾 Cache del navegador |
| **Mantenimiento** | 🛠️ Fácil | 🛠️ Muy fácil |
| **Compatibilidad** | 🌐 Moderna | 🌐 Universal |
