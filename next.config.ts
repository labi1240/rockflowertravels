import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  allowedDevOrigins: ["10.0.0.59"],
};

export default nextConfig;
