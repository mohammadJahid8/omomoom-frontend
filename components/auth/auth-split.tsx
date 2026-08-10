import Link from "next/link";
import { Heart, PenLine, Search, type LucideIcon } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";

const VALUE_PROPS: {
  icon: LucideIcon;
  title: string;
  body: string;
  tint: string;
}[] = [
  {
    icon: Search,
    title: "Discover",
    body: "Restaurants, dishes and hidden gems recommended by people who actually eat there.",
    tint: "bg-tint-rose text-tint-rose-ink",
  },
  {
    icon: Heart,
    title: "Save",
    body: "Keep track of the places you love and build your own Miami food list.",
    tint: "bg-tint-olive text-tint-olive-ink",
  },
  {
    icon: PenLine,
    title: "Share",
    body: "Write reviews, add photos, and help other people decide where to eat.",
    tint: "bg-tint-gold text-tint-gold-ink",
  },
];

function ValueProps() {
  return (
    <ul className="grid gap-5 sm:grid-cols-3 sm:gap-6">
      {VALUE_PROPS.map(({ icon: Icon, title, body, tint }) => (
        <li key={title}>
          <span
            className={`inline-flex size-10 items-center justify-center rounded-2xl ${tint}`}
          >
            <Icon className="size-5" />
          </span>
          <h3 className="font-heading mt-3 text-sm font-bold">{title}</h3>
          <p className="text-muted-foreground mt-1 text-[0.8125rem] leading-relaxed">
            {body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AuthSplit({
  headline,
  highlight,
  intro,
  formTitle,
  formSubtitle,
  children,
}: {
  headline: string;
  highlight: string;
  intro: string;
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="bg-surface hidden px-10 py-12 lg:flex lg:flex-col xl:px-16">
        <SiteLogo />

        <div className="my-auto max-w-xl py-10">
          <h2 className="font-heading text-[2.5rem] leading-[1.05] font-extrabold uppercase xl:text-[3rem]">
            {headline}
          </h2>

          <p className="font-heading bg-tint-gold mt-4 inline-block px-2 py-0.5 text-sm font-bold tracking-tight uppercase">
            {highlight}
          </p>

          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
            {intro}
          </p>

          <div className="mt-8">
            <ValueProps />
          </div>

          <div className="border-brand-ink/35 mt-8 max-w-md rounded-2xl border border-dashed p-4">
            <p className="font-heading text-brand-ink text-sm font-bold italic">
              Founding members
            </p>
            <p className="text-muted-foreground mt-1 text-[0.8125rem] leading-relaxed">
              Be one of the first people shaping what restaurant discovery in
              Miami looks like.
            </p>
          </div>
        </div>

        <p className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          Discover. Share. Save. Repeat.
          <Heart className="text-brand fill-brand size-3.5" />
        </p>
      </aside>

      <div className="flex flex-col px-5 py-10 sm:px-8 lg:justify-center lg:px-12 lg:py-12 xl:px-20">
        <div className="mx-auto w-full max-w-[27rem]">
          <div className="mb-8 flex justify-center lg:hidden">
            <SiteLogo />
          </div>

          <h1 className="font-heading text-center text-3xl font-extrabold sm:text-[2rem] lg:text-left">
            {formTitle}
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-sm leading-relaxed lg:text-left">
            {formSubtitle}
          </p>

          <div className="mt-7">{children}</div>

          <p className="text-muted-foreground/80 mt-8 text-center text-xs leading-relaxed lg:text-left">
            By continuing you agree to our{" "}
            <Link href="/terms" className="hover:text-foreground underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-foreground underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-12 w-full max-w-md border-t pt-8 lg:hidden">
          <ValueProps />
        </div>
      </div>
    </div>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        {label}
      </span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}

export function AuthSwitch({
  prompt,
  label,
  href,
}: {
  prompt: string;
  label: string;
  href: string;
}) {
  return (
    <p className="text-muted-foreground mt-6 text-center text-sm lg:text-left">
      {prompt}{" "}
      <Link
        href={href}
        className="text-brand-ink font-semibold underline-offset-4 hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
