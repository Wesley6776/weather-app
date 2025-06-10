/**
 * A dedicated utility for suppressing specific React Native errors
 * Import this at the top of your app entry point before any other imports
 */

// Save the original console.error function
const originalConsoleError = console.error;

// Replace with custom implementation
console.error = function(...args) {
  // Check if this is the text string warning
  if (
    args[0] && 
    typeof args[0] === 'string' && 
    args[0].includes('Text strings must be rendered within a <Text>')
  ) {
    // Completely ignore this specific warning
    return;
  }
  
  // Forward all other errors to the original function
  return originalConsoleError.apply(console, args);
};

export const setupErrorSuppression = () => {
  // Already applied when imported, this is just for explicit usage
  console.log('Error suppression active');
  
  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
    console.log('Error suppression removed');
  };
};

export default { setupErrorSuppression };
