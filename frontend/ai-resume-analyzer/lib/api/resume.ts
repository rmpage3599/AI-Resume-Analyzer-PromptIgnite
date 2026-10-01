import type { AnalysisResult } from "@/types/api";
import { multipartFetch } from "./client";

export function analyzeResume(
  resume: File,
  jobRoleId?: string,
  customJd?: string,
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", resume);
  if (customJd && customJd.trim()) {
    formData.append("customJd", customJd.trim());
  } else if (jobRoleId) {
    formData.append("jobRole", jobRoleId);
  }
  return multipartFetch<AnalysisResult>("/api/analyze", formData);
}

