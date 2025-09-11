# 🗺️ Markers e InfoWindows - Google Maps Avanzado

Una aplicación web interactiva que demuestra el uso avanzado de Google Maps con markers personalizados, InfoWindows con imágenes y un sidebar de navegación elegante.

## ✨ Características

### 🎯 **Markers Interactivos**
- **4 ubicaciones diferentes** en León, Guanajuato
- **Íconos personalizados** por tipo de lugar:
  - 🍽️ Restaurante (rojo)
  - 🌳 Parque (verde) 
  - 🏛️ Museo (azul)
  - 🛍️ Centro comercial (naranja)

### 🎭 **Animaciones Únicas**
- **Restaurante & Centro Comercial:** Animación de rebote
- **Parque:** Animación de caída
- **Museo:** Animación personalizada de rotación (360°)
- **Efectos de click:** Animaciones específicas para cada tipo

### 🖼️ **InfoWindows Avanzados**
- **Imágenes de alta calidad** de Unsplash
- **Información detallada:** Dirección, teléfono, horarios, calificaciones
- **Efectos hover** en las imágenes
- **Diseño responsive** y profesional

### 🎨 **Sidebar de Navegación**
- **Botones interactivos** con efectos glassmorphism
- **Navegación directa** a cada ubicación
- **Resaltado visual** del botón activo
- **Panel de instrucciones** integrado

### 📱 **Diseño Responsive**
- **Desktop:** Layout con sidebar lateral
- **Mobile:** Sidebar superior con scroll horizontal
- **Adaptación automática** de tamaños y espaciados

## 🚀 Instalación

1. **Clona el repositorio:**
```bash
git clone [url-del-repositorio]
cd marker-infowindow
```

2. **Instala las dependencias:**
```bash
npm install
```

## 🎮 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

La aplicación se ejecutará en `http://localhost:3000`

## 🎯 Cómo Usar

### **Navegación por Botones:**
1. Haz click en cualquier botón del sidebar
2. El mapa se centrará automáticamente en la ubicación
3. Se abrirá el InfoWindow con información detallada
4. El botón se resaltará por 3 segundos

### **Navegación por Mapa:**
1. Haz click directamente en cualquier marker del mapa
2. Se abrirá el InfoWindow correspondiente
3. Se aplicará la animación específica del marker

## 📁 Estructura del Proyecto

```
marker-infowindow/
├── index.html          # Página principal con sidebar
├── index.js           # Lógica del mapa y funcionalidades
├── style.css          # Estilos CSS y animaciones
├── server.js          # Servidor Express
├── package.json       # Configuración del proyecto
└── readme.md          # Documentación
```

## 🛠️ Tecnologías Utilizadas

- **Google Maps JavaScript API**
- **HTML5 & CSS3**
- **JavaScript ES6+**
- **Node.js & Express**
- **Unsplash API** (para imágenes)

## 🎨 Características Técnicas

### **JavaScript:**
- Uso de `google.maps.importLibrary()`
- Manejo de eventos de markers
- Animaciones personalizadas con `setInterval`
- Funciones globales para interacción con botones

### **CSS:**
- Flexbox para layout responsive
- Gradientes y efectos de vidrio (glassmorphism)
- Animaciones CSS con `@keyframes`
- Media queries para responsive design

### **HTML:**
- Estructura semántica
- Atributos `data-*` para identificación
- Integración con Google Maps API

## 🔧 Configuración

### **API Key de Google Maps:**
Asegúrate de tener una API key válida en el archivo `index.html`:
```html
<script>
  // Reemplaza con tu API key
  ({key: "TU_API_KEY_AQUI", v: "weekly"});
</script>
```

## 📱 Responsive Design

- **Desktop (≥768px):** Sidebar lateral de 350px
- **Mobile (<768px):** Sidebar superior con scroll horizontal
- **InfoWindows:** Se adaptan automáticamente al tamaño de pantalla

## 🎯 Ubicaciones Incluidas

1. **🍽️ Restaurante El Buen Sabor**
   - Comida mexicana tradicional
   - Horario: Lun-Dom 8:00 AM - 10:00 PM
   - Calificación: 4.5 ⭐

2. **🌳 Parque Principal de León**
   - Área verde del centro histórico
   - Horario: 24 horas
   - Ideal para caminar y relajarse

3. **🏛️ Museo de Arte Contemporáneo**
   - Exposiciones de arte moderno
   - Horario: Mar-Dom 10:00 AM - 6:00 PM
   - Entrada: $50 MXN

4. **🛍️ Plaza del Sol**
   - Centro comercial moderno
   - Horario: Lun-Dom 10:00 AM - 9:00 PM
   - Más de 200 tiendas

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la aplicación:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Disfruta explorando León, Guanajuato con esta aplicación interactiva!** 🎉
