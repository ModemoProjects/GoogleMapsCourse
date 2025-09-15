# Demo Autocompletar Direcciones con Google Maps

Un demo completo que muestra cómo implementar autocompletar de direcciones usando Google Maps JavaScript API y Places API con soporte para español (es-419).

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales
- **Autocompletar de direcciones** con Places API
- **Parseo automático** de address_components (calle, número, colonia, ciudad, estado, país, CP)
- **Sincronización con mapa** - marcador e InfoWindow
- **Reverse geocoding** al hacer clic en el mapa
- **Session tokens** para optimización de costos
- **Geocoding de respaldo** si Place Details falla

### ✅ Experiencia de Usuario
- **Debounce** en input (300ms) para optimizar búsquedas
- **Indicador de carga** durante las búsquedas
- **Validación** de campos faltantes con edición manual
- **Botón limpiar** que resetea todo el estado
- **Restricción por país** (México) activable/desactivable

### ✅ Accesibilidad
- **Navegación por teclado** completa
- **Labels descriptivos** y aria-* attributes
- **Alto contraste** para mejor legibilidad
- **Estados de focus** claramente visibles
- **Lectores de pantalla** compatibles

### ✅ Rendimiento y Analítica
- **Manejo de rate limits** con retry/backoff
- **Analítica básica** en consola y UI
- **Diseño responsivo** para móviles y desktop
- **Optimización de costos** con session tokens

## 🛠️ Configuración

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Ve a "Credentials" y crea una API Key
5. Restringe la API key:
   - En "Application restrictions" selecciona "HTTP referrers"
   - Agrega: `https://tu-dominio.com/*` y `http://localhost:*/*`

### 2. Configurar el Demo

1. Abre `index.js`
2. Reemplaza `TU_API_KEY_AQUI` con tu API key real:
   ```javascript
   const GOOGLE_MAPS_CONFIG = {
       key: 'TU_API_KEY_AQUI', // ← Reemplaza aquí
       libraries: ['places', 'geometry'],
       language: 'es-419',
       region: 'MX'
   };
   ```

### 3. Ejecutar el Demo

1. Abre `index.html` en un navegador web
2. O usa un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```

## 📋 Flujos de Uso

### Flujo A: Autocompletar → Selección
1. Usuario escribe en el campo "Dirección"
2. Aparecen sugerencias de Google Places
3. Usuario selecciona una sugerencia
4. Se rellenan automáticamente todos los campos
5. El mapa se centra y muestra un marcador

### Flujo B: Búsqueda Directa
1. Usuario escribe una dirección
2. Presiona Enter o clic en "Buscar en Mapa"
3. Se usa Geocoding API para encontrar la ubicación
4. Se rellenan los campos y actualiza el mapa

### Flujo C: Clic en Mapa
1. Usuario hace clic en cualquier parte del mapa
2. Se realiza reverse geocoding
3. Se obtiene la dirección de esa ubicación
4. Se rellenan los campos del formulario

### Flujo D: Limpiar
1. Usuario hace clic en "Limpiar"
2. Se resetean todos los campos
3. Se oculta el marcador del mapa
4. Se crea un nuevo session token

## 🔧 Personalización

### Cambiar Idioma y Región
```javascript
const GOOGLE_MAPS_CONFIG = {
    key: 'TU_API_KEY',
    libraries: ['places', 'geometry'],
    language: 'es-419', // Cambiar idioma
    region: 'MX'        // Cambiar región
};
```

### Modificar Ubicación Inicial del Mapa
```javascript
const mapOptions = {
    center: { lat: 19.4326, lng: -99.1332 }, // Cambiar coordenadas
    zoom: 10, // Cambiar nivel de zoom
    // ... otras opciones
};
```

### Personalizar Estilos
Edita `style.css` para cambiar:
- Colores y tipografías
- Tamaños y espaciados
- Animaciones y transiciones
- Diseño responsivo

## 📊 Analítica

El demo incluye analítica básica que se muestra en:
- **Consola del navegador** (F12 → Console)
- **Sección de Analytics** en la página

Métricas incluidas:
- Tiempo de búsqueda en milisegundos
- Número de resultados de autocompletar
- Si se usó reverse geocoding
- Timestamp de la búsqueda

## 🛡️ Seguridad

### Mejores Prácticas Implementadas
- ✅ API key restringida por HTTP referrers
- ✅ Comentarios sobre seguridad en el código
- ✅ Manejo de errores sin exponer información sensible
- ✅ Validación de entrada del usuario

### Recomendaciones Adicionales
- Usa variables de entorno en producción
- Implementa rate limiting en el servidor
- Monitorea el uso de la API regularmente
- Considera usar API keys separadas para desarrollo/producción

## 🐛 Solución de Problemas

### Error: "Error al cargar Google Maps"
- Verifica que la API key sea correcta
- Asegúrate de que las APIs estén habilitadas
- Revisa las restricciones de la API key

### No aparecen sugerencias de autocompletar
- Verifica que Places API esté habilitada
- Revisa la consola para errores de JavaScript
- Asegúrate de que la API key tenga permisos para Places API

### El mapa no se carga
- Verifica que Maps JavaScript API esté habilitada
- Revisa la consola del navegador para errores
- Asegúrate de que la API key tenga permisos para Maps API

## 📱 Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Dispositivos móviles (iOS/Android)

## 📄 Estructura de Archivos

```
autocomplete-map/
├── index.html          # Estructura HTML principal
├── index.js           # Lógica JavaScript completa
├── style.css          # Estilos CSS responsivos
├── README.md          # Este archivo
└── package.json       # Dependencias (si las hay)
```

## 🤝 Contribuciones

Este es un demo educativo. Si encuentras bugs o tienes sugerencias:
1. Abre un issue describiendo el problema
2. Proporciona pasos para reproducir
3. Incluye información del navegador y versión

## 📚 Recursos Adicionales

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)
- [Google Maps Platform Pricing](https://developers.google.com/maps/billing-and-pricing)

## 📄 Licencia

Este proyecto es para fines educativos. Asegúrate de cumplir con los términos de servicio de Google Maps Platform.