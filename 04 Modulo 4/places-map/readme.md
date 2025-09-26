# Google Maps Places Demo

Un demo completo de Google Maps JavaScript API con Places Library que combina búsqueda nearby, detalles de lugares, y funcionalidades avanzadas de filtrado.

## 🚀 Características

### Búsquedas Implementadas
- **Nearby Search**: Búsqueda de lugares cerca del usuario con geolocalización
- **Text Search**: Búsqueda por texto con soporte para ciudades específicas
- **Find Place**: Búsqueda específica de lugares con Autocomplete
- **Place Details**: Información detallada con campos optimizados

### Filtros Avanzados
- **Tipo de lugar**: Restaurantes, hospedaje, atracciones, etc.
- **Palabra clave**: Búsqueda por términos específicos
- **Radio de búsqueda**: Control deslizante de 100m a 50km
- **Nivel de precio**: Filtros de $ a $$$$
- **Estado de apertura**: Solo lugares abiertos ahora
- **Idioma y región**: Soporte multiidioma y regional

### Restricciones Geográficas
- **Restricción por país**: Autocomplete limitado a países específicos
- **Restricción por estado**: Bounding box para limitar a regiones específicas
- **Sesgo de ubicación**: Priorizar resultados cerca de una ubicación

### UX y Accesibilidad
- **Debounce**: 300ms para entradas de texto
- **Indicadores de carga**: Feedback visual durante búsquedas
- **Manejo de errores**: Mensajes claros para diferentes estados
- **Navegación por teclado**: Soporte completo para accesibilidad
- **Diseño responsivo**: Adaptable a móviles y tablets

## 🛠️ Tecnologías Utilizadas

- **Google Maps JavaScript API v3**
- **Places Library**
- **Geocoding API**
- **HTML5 Geolocation API**
- **CSS3 con Grid y Flexbox**
- **JavaScript ES6+ (sin frameworks)**

## 📋 Requisitos

1. **API Key de Google Maps** con los siguientes servicios habilitados:
   - Maps JavaScript API
   - Places API
   - Geocoding API

2. **Restricciones de seguridad recomendadas**:
   - HTTP referrers específicos
   - Solo APIs necesarias habilitadas

## 🚀 Instalación y Uso

1. **Clonar o descargar el proyecto**
2. **Configurar la API Key**:
   - Reemplazar `AIzaSyA6myHzS10YXdcazAFalmXvDkrYCp5cLc8` en `index.html`
   - Configurar restricciones de seguridad en Google Cloud Console

3. **Ejecutar el proyecto**:
   ```bash
   # Opción 1: Servidor local simple
   python -m http.server 8000
   
   # Opción 2: Con Node.js (si tienes el servidor)
   npm start
   ```

4. **Abrir en el navegador**: `http://localhost:8000`

## 📖 Uso del Demo

### Búsqueda Básica
1. **Permitir ubicación**: El demo solicitará acceso a tu ubicación
2. **Búsqueda automática**: Se realizará una búsqueda nearby automáticamente
3. **Filtros**: Usa los controles para refinar la búsqueda

### Búsqueda por Texto
1. **Input principal**: Escribe el nombre de un lugar o tipo de negocio
2. **Input de ciudad**: Especifica una ciudad para buscar
3. **Autocomplete**: Las sugerencias aparecerán automáticamente

### Filtros Avanzados
- **Tipo**: Selecciona el tipo de lugar (restaurante, hotel, etc.)
- **Palabra clave**: Añade términos específicos (ej: "tacos", "pizza")
- **Radio**: Ajusta el área de búsqueda
- **Precio**: Establece rangos de precio
- **Abierto ahora**: Solo lugares abiertos actualmente

### Detalles del Lugar
1. **Click en resultado**: Ver detalles en el panel lateral
2. **Click en marker**: Ver información básica en popup
3. **Modal completo**: Información detallada con fotos y reseñas

## 🔧 Configuración Avanzada

### Restricciones Geográficas

#### Restricción por País
```javascript
const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: ['mx', 'us'] },
    fields: ['place_id', 'geometry', 'name', 'formatted_address']
});
```

#### Restricción por Estado (Bounding Box)
```javascript
const jaliscoBounds = {
    north: 22.75, south: 18.92, east: -101.57, west: -105.66
};
const autocomplete = new google.maps.places.Autocomplete(input, {
    locationRestriction: jaliscoBounds
});
```

#### Sesgo de Ubicación
```javascript
const autocomplete = new google.maps.places.Autocomplete(input, {
    locationBias: { 
        center: {lat: 19.4326, lng: -99.1332}, 
        radius: 50000 
    }
});
```

### Campos Optimizados para Place Details

El demo utiliza campos específicos para optimizar costos de API:

```javascript
const PLACE_DETAILS_FIELDS = [
    'place_id', 'name', 'formatted_address', 'geometry',
    'opening_hours', 'rating', 'user_ratings_total',
    'photos', 'website', 'international_phone_number',
    'reviews', 'price_level', 'types', 'vicinity'
];
```

## 📊 APIs y Métodos Utilizados

### Nearby Search
```javascript
placesService.nearbySearch({
    location: currentLocation,
    radius: 5000,
    keyword: 'tacos',
    type: 'restaurant',
    openNow: true,
    minPriceLevel: 0,
    maxPriceLevel: 3,
    language: 'es-419',
    region: 'mx'
}, callback);
```

### Text Search
```javascript
placesService.textSearch({
    query: 'museos en guadalajara',
    region: 'mx',
    language: 'es-419',
    type: 'museum'
}, callback);
```

### Find Place
```javascript
placesService.findPlaceFromQuery({
    input: 'Catedral de Guadalajara',
    inputType: 'textquery',
    fields: ['place_id', 'geometry', 'name'],
    locationBias: { 
        radius: 20000, 
        center: {lat: 20.6736, lng: -103.344} 
    }
}, callback);
```

### Place Details
```javascript
placesService.getDetails({
    placeId: placeId,
    fields: PLACE_DETAILS_FIELDS
}, callback);
```

## 🎨 Personalización

### Estilos CSS
El proyecto utiliza variables CSS para fácil personalización:

```css
:root {
    --primary-color: #4285f4;
    --secondary-color: #34a853;
    --text-primary: #202124;
    --background: #ffffff;
    /* ... más variables */
}
```

### Configuración por Defecto
```javascript
const DEFAULT_LOCATION = { lat: 19.4326, lng: -99.1332 }; // CDMX
const DEFAULT_ZOOM = 13;
```

## 🔒 Consideraciones de Seguridad

1. **API Key**: Nunca expongas tu API key en código público
2. **Restricciones**: Configura HTTP referrers en Google Cloud Console
3. **Límites**: Monitorea el uso de la API para evitar exceder cuotas
4. **Validación**: Valida todas las entradas del usuario

## 🐛 Solución de Problemas

### Error: "This page can't load Google Maps correctly"
- Verifica que la API key sea válida
- Confirma que Maps JavaScript API esté habilitada
- Revisa las restricciones de HTTP referrers

### Error: "ZERO_RESULTS"
- Intenta ampliar el radio de búsqueda
- Verifica que la ubicación sea correcta
- Prueba con diferentes tipos de lugares

### Error: "OVER_QUERY_LIMIT"
- Has excedido el límite de consultas
- Espera antes de realizar más búsquedas
- Considera implementar caché de resultados

### Advertencia: "open_now is deprecated"
- **Solucionado**: El demo usa `isOpen()` en lugar de `open_now`
- Esta advertencia no afecta la funcionalidad
- Ver: https://goo.gle/js-open-now

### Error: "La propiedad radius no es válida"
- **Solucionado**: El demo maneja correctamente el conflicto entre `radius` y `rankBy: DISTANCE`
- Cuando el radio es ≥ 100m: usa `radius`
- Cuando el radio es < 100m: usa `rankBy: DISTANCE`
- Google Maps no permite usar ambas propiedades simultáneamente

### Filtro "Abierto ahora" no funciona
- **Solucionado**: El demo solo incluye `openNow: true` cuando el checkbox está marcado
- Google Maps API ignora `openNow: false`, por lo que se omite la propiedad cuando está desmarcado
- Debug agregado para verificar el estado del filtro en consola

### Error al mostrar detalles del lugar
- **Solucionado**: Agregado manejo de errores robusto en `displayPlaceDetails()`
- `isOpen()` ahora recibe la fecha actual como parámetro: `hours.isOpen(new Date())`
- Try-catch individual para fotos, reseñas y horarios
- Fallbacks apropiados cuando los datos no están disponibles

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, tablet, móvil
- **Geolocalización**: Requiere HTTPS en producción

## 🤝 Contribuciones

Este es un proyecto de demostración. Las mejoras y sugerencias son bienvenidas:

1. Fork del proyecto
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 📞 Soporte

Para preguntas o problemas:
- Revisa la documentación de Google Maps API
- Consulta los ejemplos oficiales
- Verifica la consola del navegador para errores

---

**Nota**: Este demo está diseñado para fines educativos y de demostración. En producción, implementa las mejores prácticas de seguridad y optimización de costos de API.