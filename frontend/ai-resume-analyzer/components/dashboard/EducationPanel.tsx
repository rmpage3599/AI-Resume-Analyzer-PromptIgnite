import type { EducationEntry } from "@/lib/types";

export default function EducationPanel({ education }: { education: EducationEntry[] }) {
  if (education.length === 0) return null;
  return (
    <article className="panel panel-hover h-full p-5 sm:p-6">
      <span aria-hidden className="corner-accent tl" />
      <span aria-hidden className="corner-accent br" />

      <span className="eyebrow eyebrow-azure">Education</span>

      <div className="mt-4 space-y-4">
        {education.map((edu, i) => (
          <div key={`${edu.degree}-${edu.institution}-${i}`}>
            <p className="text-[14px] font-semibold text-fg">{edu.degree}</p>
            {edu.institution && (
              <p className="mt-0.5 text-[12.5px] text-fg-2">
                {edu.institution}
              </p>
            )}
            <p className="mono mt-1 text-[10.5px] tracking-[0.16em] text-azure/80">
              {edu.period}
            </p>
            {edu.detail && (
              <p className="mt-2 text-[11.5px] leading-relaxed text-fg-3">
                {edu.detail}
              </p>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
