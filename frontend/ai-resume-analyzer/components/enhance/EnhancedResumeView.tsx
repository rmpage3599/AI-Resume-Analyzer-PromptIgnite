"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResumePreview from "./ResumePreview";
import { ArrowRightIcon, CheckIcon, DownloadIcon, SparkIcon } from "@/components/core/Icons";
import {
  type EnhanceStyle,
} from "@/lib/enhancementStore";
import type { PreviewModel } from "./enhanceData";

interface Props {
  model: PreviewModel;
  style: EnhanceStyle;
  onChangeStyle: (style: EnhanceStyle) => void;
}

export default function EnhancedResumeView({
  model,
  style,
  onChangeStyle,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDownload = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <section className="anim-fade space-y-6">
      <div className="glass-strong px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(13,71,161,0.10)] text-[#0d47a1]">
            <CheckIcon className="h-4 w-4" />
          </span>
          <div>
            <span className="label-eyebrow">Resume enhanced</span>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-[#0d2740]">
              Your resume content and presentation have been enhanced
            </h2>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#4f667a]">
          Your resume wording has been optimized with AI STAR rewrites, strong action verbs, and tailored positioning based on your analysis suggestions — without fabricating any fake experience or unverified skills.
        </p>

        {model.contentEnhancement && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-[#0d47a1]">
              <SparkIcon className="h-3.5 w-3.5" />
              {model.contentEnhancement.starRewritesCount} STAR Rewrites Applied
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800">
              <CheckIcon className="h-3.5 w-3.5" />
              {model.contentEnhancement.actionVerbsCount} Action Verbs Elevated
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-semibold text-purple-800">
              Core Skills Prioritized
            </span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onDownload}
            className="btn-primary grad-cta inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-semibold"
          >
            <DownloadIcon className="h-4 w-4" />
            Download Enhanced Resume
          </button>
          <Link
            href="/results"
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium"
          >
            Back to analysis
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <article className="glass px-5 py-5 sm:px-6 sm:py-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <span className="label-eyebrow text-[#0d47a1]">Preview</span>
          <span className="text-[12px] text-[#7890a4]">
            Style:{" "}
            <span className="text-[#0d47a1] capitalize">{style}</span>
          </span>
        </header>
        <div className="mx-auto max-w-[640px] overflow-hidden rounded-[10px] border border-[rgba(13,71,161,0.10)] bg-[rgba(255,255,255,0.55)] shadow-[0_18px_50px_-22px_rgba(13,71,161,0.18)]">
          <ResumePreview model={model} flawed={false} style={style} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {(["professional", "minimal", "modern"] as EnhanceStyle[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeStyle(s)}
                className={
                  s === style
                    ? "rounded-full border border-[#0d47a1] bg-[rgba(13,71,161,0.10)] px-3 py-1 text-[12px] font-medium capitalize text-[#0d47a1]"
                    : "rounded-full border border-[rgba(13,71,161,0.18)] bg-white/55 px-3 py-1 text-[12px] font-medium capitalize text-[#4f667a] hover:border-[#90caf9]/55 hover:text-[#0d47a1]"
                }
              >
                {s}
              </button>
            ),
          )}
        </div>
        {/* Hidden print root mounted for browser print. */}
        <div
          id="resume-print-root"
          aria-hidden
          className={mounted ? "print-only-root" : "hidden"}
        >
          <ResumePreview model={model} flawed={false} style={style} />
        </div>
      </article>
    </section>
  );
}
