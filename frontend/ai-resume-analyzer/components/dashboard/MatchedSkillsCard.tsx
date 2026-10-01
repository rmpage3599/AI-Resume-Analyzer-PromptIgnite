"use client";

import { CheckIcon } from "@/components/core/Icons";

interface Props {
  skills: string[];
  totalRequired?: number;
}

export default function MatchedSkillsCard({ skills }: Props) {
  return (
    <article className="glass flex h-full flex-col px-6 py-6">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.005em] text-[#0d2740]">
          Matched skills
        </h2>
        <span className="text-[12.5px] tabular-nums text-[#4f667a]">
          {skills.length}
        </span>
      </header>
      <p className="mt-1 text-[12.5px] text-[#4f667a]">
        {skills.length} of required skills covered
      </p>

      <div className="mt-4 min-h-0 flex-1">
        {skills.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-[#7890a4]">
            No required skills matched for this role.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {skills.map((skill) => (
              <li
                key={skill}
                className="flex min-w-0 items-center gap-2.5 rounded-[8px] bg-white/55 px-3 py-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-[rgba(13,71,161,0.10)] text-[#0d47a1]">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="min-w-0 truncate text-[13px] text-[#0d2740]">
                  {skill}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
