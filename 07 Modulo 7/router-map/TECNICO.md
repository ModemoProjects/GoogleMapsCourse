# Documentación Técnica - Planificador de Rutas

## Problema Resuelto: InvalidValueError: unknown property departureTime

### Descripción del Problema
El error `InvalidValueError: unknown property departureTime` ocurría porque se intentaba usar la propiedad `departureTime` en el `DistanceMatrixService`, pero esta propiedad solo es válida para el `DirectionsService`.

### Solución Implementada

#### 1. Separación de Servicios
- **DistanceMatrixService**: Se usa para la optimización inicial (sin tráfico)
- **DirectionsService**: Se usa para las rutas finales (con tráfico si está habilitado)

#### 2. Flujo de Optimización Mejorado
```javascript
// Paso 1: Optimización inicial sin tráfico
const distanceMatrix = await getDistanceMatrix(origin, locations, travelMode, false);

// Paso 2: Optimización del orden de visitas
const optimizedOrder = optimizeVisitOrder(origin, locations, distanceMatrix, maxHours);

// Paso 3: Ruta final con tráfico (si está habilitado)
const route = await getDirectionsRoute(origin, optimizedOrder, travelMode, useTraffic);
```

#### 3. Limitaciones de la API de Google Maps

**DistanceMatrixService:**
- ✅ Calcula distancias y tiempos entre múltiples puntos
- ❌ No soporta `departureTime` (tráfico en tiempo real)
- ✅ Más eficiente para optimización inicial

**DirectionsService:**
- ✅ Soporta `departureTime` y `trafficModel`
- ✅ Proporciona rutas detalladas con tráfico actual
- ❌ Limitado a ~23 waypoints por ruta

### Beneficios de la Solución

1. **Sin Errores**: Elimina el `InvalidValueError`
2. **Mejor Rendimiento**: Optimización inicial más rápida
3. **Tráfico Preciso**: Rutas finales con datos de tráfico actual
4. **Flexibilidad**: Funciona con y sin tráfico

### Código Corregido

```javascript
// DistanceMatrixService - SIN departureTime
const request = {
    origins: [origin],
    destinations: destinations.map(dest => ({ lat: dest.lat, lng: dest.lng })),
    travelMode: travelMode,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
};

// DirectionsService - CON departureTime (si está habilitado)
if (useTraffic && travelMode === 'DRIVING') {
    request.departureTime = new Date();
    request.trafficModel = google.maps.TrafficModel.BEST_GUESS;
}
```

### Notas para el Usuario
- El tráfico se aplica solo a las rutas finales, no a la optimización inicial
- Esto es normal y esperado debido a las limitaciones de la API
- Los tiempos mostrados en el resumen reflejan las condiciones de tráfico actual

## Problema Resuelto: MAX_DIMENSIONS_EXCEEDED

### Descripción del Problema
El error `MAX_DIMENSIONS_EXCEEDED` ocurría cuando se intentaba calcular distancias para más de 25 destinos simultáneamente, excediendo el límite de la Distance Matrix API de Google.

### Solución Implementada

#### 1. Procesamiento por Lotes
- **Límite**: Máximo 25 destinos por lote
- **Procesamiento**: División automática en lotes cuando se excede el límite
- **Combinación**: Resultados de todos los lotes se combinan automáticamente

#### 2. Sistema de Retry con Backoff
- **Retry automático**: Hasta 3 intentos para errores OVER_QUERY_LIMIT
- **Backoff exponencial**: Delays incrementales (1s, 2s, 4s)
- **Logging**: Información detallada de reintentos

#### 3. Validación de Entrada
- **Advertencia**: Para más de 100 ubicaciones
- **Recomendación**: Máximo 100 ubicaciones para mejor rendimiento

### Código de Procesamiento por Lotes

```javascript
// Límite de Google Distance Matrix API: máximo 25 destinos por origen
const MAX_DESTINATIONS = 25;

if (destinations.length <= MAX_DESTINATIONS) {
    return await getDistanceMatrixBatch(origin, destinations, travelMode, useTraffic);
} else {
    // Procesar en lotes si hay más de 25 destinos
    const batches = [];
    
    for (let i = 0; i < destinations.length; i += MAX_DESTINATIONS) {
        const batch = destinations.slice(i, i + MAX_DESTINATIONS);
        const batchMatrix = await getDistanceMatrixBatch(origin, batch, travelMode, useTraffic);
        batches.push(batchMatrix);
    }
    
    // Combinar resultados de todos los lotes
    return batches.flat();
}
```

### Beneficios de la Solución

1. **Sin Límites**: Maneja cualquier cantidad de ubicaciones
2. **Robustez**: Sistema de retry automático
3. **Eficiencia**: Cache inteligente por lotes
4. **Transparencia**: Logging detallado del proceso

## Filosofía del Algoritmo: Maximización de Cobertura

### Principio Fundamental
**El objetivo principal es que cada agente cubra la mayor cantidad de puntos posible dentro de las horas asignadas.**

### Características del Algoritmo Mejorado

#### 1. **Clustering Geográfico K-means**
- Algoritmo K-means++ para inicialización inteligente
- Agrupación por proximidad geográfica real
- Balance automático de carga entre agentes
- Visualización con colores y círculos de área

#### 2. **Algoritmo Consecutivo de Vecino Más Cercano**
- Ordena ubicaciones por tiempo desde el origen
- Agrega ubicaciones más cercanas consecutivamente
- Calcula tiempo total (ida + regreso) para cada ubicación
- Para cuando el tiempo se agota

#### 3. **Métricas de Eficiencia**
- **Cobertura**: Porcentaje de ubicaciones visitadas
- **Eficiencia de tiempo**: Aprovechamiento del tiempo disponible
- **Balance de carga**: Distribución equitativa entre agentes

### Algoritmo K-means Geográfico

```javascript
// 1. Inicialización K-means++
function initializeCentroids(locations, k) {
    const centroids = [];
    
    // Primer centroide aleatorio
    const firstIndex = Math.floor(Math.random() * locations.length);
    centroids.push({ lat: locations[firstIndex].lat, lng: locations[firstIndex].lng });
    
    // Seleccionar centroides adicionales usando K-means++
    for (let i = 1; i < k; i++) {
        const distances = locations.map(location => {
            let minDistance = Infinity;
            centroids.forEach(centroid => {
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(location.lat, location.lng),
                    new google.maps.LatLng(centroid.lat, centroid.lng)
                );
                minDistance = Math.min(minDistance, distance);
            });
            return minDistance * minDistance; // Distancia al cuadrado
        });
        
        // Seleccionar ubicación con probabilidad proporcional a la distancia al cuadrado
        const totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
        let randomValue = Math.random() * totalDistance;
        
        for (let j = 0; j < locations.length; j++) {
            randomValue -= distances[j];
            if (randomValue <= 0) {
                centroids.push({ lat: locations[j].lat, lng: locations[j].lng });
                break;
            }
        }
    }
    
    return centroids;
}

// 2. Iteración K-means
while (iteration < maxIterations) {
    // Asignar cada ubicación al centroide más cercano
    clusters = Array(k).fill().map(() => []);
    
    locations.forEach(location => {
        let closestCentroidIndex = 0;
        let minDistance = Infinity;
        
        centroids.forEach((centroid, index) => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(location.lat, location.lng),
                new google.maps.LatLng(centroid.lat, centroid.lng)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestCentroidIndex = index;
            }
        });
        
        clusters[closestCentroidIndex].push(location);
    });
    
    // Calcular nuevos centroides
    const newCentroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[clusters.indexOf(cluster)];
        
        const avgLat = cluster.reduce((sum, loc) => sum + loc.lat, 0) / cluster.length;
        const avgLng = cluster.reduce((sum, loc) => sum + loc.lng, 0) / cluster.length;
        
        return { lat: avgLat, lng: avgLng };
    });
    
    // Verificar convergencia
    let converged = true;
    for (let i = 0; i < k; i++) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(centroids[i].lat, centroids[i].lng),
            new google.maps.LatLng(newCentroids[i].lat, newCentroids[i].lng)
        );
        
        if (distance > 100) { // 100 metros de tolerancia
            converged = false;
            break;
        }
    }
    
    if (converged) break;
    
    centroids = newCentroids;
    iteration++;
}
```

### Ventajas del Clustering Geográfico

1. **Proximidad Real**: Agrupa ubicaciones geográficamente cercanas
2. **Eficiencia Territorial**: Cada agente trabaja en una región específica
3. **Visualización Clara**: Colores y círculos muestran las áreas de trabajo
4. **Balance Inteligente**: Evita clusters vacíos o sobrecargados
5. **Convergencia Rápida**: K-means++ converge en pocas iteraciones
6. **Visualización por Agente**: Permite ver las regiones de trabajo individuales
7. **Clusters Individuales**: Botones en la lista de rutas para mostrar/ocultar clusters específicos

## Manejo de Errores y Sugerencias Inteligentes

### Problema Resuelto: "No se pudo crear ruta dentro del tiempo límite"

#### Descripción del Problema
El warning "Agente X: No se pudo crear ruta dentro del tiempo límite" ocurría cuando:
- Las ubicaciones asignadas a un agente estaban muy lejanas
- El tiempo de trabajo era insuficiente
- El número de agentes era excesivo para las ubicaciones disponibles

#### Solución Implementada

##### 1. **Sistema de Rutas de Respaldo**
- **Estrategia 1**: Solo ubicaciones más cercanas
- **Estrategia 2**: Solo la ubicación más cercana
- **Estrategia 3**: Estimación optimista del tiempo de regreso

##### 2. **Validación de Clusters**
- Detecta clusters vacíos o sobrecargados
- Advierte sobre distribuciones problemáticas
- Sugiere ajustes en el número de agentes

##### 3. **Sugerencias Inteligentes**
- Análisis automático de problemas
- Recomendaciones específicas basadas en la situación
- Sugerencias de parámetros optimizados

### Código de Rutas de Respaldo

```javascript
function createFallbackRoute(origin, locations, distanceMatrix, maxHours) {
    const maxDurationSeconds = maxHours * 3600;
    
    // Estrategia 1: Solo las ubicaciones más cercanas
    const sortedLocations = locations.map((location, index) => ({
        location,
        index,
        duration: distanceMatrix[index].duration
    })).sort((a, b) => a.duration - b.duration);
    
    const fallbackRoute = [];
    let totalDuration = 0;
    
    // Agregar ubicaciones una por una hasta que no quepa más tiempo
    for (const { location, duration } of sortedLocations) {
        const returnTime = estimateReturnTime(location, origin);
        
        if (totalDuration + duration + returnTime <= maxDurationSeconds) {
            fallbackRoute.push(location);
            totalDuration += duration;
        } else {
            break;
        }
    }
    
    // Si aún no hay ubicaciones, usar estimación optimista
    if (fallbackRoute.length === 0) {
        const closestLocation = sortedLocations[0];
        const optimisticReturnTime = estimateReturnTime(closestLocation.location, origin) * 0.7;
        
        if (closestLocation.duration + optimisticReturnTime <= maxDurationSeconds) {
            fallbackRoute.push(closestLocation.location);
        }
    }
    
    return fallbackRoute;
}
```

### Sistema de Sugerencias

```javascript
function showSuggestions(totalAgents, successfulRoutes, workHours) {
    const suggestions = [];
    
    if (workHours < 6) {
        suggestions.push(`• Aumentar las horas de trabajo (actual: ${workHours}h, sugerido: 6-8h)`);
    }
    
    if (totalAgents > successfulRoutes * 1.5) {
        suggestions.push(`• Reducir el número de agentes (actual: ${totalAgents}, sugerido: ${Math.floor(successfulRoutes * 1.2)})`);
    }
    
    if (appState.locations.length > totalAgents * 8) {
        suggestions.push(`• Considerar reducir el número de ubicaciones o aumentar agentes`);
    }
    
    suggestions.push(`• Verificar que el origen esté cerca de las ubicaciones`);
    suggestions.push(`• Probar con modo de viaje diferente`);
}
```

### Beneficios de las Mejoras

1. **Robustez**: Maneja casos extremos sin fallar completamente
2. **Inteligencia**: Proporciona sugerencias específicas y útiles
3. **Transparencia**: Explica claramente qué está pasando
4. **Flexibilidad**: Se adapta a diferentes escenarios problemáticos
