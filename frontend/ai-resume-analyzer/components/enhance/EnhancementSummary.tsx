"use client";

import {
  CATEGORY_DESCRIPTION,
  SEVERITY_DOT,
  SEVERITY_LABEL,
  type EnhancementAnalysis,
  type IssueCategory,
} from "./enhanceData";

interface Props {
  analysis: EnhancementAnalysis;
}

const CATEGORIES: IssueCategory[] = [
  "Typography",
  "Spacing",
  "Structure",
  "Consistency",
];

export default function EnhancementSummary({ analysis }: Props) {
  const overallSeverities = Object.values(analysis.categoryStatus);
  const overall: "good" | "adjust" | "improve" =
    overallSeverities.includes("improve")
      ? "improve"
      : overallSeverities.includes("adjust")
        ? "adjust"
        : "good";

  return (
    <article className="glass-strong px-6 py-6 sm:px-8 sm:py-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="label-eyebrow">Resume presentation</span>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.005em] text-[#0d2740]">
            How your resume currently reads
          </h2>
        </div>
        <span
          className={`chip ${overall === "good" ? "" : "chip-navy"} flex items-center gap-1.5`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[overall]}`}
          />
          {overall === "good"
            ? "Looks good"
            : overall === "adjust"
              ? "Needs adjustment"
              : "Needs improvement"}
        </span>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const sev = analysis.categoryStatus[cat];
          return (
            <div
              key={cat}
              className="rounded-[12px] border border-[rgba(13,71,161,0.10)] bg-white/65 px-4 py-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#0d2740]">
                  {cat}
                </p>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[sev]}`}
                />
              </div>
              <p className="mt-1.5 text-[12.5px] text-[#4f667a]">
                {SEVERITY_LABEL[sev]}
              </p>
              <p className="mt-2 text-[11.5px] leading-snug text-[#7890a4]">
                {CATEGORY_DESCRIPTION[cat]}
              </p>
            </div>
          );
        })}
      </div>

      {analysis.contentEnhancement && (
        <div className="mt-5 rounded-xl border border-blue-200/80 bg-blue-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Content & Wording Optimization
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                AI STAR rewrites, strong action verbs, and tailored positioning ready to apply.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#0d47a1] border border-blue-200 shadow-xs">
                {analysis.contentEnhancement.starRewritesCount} STAR Rewrites
              </span>
              <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-xs">
                {analysis.contentEnhancement.actionVerbsCount} Action Verbs
              </span>
              <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200 shadow-xs">
                {analysis.contentEnhancement.skillsPrioritizedCount} Core Skills
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-[12px] text-[#7890a4]">
        Content wording is upgraded strictly using verified analysis suggestions and STAR rewrites without fabricating fake skills or unverified experience.
      </p>
    </article>
  );
}
