import type { NextConfig } from "next";

/**
 * Where this Next server reaches the API. Always absolute: server-side fetch
 * cannot resolve a relative URL.
 */
const API_ORIGIN = (
  process.env.API_INTERNAL_URL ?? "http://localhost:5001"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  /**
   * The browser talks to the API through this app's own origin. Deployed, the
   * frontend and the API sit on different hosts, so a cookie set by the API
   * directly is third-party: the browser will not send it back to *us*, and
   * every server component that reads `cookies()` sees an anonymous visitor.
   * Proxying keeps the session cookie first-party, which is also what lets it
   * stay SameSite=Lax.
   */
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
     * The imported restaurant photos are hotlinked from 187 different hosts
     * (the restaurants' own sites, BentoBox, Squarespace, OpenTable, Yelp).
     * Listing them is impractical, so this is a deliberate wildcard.
     *
     * It is temporary. Once the client confirms image rights, a script
     * re-hosts every photo to our own storage and this narrows to that one
     * hostname. Do not ship the wildcard to production: it lets any HTTPS URL
     * in the database drive our image optimiser, which is a resource-abuse
     * vector if an admin account is ever compromised.
     */
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // A slice of the imported URLs are plain http. They still render, they
      // just cannot be trusted, which is one more reason to re-host.
      { protocol: "http", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    // Third party hosts vary wildly in quality; cache aggressively so we fetch
    // each source image once rather than on every revalidation
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Fail the production build on a type error rather than shipping it.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
