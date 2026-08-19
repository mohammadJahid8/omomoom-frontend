import { Compass, MapPin, SlidersHorizontal } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";

const steps = [
  {
    icon: SlidersHorizontal,
    title: "Narrow it down",
    description:
      "Filter by cuisine, neighborhood, price, dish, dietary needs and occasion. Or just describe the night you want and let the search work it out.",
  },
  {
    icon: Compass,
    title: "Read the page",
    description:
      "Signature dishes, opening hours, the chef's story and what the kitchen is actually known for. Enough to decide without opening five tabs.",
  },
  {
    icon: MapPin,
    title: "Go eat",
    description:
      "Directions, the phone number, the menu and the booking link, all on the page. Every route leads to the door, not to another listing.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-surface section-y border-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="Built for people who genuinely love finding food"
          description="From a vague craving to a table, in three steps."
          align="center"
          className="mx-auto mb-10 lg:mb-14"
        />

        <ol className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {steps.map((step) => (
            <li key={step.title} className="text-center md:text-left">
              <div className="bg-brand-subtle text-brand-ink mx-auto mb-5 inline-flex size-11 items-center justify-center rounded-xl md:mx-0">
                <step.icon className="size-5" aria-hidden="true" />
              </div>

              <h3 className="font-heading text-lg font-bold">{step.title}</h3>

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
