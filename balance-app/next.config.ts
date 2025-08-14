import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Asegurar compatibilidad con Next.js 15
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
