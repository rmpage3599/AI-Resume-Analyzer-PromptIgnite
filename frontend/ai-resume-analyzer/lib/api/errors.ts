import type { ApiErrorResponse } from "@/types/api";

/**
 * Typed error surface for the API layer. UI components should only
 * need to know about the HTTP status and a human-readable message —
 * never raw fetch plumbing.
 */
export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  get isClient(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServer(): boolean {
    return this.status >= 500;
  }
}

const NETWORK_MESSAGE =
  "Couldn't reach the resume analysis service. Make sure the backend is running.";

export async function parseError(res: Response): Promise<ApiError> {
  let payload: unknown = undefined;
  try {
    payload = await res.json();
  } catch {
    // body wasn't JSON — fall through with undefined payload
  }
  const detail = (payload as ApiErrorResponse | undefined)?.detail;
  const message =
    typeof detail === "string" && detail.length > 0
      ? detail
      : res.statusText || `Request failed (${res.status})`;
  return new ApiError(message, res.status, payload);
}

export async function assertOk(res: Response): Promise<void> {
  if (res.ok) return;
  throw await parseError(res);
}

export function asNetworkError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError(NETWORK_MESSAGE, 0, null);
}
