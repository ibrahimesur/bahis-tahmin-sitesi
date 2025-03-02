/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['crests.football-data.org', 'media.api-sports.io'], // Football Data API'den gelen logoları kullanabilmek için
  },
  reactStrictMode: true,
}

module.exports = nextConfig 