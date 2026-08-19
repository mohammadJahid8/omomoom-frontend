import type { Metadata } from "next";

import { AccountForm } from "@/components/auth/account-form";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { MAX_IMAGE_LABEL } from "@/lib/api/uploads";
import {
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
      <PageHeader title="Settings" description={`Signed in as ${user.email}`} />

      <Panel>
        <PanelTitle
          title="Your photo"
          description="Shown next to everything you contribute. A square image works best."
        />
        <div className="flex items-center gap-5">
          <AvatarUpload user={user} />
          <p className="text-muted-foreground text-sm leading-relaxed">
            JPEG, PNG, WebP or AVIF, up to {MAX_IMAGE_LABEL}. Replacing it
            removes the old one.
          </p>
        </div>
      </Panel>

      <div className="mt-4">
        <Panel>
          <PanelTitle
            title="Your account"
            description="How you appear on the reviews, photos and recommendations you contribute."
          />
          <AccountForm user={user} />
        </Panel>
      </div>
    </div>
  );
}
