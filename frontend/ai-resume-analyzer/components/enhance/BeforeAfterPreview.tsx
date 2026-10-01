"use client";

import { useState } from "react";
import ResumePreview from "./ResumePreview";
import { SparkIcon, FileTextIcon, ArrowRightIcon, CheckIcon } from "@/components/core/Icons";
import type { PreviewModel } from "./enhanceData";
import type { EnhanceStyle } from "@/lib/enhancementStore";

interface Props {
  model: PreviewModel;
  style: EnhanceStyle;
  enhancedMode: "static" | "transition";
}

export default function BeforeAfterPreview({
  model,
  style,
  enhancedMode,
}: Props) {
  const [viewMode, setViewMode] = useState<"preview" | "diffs">("preview");
  const changelog = model.contentEnhancement?.changelog || [];

  return (
    <section aria-label="Before and after enhancement preview" className="space-y-4">
      {/* View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              viewMode === "preview"
                ? "bg-[#0d47a1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            <span>Document Preview (Before / After)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("diffs")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              viewMode === "diffs"
                ? "bg-[#0d47a1] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <SparkIcon className="h-3.5 w-3.5" />
            <span>Content Wording Changes ({changelog.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-2">
          <span>Style preset:</span>
          <span className="font-semibold text-slate-800 capitalize">{style}</span>
        </div>
      </div>

      {viewMode === "preview" ? (
        /* Full Document Side-by-Side */
        <div className="grid gap-5 lg:grid-cols-2">
          <PreviewPane label="Current resume (Original wording)" tone="flawed">
            <ResumePreview model={model} flawed style={style} />
          </PreviewPane>
          <PreviewPane
            label="Enhanced resume (STAR Rewrites & Upgraded Wording)"
            tone="enhanced"
          >
            <div
              className={
                enhancedMode === "transition" ? "anim-fade" : undefined
              }
            >
              <ResumePreview model={model} flawed={false} style={style} />
            </div>
          </PreviewPane>
        </div>
      ) : (
        /* Content Wording Diffs View */
        <div className="space-y-4 anim-fade">
          <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <SparkIcon className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#0d2740]">
                  Content Improvements Applied to Your Resume
                </h3>
                <p className="text-xs text-slate-600">
                  Wording was strengthened using AI STAR rewrites and action-oriented verbs. No fake experience or unverified skills were fabricated.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {changelog.map((item) => (
              <article
                key={item.id}
                className="glass rounded-xl p-5 border border-slate-200/80 bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        item.category === "STAR Rewrite"
                          ? "bg-blue-100 text-blue-800"
                          : item.category === "Action Verb"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.category === "STAR Rewrite" && <SparkIcon className="h-2.5 w-2.5" />}
                      {item.category === "Action Verb" && <CheckIcon className="h-2.5 w-2.5" />}
                      {item.category}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {item.impactNote}
                  </span>
                </div>

                <div className="mt-3.5 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg bg-rose-50/50 p-3.5 border border-rose-200/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      Original Wording
                    </span>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
                      {item.original}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/50 p-3.5 border border-emerald-200/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Enhanced Wording (Applied)
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckIcon className="h-3 w-3" />
                        Upgraded
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-900 font-medium">
                      {item.enhanced}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PreviewPane({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "flawed" | "enhanced";
  children: React.ReactNode;
}) {
  return (
    <article className="glass flex min-w-0 flex-col p-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <span
          className={
            tone === "flawed"
              ? "label-eyebrow"
              : "label-eyebrow text-[#0d47a1]"
          }
        >
          {label}
        </span>
        <span
          aria-hidden
          className={
            tone === "flawed"
              ? "inline-flex items-center gap-1.5 rounded-full border border-[rgba(13,71,161,0.18)] bg-white/65 px-2.5 py-0.5 text-[11px] font-medium text-[#4f667a]"
              : "inline-flex items-center gap-1.5 rounded-full border border-[#90caf9]/55 bg-[rgba(13,71,161,0.08)] px-2.5 py-0.5 text-[11px] font-medium text-[#0d47a1]"
          }
        >
          <span
            className={
              tone === "flawed"
                ? "h-1.5 w-1.5 rounded-full bg-[#7890a4]"
                : "h-1.5 w-1.5 rounded-full bg-[#0d47a1]"
            }
          />
          {tone === "flawed" ? "Original" : "STAR Enhanced"}
        </span>
      </header>
      <div className="relative overflow-hidden rounded-[10px] border border-[rgba(13,71,161,0.10)] bg-[rgba(255,255,255,0.55)] shadow-[0_18px_50px_-22px_rgba(13,71,161,0.18)]">
        {children}
      </div>
    </article>
  );
}

