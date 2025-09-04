package com.neo.simplemap

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.maps.android.compose.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen() {
    val context = LocalContext.current
    
    // Coordenadas como ejemplo (León, Guanajuato)
    val defaultLocation = LatLng(21.1230729, -101.6650775)
    
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(defaultLocation, 11f)
    }
    
    var mapProperties by remember {
        mutableStateOf(
            MapProperties(
                isMyLocationEnabled = true,
                mapType = MapType.NORMAL
            )
        )
    }
    
    var uiSettings by remember {
        mutableStateOf(
            MapUiSettings(
                zoomControlsEnabled = false,
                myLocationButtonEnabled = false,
                mapToolbarEnabled = true,
            )
        )
    }
    
    // Estado para el tipo de mapa seleccionado
    var selectedMapType by remember { mutableStateOf(MapType.NORMAL) }
    
    // Estado para el estilo personalizado
    var customMapStyle by remember { mutableStateOf<MapStyleOptions?>(null) }
    
    // Estado para mostrar/ocultar el selector
    var showMapTypeSelector by remember { mutableStateOf(false) }
    
    // Estilos personalizados predefinidos
    val customStyles = remember {
        mapOf(
            "Dark Mode" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_dark),
            "Night Mode" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_night),
            "Retro Style" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_retro),
            "High Contrast" to MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_high_contrast)
        )
    }
    
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = "Cambio de Tipos de Mapa",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        },
        floatingActionButton = {
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Botón para centrar en ubicación
                FloatingActionButton(
                    onClick = {
                        cameraPositionState.position = CameraPosition.fromLatLngZoom(defaultLocation, 15f)
                    },
                    modifier = Modifier.size(56.dp),
                    containerColor = MaterialTheme.colorScheme.secondary
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Centrar en ubicación",
                        tint = Color.White
                    )
                }
                
                // Botón para mostrar/ocultar selector de tipos de mapa
                FloatingActionButton(
                    onClick = { 
                        showMapTypeSelector = !showMapTypeSelector
                    },
                    modifier = Modifier.size(56.dp),
                    containerColor = if (showMapTypeSelector) 
                        MaterialTheme.colorScheme.error 
                    else 
                        MaterialTheme.colorScheme.primary
                ) {
                    Icon(
                        imageVector = if (showMapTypeSelector) Icons.Default.Close else Icons.Default.Settings,
                        contentDescription = if (showMapTypeSelector) "Ocultar selector" else "Mostrar selector",
                        tint = Color.White
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Mapa de Google
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                properties = mapProperties.copy(
                    mapStyleOptions = customMapStyle
                ),
                uiSettings = uiSettings,
                onMapLoaded = {
                    // Mapa cargado completamente
                },
                onMapClick = { latLng ->
                    // Manejar clics en el mapa
                }
            ) {
                // Marcador en la ubicación por defecto
                Marker(
                    state = MarkerState(position = defaultLocation),
                    title = "León, Guanajuato",
                    snippet = "Ubicación de ejemplo"
                )
            }
            
            // Selector de tipos de mapa (solo visible cuando showMapTypeSelector es true)
            if (showMapTypeSelector) {
                Card(
                    modifier = Modifier
                        .padding(16.dp)
                        .align(Alignment.TopEnd),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Header con título y botón de cerrar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Tipos de Mapa",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            
                            IconButton(
                                onClick = { showMapTypeSelector = false },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Cerrar",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        // Botón Roadmap (Normal)
                        Button(
                            onClick = {
                                selectedMapType = MapType.NORMAL
                                customMapStyle = null
                                mapProperties = mapProperties.copy(mapType = MapType.NORMAL)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedMapType == MapType.NORMAL && customMapStyle == null) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = if (selectedMapType == MapType.NORMAL && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Roadmap",
                                    color = if (selectedMapType == MapType.NORMAL && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Botón Satellite
                        Button(
                            onClick = {
                                selectedMapType = MapType.SATELLITE
                                customMapStyle = null
                                mapProperties = mapProperties.copy(mapType = MapType.SATELLITE)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedMapType == MapType.SATELLITE && customMapStyle == null) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = if (selectedMapType == MapType.SATELLITE && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Satellite",
                                    color = if (selectedMapType == MapType.SATELLITE && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Botón Hybrid
                        Button(
                            onClick = {
                                selectedMapType = MapType.HYBRID
                                customMapStyle = null
                                mapProperties = mapProperties.copy(mapType = MapType.HYBRID)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedMapType == MapType.HYBRID && customMapStyle == null) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = if (selectedMapType == MapType.HYBRID && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Hybrid",
                                    color = if (selectedMapType == MapType.HYBRID && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Botón Terrain
                        Button(
                            onClick = {
                                selectedMapType = MapType.TERRAIN
                                customMapStyle = null
                                mapProperties = mapProperties.copy(mapType = MapType.TERRAIN)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedMapType == MapType.TERRAIN && customMapStyle == null) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = if (selectedMapType == MapType.TERRAIN && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Terrain",
                                    color = if (selectedMapType == MapType.TERRAIN && customMapStyle == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Separador
                        Divider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                        )
                        
                        Text(
                            text = "Estilos Personalizados",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 8.dp),
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        // Botón Dark Mode
                        Button(
                            onClick = {
                                customMapStyle = customStyles["Dark Mode"]
                                selectedMapType = MapType.NORMAL
                                mapProperties = mapProperties.copy(mapType = MapType.NORMAL)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (customMapStyle == customStyles["Dark Mode"]) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = if (customMapStyle == customStyles["Dark Mode"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Dark Mode",
                                    color = if (customMapStyle == customStyles["Dark Mode"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Botón Night Mode
                        Button(
                            onClick = {
                                customMapStyle = customStyles["Night Mode"]
                                selectedMapType = MapType.NORMAL
                                mapProperties = mapProperties.copy(mapType = MapType.NORMAL)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (customMapStyle == customStyles["Night Mode"]) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = if (customMapStyle == customStyles["Night Mode"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Night Mode",
                                    color = if (customMapStyle == customStyles["Night Mode"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Botón Retro Style
                        Button(
                            onClick = {
                                customMapStyle = customStyles["Retro Style"]
                                selectedMapType = MapType.NORMAL
                                mapProperties = mapProperties.copy(mapType = MapType.NORMAL)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (customMapStyle == customStyles["Retro Style"]) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = if (customMapStyle == customStyles["Retro Style"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Retro Style",
                                    color = if (customMapStyle == customStyles["Retro Style"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Botón High Contrast
                        Button(
                            onClick = {
                                customMapStyle = customStyles["High Contrast"]
                                selectedMapType = MapType.NORMAL
                                mapProperties = mapProperties.copy(mapType = MapType.NORMAL)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (customMapStyle == customStyles["High Contrast"]) 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = if (customMapStyle == customStyles["High Contrast"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "High Contrast",
                                    color = if (customMapStyle == customStyles["High Contrast"]) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
            
            // Información del tipo de mapa actual en la parte inferior
            Card(
                modifier = Modifier
                    .padding(16.dp)
                    .align(Alignment.BottomStart),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.9f)
                )
            ) {
                Text(
                    text = "Tipo actual: ${getMapTypeName(selectedMapType, customMapStyle)}",
                    modifier = Modifier.padding(16.dp),
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
    }
}

// Función auxiliar para obtener el nombre del tipo de mapa
private fun getMapTypeName(mapType: MapType, customStyle: MapStyleOptions?): String {
    if (customStyle != null) {
        return when {
            customStyle.toString().contains("dark") -> "Dark Mode"
            customStyle.toString().contains("night") -> "Night Mode"
            customStyle.toString().contains("retro") -> "Retro Style"
            customStyle.toString().contains("high_contrast") -> "High Contrast"
            else -> "Estilo Personalizado"
        }
    }
    
    return when (mapType) {
        MapType.NORMAL -> "Roadmap"
        MapType.SATELLITE -> "Satellite"
        MapType.HYBRID -> "Hybrid"
        MapType.TERRAIN -> "Terrain"
        else -> "Desconocido"
    }
}
