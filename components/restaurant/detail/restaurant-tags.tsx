import Link from "next/link";

import { TAG_GROUP_LABELS, TAG_GROUP_ORDER } from "@/lib/restaurant";
import type { TagGroups } from "@/types/api";

export function RestaurantTags({ tags }: { tags: TagGroups }) {
  const groups = TAG_GROUP_ORDER.map((key) => ({
    key,
    label: TAG_GROUP_LABELS[key],
    items: tags[key] ?? [],
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  const FILTER_KEY: Record<string, string | undefined> = {
    DISH: "dish",
    OCCASION: "occasion",
    DIETARY: "dietary",
  };

  return (
    <section>
      <h2 className="font-heading text-xl font-bold sm:text-2xl">
        At a glance
      </h2>

      <dl className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.key} className="sm:flex sm:gap-6">
            <dt className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-[0.12em] uppercase sm:w-28 sm:pt-1.5">
              {group.label}
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5 sm:mt-0">
              {group.items.map((tag) => {
                const filterKey = FILTER_KEY[group.key];
                const content = (
                  <>
                    {tag.emoji ? (
                      <span aria-hidden="true">{tag.emoji}</span>
                    ) : null}
                    {tag.name}
                  </>
                );

                return filterKey ? (
                  <Link
                    key={tag.slug}
                    href={`/restaurants?${filterKey}=${tag.slug}`}
                    className="border-border-strong/50 hover:border-brand hover:bg-brand-subtle hover:text-brand inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <span
                    key={tag.slug}
                    className="border-border-strong/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
                  >
                    {content}
                  </span>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
