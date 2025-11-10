import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // https://github.com/vercel/next.js/issues/64409
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh'
      }
    ]
  },

  // Removed Wikipedia proxy - server-side routes don't need CORS proxy

  // Configure headers for external requests
  async headers () {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key  : 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key  : 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key  : 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
