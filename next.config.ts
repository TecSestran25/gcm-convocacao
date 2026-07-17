/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! AVISO: Isso desativa a checagem de tipos no build !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! AVISO: Isso desativa o ESLint no build !!
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig