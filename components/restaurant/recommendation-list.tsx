import { Sparkles, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { OrderAgain, Recommendation } from "@/types/contribution";

const AGAIN_LABEL: Record<OrderAgain, string> = {
  DEFINITELY: "Would order again",
  MAYBE: "Might order again",
  NO: "Would not order again",
};

const AGAIN_TONE: Record<OrderAgain, string> = {
  DEFINITELY: "bg-tint-olive text-tint-olive-ink",
  MAYBE: "bg-tint-gold text-tint-gold-ink",
  NO: "bg-muted text-muted-foreground",
};

function aspectsOf(item: Recommendation): [string, number][] {
  return (
    [
      ["Taste", item.taste],
      ["Service", item.service],
      ["Value", item.value],
      ["Ambience", item.ambience],
      ["Hygiene", item.hygiene],
    ] as [string, number | null][]
  ).filter((entry): entry is [string, number] => entry[1] !== null);
}

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
                {item.wouldOrderAgain ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      AGAIN_TONE[item.wouldOrderAgain],
                    )}
                  >
                    {AGAIN_LABEL[item.wouldOrderAgain]}
                  </span>
                ) : null}
              </p>

              {item.comment ? (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.comment}
                </p>
              ) : null}

              {item.aiSummary ? (
                <p className="text-muted-foreground/90 mt-2.5 flex items-start gap-1.5 text-sm italic">
                  <Sparkles
                    className="text-brand mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {item.aiSummary}
                </p>
              ) : null}

              {aspectsOf(item).length > 0 ? (
                <dl className="text-muted-foreground mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                  {item.visitScore !== null ? (
                    <div className="bg-tint-rose text-tint-rose-ink flex items-center gap-1.5 rounded-full px-2.5 py-1">
                      <dt className="font-semibold">Score</dt>
                      <dd className="font-bold tabular-nums">
                        {item.visitScore.toFixed(1)}/5
                      </dd>
                    </div>
                  ) : null}
                  {aspectsOf(item).map(([label, score]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <dt>{label}</dt>
                      <dd className="text-foreground font-semibold tabular-nums">
                        {score}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
