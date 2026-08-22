import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-extrabold sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-prose text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "bg-card rounded-3xl p-5 ring-1 ring-foreground/8 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function PanelTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-heading text-base font-bold">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      ) : null}
    </div>
  );
}

export type Tint = "rose" | "gold" | "olive" | "clay";

const TINT: Record<Tint, string> = {
  rose: "bg-tint-rose text-tint-rose-ink",
  gold: "bg-tint-gold text-tint-gold-ink",
  olive: "bg-tint-olive text-tint-olive-ink",
  clay: "bg-tint-clay text-tint-clay-ink",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tint = "rose",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  tint?: Tint;
}) {
  const body = (
    <>
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-2xl",
          TINT[tint],
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="font-heading mt-4 block text-3xl leading-none font-extrabold tabular-nums">
        {value}
      </span>
      <span className="text-muted-foreground mt-1.5 block text-sm font-medium">
        {label}
      </span>
    </>
  );

  const shell = "bg-card block rounded-3xl p-5 ring-1 ring-foreground/8";

  return href ? (
    <Link
      href={href}
      className={cn(
        shell,
        "hover:shadow-(--shadow-card-hover) transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tint = "rose",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; href: string };
  tint?: Tint;
}) {
  return (
    <div className="border-border/70 bg-card/40 flex flex-col items-center rounded-3xl border border-dashed px-6 py-16 text-center">
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-3xl",
          TINT[tint],
        )}
      >
        <Icon className="size-6" />
      </span>
      <h3 className="font-heading mt-5 text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
        {body}
      </p>
      {action ? (
        <Button
          asChild
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 mt-5 h-10 rounded-xl px-5 font-semibold"
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

