const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));
    // Important: return the modified config
    return config;
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};
module.exports = nextConfig;