export function safeNextPath(value: unknown, fallback = "/"): string {
  return typeof value === "string" && /^\/(?!\/)/.test(value) ? value : fallback;
}

const OAUTH_MESSAGES: Record<string, string> = {
  invalid_state:
    "That sign-in link expired before you finished. Try Google again.",
  access_denied: "You cancelled the Google sign-in.",
};

export function oauthErrorMessage(code: unknown): string | null {
  if (typeof code !== "string" || !code) return null;
  return (
    OAUTH_MESSAGES[code] ?? "Google sign-in did not complete. Please try again."
  );
}
