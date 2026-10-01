"use client";

import { useEffect, useMemo, useState } from "react";

interface Props {
  matched: string[];
  missing: string[];
  skills: string[];
}

/**
 * Visual representation of how the resume's detected skills compare with the
 * role. Values are derived purely from the backend's
 * `matchedSkills` / `missingSkills` arrays — no client-side re-scoring of the
 * resume. A skill in `matchedSkills` is shown with a high value, a skill in
 * `missingSkills` with a low value, and other detected skills in between.
 *
 * Bars animate from 0 → final value on mount.
 */
export default function SkillAlignmentPanel({
  matched,
  missing,
  skills,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  const bars = useMemo(() => {
    const matchedSet = new Set(matched);
    const missingSet = new Set(missing);
    // Stable order: matched first (desc), then other detected skills, then
    // missing requirements (so the user sees the gaps at the bottom).
    const matchedListed = matched.slice(0, 6);
    const others = skills.filter(
      (s) => !matchedSet.has(s) && !missingSet.has(s),
    );
    const missingListed = missing.slice(0, 4);
    const items: { name: string; value: number; kind: "match" | "extra" | "gap" }[] = [];
    matchedListed.forEach((name, i) =>
      items.push({ name, value: 95 - i * 5, kind: "match" }),
    );
    others.slice(0, Math.max(0, 6 - items.length)).forEach((name, i) =>
      items.push({
        name,
        value: Math.max(50, 80 - (matchedListed.length + i) * 6),
        kind: "extra",
      }),
    );
    missingListed.forEach((name, i) =>
      items.push({
        name,
        value: Math.max(20, 45 - i * 8),
        kind: "gap",
      }),
    );
    return items.slice(0, 6);
  }, [matched, missing, skills]);

  if (bars.length === 0) return null;

  return (
    <article className="glass px-6 py-6">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.005em] text-[#0d2740]">
          Skill alignment
        </h2>
        <span className="text-[12.5px] text-[#4f667a]">
          How your skills compare with the role
        </span>
      </header>

      <ul className="mt-5 flex flex-col gap-3.5">
        {bars.map((bar, i) => (
          <li
            key={bar.name}
            className="grid min-w-0 grid-cols-[minmax(0,160px)_1fr_56px] items-center gap-3 sm:grid-cols-[minmax(0,200px)_1fr_64px]"
          >
            <span className="min-w-0 truncate text-[13px] font-medium text-[#0d2740]">
              {bar.name}
            </span>
            <div className="relative h-[10px] overflow-hidden rounded-full bg-[rgba(13,71,161,0.08)]">
              <span
                className="absolute inset-y-0 left-0 grad-bar rounded-full transition-[width] duration-[1400ms] ease-out"
                style={{
                  width: mounted ? `${bar.value}%` : "0%",
                  transitionDelay: `${300 + i * 60}ms`,
                }}
              />
            </div>
            <span className="text-right text-[12.5px] tabular-nums text-[#4f667a]">
              {bar.value}
              <span className="text-[#7890a4]">%</span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
