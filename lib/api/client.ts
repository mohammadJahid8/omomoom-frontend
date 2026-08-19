import type { ApiResponse } from "@/types/api";

const trim = (value: string) => value.replace(/\/$/, "");

/**
 * Two bases, deliberately.
 *
 * The browser uses a path on our own origin (`/api/v1`) so the proxy in
 * next.config keeps the session cookie first-party. The Next server cannot
 * fetch a relative URL, and would be talking to itself if it could, so it goes
 * straight to the API and forwards the cookie by hand.
 */
const BROWSER_BASE = trim(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1",
);

const SERVER_BASE = trim(
  process.env.API_INTERNAL_URL
    ? `${trim(process.env.API_INTERNAL_URL)}/api/v1`
    : BROWSER_BASE.startsWith("/")
      ? "http://localhost:5001/api/v1"
      : BROWSER_BASE,
);

export const API_BASE_URL =
  typeof window === "undefined" ? SERVER_BASE : BROWSER_BASE;

const BASE_URL = API_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";

  body?: unknown;

  revalidate?: number;

  tags?: string[];
  signal?: AbortSignal;

  /** Send the session cookie and never cache the result. */
  session?: boolean;

  /** Read fresh every time without sending credentials. */
  noStore?: boolean;

  headers?: Record<string, string>;
};

export async function apiFetch<T>(
  path: string,
  {
    method = "GET",
    body: payload,
    revalidate = 60,
    tags,
    signal,
    session = false,
    noStore = false,
    headers,
  }: FetchOptions = {},
): Promise<{ data: T; meta?: ApiResponse<T>["meta"] }> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const isRead = method === "GET";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(payload === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...headers,
      },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
      ...(session ? { credentials: "include", cache: "no-store" } : {}),
      ...(noStore && !session ? { cache: "no-store" as const } : {}),

      ...(isRead && !session && !noStore
        ? { next: { revalidate, ...(tags ? { tags } : {}) } }
        : {}),
    });
  } catch (cause) {
    throw new ApiError(`Could not reach the API at ${url}`, 503, [
      {
        path: "",
        message: cause instanceof Error ? cause.message : "Network error",
      },
    ]);
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      `API returned a non-JSON response (${response.status}) from ${url}. ` +
        `Check NEXT_PUBLIC_API_URL, currently "${BASE_URL}".`,
      response.status,
    );
  }

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.message ?? `Request failed with ${response.status}`,
      body.statusCode ?? response.status,
      body.errorDetails ?? [],
    );
  }

  return { data: body.data, meta: body.meta };
}
