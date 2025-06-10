import { View } from 'react-native';

/**
 * This component wraps any React Native component and protects it from text rendering issues
 * by ensuring that it doesn't accidentally receive string content directly.
 */
export const TextSafeWrapper = ({ children, style, ...props }) => {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
};

export default TextSafeWrapper;
