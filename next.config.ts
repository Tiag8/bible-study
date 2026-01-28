import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ SWC Cache: Desabilitar cache agressivo que causa issues com Tiptap
  // Tiptap uses keyed plugins que não lidam bem com SWC incremental cache
  swcMinify: true,

  // ✅ Compiler: Opções de transpilação seguras para React 19 + Tiptap
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ✅ Webpack: Configuração para evitar duplicate plugin instances
  webpack: (config, { isServer }) => {
    // Evitar cache agressivo que causa "Adding different instances of a keyed plugin"
    if (!isServer) {
      // Aumentar limite de memory para maior stability
      config.performance = {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      };
    }
    return config;
  },

  // ✅ TypeScript: Strict mode para evitar type issues
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // ✅ Logging: Ativa verbose logs para debug (comentar em produção)
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
};

export default nextConfig;
