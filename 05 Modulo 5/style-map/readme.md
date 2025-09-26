# Google Maps Demo Integral con Temas Conmutables

Este proyecto demuestra el uso avanzado de Google Maps JavaScript API con diferentes temas conmutables en tiempo real, diseñado específicamente para uso educativo y demostración en clase.

## 🎯 Características Principales

### **6 Temas Conmutables en Tiempo Real**
- **🌞 Tema Claro**: Estilo por defecto de Google Maps
- **🌙 Tema Oscuro**: Estilo nocturno con colores oscuros
- **📊 Mapa Minimalista**: Oculta POIs no esenciales, ideal para dashboards
- **🚗 Movilidad**: Resalta red vial, capa de tráfico y rutas
- **🛍️ Retail**: Enfatiza zonas comerciales con Places Details
- **📦 Logística**: Zonas de cobertura y puntos de distribución

### **Overlays Dinámicos**
- **Polylines**: Rutas de ejemplo para tema movilidad
- **Polygons/Circles**: Zonas de cobertura para logística
- **Markers**: POIs comerciales y puntos de distribución
- **TrafficLayer**: Tráfico en tiempo real

### **Funcionalidades Avanzadas**
- **Places Details**: Información detallada con horarios de apertura
- **Persistencia**: Guarda configuración en localStorage
- **Accesibilidad**: Navegación por teclado y contraste WCAG
- **Responsive**: Diseño adaptativo para móviles

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js (versión 14 o superior)
- Navegador moderno con soporte para ES6+
- API Key de Google Maps (con Places API habilitada)

### Instalación
```bash
# 1. Navegar al directorio del proyecto
cd "05 Modulo 5/style-map"

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor local
npm start

# 4. Abrir en navegador
# http://localhost:3000
```

### Configuración de API Key
1. Obtén una API Key de [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API
3. Reemplaza la API key en `index.html` (línea 80)
4. Configura restricciones de dominio para seguridad

## 📖 Guía de Uso

### **Selector de Temas**
- Usa el dropdown en el panel izquierdo para cambiar temas
- Los cambios se aplican instantáneamente sin recargar
- El tema seleccionado se guarda automáticamente

### **Tema Movilidad** 🚗
- Activa automáticamente rutas de ejemplo (Polylines)
- Usa el checkbox "Mostrar Tráfico" para activar TrafficLayer
- Colores diferenciados por tipo de vía

### **Tema Retail** 🛍️
- Haz clic en "Cargar POIs Comerciales"
- Haz clic en cualquier marcador para ver detalles
- Información incluye: horarios, calificaciones, dirección

### **Tema Logística** 📦
- Haz clic en "Cargar Datos Logísticos"
- Visualiza zonas de cobertura (círculos de colores)
- Puntos de distribución con iconos diferenciados

## 🏗️ Arquitectura del Proyecto

### **Estructura de Archivos**
```
style-map/
├── index.html                    # Estructura HTML con controles
├── index.js                     # Lógica principal y carga de estilos
├── style.css                    # Estilos modernos y accesibles
├── package.json                 # Dependencias Node.js
├── server.js                    # Servidor Express local
├── readme.md                    # Este archivo
└── styles/                      # Directorio de estilos JSON
    ├── styles-config.json       # Configuración central de temas
    ├── styles-utils.js          # Utilidades para manejo de estilos
    ├── README.md                # Documentación de estilos
    ├── light.json               # Tema claro
    ├── dark.json                # Tema oscuro
    ├── minimal.json             # Mapa minimalista
    ├── mobility.json            # Tema movilidad
    ├── retail.json              # Tema retail
    ├── logistics.json           # Tema logística
    └── example-custom-theme.json # Ejemplo de tema personalizado
```

### **Componentes Principales**

#### **Sistema de Estilos JSON Modular**
- **Archivos separados**: Cada tema en su propio archivo JSON
- **Configuración central**: `styles-config.json` para gestión de temas
- **Cache inteligente**: Carga optimizada con sistema de cache
- **Validación automática**: Filtrado de estilos válidos para Google Maps
- **Metadatos incluidos**: Descripción, casos de uso y características por tema
- **Utilidades**: `styles-utils.js` con funciones auxiliares

#### **Sistema de Overlays** (`currentOverlays`)
- Gestión centralizada de overlays
- Limpieza automática al cambiar temas
- Reutilización de componentes

#### **Places Integration**
- Consultas optimizadas con campos específicos
- Manejo de errores y datos de ejemplo
- Panel lateral con información detallada

## 🔧 Personalización

### **Agregar Nuevos Temas**

#### **Método 1: Archivo JSON (Recomendado)**
1. Crea archivo `styles/mi-tema.json` con estilos
2. Actualiza `styles/styles-config.json` con la configuración del tema
3. El tema se carga automáticamente

#### **Método 2: Código JavaScript**
1. Añade objeto de estilos en `mapStyles`
2. Crea función `show[NuevoTema]Theme()`
3. Agrega case en `applyTheme()`
4. Actualiza el selector HTML

#### **Ejemplo de Tema Personalizado**
```json
[
  {
    "comment": "Mi Tema Personalizado",
    "description": "Tema con colores corporativos",
    "useCase": "Aplicaciones de marca",
    "features": ["Colores personalizados", "POIs destacados"]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#4fc3f7" }]
  }
]
```

### **Modificar Datos de Ejemplo**
- Edita `sampleData` en `index.js`
- Coordenadas, rutas, POIs, zonas de cobertura
- Iconos personalizados en `getMarkerIcon()`

### **Estilos Personalizados**
- Modifica `style.css` para UI personalizada
- Soporte para modo oscuro del sistema
- Animaciones y transiciones configurables

## 🛡️ Seguridad y Mejores Prácticas

### **API Key Security**
```javascript
// Restricciones recomendadas en Google Cloud Console:
// - Restricción por HTTP referrer
// - Dominios específicos: localhost:3000, tu-dominio.com
// - Solo APIs necesarias: Maps JavaScript API, Places API
```

### **Manejo de Errores**
- Fallbacks para datos de Places API
- Mensajes informativos para usuarios
- Logging de errores en consola

### **Accesibilidad**
- Atributos ARIA completos
- Navegación por teclado
- Contraste WCAG AA
- Soporte para lectores de pantalla

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: Panel lateral flotante
- **Tablet** (≤768px): Panel superior
- **Mobile** (≤480px): Layout optimizado

### **Características Móviles**
- Touch-friendly controls
- Paneles deslizables
- Texto legible en pantallas pequeñas

## 🐛 Solución de Problemas

### **Mapa no carga**
- Verifica API key válida
- Revisa restricciones de dominio
- Comprueba conexión a internet

### **Places Details no funciona**
- Confirma que Places API está habilitada
- Verifica que la API key tiene permisos
- Revisa la consola para errores

### **Estilos no se aplican**
- Verifica sintaxis JSON en `mapStyles`
- Comprueba que el tema existe
- Revisa la consola para errores

## 📚 Recursos Adicionales

### **Documentación Google Maps**
- [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places)
- [Map Styling](https://developers.google.com/maps/documentation/javascript/style-reference)

### **Accesibilidad**
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Best Practices](https://www.w3.org/TR/wai-aria-practices/)

## 📄 Licencia

MIT License - Libre para uso educativo y comercial.

## 🤝 Contribuciones

Este proyecto está diseñado para fines educativos. Las contribuciones son bienvenidas:
1. Fork del proyecto
2. Crea una rama para tu feature
3. Commit de cambios
4. Push a la rama
5. Abre un Pull Request

---

**Desarrollado para el Curso de Google Maps - Módulo 5**
*Demo integral con temas conmutables en tiempo real*