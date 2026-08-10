"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function MobileNav({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useSession();
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "md:hidden",

            onDark && "text-white hover:bg-white/10 hover:text-white",
          )}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-xs p-0">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="font-heading text-lg font-extrabold tracking-tight">
            {siteConfig.name}
            <span
              className="bg-brand ml-0.5 inline-block size-2 rounded-full"
              aria-hidden="true"
            />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-3 py-4" aria-label="Mobile">
          {mainNav.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="hover:bg-accent rounded-lg px-3 py-3 transition-colors"
              >
                <span className="block text-base font-semibold">
                  {item.label}
                </span>
                {item.description ? (
                  <span className="text-muted-foreground mt-0.5 block text-sm">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t px-6 py-5">
          {user ? (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline" className="h-11 w-full">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </SheetClose>
              <Button
                variant="ghost"
                className="text-muted-foreground h-11 w-full"
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                }}
              >
                Log out of @{user.username}
              </Button>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline" className="h-11 w-full">
                  <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
                    Log in
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  asChild
                  className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-11 w-full"
                >
                  <Link href={`/join?next=${encodeURIComponent(pathname)}`}>
                    Join free
                  </Link>
                </Button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
