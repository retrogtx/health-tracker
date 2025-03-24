import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@mapbox/node-pre-gyp', 'fs.realpath'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@mapbox/node-pre-gyp': false,
      'fs.realpath': false,
      'fs': false,
      'net': false,
      'tls': false,
      'dns': false,
      'child_process': false,
    };
    return config;
  },
};

export default nextConfig;
