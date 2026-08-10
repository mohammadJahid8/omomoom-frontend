"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { dashboardNav, profileTabs } from "@/lib/dashboard-nav";
import type { SessionUser } from "@/types/auth";

type Crumb = { label: string; href?: string };

function crumbsFor(pathname: string, user: SessionUser): Crumb[] {
  const tab = profileTabs.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );

  if (tab) {
    return [
      { label: "Your food map", href: "/dashboard/profile" },
      { label: tab.label },
    ];
  }

  for (const group of dashboardNav(user)) {
    const item = group.items.find((entry) =>
      entry.exact ? pathname === entry.href : pathname.startsWith(entry.href),
    );

    if (item) {
      return group.label === "You"
        ? [{ label: item.label }]
        : [{ label: group.label }, { label: item.label }];
    }
  }

  return [{ label: "Dashboard", href: "/dashboard" }];
}

export function DashboardTopbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname, user);

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2.5 border-b px-4 backdrop-blur-md sm:h-18 sm:px-8">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1 rounded-lg" />

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li
                key={crumb.label}
                className="flex min-w-0 items-center gap-1.5"
              >
                {index > 0 ? (
                  <span className="text-muted-foreground/60" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {last ? (
                  <span aria-current="page" className="truncate font-semibold">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground truncate">
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
