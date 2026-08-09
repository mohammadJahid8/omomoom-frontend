import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

const benefits = [
  "Update your menu, hours and contact details",
  "Upload professional photos and choose your hero image",
  "Tell your story: the chef, the founding, what makes it yours",
  "Respond to reviews and keep your page accurate",
];

export function ClaimCta() {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="bg-foreground text-background relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div
            className="bg-brand/20 pointer-events-none absolute -top-24 -right-20 size-72 rounded-full blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="text-brand mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
                For restaurant owners
              </p>
              <h2 className="font-heading text-2xl leading-tight font-extrabold sm:text-3xl lg:text-[2.5rem]">
                Your restaurant is already on Omomoom.
                <span className="text-background/55"> Take control of it.</span>
              </h2>
              <p className="text-background/70 mt-4 max-w-md text-base leading-relaxed">
                Every restaurant in Miami has a page here. Claiming yours takes
                a few minutes and puts you in charge of how thousands of diners
                see your business.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-full"
                >
                  <Link href="/claim">
                    Claim your restaurant
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-background/25 text-background hover:bg-background/10 hover:text-background rounded-full bg-transparent"
                >
                  <Link href="/for-restaurants">See how it works</Link>
                </Button>
              </div>
            </div>

            <ul className="space-y-3.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="bg-brand/15 text-brand mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <span className="text-background/85 text-sm leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
