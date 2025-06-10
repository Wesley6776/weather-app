module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Optional: Add a plugin to catch text rendering issues at compile time
      // Uncomment if needed for debugging
      // './text-safety-plugin.js',
    ],
  };
};
