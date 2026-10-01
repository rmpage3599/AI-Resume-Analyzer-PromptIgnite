"use client";

import { useState } from "react";
import type { MultiRoleComparison, RoleRankingItem } from "@/types/api";
import { TrophyIcon, CheckIcon, AlertIcon } from "@/components/core/Icons";

interface Props {
  comparison?: MultiRoleComparison;
  candidateName?: string;
}

export default function MultiRoleSidebar({ comparison, candidateName }: Props) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  if (!comparison || !comparison.rankings || comparison.rankings.length === 0) {
    return null;
  }

  const toggleExpand = (roleId: string) => {
    setExpandedRole((prev) => (prev === roleId ? null : roleId));
  };

  return (
    <aside className="glass-strong h-fit rounded-[16px] p-5 sm:p-6">
      <div className="border-b border-[rgba(13,71,161,0.08)] pb-4">
        <span className="label-eyebrow">Multi-Role Benchmark</span>
        <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d2740]">
          Career Fit Leaderboard
        </h2>
        <p className="mt-1 text-[12.5px] text-[#4f667a]">
          Benchmarked across all {comparison.totalRolesCompared} industry job roles.
        </p>
      </div>

      {/* Best Career Fit Highlight */}
      <div className="mt-4 rounded-[12px] border border-amber-300/40 bg-gradient-to-br from-amber-50/90 via-amber-100/50 to-orange-50/70 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">
          <TrophyIcon className="h-4 w-4 text-amber-700" />
          <span>Best Career Fit</span>
        </div>
        <p className="mt-1.5 text-[16px] font-bold text-[#0d2740]">
          {comparison.bestFitRole}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12.5px] font-medium text-amber-900">
            Compatibility Score
          </span>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[13px] font-bold text-amber-950">
            {comparison.bestFitScore}%
          </span>
        </div>
      </div>

      {/* Ranked Roles Accordion */}
      <div className="mt-5 space-y-2.5">
        <div className="flex items-center justify-between text-[11.5px] font-semibold uppercase tracking-wider text-[#7890a4]">
          <span>Ranked Roles</span>
          <span>Match</span>
        </div>

        {comparison.rankings.map((r: RoleRankingItem, idx: number) => {
          const rank = idx + 1;
          const rankLabel = `#${rank.toString().padStart(2, "0")}`;
          const isExpanded = expandedRole === r.jobRoleId;

          return (
            <div
              key={r.jobRoleId}
              className={`rounded-[10px] border transition ${
                isExpanded
                  ? "border-[rgba(13,71,161,0.25)] bg-white/80 shadow-sm"
                  : "border-[rgba(13,71,161,0.08)] bg-white/50 hover:bg-white/70"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(r.jobRoleId)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`text-[11px] font-bold tabular-nums rounded px-1.5 py-0.5 ${
                      rank === 1
                        ? "bg-amber-100 text-amber-900 border border-amber-300/80"
                        : rank === 2
                        ? "bg-slate-200 text-slate-800"
                        : rank === 3
                        ? "bg-orange-100 text-orange-900"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {rankLabel}
                  </span>
                  <span className="truncate text-[13.5px] font-medium text-[#0d2740]">
                    {r.jobTitle}
                  </span>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#0d47a1]">
                    {r.matchScore}%
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-4 w-4 text-[#7890a4] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {/* Progress bar */}
              <div className="px-3 pb-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(13,71,161,0.08)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0d47a1] to-[#5b9cdd]"
                    style={{ width: `${Math.min(r.matchScore, 100)}%` }}
                  />
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="border-t border-[rgba(13,71,161,0.08)] p-3 text-[12px] space-y-2.5">
                  <div>
                    <span className="inline-flex items-center font-semibold text-emerald-800">
                      <CheckIcon className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                      Matched ({r.matchedSkillsCount}):
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.topMatchedSkills && r.topMatchedSkills.length > 0 ? (
                        r.topMatchedSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/50"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#7890a4]">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center font-semibold text-amber-800">
                      <AlertIcon className="mr-1 h-3.5 w-3.5 text-amber-600" />
                      Missing ({r.missingSkillsCount}):
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.topMissingSkills && r.topMissingSkills.length > 0 ? (
                        r.topMissingSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/50"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-700 font-medium">All covered!</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
