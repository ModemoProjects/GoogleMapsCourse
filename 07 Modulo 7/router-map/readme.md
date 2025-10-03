# Planificador de Rutas - Google Maps

Una aplicación web completa para optimización de rutas usando Google Maps JavaScript API y servicios de Google (Places, Geocoding, Directions, Distance Matrix).

## Características

### 🗺️ Funcionalidades Principales
- **Carga de ubicaciones**: Soporte para archivos JSON o entrada manual
- **Geocodificación**: Conversión de direcciones a coordenadas
- **Optimización de rutas**: Algoritmo heurístico para asignación de agentes
- **Visualización**: Mapa interactivo con marcadores y rutas colorizadas
- **Exportación**: Descarga de rutas optimizadas en formato JSON

### 🚀 Servicios de Google Maps Utilizados
- **Maps JavaScript API**: Visualización del mapa
- **Geocoding API**: Conversión de direcciones
- **Places API**: Información de lugares
- **Directions API**: Cálculo de rutas
- **Distance Matrix API**: Matrices de distancias y tiempos

### 🎯 Algoritmo de Optimización
- **Pre-clustering**: Distribución inicial de puntos por agente
- **Nearest Neighbor**: Optimización del orden de visitas
- **Restricciones de tiempo**: Respeto de horas de trabajo por agente
- **Consideración de tráfico**: Opción para usar datos de tráfico en tiempo real

## Instalación y Uso

### Requisitos
- Navegador web moderno con soporte para ES6+
- Conexión a internet para servicios de Google Maps
- API Key de Google Maps (ya incluida en el proyecto)

### Ejecución
1. **Servidor local**:
   ```bash
   npm start
   ```
   Abre http://localhost:3000 en tu navegador

2. **Archivo directo**:
   Abre `index.html` directamente en tu navegador

### Uso Paso a Paso

#### 1. Cargar Ubicaciones
- **Opción A**: Sube un archivo JSON con el formato especificado
- **Opción B**: Pega el JSON directamente en el textarea
- **Formato requerido**:
  ```json
  [
    {
      "lat": 19.4326,
      "lng": -99.1332,
      "direccion": "Dirección completa",
      "estado": "Verificada"
    }
  ]
  ```

#### 2. Establecer Ubicación Inicial
- Ingresa una dirección (ej: "Ciudad de México")
- O coordenadas (ej: "19.4326,-99.1332")
- El marcador azul indica el punto de partida

#### 3. Configurar Parámetros
- **Agentes**: Número de agentes disponibles (1-10)
- **Horas de trabajo**: Tiempo máximo por agente
- **Modo de viaje**: Coche, caminando, bicicleta, transporte público
- **Tráfico actual**: Considerar condiciones de tráfico (solo para coche)

#### 4. Generar Rutas
- Haz clic en "Generar Rutas"
- El sistema optimizará automáticamente las asignaciones
- Cada agente tendrá una ruta con color único

#### 5. Visualizar y Controlar
- **Toggle de rutas**: Mostrar/ocultar rutas individuales
- **Centrar**: Enfocar en rutas específicas
- **Resumen**: Estadísticas de eficiencia

#### 6. Exportar Resultados
- Descarga el JSON con todas las rutas generadas
- Incluye información detallada de cada agente

## Formato de Exportación

```json
[
  {
    "agente": 1,
    "color": "#FF6B6B",
    "modo": "DRIVING",
    "duracion_prevista_seg": 7200,
    "distancia_m": 15000,
    "paradas": [
      {
        "lat": 19.4326,
        "lng": -99.1332,
        "direccion": "Dirección",
        "orden": 1
      }
    ]
  }
]
```

## Archivos del Proyecto

- `index.html`: Estructura principal de la aplicación
- `index.js`: Lógica JavaScript completa
- `style.css`: Estilos responsive y modernos
- `ejemplo-ubicaciones.json`: Archivo de ejemplo para pruebas
- `server.js`: Servidor Express para desarrollo local

## Consideraciones Técnicas

### Limitaciones
- **Waypoints**: Máximo ~23 por ruta (límite de Google Directions API)
- **Optimización**: Algoritmo heurístico, no solución óptima exacta
- **Concurrencia**: Controlada para evitar límites de API

### Rendimiento
- **Cache**: Evita llamadas repetidas a la API
- **Progreso**: Indicadores visuales durante procesamiento
- **Manejo de errores**: Recuperación automática de fallos

### Seguridad
- **API Key**: Restringida por HTTP referrers
- **Validación**: Estructura de datos verificada
- **Límites**: Control de concurrencia implementado

## Ejemplo de Uso

1. Carga el archivo `ejemplo-ubicaciones.json`
2. Establece "Ciudad de México" como origen
3. Configura 2 agentes con 8 horas cada uno
4. Selecciona modo "En coche" con tráfico actual
5. Genera las rutas y explora los resultados

## Soporte

Para problemas o mejoras, revisa la consola del navegador para mensajes de error detallados. La aplicación incluye validación completa y manejo de errores robusto.