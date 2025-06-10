import React from 'react';
import { Text, TextProps } from 'react-native';

/**
 * Utility to safely extract values from nested objects with type checking
 * @param obj The object to extract from
 * @param path The dot-notation path to the desired property
 * @param defaultValue The default value to return if the path doesn't exist
 * @returns The value at the path or the default value
 */
export const safeExtract = <T>(obj: any, path: string, defaultValue: T): T => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== null && current !== undefined ? current : defaultValue;
};

/**
 * Validates that a value can be safely rendered in a Text component
 * @param value The value to validate
 * @param source Where the value is coming from (for logging)
 * @returns true if the value is safe for rendering, false otherwise
 */
export const validateTextValue = (value: any, source: string): boolean => {
  if (value === null || value === undefined) {
    console.log(`WARNING: Null or undefined text value from: ${source}`);
    return false;
  }
  
  if (typeof value === 'object') {
    console.log(`WARNING: Object passed as text from: ${source}`, value);
    return false;
  }
  
  return true;
};

/**
 * Safely converts a value to a string for text rendering
 * @param value The value to convert
 * @param defaultValue The default value to use if value is null/undefined
 * @returns A string safe for rendering
 */
export const safeText = (value: any, defaultValue = ''): string => {
  if (value === null || value === undefined) return defaultValue;
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return defaultValue;
    }
  }
  
  return String(value);
};

/**
 * A safe Text component that ensures content is always properly rendered
 * @param props Regular Text props plus children
 * @returns Text component with safely formatted children
 */
export const SafeText = ({ children, style, ...props }: TextProps & { children: any }): React.ReactElement => {
  // Ensure children is always a string
  const safeChildren = typeof children === 'string' ? children : 
                      children === null || children === undefined ? '' :
                      typeof children === 'object' ? JSON.stringify(children) : 
                      String(children);
  
  return React.createElement(Text, { style, ...props }, safeChildren);
};
