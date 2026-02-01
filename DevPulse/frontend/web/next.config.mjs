/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is critical for Prisma 7 + Next 16
  serverExternalPackages: ['@prisma/client', 'pg'],
}

export default nextConfig