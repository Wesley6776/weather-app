/**
 * This file contains instrumentation for the app to help debug and log issues
 * related to text rendering and other common React Native problems.
 */

/**
 * Set up a global error listener to monitor text rendering errors
 * Call this function early in your app's initialization
 */
export const setupTextErrorMonitoring = (): (() => void) => {
  // Just return a no-op function
  return () => {};
};

/**
 * Monitor all Text component renders in development
 */
export const monitorTextRenders = (enabled = true) => {
  // No-op
};
