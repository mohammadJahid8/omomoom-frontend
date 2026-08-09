import Link from "next/link";
import { Quote } from "lucide-react";

import { COMMUNITY_POSTS, type CommunityPost } from "@/lib/mock/asian-eats";

const AVATAR_TONES = [
  "bg-brand/15 text-brand",
  "bg-terracotta/15 text-terracotta",
  "bg-foreground/10 text-foreground",
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));

export function CommunityRecommendations() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {COMMUNITY_POSTS.map((post, index) => (
        <PostCard key={post.id} post={post} tone={index % AVATAR_TONES.length} />
      ))}
    </ul>
  );
}

function PostCard({ post, tone }: { post: CommunityPost; tone: number }) {
  return (
    <li className="bg-card flex flex-col rounded-2xl border p-5 shadow-(--shadow-card)">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${AVATAR_TONES[tone]}`}
          aria-hidden="true"
        >
          {initials(post.author)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.author}</p>
          <p className="text-muted-foreground truncate text-xs">
            @{post.authorHandle} &middot; {formatDate(post.postedAt)}
          </p>
        </div>
      </div>

      <blockquote className="text-muted-foreground mt-4 flex-1 text-sm leading-relaxed">
        <Quote
          className="text-brand/40 mb-1.5 size-4"
          aria-hidden="true"
        />
        {post.quote}
      </blockquote>

      <div className="mt-4 border-t pt-4">
        <p className="text-brand text-[10px] font-bold tracking-[0.16em] uppercase">
          Ordered
        </p>
        <p className="mt-1 text-sm font-semibold">{post.dish}</p>
        <Link
          href={`/restaurants/${post.restaurantSlug}`}
          className="text-muted-foreground hover:text-brand mt-1 inline-block text-sm transition-colors"
        >
          at {post.restaurantName}
        </Link>
      </div>
    </li>
  );
}
