import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Cloudflare R2 — project assets (screenshots, cert PDFs, OG images)
      {
        protocol: "https",
        hostname: "assets.superbuilders.zer0.pro",
      },
      // R2 dev/staging bucket direct URL
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Clerk user avatars
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
