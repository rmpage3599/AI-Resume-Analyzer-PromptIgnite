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
  const [roleId, setRoleId] = useState<string>(defaultRoleId);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const result: AnalysisResult = await analyzeResume(file, roleId);
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
    return (
      <section className="anim-fade relative z-10 mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <AnalyzingView
          fileName={file?.name ?? ""}
          roleLabel={role?.title ?? ""}
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
            Understand your resume.
            <br />
            <span className="grad-text">Before recruiters do.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4f667a]">
            See how your resume aligns with your target role.
          </p>

          <ol className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[#4f667a]">
            <Step n="01" label="Upload" />
            <Step n="02" label="Select role" />
            <Step n="03" label="Analyze" />
          </ol>

          {jobsError && (
            <div className="mt-8 rounded-[12px] border border-amber-400/30 bg-amber-50/70 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Backend unavailable
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#4f667a]">
                {jobsError} Start the FastAPI backend (
                <code className="rounded bg-white/70 px-1 py-0.5 text-[11px] text-[#0d47a1]">
                  NEXT_PUBLIC_BACKEND_URL
                </code>
                ) to enable real analysis.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="glass-strong space-y-5 px-5 py-6 sm:px-7 sm:py-7">
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

            <RoleSelect
              roles={jobs}
              value={roleId}
              onChange={setRoleId}
              loading={jobsLoading}
              disabled={jobsLoading || jobs.length === 0}
            />

            <div>
              <button
                type="button"
                onClick={submit}
                disabled={!file || submitting || jobsLoading}
                aria-disabled={!file || submitting || jobsLoading}
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
                Your resume is processed temporarily and is not permanently
                stored.
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
