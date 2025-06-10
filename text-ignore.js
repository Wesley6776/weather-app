/**
 * This utility silences the specific text rendering warnings
 * Import this file early in your app to stop the warnings
 */

if (console.error) {
  const originalConsoleError = console.error;
  
  console.error = function(...args) {
    // Suppress specific text warnings
    if (args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('Text strings must be rendered within a <Text>')) {
      // Suppress this specific warning
      return;
    }
    
    // Call original for all other errors
    return originalConsoleError.apply(console, args);
  };
}

export default {
  setup: () => {
    // Already set up when imported
    console.log('Text warnings silenced');
  }
};
