"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { EventForm } from "@/components/dashboard/event-form";
import { EmptyState, Panel } from "@/components/dashboard/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteEvent, listAdminEvents } from "@/lib/api/events";
import type { AdminEvent } from "@/types/event";

const TZ = "America/New_York";

const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: TZ }).format(
    new Date(iso),
  );

function occurs(event: AdminEvent): string {
  const start = format(event.startsAt, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  if (!event.endsAt) return start;

  const sameDay =
    format(event.startsAt, { dateStyle: "short" }) ===
    format(event.endsAt, { dateStyle: "short" });

  return sameDay
    ? `${start} – ${format(event.endsAt, { hour: "numeric", minute: "2-digit" })}`
    : `${start} → ${format(event.endsAt, { month: "short", day: "numeric" })}`;
}

const hasPassed = (event: AdminEvent) =>
  new Date(event.endsAt ?? event.startsAt) < new Date();

type Mode = { kind: "list" } | { kind: "new" } | { kind: "edit"; event: AdminEvent };

export function EventsManager() {
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [failed, setFailed] = useState<string | null>(null);
  const [reloads, setReloads] = useState(0);
  const [removing, startRemoving] = useTransition();

  useEffect(() => {
    let alive = true;

    listAdminEvents()
      .then((rows) => {
        if (!alive) return;
        setEvents(rows);
        setFailed(null);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setFailed(
          error instanceof Error ? error.message : "Could not load events",
        );
        setEvents([]);
      });

    return () => {
      alive = false;
    };
  }, [reloads]);

  const reload = useCallback(() => setReloads((n) => n + 1), []);

  const done = useCallback(() => {
    setMode({ kind: "list" });
    reload();
  }, [reload]);

  if (mode.kind !== "list") {
    return (
      <Panel>
        <h2 className="font-heading mb-5 text-lg font-bold">
          {mode.kind === "edit" ? "Edit event" : "New event"}
        </h2>
        <EventForm
          event={mode.kind === "edit" ? mode.event : null}
          onDone={done}
          onCancel={() => setMode({ kind: "list" })}
        />
      </Panel>
    );
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => setMode({ kind: "new" })}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-xl px-5 font-semibold"
        >
          <Plus className="size-4" />
          New event
        </Button>
      </div>

      {failed ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mb-4 rounded-xl px-4 py-3 text-sm"
        >
          {failed}
        </p>
      ) : null}

      {events === null ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="bg-card h-28 animate-pulse rounded-2xl ring-1 ring-foreground/8"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          body="Add the first one and it appears in the Upcoming events rail on Asian Eats as soon as you publish it."
          tint="gold"
        />
      ) : (
        <ol className="grid gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="bg-card rounded-2xl p-5 ring-1 ring-foreground/8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-bold">
                      {event.title}
                    </h3>
                    <Badge
                      variant={
                        event.status === "PUBLISHED" ? "secondary" : "outline"
                      }
                    >
                      {event.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                    {hasPassed(event) ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Past
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-brand-ink mt-1 text-sm font-semibold">
                    {event.organiser}
                  </p>

                  <div className="text-muted-foreground mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4 shrink-0" />
                      {occurs(event)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 shrink-0" />
                      {event.venue}
                      {event.neighborhood ? `, ${event.neighborhood}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label={`Edit ${event.title}`}
                    onClick={() => setMode({ kind: "edit", event })}
                    className="rounded-xl"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label={`Delete ${event.title}`}
                    disabled={removing}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Delete "${event.title}"? This cannot be undone.`,
                        )
                      )
                        return;

                      startRemoving(async () => {
                        try {
                          await deleteEvent(event.id);
                          reload();
                        } catch (error) {
                          setFailed(
                            error instanceof Error
                              ? error.message
                              : "Could not delete that event",
                          );
                        }
                      });
                    }}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
