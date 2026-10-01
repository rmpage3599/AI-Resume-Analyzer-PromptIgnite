"use client";

import { BriefcaseIcon } from "@/components/core/Icons";
import type { ExperienceEntry } from "@/lib/types";

interface Props {
  experience: ExperienceEntry[];
}

function totalYears(items: ExperienceEntry[]): string {
  if (items.length === 0) return "—";
  // Approximation: parse years from period "Jan 2022 — Dec 2023" or "2020 — 2024".
  const years = items.map((it) => {
    const matches = it.period.match(/\d{4}/g);
    if (!matches || matches.length < 2) return 0;
    return Math.max(0, Number(matches[matches.length - 1]) - Number(matches[0]));
  });
  const sum = years.reduce((a, b) => a + b, 0);
  if (sum <= 0) return "1+";
  return `${sum}+`;
}

export default function ExperiencePanel({ experience }: Props) {
  return (
    <article className="panel panel-hover h-full p-5 sm:p-6">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent br" />

      <header className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow eyebrow-azure">Experience</span>
          <p className="mt-2 text-[14px] font-medium text-fg">
            {totalYears(experience)} years across {experience.length} role
            {experience.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="mono flex h-9 w-9 items-center justify-center rounded-[7px] border border-azure/30 bg-azure/10 text-azure">
          <BriefcaseIcon className="h-4 w-4" />
        </span>
      </header>

      <ol className="relative mt-5 space-y-0">
        <span
          aria-hidden
          className="absolute bottom-2 left-[7px] top-2 w-px bg-line"
        />
        {experience.map((exp, i) => (
          <li
            key={`${exp.role}-${exp.company}`}
            className="anim-rise relative pl-7 pb-5 last:pb-0"
            style={{ animationDelay: `${200 + i * 70}ms` }}
          >
            <span
              aria-hidden
              className="absolute left-1.5 top-1.5 h-[11px] w-[11px] rounded-full border border-azure/55 bg-base"
              style={{
                boxShadow: "0 0 0 3px rgba(13,71,161,0.25)",
              }}
            />
            <p className="text-[13.5px] font-medium text-fg">{exp.role}</p>
            <p className="mono mt-0.5 text-[10.5px] tracking-[0.14em] text-azure/80">
              {exp.company}
              {exp.company && exp.period && " · "}
              {exp.period}
            </p>
            {exp.note && (
              <p className="mt-1.5 text-[12px] leading-relaxed text-fg-2">
                {exp.note}
              </p>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}
