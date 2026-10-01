import type { AnalysisResult } from "@/lib/types";

/**
 * Per-session, in-browser handoff of the latest analysis result between the
 * `/analyze` and `/results` routes. This is NOT permanent storage — the value
 * is scoped to the current browser tab session and is discarded on tab close.
 *
 * The backend remains the source of truth; this helper only bridges client
 * routes so the user doesn't have to re-upload their resume to see results.
 */
const KEY = "resumind:last-result";

export function saveResult(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* ignore quota / unavailable storage */
  }
}

export function loadResult(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnalysisResult;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasResult(): boolean {
  return loadResult() !== null;
}
