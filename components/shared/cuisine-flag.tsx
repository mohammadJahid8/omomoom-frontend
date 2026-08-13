import { Sparkles, Soup } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";

import { cn } from "@/lib/utils";

/**
 * Windows renders regional-indicator flag emoji (🇯🇵) as the bare letters, and
 * has no colour flag font to fall back on. SVG so the mark is identical on
 * every platform.
 */
export function CuisineFlag({
  code,
  label,
  className,
}: {
  code: string | null;
  label: string;
  className?: string;
}) {
  const shape = cn("w-4.5 shrink-0 rounded-[2px]", className);

  if (code === "PAN_ASIAN") {
    return <Soup aria-hidden="true" className={cn("size-4.5 shrink-0", className)} />;
  }

  if (code === "FUSION") {
    return (
      <Sparkles aria-hidden="true" className={cn("size-4.5 shrink-0", className)} />
    );
  }

  const Flag = code
    ? (Flags as Record<string, React.ComponentType<{ title?: string; className?: string }>>)[code]
    : undefined;

  if (!Flag) return null;

  return <Flag title={label} className={shape} />;
}
