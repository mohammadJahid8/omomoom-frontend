import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { GUIDES } from "@/lib/static-content";

export function CuratedGuides() {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="The guides"
          title="Curated by people who eat out constantly"
          description="Short, opinionated lists for when you know the occasion but not the restaurant."
          action={{ label: "All guides", href: "/guides" }}
          className="mb-8 lg:mb-10"
        />

        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="group bg-card relative flex flex-col overflow-hidden rounded-2xl border transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:border-border-strong hover:-translate-y-1 hover:shadow-(--shadow-card-hover)"
            >
              <div className="bg-muted relative aspect-16/10 overflow-hidden">
                <Image
                  src={guide.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-lg leading-snug font-bold">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="before:absolute before:inset-0"
                  >
                    {guide.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {guide.description}
                </p>
                <span className="text-brand-ink mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                  Read the guide
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
