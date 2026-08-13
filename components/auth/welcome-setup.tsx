"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { Field, FormAlert } from "@/components/shared/field";
import { useSession } from "@/components/auth/session-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toFormError, updateProfile, type FormError } from "@/lib/api/auth";
import type { SessionUser } from "@/types/auth";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function WelcomeSetup({
  user,
  next,
}: {
  user: SessionUser;
  next: string;
}) {
  const router = useRouter();
  const { setUser } = useSession();

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      const username = String(formData.get("username") ?? "").trim();

      if (username === user.username) {
        router.replace(next);
        return null;
      }

      try {
        setUser(await updateProfile({ username }));
        router.replace(next);
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <div className="bg-card rounded-2xl p-6 ring-1 ring-foreground/10 sm:p-7">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-14">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback className="text-base font-semibold">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
        </div>
      </div>

      <form action={submit} className="mt-6 grid gap-4">
        {error && Object.keys(error.fields).length === 0 ? (
          <FormAlert>{error.message}</FormAlert>
        ) : null}

        <Field
          name="username"
          label="Your username"
          defaultValue={user.username}
          autoComplete="username"
          minLength={3}
          maxLength={24}
          required
          error={error?.fields.username}
          hint="This is how your recommendations and photos are credited. Change it any time."
        />

        <div className="mt-1 flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={pending}
            className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 flex-1 rounded-xl text-[0.95rem] font-semibold"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {pending ? "Saving" : "Looks good, continue"}
          </Button>

          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground h-11 rounded-xl sm:flex-none"
          >
            <Link href={next}>Skip for now</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
