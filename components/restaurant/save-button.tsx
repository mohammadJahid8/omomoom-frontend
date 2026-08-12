"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { useSaved } from "@/components/restaurant/saved-provider";
import { cn } from "@/lib/utils";

export function SaveButton({
  restaurantId,
  restaurantName,
  variant = "icon",
  className,
}: {
  restaurantId: string;
  restaurantName: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { user } = useSession();
  const { isSaved, toggle } = useSaved();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, start] = useTransition();

  const saved = isSaved(restaurantId);

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push(`/join?next=${encodeURIComponent(pathname)}`);
      return;
    }

    start(() => {
      void toggle(restaurantId);
    });
  };

  const label = saved
    ? `Remove ${restaurantName} from Want to try`
    : `Save ${restaurantName} to Want to try`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors",
          saved
            ? "border-brand-ink bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90"
            : "border-foreground/25 hover:border-foreground hover:bg-muted",
          className,
        )}
      >
        <Bookmark className={cn("size-4", saved && "fill-current")} />
        {saved ? "Saved" : "Want to try"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      aria-pressed={saved}
      title={label}
      className={cn(
        "focus-visible:ring-ring/60 inline-flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors outline-none focus-visible:ring-3",
        saved
          ? "bg-brand-ink text-brand-ink-foreground"
          : "bg-white/90 text-neutral-800 hover:bg-white",
        className,
      )}
    >
      <Bookmark className={cn("size-4.5", saved && "fill-current")} />
    </button>
  );
}
