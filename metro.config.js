const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for spaces in folder names
config.resolver.nodeModulesPaths = [
  ...config.resolver.nodeModulesPaths,
];

// Exclude scripts directory from bundling to prevent Node.js modules from being included
config.resolver.blockList = [
  /.*\/scripts\/.*/,
];

// Add crypto polyfill support
config.resolver.alias = {
  buffer: '@craftzdog/react-native-buffer',
  '@': require('path').resolve(__dirname),
  '@/components': require('path').resolve(__dirname, 'components'),
  '@/app': require('path').resolve(__dirname, 'app'),
  '@/context': require('path').resolve(__dirname, 'context'),
  '@/constants': require('path').resolve(__dirname, 'constants'),
};

module.exports = config;
