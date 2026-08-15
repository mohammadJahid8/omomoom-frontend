import type { Metadata } from "next";
import { CheckCircle2, Lock } from "lucide-react";

import { ClaimSearch } from "@/components/claim/claim-search";
import { getRestaurants } from "@/lib/api/restaurants";
import { CLAIM_PERIOD, CLAIM_PRICE, COMMUNITY_CONTROLS, OWNER_CONTROLS } from "@/lib/claim";
import { EMPTY_FILTERS } from "@/lib/filters";
import { siteConfig } from "@/lib/site-config";

const PATH = "/claim";

export const metadata: Metadata = {
  title: "Claim your restaurant",
  description:
    "Keep your hours, menu, photos and signature dishes accurate on Omomoom. $49 a month, cancel any time.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    title: "Claim your restaurant on Omomoom",
    description:
      "Take control of your listing: hours, menu, photos and what to order.",
    siteName: siteConfig.name,
    url: `${siteConfig.url}${PATH}`,
  },
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim();

  const result = query
    ? await getRestaurants({ ...EMPTY_FILTERS, q: query }, { limit: 8, facets: false })
    : null;

  return (
    <div className="container-page py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="font-heading text-4xl leading-[1.05] font-extrabold sm:text-5xl">
          Is this your restaurant?
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
          Find your listing and take control of it. Keep your hours right, show
          the dishes you want people to order, and answer the questions guests
          ask before they walk in.
        </p>

        <div className="mt-8">
          <ClaimSearch
            query={query}
            results={result?.restaurants ?? []}
            total={result?.meta.total ?? 0}
          />
        </div>

        {!query ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            <section>
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <CheckCircle2 className="text-brand-ink size-4.5" />
                You control
              </h2>
              <ul className="mt-4 grid gap-2.5">
                {OWNER_CONTROLS.map((item) => (
                  <li
                    key={item}
                    className="text-muted-foreground flex gap-2.5 text-sm leading-relaxed"
                  >
                    <span
                      className="bg-brand-ink mt-2 size-1.5 shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <Lock className="text-muted-foreground size-4.5" />
                You don&rsquo;t
              </h2>
              <ul className="mt-4 grid gap-2.5">
                {COMMUNITY_CONTROLS.map((item) => (
                  <li
                    key={item}
                    className="text-muted-foreground flex gap-2.5 text-sm leading-relaxed"
                  >
                    <span
                      className="bg-border-strong mt-2 size-1.5 shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                What diners say stays theirs. That is what makes it worth
                reading.
              </p>
            </section>
          </div>
        ) : null}

        {!query ? (
          <p className="text-muted-foreground mt-12 text-sm">
            <strong className="text-foreground font-semibold">
              {CLAIM_PRICE} a {CLAIM_PERIOD}
            </strong>{" "}
            once you are verified. Cancel any time, and your listing stays on
            Omomoom either way.
          </p>
        ) : null}
      </div>
    </div>
  );
}
