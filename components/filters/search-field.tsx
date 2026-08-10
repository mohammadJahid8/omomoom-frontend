"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { useFilterState } from "@/components/filters/filter-state";
import { Button } from "@/components/ui/button";

export function SearchField() {
  const { filters, ask, aiBusy, aiNote } = useFilterState();
  const committed = filters.q;

  const [value, setValue] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);

  if (committed !== lastCommitted) {
    setLastCommitted(committed);
    setValue(committed);
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(value);
  };

  return (
    <div>
      <form
        onSubmit={onSubmit}
        role="search"
        aria-label="Describe what you are craving"
        className="border-border-strong/50 focus-within:border-brand-ink flex items-center gap-2 rounded-xl border py-2 pr-2 pl-4 transition-colors"
      >
        <label htmlFor="craving" className="sr-only">
          Describe what you are looking for
        </label>
        <input
          id="craving"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ramen in Wynwood, or somewhere fancy for a birthday"
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 text-sm outline-none sm:text-base"
        />

        <Button
          type="submit"
          size="sm"
          disabled={aiBusy || value.trim().length < 2}
          className="bg-brand-ink text-brand-ink-foreground hover:bg-brand-ink/90 h-9 shrink-0 rounded-lg px-3"
        >
          {aiBusy ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-3.5" aria-hidden="true" />
          )}
          Ask AI
        </Button>
      </form>

      {aiNote ? (
        <p
          className="text-muted-foreground mt-2.5 flex items-start gap-1.5 px-1 text-xs"
          aria-live="polite"
        >
          <Sparkles
            className="text-brand-ink mt-0.5 size-3 shrink-0"
            aria-hidden="true"
          />
          {aiNote}
        </p>
      ) : null}
    </div>
  );
}
