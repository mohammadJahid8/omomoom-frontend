"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2 } from "lucide-react";

import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { Button } from "@/components/ui/button";
import { isActive, profileTabs } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";
import type { ContributionStats } from "@/types/contribution";

const TAB_TINT: Record<string, string> = {
  "/dashboard/profile": "bg-tint-rose text-tint-rose-ink",
  "/dashboard/profile/photos": "bg-tint-gold text-tint-gold-ink",
  "/dashboard/profile/tried": "bg-tint-olive text-tint-olive-ink",
  "/dashboard/profile/want-to-try": "bg-tint-clay text-tint-clay-ink",
};

export function ProfileHeader({
  user,
  stats,
}: {
  user: SessionUser;
  stats: ContributionStats;
}) {
  const pathname = usePathname();

  const counts: Record<string, number> = {
    "/dashboard/profile": stats.recommendations,
    "/dashboard/profile/photos": stats.photos,
    "/dashboard/profile/tried": stats.placesTried,
    "/dashboard/profile/want-to-try": stats.wantToTry,
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
        <AvatarUpload user={user} />

        <div className="min-w-0 flex-1">
          <h1 className="font-heading truncate text-2xl font-extrabold sm:text-3xl">
            {user.name}
          </h1>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            @{user.username}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            This is my Miami food map.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-foreground/25 hover:border-foreground h-10 shrink-0 rounded-xl font-semibold"
        >
          <Link href={`/u/${user.username}`}>
            <Share2 />
            View public profile
          </Link>
        </Button>
      </div>

      <div className="border-border mt-7 border-b">
        <nav
          aria-label="Profile sections"
          className="scrollbar-none -mb-px flex gap-1 overflow-x-auto"
        >
          {profileTabs.map((tab) => {
            const active = isActive(pathname, tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-ink text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    active
                      ? TAB_TINT[tab.href]
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[tab.href] ?? 0}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
