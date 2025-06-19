/** @type {import('next').NextConfig} */
const nextConfig = {
  // === CONFIGURACIÓN DE IMÁGENES ===
  images: {
    domains: ['utfs.io'],
    // Opcional: optimizaciones adicionales para Next.js 15
    formats: ['image/webp', 'image/avif'],
  },
  
  // === CONFIGURACIÓN ESPECÍFICA PARA NEXT.JS 15 ===
  reactStrictMode: true,
  
  // === CONFIGURACIÓN DE ESLINT Y TYPESCRIPT ===
  eslint: {
    // Permitir que Next.js maneje ESLint durante build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Mantener verificación de TypeScript
    ignoreBuildErrors: false,
  },
  
  // === TURBOPACK (AHORA ESTABLE EN NEXT.JS 15) ===
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // === CONFIGURACIONES EXPERIMENTALES ===
  experimental: {
    // Solo configuraciones verdaderamente experimentales
    optimizeCss: true,
  },
  
  // === CONFIGURACIÓN DE COMPILACIÓN ===
  compiler: {
    // Eliminar console.log en producción (opcional)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // === CONFIGURACIÓN DE WEBPACK (SI ES NECESARIA) ===
  webpack: (config, { isServer }) => {
    // Configuraciones específicas si las necesitas
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // === CONFIGURACIÓN DE LOGGING ===
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;