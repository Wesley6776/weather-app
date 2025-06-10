import React from 'react';
import { Text, TextProps } from 'react-native';
import { safeText } from '../utils/textUtils';

/**
 * A safe Text component that ensures content is always properly rendered
 */
export const SafeText: React.FC<TextProps & { children: any }> = ({ 
  children, 
  style, 
  ...props 
}) => {
  // Ensure children is always a string
  const safeChildren = safeText(children);
  
  return React.createElement(Text, { style, ...props }, safeChildren);
};
