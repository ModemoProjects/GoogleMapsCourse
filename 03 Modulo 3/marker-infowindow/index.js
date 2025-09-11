let map;
let infoWindow;
let markers = {}; // Almacenar referencias a los markers

// Datos de ubicaciones con información detallada
const locations = [
    {
        position: { lat: 21.1230729, lng: -101.6650775 },
        title: "Restaurante El Buen Sabor",
        type: "restaurant",
        animation: "bounce",
        info: {
            name: "Restaurante El Buen Sabor",
            address: "Av. Principal 123, Centro, León, Gto.",
            phone: "+52 477 123 4567",
            hours: "Lun-Dom: 8:00 AM - 10:00 PM",
            rating: "4.5 ⭐",
            description: "Especialistas en comida mexicana tradicional con más de 20 años de experiencia.",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop&crop=center"
        }
    },
    {
        position: { lat: 21.1300, lng: -101.6600 },
        title: "Parque Principal",
        type: "park",
        animation: "drop",
        info: {
            name: "Parque Principal de León",
            address: "Centro Histórico, León, Gto.",
            hours: "24 horas",
            description: "Hermoso parque en el corazón de la ciudad con áreas verdes y fuentes.",
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&crop=center"
        }
    },
    {
        position: { lat: 21.1100, lng: -101.6700 },
        title: "Museo de Arte",
        type: "museum",
        animation: "custom",
        info: {
            name: "Museo de Arte Contemporáneo",
            address: "Calle del Arte 456, León, Gto.",
            phone: "+52 477 987 6543",
            hours: "Mar-Dom: 10:00 AM - 6:00 PM",
            price: "Entrada: $50 MXN",
            description: "Exposiciones de arte moderno y contemporáneo de artistas locales e internacionales.",
            image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center"
        }
    },
    {
        position: { lat: 21.1400, lng: -101.6500 },
        title: "Centro Comercial",
        type: "shopping",
        animation: "bounce",
        info: {
            name: "Plaza del Sol",
            address: "Blvd. López Mateos 789, León, Gto.",
            hours: "Lun-Dom: 10:00 AM - 9:00 PM",
            description: "Centro comercial con más de 200 tiendas, restaurantes y entretenimiento.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center"
        }
    }
];

async function initMap() {
    const { Map, InfoWindow, Marker } = await google.maps.importLibrary("maps");
    
    // Crear el mapa centrado en León, Guanajuato
    map = new Map(document.getElementById("map"), {
        center: { lat: 21.1230729, lng: -101.6650775 },
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    // Crear InfoWindow global
    infoWindow = new InfoWindow();

    // Crear markers para cada ubicación
    locations.forEach((location) => {
        const marker = createMarker(location);
        markers[location.type] = marker; // Almacenar referencia al marker
    });
}

function createMarker(location) {
    const { Marker } = google.maps;
    
    // Definir íconos personalizados según el tipo
    let iconUrl = '';
    switch(location.type) {
        case 'restaurant':
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
            break;
        case 'park':
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
            break;
        case 'museum':
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            break;
        case 'shopping':
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png';
            break;
        default:
            iconUrl = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    }

    // Definir animación inicial según el tipo
    let initialAnimation = google.maps.Animation.DROP;
    switch(location.animation) {
        case 'bounce':
            initialAnimation = google.maps.Animation.BOUNCE;
            break;
        case 'drop':
            initialAnimation = google.maps.Animation.DROP;
            break;
        case 'custom':
            initialAnimation = null; // Se aplicará la animación personalizada después
            break;
    }

    // Crear el marker
    const marker = new Marker({
        position: location.position,
        map: map,
        title: location.title,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(40, 40)
        },
        animation: initialAnimation
    });

    // Aplicar animación personalizada para el museo
    if (location.animation === 'custom') {
        setTimeout(() => {
            applyCustomAnimation(marker);
        }, 1000);
    }

    // Crear contenido del InfoWindow
    const infoContent = createInfoContent(location.info);

    // Agregar evento click al marker
    marker.addListener("click", () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
        
        // Aplicar animación específica al hacer click
        applyClickAnimation(marker, location.animation);
    });

    return marker;
}

// Función para aplicar animación personalizada
function applyCustomAnimation(marker) {
    // Crear una animación de rotación personalizada
    let rotation = 0;
    const rotateInterval = setInterval(() => {
        rotation += 10;
        marker.setIcon({
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40),
            rotation: rotation
        });
        
        if (rotation >= 360) {
            clearInterval(rotateInterval);
            // Restaurar el ícono original
            marker.setIcon({
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
            });
        }
    }, 50);
}

// Función para aplicar animaciones al hacer click
function applyClickAnimation(marker, animationType) {
    switch(animationType) {
        case 'bounce':
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 2000);
            break;
        case 'drop':
            marker.setAnimation(google.maps.Animation.DROP);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 1000);
            break;
        case 'custom':
            // Animación personalizada de pulso
            let scale = 1;
            const pulseInterval = setInterval(() => {
                scale = scale === 1 ? 1.5 : 1;
                marker.setIcon({
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(40 * scale, 40 * scale)
                });
            }, 200);
            
            setTimeout(() => {
                clearInterval(pulseInterval);
                marker.setIcon({
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(40, 40)
                });
            }, 2000);
            break;
    }
}

function createInfoContent(info) {
    let content = `
        <div style="font-family: Arial, sans-serif; max-width: 350px; border-radius: 8px; overflow: hidden;">
    `;

    // Agregar imagen si existe
    if (info.image) {
        content += `
            <div style="width: 100%; height: 150px; overflow: hidden; position: relative;">
                <img src="${info.image}" 
                     style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                     onmouseover="this.style.transform='scale(1.05)'"
                     onmouseout="this.style.transform='scale(1)'"
                     alt="${info.name}">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(transparent, rgba(0,0,0,0.3));"></div>
            </div>
        `;
    }

    content += `
            <div style="padding: 15px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: bold; text-align: center;">
                    ${info.name}
                </h3>
    `;

    if (info.address) {
        content += `<p style="margin: 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">📍</span><strong>Dirección:</strong> ${info.address}</p>`;
    }

    if (info.phone) {
        content += `<p style="margin: 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">📞</span><strong>Teléfono:</strong> ${info.phone}</p>`;
    }

    if (info.hours) {
        content += `<p style="margin: 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">🕒</span><strong>Horario:</strong> ${info.hours}</p>`;
    }

    if (info.rating) {
        content += `<p style="margin: 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">⭐</span><strong>Calificación:</strong> ${info.rating}</p>`;
    }

    if (info.price) {
        content += `<p style="margin: 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">💰</span><strong>Precio:</strong> ${info.price}</p>`;
    }

    if (info.description) {
        content += `<p style="margin: 15px 0 0 0; color: #555; font-style: italic; font-size: 13px; line-height: 1.4; text-align: center; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #4285f4;">${info.description}</p>`;
    }

    content += `
            </div>
        </div>
    `;
    return content;
}

// Función global para abrir InfoWindows desde los botones
function openInfoWindow(locationType) {
    if (markers[locationType] && infoWindow && map) {
        const location = locations.find(loc => loc.type === locationType);
        
        if (location) {
            const infoContent = createInfoContent(location.info);
            infoWindow.setContent(infoContent);
            infoWindow.open(map, markers[locationType]);
            
            // Centrar el mapa en la ubicación
            map.setCenter(location.position);
            map.setZoom(13);
            
            // Aplicar animación al marker
            applyClickAnimation(markers[locationType], location.animation);
            
            // Resaltar el botón activo
            highlightActiveButton(locationType);
        }
    }
}

// Hacer la función disponible globalmente
window.openInfoWindow = openInfoWindow;

// Función para resaltar el botón activo
function highlightActiveButton(locationType) {
    // Remover clase activa de todos los botones
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase activa al botón seleccionado
    const activeBtn = document.querySelector(`[data-location="${locationType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        
        // Remover la clase activa después de 3 segundos
        setTimeout(() => {
            activeBtn.classList.remove('active');
        }, 3000);
    }
}

// Hacer la función disponible globalmente
window.highlightActiveButton = highlightActiveButton;

// Inicializar el mapa cuando se carga la página
initMap();