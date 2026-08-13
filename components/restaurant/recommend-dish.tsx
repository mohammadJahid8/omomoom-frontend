"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Sparkles, UtensilsCrossed } from "lucide-react";

import { Field, FieldLabel, FormAlert } from "@/components/shared/field";
import { useSession } from "@/components/auth/session-provider";
import { StarRating } from "@/components/restaurant/star-rating";
import { Button } from "@/components/ui/button";
import { toFormError, type FormError } from "@/lib/api/auth";
import { recommendDish } from "@/lib/api/contributions";
import { scoreLabel, visitScore, type VisitRatings } from "@/lib/visit-score";
import { cn } from "@/lib/utils";

const DISH_WORDS = [
  "",
  "Would not order again",
  "It was fine",
  "Good, worth ordering",
  "Really good",
  "Go out of your way for it",
];

const ASPECTS: { key: keyof VisitRatings; label: string }[] = [
  { key: "taste", label: "Taste" },
  { key: "service", label: "Service" },
  { key: "value", label: "Value" },
  { key: "ambience", label: "Ambience" },
  { key: "hygiene", label: "Hygiene" },
];

const AGAIN = [
  { value: "DEFINITELY", label: "Definitely" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "No" },
] as const;

const EMPTY: VisitRatings = {
  taste: 0,
  service: 0,
  value: 0,
  ambience: 0,
  hygiene: 0,
};

export function RecommendDish({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const [rating, setRating] = useState(0);
  const [again, setAgain] = useState<string>("");
  const [aspects, setAspects] = useState<VisitRatings>(EMPTY);
  const [showVisit, setShowVisit] = useState(false);

  const score = visitScore(aspects);

  const reset = () => {
    setRating(0);
    setAgain("");
    setAspects(EMPTY);
    setShowVisit(false);
  };

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      if (rating === 0) {
        return { message: "Rate the dish before posting.", fields: {} };
      }

      try {
        await recommendDish({
          restaurantId,
          dish: String(formData.get("dish") ?? "").trim(),
          rating,
          comment: String(formData.get("comment") ?? "").trim() || null,
          wouldOrderAgain: again || null,
          taste: aspects.taste || null,
          service: aspects.service || null,
          value: aspects.value || null,
          ambience: aspects.ambience || null,
          hygiene: aspects.hygiene || null,
        });

        setDone(true);
        setOpen(false);
        reset();
        router.refresh();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  if (!user) {
    return (
      <Button
        asChild
        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-full px-5 font-semibold"
      >
        <Link href={`/join?next=${encodeURIComponent(pathname)}`}>
          <UtensilsCrossed className="size-4" />
          Rate a dish
        </Link>
      </Button>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            setDone(false);
            setOpen(true);
          }}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-full px-5 font-semibold"
        >
          <UtensilsCrossed className="size-4" />
          Rate a dish
        </Button>

        {done ? (
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
            <Check className="text-brand-ink size-4" />
            Added to your food map.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={submit}
      className="bg-card border-foreground/15 grid gap-6 rounded-2xl border p-5 sm:p-6"
    >
      <div>
        <h3 className="font-heading text-lg font-bold">
          What did you order at {restaurantName}?
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          The dish and your rating are all we need. The rest is optional.
        </p>
      </div>

      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <Field
        name="dish"
        label="The dish"
        placeholder="Wagyu Ishiyaki"
        maxLength={80}
        required
        error={error?.fields.dish}
      />

      <div className="grid gap-2">
        <FieldLabel htmlFor="dish-rating-1" required>
          How was it?
        </FieldLabel>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <StarRating
            name="dish-rating"
            value={rating}
            onChange={setRating}
            size="lg"
            label="Rate the dish"
          />
          {rating > 0 ? (
            <span className="text-muted-foreground text-sm">
              {DISH_WORDS[rating]}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <FieldLabel htmlFor="again-DEFINITELY">Would you order it again?</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {AGAIN.map((option) => (
            <button
              key={option.value}
              id={`again-${option.value}`}
              type="button"
              aria-pressed={again === option.value}
              onClick={() =>
                setAgain(again === option.value ? "" : option.value)
              }
              className={cn(
                "focus-visible:ring-ring/60 h-10 rounded-full border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3",
                again === option.value
                  ? "border-brand-ink bg-brand-ink text-brand-ink-foreground"
                  : "border-foreground/20 hover:border-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-foreground/15 rounded-xl border">
        <button
          type="button"
          onClick={() => setShowVisit((shown) => !shown)}
          aria-expanded={showVisit}
          className="hover:bg-muted/50 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors"
        >
          <span>
            <span className="block text-sm font-semibold">
              Rate the visit itself
            </span>
            <span className="text-muted-foreground mt-0.5 block text-sm">
              Optional. Taste, service, value, ambience and hygiene.
            </span>
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              showVisit && "rotate-180",
            )}
          />
        </button>

        {showVisit ? (
          <div className="border-foreground/15 grid gap-3 border-t p-4">
            {ASPECTS.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
              >
                <span className="text-sm font-medium">{label}</span>
                <StarRating
                  name={key}
                  value={aspects[key]}
                  onChange={(next) =>
                    setAspects((current) => ({ ...current, [key]: next }))
                  }
                  label={`Rate ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {score !== null ? (
        <div className="bg-tint-rose flex items-center justify-between gap-4 rounded-xl px-4 py-3.5">
          <span className="flex items-center gap-3">
            <Sparkles className="text-tint-rose-ink size-5 shrink-0" />
            <span>
              <span className="text-tint-rose-ink block text-sm font-bold">
                Omomoom score
              </span>
              <span className="text-tint-rose-ink/80 block text-xs">
                {scoreLabel(score)}
              </span>
            </span>
          </span>
          <span className="font-heading text-tint-rose-ink text-2xl font-extrabold tabular-nums">
            {score.toFixed(1)}
            <span className="text-tint-rose-ink/60 text-base font-bold">
              /5
            </span>
          </span>
        </div>
      ) : null}

      <div className="grid gap-2">
        <FieldLabel htmlFor="comment">What should people know?</FieldLabel>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={600}
          placeholder="When to go, what to order it with, what to skip."
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 rounded-xl border px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:ring-3"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-full px-5 font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Posting" : "Post"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="text-muted-foreground h-11 rounded-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
