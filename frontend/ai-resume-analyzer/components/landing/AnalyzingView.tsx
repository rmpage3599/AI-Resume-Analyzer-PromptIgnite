"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/core/Icons";

const STAGES: { label: string; sub: string }[] = [
  {
    label: "Reading resume",
    sub: "Parsing document structure and metadata",
  },
  {
    label: "Extracting skills",
    sub: "Scanning detected skills across categories",
  },
  {
    label: "Comparing with target role",
    sub: "Aligning resume against role requirements",
  },
  {
    label: "Identifying skill gaps",
    sub: "Measuring coverage and weak areas",
  },
  {
    label: "Preparing recommendations",
    sub: "Ranking improvements by impact",
  },
];

interface Props {
  fileName: string;
  fileSizeBytes: number;
  roleLabel: string;
  resumeLabel?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function AnalyzingView({
  fileName,
  fileSizeBytes,
  roleLabel,
}: Props) {
  const [stageIndex, setStageIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = () => setElapsed(Math.floor((performance.now() - start) / 1000));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    STAGES.forEach((_, i) => {
      const t = window.setTimeout(() => setStageIndex(i), 350 + i * 850);
      timers.push(t);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const progress = Math.min(
    100,
    Math.round(((stageIndex + 1) / STAGES.length) * 100),
  );

  return (
    <section className="anim-fade relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[640px] pt-16 pb-24 sm:pt-20">
        <div className="panel panel-primary overflow-hidden p-7 sm:p-9">
          <span aria-hidden className="corner-accent tl" />
          <span aria-hidden className="corner-accent tr" />
          <span aria-hidden className="corner-accent bl" />
          <span aria-hidden className="corner-accent br" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-azure/60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-azure" />
              </span>
              <span className="eyebrow eyebrow-azure">Analysis in progress</span>
            </div>
            <span className="mono text-[11px] tracking-[0.16em] text-fg-3">
              {formatElapsed(elapsed)} · RESUME ENGINE
            </span>
          </div>

          <h2 className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.01em] text-fg sm:text-[28px]">
            Analyzing your resume
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">
            Comparing <span className="text-fg">{fileName}</span>{" "}
            <span className="mono text-[11px] tracking-[0.12em] text-fg-3">
              {formatSize(fileSizeBytes)}
            </span>{" "}
            against{" "}
            <span className="text-fg">{roleLabel}</span>.
          </p>

          <ol className="mt-7 space-y-1.5">
            {STAGES.map((stage, i) => {
              const done = stageIndex > i;
              const active = stageIndex === i;
              const pending = stageIndex < i;
              return (
                <li
                  key={stage.label}
                  className="relative flex items-start gap-4 pl-0"
                >
                  <div className="relative flex flex-col items-center pt-1">
                    <span
                      className={[
                        "flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[10.5px] font-semibold tracking-[0.04em] transition-colors duration-200",
                        done
                          ? "border-azure/55 bg-azure/15 text-azure"
                          : active
                            ? "border-azure bg-navy/40 text-fg shadow-[0_0_0_4px_rgba(144,202,249,0.10)]"
                            : "border-line text-fg-3",
                      ].join(" ")}
                    >
                      {done ? (
                        <CheckIcon className="h-3.5 w-3.5" />
                      ) : (
                        <span className="mono">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </span>
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -inset-1 rounded-full border border-azure/40"
                        style={{ animation: "pulse-ring 1.6s ease-out infinite" }}
                      />
                    )}
                    {i < STAGES.length - 1 && (
                      <span className="relative mt-1 h-[26px] w-px overflow-hidden bg-line">
                        {done && (
                          <span
                            className="absolute inset-x-0 top-0 block w-px origin-top bg-azure/60"
                            style={{
                              animation: "fill-rail 0.45s ease-out forwards",
                            }}
                          />
                        )}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-5">
                    <p
                      className={[
                        "text-[14px] font-medium tracking-[0.01em]",
                        done
                          ? "text-fg-2"
                          : active
                            ? "text-fg"
                            : "text-fg-3",
                      ].join(" ")}
                    >
                      {stage.label}
                    </p>
                    {(active || done) && (
                      <p
                        className={[
                          "mono mt-1 text-[10.5px] tracking-[0.14em]",
                          active ? "text-azure/80" : "text-fg-3",
                        ].join(" ")}
                      >
                        {stage.sub}
                      </p>
                    )}
                    {pending && (
                      <p className="mono mt-1 text-[10.5px] tracking-[0.14em] text-fg-3/70">
                        Pending
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="mono text-[10.5px] tracking-[0.16em] text-fg-3">
                PROGRESS
              </span>
              <span className="mono text-[10.5px] tracking-[0.16em] text-azure/80">
                {progress}%
              </span>
            </div>
            <div className="relative mt-2 h-[3px] overflow-hidden rounded-full bg-line">
              <span
                className="absolute inset-y-0 left-0 grad-bar rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              <span
                aria-hidden
                className="absolute inset-y-0 w-1/3 rounded-full opacity-70 sweep-shine"
                style={{ mixBlendMode: "screen" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
