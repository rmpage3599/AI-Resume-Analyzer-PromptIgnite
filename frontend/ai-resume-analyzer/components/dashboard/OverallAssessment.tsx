"use client";

import { useState } from "react";
import { CheckIcon, DownloadIcon } from "@/components/core/Icons";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  result: AnalysisResult;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildReportText(result: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`RESUMIND · ANALYSIS REPORT`);
  lines.push(`Generated ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Candidate     : ${result.candidate.name || "Unknown"}`);
  lines.push(`Resume        : ${result.resumeFileName} (${formatSize(result.resumeSizeBytes)})`);
  lines.push(`Target Role   : ${result.targetRole}`);
  lines.push(`Match Score   : ${result.matchScore}%`);
  lines.push(
    `Requirements  : ${result.requirements.matched} of ${result.requirements.total} matched`,
  );
  lines.push("");
  lines.push("MATCHED SKILLS");
  result.matchedSkills.forEach((s) => lines.push(`  + ${s}`));
  lines.push("");
  lines.push("SKILL GAPS");
  result.gapSkills.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");
  lines.push("SKILL ALIGNMENT");
  result.alignment.forEach((b) => lines.push(`  ${b.name.padEnd(22)} ${b.value}%`));
  lines.push("");
  lines.push("EXPERIENCE");
  result.experience.forEach((e) => {
    lines.push(`  ${e.role} · ${e.company}`);
    lines.push(`    ${e.period}`);
    if (e.note) lines.push(`    ${e.note}`);
  });
  lines.push("");
  lines.push("EDUCATION");
  result.education.forEach((e) => {
    lines.push(`  ${e.degree} · ${e.institution}`);
    lines.push(`    ${e.period}`);
    if (e.detail) lines.push(`    ${e.detail}`);
  });
  lines.push("");
  lines.push("WHAT TO IMPROVE");
  result.suggestions.forEach((s, i) => {
    lines.push(`  ${String(i + 1).padStart(2, "0")} ${s.title}`);
    lines.push(`     ${s.detail}`);
  });
  lines.push("");
  lines.push("OVERALL ASSESSMENT");
  lines.push(`  ${result.assessment}`);
  return lines.join("\n");
}

export default function OverallAssessment({ result }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  const onDownload = () => {
    try {
      const text = buildReportText(result);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stem = result.resumeFileName.replace(/\.pdf$/i, "");
      a.download = `${stem || "resume"}-analysis.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 2200);
    } catch {
      /* ignore */
    }
  };

  return (
    <article className="panel panel-primary p-5 sm:p-7">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent tr" />
      <span aria-hidden className="corner-accent bl" />
      <span aria-hidden className="corner-accent br" />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="eyebrow eyebrow-azure">Overall Assessment</span>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.01em] text-fg">
            You&apos;re positioned for {result.targetRole.replace("-", " / ")}.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-fg-2">
            {result.assessment}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 lg:items-end">
          <button
            type="button"
            onClick={onDownload}
            className="btn-primary grad-cta inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[13px] font-semibold tracking-[0.04em]"
          >
            {downloaded ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Downloaded
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4" />
                Download Report
              </>
            )}
          </button>
          <p className="mono text-[10px] tracking-[0.18em] text-fg-3 lg:text-right">
            TEXT REPORT · CLIENT-SIDE
          </p>
        </div>
      </div>
    </article>
  );
}
