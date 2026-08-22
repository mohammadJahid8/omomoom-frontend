"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Store,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { EmptyState, Panel } from "@/components/dashboard/primitives";
import { RestaurantForm } from "@/components/dashboard/restaurant-form";
import { RestaurantPhotosEditor } from "@/components/dashboard/restaurant-photos-editor";
import { SelectField } from "@/components/shared/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteRestaurant,
  getAdminRestaurant,
  listAdminRestaurants,
} from "@/lib/api/admin";
import type { AdminRestaurant, AdminRestaurantRow } from "@/types/admin";
import type { ApiMeta } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_FILTER = [
  { value: "ALL", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "HIDDEN", label: "Hidden" },
];

const STATUS_TONE: Record<string, string> = {
  PUBLISHED: "bg-tint-olive text-tint-olive-ink",
  DRAFT: "bg-tint-gold text-tint-gold-ink",
  HIDDEN: "bg-muted text-muted-foreground",
};

type Mode =
  | { kind: "list" }
  | { kind: "new" }
  | { kind: "edit"; restaurant: AdminRestaurant };

export function RestaurantsManager() {
  const [rows, setRows] = useState<AdminRestaurantRow[] | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [reloads, setReloads] = useState(0);

  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [failed, setFailed] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<AdminRestaurant | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  useEffect(() => {
    let alive = true;

    listAdminRestaurants({ q: search, status, page })
      .then((result) => {
        if (!alive) return;
        setRows(result.restaurants);
        setMeta(result.meta);
        setFailed(null);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setFailed(
          error instanceof Error ? error.message : "Could not load restaurants",
        );
        setRows([]);
      });

    return () => {
      alive = false;
    };
  }, [search, status, page, reloads]);

  const reload = useCallback(() => setReloads((n) => n + 1), []);

  const openEdit = (id: string) =>
    startBusy(async () => {
      try {
        setMode({ kind: "edit", restaurant: await getAdminRestaurant(id) });
      } catch (error) {
        setFailed(
          error instanceof Error ? error.message : "Could not open that record",
        );
      }
    });

  const askDelete = (id: string) =>
    startBusy(async () => {
      try {
        setConfirming(await getAdminRestaurant(id));
      } catch (error) {
        setFailed(
          error instanceof Error ? error.message : "Could not open that record",
        );
      }
    });

  if (mode.kind !== "list") {
    return (
      <div className="grid gap-4">
        <Panel>
          <h2 className="font-heading mb-5 text-lg font-bold">
            {mode.kind === "edit" ? mode.restaurant.name : "New restaurant"}
          </h2>
          <RestaurantForm
            restaurant={mode.kind === "edit" ? mode.restaurant : null}
            onDone={() => {
              setMode({ kind: "list" });
              reload();
            }}
            onCancel={() => setMode({ kind: "list" })}
          />
        </Panel>

        {/* Only once it exists: a photo needs a restaurant to belong to. */}
        {mode.kind === "edit" ? (
          <RestaurantPhotosEditor
            restaurantId={mode.restaurant.id}
            slug={mode.restaurant.slug}
          />
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute inset-y-0 start-4 my-auto size-4.5"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, city or cuisine"
              aria-label="Search restaurants"
              className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-xl border ps-11 pe-3.5 text-sm outline-none focus-visible:ring-3"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="h-12 shrink-0 rounded-xl px-4 font-semibold"
          >
            Search
          </Button>
        </form>

        <div className="sm:w-52">
          <SelectField
            name="statusFilter"
            label=""
            options={STATUS_FILTER}
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            aria-label="Filter by status"
          />
        </div>

        <Button
          onClick={() => setMode({ kind: "new" })}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 rounded-xl px-5 font-semibold"
        >
          <Plus className="size-4" />
          New
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

      {confirming ? (
        <DeleteConfirm
          restaurant={confirming}
          busy={busy}
          onCancel={() => {
            setConfirming(null);
            setWarning(null);
          }}
          warning={warning}
          onConfirm={() =>
            startBusy(async () => {
              try {
                await deleteRestaurant(confirming.id, Boolean(warning));
                setConfirming(null);
                setWarning(null);
                reload();
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Could not delete that restaurant";

                // The API refuses once and explains what would be cancelled.
                // Keep that explanation in front of the admin rather than
                // burying it in the page-level error strip.
                if (/subscription/i.test(message)) setWarning(message);
                else setFailed(message);
              }
            })
          }
        />
      ) : null}

      {rows === null ? (
        <div className="grid gap-3">
          {[0, 1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-card h-20 animate-pulse rounded-2xl ring-1 ring-foreground/8"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Store}
          title={search ? "Nothing matched" : "No restaurants yet"}
          body={
            search
              ? `No restaurant matches "${search}". Try a shorter search or a different status.`
              : "Add the first listing and it appears across the site as soon as you publish it."
          }
          tint="olive"
        />
      ) : (
        <ol className="grid gap-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="bg-card rounded-2xl p-4 ring-1 ring-foreground/8 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-bold">
                      {row.name}
                    </h3>
                    <Badge className={cn("border-0", STATUS_TONE[row.status])}>
                      {row.status[0] + row.status.slice(1).toLowerCase()}
                    </Badge>
                    {row.claimState === "CLAIMED" ? (
                      <Badge variant="outline">Claimed</Badge>
                    ) : null}
                  </div>

                  <p className="text-muted-foreground mt-1.5 text-sm">
                    {[
                      row.neighborhood?.name ?? row.municipality,
                      row.reviewCount > 0
                        ? `${row.ratingAverage.toFixed(1)} from ${row.reviewCount}`
                        : "No ratings yet",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {row.status === "PUBLISHED" ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-lg"
                      className="rounded-xl"
                    >
                      <Link
                        href={`/restaurants/${row.slug}`}
                        target="_blank"
                        aria-label={`View ${row.name} on the site`}
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  ) : null}

                  <Button
                    variant="ghost"
                    size="icon-lg"
                    disabled={busy}
                    aria-label={`Edit ${row.name}`}
                    onClick={() => openEdit(row.id)}
                    className="rounded-xl"
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-lg"
                    disabled={busy}
                    aria-label={`Delete ${row.name}`}
                    onClick={() => askDelete(row.id)}
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

      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label="Pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString()}{" "}
            total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              className="h-10 rounded-xl"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((n) => n + 1)}
              className="h-10 rounded-xl"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </nav>
      ) : null}
    </>
  );
}

function DeleteConfirm({
  restaurant,
  busy,
  warning,
  onCancel,
  onConfirm,
}: {
  restaurant: AdminRestaurant;
  busy: boolean;
  /** What the API refused over, if it did. Present means the next press forces it. */
  warning: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const losses = [
    [restaurant._count.recommendations, "recommendation"],
    [restaurant._count.savedBy, "saved list"],
    [restaurant._count.events, "event"],
  ] as [number, string][];

  const real = losses.filter(([count]) => count > 0);

  return (
    <div
      role="alertdialog"
      aria-labelledby="delete-title"
      className="border-destructive/40 bg-destructive/5 mb-4 rounded-2xl border p-5"
    >
      <div className="flex gap-3">
        <TriangleAlert className="text-destructive mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 id="delete-title" className="font-heading text-base font-bold">
            {warning ? `Really delete ${restaurant.name}?` : `Delete ${restaurant.name}?`}
          </h3>

          {warning ? (
            <p className="bg-destructive/10 text-destructive mt-2 rounded-xl px-3.5 py-3 text-sm leading-relaxed">
              {warning}
            </p>
          ) : null}

          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {real.length > 0
              ? `This also removes ${real
                  .map(
                    ([count, noun]) =>
                      `${count} ${noun}${count === 1 ? "" : "s"}`,
                  )
                  .join(", ")}. That cannot be undone.`
              : "Nothing else is attached to it. This cannot be undone."}
          </p>

          {real.length > 0 ? (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              To take it off the site without losing anything, set the status to
              Hidden instead.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={onConfirm}
              disabled={busy}
              className="bg-destructive h-10 rounded-xl px-4 font-semibold text-white hover:bg-destructive/90"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {warning ? "Delete and cancel the subscription" : "Delete permanently"}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={busy}
              className="h-10 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
