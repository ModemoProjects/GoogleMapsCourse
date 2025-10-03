// JavaScript para el Módulo 8: Resolución de Problemas y Soporte

document.addEventListener('DOMContentLoaded', function() {
    // Navegación entre secciones
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remover clase active de todos los botones y secciones
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Agregar clase active al botón y sección seleccionados
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Demo de errores
    const simulateErrorBtn = document.getElementById('simulateError');
    const fixErrorBtn = document.getElementById('fixError');
    const errorDemo = document.getElementById('errorDemo');

    if (simulateErrorBtn && fixErrorBtn && errorDemo) {
        simulateErrorBtn.addEventListener('click', function() {
            errorDemo.innerHTML = `
                <div class="error-demo">
                    <div class="error-message">
                        <h4>❌ Error Simulado</h4>
                        <p><strong>Google Maps JavaScript API error: RefererNotAllowedMapError</strong></p>
                        <p>Tu sitio web (http://localhost:3000) no está autorizado para usar esta API key.</p>
                        <div class="error-details">
                            <h5>Detalles del error:</h5>
                            <ul>
                                <li>API key: AIzaSyBvOkBw... (restricciones activas)</li>
                                <li>Dominio solicitante: http://localhost:3000</li>
                                <li>Dominios permitidos: https://mi-sitio.com</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });

        fixErrorBtn.addEventListener('click', function() {
            errorDemo.innerHTML = `
                <div class="success-demo">
                    <div class="success-message">
                        <h4>✅ Error Solucionado</h4>
                        <p>Se agregó <code>localhost:*</code> a las restricciones de referrer.</p>
                        <div class="success-details">
                            <h5>Cambios realizados:</h5>
                            <ul>
                                <li>✅ Dominio agregado: http://localhost:3000</li>
                                <li>✅ Wildcard configurado: localhost:*</li>
                                <li>✅ API key validada</li>
                            </ul>
                        </div>
                        <div class="map-placeholder">
                            <p>🗺️ Mapa funcionando correctamente</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Demo de clustering
    const loadManyMarkersBtn = document.getElementById('loadManyMarkers');
    const enableClusteringBtn = document.getElementById('enableClustering');
    const clearMarkersBtn = document.getElementById('clearMarkers');
    const markerCountSpan = document.getElementById('markerCount');
    const renderTimeSpan = document.getElementById('renderTime');
    const clusterCountSpan = document.getElementById('clusterCount');

    let markers = [];
    let clusters = [];
    let isClusteringEnabled = false;

    if (loadManyMarkersBtn && enableClusteringBtn && clearMarkersBtn) {
        loadManyMarkersBtn.addEventListener('click', function() {
            const startTime = performance.now();
            
            // Simular carga de 5000 marcadores
            markers = generateRandomMarkers(5000);
            
            const endTime = performance.now();
            const renderTime = Math.round(endTime - startTime);
            
            markerCountSpan.textContent = markers.length;
            renderTimeSpan.textContent = renderTime + 'ms';
            
            // Mostrar advertencia de rendimiento
            showPerformanceWarning();
        });

        enableClusteringBtn.addEventListener('click', function() {
            if (markers.length === 0) {
                alert('Primero carga algunos marcadores');
                return;
            }

            const startTime = performance.now();
            
            // Simular clustering
            clusters = performClustering(markers);
            isClusteringEnabled = true;
            
            const endTime = performance.now();
            const renderTime = Math.round(endTime - startTime);
            
            clusterCountSpan.textContent = clusters.length;
            renderTimeSpan.textContent = renderTime + 'ms';
            
            // Mostrar mejora de rendimiento
            showPerformanceImprovement();
        });

        clearMarkersBtn.addEventListener('click', function() {
            markers = [];
            clusters = [];
            isClusteringEnabled = false;
            
            markerCountSpan.textContent = '0';
            renderTimeSpan.textContent = '0ms';
            clusterCountSpan.textContent = '0';
            
            hidePerformanceMessages();
        });
    }

    // Funciones auxiliares para el demo
    function generateRandomMarkers(count) {
        const markers = [];
        for (let i = 0; i < count; i++) {
            markers.push({
                id: i,
                lat: Math.random() * 180 - 90,
                lng: Math.random() * 360 - 180,
                title: `Marcador ${i + 1}`
            });
        }
        return markers;
    }

    function performClustering(markers) {
        // Simular algoritmo de clustering simple
        const clusters = [];
        const clusterSize = 50; // Marcadores por cluster
        
        for (let i = 0; i < markers.length; i += clusterSize) {
            const clusterMarkers = markers.slice(i, i + clusterSize);
            clusters.push({
                id: clusters.length,
                markers: clusterMarkers,
                center: calculateCenter(clusterMarkers),
                count: clusterMarkers.length
            });
        }
        
        return clusters;
    }

    function calculateCenter(markers) {
        const lat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
        const lng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
        return { lat, lng };
    }

    function showPerformanceWarning() {
        const demoArea = document.getElementById('clusteringDemo');
        const warning = document.createElement('div');
        warning.className = 'performance-warning';
        warning.innerHTML = `
            <div class="warning-message">
                <h4>⚠️ Advertencia de Rendimiento</h4>
                <p>5000 marcadores pueden causar problemas de rendimiento en dispositivos móviles.</p>
                <p><strong>Tiempo de renderizado:</strong> ${renderTimeSpan.textContent}</p>
            </div>
        `;
        
        // Remover advertencia anterior si existe
        const existingWarning = demoArea.querySelector('.performance-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        demoArea.appendChild(warning);
    }

    function showPerformanceImprovement() {
        const demoArea = document.getElementById('clusteringDemo');
        const improvement = document.createElement('div');
        improvement.className = 'performance-improvement';
        improvement.innerHTML = `
            <div class="improvement-message">
                <h4>🚀 Mejora de Rendimiento</h4>
                <p>Clustering redujo ${markers.length} marcadores a ${clusters.length} clusters.</p>
                <p><strong>Tiempo de renderizado:</strong> ${renderTimeSpan.textContent}</p>
                <p><strong>Mejora:</strong> ~${Math.round((markers.length / clusters.length) * 100)}% menos elementos</p>
            </div>
        `;
        
        // Remover mensaje anterior si existe
        const existingWarning = demoArea.querySelector('.performance-warning');
        const existingImprovement = demoArea.querySelector('.performance-improvement');
        if (existingWarning) existingWarning.remove();
        if (existingImprovement) existingImprovement.remove();
        
        demoArea.appendChild(improvement);
    }

    function hidePerformanceMessages() {
        const demoArea = document.getElementById('clusteringDemo');
        const warning = demoArea.querySelector('.performance-warning');
        const improvement = demoArea.querySelector('.performance-improvement');
        
        if (warning) warning.remove();
        if (improvement) improvement.remove();
    }

    // Animaciones suaves para las transiciones
    function animateSectionTransition(section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100);
    }

    // Agregar animaciones a las transiciones de sección
    sections.forEach(section => {
        section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });

    // Efectos visuales adicionales
    const cards = document.querySelectorAll('.card, .error-card, .tool-card, .resource-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
    });

    // Contador de progreso en el checklist
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedCount = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
            const totalCount = checkboxes.length;
            const progress = Math.round((checkedCount / totalCount) * 100);
            
            // Mostrar progreso si no existe
            let progressBar = document.querySelector('.checklist-progress');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'checklist-progress';
                progressBar.innerHTML = `
                    <div class="progress-info">
                        <span>Progreso del checklist: ${checkedCount}/${totalCount}</span>
                        <span class="progress-percentage">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                `;
                
                const checklist = document.querySelector('.debug-checklist');
                checklist.appendChild(progressBar);
            } else {
                // Actualizar progreso existente
                const progressInfo = progressBar.querySelector('.progress-info');
                const progressFill = progressBar.querySelector('.progress-fill');
                
                progressInfo.innerHTML = `
                    <span>Progreso del checklist: ${checkedCount}/${totalCount}</span>
                    <span class="progress-percentage">${progress}%</span>
                `;
                progressFill.style.width = `${progress}%`;
            }
        });
    });

    // Tooltips informativos
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) tooltip.remove();
        });
    });

    // Efecto de escritura para el título principal
    const mainTitle = document.querySelector('.header h1');
    if (mainTitle) {
        const originalText = mainTitle.textContent;
        mainTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                mainTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 500);
    }

    // Notificaciones toast para acciones
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Agregar estilos dinámicos para elementos creados por JavaScript
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        .error-demo, .success-demo {
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        
        .error-demo {
            background: #fff5f5;
            border: 1px solid #fed7d7;
        }
        
        .success-demo {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
        }
        
        .error-message h4, .success-message h4 {
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        
        .error-details, .success-details {
            margin: 1rem 0;
            padding: 1rem;
            background: rgba(0,0,0,0.05);
            border-radius: 5px;
        }
        
        .error-details h5, .success-details h5 {
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .performance-warning {
            background: #fff8e1;
            border: 1px solid #ffcc02;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .performance-improvement {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .warning-message h4, .improvement-message h4 {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .checklist-progress {
            margin-top: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .progress-percentage {
            color: #4285f4;
            font-weight: bold;
        }
        
        .progress-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4285f4, #34a853);
            transition: width 0.3s ease;
        }
        
        .tooltip {
            position: absolute;
            background: #2d3748;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.9rem;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: #2d3748;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast-info {
            background: #4285f4;
        }
        
        .toast-success {
            background: #34a853;
        }
        
        .toast-warning {
            background: #fbbc04;
            color: #333;
        }
        
        .toast-error {
            background: #ea4335;
        }
        
        .card, .error-card, .tool-card, .resource-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
    `;
    
    document.head.appendChild(dynamicStyles);
});

// Funciones globales para uso en la presentación
window.showErrorExample = function(errorType) {
    const errorExamples = {
        'api-key': {
            title: 'API Key Inválida',
            message: 'Google Maps JavaScript API error: RefererNotAllowedMapError',
            details: 'Tu sitio web no está autorizado para usar esta API key.',
            solution: 'Verificar restricciones de referrer en Google Cloud Console'
        },
        'billing': {
            title: 'Facturación No Habilitada',
            message: 'BillingNotEnabledMapError',
            details: 'La facturación no está habilitada para este proyecto.',
            solution: 'Habilitar facturación en Google Cloud Console'
        },
        'library': {
            title: 'Librería No Cargada',
            message: 'LibraryNotLoadedError: places',
            details: 'La librería de Places no está cargada.',
            solution: 'Agregar &libraries=places al script de Google Maps'
        }
    };
    
    const error = errorExamples[errorType];
    if (error) {
        alert(`${error.title}\n\n${error.message}\n\n${error.details}\n\nSolución: ${error.solution}`);
    }
};

window.demonstratePerformanceIssue = function() {
    const startTime = performance.now();
    
    // Simular operación costosa
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
        result += Math.random();
    }
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    alert(`Operación simulada completada en ${duration}ms\n\nEsto demuestra cómo las operaciones costosas pueden afectar el rendimiento de tu aplicación.`);
};
