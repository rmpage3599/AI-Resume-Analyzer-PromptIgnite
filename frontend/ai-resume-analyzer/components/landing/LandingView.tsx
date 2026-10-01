"use client";

import { useState } from "react";
import { LockIcon } from "@/components/core/Icons";
import { ErrorNotice } from "@/components/ui/Notice";
import AnalyzingView from "./AnalyzingView";
import PipelineStrip from "./PipelineStrip";
import RoleSelect from "./RoleSelect";
import UploadPanel from "./UploadPanel";
import { getRole } from "@/lib/jobRoles";
import { AnalysisError, analyzeResume } from "@/lib/analyze";
import type { AnalysisResult, JobRoleId } from "@/lib/types";

interface Props {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function LandingView({ onAnalysisComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [roleId, setRoleId] = useState<JobRoleId>("ai-ml");
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onFileSelected = (f: File) => setFile(f);
  const onClearFile = () => {
    setFile(null);
    setFileError(null);
  };

  const submit = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    setAnalyzing(true);
    setApiError(null);
    try {
      const result = await analyzeResume(file, roleId);
      onAnalysisComplete(result);
    } catch (err) {
      setAnalyzing(false);
      if (err instanceof AnalysisError) {
        setApiError(err.message);
      } else {
        setApiError("Analysis couldn't be completed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (analyzing) {
    return (
      <AnalyzingView
        fileName={file?.name ?? ""}
        fileSizeBytes={file?.size ?? 0}
        roleLabel={getRole(roleId).label}
      />
    );
  }

  const role = getRole(roleId);

  return (
    <section className="anim-fade relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-14 pb-24 sm:pt-20">
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-azure/40" />
            <span className="eyebrow eyebrow-azure">
              Resume Intelligence Platform
            </span>
          </div>
          <h1 className="mt-5 text-[clamp(2.1rem,4.2vw,3.35rem)] font-semibold leading-[1.06] tracking-[-0.022em] text-fg">
            Understand your resume.
            <br />
            <span className="grad-text">Before recruiters do.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-2">
            Upload your resume and discover how well your skills, experience
            and education align with your target role.
          </p>

          <PipelineStrip />

          <div className="mt-8 flex items-start gap-3 rounded-[10px] border border-line bg-base/40 px-4 py-3.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-azure/25 bg-navy/15 text-azure">
              <LockIcon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[12.5px] leading-relaxed text-fg">
                Built for hiring signals, not hype.
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-fg-3">
                A focused diagnostic across skills, experience and education —
                delivered in seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="panel panel-primary relative overflow-hidden p-5 sm:p-6">
            <span aria-hidden className="corner-accent tl" />
            <span aria-hidden className="corner-accent tr" />
            <span aria-hidden className="corner-accent bl" />
            <span aria-hidden className="corner-accent br" />

            <div className="space-y-5">
              <UploadPanel
                file={file}
                error={fileError}
                onFileSelected={(f) => {
                  onFileSelected(f);
                  setApiError(null);
                }}
                onError={setFileError}
                onClear={() => {
                  onClearFile();
                  setApiError(null);
                }}
              />

              <div className="divider" />

              <RoleSelect value={roleId} onChange={setRoleId} />

              <div className="pt-1">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!file || submitting}
                  aria-disabled={!file || submitting}
                  className="btn-primary grad-cta relative w-full overflow-hidden rounded-[10px] px-6 py-3.5 text-[14px] font-semibold tracking-[0.04em] text-fg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {submitting ? (
                      <>
                        <span className="flex gap-1">
                          <Dot delay={0} />
                          <Dot delay={150} />
                          <Dot delay={300} />
                        </span>
                        <span>Analyzing…</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze Resume</span>
                        <span
                          aria-hidden
                          className="inline-block h-1 w-1 rounded-full bg-fg/60"
                        />
                        <span className="mono text-[11px] tracking-[0.18em] text-fg/70">
                          ENTER
                        </span>
                      </>
                    )}
                  </span>
                </button>

                {apiError && (
                  <div className="mt-4">
                    <ErrorNotice title={apiError} />
                  </div>
                )}

                <p className="mt-4 text-center text-[11.5px] leading-relaxed tracking-[0.01em] text-fg-3">
                  Your resume is processed temporarily and is not permanently
                  stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-fg"
      style={{
        animation: "twinkle 1s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}
