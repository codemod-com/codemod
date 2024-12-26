module.exports = {
  target: WebExtensionTarget(nodeConfig),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};