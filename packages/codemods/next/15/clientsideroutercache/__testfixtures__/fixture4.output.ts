const nextConfig = {
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = nextConfig;