"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { Field, FieldLabel, FormAlert } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { toFormError, type FormError } from "@/lib/api/auth";
import { createEvent, updateEvent, type EventInput } from "@/lib/api/events";
import { fromMiamiInput, toMiamiInput } from "@/lib/miami-time";
import { cn } from "@/lib/utils";
import type { AdminEvent } from "@/types/event";

const MIN_DESCRIPTION = 10;

export function EventForm({
  event,
  onDone,
  onCancel,
}: {
  event: AdminEvent | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState(event?.description ?? "");
  const [startsAt, setStartsAt] = useState(toMiamiInput(event?.startsAt));

  const trimmed = description.trim().length;
  const tooShort = trimmed > 0 && trimmed < MIN_DESCRIPTION;

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      const startsIso = fromMiamiInput(String(formData.get("startsAt") ?? ""));
      if (!startsIso) {
        return {
          message: "Pick a start date and time before saving.",
          fields: { startsAt: "Required" },
        };
      }

      const endsIso = fromMiamiInput(String(formData.get("endsAt") ?? ""));
      if (endsIso && new Date(endsIso) <= new Date(startsIso)) {
        return {
          message: "",
          fields: { endsAt: "The end has to come after the start." },
        };
      }

      const input: EventInput = {
        title: String(formData.get("title") ?? "").trim(),
        organiser: String(formData.get("organiser") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        startsAt: startsIso,
        endsAt: endsIso,
        venue: String(formData.get("venue") ?? "").trim(),
        neighborhood: String(formData.get("neighborhood") ?? "").trim() || null,
        ticketUrl: String(formData.get("ticketUrl") ?? "").trim() || null,
        status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      };

      try {
        if (event) await updateEvent(event.id, input);
        else await createEvent(input);
        onDone();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <form action={submit} className="grid gap-5">
      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <Field
        name="title"
        label="Title"
        defaultValue={event?.title}
        placeholder="Wynwood Night Market"
        maxLength={120}
        required
        error={error?.fields.title}
      />

      <Field
        name="organiser"
        label="Organiser"
        defaultValue={event?.organiser}
        placeholder="Miami Asian Night Market Co."
        maxLength={120}
        required
        error={error?.fields.organiser}
      />

      <div className="grid gap-2">
        <FieldLabel htmlFor="description" required>
          Description
        </FieldLabel>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          minLength={MIN_DESCRIPTION}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-describedby="description-hint"
          aria-invalid={error?.fields.description ? true : undefined}
          placeholder="What happens, who it is for, and anything worth knowing before turning up."
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive rounded-xl border px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:ring-3"
        />
        {error?.fields.description ? (
          <p className="text-destructive text-xs">{error.fields.description}</p>
        ) : (
          <p
            id="description-hint"
            className={cn(
              "text-xs",
              tooShort ? "text-brand-ink" : "text-muted-foreground",
            )}
          >
            {tooShort
              ? `${MIN_DESCRIPTION - description.trim().length} more character${
                  MIN_DESCRIPTION - description.trim().length === 1 ? "" : "s"
                } needed.`
              : `A sentence or two. ${description.trim().length}/2000.`}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="startsAt"
          label="Starts"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
          error={error?.fields.startsAt}
        />
        <Field
          name="endsAt"
          label="Ends"
          type="datetime-local"
          defaultValue={toMiamiInput(event?.endsAt)}
          min={startsAt || undefined}
          error={error?.fields.endsAt}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="venue"
          label="Venue"
          defaultValue={event?.venue}
          placeholder="1-800-Lucky Food Hall"
          maxLength={160}
          required
          error={error?.fields.venue}
        />
        <Field
          name="neighborhood"
          label="Neighborhood"
          defaultValue={event?.neighborhood ?? ""}
          placeholder="Wynwood"
          maxLength={80}
          error={error?.fields.neighborhood}
        />
      </div>

      <Field
        name="ticketUrl"
        label="Ticket link"
        type="url"
        defaultValue={event?.ticketUrl ?? ""}
        placeholder="https://example.com/tickets"
        maxLength={500}
        error={error?.fields.ticketUrl}
      />

      <label className="border-foreground/15 bg-card flex cursor-pointer items-start gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          name="publish"
          defaultChecked={event ? event.status === "PUBLISHED" : true}
          className="accent-brand-ink mt-0.5 size-4"
        />
        <span>
          <span className="block text-sm font-semibold">Publish</span>
          <span className="text-muted-foreground mt-0.5 block text-sm">
            Published events appear on Asian Eats. Drafts stay here until you
            are ready.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 rounded-xl px-5 font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Saving" : event ? "Save changes" : "Create event"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground h-11 rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
