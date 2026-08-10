"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";

import { Field, FormAlert } from "@/components/auth/field";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { toFormError, updateProfile, type FormError } from "@/lib/api/auth";
import type { SessionUser } from "@/types/auth";

type State = { error: FormError | null; saved: boolean };

export function AccountForm({ user }: { user: SessionUser }) {
  const { setUser } = useSession();

  const [state, submit, pending] = useActionState<State, FormData>(
    async (_previous, formData) => {
      try {
        setUser(
          await updateProfile({
            name: String(formData.get("name") ?? "").trim(),
            username: String(formData.get("username") ?? "").trim(),
          }),
        );
        return { error: null, saved: true };
      } catch (cause) {
        return { error: toFormError(cause), saved: false };
      }
    },
    { error: null, saved: false },
  );

  const { error } = state;

  return (
    <form action={submit} className="grid gap-4">
      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <Field
        name="name"
        label="Name"
        defaultValue={user.name}
        maxLength={80}
        required
        error={error?.fields.name}
      />
      <Field
        name="username"
        label="Username"
        defaultValue={user.username}
        minLength={3}
        maxLength={24}
        required
        error={error?.fields.username}
        hint="Letters, numbers and hyphens."
      />

      <div className="mt-1 flex items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-10 rounded-xl px-5 font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Saving" : "Save changes"}
        </Button>

        {state.saved && !pending ? (
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Check className="text-brand-ink size-4" />
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
