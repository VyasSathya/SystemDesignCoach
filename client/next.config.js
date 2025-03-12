/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com']
  },
  async rewrites() {
    return [
      // Real API fallbacks to server API
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/:path*'
      },
      // Mock API paths for development when backend isn't ready
      {
        source: '/api/coaching/:id',
        destination: '/api/mock/coaching/:id'
      },
      {
        source: '/api/coaching/:id/message',
        destination: '/api/mock/coaching/message'
      }
    ];
  },
  webpack: (config) => {
    // Remove any problematic alias for reactflow so Next.js can transpile it properly.
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
};

module.exports = nextConfig;