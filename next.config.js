/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  trailingSlash: true,
  output: 'export', // Statik site dışa aktarma modu
}

module.exports = nextConfig
