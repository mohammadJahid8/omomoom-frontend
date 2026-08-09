"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const OVERLAY_ROUTES = new Set(["/", "/asian-eats"]);

export function SiteHeader() {
  const pathname = usePathname();
  const canOverlay = OVERLAY_ROUTES.has(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!canOverlay) return;

    const update = () => setScrolled(window.scrollY > 24);
    update();

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [canOverlay]);

  const transparent = canOverlay && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        transparent
          ? "bg-transparent"
          : "bg-background/90 supports-backdrop-filter:bg-background/75 shadow-(--shadow-header) backdrop-blur-md",
      )}
    >
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-18">
        <SiteLogo onDark={transparent} />

        <nav
          className="hidden items-center gap-1 justify-self-center lg:flex"
          aria-label="Main navigation"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                transparent
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full sm:hidden",
              transparent && "text-white hover:bg-white/10 hover:text-white",
            )}
          >
            <Link href="/restaurants" aria-label="Search restaurants">
              <Search className="size-4.5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              "hidden rounded-full sm:inline-flex",
              transparent &&
                "border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white",
            )}
          >
            <Link href="/login">Log in</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90 hidden rounded-full sm:inline-flex"
          >
            <Link href="/claim">Add your restaurant</Link>
          </Button>

          <MobileNav onDark={transparent} />
        </div>
      </div>
    </header>
  );
}
