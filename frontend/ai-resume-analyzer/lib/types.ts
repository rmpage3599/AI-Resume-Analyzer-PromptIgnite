import type { AnalysisResult } from "@/types/api";

/**
 * Re-export the wire types so the UI can consume them via `@/lib/types`.
 * The UI consumes the backend contract directly — no derived shape.
 */
export type {
  AnalysisResult,
  JobRole,
  EducationEntry,
  ExperienceEntry,
  CandidateInfo,
  HealthResponse,
  HistoryItem,
  HistoryResponse,
  ApiErrorResponse,
} from "@/types/api";

export type SuggestionView = { title: string; detail: string };

/**
 * Best-effort split of a free-form suggestion string into a (title, detail)
 * pair for display. Pure formatting, never generates content.
 */
export function formatSuggestion(text: string): SuggestionView {
  const trimmed = text.trim();
  if (!trimmed) return { title: "", detail: "" };

  // Try separators in priority order: " — ", " - ", ":", first sentence.
  const separators = [" — ", " – ", " - ", ": ", ". "];
  for (const sep of separators) {
    const idx = trimmed.indexOf(sep);
    if (idx > 0 && idx < 80) {
      return {
        title: trimmed.slice(0, idx).trim(),
        detail: trimmed.slice(idx + sep.length).trim(),
      };
    }
  }
  // First sentence as title.
  const sentence = trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed;
  if (sentence.length < trimmed.length) {
    return {
      title: sentence.trim(),
      detail: trimmed.slice(sentence.length).trim(),
    };
  }
  return { title: trimmed, detail: "" };
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
