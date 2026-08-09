export const RESULTS_ID = "results";

export const FINDER_ID = "find";

const HEADER_OFFSET = 96;

const DURATION_MS = 620;

let cancelCurrent: (() => void) | null = null;

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type ScrollOptions = {
  onlyIfOffscreen?: boolean;
};

export function smoothScrollTo(id: string, options: ScrollOptions = {}): void {
  if (typeof window === "undefined") return;

  cancelCurrent?.();

  requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (!target) return;

    if (options.onlyIfOffscreen) {
      const { top } = target.getBoundingClientRect();
      if (top >= 0 && top < window.innerHeight * 0.75) return;
    }

    const destination = () => {
      const rect = target.getBoundingClientRect();
      const wanted = window.scrollY + rect.top - HEADER_OFFSET;

      const limit = document.documentElement.scrollHeight - window.innerHeight;
      return Math.max(0, Math.min(wanted, limit));
    };

    if (prefersReducedMotion()) {
      window.scrollTo(0, destination());
      return;
    }

    const from = window.scrollY;
    let start: number | null = null;
    let frame = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      cancelCurrent = null;
    };

    window.addEventListener("wheel", stop, { passive: true, once: true });
    window.addEventListener("touchstart", stop, { passive: true, once: true });
    window.addEventListener("keydown", stop, { once: true });
    cancelCurrent = stop;

    const step = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / DURATION_MS, 1);

      window.scrollTo(0, from + (destination() - from) * easeInOut(progress));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      stop();
    };

    frame = requestAnimationFrame(step);
  });
}

export const scrollToResults = (): void =>
  smoothScrollTo(RESULTS_ID, { onlyIfOffscreen: true });
