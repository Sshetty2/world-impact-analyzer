import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // https://github.com/vercel/next.js/issues/64409
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
