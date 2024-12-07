const nextConfig = {
  images: {
    domains: ['example.com'],
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = nextConfig;