# 🏙️ Cambio de Ubicación por Defecto a León, Guanajuato

## ✅ **Cambios Realizados:**

### 📍 **Coordenadas Actualizadas:**
- **Anterior**: Ciudad de México (19.4326, -99.1332)
- **Nuevo**: León, Guanajuato (21.1224, -101.6866)

### 🔧 **Archivos Modificados:**

#### 1. **`lib/screens/address_demo_screen.dart`**
```dart
// Coordenadas por defecto (León, Guanajuato)
double _userLatitude = 21.1224;
double _userLongitude = -101.6866;
```

#### 2. **`lib/widgets/map_widget.dart`**
- **Fallback de coordenadas**: Actualizado a León, Gto
- **Botón "Mi Ubicación"**: Ahora simula ubicación en León
- **Posición inicial del mapa**: Centrado en León, Gto

#### 3. **`README.md`**
- Actualizado para mencionar sesgo por ubicación en León, Guanajuato

#### 4. **`EJEMPLO_USO.md`**
- Agregada sección para cambiar ubicación por defecto
- Actualizados ejemplos de búsqueda con calles de León
- Ejemplos más relevantes para la región

## 🎯 **Beneficios del Cambio:**

### **Mejor Experiencia Local:**
- **Sesgo geográfico**: Las búsquedas se sesgan hacia León y alrededores
- **Sugerencias relevantes**: Mejores resultados para usuarios en Guanajuato
- **Mapa centrado**: Vista inicial enfocada en la región correcta

### **Coordenadas Precisas:**
- **Latitud**: 21.1224° N
- **Longitud**: -101.6866° W
- **Ubicación**: Centro de León, Guanajuato, México

## 🚀 **Funcionalidades Afectadas:**

### **1. Autocompletado:**
- Las sugerencias ahora se sesgan hacia León y alrededores
- Mejores resultados para calles y lugares locales

### **2. Mapa Inicial:**
- Se abre centrado en León, Guanajuato
- Zoom apropiado para la ciudad

### **3. Botón "Mi Ubicación":**
- Simula ubicación en León (en modo demo)
- En producción, obtendría la ubicación real del usuario

### **4. Fallback de Coordenadas:**
- Si no hay coordenadas disponibles, usa León como fallback

## 📱 **Para Probar:**

1. **Ejecuta la aplicación**: `flutter run`
2. **Observa el mapa**: Debe abrirse centrado en León, Gto
3. **Busca direcciones**: Prueba con calles de León como:
   - "Blvd. López Mateos"
   - "Av. Universidad"
   - "Centro de León"
4. **Verifica el sesgo**: Las sugerencias deben priorizar León

## 🔧 **Personalización Adicional:**

### **Cambiar a Otra Ciudad:**
```dart
// En lib/screens/address_demo_screen.dart
double _userLatitude = 20.6597;  // Guadalajara
double _userLongitude = -103.3496;

// En lib/widgets/map_widget.dart
const myLocation = LatLng(20.6597, -103.3496);  // Guadalajara
```

### **Coordenadas de Otras Ciudades Mexicanas:**
- **Monterrey**: 25.6866, -100.3161
- **Guadalajara**: 20.6597, -103.3496
- **Puebla**: 19.0414, -98.2063
- **Tijuana**: 32.5149, -117.0382

## 📊 **Impacto en el Rendimiento:**

- **Sin impacto negativo**: Solo cambia coordenadas por defecto
- **Mejor relevancia**: Sugerencias más precisas para la región
- **UX mejorada**: Experiencia más local y relevante

El cambio de ubicación por defecto a León, Guanajuato mejora significativamente la experiencia del usuario para usuarios en esa región, proporcionando sugerencias más relevantes y un mapa centrado en la ubicación correcta.
