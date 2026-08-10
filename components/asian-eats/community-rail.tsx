import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin, Quote } from "lucide-react";

import { COMMUNITY_POSTS } from "@/lib/mock/asian-eats";
import type { CommunityEvent } from "@/types/event";

const TZ = "America/New_York";

const part = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: TZ }).format(
    new Date(iso),
  );

function when(event: CommunityEvent): string {
  const day = part(event.startsAt, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!event.endsAt) return day;

  const sameDay =
    part(event.startsAt, { dateStyle: "short" }) ===
    part(event.endsAt, { dateStyle: "short" });

  return sameDay
    ? day
    : `${part(event.startsAt, { month: "short", day: "numeric" })} – ${part(
        event.endsAt,
        { month: "short", day: "numeric" },
      )}`;
}

function time(event: CommunityEvent): string | null {
  const start = part(event.startsAt, { hour: "numeric", minute: "2-digit" });
  if (!event.endsAt) return start;

  const sameDay =
    part(event.startsAt, { dateStyle: "short" }) ===
    part(event.endsAt, { dateStyle: "short" });

  return sameDay
    ? `${start} – ${part(event.endsAt, { hour: "numeric", minute: "2-digit" })}`
    : null;
}

export function CommunityRail({ events }: { events: CommunityEvent[] }) {
  const posts = COMMUNITY_POSTS.slice(0, 2);

  return (
    <div className="space-y-9">
      <section>
        <h3 className="font-heading border-foreground/15 border-b pb-3 text-xl font-extrabold lg:hidden">
          Upcoming events
        </h3>

        {events.length === 0 ? (
          <p className="border-foreground/15 text-muted-foreground mt-5 rounded-2xl border border-dashed p-5 text-sm leading-relaxed lg:mt-0">
            Nothing on the calendar right now. Check back soon, or follow along
            on Instagram for pop-ups announced at short notice.
          </p>
        ) : null}

        <ol className="mt-5 space-y-3 lg:mt-0">
          {events.map((event) => (
            <li
              key={event.id}
              className="border-foreground/15 bg-card hover:border-foreground/35 rounded-2xl border p-5 transition-colors"
            >
              <h4 className="font-heading text-[1.0625rem] leading-snug font-bold">
                {event.title}
              </h4>
              <p className="text-brand-ink mt-1 text-sm font-semibold">
                {event.organiser}
              </p>

              <dl className="text-muted-foreground mt-3.5 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="sr-only">Date</dt>
                  <CalendarDays
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <dd>
                    {when(event)}
                    {time(event) ? (
                      <span className="text-muted-foreground/80">
                        {" · "}
                        {time(event)}
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="sr-only">Venue</dt>
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <dd>
                    {event.restaurant ? (
                      <Link
                        href={`/restaurants/${event.restaurant.slug}`}
                        className="hover:text-foreground underline-offset-4 hover:underline"
                      >
                        {event.venue}
                      </Link>
                    ) : (
                      event.venue
                    )}
                    {event.neighborhood ? `, ${event.neighborhood}` : ""}
                  </dd>
                </div>
              </dl>

              <p className="text-muted-foreground mt-3.5 text-sm leading-relaxed">
                {event.description}
              </p>

              {event.ticketUrl ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-ink mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  Tickets
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="font-heading text-xl font-extrabold">
          People are saying
        </h3>

        <ol className="mt-4 space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-foreground/15 bg-surface rounded-2xl border p-5"
            >
              <Quote
                className="text-brand/50 size-5 rotate-180"
                aria-hidden="true"
              />
              <blockquote className="mt-2 text-sm leading-relaxed">
                {post.quote}
              </blockquote>
              <p className="text-muted-foreground mt-3.5 text-sm">
                <span className="text-foreground font-semibold">
                  @{post.authorHandle}
                </span>{" "}
                on{" "}
                <Link
                  href={`/restaurants/${post.restaurantSlug}`}
                  className="text-brand-ink font-semibold underline-offset-4 hover:underline"
                >
                  {post.restaurantName}
                </Link>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

