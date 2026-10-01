"use client";

import { ArrowRightIcon, BriefcaseIcon, FileTextIcon } from "@/components/core/Icons";
import BrandMark from "@/components/shell/BrandMark";
import { getRole } from "@/lib/jobRoles";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DashboardTopBar({ result, onNewAnalysis }: Props) {
  const role = getRole(result.targetRole);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-void/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <BrandMark withText={false} size={28} />
        </div>
        <div className="hidden min-w-0 flex-1 items-center gap-2.5 lg:flex">
          <span className="mono text-[10.5px] tracking-[0.22em] text-fg-3">
            ANALYSIS
          </span>
          <ArrowRightIcon className="h-3 w-3 text-fg-3/70" />
          <span className="mono truncate text-[10.5px] tracking-[0.22em] text-azure/85">
            {role.shortLabel.toUpperCase()}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="chip hidden sm:inline-flex">
            <BriefcaseIcon className="h-3 w-3 text-azure" />
            {role.label}
          </span>
          <span className="chip hidden md:inline-flex">
            <FileTextIcon className="h-3 w-3 text-azure" />
            {result.resumeFileName}
          </span>
          <span className="chip hidden lg:inline-flex">
            {formatSize(result.resumeSizeBytes)}
          </span>
          <button
            type="button"
            onClick={onNewAnalysis}
            className="btn-ghost ml-1 rounded-[8px] px-3 py-1.5 text-[12.5px]"
          >
            New analysis
          </button>
        </div>
      </div>
    </header>
  );
}
