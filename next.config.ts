import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    const privateReadingHeaders = [
      ...headers,
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "Referrer-Policy", value: "no-referrer" },
    ];

    return [
      { source: "/api/:path*", headers },
      { source: "/auth/:path*", headers },
      { source: "/dashboard/:path*", headers },
      { source: "/invite/:path*", headers },
      { source: "/login", headers },
      { source: "/onboarding", headers },
      { source: "/read/:path*", headers: privateReadingHeaders },
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
