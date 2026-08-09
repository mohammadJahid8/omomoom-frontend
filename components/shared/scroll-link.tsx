"use client";

import type { MouseEvent, ReactNode } from "react";

import { smoothScrollTo } from "@/lib/smooth-scroll";

type ScrollLinkProps = {
  targetId: string;
  children: ReactNode;
  className?: string;
};

export function ScrollLink({ targetId, children, className }: ScrollLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    smoothScrollTo(targetId);
  };

  return (
    <a href={`#${targetId}`} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
