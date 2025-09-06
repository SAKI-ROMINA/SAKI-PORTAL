/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // no frena el build si hay errores de TS
  },
  eslint: {
    ignoreDuringBuilds: true, // no frena por ESLint
  },
};

module.exports = nextConfig;
