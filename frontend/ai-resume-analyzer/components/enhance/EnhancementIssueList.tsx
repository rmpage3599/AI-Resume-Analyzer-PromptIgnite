"use client";

import { CheckIcon, AlertIcon } from "@/components/core/Icons";
import type { EnhancementAnalysis, IssueSeverity } from "./enhanceData";

interface Props {
  analysis: EnhancementAnalysis;
}

export default function EnhancementIssueList({ analysis }: Props) {
  if (analysis.issues.length === 0) {
    return (
      <article className="glass px-6 py-6">
        <header>
          <span className="label-eyebrow">Formatting improvements</span>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.005em] text-[#0d2740]">
            No presentation issues detected
          </h2>
        </header>
        <p className="mt-3 text-[13.5px] text-[#4f667a]">
          Your resume&apos;s formatting already looks consistent.
        </p>
      </article>
    );
  }

  return (
    <article className="glass px-6 py-6 sm:px-7 sm:py-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="label-eyebrow">Formatting improvements</span>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.005em] text-[#0d2740]">
            Presentation adjustments
          </h2>
        </div>
        <span className="chip chip-navy">
          {analysis.improvementsCount} improvement
          {analysis.improvementsCount === 1 ? "" : "s"}
        </span>
      </header>

      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {analysis.issues.map((issue) => (
          <li
            key={issue.id}
            className="flex min-w-0 items-start gap-3 rounded-[12px] border border-[rgba(13,71,161,0.10)] bg-white/65 px-4 py-3.5 backdrop-blur-md"
          >
            <IssueIcon severity={issue.severity} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-[13.5px] font-semibold text-[#0d2740]">
                  {issue.title}
                </p>
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-[#7890a4]">
                  {issue.category}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#4f667a]">
                {issue.explanation}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function IssueIcon({ severity }: { severity: IssueSeverity }) {
  const iconClass = [
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]",
    severity === "good"
      ? "bg-[rgba(16,185,129,0.10)] text-[#059669]"
      : severity === "adjust"
        ? "bg-[rgba(245,158,11,0.10)] text-[#b45309]"
        : "bg-[rgba(244,63,94,0.10)] text-[#be123c]",
  ].join(" ");
  return (
    <span className={iconClass} aria-hidden>
      {severity === "good" ? (
        <CheckIcon className="h-3.5 w-3.5" />
      ) : (
        <AlertIcon className="h-3.5 w-3.5" />
      )}
    </span>
  );
}
