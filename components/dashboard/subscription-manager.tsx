"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Loader2, ShieldCheck } from "lucide-react";

import { Panel, PanelTitle } from "@/components/dashboard/primitives";
import { Button } from "@/components/ui/button";
import { toFormError } from "@/lib/api/auth";
import {
  billingPortalUrl,
  cancelSubscription,
  resumeSubscription,
  startSubscription,
} from "@/lib/api/subscriptions";
import { OWNER_CONTROLS } from "@/lib/claim";
import { formatMiami } from "@/lib/miami-time";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/types/subscription";

const LONG = { month: "long", day: "numeric", year: "numeric" } as const;

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

/** What the money is doing right now, said plainly. */
function state(subscription: Subscription) {
  const until = subscription.subscribedUntil
    ? formatMiami(subscription.subscribedUntil, LONG)
    : null;

  if (subscription.subscriptionStatus === "CANCELLED") {
    return {
      label: "Cancelled",
      tone: "bg-tint-gold text-tint-gold-ink",
      detail: until
        ? `You can edit until ${until}. Nothing more will be charged, and you can change your mind before then.`
        : "Nothing more will be charged.",
    };
  }

  if (subscription.subscriptionStatus === "PAST_DUE") {
    return {
      label: "Payment failed",
      tone: "bg-tint-clay text-tint-clay-ink",
      detail: "We could not take the last payment. Editing is paused.",
    };
  }

  if (subscription.active) {
    return {
      label: "Active",
      tone: "bg-tint-olive text-tint-olive-ink",
      detail: until ? `Next payment ${until}.` : "Running.",
    };
  }

  return {
    label: "Not subscribed",
    tone: "bg-muted text-muted-foreground",
    detail: "Your listing is live, but you cannot edit it yet.",
  };
}

export function SubscriptionManager({
  subscription,
}: {
  subscription: Subscription;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [asking, setAsking] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const returned = params.get("checkout");

  /**
   * Coming back from Stripe does not mean the webhook has arrived. Telling
   * someone who has just paid that they are "not subscribed" is the worst
   * moment to be wrong, so the page waits and looks again instead.
   */
  const settling = returned === "success" && !subscription.active;

  useEffect(() => {
    if (!settling) return;
    const timer = setTimeout(() => router.refresh(), 2000);
    return () => clearTimeout(timer);
  }, [settling, router, subscription.subscriptionStatus]);

  const now = state(subscription);
  const until = subscription.subscribedUntil
    ? formatMiami(subscription.subscribedUntil, LONG)
    : null;

  const run = (work: () => Promise<unknown>) =>
    start(async () => {
      try {
        await work();
        setAsking(false);
        setFailed(null);
        router.refresh();
      } catch (error) {
        setFailed(toFormError(error).message);
      }
    });

  const canStart = !subscription.active;

  /**
   * Cancelled, but the month is still paid for. The only useful action here is
   * to change your mind: offering "cancel" again would do nothing, and
   * "start" would be refused because it is technically still running.
   */
  const canResume =
    subscription.active && subscription.subscriptionStatus === "CANCELLED";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Panel>
        {settling ? (
          <p className="bg-tint-gold text-tint-gold-ink mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm">
            <Loader2 className="size-4 shrink-0 animate-spin" />
            Payment received. Confirming it with Stripe, this takes a moment.
          </p>
        ) : returned === "cancelled" ? (
          <p className="bg-muted text-muted-foreground mb-4 rounded-xl px-4 py-3 text-sm">
            Checkout was closed, so nothing was charged.
          </p>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Owner plan</p>
            <p className="font-heading mt-1 flex items-baseline gap-1.5 text-3xl font-extrabold">
              {money(subscription.priceCents, subscription.currency)}
              <span className="text-muted-foreground text-base font-semibold">
                / month
              </span>
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              now.tone,
            )}
          >
            {now.label}
          </span>
        </div>

        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {now.detail}
        </p>

        {subscription.subscribedAt ? (
          <p className="text-muted-foreground mt-1 text-sm">
            Started {formatMiami(subscription.subscribedAt, LONG)}.
          </p>
        ) : null}

        {subscription.mocked ? (
          <p className="bg-tint-gold text-tint-gold-ink mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed">
            <strong className="font-bold">Testing mode.</strong> No payment
            provider is connected, so no card is asked for and nothing is
            charged.
          </p>
        ) : null}

        {failed ? (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive mt-4 rounded-xl px-3.5 py-3 text-sm"
          >
            {failed}
          </p>
        ) : null}

        {canStart ? (
          <Button
            disabled={busy || settling}
            onClick={() =>
              run(async () => {
                const { checkoutUrl } = await startSubscription(subscription.id);
                // Stripe takes it from here. No local state to update.
                if (checkoutUrl) window.location.assign(checkoutUrl);
              })
            }
            className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-11 rounded-xl px-5 font-semibold"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {subscription.subscribedAt ? "Start it again" : "Start subscription"}
          </Button>
        ) : canResume ? (
          <Button
            disabled={busy}
            onClick={() => run(() => resumeSubscription(subscription.id))}
            className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-11 rounded-xl px-5 font-semibold"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Resume subscription
          </Button>
        ) : asking ? (
          <div className="border-foreground/15 mt-5 rounded-xl border p-4">
            <p className="text-sm font-semibold">Cancel the subscription?</p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              You keep editing until {until ?? "the period ends"}, and nothing
              is charged after that. {subscription.name} stays listed either
              way, with everything you have already written.
            </p>

            <div className="mt-3.5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => run(() => cancelSubscription(subscription.id))}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 rounded-xl px-4 font-semibold"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Yes, cancel it
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setAsking(false)}
                className="h-10 rounded-xl px-4 font-semibold"
              >
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setAsking(true)}
            className="border-foreground/25 hover:border-foreground mt-5 h-11 rounded-xl px-5 font-semibold"
          >
            Cancel subscription
          </Button>
        )}
      </Panel>

      <Panel>
        {subscription.mocked || !subscription.subscribedAt ? null : (
          <div className="border-foreground/10 mb-5 border-b pb-5">
            <PanelTitle
              title="Billing"
              description="Your card and past invoices, on Stripe."
            />
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () =>
                  window.location.assign(
                    await billingPortalUrl(subscription.id),
                  ),
                )
              }
              className="border-foreground/25 hover:border-foreground h-10 w-full rounded-xl font-semibold"
            >
              <CreditCard className="size-4" />
              Manage billing
            </Button>
          </div>
        )}

        <PanelTitle title="What it pays for" />
        <ul className="grid gap-2.5">
          {OWNER_CONTROLS.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
              <Check className="text-brand-ink mt-0.5 size-4 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground mt-4 flex items-start gap-2 text-sm leading-relaxed">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          Cancelling stops the renewal, never the listing. {subscription.name}{" "}
          stays on Omomoom either way.
        </p>
      </Panel>
    </div>
  );
}
