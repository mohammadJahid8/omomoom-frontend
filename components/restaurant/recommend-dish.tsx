"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, Loader2, Star, UtensilsCrossed } from "lucide-react";

import { Field, FieldLabel, FormAlert } from "@/components/auth/field";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { toFormError, type FormError } from "@/lib/api/auth";
import { recommendDish } from "@/lib/api/contributions";
import { cn } from "@/lib/utils";

const RATING_WORDS = [
  "",
  "Would not go back",
  "It was fine",
  "Good, would return",
  "Really good",
  "Go out of your way",
];

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
  const [rating, setRating] = useState(0);
  const [done, setDone] = useState(false);

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      if (rating === 0) {
        return { message: "Give it a rating first.", fields: {} };
      }

      try {
        await recommendDish({
          restaurantId,
          dish: String(formData.get("dish") ?? "").trim(),
          rating,
          comment: String(formData.get("comment") ?? "").trim() || null,
        });

        setDone(true);
        setOpen(false);
        setRating(0);
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
          Recommend a dish
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
          Recommend a dish
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
      className="bg-card border-foreground/15 grid gap-5 rounded-2xl border p-5 sm:p-6"
    >
      <div>
        <h3 className="font-heading text-lg font-bold">
          What should people order?
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          One dish at {restaurantName}. Add another later if there is more than
          one worth ordering.
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
        <FieldLabel htmlFor="rating-1" required>
          Your rating
        </FieldLabel>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                id={`rating-${value}`}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} out of 5`}
                aria-pressed={rating === value}
                className={cn(
                  "focus-visible:ring-ring/60 rounded-lg p-1 transition-colors outline-none focus-visible:ring-3",
                  value <= rating
                    ? "text-brand-ink"
                    : "text-border-strong hover:text-brand-ink/50",
                )}
              >
                <Star
                  className={cn("size-7", value <= rating && "fill-current")}
                />
              </button>
            ))}
          </div>
          {rating > 0 ? (
            <span className="text-muted-foreground text-sm">
              {RATING_WORDS[rating]}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <FieldLabel htmlFor="comment">Anything worth knowing</FieldLabel>
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
          {pending ? "Posting" : "Post recommendation"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          className="text-muted-foreground h-11 rounded-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
