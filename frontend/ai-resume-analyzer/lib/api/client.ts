import { BACKEND_URL } from "./config";
import { assertOk, asNetworkError } from "./errors";

/**
 * Thin fetch wrapper. Centralizes:
 *   - the backend base URL
 *   - JSON / FormData branching
 *   - error normalization (ApiError)
 *   - a soft timeout
 *
 * Components and other service modules should call apiFetch/jsonFetch
 * instead of the raw fetch API.
 */
const DEFAULT_TIMEOUT_MS = 30_000;

type JsonInit = Omit<RequestInit, "body"> & { body?: unknown };

export async function jsonFetch<T>(
  path: string,
  init: JsonInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const url = joinUrl(BACKEND_URL, path);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(init.headers ?? {}),
      },
      body:
        init.body !== undefined ? JSON.stringify(init.body) : init.body,
      signal: controller.signal,
    });
    await assertOk(res);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw asNetworkError(new Error("timeout"));
    }
    throw asNetworkError(err);
  } finally {
    window.clearTimeout(timer);
  }
}

export async function multipartFetch<T>(
  path: string,
  formData: FormData,
  timeoutMs = 60_000,
): Promise<T> {
  const url = joinUrl(BACKEND_URL, path);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    // NOTE: do NOT set Content-Type here — the browser must include the
    // multipart boundary. Setting it manually breaks the upload.
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    await assertOk(res);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw asNetworkError(new Error("timeout"));
    }
    throw asNetworkError(err);
  } finally {
    window.clearTimeout(timer);
  }
}

function joinUrl(base: string, path: string): string {
  const left = base.replace(/\/+$/, "");
  const right = path.replace(/^\/+/, "");
  return `${left}/${right}`;
}
