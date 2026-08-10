"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, LayoutDashboard, LogOut } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ onDark = false }: { onDark?: boolean }) {
  const { user, status, signOut } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, startLeaving] = useTransition();

  if (status === "loading") {
    return (
      <div
        className={cn(
          "size-8 animate-pulse rounded-full",
          onDark ? "bg-white/20" : "bg-muted",
        )}
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(
          "hidden rounded-full sm:inline-flex",
          onDark &&
            "border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white",
        )}
      >
        <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Log in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Your account"
          className={cn(
            "focus-visible:ring-ring/50 rounded-full transition-opacity outline-none hover:opacity-85 focus-visible:ring-3",
            onDark && "ring-2 ring-white/40",
          )}
        >
          <Avatar>
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xs font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-semibold">
            {user.name}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            @{user.username}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/restaurants">
            <Compass />
            Explore restaurants
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={leaving}
          onSelect={(event) => {
            event.preventDefault();
            startLeaving(async () => {
              await signOut();
              router.refresh();
            });
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
