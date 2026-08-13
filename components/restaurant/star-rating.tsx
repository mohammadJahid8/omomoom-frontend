"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({
  name,
  value,
  onChange,
  size = "md",
  label,
}: {
  name: string;
  value: number;
  onChange: (next: number) => void;
  size?: "sm" | "md" | "lg";
  label: string;
}) {
  const star = size === "lg" ? "size-8" : size === "md" ? "size-6" : "size-5";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={`${score} out of 5`}
          id={score === 1 ? `${name}-1` : undefined}
          onClick={() => onChange(value === score ? 0 : score)}
          className={cn(
            "focus-visible:ring-ring/60 rounded-md p-0.5 transition-colors outline-none focus-visible:ring-3",
            score <= value
              ? "text-brand-ink"
              : "text-border-strong hover:text-brand-ink/50",
          )}
        >
          <Star className={cn(star, score <= value && "fill-current")} />
        </button>
      ))}
    </div>
  );
}
