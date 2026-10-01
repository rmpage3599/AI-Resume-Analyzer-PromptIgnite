import { ArrowRightIcon } from "@/components/core/Icons";
import { formatSuggestion } from "@/lib/types";

export default function SuggestionsPanel({
  suggestions,
}: {
  suggestions: string[];
}) {
  return (
    <article className="glass-strong px-6 py-7 sm:px-8 sm:py-8">
      <header>
        <h2 className="text-[18px] font-semibold tracking-[-0.005em] text-[#0d2740]">
          What to improve
        </h2>
        <p className="mt-1 text-[13px] text-[#4f667a]">
          Prioritized next actions from the analysis.
        </p>
      </header>

      {suggestions.length === 0 ? (
        <p className="mt-5 text-[13px] text-[#7890a4]">
          No improvement suggestions were returned for this analysis.
        </p>
      ) : (
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {suggestions.map((raw, i) => {
            const { title, detail } = formatSuggestion(raw);
            return (
              <li key={`${i}-${title}`} className="min-w-0">
                <article className="group flex h-full min-w-0 flex-col rounded-[12px] border border-[rgba(13,71,161,0.10)] bg-white/55 px-4 py-4 backdrop-blur-md transition hover:border-[rgba(13,71,161,0.25)] hover:bg-white/80">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-semibold tabular-nums text-[#0d47a1]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[rgba(13,71,161,0.08)] text-[#0d47a1] transition group-hover:translate-x-0.5">
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] font-semibold leading-snug text-[#0d2740]">
                    {title}
                  </p>
                  {detail && (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#4f667a]">
                      {detail}
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
