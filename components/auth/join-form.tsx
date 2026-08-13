"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, UserRound } from "lucide-react";

import { AuthDivider, AuthSwitch } from "@/components/auth/auth-split";
import { Field, FormAlert } from "@/components/shared/field";
import { GoogleButton } from "@/components/auth/google-button";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { registerAccount, toFormError, type FormError } from "@/lib/api/auth";

export function JoinForm({ next }: { next: string }) {
  const router = useRouter();
  const { setUser } = useSession();

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      try {
        const user = await registerAccount({
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        });

        setUser(user);
        router.replace(`/welcome?next=${encodeURIComponent(next)}`);
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <>
      <GoogleButton next={next} />

      <AuthDivider />

      <form action={submit} className="grid gap-5">
        {error && Object.keys(error.fields).length === 0 ? (
          <FormAlert>{error.message}</FormAlert>
        ) : null}

        <Field
          name="name"
          label="Your name"
          icon={UserRound}
          autoComplete="name"
          placeholder="Ana Silva"
          required
          error={error?.fields.name}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={error?.fields.email}
        />
        <Field
          name="password"
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
          error={error?.fields.password}
        />

        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 w-full rounded-xl text-[0.95rem] font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Creating your account" : "Create account"}
          {pending ? null : <ArrowRight className="size-4" />}
        </Button>
      </form>

      <AuthSwitch
        prompt="Already a member?"
        label="Log in"
        href={`/login?next=${encodeURIComponent(next)}`}
      />
    </>
  );
}
