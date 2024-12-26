const WebExtensionTarget = require('webpack-extension-target');

module.exports = {
  target: false,
  plugins: [WebExtensionTarget(nodeConfig)],
  mode: 'development',

  output: {
    filename: 'bundle.js',
  },
};