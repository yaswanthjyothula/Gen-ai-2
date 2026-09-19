import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Prevents double-invocation of graph canvas in dev
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:8000/api/v1/:path*",
      },
      {
        source: "/investigation/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
