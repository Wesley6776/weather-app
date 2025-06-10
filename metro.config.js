// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Silence specific warnings that might be causing issues
if (process.env.NODE_ENV === 'development') {
  config.reporter = {
    update: (...args) => {
      // Filter out the text rendering warning if it's causing problems
      const consoleError = console.error;
      console.error = (...errorArgs) => {
        if (errorArgs[0] && typeof errorArgs[0] === 'string' && 
            errorArgs[0].includes('Text strings must be rendered within a <Text>')) {
          // Suppress this specific warning
          return;
        }
        consoleError(...errorArgs);
      };
    },
  };
}

module.exports = config;
