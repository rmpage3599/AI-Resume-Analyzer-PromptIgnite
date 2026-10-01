"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/core/Icons";

const STAGES = [
  "Reading resume",
  "Matching skills",
  "Checking experience",
  "Preparing insights",
];

interface Props {
  fileName: string;
  roleLabel: string;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function AnalyzingView({ fileName, roleLabel }: Props) {
  const [stageIndex, setStageIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = () =>
      setElapsed(Math.floor((performance.now() - start) / 1000));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    STAGES.forEach((_, i) => {
      const t = window.setTimeout(() => setStageIndex(i), 350 + i * 900);
      timers.push(t);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const progress = Math.min(
    100,
    Math.round(((stageIndex + 1) / STAGES.length) * 100),
  );

  return (
    <div className="anim-fade mx-auto w-full max-w-[560px]">
      <div className="glass-strong px-7 py-7 sm:px-9 sm:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#0d47a1]/40 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0d47a1]" />
            </span>
            <span className="label-eyebrow text-[#0d47a1]">Analyzing</span>
          </div>
          <span className="text-[12px] tabular-nums text-[#7890a4]">
            {formatElapsed(elapsed)}
          </span>
        </div>

        <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.01em] text-[#0d2740]">
          Analyzing your resume
        </h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-[#4f667a]">
          Comparing <span className="text-[#0d2740]">{fileName}</span> against{" "}
          <span className="text-[#0d2740]">{roleLabel}</span>.
        </p>

        <ol className="mt-7 space-y-1">
          {STAGES.map((label, i) => {
            const done = stageIndex > i;
            const active = stageIndex === i;
            return (
              <li
                key={label}
                className="relative flex items-center gap-3.5"
              >
                <div className="relative flex flex-col items-center">
                  <span
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full border text-[10.5px] font-semibold transition-colors",
                      done
                        ? "border-[#0d47a1]/55 bg-[#0d47a1]/10 text-[#0d47a1]"
                        : active
                          ? "border-[#0d47a1] bg-[rgba(13,71,161,0.08)] text-[#0d47a1]"
                          : "border-[rgba(13,71,161,0.18)] text-[#7890a4]",
                    ].join(" ")}
                  >
                    {done ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : (
                      <span className="tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </span>
                  {i < STAGES.length - 1 && (
                    <span className="relative mt-1 h-5 w-px overflow-hidden bg-[rgba(13,71,161,0.15)]">
                      {done && (
                        <span
                          className="absolute inset-x-0 top-0 block w-px origin-top bg-[#0d47a1]/60"
                          style={{
                            animation: "fill-rail 0.4s ease-out forwards",
                          }}
                        />
                      )}
                    </span>
                  )}
                </div>
                <p
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
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7890a4]">
              Progress
            </span>
            <span className="text-[11px] tabular-nums text-[#0d47a1]">
              {progress}%
            </span>
          </div>
          <div className="relative mt-2 h-[3px] overflow-hidden rounded-full bg-[rgba(13,71,161,0.10)]">
            <span
              className="absolute inset-y-0 left-0 grad-bar rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <span
              aria-hidden
              className="absolute inset-y-0 w-1/3 rounded-full opacity-50 sweep-shine"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
