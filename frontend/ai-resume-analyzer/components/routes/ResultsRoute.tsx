"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/shell/TopNav";
import ResultsDashboard from "@/components/dashboard/ResultsDashboard";
import { ApiError, fetchJobRoles } from "@/lib/api";
import { FALLBACK_JOB_ROLES } from "@/lib/jobRoles";
import { clearResult, loadResult } from "@/lib/resultStore";
import type { AnalysisResult, JobRole } from "@/lib/types";

export default function ResultsRoute() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null | undefined>(
    undefined,
  );
  const [jobs, setJobs] = useState<JobRole[]>([]);

  useEffect(() => {
    const stored = loadResult();
    if (!stored) {
      setResult(null);
      return;
    }
    setResult(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJobRoles();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setJobs(data);
          return;
        }
      } catch (err) {
        // ignore — fallback will be used
      }
      if (!cancelled) setJobs(FALLBACK_JOB_ROLES);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onNewAnalysis = () => {
    clearResult();
    window.dispatchEvent(new Event("resumind:result-updated"));
    router.push("/analyze");
  };

  // Loading the cached result
  if (result === undefined) {
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-center text-[#7890a4]">Loading…</p>
        </main>
      </>
    );
  }

  // No cached result → redirect to /analyze
  if (result === null) {
    if (typeof window !== "undefined") router.replace("/analyze");
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-center text-[#7890a4]">
            No analysis to display yet.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main>
        <ResultsDashboard
          result={result}
          jobs={jobs}
          onNewAnalysis={onNewAnalysis}
        />
      </main>
    </>
  );
}
