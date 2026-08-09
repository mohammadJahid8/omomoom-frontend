import { Compass, Heart, SlidersHorizontal } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";

const steps = [
  {
    icon: SlidersHorizontal,
    title: "Discover",
    description:
      "Filter by cuisine, neighborhood, price, dietary needs, vibe and occasion. Narrow 1,000+ restaurants to the right few in seconds.",
  },
  {
    icon: Compass,
    title: "Explore",
    description:
      "Every restaurant leads somewhere else. Similar spots nearby, the same chef's other place, the guide it belongs to.",
  },
  {
    icon: Heart,
    title: "Connect",
    description:
      "Save the places you love, follow the people whose taste you trust, and share what you find with other Miami food lovers.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-surface section-y border-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="Built for people who genuinely love finding food"
          description="Not a directory you search once, but somewhere you keep coming back to."
          align="center"
          className="mx-auto mb-10 lg:mb-14"
        />

        <ol className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {steps.map((step, index) => (
            <li key={step.title} className="text-center md:text-left">
              <div className="bg-brand-subtle text-brand mx-auto mb-5 inline-flex size-11 items-center justify-center rounded-xl md:mx-0">
                <step.icon className="size-5" aria-hidden="true" />
              </div>

              <h3 className="font-heading flex items-center justify-center gap-2 text-lg font-bold md:justify-start">
                <span className="text-muted-foreground/40 text-sm tabular-nums">
                  0{index + 1}
                </span>
                {step.title}
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
