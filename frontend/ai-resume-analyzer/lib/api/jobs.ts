import type { JobRole } from "@/types/api";
import { jsonFetch } from "./client";

export function fetchJobRoles(): Promise<JobRole[]> {
  return jsonFetch<JobRole[]>("/api/jobs");
}
