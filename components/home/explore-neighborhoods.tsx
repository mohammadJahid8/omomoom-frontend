import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/shared/section-heading";
import { getNeighborhoods } from "@/lib/api/restaurants";
import {
  NEIGHBORHOOD_PHOTOS,
  NEIGHBORHOOD_PHOTO_FALLBACK,
} from "@/lib/static-content";

export async function ExploreNeighborhoods({ limit = 6 }: { limit?: number }) {
  const neighborhoods = (await getNeighborhoods()).slice(0, limit);

  if (neighborhoods.length === 0) return null;

  return (
    <section className="bg-surface section-y border-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="By area"
          title="Explore Miami, neighborhood by neighborhood"
          description="Brickell after work, Wynwood on a Saturday, Coral Gables when it matters. Each area eats differently."
          action={{ label: "Browse all restaurants", href: "/restaurants" }}
          className="mb-8 lg:mb-10"
        />

        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {neighborhoods.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/?area=${area.slug}#find`}
                className="group relative block overflow-hidden rounded-xl"
              >
                <div className="bg-muted relative aspect-3/4">
                  <Image
                    src={
                      NEIGHBORHOOD_PHOTOS[area.slug] ??
                      NEIGHBORHOOD_PHOTO_FALLBACK
                    }
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 lg:p-4">
                  <h3 className="font-heading text-sm font-bold text-white lg:text-base">
                    {area.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/75">
                    {area.count} {area.count === 1 ? "place" : "places"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
