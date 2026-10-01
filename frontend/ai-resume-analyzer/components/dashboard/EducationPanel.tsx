import type { EducationEntry } from "@/lib/types";

export default function EducationPanel({
  education,
}: {
  education: EducationEntry[];
}) {
  return (
    <article className="glass flex h-full flex-col px-6 py-6">
      <h2 className="text-[16px] font-semibold tracking-[-0.005em] text-[#0d2740]">
        Education
      </h2>

      <div className="mt-4 flex-1">
        {education.length === 0 ? (
          <p className="text-[13px] text-[#7890a4]">
            No structured education details were extracted.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {education.map((edu, i) => (
              <li key={`${edu.degree}-${i}`} className="min-w-0">
                <p className="text-[14.5px] font-semibold text-[#0d2740]">
                  {edu.degree}
                </p>
                {edu.institution && (
                  <p className="mt-0.5 text-[13px] text-[#4f667a]">
                    {edu.institution}
                  </p>
                )}
                {edu.duration && (
                  <p className="mt-1 text-[12px] text-[#7890a4]">
                    {edu.duration}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
