/**
 * Utilidades para manejo de estilos de Google Maps
 * 
 * Este archivo proporciona funciones auxiliares para:
 * - Validación de estilos JSON
 * - Conversión entre formatos
 * - Herramientas de desarrollo
 */

/**
 * Valida si un objeto de estilo es válido para Google Maps
 * @param {Object} style - Objeto de estilo a validar
 * @returns {boolean} - True si es válido
 */
function isValidMapStyle(style) {
    if (!style || typeof style !== 'object') {
        return false;
    }
    
    // Debe tener al menos elementType o featureType
    if (!style.elementType && !style.featureType) {
        return false;
    }
    
    // Si tiene elementType, debe ser válido
    if (style.elementType && typeof style.elementType !== 'string') {
        return false;
    }
    
    // Si tiene featureType, debe ser válido
    if (style.featureType && typeof style.featureType !== 'string') {
        return false;
    }
    
    // Si tiene stylers, debe ser un array
    if (style.stylers && !Array.isArray(style.stylers)) {
        return false;
    }
    
    return true;
}

/**
 * Filtra un array de estilos, removiendo elementos inválidos y comentarios
 * @param {Array} styles - Array de estilos a filtrar
 * @returns {Array} - Array filtrado con solo estilos válidos
 */
function filterValidStyles(styles) {
    if (!Array.isArray(styles)) {
        return [];
    }
    
    return styles.filter(style => {
        // Remover comentarios y metadatos
        if (style.comment || style.description || style.useCase || style.features) {
            return false;
        }
        
        // Validar estilo de Google Maps
        return isValidMapStyle(style);
    });
}

/**
 * Combina múltiples arrays de estilos en uno solo
 * @param {...Array} styleArrays - Arrays de estilos a combinar
 * @returns {Array} - Array combinado
 */
function combineStyles(...styleArrays) {
    const combined = [];
    
    styleArrays.forEach(styles => {
        if (Array.isArray(styles)) {
            combined.push(...styles);
        }
    });
    
    return combined;
}

/**
 * Crea un estilo de color personalizado
 * @param {string} featureType - Tipo de feature (ej: 'road', 'water')
 * @param {string} elementType - Tipo de elemento (ej: 'geometry', 'labels')
 * @param {string} color - Color en formato hex
 * @param {string} visibility - Visibilidad ('on', 'off', 'simplified')
 * @returns {Object} - Objeto de estilo válido
 */
function createColorStyle(featureType, elementType, color, visibility = null) {
    const style = {
        featureType: featureType,
        elementType: elementType,
        stylers: [{ color: color }]
    };
    
    if (visibility) {
        style.stylers.push({ visibility: visibility });
    }
    
    return style;
}

/**
 * Crea un estilo de visibilidad
 * @param {string} featureType - Tipo de feature
 * @param {string} elementType - Tipo de elemento
 * @param {string} visibility - Visibilidad ('on', 'off', 'simplified')
 * @returns {Object} - Objeto de estilo válido
 */
function createVisibilityStyle(featureType, elementType, visibility) {
    return {
        featureType: featureType,
        elementType: elementType,
        stylers: [{ visibility: visibility }]
    };
}

/**
 * Genera estilos para ocultar todos los POIs
 * @returns {Array} - Array de estilos para ocultar POIs
 */
function createHidePOIsStyles() {
    const poiTypes = [
        'poi', 'poi.business', 'poi.attraction', 'poi.government',
        'poi.medical', 'poi.park', 'poi.place_of_worship',
        'poi.school', 'poi.sports_complex'
    ];
    
    return poiTypes.map(type => 
        createVisibilityStyle(type, 'labels', 'off')
    );
}

/**
 * Genera estilos para un tema de colores específico
 * @param {Object} colorScheme - Esquema de colores
 * @returns {Array} - Array de estilos con el esquema de colores
 */
function createColorSchemeStyles(colorScheme) {
    const styles = [];
    
    // Aplicar colores a diferentes elementos
    if (colorScheme.roads) {
        styles.push(createColorStyle('road', 'geometry', colorScheme.roads));
    }
    
    if (colorScheme.water) {
        styles.push(createColorStyle('water', 'geometry', colorScheme.water));
    }
    
    if (colorScheme.landscape) {
        styles.push(createColorStyle('landscape', 'geometry', colorScheme.landscape));
    }
    
    return styles;
}

/**
 * Valida un archivo de estilos completo
 * @param {Array} styles - Array de estilos a validar
 * @returns {Object} - Resultado de la validación
 */
function validateStylesFile(styles) {
    const result = {
        valid: true,
        errors: [],
        warnings: [],
        stats: {
            total: 0,
            valid: 0,
            invalid: 0,
            comments: 0
        }
    };
    
    if (!Array.isArray(styles)) {
        result.valid = false;
        result.errors.push('El archivo de estilos debe ser un array');
        return result;
    }
    
    result.stats.total = styles.length;
    
    styles.forEach((style, index) => {
        // Contar comentarios
        if (style.comment || style.description || style.useCase || style.features) {
            result.stats.comments++;
            return;
        }
        
        // Validar estilo
        if (isValidMapStyle(style)) {
            result.stats.valid++;
        } else {
            result.stats.invalid++;
            result.errors.push(`Estilo inválido en índice ${index}: ${JSON.stringify(style)}`);
        }
    });
    
    result.valid = result.errors.length === 0;
    
    return result;
}

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidMapStyle,
        filterValidStyles,
        combineStyles,
        createColorStyle,
        createVisibilityStyle,
        createHidePOIsStyles,
        createColorSchemeStyles,
        validateStylesFile
    };
}
