const WebExtensionTarget = require('webpack-extension-target');

module.exports = {
  target: WebExtensionTarget(nodeConfig),
  mode: 'development',
  output: {
    filename: 'bundle.js',
  },
};