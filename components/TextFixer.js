import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * TextFixer wraps content and ensures any text within is properly contained
 * in Text components. This can help fix text rendering issues.
 */
export const TextFixer = ({ children, style }) => {
  // Process the children to fix text rendering issues
  const processChildren = (child) => {
    // If it's a string or number, wrap it in a Text component
    if (typeof child === 'string' || typeof child === 'number') {
      return <Text style={styles.fixerText}>{child}</Text>;
    }
    
    // If it's an array, process each item
    if (Array.isArray(child)) {
      return child.map((item, index) => (
        <React.Fragment key={index}>
          {processChildren(item)}
        </React.Fragment>
      ));
    }
    
    // If it's a React element, return it as is
    if (React.isValidElement(child)) {
      return child;
    }
    
    // For other types like null/undefined, just return null
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {processChildren(children)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Transparent container
  },
  fixerText: {
    // Default text styling
  }
});

export default TextFixer;
