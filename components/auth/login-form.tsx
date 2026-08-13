"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";

import { AuthDivider, AuthSwitch } from "@/components/auth/auth-split";
import { Field, FormAlert } from "@/components/shared/field";
import { GoogleButton } from "@/components/auth/google-button";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { signIn, toFormError, type FormError } from "@/lib/api/auth";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { setUser } = useSession();

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      try {
        const user = await signIn({
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        });

        setUser(user);
        router.replace(next);
        router.refresh();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <>
      <GoogleButton next={next} label="Continue with Google" />

      <AuthDivider />

      <form action={submit} className="grid gap-5">
        {error && Object.keys(error.fields).length === 0 ? (
          <FormAlert>{error.message}</FormAlert>
        ) : null}

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
          autoComplete="current-password"
          placeholder="Your password"
          required
          error={error?.fields.password}
        />

        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 w-full rounded-xl text-[0.95rem] font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Logging in" : "Log in"}
          {pending ? null : <ArrowRight className="size-4" />}
        </Button>
      </form>

      <AuthSwitch
        prompt="New to Omomoom?"
        label="Create a free account"
        href={`/join?next=${encodeURIComponent(next)}`}
      />
    </>
  );
}
