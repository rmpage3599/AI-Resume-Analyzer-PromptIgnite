"use client";

import Link from "next/link";
import type { JobRole } from "@/lib/types";

interface Props {
  role?: JobRole;
  fileName?: string;
  onNewAnalysis: () => void;
}

export function ResultHeader({ role, fileName, onNewAnalysis }: Props) {
  const roleLabel = role?.title ?? "this role";
  const resumeLabel = fileName ?? "resume";

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <span className="label-eyebrow">Resume Analysis</span>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.015em] text-[#0d2740] sm:text-[30px]">
          {roleLabel}
        </h1>
        <p className="mt-1.5 text-[14px] text-[#4f667a]">{resumeLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/analyze" className="btn-secondary px-4 py-2 text-[13px] font-medium">
          New analysis
        </Link>
        <button
          type="button"
          onClick={onNewAnalysis}
          className="btn-primary grad-cta rounded-[10px] px-4 py-2 text-[13px] font-semibold"
        >
          Analyze another
        </button>
      </div>
    </header>
  );
}
