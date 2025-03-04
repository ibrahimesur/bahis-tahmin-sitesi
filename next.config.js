/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'via.placeholder.com', 
      'images.unsplash.com',
      'media-4.api-sports.io',
      'media-3.api-sports.io',
      'media-2.api-sports.io',
      'media-1.api-sports.io',
      'media.api-sports.io',
      'crests.football-data.org',
      'upload.wikimedia.org',
      'tmssl.akamaized.net',
      'img.uefa.com'
    ],
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
  },
  trailingSlash: true,
  output: 'export', // Statik site dışa aktarma modu
  // Performans optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig;
