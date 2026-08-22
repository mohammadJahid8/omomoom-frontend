"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";

import { FormAlert } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { toFormError } from "@/lib/api/auth";
import { startSubscription } from "@/lib/api/subscriptions";
import { OWNER_CONTROLS } from "@/lib/claim";
import type { Subscription } from "@/types/subscription";
import { formatMiami } from "@/lib/miami-time";

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

const renews = (iso: string | null) =>
  iso ? formatMiami(iso, { month: "long", day: "numeric", year: "numeric" }) : null;

export function SubscribePanel({
  subscription,
}: {
  subscription: Subscription;
}) {
  const router = useRouter();
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, start] = useTransition();

  if (subscription.active) {
    return (
      <div className="border-foreground/15 bg-card rounded-2xl border p-6 text-center sm:p-8">
        <span className="bg-tint-olive text-tint-olive-ink mx-auto flex size-14 items-center justify-center rounded-2xl">
          <Check className="size-7" />
        </span>

        <h2 className="font-heading mt-5 text-xl font-extrabold">
          {subscription.name} is yours
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          {subscription.subscriptionStatus === "CANCELLED"
            ? `Cancelled, but you keep access until ${renews(subscription.subscribedUntil)}.`
            : `Next payment ${renews(subscription.subscribedUntil)}. Cancel any time from the Studio.`}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 rounded-xl px-6 font-semibold"
          >
            <Link href="/dashboard/restaurant">
              Open the Studio
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-foreground/25 hover:border-foreground h-12 rounded-xl px-6 font-semibold"
          >
            <Link href={`/restaurants/${subscription.slug}`}>
              View the listing
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-foreground/15 bg-card rounded-2xl border p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-heading text-4xl font-extrabold">
          {money(subscription.priceCents, subscription.currency)}
        </span>
        <span className="text-muted-foreground text-sm">
          per month, cancel any time
        </span>
      </div>

      <ul className="mt-5 grid gap-2.5">
        {OWNER_CONTROLS.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
            <Check className="text-brand-ink mt-0.5 size-4 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {subscription.mocked ? (
        <p className="bg-tint-gold text-tint-gold-ink mt-6 rounded-xl px-4 py-3 text-sm leading-relaxed">
          <strong className="font-bold">Testing mode.</strong> No payment
          provider is connected yet, so no card is asked for and nothing is
          charged. This starts the subscription as if it had been paid.
        </p>
      ) : null}

      {failed ? (
        <div className="mt-4">
          <FormAlert>{failed}</FormAlert>
        </div>
      ) : null}

      <Button
        disabled={busy}
        onClick={() =>
          start(async () => {
            setFailed(null);
            try {
              const { checkoutUrl } = await startSubscription(subscription.id);
              // Stripe takes the card on its own page; nothing to refresh yet.
              if (checkoutUrl) {
                window.location.assign(checkoutUrl);
                return;
              }
              router.refresh();
            } catch (cause) {
              setFailed(toFormError(cause).message);
            }
          })
        }
        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-6 h-12 w-full rounded-xl text-[0.95rem] font-semibold"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? "Starting" : "Start subscription"}
      </Button>

      <p className="text-muted-foreground mt-4 flex items-start gap-2 text-sm leading-relaxed">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        Cancelling stops the renewal, never the listing. {subscription.name}{" "}
        stays on Omomoom either way.
      </p>
    </div>
  );
}
