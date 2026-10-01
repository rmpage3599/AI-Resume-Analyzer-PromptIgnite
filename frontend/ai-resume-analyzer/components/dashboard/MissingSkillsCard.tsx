"use client";

import { PlusIcon } from "@/components/core/Icons";

interface Props {
  missing: string[];
  weak: { name: string; value: number }[];
}

export default function MissingSkillsCard({ missing, weak }: Props) {
  const items = [
    ...missing.map((m) => ({ name: m, kind: "MISSING" as const })),
    ...weak
      .filter((w) => !missing.includes(w.name))
      .map((w) => ({ name: w.name, kind: "WEAK" as const })),
  ];

  return (
    <article className="panel panel-hover h-full p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow eyebrow-azure">Missing Skills</span>
          <p className="mt-2 text-[14px] font-medium text-fg">
            {items.length} gap{items.length === 1 ? "" : "s"} for this role
          </p>
        </div>
        <span className="mono flex h-9 min-w-9 items-center justify-center rounded-[7px] border border-azure/30 bg-base/40 px-2 text-[12.5px] text-azure">
          {items.length}
        </span>
      </header>

      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li
            key={item.name}
            className="anim-rise flex items-center gap-2.5 rounded-[7px] border border-line bg-base/40 px-3 py-2"
            style={{ animationDelay: `${160 + i * 55}ms` }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border border-azure/25 bg-navy/25 text-azure/85">
              <PlusIcon className="h-3 w-3" />
            </span>
            <span className="truncate text-[13px] text-fg">{item.name}</span>
            <span
              className={`ml-auto mono text-[10px] tracking-[0.16em] ${
                item.kind === "MISSING" ? "text-azure/80" : "text-fg-3"
              }`}
            >
              {item.kind}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[11.5px] leading-relaxed text-fg-3">
        Closing these gaps would improve your alignment score and signal
        role-readiness to recruiters.
      </p>
    </article>
  );
}
