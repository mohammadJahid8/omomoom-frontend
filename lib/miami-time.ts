export const MIAMI_TZ = "America/New_York";

/**
 * Everything on Omomoom happens in Miami, so event times are Miami times no
 * matter where the admin or the reader is sitting. Without this an admin in
 * another timezone types 7pm and the site shows a different hour.
 */
function offsetMs(instant: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: MIAMI_TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - instant.getTime();
}

/** An instant to the `YYYY-MM-DDTHH:mm` a Miami clock would read. */
export function toMiamiInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return "";
  return new Date(instant.getTime() + offsetMs(instant)).toISOString().slice(0, 16);
}

/** `YYYY-MM-DDTHH:mm` typed as a Miami clock reading, back to an instant. */
export function fromMiamiInput(value: string): string | null {
  if (!value) return null;

  const naive = Date.parse(`${value}:00Z`);
  if (Number.isNaN(naive)) return null;

  // Two passes so an event on a daylight-saving boundary still resolves.
  let instant = naive;
  for (let pass = 0; pass < 2; pass += 1) {
    instant = naive - offsetMs(new Date(instant));
  }

  return new Date(instant).toISOString();
}
