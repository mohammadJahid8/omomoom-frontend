"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock,
  Loader2,
  Mail,
  Phone,
  UserRoundCheck,
} from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import {
  Field,
  FieldLabel,
  FormAlert,
  SelectField,
  TextareaField,
} from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { refreshRestaurant } from "@/lib/actions/restaurants";
import { toFormError, type FormError } from "@/lib/api/auth";
import {
  requestManualReview,
  sendClaimCode,
  startClaim,
  verifyClaimCode,
} from "@/lib/api/claims";
import { stepHref, type ClaimStep } from "@/lib/claim-steps";
import { cn } from "@/lib/utils";
import { CLAIMANT_ROLES, type Claim, type VerificationOption } from "@/types/claim";

const ICON = {
  PHONE: Phone,
  EMAIL_DOMAIN: Mail,
  MANUAL: UserRoundCheck,
} as const;

export function ClaimVerify({
  step,
  claim,
  options,
  restaurantId,
  restaurantName,
  restaurantSlug,
}: {
  step: ClaimStep;
  claim: Claim | null;
  options: VerificationOption[];
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}) {
  const { user, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // What the API said when it issued the code, so the page can tell the truth
  // about whether a real one was sent.
  const [mocked, setMocked] = useState(false);

  const go = (next: ClaimStep) => router.push(stepHref(pathname, next));

  if (status === "loading") {
    return <div className="bg-card h-64 animate-pulse rounded-2xl" />;
  }

  if (!user) {
    return <SignInGate name={restaurantName} pathname={pathname} />;
  }

  if (step === "done") {
    return <Approved slug={restaurantSlug} name={restaurantName} />;
  }

  if (step === "review") {
    return <UnderReview name={restaurantName} />;
  }

  if (step === "details" || !claim) {
    return (
      <DetailsStep
        claim={claim}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        onDone={() => go("method")}
      />
    );
  }

  if (step === "manual") {
    return (
      <ManualStep
        claim={claim}
        onDone={() => go("review")}
        onBack={() => go("method")}
      />
    );
  }

  if (step === "code") {
    return (
      <CodeStep
        claim={claim}
        mocked={mocked}
        onDone={() => go("done")}
        onBack={() => go("method")}
      />
    );
  }

  return (
    <MethodStep
      claim={claim}
      options={options}
      onCode={(wasMocked) => {
        setMocked(wasMocked);
        go("code");
      }}
      onManual={() => go("manual")}
      onBack={() => go("details")}
    />
  );
}

function SignInGate({
  name,
  pathname,
}: {
  name: string;
  pathname: string;
}) {
  return (
    <div className="border-foreground/15 bg-card rounded-2xl border p-6">
      <h2 className="font-heading text-lg font-bold">Sign in to claim {name}</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        You need an Omomoom account so we know who manages this listing. It
        takes a minute and nothing is charged.
      </p>
      <Button
        asChild
        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-12 w-full rounded-xl font-semibold sm:w-auto sm:px-6"
      >
        <Link href={`/join?next=${encodeURIComponent(pathname)}`}>
          Create an account
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      <p className="text-muted-foreground mt-3 text-sm">
        Already have one?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="text-brand-ink font-semibold underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- details */

function DetailsStep({
  claim,
  restaurantId,
  restaurantName,
  onDone,
}: {
  claim: Claim | null;
  restaurantId: string;
  restaurantName: string;
  onDone: () => void;
}) {
  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      if (formData.get("authorised") !== "on") {
        return {
          message: "Confirm you are authorised to manage this restaurant.",
          fields: {},
        };
      }

      try {
        await startClaim({
          restaurantId,
          claimantRole: String(formData.get("claimantRole") ?? ""),
          workEmail: String(formData.get("workEmail") ?? "").trim(),
          mobilePhone: String(formData.get("mobilePhone") ?? "").trim(),
          authorised: true,
        });

        onDone();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <form
      action={submit}
      className="border-foreground/15 bg-card grid gap-5 rounded-2xl border p-5 sm:p-6"
    >
      <div>
        <h2 className="font-heading text-lg font-bold">
          Your role at {restaurantName}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          So we know who we are talking to and where to reach you.
        </p>
      </div>

      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <SelectField
        name="claimantRole"
        label="Your role"
        placeholder="Select a role"
        required
        defaultValue={claim?.claimantRole ?? ""}
        options={CLAIMANT_ROLES.map((role) => ({ value: role, label: role }))}
        error={error?.fields.claimantRole}
      />

      <Field
        name="workEmail"
        label="Your email"
        type="email"
        icon={Mail}
        required
        defaultValue={claim?.workEmail ?? ""}
        placeholder="you@restaurant.com"
        hint="If this is on the restaurant's own domain we can verify you instantly."
        error={error?.fields.workEmail}
      />

      <Field
        name="mobilePhone"
        label="Your mobile"
        type="tel"
        icon={Phone}
        required
        defaultValue={claim?.mobilePhone ?? ""}
        placeholder="(305) 555 0123"
        hint="How we reach you if anything needs checking."
        error={error?.fields.mobilePhone}
      />

      <label className="border-foreground/15 flex cursor-pointer items-start gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          name="authorised"
          defaultChecked={Boolean(claim)}
          className="accent-brand-ink mt-0.5 size-4"
        />
        <span className="text-sm leading-relaxed">
          I am authorised to manage this restaurant&rsquo;s information on
          Omomoom.
        </span>
      </label>

      <Button
        type="submit"
        disabled={pending}
        className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 w-full rounded-xl font-semibold sm:w-auto sm:px-6"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Checking" : "Continue"}
        {pending ? null : <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------- method */

function MethodStep({
  claim,
  options,
  onCode,
  onManual,
  onBack,
}: {
  claim: Claim;
  options: VerificationOption[];
  onCode: (mocked: boolean) => void;
  onManual: () => void;
  onBack: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const choose = async (option: VerificationOption) => {
    if (option.method === "MANUAL") {
      onManual();
      return;
    }

    setBusy(option.method);
    setFailed(null);

    try {
      const { mocked } = await sendClaimCode(claim.id, option.method);
      onCode(mocked);
    } catch (cause) {
      setFailed(toFormError(cause).message);
      setBusy(null);
    }
  };

  const automatic = options.filter((option) => option.method !== "MANUAL");
  const manual = options.find((option) => option.method === "MANUAL");

  return (
    <div className="border-foreground/15 bg-card rounded-2xl border p-5 sm:p-6">
      <h2 className="font-heading text-lg font-bold">
        Confirm you are connected to {claim.restaurant.name}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
        We only offer routes that work for this listing, so there is nothing
        here that can dead-end.
      </p>

      {failed ? (
        <div className="mt-4">
          <FormAlert>{failed}</FormAlert>
        </div>
      ) : null}

      {automatic.length === 0 ? (
        <p className="text-muted-foreground border-foreground/15 mt-5 rounded-xl border border-dashed p-4 text-sm leading-relaxed">
          This listing has no phone number or website on file, so there is
          nothing we can send a code to. A quick review by our team is the way
          in.
        </p>
      ) : null}

      <ul className="mt-5 grid gap-3">
        {[...automatic, ...(manual ? [manual] : [])].map((option) => {
          const Icon = ICON[option.method];
          const isManual = option.method === "MANUAL";

          return (
            <li key={option.method}>
              <button
                type="button"
                onClick={() => choose(option)}
                disabled={busy !== null}
                className={cn(
                  "border-foreground/15 hover:border-foreground/40 flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-colors disabled:opacity-60",
                  !isManual && "bg-tint-rose/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-2xl",
                    isManual
                      ? "bg-muted text-muted-foreground"
                      : "bg-tint-rose text-tint-rose-ink",
                  )}
                >
                  {busy === option.method ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
                    {option.detail}
                  </span>
                </span>

                <ArrowRight className="text-muted-foreground mt-2.5 size-4 shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>

      <Button
        variant="ghost"
        onClick={onBack}
        className="text-muted-foreground mt-4 h-10 rounded-xl"
      >
        Change your details
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------- code */

function CodeStep({
  claim,
  mocked,
  onDone,
  onBack,
}: {
  claim: Claim;
  /**
   * Straight from the API, never assumed. A hardcoded "use 000000" is a lie
   * the moment a real provider is connected, and it hands someone a code that
   * cannot work while insisting it will.
   */
  mocked: boolean;
  onDone: () => void;
  onBack: () => void;
}) {
  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      try {
        await verifyClaimCode(
          claim.id,
          String(formData.get("code") ?? "").trim(),
        );
        await refreshRestaurant(claim.restaurant.slug);
        onDone();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <form
      action={submit}
      className="border-foreground/15 bg-card grid gap-5 rounded-2xl border p-5 sm:p-6"
    >
      <div>
        <h2 className="font-heading text-lg font-bold">Enter your code</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          We sent a six digit code to{" "}
          <strong className="text-foreground font-semibold">
            {claim.codeSentTo}
          </strong>
          . It is good for ten minutes.
        </p>
      </div>

      {mocked ? (
        <p className="bg-tint-gold text-tint-gold-ink rounded-xl px-4 py-3 text-sm leading-relaxed">
          <strong className="font-bold">Testing mode.</strong> No SMS provider
          is connected yet, so nothing was sent. Use{" "}
          <code className="font-mono font-bold">000000</code>.
        </p>
      ) : null}

      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <div className="grid gap-2">
        <FieldLabel htmlFor="code" required>
          Six digit code
        </FieldLabel>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="000000"
          aria-invalid={error?.fields.code ? true : undefined}
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-14 rounded-xl border px-4 text-center font-mono text-2xl tracking-[0.4em] outline-none focus-visible:ring-3"
        />
        {error?.fields.code ? (
          <p className="text-destructive text-xs">{error.fields.code}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 rounded-xl px-6 font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Checking" : "Verify"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground h-12 rounded-xl"
        >
          Try another way
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------- manual */

function ManualStep({
  claim,
  onDone,
  onBack,
}: {
  claim: Claim;
  onDone: () => void;
  onBack: () => void;
}) {
  const [error, submit, pending] = useActionState<FormError | null, FormData>(
    async (_previous, formData) => {
      try {
        await requestManualReview(
          claim.id,
          String(formData.get("note") ?? "").trim(),
        );
        onDone();
        return null;
      } catch (cause) {
        return toFormError(cause);
      }
    },
    null,
  );

  return (
    <form
      action={submit}
      className="border-foreground/15 bg-card grid gap-5 rounded-2xl border p-5 sm:p-6"
    >
      <div>
        <h2 className="font-heading text-lg font-bold">
          Tell us how you are connected
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Someone on our team reads this and comes back within two business
          days. Anything that helps us confirm it is you is worth including.
        </p>
      </div>

      {error && Object.keys(error.fields).length === 0 ? (
        <FormAlert>{error.message}</FormAlert>
      ) : null}

      <TextareaField
        name="note"
        label="Your connection to the restaurant"
        rows={5}
        required
        minLength={20}
        maxLength={1000}
        placeholder="I have owned it since 2019. Our business licence is under Zorro Hospitality LLC, and the number on the listing is out of date. The current one is..."
        error={error?.fields.note}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 rounded-xl px-6 font-semibold"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Sending" : "Send for review"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground h-12 rounded-xl"
        >
          Back
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ outcomes */

function Approved({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="border-foreground/15 bg-card rounded-2xl border p-6 text-center sm:p-8">
      <span className="bg-tint-olive text-tint-olive-ink mx-auto flex size-14 items-center justify-center rounded-2xl">
        <Check className="size-7" />
      </span>

      <h2 className="font-heading mt-5 text-xl font-extrabold">
        You&rsquo;re verified
      </h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        {name} is yours to manage. Next is the subscription, then the Studio
        where you keep everything up to date.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-12 rounded-xl px-6 font-semibold"
        >
          <Link href={`/claim/${slug}/subscribe`}>
            Continue
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-foreground/25 hover:border-foreground h-12 rounded-xl px-6 font-semibold"
        >
          <Link href={`/restaurants/${slug}`}>View the listing</Link>
        </Button>
      </div>
    </div>
  );
}

function UnderReview({ name }: { name: string }) {
  return (
    <div className="border-foreground/15 bg-card rounded-2xl border p-6 text-center sm:p-8">
      <span className="bg-tint-gold text-tint-gold-ink mx-auto flex size-14 items-center justify-center rounded-2xl">
        <Clock className="size-7" />
      </span>

      <h2 className="font-heading mt-5 text-xl font-extrabold">
        We&rsquo;re on it
      </h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        Your request to manage {name} is with our team. We come back within two
        business days, by email.
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
