/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'github.com',
      'raw.githubusercontent.com',
      'c.saavncdn.com',
    ],
  },
  // Optimize build output
  experimental: {
    optimizePackageImports: ['framer-motion', 'recharts'],
  },
  // Reduce bundle size in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Optimize CSS
  optimizeCss: true,
};

module.exports = nextConfig;
