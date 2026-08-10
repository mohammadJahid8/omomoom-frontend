import {
  CalendarCheck,
  Globe,
  Navigation,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ShareButton } from "@/components/restaurant/detail/share-button";
import { Button } from "@/components/ui/button";
import { directionsUrl, telHref } from "@/lib/restaurant";
import type { RestaurantDetailData } from "@/types/api";

type Action = {
  label: string;
  href: string;
  icon: LucideIcon;

  external?: boolean;
  primary?: boolean;
};

export function RestaurantActions({
  restaurant,
  summary,
}: {
  restaurant: RestaurantDetailData;

  summary: string;
}) {
  const tel = telHref(restaurant.phone);
  const directions = directionsUrl(restaurant);

  const actions: Action[] = [
    restaurant.reservationUrl && {
      label: "Reserve a table",
      href: restaurant.reservationUrl,
      icon: CalendarCheck,
      external: true,
      primary: true,
    },
    restaurant.menuUrl && {
      label: "View menu",
      href: restaurant.menuUrl,
      icon: UtensilsCrossed,
      external: true,
    },
    directions && {
      label: "Directions",
      href: directions,
      icon: Navigation,
      external: true,
    },
    tel && { label: "Call", href: tel, icon: Phone },
    restaurant.websiteUrl && {
      label: "Website",
      href: restaurant.websiteUrl,
      icon: Globe,
      external: true,
    },
  ].filter(Boolean) as Action[];

  return (
    <div className="mt-7 flex flex-wrap gap-2.5">
      {actions.map(({ label, href, icon: Icon, external, primary }) => (
        <Button
          key={label}
          asChild
          size="lg"
          variant={primary ? "default" : "outline"}
          className={
            primary
              ? "bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-full px-5"
              : "h-11 rounded-full px-5"
          }
        >
          <a
            href={href}

            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </a>
        </Button>
      ))}

      <ShareButton name={restaurant.name} summary={summary} />
    </div>
  );
}
