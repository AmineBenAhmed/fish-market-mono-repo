const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [...(config.watchFolders || []), '../../packages'];
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  'node_modules',
  '../../node_modules',
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
