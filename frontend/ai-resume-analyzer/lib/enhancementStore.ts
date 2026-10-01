import type { EnhancementAnalysis } from "@/components/enhance/enhanceData";

/**
 * Per-session, in-browser handoff for Resume Enhancement state.
 *
 * This is NOT permanent storage. It lets the user navigate between
 * /results and /enhance without re-running the deterministic analysis.
 */

const STYLE_KEY = "resumind:enhance-style";
const RESULT_KEY = "resumind:enhance-result";

export type EnhanceStyle = "professional" | "minimal" | "modern";

export const STYLE_OPTIONS: { value: EnhanceStyle; label: string; description: string }[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Clean type, strong hierarchy, conservative spacing.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Maximum whitespace, simple typography, minimal decoration.",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Contemporary spacing, subtle blue accents.",
  },
];

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadStyle(): EnhanceStyle {
  const raw = safeGet(STYLE_KEY);
  if (raw === "minimal" || raw === "modern" || raw === "professional") {
    return raw;
  }
  return "professional";
}

export function saveStyle(style: EnhanceStyle): void {
  safeSet(STYLE_KEY, style);
}

export function loadAnalysis(): EnhancementAnalysis | null {
  const raw = safeGet(RESULT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EnhancementAnalysis;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAnalysis(value: EnhancementAnalysis): void {
  safeSet(RESULT_KEY, JSON.stringify(value));
}

export function clearAnalysis(): void {
  safeRemove(RESULT_KEY);
}
