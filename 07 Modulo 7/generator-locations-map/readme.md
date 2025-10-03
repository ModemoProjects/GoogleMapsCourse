# Generador de Ubicaciones Verificadas

Una aplicación web completa para generar ubicaciones aleatorias con direcciones completas verificadas usando las APIs de Google Maps.

## 🚀 Características

- **Generación de coordenadas aleatorias** dentro de áreas definidas
- **Verificación de direcciones completas** mediante reverse geocoding
- **Validación estricta** de componentes de dirección requeridos
- **Carga diferida del mapa** para optimizar rendimiento
- **Procesamiento en lotes** con límite de concurrencia configurable
- **Manejo robusto de errores** con reintentos y backoff exponencial
- **Exportación a JSON** de resultados verificados
- **Panel de estado en tiempo real** con métricas de búsqueda
- **Interfaz moderna y responsiva** con diseño profesional

## 📋 Requisitos

- **Google APIs habilitadas:**
  - Maps JavaScript API
  - Geocoding API
  - Places API (opcional)
- **API Key de Google Maps** con restricciones de seguridad configuradas
- **Navegador web moderno** con soporte para ES6+

## 🛠️ Instalación y Configuración

### 1. Configurar API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (opcional)
4. Crea una API Key en "Credenciales"
5. Configura restricciones de seguridad:
   - **Restricción de aplicación:** HTTP referrers (sitios web)
   - **Restricciones de API:** Solo las APIs requeridas

### 2. Configurar la aplicación

1. Abre `index.html` en un editor
2. Reemplaza la API Key en la línea 125:
   ```html
   ({key: "TU_API_KEY_AQUI", v: "weekly", libraries: ["places", "geometry"]});
   ```

### 3. Ejecutar la aplicación

**Opción 1: Servidor local (recomendado)**
```bash
npm install
npm start
```
Luego visita: `http://localhost:3000`

**Opción 2: Archivo directo**
Abre `index.html` directamente en el navegador (puede tener limitaciones de CORS)

## 🎯 Uso de la aplicación

### 1. Configurar búsqueda
- **Número de ubicaciones:** Ingresa cuántas ubicaciones verificadas deseas (1-100)
- **Área de búsqueda:** Selecciona una ciudad predefinida (Ciudad de México, Guadalajara, Monterrey, León) o configura un área personalizada

### 2. Iniciar búsqueda
- Haz clic en **"Buscar ubicaciones verificadas"**
- El mapa se cargará automáticamente
- Observa el progreso en tiempo real en el panel de estado

### 3. Revisar resultados
- **Lista de resultados:** Muestra todas las ubicaciones verificadas con detalles completos
- **Mapa interactivo:** Visualiza las ubicaciones con marcadores numerados
- **Panel de estado:** Monitorea llamadas API, verificaciones exitosas y tiempo promedio

### 4. Exportar datos
- Haz clic en **"Exportar JSON"** para descargar los resultados
- El archivo incluye coordenadas, direcciones completas y componentes validados

## 📊 Estructura del JSON exportado

```json
[
  {
    "lat": 19.4326,
    "lng": -99.1332,
    "direccion": "Calle Ejemplo 123, Colonia, Ciudad, Estado, CP, México",
    "componentes": {
      "street_number": "123",
      "route": "Calle Ejemplo",
      "locality": "Ciudad",
      "administrative_area_level_1": "Estado",
      "country": "MX",
      "postal_code": "00000"
    },
    "estado": "Verificada"
  }
]
```

## ⚙️ Configuración avanzada

### Parámetros de concurrencia
En `index.js`, línea 35-40:
```javascript
const CONFIG = {
    MAX_CONCURRENT_REQUESTS: 3,    // Llamadas simultáneas
    MAX_RETRIES: 3,                // Reintentos por fallo
    RETRY_DELAY_BASE: 1000,        // Delay base en ms
    MAX_ATTEMPTS_PER_LOCATION: 10  // Intentos máximos por ubicación
};
```

### Áreas predefinidas
En `index.js`, línea 15-32:
```javascript
const AREAS_CONFIG = {
    'mexico-city': {
        center: { lat: 19.4326, lng: -99.1332 },
        radius: 15
    },
    'guadalajara': {
        center: { lat: 20.6597, lng: -103.3496 },
        radius: 12
    },
    'monterrey': {
        center: { lat: 25.6866, lng: -100.3161 },
        radius: 10
    },
    'leon': {
        center: { lat: 21.1230729, lng: -101.6650775 },
        radius: 12
    }
};
```

## 🔒 Consideraciones de seguridad

### Restricciones de API Key
- **HTTP Referrers:** Configura dominios específicos donde se puede usar la API
- **Restricciones de API:** Habilita solo las APIs necesarias
- **Cuotas:** Establece límites diarios para evitar costos inesperados

### Límites de uso
- **Rate Limiting:** La aplicación implementa límites de concurrencia automáticos
- **Cache:** Evita consultas repetidas para la misma coordenada
- **Backoff exponencial:** Maneja errores 429 (Too Many Requests) automáticamente

### Recomendaciones para producción
- **Backend proxy:** Para cargas masivas, considera mover el reverse geocoding a un servicio backend
- **Monitoreo:** Implementa logging y monitoreo de uso de APIs
- **Validación:** Agrega validación adicional de entrada en el servidor

## 🚨 Solución de problemas

### Error: "Geocoding failed: OVER_QUERY_LIMIT"
- **Causa:** Excediste la cuota diaria de la API
- **Solución:** Espera hasta el siguiente día o aumenta la cuota en Google Cloud Console

### Error: "Error al cargar el mapa de Google Maps"
- **Causa:** API Key inválida o restricciones muy estrictas
- **Solución:** Verifica la API Key y las restricciones de HTTP referrers

### Pocas ubicaciones verificadas encontradas
- **Causa:** Área muy pequeña o rural
- **Solución:** Aumenta el radio de búsqueda o cambia a un área más urbana

### Búsqueda muy lenta
- **Causa:** Muchas ubicaciones o área muy grande
- **Solución:** Reduce el número de ubicaciones o el radio de búsqueda

## 📈 Optimizaciones implementadas

- **Carga diferida:** El mapa solo se carga cuando se inicia la búsqueda
- **Procesamiento en lotes:** Máximo 3 llamadas simultáneas para evitar rate limiting
- **Cache inteligente:** Evita consultas repetidas para coordenadas similares
- **Validación eficiente:** Solo procesa ubicaciones con direcciones completas
- **UI responsiva:** Funciona en dispositivos móviles y escritorio

## 🤝 Contribuciones

Este proyecto está diseñado como una demostración completa de integración con Google Maps APIs. Las mejoras sugeridas incluyen:

- Soporte para más tipos de áreas (polígonos personalizados)
- Integración con Places API para mayor precisión
- Modo offline con datos cacheados
- Exportación a otros formatos (CSV, KML)
- Integración con bases de datos para almacenamiento persistente

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Nota importante:** Esta aplicación utiliza las APIs de Google Maps que tienen costos asociados. Asegúrate de configurar límites de cuota apropiados en Google Cloud Console para evitar cargos inesperados.