import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 301 redirect non-www → www so Google only indexes one canonical version
  async redirects() {
    return [
      {
        source:      '/:path*',
        has:         [{ type: 'host', value: 'superbuilder.org' }],
        destination: 'https://www.superbuilder.org/:path*',
        permanent:   true,
      },
    ]
  },

  images: {
    remotePatterns: [
      // Cloudflare R2 — project assets (screenshots, cert PDFs, OG images)
      {
        protocol: "https",
        hostname: "assets.superbuilder.org",
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
