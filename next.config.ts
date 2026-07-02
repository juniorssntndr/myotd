import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 10,
    webpackMemoryOptimizations: true,
  },
  images: {
    localPatterns: [
      {
        pathname: "/uploads/products/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },

      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.imgix.net",
      },
    ],
  },
};

export default nextConfig;
