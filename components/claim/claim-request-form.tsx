"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, Loader2, Mail, Phone } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import {
  Field,
  FormAlert,
  SelectField,
  TextareaField,
} from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { toFormError, type FormError } from "@/lib/api/auth";
import { suggestRestaurant } from "@/lib/api/claims";
import { CLAIMANT_ROLES } from "@/types/claim";

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

const ROLE_OPTIONS = CLAIMANT_ROLES.map((role) => ({
  value: role,
  label: role,
}));

/**
 * A restaurant we do not list yet. It ends as a draft listing with a claim
 * attached, so approving it publishes the place and hands over the keys at once.
 */
export function ClaimRequestForm() {
  const { user, status } = useSession();
  const pathname = usePathname();
  const [sent, setSent] = useState(false);

  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      try {
        await suggestRestaurant({
          name: text(formData, "name"),
          municipality: text(formData, "municipality"),
          addressLine: text(formData, "addressLine") || null,
          phone: text(formData, "phone") || null,
          websiteUrl: text(formData, "websiteUrl") || null,
          claimantRole: text(formData, "claimantRole"),
          workEmail: text(formData, "workEmail"),
          mobilePhone: text(formData, "mobilePhone"),
          note: text(formData, "note"),
        });

        setSent(true);
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  if (status === "loading") {
    return <div className="bg-card h-64 animate-pulse rounded-2xl" />;
  }

  if (!user) {
    return (
      <div className="border-foreground/15 bg-card rounded-2xl border p-6">
        <h2 className="font-heading text-lg font-bold">Sign in first</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          We need an account to reply to, and so nobody can send this
          anonymously.
        </p>
        <Button
          asChild
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-12 rounded-xl px-6 font-semibold"
        >
          <Link href={`/join?next=${encodeURIComponent(pathname)}`}>
            Create an account
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="border-foreground/15 bg-card rounded-2xl border p-6 text-center sm:p-8">
        <span className="bg-tint-olive text-tint-olive-ink mx-auto flex size-14 items-center justify-center rounded-2xl">
          <Check className="size-7" />
        </span>
        <h2 className="font-heading mt-5 text-xl font-extrabold">
          Thanks, we will take a look
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          We check every submission before it goes live, usually within two
          business days.
        </p>
        <Button
          asChild
          variant="outline"
          className="border-foreground/25 hover:border-foreground mt-6 h-12 rounded-xl px-6 font-semibold"
        >
          <Link href="/restaurants">Keep browsing</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={submit}
      className="border-foreground/15 bg-card grid gap-5 rounded-2xl border p-5 sm:p-6"
    >
      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <Field
        name="name"
        label="Restaurant name"
        required
        maxLength={160}
        placeholder="Bar Zorro"
        error={error?.fields.name}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="municipality"
          label="City"
          required
          maxLength={120}
          placeholder="Miami Beach"
          error={error?.fields.municipality}
        />
        <Field
          name="phone"
          label="Phone"
          type="tel"
          maxLength={40}
          placeholder="(305) 555 0123"
          error={error?.fields.phone}
        />
      </div>

      <Field
        name="addressLine"
        label="Address"
        maxLength={240}
        placeholder="161 Ocean Dr"
        error={error?.fields.addressLine}
      />

      <Field
        name="websiteUrl"
        label="Website"
        type="url"
        maxLength={500}
        placeholder="https://"
        error={error?.fields.websiteUrl}
      />

      <SelectField
        name="claimantRole"
        label="Your role"
        placeholder="Select a role"
        required
        options={ROLE_OPTIONS}
        error={error?.fields.claimantRole}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="workEmail"
          label="Your email"
          type="email"
          icon={Mail}
          required
          placeholder="you@restaurant.com"
          error={error?.fields.workEmail}
        />
        <Field
          name="mobilePhone"
          label="Your mobile"
          type="tel"
          icon={Phone}
          required
          placeholder="(305) 555 0123"
          error={error?.fields.mobilePhone}
        />
      </div>

      <TextareaField
        name="note"
        label={
"Tell us about the restaurant"}
        rows={5}
        required
        minLength={20}
        maxLength={1000}
        placeholder={
"We opened in March, twelve seats, Cantonese barbecue. I am the owner."}
        error={error?.fields.note}
      />

      <Button
        type="submit"
        disabled={pending}
        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 w-full rounded-xl font-semibold sm:w-auto sm:px-6"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Sending" : "Send to our team"}
      </Button>
    </form>
  );
}
