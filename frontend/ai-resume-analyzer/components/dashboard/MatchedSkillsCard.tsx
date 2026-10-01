"use client";

import { CheckIcon } from "@/components/core/Icons";

interface Props {
  matched: string[];
  totalRequired: number;
}

export default function MatchedSkillsCard({ matched, totalRequired }: Props) {
  const pct = Math.round((matched.length / Math.max(1, totalRequired)) * 100);
  return (
    <article className="panel panel-hover h-full p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow eyebrow-azure">Matched Skills</span>
          <p className="mt-2 text-[14px] font-medium text-fg">
            {matched.length} of {totalRequired} required skills present
          </p>
        </div>
        <span className="mono flex h-9 min-w-9 items-center justify-center rounded-[7px] border border-azure/35 bg-azure/10 px-2 text-[12.5px] text-azure">
          {matched.length}
        </span>
      </header>

      <ul className="mt-4 space-y-2">
        {matched.map((skill, i) => (
          <li
            key={skill}
            className="anim-rise flex items-center gap-2.5 rounded-[7px] border border-line bg-base/40 px-3 py-2"
            style={{ animationDelay: `${120 + i * 50}ms` }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border border-azure/35 bg-azure/10 text-azure">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span className="truncate text-[13px] text-fg">{skill}</span>
            <span className="ml-auto mono text-[10px] tracking-[0.16em] text-fg-3">
              DETECTED
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] tracking-[0.18em] text-fg-3">
            COVERAGE
          </span>
          <span className="mono text-[10.5px] text-azure/80">{pct}%</span>
        </div>
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-line">
          <span
            className="block h-full grad-bar rounded-full transition-[width] duration-[1500ms] ease-out"
            style={{
              width: `${pct}%`,
              transitionDelay: "400ms",
            }}
          />
        </div>
      </div>
    </article>
  );
}
