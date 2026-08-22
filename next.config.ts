import type { NextConfig } from "next";

/**
 * Where this Next server reaches the API. Always absolute: server-side fetch
 * cannot resolve a relative URL.
 */
const API_ORIGIN = (
  process.env.API_INTERNAL_URL ?? "http://localhost:5001"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  /** Keeps the session cookie first-party, so server components can read it. */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
  images: {
    /**
     * Imported photos are hotlinked from ~187 hosts. Narrow this to the media
     * domain once they are re-hosted: until then any URL in the database can
     * drive the image optimiser. Do not ship as-is.
     */
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // A slice of the imported URLs are plain http. They still render, they
      // just cannot be trusted, which is one more reason to re-host.
      { protocol: "http", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    // Third party hosts are slow, so fetch each source image rarely.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Fail the production build on a type error rather than shipping it.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
