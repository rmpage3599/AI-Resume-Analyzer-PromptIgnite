"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  score: number;
  matchedCount: number;
  totalRequired: number;
}

function useCountUp(target: number, duration = 1400, start = false) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

export default function ScorePanel({
  score,
  matchedCount,
  totalRequired,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const display = useCountUp(score, 1400, mounted);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const radius = 86;
  const stroke = 10;
  const size = (radius + stroke) * 2;
  const c = 2 * Math.PI * radius;
  const offset = mounted ? c * (1 - score / 100) : c;

  return (
    <article className="glass-strong flex h-full flex-col px-6 py-6">
      <span className="label-eyebrow">Match score</span>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-[208px] w-[208px] shrink-0">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="h-full w-full -rotate-90"
            aria-hidden
          >
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d47a1" />
                <stop offset="55%" stopColor="#5b9cdd" />
                <stop offset="100%" stopColor="#90caf9" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(13,71,161,0.10)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{
                transition:
                  "stroke-dashoffset 1500ms cubic-bezier(0.2,0.7,0.3,1) 200ms",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[44px] font-semibold leading-none tracking-[-0.03em] text-[#0d2740]">
              {display}
              <span className="ml-0.5 text-[20px] text-[#7890a4]">%</span>
            </span>
            <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0d47a1]">
              Job Match
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[15px] font-medium text-[#0d2740]">
            {matchedCount} of {totalRequired} required skills
          </p>
          <p className="mt-1 text-[13px] text-[#4f667a]">
            Based on your resume content versus this role&apos;s core
            requirements.
          </p>
        </div>
      </div>
    </article>
  );
}
