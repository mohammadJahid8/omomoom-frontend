"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  name: string;

  summary: string;
};

export function ShareButton({ name, summary }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: summary, url });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      onClick={onShare}
      className="rounded-full"
    >
      {copied ? (
        <Check className="text-brand size-4" aria-hidden="true" />
      ) : (
        <Share2 className="size-4" aria-hidden="true" />
      )}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
