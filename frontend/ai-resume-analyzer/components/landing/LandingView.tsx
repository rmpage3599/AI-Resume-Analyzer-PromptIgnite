"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorNotice } from "@/components/ui/Notice";
import AnalyzingView from "./AnalyzingView";
import RoleSelect from "./RoleSelect";
import UploadPanel from "./UploadPanel";
import { ApiError, analyzeResume } from "@/lib/api";
import { saveResult } from "@/lib/resultStore";
import type { AnalysisResult, JobRole } from "@/lib/types";

interface Props {
  jobs: JobRole[];
  jobsLoading?: boolean;
  jobsError?: string | null;
  defaultRoleId: string;
}

export default function LandingView({
  jobs,
  jobsLoading,
  jobsError,
  defaultRoleId,
}: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"role" | "custom">("role");
  const [roleId, setRoleId] = useState<string>(defaultRoleId);
  const [customJd, setCustomJd] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!file || submitting) return;
    if (mode === "custom" && !customJd.trim()) {
      setApiError("Please paste a job description.");
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const result: AnalysisResult = await analyzeResume(
        file,
        mode === "role" ? roleId : undefined,
        mode === "custom" ? customJd.trim() : undefined,
      );
      saveResult(result);
      window.dispatchEvent(new Event("resumind:result-updated"));
      router.push("/results");
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Analysis couldn't be completed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    const role = jobs.find((r) => r.id === roleId) ?? jobs[0];
    const targetLabel = mode === "custom" ? "Custom Job Description" : (role?.title ?? "Target Role");
    return (
      <section className="anim-fade relative z-10 mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <AnalyzingView
          fileName={file?.name ?? ""}
          roleLabel={targetLabel}
        />
      </section>
    );
  }

  const role = jobs.find((r) => r.id === roleId);

  return (
    <section className="anim-fade relative z-10 mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h1 className="text-[clamp(2rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.022em] text-[#0d2740]">
            AI Resume Analyzer.
            <br />
            <span className="grad-text">Scored & Benchmarked.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#4f667a]">
            Match your resume against industry roles or custom job descriptions with ATS rubric scoring and AI insights.
          </p>

          <ol className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[#4f667a]">
            <Step n="01" label="Upload Resume" />
            <Step n="02" label="Select Role or Paste JD" />
            <Step n="03" label="Instant Analysis" />
          </ol>

          {jobsError && (
            <div className="mt-8 rounded-[12px] border border-amber-400/30 bg-amber-50/70 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Backend unavailable
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#4f667a]">
                {jobsError} Start the FastAPI backend on port 8000.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="glass-strong space-y-5 px-5 py-6 sm:px-7 sm:py-7">
            {/* Step 1: Upload */}
            <UploadPanel
              file={file}
              error={fileError}
              onFileSelected={(f) => {
                setFile(f);
                setApiError(null);
              }}
              onError={setFileError}
              onClear={() => {
                setFile(null);
                setFileError(null);
                setApiError(null);
              }}
            />

            {/* Step 2: Role or Custom JD Mode Toggle */}
            <div className="space-y-3">
              <div className="flex rounded-[10px] bg-[rgba(13,71,161,0.06)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("role");
                    setApiError(null);
                  }}
                  className={`flex-1 rounded-[8px] py-1.5 text-[13px] font-semibold transition ${
                    mode === "role"
                      ? "bg-white text-[#0d47a1] shadow-sm"
                      : "text-[#4f667a] hover:text-[#0d2740]"
                  }`}
                >
                  🎯 Predefined Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("custom");
                    setApiError(null);
                  }}
                  className={`flex-1 rounded-[8px] py-1.5 text-[13px] font-semibold transition ${
                    mode === "custom"
                      ? "bg-white text-[#0d47a1] shadow-sm"
                      : "text-[#4f667a] hover:text-[#0d2740]"
                  }`}
                >
                  📝 Custom Job Description
                </button>
              </div>

              {mode === "role" ? (
                <RoleSelect
                  roles={jobs}
                  value={roleId}
                  onChange={setRoleId}
                  loading={jobsLoading}
                  disabled={jobsLoading || jobs.length === 0}
                />
              ) : (
                <div>
                  <textarea
                    value={customJd}
                    onChange={(e) => {
                      setCustomJd(e.target.value);
                      setApiError(null);
                    }}
                    placeholder="Paste job description requirements, qualifications, and skills here..."
                    rows={4}
                    className="w-full resize-none rounded-[12px] border border-[rgba(13,71,161,0.15)] bg-white/70 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#0d2740] placeholder:text-[#7890a4] focus:border-[#0d47a1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d47a1]/15"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Submit */}
            <div>
              <button
                type="button"
                onClick={submit}
                disabled={!file || submitting || (mode === "role" && jobsLoading) || (mode === "custom" && !customJd.trim())}
                aria-disabled={!file || submitting || (mode === "role" && jobsLoading) || (mode === "custom" && !customJd.trim())}
                className="btn-primary grad-cta w-full rounded-[12px] px-6 py-3.5 text-[14px] font-semibold tracking-[0.01em]"
              >
                Analyze Resume
              </button>

              {apiError && (
                <div className="mt-4">
                  <ErrorNotice title={apiError} />
                </div>
              )}

              <p className="mt-3 text-center text-[11.5px] text-[#7890a4]">
                Your resume is evaluated securely with Groq AI and ATS scoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function Step({ n, label }: { n: string; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[13.5px]">
      <span className="text-[11.5px] font-semibold tabular-nums text-[#0d47a1]/70">
        {n}
      </span>
      <span className="text-[#4f667a]">{label}</span>
    </li>
  );
}
