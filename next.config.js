/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return {
      beforeFiles: [
        // API routes that should go to FastAPI
        {
          source: '/api/products/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/:path*`,
        },
        {
          source: '/api/jobs/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/:path*`,
        },
        {
          source: '/api/scripts/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/scripts/:path*`,
        },
        {
          source: '/api/warehouses/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses/:path*`,
        },
      ],
    }
  },
}

module.exports = nextConfig
