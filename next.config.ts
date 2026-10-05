import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 80],
    remotePatterns: [
      // Tijdelijke sfeerfotografie. Vervang door eigen foto's in /public/images zodra beschikbaar.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
