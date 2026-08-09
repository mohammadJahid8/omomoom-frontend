import Link from "next/link";

import { InstagramIcon } from "@/components/shared/social-icons";
import { SiteLogo } from "@/components/layout/site-logo";
import { footerNav, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface mt-auto border-t">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <SiteLogo />
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex items-center gap-2">
              <Link
                href={siteConfig.links.instagram}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-2 transition-colors"
                aria-label="Omomoom on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="size-4.5" />
              </Link>
            </div>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
              <h2
                id={`footer-${group.title}`}
                className="text-xs font-semibold tracking-[0.12em] uppercase"
              >
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-8 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-sm">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Made in {siteConfig.city} for people who love to eat.
          </p>
        </div>
      </div>
    </footer>
  );
}
