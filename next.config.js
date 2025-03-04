/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'media-4.api-sports.io',
      'media-3.api-sports.io',
      'media-2.api-sports.io',
      'media-1.api-sports.io',
      'media.api-sports.io',
      'crests.football-data.org',
      'upload.wikimedia.org',
      'tmssl.akamaized.net',
      'img.uefa.com',
      'www.flashscore.com',
      'www.sofascore.com'
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  trailingSlash: true,
  output: 'standalone', // Netlify için output ayarı
}

module.exports = nextConfig
