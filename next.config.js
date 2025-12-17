/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

module.exports = nextConfig;
