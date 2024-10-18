const nextConfig = {
  env: {
    customKey: 'myValue',
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = nextConfig;