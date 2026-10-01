"use client";

import { CheckIcon, PlusIcon } from "@/components/core/Icons";

interface Props {
  skills: string[];
}

export default function MissingSkillsCard({ skills }: Props) {
  const empty = skills.length === 0;
  return (
    <article className="glass flex h-full flex-col px-6 py-6">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.005em] text-[#0d2740]">
          Missing skills
        </h2>
        <span className="text-[12.5px] tabular-nums text-[#4f667a]">
          {skills.length}
        </span>
      </header>
      <p className="mt-1 text-[12.5px] text-[#4f667a]">
        {empty
          ? "All required skills covered"
          : `${skills.length} skill${skills.length === 1 ? "" : "s"} to strengthen`}
      </p>

      <div className="mt-4 min-h-0 flex-1">
        {empty ? (
          <div className="flex items-start gap-2.5 rounded-[8px] bg-[rgba(13,71,161,0.06)] px-3 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-white text-[#0d47a1]">
              <CheckIcon className="h-3 w-3" />
            </span>
            <p className="text-[13px] text-[#0d2740]">
              Strong alignment on the core requirements.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {skills.map((skill) => (
              <li
                key={skill}
                className="flex min-w-0 items-center gap-2.5 rounded-[8px] bg-white/55 px-3 py-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-[rgba(13,71,161,0.10)] text-[#0d47a1]">
                  <PlusIcon className="h-3 w-3" />
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
