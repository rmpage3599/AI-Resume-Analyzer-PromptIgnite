"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/core/Icons";
import BeforeAfterPreview from "./BeforeAfterPreview";
import EnhancedResumeView from "./EnhancedResumeView";
import EnhancementIssueList from "./EnhancementIssueList";
import EnhancementProgress from "./EnhancementProgress";
import EnhancementSummary from "./EnhancementSummary";
import StylePresetSelector from "./StylePresetSelector";
import {
  analyzePresentation,
  buildPreviewModel,
  type EnhancementAnalysis,
  type PreviewModel,
} from "./enhanceData";
import { enhanceResume } from "@/lib/api";
import {
  loadAnalysis,
  loadStyle,
  saveAnalysis,
  saveStyle,
  type EnhanceStyle,
} from "@/lib/enhancementStore";
import type { AnalysisResult } from "@/lib/types";

type Phase = "scanning" | "review" | "applied";

interface Props {
  analysis: AnalysisResult;
}

export default function EnhancePage({ analysis }: Props) {
  const [style, setStyle] = useState<EnhanceStyle>("professional");
  const [phase, setPhase] = useState<Phase>("scanning");
  const [enhancement, setEnhancement] =
    useState<EnhancementAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewModel: PreviewModel = useMemo(
    () => buildPreviewModel(analysis),
    [analysis],
  );

  // Restore session state
  useEffect(() => {
    setStyle(loadStyle());
    const cached = loadAnalysis();
    if (cached) {
      setEnhancement(cached);
      setPhase("review");
    }
  }, []);

  // Run enhancement analysis when no cached result exists
  useEffect(() => {
    if (phase !== "scanning") return;
    let cancelled = false;
    (async () => {
      try {
        const result = await enhanceResume(analysis);
        if (cancelled) return;
        setEnhancement(result);
        saveAnalysis(result);
        setPhase("review");
      } catch {
        if (cancelled) return;
        // Service is local & deterministic; we still build a safe fallback
        // so the UI never shows an empty error if anything goes wrong.
        const fallback = analyzePresentation(analysis);
        setEnhancement(fallback);
        saveAnalysis(fallback);
        setPhase("review");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, analysis]);

  const onStyleChange = useCallback((s: EnhanceStyle) => {
    setStyle(s);
    saveStyle(s);
  }, []);

  const onApply = useCallback(() => {
    setPhase("applied");
  }, []);

  if (phase === "applied" && enhancement) {
    return (
      <EnhancedResumeView
        model={previewModel}
        style={style}
        onChangeStyle={onStyleChange}
      />
    );
  }

  if (phase === "scanning" || !enhancement) {
    return (
      <div className="anim-fade space-y-6">
        <EnhancementHero
          title="Reviewing your resume"
          subtitle="Analyzing wording, STAR rewrites, section rhythm, and ATS optimization."
        />
        <EnhancementProgress start onComplete={() => undefined} />
      </div>
    );
  }

  return (
    <div className="anim-fade space-y-6">
      <EnhancementHero
        title="Resume enhancement"
        subtitle="Upgrade your resume wording with AI STAR rewrites, active verbs, and publication-ready formatting."
      />

      <EnhancementSummary analysis={enhancement} />

      <EnhancementIssueList analysis={enhancement} />

      <StylePresetSelector value={style} onChange={onStyleChange} />

      <BeforeAfterPreview
        model={previewModel}
        style={style}
        enhancedMode="static"
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/results"
          className="btn-secondary px-5 py-2.5 text-[13px] font-medium"
        >
          Back to analysis
        </Link>
        <button
          type="button"
          onClick={onApply}
          className="btn-primary grad-cta rounded-[10px] px-5 py-2.5 text-[13px] font-semibold"
        >
          Apply Enhancement
        </button>
      </div>

      {error && (
        <p className="text-[12.5px] text-[#b91c1c]">{error}</p>
      )}
    </div>
  );
}

function EnhancementHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <span className="label-eyebrow">Resume enhancement</span>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.015em] text-[#0d2740] sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1.5 text-[14px] text-[#4f667a]">{subtitle}</p>
      </div>
      <Link
        href="/results"
        className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
      >
        ← Back to Results
      </Link>
    </header>
  );
}
