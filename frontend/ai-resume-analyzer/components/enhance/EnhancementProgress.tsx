"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/core/Icons";

const STAGES = [
  "Checking typography",
  "Checking spacing",
  "Checking section structure",
  "Checking consistency",
];

interface Props {
  start: boolean;
  onComplete: () => void;
}

export default function EnhancementProgress({ start, onComplete }: Props) {
  const [stageIndex, setStageIndex] = useState(-1);

  useEffect(() => {
    if (!start) return;
    const timers: number[] = [];
    STAGES.forEach((_, i) => {
      const t = window.setTimeout(() => setStageIndex(i), 250 + i * 600);
      timers.push(t);
    });
    const final = window.setTimeout(() => onComplete(), 250 + STAGES.length * 600 + 200);
    timers.push(final);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [start, onComplete]);

  const progress = Math.min(
    100,
    Math.round(((stageIndex + 1) / STAGES.length) * 100),
  );

  return (
    <div className="glass-strong anim-fade mx-auto w-full max-w-[560px] px-7 py-7 sm:px-9 sm:py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#0d47a1]/40 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0d47a1]" />
          </span>
          <span className="label-eyebrow text-[#0d47a1]">Reviewing</span>
        </div>
        <span className="text-[12px] tabular-nums text-[#7890a4]">
          {progress}%
        </span>
      </div>

      <h2 className="mt-5 text-[20px] font-semibold tracking-[-0.01em] text-[#0d2740]">
        Reviewing your resume
      </h2>
      <p className="mt-1 text-[13px] text-[#4f667a]">
        Looking at typography, spacing, structure and consistency — without
        changing your content.
      </p>

      <ol className="mt-6 space-y-2">
        {STAGES.map((label, i) => {
          const done = stageIndex > i;
          const active = stageIndex === i;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors",
                  done
                    ? "border-[#0d47a1]/55 bg-[#0d47a1]/10 text-[#0d47a1]"
                    : active
                      ? "border-[#0d47a1] bg-[rgba(13,71,161,0.08)] text-[#0d47a1]"
                      : "border-[rgba(13,71,161,0.18)] text-[#7890a4]",
                ].join(" ")}
              >
                {done ? (
                  <CheckIcon className="h-3 w-3" />
                ) : (
                  <span className="tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </span>
              <span
                className={[
                  "text-[13.5px]",
                  done
                    ? "text-[#7890a4]"
                    : active
                      ? "font-medium text-[#0d2740]"
                      : "text-[#7890a4]",
                ].join(" ")}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-[rgba(13,71,161,0.10)]">
        <span
          className="block h-full grad-bar rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
