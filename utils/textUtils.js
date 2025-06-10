/**
 * Utilities for safely handling text and string conversions
 */

/**
 * Safely extracts a nested property from an object using a dot path
 * Returns a default value if the property doesn't exist
 */
export const safeExtract = (obj, path, defaultValue = '') => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  if (!path) return defaultValue;
  
  try {
    const properties = path.split('.');
    let value = obj;
    
    for (const prop of properties) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return defaultValue;
      }
      value = value[prop];
    }
    
    return value !== null && value !== undefined ? value : defaultValue;
  } catch (error) {
    console.warn(`Error extracting ${path} from object:`, error);
    return defaultValue;
  }
};

/**
 * Safely converts any value to a string for text display
 */
export const safeText = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('Failed to stringify object:', error);
      return '[Object]';
    }
  }
  
  return String(value);
};

/**
 * Validates that a value is a proper string for text rendering
 */
export const validateTextValue = (value, source = 'unknown') => {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'object' && !(value instanceof String)) {
    return false;
  }
  
  return true;
};
