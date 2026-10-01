import type { ExperienceEntry } from "@/lib/types";

export default function ExperiencePanel({
  experience,
}: {
  experience: ExperienceEntry[];
}) {
  return (
    <article className="glass flex h-full flex-col px-6 py-6">
      <h2 className="text-[16px] font-semibold tracking-[-0.005em] text-[#0d2740]">
        Experience
      </h2>

      <div className="mt-4 flex-1">
        {experience.length === 0 ? (
          <p className="text-[13px] text-[#7890a4]">
            No structured experience was extracted.
          </p>
        ) : (
          <ol className="relative pl-6">
            <span
              aria-hidden
              className="absolute bottom-1 left-2 top-1 w-px bg-[rgba(13,71,161,0.18)]"
            />
            {experience.map((exp, i) => (
              <li
                key={`${exp.role}-${i}`}
                className="relative pb-5 last:pb-0"
              >
                <span
                  aria-hidden
                  className="absolute left-[1px] top-1.5 h-2 w-2 rounded-full bg-white ring-2 ring-[#0d47a1]"
                />
                <p className="text-[14.5px] font-semibold text-[#0d2740]">
                  {exp.role}
                </p>
                <p className="mt-0.5 text-[13px] text-[#4f667a]">
                  {exp.company}
                </p>
                {exp.duration && (
                  <p className="mt-0.5 text-[12px] text-[#7890a4]">
                    {exp.duration}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
