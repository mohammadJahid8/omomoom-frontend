import type { Metadata } from "next";

import { AuthSplit } from "@/components/auth/auth-split";
import { FormAlert } from "@/components/auth/field";
import { JoinForm } from "@/components/auth/join-form";
import { oauthErrorMessage, safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = {
  title: "Join",
  description:
    "Create a free Omomoom account to save restaurants, recommend dishes and add photos.",
  alternates: { canonical: "/join" },
  robots: { index: false, follow: true },
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = oauthErrorMessage(params.error);

  return (
    <AuthSplit
      headline="Eat well, tell everyone"
      highlight="Discover Miami's best restaurants together"
      intro="Real recommendations from people who actually eat there. Save your favourite places, share great meals, and help others work out where to eat next."
      formTitle="Create your account"
      formSubtitle="Free, takes a minute, and nobody pays to appear on Omomoom."
    >
      {error ? (
        <div className="mb-5">
          <FormAlert>{error}</FormAlert>
        </div>
      ) : null}

      <JoinForm next={next} />
    </AuthSplit>
  );
}
