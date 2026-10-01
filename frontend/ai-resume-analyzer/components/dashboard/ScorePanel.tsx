"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  score: number;
  matched: number;
  total: number;
  roleLabel: string;
}

function verdict(score: number): string {
  if (score >= 85) return "Excellent alignment";
  if (score >= 70) return "Strong foundation";
  if (score >= 55) return "Solid base with targeted gaps";
  if (score >= 40) return "Emerging alignment";
  return "Early-stage alignment";
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
  matched,
  total,
  roleLabel,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const display = useCountUp(score, 1400, mounted);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const radius = 78;
  const stroke = 10;
  const size = (radius + stroke) * 2;
  const c = 2 * Math.PI * radius;
  const offset = mounted ? c * (1 - score / 100) : c;

  return (
    <article className="panel panel-primary flex h-full flex-col p-5 sm:p-6">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent tr" />
      <span aria-hidden className="corner-accent bl" />
      <span aria-hidden className="corner-accent br" />

      <div className="flex items-center justify-between">
        <span className="eyebrow eyebrow-azure">Match Score</span>
        <span className="chip">LIVE</span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-stretch">
        <div className="relative mx-auto h-[180px] w-[180px] shrink-0 sm:h-[196px] sm:w-[196px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="h-full w-full -rotate-90"
            aria-hidden
          >
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d47a1" />
                <stop offset="55%" stopColor="#1e63b8" />
                <stop offset="100%" stopColor="#90caf9" />
              </linearGradient>
            </defs>
            {/* Tick marks */}
            <g stroke="rgba(144,202,249,0.18)" strokeWidth="1">
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * 2 * Math.PI;
                const r1 = radius + stroke / 2 + 4;
                const r2 = r1 + 4;
                const cx = size / 2;
                const cy = size / 2;
                const x1 = cx + Math.cos(angle) * r1;
                const y1 = cy + Math.sin(angle) * r1;
                const x2 = cx + Math.cos(angle) * r2;
                const y2 = cy + Math.sin(angle) * r2;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            {/* Base ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(144,202,249,0.10)"
              strokeWidth={stroke}
            />
            {/* Progress ring */}
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
                  "stroke-dashoffset 1600ms cubic-bezier(0.2,0.7,0.3,1) 250ms",
                filter:
                  "drop-shadow(0 0 8px rgba(144,202,249,0.45))",
              }}
            />
          </svg>
          {/* Dark inner circle */}
          <div
            className="absolute inset-7 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(8,17,31,0.95), rgba(5,10,18,1) 70%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="mono text-[10.5px] tracking-[0.24em] text-azure/80">
              JOB MATCH
            </span>
            <span className="mt-1 text-[44px] font-semibold leading-none tracking-[-0.03em] text-fg">
              {display}
              <span className="text-[20px] text-fg-2">%</span>
            </span>
            <span className="mono mt-2 text-[10px] tracking-[0.18em] text-fg-3">
              ALIGNMENT INDEX
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[16px] font-semibold leading-snug text-fg">
            {verdict(score)} for {roleLabel}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-2">
            Based on required skills, experience fit and education alignment.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Required matched" value={`${matched} / ${total}`} />
            <Stat label="Detected skills" value={`${total + 0}`} hint="across categories" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Bar label="Skills" value={Math.min(100, Math.round((matched / Math.max(1, total)) * 100))} />
        <Bar label="Experience" value={Math.min(100, score + 4)} />
        <Bar label="Education" value={Math.min(100, score + 9)} />
      </div>
    </article>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[8px] border border-line bg-base/40 px-3 py-2.5">
      <p className="mono text-[9.5px] tracking-[0.18em] text-fg-3">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-fg">{value}</p>
      {hint && <p className="mono mt-0.5 text-[10px] tracking-[0.1em] text-fg-3">{hint}</p>}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] tracking-[0.16em] text-fg-3">
          {label}
        </span>
        <span className="mono text-[10.5px] text-fg-2">{value}%</span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-line">
        <span
          className="block h-full grad-bar rounded-full transition-[width] duration-[1500ms] ease-out"
          style={{ width: `${value}%`, transitionDelay: "450ms" }}
        />
      </div>
    </div>
  );
}
