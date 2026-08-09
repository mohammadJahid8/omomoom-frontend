import { Clock, MapPin } from "lucide-react";

import { COMMUNITY_EVENTS, type CommunityEvent } from "@/lib/mock/asian-eats";

const TZ = "America/New_York";

const part = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: TZ }).format(
    new Date(iso),
  );

function dateRange(event: CommunityEvent): string {
  const start = part(event.startsAt, { hour: "numeric", minute: "2-digit" });
  if (!event.endsAt) return start;

  const sameDay =
    part(event.startsAt, { dateStyle: "short" }) ===
    part(event.endsAt, { dateStyle: "short" });

  return sameDay
    ? `${start} – ${part(event.endsAt, { hour: "numeric", minute: "2-digit" })}`
    : `Runs to ${part(event.endsAt, { month: "short", day: "numeric" })}`;
}

export function CommunityCalendar() {
  return (
    <ol className="space-y-3">
      {COMMUNITY_EVENTS.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </ol>
  );
}

function EventRow({ event }: { event: CommunityEvent }) {
  return (
    <li className="bg-card hover:border-brand/40 flex gap-4 rounded-2xl border p-4 transition-colors sm:gap-5 sm:p-5">
      <div className="bg-surface flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border sm:size-16">
        <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
          {part(event.startsAt, { month: "short" })}
        </span>
        <span className="font-heading text-xl leading-none font-extrabold tabular-nums sm:text-2xl">
          {part(event.startsAt, { day: "numeric" })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-heading text-base font-bold sm:text-lg">
            {event.title}
          </h3>
          <span className="bg-brand-subtle text-brand rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
            {event.kind}
          </span>
        </div>

        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
          {event.description}
        </p>

        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {dateRange(event)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {event.venue}
            {event.neighborhood ? `, ${event.neighborhood}` : ""}
          </span>
          <span>by {event.organiser}</span>
        </div>
      </div>
    </li>
  );
}
