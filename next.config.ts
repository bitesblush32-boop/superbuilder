import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 301 redirect www → non-www so Google only indexes one canonical version
  async redirects() {
    return [
      {
        source:      '/:path*',
        has:         [{ type: 'host', value: 'www.superbuilder.org' }],
        destination: 'https://superbuilder.org/:path*',
        permanent:   true,   // 301 — tells Google to transfer all link equity
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
