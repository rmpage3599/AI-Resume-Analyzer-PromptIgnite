"use client";

import { useEffect, useState } from "react";
import type { SkillBar } from "@/lib/types";

interface Props {
  bars: SkillBar[];
}

export default function SkillAlignmentPanel({ bars }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 350);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <article className="panel panel-primary h-full p-5 sm:p-6">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent tr" />
      <span aria-hidden className="corner-accent bl" />
      <span aria-hidden className="corner-accent br" />

      <header className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow eyebrow-azure">Skill Alignment</span>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.005em] text-fg">
            How your skills compare with the role
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-2">
            Each bar is a coverage estimate derived from your resume against
            the requirements for the selected job role.
          </p>
        </div>
        <span className="chip">6 METRICS</span>
      </header>

      <ul className="mt-6 space-y-3.5">
        {bars.map((bar, i) => (
          <li
            key={bar.name}
            className="anim-rise grid grid-cols-[160px_1fr_56px] items-center gap-4 sm:grid-cols-[200px_1fr_64px]"
            style={{ animationDelay: `${300 + i * 70}ms` }}
          >
            <span className="truncate text-[13px] font-medium text-fg">
              {bar.name}
            </span>
            <div className="relative h-[10px] overflow-hidden rounded-[4px] border border-line bg-base/70">
              <span
                className="absolute inset-y-0 left-0 grad-bar rounded-[3px] transition-[width] duration-[1500ms] ease-out"
                style={{
                  width: mounted ? `${bar.value}%` : "0%",
                  transitionDelay: `${450 + i * 70}ms`,
                }}
              />
              {/* tick marks */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-1/2 w-px bg-azure/15"
              />
              <span
                aria-hidden
                className="absolute inset-y-0 left-1/4 w-px bg-azure/10"
              />
              <span
                aria-hidden
                className="absolute inset-y-0 left-3/4 w-px bg-azure/10"
              />
            </div>
            <span className="mono text-right text-[12px] tracking-[0.04em] text-fg">
              {bar.value}
              <span className="text-fg-3">%</span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
