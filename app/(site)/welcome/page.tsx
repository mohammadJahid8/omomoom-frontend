import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Compass, Heart, UtensilsCrossed } from "lucide-react";

import { WelcomeSetup } from "@/components/auth/welcome-setup";
import { requireSession } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

const ACTIONS = [
  {
    icon: Compass,
    title: "Explore restaurants",
    body: "430 Miami restaurants, filtered by cuisine, neighborhood, price and dish.",
    href: "/restaurants",
  },
  {
    icon: UtensilsCrossed,
    title: "Browse Asian Eats",
    body: "The dishes worth crossing town for, and who is cooking them.",
    href: "/asian-eats",
  },
  {
    icon: Heart,
    title: "Recommend a dish",
    body: "Tell everyone what to order. Landing with the next release.",
    href: null,
  },
  {
    icon: Camera,
    title: "Add a photo",
    body: "Your shots of the plate, on the restaurant's page. Coming soon.",
    href: null,
  },
] as const;

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const user = await requireSession("/welcome");

  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-brand-ink text-xs font-semibold tracking-[0.14em] uppercase">
          You&rsquo;re in
        </p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold sm:text-[2.25rem]">
          Welcome to Omomoom, {firstName}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm sm:text-base">
          We picked a username for you so you didn&rsquo;t have to. Keep it or
          make it yours.
        </p>

        <div className="mt-7">
          <WelcomeSetup user={user} next={next} />
        </div>

        <h2 className="font-heading mt-12 text-lg font-bold">
          Start contributing
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ACTIONS.map(({ icon: Icon, title, body, href }) => {
            const content = (
              <>
                <span className="bg-brand-subtle text-brand-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="text-muted-foreground mt-0.5 block text-sm">
                    {body}
                  </span>
                </span>
              </>
            );

            return (
              <li key={title}>
                {href ? (
                  <Link
                    href={href}
                    className="bg-card hover:shadow-(--shadow-card) flex h-full items-start gap-3 rounded-xl p-4 ring-1 ring-foreground/10 transition-shadow"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="bg-card/60 flex h-full items-start gap-3 rounded-xl p-4 ring-1 ring-foreground/8 opacity-70">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
