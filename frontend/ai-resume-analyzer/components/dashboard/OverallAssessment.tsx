"use client";

import { useState } from "react";
import { CheckIcon, DownloadIcon } from "@/components/core/Icons";
import {
  formatSuggestion,
  type AnalysisResult,
  type JobRole,
} from "@/lib/types";

interface Props {
  result: AnalysisResult;
  role?: JobRole;
}

function verdictSentence(
  score: number,
  candidateName: string | undefined,
  roleTitle: string,
): string {
  const subject =
    candidateName && candidateName.length > 0 ? candidateName : "This candidate";
  if (score >= 85) {
    return `${subject} is an excellent match for ${roleTitle}. The resume covers the required skills with very few gaps.`;
  }
  if (score >= 70) {
    return `${subject} shows a strong foundation for ${roleTitle}. Targeted improvements on the remaining gaps will lift alignment further.`;
  }
  if (score >= 55) {
    return `${subject} has a solid base for ${roleTitle}, with several gaps to close. Focus on the suggestions above to improve alignment.`;
  }
  if (score >= 40) {
    return `${subject} is an emerging match for ${roleTitle}. The suggestions above highlight the highest-impact skills to build next.`;
  }
  return `${subject} is at an early stage for ${roleTitle}. Tackling the missing skills in priority order will move alignment quickly.`;
}

function buildReportText(result: AnalysisResult, role?: JobRole): string {
  const lines: string[] = [];
  lines.push(`RESUMIND · ANALYSIS REPORT`);
  lines.push(`Generated ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Candidate   : ${result.candidate.name || "Unknown"}`);
  lines.push(`Resume      : ${result.fileName ?? "resume"}`);
  lines.push(`Target Role : ${role?.title ?? result.jobRoleId ?? "—"}`);
  lines.push(`Match Score : ${result.matchScore}%`);
  lines.push("");
  lines.push("MATCHED SKILLS");
  result.matchedSkills.forEach((s) => lines.push(`  + ${s}`));
  lines.push("");
  lines.push("MISSING SKILLS");
  if (result.missingSkills.length === 0)
    lines.push("  (none — all required skills covered)");
  result.missingSkills.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");
  lines.push("ALL DETECTED SKILLS");
  result.skills.forEach((s) => lines.push(`  • ${s}`));
  lines.push("");
  lines.push("EXPERIENCE");
  result.experience.forEach((e) => {
    lines.push(`  ${e.role} · ${e.company}`);
    lines.push(`    ${e.duration}`);
  });
  lines.push("");
  lines.push("EDUCATION");
  result.education.forEach((e) => {
    lines.push(`  ${e.degree} · ${e.institution}`);
    lines.push(`    ${e.duration}`);
  });
  lines.push("");
  lines.push("WHAT TO IMPROVE");
  result.suggestions.forEach((raw, i) => {
    const { title, detail } = formatSuggestion(raw);
    lines.push(`  ${String(i + 1).padStart(2, "0")} ${title}`);
    if (detail) lines.push(`     ${detail}`);
  });
  lines.push("");
  if (result.id) lines.push(`Record ID   : ${result.id}`);
  if (result.databaseBackend)
    lines.push(`Storage     : ${result.databaseBackend}`);
  return lines.join("\n");
}

export default function OverallAssessment({ result, role }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  const onDownload = () => {
    try {
      const text = buildReportText(result, role);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stem = (result.fileName ?? "resume").replace(/\.[^.]+$/, "");
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

  const roleTitle = role?.title ?? "the selected role";
  const verdict = verdictSentence(
    result.matchScore,
    result.candidate.name,
    roleTitle,
  );

  return (
    <article className="glass-strong px-6 py-7 sm:px-8 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <span className="label-eyebrow">Overall assessment</span>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.01em] text-[#0d2740]">
            You&apos;re positioned for {roleTitle}.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#4f667a]">
            {verdict}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 lg:items-end">
          <button
            type="button"
            onClick={onDownload}
            className="btn-primary grad-cta inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-semibold"
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
        </div>
      </div>
    </article>
  );
}
