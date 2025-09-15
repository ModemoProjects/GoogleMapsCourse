# 🗺️ Google Maps Directions Demo - Rutas Avanzadas

Un demo completo de Google Maps JavaScript API que combina DirectionsService, DirectionsRenderer, Places API y funcionalidades avanzadas de rutas.

## 🚀 Funcionalidades Implementadas

### Objetivos Funcionales (Los 3 en el mismo ejemplo)
- ✅ **Ruta más rápida entre ciudades** (ej: CDMX ↔ Guadalajara) con distancia y ETA
- ✅ **Ruta con múltiples paradas** (waypoints) con optimización de orden
- ✅ **ETA dinámica** que se recalcula al arrastrar rutas o cambiar modo de transporte

### Características Técnicas
- ✅ **Google Maps API** configurado con `language=es-419` y `region=MX`
- ✅ **Routes API** (nueva) para tráfico en tiempo real en modo DRIVING
- ✅ **Directions API** (clásica) para modos WALKING, TRANSIT, BICYCLING
- ✅ **Places API** para autocomplete de ciudades mexicanas
- ✅ **Geometry Library** para cálculos adicionales
- ✅ **DirectionsRenderer** con arrastre habilitado

### Funcionalidades Avanzadas
- 🔄 **Rutas alternativas** navegables con `provideRouteAlternatives: true`
- 🎯 **Optimización de waypoints** con `optimizeWaypoints: true`
- 🚗 **Información de tráfico** con `departureTime: now` y `trafficModel`
- 🖱️ **Arrastre de rutas** con recálculo automático de ETA
- 📍 **Autocomplete de ciudades** restringido a México
- 📊 **Métricas detalladas** (distancia, tiempo, costo combustible)
- 📋 **Instrucciones turn-by-turn** en panel lateral
- ⚠️ **Manejo de errores** completo con mensajes claros

## 🛠️ Configuración Requerida

### 1. API Key de Google Maps
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Distance Matrix API (opcional)
   - **Traffic Layer API** (para información de tráfico en tiempo real)
4. Crea una API Key en "APIs & Services > Credentials"

### 2. Restricciones de Seguridad
En Google Cloud Console, configura las restricciones de tu API key:

**Application restrictions:**
- Selecciona "HTTP referrers (web sites)"
- Agrega tu dominio: `localhost:3000/*`, `tu-dominio.com/*`

**API restrictions:**
- Selecciona "Restrict key"
- Habilita solo las APIs necesarias (Maps, Directions, Places)

### 3. Configuración del Código
1. Abre `index.html`
2. Busca la línea: `const GOOGLE_MAPS_API_KEY = "TU_API_KEY_AQUI";`
3. Reemplaza `"TU_API_KEY_AQUI"` con tu clave de API real

## 🚀 Instalación y Uso

### Opción 1: Servidor Local (Recomendado)
```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Abrir en navegador
# http://localhost:3000
```

### Opción 2: Servidor Simple
```bash
# Usar Python (si está instalado)
python -m http.server 8000

# O usar Node.js
npx http-server

# Abrir en navegador
# http://localhost:8000
```

## 📱 Cómo Usar el Demo

### 1. Configurar Ruta Básica
- Ingresa ciudad de **origen** (ej: "Ciudad de México")
- Ingresa ciudad de **destino** (ej: "Guadalajara")
- Haz clic en **"Calcular Ruta"**

### 2. Agregar Paradas Intermedias
- Haz clic en **"+ Agregar Parada"**
- Ingresa ciudades intermedias
- Activa **"Optimizar orden de paradas"** para mejor ruta

### 3. Configurar Opciones
- **Modo de viaje**: Conducir, Caminar, Transporte público, Bicicleta
- **Evitar peajes**: Evita carreteras con peaje
- **Evitar autopistas**: Usa rutas locales
- **Configuración de combustible**: Eficiencia y precio por litro

### 4. Explorar Rutas Alternativas
- Haz clic en **"Ver Alternativas"**
- Selecciona diferentes rutas para comparar
- Cada ruta muestra distancia, tiempo y tiempo con tráfico

### 5. Arrastrar Rutas
- Arrastra la línea azul en el mapa para modificar la ruta
- El ETA se recalcula automáticamente
- Las instrucciones se actualizan en tiempo real

## 🔧 Características Técnicas Detalladas

### Parámetros de DirectionsService
```javascript
const request = {
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING',
    provideRouteAlternatives: true,    // Rutas alternativas
    optimizeWaypoints: true,           // Optimizar orden de paradas
    avoidTolls: false,                 // Evitar peajes
    avoidHighways: false,              // Evitar autopistas
    departureTime: new Date(),         // Hora actual para tráfico
    trafficModel: 'best_guess',        // Modelo de tráfico
    language: 'es-419',               // Español México
    region: 'MX'                      // Región México
};
```

### DirectionsRenderer con Arrastre
```javascript
directionsRenderer = new DirectionsRenderer({
    map: map,
    draggable: true,                   // Habilita arrastre
    suppressMarkers: false,            // Mostrar marcadores
    polylineOptions: {
        strokeColor: '#3498db',        // Color de la línea
        strokeWeight: 4,               // Grosor
        strokeOpacity: 0.8             // Opacidad
    }
});
```

### Autocomplete de Ciudades
```javascript
const autocompleteOptions = {
    types: ['(cities)'],               // Solo ciudades
    componentRestrictions: { country: 'mx' }, // Solo México
    fields: ['place_id', 'geometry', 'name', 'formatted_address']
};
```

## 🎨 Personalización

### Colores y Estilos
Los colores principales se pueden cambiar en `style.css`:
- **Azul principal**: `#3498db`
- **Gradiente de fondo**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Color de ruta**: `#3498db`

### Configuración del Mapa
Modifica `MAP_CONFIG` en `index.js`:
```javascript
const MAP_CONFIG = {
    center: { lat: 19.4326, lng: -99.1332 }, // Centro del mapa
    zoom: 6,                                  // Nivel de zoom inicial
    language: 'es-419',                       // Idioma
    region: 'MX'                             // Región
};
```

## 🐛 Solución de Problemas

### Error: "API key not valid"
- Verifica que la API key esté correctamente configurada
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console
- Verifica las restricciones de dominio

### Error: "Quota exceeded"
- Has excedido el límite de consultas
- Espera o actualiza tu plan de facturación
- Considera implementar caché para consultas repetidas

### Error: "ZERO_RESULTS"
- No se encontró ruta entre los puntos especificados
- Verifica que las ciudades existan
- Intenta con puntos más específicos

### Autocomplete no funciona
- Verifica que Places API esté habilitada
- Asegúrate de que la API key tenga permisos para Places API
- Verifica las restricciones de la API key

### Información de tráfico no aparece
- **NUEVO**: El demo ahora usa **Routes API** para tráfico en tiempo real
- Habilita **Routes API** en Google Cloud Console (además de Directions API)
- Verifica que tu API key tenga permisos para Routes API
- El modo DRIVING ahora usa Routes API automáticamente para tráfico
- Algunos países/regiones tienen limitaciones en los datos de tráfico

## 📊 Límites y Consideraciones

### Límites de Google Maps
- **Máximo 8 waypoints** por solicitud
- **Máximo 25 waypoints** por día (gratuito)
- **Límite de consultas** según tu plan

### Optimización de Rendimiento
- Implementa debounce para autocomplete
- Usa caché para consultas repetidas
- Limita la frecuencia de recálculos

## 🔒 Seguridad

### Protección de API Key
- **NUNCA** expongas tu API key en repositorios públicos
- Usa restricciones de dominio en Google Cloud Console
- Considera usar variables de entorno para producción
- Implementa rate limiting en tu servidor

### Mejores Prácticas
- Monitorea el uso de tu API key
- Implementa logs de errores
- Usa HTTPS en producción
- Valida inputs del usuario

## 📝 Notas de Desarrollo

### Comentarios en el Código
El código incluye comentarios detallados explicando:
- Uso de `optimizeWaypoints`
- Implementación de `trafficModel`
- Configuración de `departureTime`
- Manejo de `provideRouteAlternatives`
- Funcionalidad de `draggable`

### Estructura del Proyecto
```
directions-map/
├── index.html          # Estructura HTML principal
├── style.css           # Estilos CSS modernos y responsive
├── index.js            # Lógica JavaScript completa
├── package.json        # Dependencias de Node.js
├── server.js           # Servidor Express simple
└── readme.md           # Este archivo
```

## 🤝 Contribuciones

Si encuentras bugs o quieres agregar funcionalidades:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Implementa los cambios
4. Envía un pull request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¡Disfruta explorando las rutas de México con Google Maps! 🇲🇽**