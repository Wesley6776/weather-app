import React from 'react';
import { Text } from 'react-native';

/**
 * A safer Text component that guards against common rendering issues.
 */
export const SafeText = ({ children, style, ...props }) => {
  // Function to safely convert any value to a renderable string
  const safelyRenderContent = (content) => {
    // Handle null or undefined
    if (content === null || content === undefined) {
      return '';
    }
    
    // Handle objects by converting to string
    if (typeof content === 'object' && !React.isValidElement(content)) {
      try {
        return JSON.stringify(content);
      } catch (e) {
        return '[Object]';
      }
    }
    
    // Return the content (should be a string or React element at this point)
    return content;
  };

  return (
    <Text style={style} {...props}>
      {safelyRenderContent(children)}
    </Text>
  );
};

export default SafeText;
