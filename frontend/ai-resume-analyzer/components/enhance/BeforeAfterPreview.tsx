"use client";

import ResumePreview from "./ResumePreview";
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
  return (
    <section
      aria-label="Before and after preview"
      className="grid gap-5 lg:grid-cols-2"
    >
      <PreviewPane label="Current resume" tone="flawed">
        <ResumePreview model={model} flawed style={style} />
      </PreviewPane>
      <PreviewPane
        label={enhancedMode === "transition" ? "Enhanced resume" : "Enhanced resume"}
        tone="enhanced"
      >
        <div
          className={
            enhancedMode === "transition"
              ? "anim-fade"
              : undefined
          }
        >
          <ResumePreview model={model} flawed={false} style={style} />
        </div>
      </PreviewPane>
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
          {tone === "flawed" ? "As found" : "Improved"}
        </span>
      </header>
      <div className="relative overflow-hidden rounded-[10px] border border-[rgba(13,71,161,0.10)] bg-[rgba(255,255,255,0.55)] shadow-[0_18px_50px_-22px_rgba(13,71,161,0.18)]">
        {children}
      </div>
    </article>
  );
}
