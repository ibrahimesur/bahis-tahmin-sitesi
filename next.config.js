/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    unoptimized: true
  },
  trailingSlash: true
}

module.exports = nextConfig;
