import type { AnalysisResult } from "@/lib/types";
import {
  analyzePresentation,
  type EnhancementAnalysis,
} from "@/components/enhance/enhanceData";

/**
 * Frontend service for the Resume Enhancement feature.
 *
 * Phase 1 of the enhancement feature runs entirely on the client:
 * the presentation analysis is derived deterministically from the
 * existing `AnalysisResult` (see `enhanceData.ts`) — no second
 * resume parsing or content generation happens here.
 *
 * The signature and shape mirror what a future POST /api/enhance
 * endpoint will return, so wiring the real backend later is a
 * drop-in change inside this file.
 *
 *   POST /api/enhance
 *     Body: { resumeId?: string, analysisId?: string }
 *     Response: { analysis: EnhancementAnalysis }
 */
export type EnhancementResult = EnhancementAnalysis;

export async function enhanceResume(
  analysis: AnalysisResult,
): Promise<EnhancementResult> {
  // Simulate latency to mirror a real round-trip so the loading state is visible.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return analyzePresentation(analysis);
}
