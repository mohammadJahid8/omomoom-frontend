import {
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { InstagramIcon } from "@/components/shared/social-icons";
import { prettyUrl, socialHandle, telHref } from "@/lib/restaurant";
import type { RestaurantDetailData } from "@/types/api";

export function RestaurantInfo({
  restaurant,
}: {
  restaurant: RestaurantDetailData;
}) {
  const {
    addressLine,
    municipality,
    hoursText,
    phone,
    email,
    websiteUrl,
    menuUrl,
    socials,
  } = restaurant;

  const tel = telHref(phone);
  const instagram = socials?.instagram;

  return (
    <div className="bg-card rounded-2xl border p-6 shadow-(--shadow-card)">
      <h2 className="font-heading text-base font-bold">Good to know</h2>

      <dl className="mt-5 space-y-5">
        {addressLine ? (
          <Row icon={MapPin} label="Address">
            {addressLine}
            {municipality && !addressLine.includes(municipality) ? (
              <span className="text-muted-foreground block">
                {municipality}
              </span>
            ) : null}
          </Row>
        ) : null}

        {hoursText ? (
          <Row icon={Clock} label="Hours">
            {hoursText}
          </Row>
        ) : null}

        {tel && phone ? (
          <Row icon={Phone} label="Phone">
            <a href={tel} className="hover:text-brand transition-colors">
              {phone}
            </a>
          </Row>
        ) : null}

        {websiteUrl ? (
          <Row icon={Globe} label="Website">
            <ExternalLink href={websiteUrl}>
              {prettyUrl(websiteUrl)}
            </ExternalLink>
          </Row>
        ) : null}

        {menuUrl ? (
          <Row icon={UtensilsCrossed} label="Menu">
            <ExternalLink href={menuUrl}>View the menu</ExternalLink>
          </Row>
        ) : null}

        {instagram ? (
          <Row icon={InstagramIcon} label="Instagram">
            <ExternalLink href={instagram}>
              {socialHandle(instagram)}
            </ExternalLink>
          </Row>
        ) : null}

        {email ? (
          <Row icon={Mail} label="Email">
            <a
              href={`mailto:${email}`}
              className="hover:text-brand break-all transition-colors"
            >
              {email}
            </a>
          </Row>
        ) : null}
      </dl>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <Icon className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-sm">
        <dt className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          {label}
        </dt>
        <dd className="mt-1 leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-brand break-all underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  );
}
