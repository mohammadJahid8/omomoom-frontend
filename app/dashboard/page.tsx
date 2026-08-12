import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Camera,
  ChevronRight,
  Compass,
  MapPin,
  Settings,
  Store,
  UserRound,
} from "lucide-react";

import {
  NotBuiltYet,
  Panel,
  PanelTitle,
  StatCard,
} from "@/components/dashboard/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyStats } from "@/lib/auth/contributions";
import { requireSession } from "@/lib/auth/session";
import { isAdmin, isOwner } from "@/types/auth";

const QUICK_LINKS = [
  {
    icon: UserRound,
    title: "Your food map",
    body: "Everything you have reviewed, photographed and saved, in one place.",
    href: "/dashboard/profile",
    tint: "rose",
  },
  {
    icon: Compass,
    title: "Find somewhere to eat",
    body: "430 Miami restaurants, filtered by cuisine, area, price and dish.",
    href: "/restaurants",
    tint: "olive",
  },
  {
    icon: Settings,
    title: "Account settings",
    body: "Your name, username and how you appear on what you contribute.",
    href: "/dashboard/settings",
    tint: "gold",
  },
] as const;

const TINT_CLASS = {
  rose: "bg-tint-rose text-tint-rose-ink",
  gold: "bg-tint-gold text-tint-gold-ink",
  olive: "bg-tint-olive text-tint-olive-ink",
} as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([
    requireSession("/dashboard"),
    getMyStats(),
  ]);

  const audience = isAdmin(user)
    ? "Admin"
    : isOwner(user)
      ? "Restaurant owner"
      : "Member";

  return (
    <>
      <div className="from-tint-rose via-tint-clay/60 to-tint-gold relative mb-6 overflow-hidden rounded-3xl bg-linear-115 px-6 py-8 sm:px-8 sm:py-10">
        <Image
          src="/brand/omomoom-mark.png"
          alt=""
          width={220}
          height={220}
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-12 size-40 rotate-12 opacity-20 sm:-right-6 sm:size-56"
        />
        <div className="relative">
          <p className="text-brand-ink text-xs font-semibold tracking-widest uppercase">
            {greeting()}
          </p>
          <h1 className="font-heading mt-1.5 text-3xl font-extrabold sm:text-[2.25rem]">
            {user.name.split(/\s+/)[0]}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">
            Everything you have eaten, saved and shared, in one place.
          </p>
          <Badge variant="secondary" className="mt-4">
            {audience}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Reviews"
          value={stats.recommendations}
          icon={BookOpen}
          href="/dashboard/profile"
          tint="rose"
        />
        <StatCard
          label="Photos"
          value={stats.photos}
          icon={Camera}
          href="/dashboard/profile/photos"
          tint="gold"
        />
        <StatCard
          label="Places tried"
          value={stats.placesTried}
          icon={MapPin}
          href="/dashboard/profile/tried"
          tint="olive"
        />
        <StatCard
          label="Want to try"
          value={stats.wantToTry}
          icon={Compass}
          href="/dashboard/profile/want-to-try"
          tint="clay"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelTitle
            title="Start somewhere"
            description="The quickest ways in."
          />
          <ul className="grid gap-1.5">
            {QUICK_LINKS.map(({ icon: Icon, title, body, href, tint }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:bg-muted/70 group flex items-center gap-3.5 rounded-2xl p-3 transition-colors"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${TINT_CLASS[tint]}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="text-muted-foreground mt-0.5 block text-sm">
                      {body}
                    </span>
                  </span>
                  <ChevronRight className="text-muted-foreground/50 group-hover:text-foreground size-4 shrink-0 transition-[color,transform] group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <section className="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-3xl p-5 ring-1 ring-foreground/8 sm:p-6">
          <Image
            src="/brand/omomoom-banner.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 24rem, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/15"
            aria-hidden="true"
          />

          <div className="relative">
            <h2 className="font-heading text-lg font-bold text-white">
              {isOwner(user) ? "Your restaurant" : "Own a restaurant?"}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {isOwner(user)
                ? `${user.ownedRestaurantIds.length} listing${user.ownedRestaurantIds.length === 1 ? "" : "s"} under your control.`
                : "Claim your listing to update hours, photos and details yourself."}
            </p>
            <Button
              asChild
              className="mt-4 h-10 w-full rounded-xl bg-white font-semibold text-black hover:bg-white/90"
            >
              <Link href={isOwner(user) ? "/dashboard/restaurant" : "/claim"}>
                <Store />
                {isOwner(user) ? "Manage listing" : "Claim a listing"}
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <div className="mt-4">
        <NotBuiltYet
          title="Your activity feed lands with contributions"
          body="Reviews, photos and saved places all write to your profile automatically once those features ship. The counters above are wired to the same source, so they fill in on their own."
          bullets={[
            "Save a restaurant, and it appears under Want to try",
            "Review a place, and it moves to Places tried",
            "Upload a photo, and it is credited to your username",
          ]}
        />
      </div>
    </>
  );
}
