import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Turbopack mkdir fails on NTFS via WSL DrvFs; use a different dir name to avoid the issue
  ...(process.platform === "linux" && { distDir: ".next-wsl" }),
  outputFileTracingIncludes: {
    "/api/prices": ["./hdb.db"],
  },
};

export default nextConfig;
