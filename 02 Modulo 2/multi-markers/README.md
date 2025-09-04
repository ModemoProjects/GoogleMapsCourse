# 🗺️ Multi-Markers Map Generator

Una aplicación web interactiva que genera múltiples marcadores aleatorios en Google Maps con información detallada y visualización profesional.

## ✨ Características

- **Generación de marcadores aleatorios**: Crea automáticamente múltiples marcadores en un radio específico
- **Iconos coloridos**: Utiliza 16 iconos predefinidos de Google Maps con diferentes colores y estilos
- **Información detallada**: Cada marcador muestra coordenadas, distancia del centro y color del icono
- **Interactividad**: Click en cualquier marcador para ver su información completa
- **Cálculos precisos**: Distancia real entre puntos usando la fórmula de Haversine
- **Distribución uniforme**: Algoritmo optimizado para distribución aleatoria dentro del radio

## 🚀 Tecnologías

- **TypeScript** - Tipado estático para JavaScript
- **Google Maps JavaScript API** - Visualización de mapas
- **Vite** - Herramienta de construcción rápida
- **HTML5 & CSS3** - Interfaz moderna y responsiva

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd multi-markers
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura tu API Key de Google Maps en `index.html`:
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=initMap"></script>
```

## 🎯 Uso

### Desarrollo
```bash
npm start
# o
npm run dev
```

### Producción
```bash
npm run build
```

### Vista previa
```bash
npm run preview
```

## ⚙️ Configuración

El proyecto está configurado para generar 10 marcadores en un radio de 15km alrededor de las coordenadas de León, Guanajuato, México. Puedes modificar estos valores en `index.ts`:

```typescript
// Línea 11: Cambiar cantidad de marcadores y radio
generateRandomMarkers(map, { lat: 21.1230729, lng: -101.6650775 }, 10, 15000);
```

## 🎨 Personalización

### Cambiar ubicación central
Modifica las coordenadas en la función `initMap()`:
```typescript
center: { lat: TU_LATITUD, lng: TU_LONGITUD }
```

### Ajustar cantidad de marcadores
Cambia el parámetro `count` en la llamada a `generateRandomMarkers()`.

### Modificar radio de distribución
Ajusta el parámetro `radiusKm` para cambiar el área de distribución.

## 📊 Funcionalidades Técnicas

- **Distribución aleatoria uniforme**: Los marcadores se distribuyen de manera uniforme dentro del radio especificado
- **Cálculo de distancias**: Implementación de la fórmula de Haversine para cálculos precisos
- **InfoWindows dinámicos**: Información generada dinámicamente para cada marcador
- **Iconos aleatorios**: Selección aleatoria de 16 iconos diferentes de Google Maps

## 🔧 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run dev` - Alias para el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm test` - Verificación de tipos TypeScript

**Desarrollado con ❤️ usando Google Maps JavaScript API y TypeScript**
