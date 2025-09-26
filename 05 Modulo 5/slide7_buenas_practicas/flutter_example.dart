// Buenas prácticas para Flutter
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter/services.dart';

class OptimizedMapWidget extends StatefulWidget {
  @override
  _OptimizedMapWidgetState createState() => _OptimizedMapWidgetState();
}

class _OptimizedMapWidgetState extends State<OptimizedMapWidget> {
  GoogleMapController? _controller;
  String? _currentStyle;
  Map<String, String> _styleCache = {};
  int _styleLoads = 0;
  int _mapUpdates = 0;
  int _cacheHits = 0;
  
  // Pre-cargar estilos desde assets
  Future<String> _loadStyleFromAssets(String assetPath) async {
    if (_styleCache.containsKey(assetPath)) {
      _cacheHits++;
      _updateStats();
      return _styleCache[assetPath]!;
    }
    
    try {
      _styleLoads++;
      final style = await rootBundle.loadString(assetPath);
      _styleCache[assetPath] = style;
      _updateStats();
      return style;
    } catch (error) {
      print('Error cargando estilo: $error');
      return '';
    }
  }
  
  // Aplicar estilo sin rebuilds innecesarios
  Future<void> _applyStyle(String styleJson) async {
    if (_currentStyle == styleJson) return; // Evitar aplicaciones duplicadas
    
    await _controller?.setMapStyle(styleJson);
    _currentStyle = styleJson;
    _mapUpdates++;
    _updateStats();
  }
  
  // Controlar markers para mejor rendimiento
  Set<Marker> _markers = {};
  bool _showMarkers = true;
  
  void _addMarker(LatLng position) {
    if (!_showMarkers) return;
    
    setState(() {
      _markers.add(Marker(
        markerId: MarkerId(position.toString()),
        position: position,
      ));
    });
  }
  
  // Optimizar markers con clustering básico
  void _optimizeMarkers() {
    if (_markers.length > 50) {
      // Implementar clustering simple
      final clusteredMarkers = <Marker>{};
      final positions = <LatLng>[];
      
      for (final marker in _markers) {
        positions.add(marker.position);
      }
      
      // Agrupar markers cercanos
      final clusters = _clusterPositions(positions, 0.01); // ~1km
      
      for (int i = 0; i < clusters.length; i++) {
        final cluster = clusters[i];
        clusteredMarkers.add(Marker(
          markerId: MarkerId('cluster_$i'),
          position: cluster.center,
          infoWindow: InfoWindow(
            title: 'Cluster ${cluster.count} markers',
          ),
        ));
      }
      
      setState(() {
        _markers = clusteredMarkers;
      });
    }
  }
  
  // Clustering básico de posiciones
  List<Cluster> _clusterPositions(List<LatLng> positions, double distance) {
    final clusters = <Cluster>[];
    
    for (final position in positions) {
      bool addedToCluster = false;
      
      for (final cluster in clusters) {
        if (_calculateDistance(position, cluster.center) < distance) {
          cluster.positions.add(position);
          cluster.count++;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.add(Cluster(
          center: position,
          positions: [position],
          count: 1,
        ));
      }
    }
    
    return clusters;
  }
  
  // Calcular distancia entre dos puntos
  double _calculateDistance(LatLng pos1, LatLng pos2) {
    const double R = 6371; // Radio de la Tierra en km
    final double dLat = (pos2.latitude - pos1.latitude) * 3.14159 / 180;
    final double dLon = (pos2.longitude - pos1.longitude) * 3.14159 / 180;
    final double a = (dLat / 2).sin() * (dLat / 2).sin() +
        pos1.latitude.cos() * pos2.latitude.cos() *
        (dLon / 2).sin() * (dLon / 2).sin();
    final double c = 2 * (a.sqrt()).atan2((1 - a).sqrt());
    return R * c;
  }
  
  // Actualizar estadísticas
  void _updateStats() {
    setState(() {
      // Las estadísticas se actualizan automáticamente
    });
  }
  
  // Pre-cargar estilos comunes
  Future<void> _preloadStyles() async {
    final commonStyles = [
      'assets/styles/light.json',
      'assets/styles/dark.json',
      'assets/styles/retail.json',
    ];
    
    for (final stylePath in commonStyles) {
      try {
        await _loadStyleFromAssets(stylePath);
      } catch (error) {
        print('No se pudo cargar $stylePath: $error');
      }
    }
  }
  
  // Monitorear uso de API
  void _monitorUsage() {
    final usage = {
      'mapUpdates': _mapUpdates,
      'styleLoads': _styleLoads,
      'cacheEfficiency': _cacheHits / (_styleLoads > 0 ? _styleLoads : 1),
    };
    
    print('Uso de API: $usage');
    
    if (_styleLoads > 40000) {
      print('⚠️ Cerca del límite de 50,000 requests/día para estilos');
    }
  }
  
  @override
  void initState() {
    super.initState();
    _preloadStyles();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Buenas Prácticas'),
        actions: [
          IconButton(
            icon: Icon(Icons.info),
            onPressed: _showStatsDialog,
            tooltip: 'Ver Estadísticas',
          ),
          IconButton(
            icon: Icon(Icons.optimize),
            onPressed: _optimizeMarkers,
            tooltip: 'Optimizar Markers',
          ),
        ],
      ),
      body: Column(
        children: [
          // Panel de estadísticas
          Container(
            padding: EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatCard('Cargas de Estilo', _styleLoads),
                _buildStatCard('Actualizaciones', _mapUpdates),
                _buildStatCard('Cache Hits', _cacheHits),
              ],
            ),
          ),
          // Mapa
          Expanded(
            child: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _controller = controller;
              },
              markers: _markers,
              // Configuración optimizada
              mapType: MapType.normal,
              myLocationEnabled: true,
              zoomControlsEnabled: true,
              // Configuraciones de rendimiento
              clickableIcons: false,
              compassEnabled: false,
              mapToolbarEnabled: false,
            ),
          ),
          // Controles
          Container(
            padding: EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                ElevatedButton(
                  onPressed: () => _addMarker(LatLng(-34.397, 150.644)),
                  child: Text('Agregar Marker'),
                ),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _showMarkers = !_showMarkers;
                      if (!_showMarkers) {
                        _markers.clear();
                      }
                    });
                  },
                  child: Text(_showMarkers ? 'Ocultar Markers' : 'Mostrar Markers'),
                ),
                ElevatedButton(
                  onPressed: _monitorUsage,
                  child: Text('Monitorear Uso'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatCard(String label, int value) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue[200]!),
      ),
      child: Column(
        children: [
          Text(
            value.toString(),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.blue[700],
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.blue[600],
            ),
          ),
        ],
      ),
    );
  }
  
  void _showStatsDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Estadísticas de Rendimiento'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Cargas de Estilo: $_styleLoads'),
              Text('Actualizaciones de Mapa: $_mapUpdates'),
              Text('Cache Hits: $_cacheHits'),
              Text('Eficiencia de Cache: ${(_cacheHits / (_styleLoads > 0 ? _styleLoads : 1) * 100).toStringAsFixed(1)}%'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Cerrar'),
            ),
          ],
        );
      },
    );
  }
}

// Clase para clustering
class Cluster {
  final LatLng center;
  final List<LatLng> positions;
  int count;
  
  Cluster({
    required this.center,
    required this.positions,
    required this.count,
  });
}
