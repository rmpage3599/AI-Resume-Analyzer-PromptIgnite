import type { HealthResponse } from "@/types/api";
import { jsonFetch } from "./client";

export function checkBackendHealth(): Promise<HealthResponse> {
  return jsonFetch<HealthResponse>("/api/health", {}, 6_000);
}
