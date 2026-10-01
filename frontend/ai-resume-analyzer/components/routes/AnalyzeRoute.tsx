"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/shell/TopNav";
import LandingView from "@/components/landing/LandingView";
import { ApiError, checkBackendHealth, fetchJobRoles } from "@/lib/api";
import { DEFAULT_JOB_ROLE_ID, FALLBACK_JOB_ROLES } from "@/lib/jobRoles";
import type { HealthResponse, JobRole } from "@/lib/types";

type JobsState =
  | { status: "loading" }
  | { status: "ready"; jobs: JobRole[] }
  | { status: "error"; message: string; jobs: JobRole[] };

export default function AnalyzeRoute() {
  const [jobs, setJobs] = useState<JobsState>({ status: "loading" });
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [j, h] = await Promise.allSettled([
          fetchJobRoles(),
          checkBackendHealth().catch(() => null),
        ]);
        if (cancelled) return;
        if (
          j.status === "fulfilled" &&
          Array.isArray(j.value) &&
          j.value.length > 0
        ) {
          setJobs({ status: "ready", jobs: j.value });
        } else {
          const message =
            j.status === "rejected" && j.reason instanceof ApiError
              ? j.reason.message
              : "Couldn't reach the resume analysis service.";
          setJobs({ status: "error", message, jobs: FALLBACK_JOB_ROLES });
        }
        if (h.status === "fulfilled") setHealth(h.value);
      } catch {
        // unreachable: jobs fallback covers the demo
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const jobsList =
    jobs.status === "ready"
      ? jobs.jobs
      : jobs.status === "error"
        ? jobs.jobs
        : FALLBACK_JOB_ROLES;
  const defaultRoleId =
    jobsList.find((r) => r.id === DEFAULT_JOB_ROLE_ID)?.id ??
    jobsList[0]?.id ??
    DEFAULT_JOB_ROLE_ID;

  return (
    <>
      <TopNav />
      <main>
        <LandingView
          jobs={jobsList}
          jobsLoading={jobs.status === "loading"}
          jobsError={jobs.status === "error" ? jobs.message : null}
          defaultRoleId={defaultRoleId}
        />
        {health?.database_backend && jobs.status === "ready" && (
          <p className="mx-auto mb-8 max-w-[1280px] px-4 text-center text-[11.5px] text-[#7890a4] sm:px-6 lg:px-8">
            Connected to {health.database_backend.toUpperCase()} backend.
          </p>
        )}
      </main>
    </>
  );
}
