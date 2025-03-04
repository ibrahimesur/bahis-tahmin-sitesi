/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  trailingSlash: true,
  // output: 'export', // API rotalarının çalışması için statik dışa aktarma modunu kaldırıyoruz
}

module.exports = nextConfig
