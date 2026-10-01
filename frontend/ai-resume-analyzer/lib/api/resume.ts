import type { AnalysisResult } from "@/types/api";
import { multipartFetch } from "./client";

export function analyzeResume(
  resume: File,
  jobRoleId: string,
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append("jobRole", jobRoleId);
  return multipartFetch<AnalysisResult>("/api/analyze", formData);
}
