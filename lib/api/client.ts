import type { ApiResponse } from "@/types/api";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1"
).replace(/\/$/, "");

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
};

export async function apiFetch<T>(
  path: string,
  {
    method = "GET",
    body: payload,
    revalidate = 60,
    tags,
    signal,
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
      },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),

      ...(isRead ? { next: { revalidate, ...(tags ? { tags } : {}) } } : {}),
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
