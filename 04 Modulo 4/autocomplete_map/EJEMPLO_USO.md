# Ejemplo de Uso del Demo

## 🎯 Flujos Principales

### Flujo A: Autocompletado → Place Details
1. **Escribe** en el campo "Dirección" (ej: "Blvd. López Mateos")
2. **Espera** las sugerencias que aparecen en el overlay
3. **Selecciona** una sugerencia de la lista
4. **Observa** cómo se llenan automáticamente los campos del formulario
5. **Verifica** que el mapa se centra en la ubicación seleccionada

### Flujo B: Búsqueda Directa
1. **Escribe** una dirección completa (ej: "Blvd. López Mateos 123, León, Gto")
2. **Presiona** el botón "Buscar"
3. **Observa** cómo se realiza geocoding directo
4. **Verifica** que los campos se llenan con los resultados

### Flujo C: Tap en Mapa
1. **Toca** cualquier punto en el mapa
2. **Observa** cómo aparece un marcador en la ubicación
3. **Verifica** que se realiza reverse geocoding
4. **Observa** cómo se actualizan los campos del formulario

### Flujo D: Limpiar Todo
1. **Presiona** el botón "Limpiar" o el ícono de limpiar
2. **Observa** cómo se resetea el formulario
3. **Verifica** que se genera un nuevo session token
4. **Observa** cómo se limpia el estado del mapa

## ⚙️ Configuración Avanzada

### Cambiar País de Restricción
En la interfaz, usa el switch "Restringir a México" para:
- **Activado**: Solo mostrar resultados de México
- **Desactivado**: Mostrar resultados de todo el mundo

### Generar Nueva Sesión
- **Presiona** el botón de refresh en la barra superior
- **Observa** cómo se genera un nuevo session token
- **Útil** para reiniciar el contexto de búsqueda

### Modo Claro/Oscuro
- **Cambia** el tema del sistema
- **Observa** cómo la aplicación se adapta automáticamente
- **Verifica** que todos los componentes mantienen la legibilidad

## 🔍 Validación de Direcciones

### Indicadores Visuales
- **Verde**: Dirección completa y válida
- **Naranja**: Faltan campos obligatorios
- **Rojo**: Error en la búsqueda

### Campos Obligatorios
- Calle o número
- Ciudad
- Estado
- País

### Campos Opcionales
- Número de calle
- Colonia
- Código postal

## 📊 Analítica en Consola

Observa en la consola del desarrollador:
- **Tiempo de respuesta** de las APIs
- **Número de sugerencias** encontradas
- **Errores** y fallbacks
- **Uso de session tokens**

## 🎨 Personalización

### Cambiar Idioma
Modifica en `lib/main.dart`:
```dart
locale: const Locale('es', 'MX'), // Cambia por el idioma deseado
```

### Cambiar País de Restricción
Modifica en `lib/screens/address_demo_screen.dart`:
```dart
region: 'MX', // Cambia por el código de país deseado
```

### Cambiar Ubicación por Defecto
Modifica en `lib/screens/address_demo_screen.dart`:
```dart
// Coordenadas por defecto (León, Guanajuato)
double _userLatitude = 21.1224;
double _userLongitude = -101.6866;
```

### Ajustar Debounce
Modifica en `lib/widgets/address_autocomplete.dart`:
```dart
Timer(const Duration(milliseconds: 300), () { // Cambia el tiempo
```

## 🐛 Solución de Problemas Comunes

### No aparecen sugerencias
- Verifica que la API key esté configurada
- Asegúrate de que Places API esté habilitada
- Verifica las restricciones de la API key

### Error al seleccionar sugerencia
- Verifica que Place Details API esté habilitada
- Asegúrate de que el session token sea válido

### Error al hacer tap en el mapa
- Verifica que Geocoding API esté habilitada
- Asegúrate de que la API key tenga permisos de geocoding

### Mapa no se muestra
- Verifica que Maps SDK esté habilitado
- Asegúrate de que la API key esté configurada en Android/iOS
- Verifica las restricciones de la API key

## 📱 Pruebas en Diferentes Plataformas

### Android
- Prueba en dispositivo físico para verificar permisos
- Verifica que el mapa se carga correctamente
- Prueba la funcionalidad de "Mi Ubicación"

### iOS
- Prueba en dispositivo físico para verificar permisos
- Verifica que el mapa se carga correctamente
- Prueba la funcionalidad de "Mi Ubicación"

### Web
- Prueba la navegación con teclado
- Verifica que el overlay de sugerencias funciona
- Prueba el modo responsivo

## 🚀 Próximos Pasos

1. **Integrar** con tu backend para guardar direcciones
2. **Agregar** validaciones de negocio específicas
3. **Implementar** caché de búsquedas frecuentes
4. **Agregar** más tipos de lugares (restaurantes, gasolineras, etc.)
5. **Implementar** búsqueda por categorías
6. **Agregar** historial de búsquedas
7. **Implementar** favoritos de ubicaciones
