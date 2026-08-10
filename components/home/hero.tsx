import Image from "next/image";

import { HeroSearch } from "@/components/home/hero-search";
import { PopularSearches } from "@/components/home/popular-searches";
import brandMark from "@/public/brand/omomoom-mark.png";
import heroBanner from "@/public/brand/omomoom-banner.webp";

export function Hero() {
  return (
    <section className="relative isolate -mt-16 flex min-h-[36rem] items-center overflow-hidden lg:-mt-18 lg:min-h-[44rem]">
      <Image
        src={heroBanner}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-black/82 from-0% via-black/72 via-50% to-black/62 to-100% sm:bg-linear-to-r sm:from-black/92 sm:via-black/70 sm:via-30% sm:to-transparent sm:to-72% lg:via-black/60 lg:via-34% lg:to-65%"
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-black/55 to-transparent"
        aria-hidden="true"
      />

      <div className="container-page relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
        <div className="max-w-2xl">
          <h1 className="font-heading text-5xl leading-[0.98] font-extrabold text-white sm:text-6xl lg:text-7xl">
            Find your
            <br />
            next <span className="text-brand">bite.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
            Search restaurants, dishes, cuisines, neighborhoods, and hidden gems
            across Miami.
          </p>

          <div className="mt-7">
            <HeroSearch />
          </div>

          <div className="mt-8">
            <p
              id="popular-searches"
              className="mb-3 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase"
            >
              Popular searches
            </p>
            <PopularSearches labelledBy="popular-searches" />
          </div>

          <p className="mt-10 flex items-center gap-2 text-sm text-white/70">
            <Image
              src={brandMark}
              alt=""
              width={20}
              height={20}
              className="shrink-0"
              aria-hidden="true"
            />
            Curated by real people, not algorithms.
          </p>
        </div>
      </div>
    </section>
  );
}
