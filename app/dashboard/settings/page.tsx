import type { Metadata } from "next";

import { AccountForm } from "@/components/auth/account-form";
import {
  NotBuiltYet,
  PageHeader,
  Panel,
  PanelTitle,
} from "@/components/dashboard/primitives";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireSession("/dashboard/settings");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Settings"
        description={`Signed in as ${user.email}`}
      />

      <Panel>
        <PanelTitle
          title="Your account"
          description="How you appear on the reviews, photos and recommendations you contribute."
        />
        <AccountForm user={user} />
      </Panel>

      <div className="mt-4">
        <NotBuiltYet
          title="Coming to this page"
          body="The rest of account management lands alongside the features it controls."
          bullets={[
            "Profile photo upload, once file storage is wired up",
            "Change your email and password",
            "Sign out of every device at once",
            "Delete your account and everything you have contributed",
          ]}
        />
      </div>
    </div>
  );
}
