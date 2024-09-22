module.exports = {
  target: false,
  plugins: [WebExtensionTarget(nodeConfig)],

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};