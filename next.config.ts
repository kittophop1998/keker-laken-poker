import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Disable image optimization for Docker
  images: {
    unoptimized: true,
  },
  // Turbopack config (empty to suppress warning)
  turbopack: {},
  // Enable WebSocket support
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    return config;
  },
};

export default nextConfig;
