const nextConfig = {
  sassOptions: {
    includePaths: ['./styles'],
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = nextConfig;