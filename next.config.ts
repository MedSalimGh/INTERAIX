import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
        port: "",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Suppress source map warnings (these are harmless but noisy)
  webpack: (config) => {
    // Ignore source map warnings from node_modules
    config.ignoreWarnings = [
      {
        module: /node_modules/,
        message: /Invalid source map/,
      },
    ];
    return config;
  },
};

export default nextConfig;
