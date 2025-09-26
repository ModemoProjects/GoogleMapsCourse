// Buenas prácticas para rendimiento y gestión de estilos
class OptimizedMapManager {
  constructor() {
    this.map = null;
    this.styles = new Map(); // Cache de estilos
    this.isAnimating = false;
    this.stats = {
      styleLoads: 0,
      mapUpdates: 0,
      cacheHits: 0
    };
  }
  
  // Cargar estilos desde archivo JSON
  async loadStyleFromFile(stylePath) {
    if (this.styles.has(stylePath)) {
      this.stats.cacheHits++;
      this.updateStats();
      return this.styles.get(stylePath);
    }
    
    try {
      this.stats.styleLoads++;
      const response = await fetch(stylePath);
      const style = await response.json();
      this.styles.set(stylePath, style);
      this.updateStats();
      return style;
    } catch (error) {
      console.error('Error cargando estilo:', error);
      return [];
    }
  }
  
  // Aplicar estilo optimizado
  async applyStyle(stylePath) {
    const style = await this.loadStyleFromFile(stylePath);
    
    // Desactivar animaciones para mejor rendimiento
    const animationEnabled = !document.getElementById('minimizeAnimations').checked;
    
    this.map.setOptions({
      styles: style,
      gestureHandling: document.getElementById('gestureHandling').checked ? 'cooperative' : 'auto',
      disableDefaultUI: document.getElementById('disableDefaultUI').checked,
      zoomControl: true,
      // Configuraciones de rendimiento
      clickableIcons: false,
      keyboardShortcuts: false
    });
    
    this.stats.mapUpdates++;
    this.updateStats();
  }
  
  // Pre-cargar estilos comunes
  async preloadCommonStyles() {
    const commonStyles = [
      'styles/light.json',
      'styles/dark.json',
      'styles/retail.json'
    ];
    
    for (const stylePath of commonStyles) {
      try {
        await this.loadStyleFromFile(stylePath);
      } catch (error) {
        console.warn(`No se pudo cargar ${stylePath}:`, error);
      }
    }
  }
  
  // Optimizar markers
  optimizeMarkers(markers) {
    // Implementar clustering para muchos markers
    if (markers.length > 100) {
      console.warn('Muchos markers detectados. Considera implementar clustering.');
      return this.clusterMarkers(markers);
    }
    return markers;
  }
  
  // Clustering básico de markers
  clusterMarkers(markers) {
    const clusters = [];
    const clusterDistance = 0.01; // Aproximadamente 1km
    
    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i];
      let addedToCluster = false;
      
      for (let j = 0; j < clusters.length; j++) {
        const cluster = clusters[j];
        const distance = this.calculateDistance(
          marker.position,
          cluster.center
        );
        
        if (distance < clusterDistance) {
          cluster.markers.push(marker);
          cluster.count++;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push({
          center: marker.position,
          markers: [marker],
          count: 1
        });
      }
    }
    
    return clusters;
  }
  
  // Calcular distancia entre dos puntos
  calculateDistance(pos1, pos2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Monitorear uso de API
  monitorAPIUsage() {
    const usage = {
      mapLoads: this.stats.mapUpdates,
      styleLoads: this.stats.styleLoads,
      cacheEfficiency: this.stats.cacheHits / (this.stats.styleLoads || 1)
    };
    
    console.log('Uso de API:', usage);
    
    // Alerta si se acerca al límite
    if (this.stats.styleLoads > 40000) {
      console.warn('⚠️ Cerca del límite de 50,000 requests/día para estilos');
    }
    
    return usage;
  }
  
  // Actualizar estadísticas en la UI
  updateStats() {
    document.getElementById('styleLoads').textContent = this.stats.styleLoads;
    document.getElementById('mapUpdates').textContent = this.stats.mapUpdates;
    document.getElementById('cacheHits').textContent = this.stats.cacheHits;
  }
  
  // Limpiar recursos
  destroy() {
    this.styles.clear();
    this.map = null;
    this.stats = { styleLoads: 0, mapUpdates: 0, cacheHits: 0 };
    this.updateStats();
  }
  
  // Aplicar configuración de rendimiento
  applyPerformanceSettings() {
    if (!this.map) return;
    
    const settings = {
      gestureHandling: document.getElementById('gestureHandling').checked ? 'cooperative' : 'auto',
      disableDefaultUI: document.getElementById('disableDefaultUI').checked,
      clickableIcons: false,
      keyboardShortcuts: false,
      zoomControl: true
    };
    
    this.map.setOptions(settings);
  }
}

// Instancia global del manager
const mapManager = new OptimizedMapManager();

// Inicializar mapa
function initMap() {
  mapManager.map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 10
  });
  
  // Aplicar configuración inicial
  mapManager.applyPerformanceSettings();
  
  // Pre-cargar estilos si está habilitado
  if (document.getElementById('preloadStyles').checked) {
    mapManager.preloadCommonStyles();
  }
  
  // Configurar monitoreo
  if (document.getElementById('monitorUsage').checked) {
    setInterval(() => {
      mapManager.monitorAPIUsage();
    }, 30000); // Cada 30 segundos
  }
}

// Event listeners para controles
document.addEventListener('DOMContentLoaded', function() {
  // Aplicar configuración cuando cambien los controles
  const controls = [
    'gestureHandling', 'disableDefaultUI', 'minimizeAnimations'
  ];
  
  controls.forEach(controlId => {
    document.getElementById(controlId).addEventListener('change', function() {
      mapManager.applyPerformanceSettings();
    });
  });
  
  // Limpieza automática si está habilitada
  if (document.getElementById('cleanupResources').checked) {
    window.addEventListener('beforeunload', function() {
      mapManager.destroy();
    });
  }
});

// Inicializar cuando se carga la página
window.onload = initMap;
