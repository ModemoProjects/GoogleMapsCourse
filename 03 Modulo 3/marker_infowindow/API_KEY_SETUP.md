# 🔑 Configuración de API Key de Google Maps

## ⚠️ IMPORTANTE: Configura tu API Key antes de ejecutar la aplicación

Para que la aplicación funcione correctamente, necesitas configurar tu API Key de Google Maps en los siguientes archivos:

## 📱 Para Android

### 1. Obtener API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Maps para Android
4. Crea credenciales (API Key)
5. Restringe la API Key a tu aplicación Android

### 2. Configurar en Android
Abre el archivo `android/app/src/main/AndroidManifest.xml` y reemplaza `TU_API_KEY_AQUI` con tu API Key real:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_REAL_AQUI" />
```

## 🍎 Para iOS

### 1. Obtener API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la API de Google Maps para iOS
3. Crea credenciales (API Key)
4. Restringe la API Key a tu aplicación iOS

### 2. Configurar en iOS
Abre el archivo `ios/Runner/AppDelegate.swift` y reemplaza `TU_API_KEY_AQUI` con tu API Key real:

```swift
GMSServices.provideAPIKey("TU_API_KEY_REAL_AQUI")
```

## 🌐 Para Web (Opcional)

Si quieres ejecutar la aplicación en web, también necesitas configurar la API Key en `web/index.html`:

```html
<script>
  window.googleMapsApiKey = "TU_API_KEY_REAL_AQUI";
</script>
```

## 🔒 Restricciones de Seguridad

### Para Android:
- Restringe por nombre del paquete: `com.example.marker_infowindow`
- Restringe por huella digital SHA-1 de tu certificado de firma

### Para iOS:
- Restringe por Bundle ID: `com.example.markerInfowindow`
- Restringe por App Store ID (si es una app publicada)

## 🚨 Solución de Problemas

### Error: "API key not found"
- Verifica que hayas configurado la API Key en el archivo correcto
- Asegúrate de que no haya espacios extra en la configuración
- Verifica que la API Key tenga permisos para Google Maps

### Error: "This API project is not authorized"
- Verifica que hayas habilitado la API de Google Maps
- Verifica que la API Key tenga las restricciones correctas
- Espera unos minutos para que los cambios se propaguen

### Error: "Billing account required"
- Google Maps requiere una cuenta de facturación habilitada
- Puedes usar el crédito gratuito de $200 USD por mes

## 📚 Recursos Adicionales

- [Documentación de Google Maps Flutter](https://pub.dev/packages/google_maps_flutter)
- [Guía de configuración de Android](https://developers.google.com/maps/documentation/android-sdk/get-api-key)
- [Guía de configuración de iOS](https://developers.google.com/maps/documentation/ios-sdk/get-api-key)

## ✅ Verificación

Una vez configurada la API Key, ejecuta la aplicación:

```bash
flutter run
```

Si todo está configurado correctamente, deberías ver el mapa de León, Guanajuato con los markers personalizados.

---

**¡Recuerda mantener tu API Key segura y no compartirla públicamente! 🔐**
