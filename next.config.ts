import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

    return [
      { source: "/api/:path*", headers },
      { source: "/auth/:path*", headers },
      { source: "/dashboard/:path*", headers },
      { source: "/invite/:path*", headers },
      { source: "/login", headers },
      { source: "/onboarding", headers },
      { source: "/reader/:path*", headers },
      { source: "/signup", headers },
    ];
  },
  reactStrictMode: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
