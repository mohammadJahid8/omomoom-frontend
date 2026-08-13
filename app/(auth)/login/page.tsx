import type { Metadata } from "next";

import { AuthSplit } from "@/components/auth/auth-split";
import { FormAlert } from "@/components/shared/field";
import { LoginForm } from "@/components/auth/login-form";
import { oauthErrorMessage, safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Omomoom account.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = oauthErrorMessage(params.error);

  return (
    <AuthSplit
      headline="Welcome back"
      highlight="Discover Miami's best restaurants together"
      intro="Real recommendations from people who actually eat there. Save your favourite places, share great meals, and help others work out where to eat next."
      formTitle="Welcome back"
      formSubtitle="Log in to carry on discovering, saving and sharing your favourite restaurants."
    >
      {error ? (
        <div className="mb-5">
          <FormAlert>{error}</FormAlert>
        </div>
      ) : null}

      <LoginForm next={next} />
    </AuthSplit>
  );
}
