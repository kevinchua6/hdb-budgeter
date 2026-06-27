import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    outputFileTracingIncludes: {
      "/api/prices": ["./hdb.db"],
    },
  },
};

export default nextConfig;
