import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/types/contribution";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function when(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(iso));
}

export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            value <= rating
              ? "text-brand-ink fill-current"
              : "text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

export function RecommendationList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  if (recommendations.length === 0) {
    return (
      <p className="border-foreground/15 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm leading-relaxed">
        Nobody has said what to order here yet. Be the first — it is the most
        useful thing you can leave for the next person.
      </p>
    );
  }

  return (
    <ol className="grid gap-3">
      {recommendations.map((item) => (
        <li
          key={item.id}
          className="border-foreground/15 bg-card rounded-2xl border p-5"
        >
          <div className="flex items-start gap-3.5">
            <Avatar className="size-10 shrink-0">
              {item.user.avatarUrl ? (
                <AvatarImage src={item.user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-xs font-bold">
                {initials(item.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm font-semibold">
                  @{item.user.username}
                </span>
                <span className="text-muted-foreground text-xs">
                  {when(item.createdAt)}
                </span>
              </div>

              <p className="font-heading mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base font-bold">
                {item.dish}
                <Stars rating={item.rating} />
              </p>

              {item.comment ? (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.comment}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
