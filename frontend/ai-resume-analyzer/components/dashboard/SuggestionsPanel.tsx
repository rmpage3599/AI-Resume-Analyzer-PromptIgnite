import { ArrowRightIcon } from "@/components/core/Icons";
import type { Suggestion } from "@/lib/types";

export default function SuggestionsPanel({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  return (
    <article className="panel panel-primary p-5 sm:p-7">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent tr" />
      <span aria-hidden className="corner-accent bl" />
      <span aria-hidden className="corner-accent br" />

      <header className="flex items-end justify-between gap-3">
        <div>
          <span className="eyebrow eyebrow-azure">AI Suggestions</span>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.005em] text-fg">
            What to improve
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-2">
            Prioritized next actions, ranked by likely impact on your match
            score.
          </p>
        </div>
        <span className="chip">{suggestions.length} ACTIONS</span>
      </header>

      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {suggestions.map((s, i) => (
          <li
            key={s.title}
            className="anim-rise"
            style={{ animationDelay: `${260 + i * 80}ms` }}
          >
            <article className="panel-soft panel-hover group relative flex h-full flex-col overflow-hidden rounded-[10px] border p-4 transition-all duration-300 hover:-translate-y-0.5">
              <span aria-hidden className="corner-accent tl" />
              <span aria-hidden className="corner-accent br" />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(400px 160px at 0% 0%, rgba(144,202,249,0.08), transparent 70%)",
                }}
              />
              <div className="relative flex items-start justify-between">
                <span className="mono text-[28px] font-semibold leading-none tracking-[-0.02em] text-azure/55">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-azure/30 bg-navy/15 text-azure transition-all duration-300 group-hover:border-azure/55 group-hover:bg-azure/15">
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
              <p className="relative mt-4 text-[14px] font-semibold leading-snug text-fg">
                {s.title}
              </p>
              <p className="relative mt-2 text-[12.5px] leading-relaxed text-fg-2">
                {s.detail}
              </p>
              <p className="mono relative mt-4 text-[10px] tracking-[0.18em] text-fg-3">
                PRIORITY · P{(i + 1).toString().padStart(2, "0")}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </article>
  );
}
