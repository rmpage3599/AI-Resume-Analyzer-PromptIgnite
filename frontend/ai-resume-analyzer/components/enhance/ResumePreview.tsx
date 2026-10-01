import type { EnhanceStyle } from "@/lib/enhancementStore";
import type { PreviewModel } from "./enhanceData";

interface Props {
  model: PreviewModel;
  flawed: boolean;
  style: EnhanceStyle;
}

/**
 * Renders a single resume "page" as A4-shaped content. Used both as the
 * "before / after" preview on /enhance and as the printable enhanced
 * resume (the print-only stylesheet in globals.css scales this to a
 * single A4 page).
 *
 * When `flawed={true}`, the same source data is rendered with deliberate
 * presentation issues: tight margins, mixed font sizes, lowercase
 * bullets, ragged date alignment, inconsistent spacing.
 *
 * When `flawed={false}`, the source data is rendered cleanly using the
 * selected `style` preset. The content is identical in both cases.
 */
export default function ResumePreview({ model, flawed, style }: Props) {
  if (flawed) {
    return <FlawedPreview model={model} />;
  }
  return <CleanPreview model={model} style={style} />;
}

function FlawedPreview({ model }: { model: PreviewModel }) {
  return (
    <div
      className="resume-doc relative w-full overflow-hidden bg-white text-[#1a1a1a]"
      style={{
        aspectRatio: "210 / 297",
        padding: "16mm 14mm 16mm 14mm",
      }}
    >
      <div
        className="flex flex-col"
        style={{ gap: "6mm" }}
      >
        {/* Messy header: tiny name, all-caps headline, contact crammed */}
        <header style={{ lineHeight: 1.05 }}>
          <p
            className="uppercase"
            style={{
              fontSize: "10pt",
              letterSpacing: "0.04em",
              color: "#888",
              margin: 0,
            }}
          >
            {model.contact}
          </p>
          <h1
            className="font-bold uppercase"
            style={{
              fontSize: "13pt",
              letterSpacing: "0.08em",
              margin: "1mm 0 1mm",
            }}
          >
            {model.candidateName || "your name"}
          </h1>
          <p
            className="lowercase italic"
            style={{ fontSize: "9pt", color: "#777", margin: 0 }}
          >
            {model.headline}
          </p>
        </header>

        {/* Summary: inconsistent size, no heading */}
        <section style={{ lineHeight: 1.25 }}>
          <p style={{ fontSize: "9.5pt", color: "#333", margin: 0 }}>
            {model.summary}
          </p>
        </section>

        {/* Experience — first entry bigger than the rest, dates ragged */}
        <section>
          <h2
            className="uppercase font-bold"
            style={{
              fontSize: "9pt",
              letterSpacing: "0.18em",
              color: "#222",
              margin: "0 0 2mm",
            }}
          >
            Work Experience
          </h2>
          {model.experience.length === 0 ? (
            <p style={{ fontSize: "9pt", color: "#888" }}>—</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {model.experience.map((exp, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: i === 0 ? "5mm" : "2mm",
                    lineHeight: 1.2,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={i === 0 ? "font-bold" : "font-medium"}
                      style={{
                        fontSize: i === 0 ? "10.5pt" : "9.5pt",
                        margin: 0,
                        textTransform: i === 0 ? "none" : "lowercase",
                      }}
                    >
                      {exp.role || "—"}{" "}
                      <span style={{ color: "#666", fontWeight: 400 }}>
                        · {exp.company || ""}
                      </span>
                    </p>
                    <span
                      style={{
                        fontSize: "8.5pt",
                        color: "#888",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {exp.period || ""}
                    </span>
                  </div>
                  <ul
                    style={{
                      listStyle: "disc",
                      paddingLeft: "4mm",
                      margin: "1mm 0 0",
                    }}
                  >
                    {exp.bullets.map((b, bIdx) => (
                      <li
                        key={bIdx}
                        style={{
                          fontSize: "9pt",
                          color: "#444",
                          textTransform: bIdx % 2 === 1 ? "lowercase" : "none",
                        }}
                      >
                        {b.original}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Education — cramped */}
        <section>
          <h2
            className="uppercase font-bold"
            style={{
              fontSize: "10pt",
              letterSpacing: "0.1em",
              color: "#222",
              margin: "0 0 2mm",
            }}
          >
            Education
          </h2>
          {model.education.length === 0 ? (
            <p style={{ fontSize: "9pt", color: "#888" }}>—</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {model.education.map((edu, i) => (
                <li key={i} style={{ marginBottom: "1mm" }}>
                  <p style={{ fontSize: "9pt", margin: 0 }}>
                    {edu.degree || "—"}
                  </p>
                  <p
                    style={{ fontSize: "8.5pt", color: "#777", margin: 0 }}
                  >
                    {edu.institution || ""} {edu.period ? `· ${edu.period}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Skills — comma-soup, no grouping */}
        <section>
          <h2
            className="uppercase font-bold"
            style={{
              fontSize: "9pt",
              letterSpacing: "0.2em",
              color: "#222",
              margin: "0 0 2mm",
            }}
          >
            Skills
          </h2>
          <p style={{ fontSize: "9pt", color: "#333", margin: 0 }}>
            {model.skills.join(", ") || "—"}
          </p>
        </section>
      </div>
    </div>
  );
}

function CleanPreview({
  model,
  style,
}: {
  model: PreviewModel;
  style: EnhanceStyle;
}) {
  const presets: Record<
    EnhanceStyle,
    {
      padding: string;
      headingSize: string;
      sectionSize: string;
      body: string;
      gap: string;
      accent: string;
      rule: string;
    }
  > = {
    professional: {
      padding: "20mm 18mm",
      headingSize: "22pt",
      sectionSize: "10.5pt",
      body: "10pt",
      gap: "6mm",
      accent: "#0d47a1",
      rule: "rgba(13,71,161,0.20)",
    },
    minimal: {
      padding: "22mm 20mm",
      headingSize: "20pt",
      sectionSize: "9.5pt",
      body: "10pt",
      gap: "8mm",
      accent: "#1f2937",
      rule: "rgba(0,0,0,0.10)",
    },
    modern: {
      padding: "20mm 18mm",
      headingSize: "24pt",
      sectionSize: "10pt",
      body: "10pt",
      gap: "6.5mm",
      accent: "#0d47a1",
      rule: "rgba(13,71,161,0.35)",
    },
  };
  const p = presets[style];

  return (
    <div
      className="resume-doc relative w-full overflow-hidden bg-white text-[#0f172a]"
      style={{
        aspectRatio: "210 / 297",
        padding: p.padding,
      }}
    >
      <div className="flex flex-col" style={{ gap: p.gap }}>
        {/* Header */}
        <header>
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontSize: p.headingSize,
              color: p.accent,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {model.candidateName || "Your Name"}
          </h1>
          <p
            className="mt-1"
            style={{
              fontSize: p.body,
              color: "#475569",
              margin: 0,
            }}
          >
            {model.headline}
          </p>
          <p
            className="mt-1.5"
            style={{
              fontSize: "9pt",
              color: "#64748b",
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            {model.contact}
          </p>
        </header>

        <hr
          className="m-0 border-0"
          style={{ height: "1px", background: p.rule, width: "100%" }}
        />

        {/* Summary */}
        <section>
          <p
            className="leading-relaxed"
            style={{ fontSize: p.body, color: "#1f2937", margin: 0 }}
          >
            {model.summary}
          </p>
        </section>

        {/* Experience */}
        <section>
          <SectionHeading
            label="Experience"
            color={p.accent}
            size={p.sectionSize}
          />
          {model.experience.length === 0 ? (
            <p className="text-[10pt] text-[#94a3b8]">—</p>
          ) : (
            <ol className="m-0 flex flex-col" style={{ gap: "4mm" }}>
              {model.experience.map((exp, i) => (
                <li key={i} className="m-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="font-semibold"
                      style={{
                        fontSize: p.body,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {exp.role || "—"}
                      {exp.company && (
                        <span
                          style={{
                            color: "#475569",
                            fontWeight: 400,
                            marginLeft: "2mm",
                          }}
                        >
                          · {exp.company}
                        </span>
                      )}
                    </p>
                    <span
                      style={{
                        fontSize: "9pt",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {exp.period || ""}
                    </span>
                  </div>
                  <ul
                    className="mt-1.5"
                    style={{
                      listStyle: "disc",
                      paddingLeft: "5mm",
                      margin: 0,
                    }}
                  >
                    {exp.bullets.map((b, bIdx) => (
                      <li
                        key={bIdx}
                        style={{
                          fontSize: p.body,
                          color: "#334155",
                          lineHeight: 1.4,
                          marginBottom: "1.5mm",
                        }}
                      >
                        <span>{b.enhanced}</span>
                        {b.isRewritten && b.rewriteType === "star" && (
                          <span className="ml-2 inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[8pt] font-semibold text-[#0d47a1] border border-blue-200/70 align-middle print:hidden">
                            STAR Rewrite
                          </span>
                        )}
                        {b.isRewritten && b.rewriteType === "action-verb" && (
                          <span className="ml-2 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[8pt] font-semibold text-emerald-700 border border-emerald-200/70 align-middle print:hidden">
                            Action Verb
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Education */}
        <section>
          <SectionHeading
            label="Education"
            color={p.accent}
            size={p.sectionSize}
          />
          {model.education.length === 0 ? (
            <p className="text-[10pt] text-[#94a3b8]">—</p>
          ) : (
            <ol className="m-0 flex flex-col" style={{ gap: "2mm" }}>
              {model.education.map((edu, i) => (
                <li key={i} className="m-0">
                  <p
                    className="font-semibold"
                    style={{ fontSize: p.body, color: "#0f172a", margin: 0 }}
                  >
                    {edu.degree || "—"}
                  </p>
                  <p
                    className="mt-0.5"
                    style={{
                      fontSize: "9pt",
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    {edu.institution || ""}
                    {edu.period ? ` · ${edu.period}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Skills */}
        <section>
          <SectionHeading
            label="Skills & Competencies"
            color={p.accent}
            size={p.sectionSize}
          />
          {model.skills.length === 0 ? (
            <p className="text-[10pt] text-[#94a3b8]">—</p>
          ) : model.coreCompetencies && model.coreCompetencies.length > 0 ? (
            <div className="flex flex-col" style={{ gap: "2.5mm", marginTop: "1mm" }}>
              <div>
                <p style={{ fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: p.accent, margin: "0 0 1mm" }}>
                  Core Role Competencies
                </p>
                <div className="flex flex-wrap" style={{ gap: "1.5mm" }}>
                  {model.coreCompetencies.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-[3px] font-medium"
                      style={{
                        fontSize: "8.5pt",
                        color: "#0d47a1",
                        border: "1px solid rgba(13,71,161,0.25)",
                        padding: "0.5mm 2.2mm",
                        background: "rgba(13,71,161,0.06)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {model.supportingSkills && model.supportingSkills.length > 0 && (
                <div>
                  <p style={{ fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#64748b", margin: "1mm 0 1mm" }}>
                    Supporting Technologies & Tools
                  </p>
                  <div className="flex flex-wrap" style={{ gap: "1.5mm" }}>
                    {model.supportingSkills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-[3px]"
                        style={{
                          fontSize: "8.5pt",
                          color: "#334155",
                          border: `1px solid ${p.rule}`,
                          padding: "0.5mm 2.2mm",
                          background: "#f8fafc",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex flex-wrap"
              style={{ gap: "2mm", marginTop: "1mm" }}
            >
              {model.skills.map((s, i) => (
                <span
                  key={i}
                  className="rounded-[2px]"
                  style={{
                    fontSize: "9pt",
                    color: "#1f2937",
                    border: `1px solid ${p.rule}`,
                    padding: "0.6mm 2.5mm",
                    background: "rgba(13,71,161,0.04)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  label,
  color,
  size,
}: {
  label: string;
  color: string;
  size: string;
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ marginBottom: "2.5mm" }}
    >
      <h2
        className="font-semibold uppercase"
        style={{
          fontSize: size,
          letterSpacing: "0.18em",
          color,
          margin: 0,
        }}
      >
        {label}
      </h2>
      <span
        className="flex-1"
        style={{
          height: "1px",
          background: "rgba(13,71,161,0.10)",
        }}
      />
    </div>
  );
}
