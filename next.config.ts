import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Experimental features
  experimental: {
    // Enable server actions if needed
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },

  // Image optimization for Docker
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
