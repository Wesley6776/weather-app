/**
 * Utility to help debug text rendering issues in React Native
 * Add this to specific components to identify text rendering problems
 */

import { Text, View } from 'react-native';

/**
 * Wraps children in a colored border to help identify components with rendering issues
 */
export const DebugContainer = ({ children, name = 'Unknown', enabled = false }) => {
  if (!enabled) return children;
  
  return (
    <View 
      style={{ 
        borderWidth: 1, 
        borderColor: 'red', 
        padding: 2, 
        margin: 1
      }}
    >
      {/* Debug label */}
      <Text style={{ fontSize: 8, color: 'red' }}>{name}</Text>
      {children}
    </View>
  );
};

/**
 * Inspects all child components to find text strings not wrapped in Text components
 * This is a debugging utility only and should be removed in production
 */
export const checkChildrenForTextIssues = (children) => {
  if (__DEV__) {
    try {
      // Check if children contains direct string content
      if (typeof children === 'string' || typeof children === 'number') {
        console.warn(`[Text Debug] Found unwrapped text: "${children}"`);
        return true;
      }
      
      // Check if children is an array with string content
      if (Array.isArray(children)) {
        let foundIssue = false;
        children.forEach((child, index) => {
          if (typeof child === 'string' || typeof child === 'number') {
            console.warn(`[Text Debug] Found unwrapped text in array at index ${index}: "${child}"`);
            foundIssue = true;
          }
        });
        return foundIssue;
      }
    } catch (err) {
      // Ignore any errors in the debug utility
    }
  }
  return false;
};

/**
 * Run this function in your render method to check for text rendering issues
 * in specific areas of your component
 */
export const debugTextIssues = (componentName, jsx) => {
  if (__DEV__) {
    try {
      // We can't actually inspect the JSX here, so just log for manual checking
      console.log(`[Text Debug] Checking ${componentName} for text issues`);
    } catch (err) {
      // Ignore any errors in the debug utility
    }
  }
  return jsx;
};

/**
 * A wrapper for View that helps detect text rendering issues
 * Use this in place of View in areas where you suspect issues
 */
export const DebugView = ({ children, style, name = 'DebugView', ...props }) => {
  const hasIssue = checkChildrenForTextIssues(children);
  
  return (
    <View 
      style={[
        style,
        hasIssue ? { borderWidth: 2, borderColor: 'red' } : null
      ]} 
      {...props}
    >
      {hasIssue && __DEV__ && (
        <Text style={{ color: 'red', fontSize: 10 }}>Text issue in {name}</Text>
      )}
      {children}
    </View>
  );
};
