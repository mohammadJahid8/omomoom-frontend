import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterStateProvider } from "@/components/filters/filter-state";
import { ClaimCta } from "@/components/home/claim-cta";
import { CuratedGuides } from "@/components/home/curated-guides";
import { ExploreNeighborhoods } from "@/components/home/explore-neighborhoods";
import { FinderSkeleton } from "@/components/home/finder-skeleton";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { RestaurantFinder } from "@/components/home/restaurant-finder";
import { parseFilters, type SearchParams } from "@/lib/filters";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} · ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: { "@id": `${siteConfig.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      areaServed: {
        "@type": "City",
        name: siteConfig.city,
        addressRegion: "FL",
        addressCountry: "US",
      },
      sameAs: [siteConfig.links.instagram, siteConfig.links.tiktok],
    },
  ],
};

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = parseFilters(await searchParams);

  return (
    <>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <FilterStateProvider filters={filters}>
        <Hero />

        <Suspense fallback={<FinderSkeleton />}>
          <RestaurantFinder filters={filters} />
        </Suspense>
      </FilterStateProvider>

      <ExploreNeighborhoods />
      <CuratedGuides />
      <HowItWorks />
      <ClaimCta />
    </>
  );
}
