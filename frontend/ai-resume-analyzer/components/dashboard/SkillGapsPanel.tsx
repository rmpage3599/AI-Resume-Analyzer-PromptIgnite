import { PlusIcon } from "@/components/core/Icons";

export default function SkillGapsPanel({ gaps }: { gaps: string[] }) {
  if (gaps.length === 0) return null;
  return (
    <article className="panel panel-hover h-full p-5 sm:p-6">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent tr" />

      <header className="flex items-end justify-between gap-3">
        <div>
          <span className="eyebrow eyebrow-azure">Skill Gaps</span>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.005em] text-fg">
            Targeted areas to close
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-2">
            Required skills missing from your resume, plus weak coverage
            areas below 50%.
          </p>
        </div>
        <span className="chip">{gaps.length} GAPS</span>
      </header>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {gaps.map((g, i) => (
          <span
            key={g}
            className="skill-tag anim-rise"
            style={{ animationDelay: `${200 + i * 50}ms` }}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-azure/30 bg-navy/20 text-azure">
              <PlusIcon className="h-2.5 w-2.5" />
            </span>
            {g}
          </span>
        ))}
      </div>
    </article>
  );
}
