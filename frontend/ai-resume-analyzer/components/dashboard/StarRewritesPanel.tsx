"use client";

import type { AtsRubric, StarRewrite } from "@/types/api";

interface Props {
  rubric?: AtsRubric;
  starRewrites?: StarRewrite[];
  atsScore?: number;
}

export default function StarRewritesPanel({
  rubric,
  starRewrites,
  atsScore,
}: Props) {
  if (!rubric && (!starRewrites || starRewrites.length === 0)) {
    return null;
  }

  const sub = rubric?.subScores;

  return (
    <div className="space-y-5">
      {rubric && (
        <article className="glass-strong px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(13,71,161,0.08)] pb-4">
            <div>
              <span className="label-eyebrow">Enterprise ATS Evaluation</span>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.005em] text-[#0d2740]">
                Multi-Factor ATS Rubric Breakdown
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50/80 px-3.5 py-1 text-[13px] font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Overall ATS Score: {atsScore ?? rubric.overallAtsScore}/100
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[12px] border border-[rgba(13,71,161,0.08)] bg-white/60 p-4 backdrop-blur-md">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#7890a4]">
                Keyword Alignment
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-[#0d2740]">
                  {sub?.keywordMatchScore?.score ?? 0}
                </span>
                <span className="text-[14px] text-[#7890a4]">/40</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#4f667a]">
                Coverage of core technical keywords & taxonomy aliases.
              </p>
            </div>

            <div className="rounded-[12px] border border-[rgba(13,71,161,0.08)] bg-white/60 p-4 backdrop-blur-md">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#7890a4]">
                Impact & Metrics
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-[#0d2740]">
                  {sub?.impactQuantificationScore?.score ?? 0}
                </span>
                <span className="text-[14px] text-[#7890a4]">/25</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#4f667a]">
                Quantified results with %, $, latency, and business scale.
              </p>
            </div>

            <div className="rounded-[12px] border border-[rgba(13,71,161,0.08)] bg-white/60 p-4 backdrop-blur-md">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#7890a4]">
                Active Power Verbs
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-[#0d2740]">
                  {sub?.actionVerbScore?.score ?? 0}
                </span>
                <span className="text-[14px] text-[#7890a4]">/20</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#4f667a]">
                Strong executive phrasing replacing passive bullet points.
              </p>
            </div>

            <div className="rounded-[12px] border border-[rgba(13,71,161,0.08)] bg-white/60 p-4 backdrop-blur-md">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#7890a4]">
                Format & Readability
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-[#0d2740]">
                  {sub?.formattingReadabilityScore?.score ?? 0}
                </span>
                <span className="text-[14px] text-[#7890a4]">/15</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#4f667a]">
                Structure, section headers, clear dates, and parseability.
              </p>
            </div>
          </div>
        </article>
      )}

      {starRewrites && starRewrites.length > 0 && (
        <article className="glass-strong px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(13,71,161,0.08)] pb-4">
            <div>
              <span className="label-eyebrow">Groq AI Optimization</span>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.005em] text-[#0d2740]">
                Executive STAR Bullet Point Rewrites
              </h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-50/80 px-3 py-1 text-[12px] font-semibold text-sky-800">
              ⚡ Generated via Groq Llama / GPT-OSS
            </div>
          </div>
          <p className="mt-2 text-[13px] text-[#4f667a]">
            Actionable rewrites applying the STAR (Situation, Task, Action, Result) method to transform passive experience bullets into high-impact accomplishments.
          </p>

          <div className="mt-6 space-y-4">
            {starRewrites.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[14px] border border-[rgba(13,71,161,0.12)] bg-white/70 p-5 backdrop-blur-md transition hover:border-[rgba(13,71,161,0.25)]"
              >
                <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wider text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Original Phrasing
                </div>
                <p className="mt-1.5 text-[13.5px] italic text-[#4f667a]">
                  &ldquo;{item.originalBullet}&rdquo;
                </p>

                <div className="mt-4 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wider text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ✨ High-Impact STAR Rewrite
                </div>
                <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-[#0d2740]">
                  {item.improvedStarBullet}
                </p>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
