"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  Minus,
  Search,
  X,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/primitives";
import { Button } from "@/components/ui/button";
import {
  decideClaim,
  listAdminClaims,
  revokeOwnership,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import type { AdminClaim, ClaimCounts } from "@/types/admin";
import type { ApiMeta } from "@/types/api";

const day = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(iso));

const hostOf = (url: string | null) => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

const digits = (value: string | null) => (value ?? "").replace(/\D/g, "");

/** What the claim is asking for, in one sentence rather than a badge and a paragraph. */
function headline(claim: AdminClaim): string {
  const who = claim.user.name;

  if (claim.kind === "NEW_LISTING") {
    return `${who} says this restaurant should be on Omomoom`;
  }
  if (claim.kind === "STALLED") {
    return `${who} wants this listing, but their code never worked`;
  }
  return `${who} wants this listing`;
}

type Signal = { ok: boolean | null; text: string };

/**
 * The evidence, already weighed. An admin should read a verdict, not compare
 * two email addresses by eye.
 */
function signals(claim: AdminClaim): Signal[] {
  const out: Signal[] = [];

  const site = hostOf(claim.restaurant.websiteUrl);
  const mail = claim.workEmail.split("@")[1]?.toLowerCase() ?? null;

  if (site && mail) {
    const match = mail === site || mail.endsWith(`.${site}`);
    out.push({
      ok: match,
      text: match
        ? `Their email is on ${site}, the restaurant's own domain`
        : `Their email is ${mail}, but the listing's site is ${site}`,
    });
  } else if (!site) {
    out.push({
      ok: null,
      text: "The listing has no website, so their email proves nothing",
    });
  }

  const listed = digits(claim.restaurant.phone);
  const theirs = digits(claim.mobilePhone);

  if (!listed) {
    out.push({
      ok: null,
      text: "The listing has no phone, so no code could be sent",
    });
  } else if (theirs && listed.slice(-10) === theirs.slice(-10)) {
    out.push({ ok: true, text: "Their mobile is the number on the listing" });
  }

  if (claim.verifiedAt && claim.codeSentTo) {
    out.push({
      ok: true,
      text: `They typed in a code sent to ${claim.codeSentTo}`,
    });
  }

  const holder = claim.restaurant.owners[0];
  if (holder) {
    out.push({
      ok: null,
      text: `Held by ${holder.user.name} since ${day(holder.createdAt)}`,
    });
  }

  return out.slice(0, 3);
}

function Mark({ ok }: { ok: boolean | null }) {
  const Icon = ok === true ? Check : ok === false ? X : Minus;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full",
        ok === true
          ? "bg-tint-olive text-tint-olive-ink"
          : ok === false
            ? "bg-tint-clay text-tint-clay-ink"
            : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3" strokeWidth={3} />
    </span>
  );
}

type Ask =
  | { kind: "reject"; claimId: string }
  | { kind: "revoke"; claimId: string; userId: string; name: string };

export function ClaimsDesk() {
  const [rows, setRows] = useState<AdminClaim[] | null>(null);
  const [meta, setMeta] = useState<(ApiMeta & { counts: ClaimCounts }) | null>(
    null,
  );

  const [done, setDone] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloads, setReloads] = useState(0);

  const [failed, setFailed] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [reason, setReason] = useState("");
  const [busy, startBusy] = useTransition();

  useEffect(() => {
    let alive = true;

    listAdminClaims({ view: done ? "DECIDED" : "OPEN", q: search, page })
      .then((result) => {
        if (!alive) return;
        setRows(result.claims);
        setMeta(result.meta);
        setFailed(null);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setFailed(
          error instanceof Error ? error.message : "Could not load claims",
        );
        setRows([]);
      });

    return () => {
      alive = false;
    };
  }, [done, search, page, reloads]);

  const run = (work: () => Promise<unknown>) =>
    startBusy(async () => {
      try {
        await work();
        setFailed(null);
        setAsk(null);
        setReason("");
        setReloads((n) => n + 1);
      } catch (error) {
        setFailed(error instanceof Error ? error.message : "That was refused");
      }
    });

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="bg-muted/60 flex gap-1 rounded-xl p-1">
          {[
            { label: "To review", value: false, count: meta?.counts.open },
            { label: "History", value: true, count: meta?.counts.decided },
          ].map((tab) => (
            <button
              key={tab.label}
              aria-pressed={done === tab.value}
              onClick={() => {
                setPage(1);
                setDone(tab.value);
              }}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                done === tab.value
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count === undefined ? null : (
                <span className="text-muted-foreground ms-2 tabular-nums">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
          className="relative"
        >
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute inset-y-0 start-4 my-auto size-4.5"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search restaurant or claimant"
            aria-label="Search claims"
            className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-xl border ps-11 pe-3.5 text-sm outline-none focus-visible:ring-3"
          />
        </form>
      </div>

      {failed ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mb-4 rounded-xl px-4 py-3 text-sm"
        >
          {failed}
        </p>
      ) : null}

      {rows === null ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="bg-card ring-foreground/8 h-40 animate-pulse rounded-2xl ring-1"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            search
              ? "Nothing matched"
              : done
                ? "Nothing settled yet"
                : "Nothing waiting on you"
          }
          body={
            search
              ? `No claim matches "${search}".`
              : done
                ? "Claims you have approved or rejected are kept here."
                : "Most owners verify with a code and never reach this page. Only the ones a code cannot settle land here."
          }
          tint="olive"
        />
      ) : (
        <ol className="grid gap-3">
          {rows.map((claim) => {
            const asking =
              ask && ask.claimId === claim.id ? ask : null;
            const settled =
              claim.status === "APPROVED" || claim.status === "REJECTED";
            const shown = open === claim.id;

            return (
              <li
                key={claim.id}
                className="bg-card ring-foreground/8 rounded-2xl p-4 ring-1 sm:p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-lg font-bold">
                    <Link
                      href={`/restaurants/${claim.restaurant.slug}`}
                      className="hover:text-brand-ink transition-colors"
                    >
                      {claim.restaurant.name}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {day(claim.createdAt)}
                  </p>
                </div>

                <p className="mt-0.5 text-sm">{headline(claim)}</p>

                <ul className="mt-3.5 grid gap-2">
                  {signals(claim).map((signal) => (
                    <li key={signal.text} className="flex gap-2.5 text-sm">
                      <Mark ok={signal.ok} />
                      {signal.text}
                    </li>
                  ))}
                </ul>

                {claim.note ? (
                  <p className="bg-muted/60 mt-3.5 rounded-xl px-3.5 py-3 text-sm leading-relaxed">
                    {claim.note}
                  </p>
                ) : null}

                {settled ? (
                  <div className="mt-3.5">
                    <p className="text-muted-foreground text-sm">
                      {claim.reviewedBy
                        ? `${claim.status === "APPROVED" ? "Approved" : "Rejected"} by ${claim.reviewedBy}${claim.reviewedAt ? ` on ${day(claim.reviewedAt)}` : ""}`
                        : claim.verifiedAt
                          ? "Approved by their code. No admin was involved."
                          : "Settled, with no reviewer recorded."}
                    </p>
                    {claim.reviewNote ? (
                      <p className="text-muted-foreground mt-1 text-sm italic">
                        {claim.reviewNote}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {asking ? (
                  <div className="mt-4 grid gap-3">
                    <label className="text-sm font-semibold">
                      {asking.kind === "reject"
                        ? "Why are you turning this down?"
                        : `Why is ${asking.name} losing this listing?`}
                      <textarea
                        autoFocus
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        rows={2}
                        maxLength={1000}
                        placeholder="Kept on the claim. Nothing is emailed to them yet."
                        className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 mt-2 w-full rounded-xl border px-3.5 py-3 text-sm leading-relaxed font-normal outline-none focus-visible:ring-3"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={busy || reason.trim().length < 5}
                        onClick={() =>
                          run(() =>
                            asking.kind === "reject"
                              ? decideClaim(claim.id, {
                                  action: "REJECT",
                                  note: reason.trim(),
                                })
                              : revokeOwnership({
                                  restaurantId: claim.restaurant.id,
                                  userId: asking.userId,
                                  note: reason.trim(),
                                }),
                          )
                        }
                        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-10 rounded-xl px-4 font-semibold"
                      >
                        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                          setAsk(null);
                          setReason("");
                        }}
                        className="h-10 rounded-xl px-4 font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {settled ? null : (
                      <>
                        <Button
                          disabled={busy}
                          onClick={() =>
                            run(() =>
                              decideClaim(claim.id, { action: "APPROVE" }),
                            )
                          }
                          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-10 rounded-xl px-4 font-semibold"
                        >
                          {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          {claim.kind === "NEW_LISTING"
                            ? "Add it and hand over"
                            : "Hand it over"}
                        </Button>

                        <Button
                          variant="outline"
                          disabled={busy}
                          onClick={() => {
                            setReason("");
                            setAsk({ kind: "reject", claimId: claim.id });
                          }}
                          className="h-10 rounded-xl px-4 font-semibold"
                        >
                          Turn down
                        </Button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setOpen(shown ? null : claim.id)}
                      aria-expanded={shown}
                      className="text-muted-foreground hover:text-foreground ms-auto inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                      Details
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-4 transition-transform",
                          shown && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                )}

                {shown && !asking ? (
                  <dl className="border-foreground/10 mt-4 grid gap-x-6 gap-y-3 border-t pt-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Claimant</dt>
                      <dd>
                        {claim.user.name} (@{claim.user.username}), member since{" "}
                        {day(claim.user.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Says they are</dt>
                      <dd>{claim.claimantRole}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Their contact</dt>
                      <dd className="break-words">
                        {claim.workEmail} · {claim.mobilePhone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">On the listing</dt>
                      <dd className="break-words">
                        {[
                          claim.restaurant.phone,
                          claim.restaurant.email,
                          hostOf(claim.restaurant.websiteUrl),
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Nothing to check against"}
                      </dd>
                    </div>

                    {claim.codeSentTo ? (
                      <div>
                        <dt className="text-muted-foreground">Code</dt>
                        <dd>
                          Sent to {claim.codeSentTo}
                          {claim.codeAttempts > 0
                            ? `, ${claim.codeAttempts} wrong ${claim.codeAttempts === 1 ? "try" : "tries"}`
                            : ""}
                        </dd>
                      </div>
                    ) : null}

                    {claim.restaurant.owners.length > 0 ? (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Held by</dt>
                        {claim.restaurant.owners.map((owner) => (
                          <dd
                            key={owner.userId}
                            className="mt-1 flex flex-wrap items-center justify-between gap-3"
                          >
                            <span>
                              {owner.user.name} · {owner.user.email}
                            </span>
                            <Button
                              variant="outline"
                              disabled={busy}
                              onClick={() => {
                                setReason("");
                                setAsk({
                                  kind: "revoke",
                                  claimId: claim.id,
                                  userId: owner.userId,
                                  name: owner.user.name,
                                });
                              }}
                              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive h-9 rounded-xl font-semibold"
                            >
                              Take it back
                            </Button>
                          </dd>
                        ))}
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}

      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label="Pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            Page {meta.page} of {meta.totalPages}
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
