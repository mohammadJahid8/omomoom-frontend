"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, type LucideIcon } from "lucide-react";

import { FormAlert } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { refreshRestaurant } from "@/lib/actions/restaurants";
import { toFormError, type FormError } from "@/lib/api/auth";
import { saveStudioListing } from "@/lib/api/studio";
import { cn } from "@/lib/utils";
import type { StudioListing, StudioUpdate } from "@/types/studio";

type State = { error: FormError | null; saved: boolean };

/**
 * Each section saves on its own. An owner fixing their phone number should not
 * have to scroll past their story to do it.
 */
export function StudioSection({
  listing,
  icon: Icon,
  title,
  summary,
  locked,
  defaultOpen = false,
  collect,
  children,
}: {
  listing: StudioListing;
  icon: LucideIcon;
  title: string;
  summary: string;
  locked: boolean;
  defaultOpen?: boolean;
  collect: (form: FormData) => StudioUpdate;
  children: (error: FormError | null) => React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);

  const [state, submit, pending] = useActionState<State, FormData>(
    async (_previous, formData) => {
      try {
        await saveStudioListing(listing.id, collect(formData));
        await refreshRestaurant(listing.slug);
        router.refresh();
        return { error: null, saved: true };
      } catch (cause) {
        return { error: toFormError(cause), saved: false };
      }
    },
    { error: null, saved: false },
  );

  return (
    <section className="border-foreground/15 bg-card overflow-hidden rounded-2xl border">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((shown) => !shown)}
          aria-expanded={open}
          className="hover:bg-muted/40 flex w-full items-center gap-3.5 p-4 text-left transition-colors sm:p-5"
        >
          <span className="bg-tint-rose text-tint-rose-ink flex size-10 shrink-0 items-center justify-center rounded-2xl">
            <Icon className="size-5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{title}</span>
            <span className="text-muted-foreground mt-0.5 block truncate text-sm">
              {summary}
            </span>
          </span>

          {state.saved && !open ? (
            <Check className="text-tint-olive-ink size-4 shrink-0" />
          ) : null}

          <ChevronDown
            aria-hidden="true"
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>

      {open ? (
        <form
          action={submit}
          className="border-foreground/15 grid gap-5 border-t p-4 sm:p-5"
        >
          {state.error && Object.keys(state.error.fields).length === 0 ? (
            <FormAlert>{state.error.message}</FormAlert>
          ) : null}

          <fieldset disabled={locked} className="grid gap-5">
            {children(state.error)}
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={pending || locked}
              className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-xl px-5 font-semibold"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {pending ? "Saving" : "Save"}
            </Button>

            {state.saved && !pending ? (
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                <Check className="text-tint-olive-ink size-4" />
                Saved and live
              </span>
            ) : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}
