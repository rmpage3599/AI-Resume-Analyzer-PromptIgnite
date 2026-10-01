"use client";

import type { JobRole } from "@/lib/types";

interface Props {
  role?: JobRole;
  fileName?: string;
  targetJobTitle?: string;
}

export function ResultHeader({ role, fileName, targetJobTitle }: Props) {
  const roleLabel = targetJobTitle || role?.title || "Target Role";
  const resumeLabel = fileName ?? "Candidate Resume";

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(13,71,161,0.08)] pb-6">
      <div className="min-w-0">
        <span className="label-eyebrow">Resume Analysis Report</span>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.015em] text-[#0d2740] sm:text-[32px]">
          {roleLabel}
        </h1>
        <p className="mt-1 text-[13.5px] text-[#4f667a]">
          Benchmarked file: <span className="font-medium text-[#0d2740]">{resumeLabel}</span>
        </p>
      </div>
    </header>
  );
}

