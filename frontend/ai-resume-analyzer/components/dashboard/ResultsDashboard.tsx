"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar, { SidebarKey } from "./Sidebar";
import DashboardTopBar from "./DashboardTopBar";
import ScorePanel from "./ScorePanel";
import MatchedSkillsCard from "./MatchedSkillsCard";
import MissingSkillsCard from "./MissingSkillsCard";
import ExperiencePanel from "./ExperiencePanel";
import SkillAlignmentPanel from "./SkillAlignmentPanel";
import EducationPanel from "./EducationPanel";
import SkillGapsPanel from "./SkillGapsPanel";
import SuggestionsPanel from "./SuggestionsPanel";
import OverallAssessment from "./OverallAssessment";
import { getRole } from "@/lib/jobRoles";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

const SIDEBAR_TO_SECTION: Record<Exclude<SidebarKey, "settings">, string> = {
  analysis: "section-analysis",
  roles: "section-score",
  skills: "section-alignment",
  reports: "section-assessment",
};

export default function ResultsDashboard({ result, onNewAnalysis }: Props) {
  const [active, setActive] = useState<SidebarKey>("analysis");
  const role = getRole(result.targetRole);

  const sections = useMemo<Exclude<SidebarKey, "settings">[]>(
    () => ["analysis", "roles", "skills", "reports"],
    [],
  );

  useEffect(() => {
    const observed: { id: string; key: Exclude<SidebarKey, "settings"> }[] = [
      { id: "section-analysis", key: "analysis" },
      { id: "section-score", key: "roles" },
      { id: "section-alignment", key: "skills" },
      { id: "section-assessment", key: "reports" },
    ];

    const elements = observed
      .map((o) => ({ ...o, el: document.getElementById(o.id) }))
      .filter((x): x is { id: string; key: Exclude<SidebarKey, "settings">; el: HTMLElement } => !!x.el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible.length === 0) return;
        const firstId = visible[0].target.id;
        const found = observed.find((o) => o.id === firstId);
        if (found) setActive(found.key);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((e) => observer.observe(e.el));
    return () => observer.disconnect();
  }, []);

  const onSidebarSelect = (key: SidebarKey) => {
    if (key === "settings") return;
    setActive(key);
    const id = SIDEBAR_TO_SECTION[key];
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar active={active} onSelect={onSidebarSelect} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[68px] xl:pl-[240px]">
        <DashboardTopBar result={result} onNewAnalysis={onNewAnalysis} />

        {/* Mobile horizontal nav */}
        <div className="border-b border-line bg-void/85 backdrop-blur-xl lg:hidden">
          <nav
            aria-label="Sections"
            className="flex gap-1 overflow-x-auto px-4 py-2 sm:px-6"
          >
            {sections.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onSidebarSelect(key)}
                className={`nav-link whitespace-nowrap ${
                  active === key ? "is-active" : ""
                }`}
              >
                {key === "analysis"
                  ? "Analysis"
                  : key === "roles"
                    ? "Job Role"
                    : key === "skills"
                      ? "Skills"
                      : "Reports"}
              </button>
            ))}
          </nav>
        </div>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-[1280px] space-y-8 lg:space-y-10">
            <section id="section-analysis" className="anim-rise scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="h-px w-6 bg-azure/40" />
                    <span className="eyebrow eyebrow-azure">
                      Your Resume Analysis
                    </span>
                  </div>
                  <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-fg sm:text-[30px]">
                    How your resume aligns with {role.label}.
                  </h1>
                  <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-fg-2">
                    Here&apos;s how your resume aligns with the selected job
                    role.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">
                    TARGET ROLE ·{" "}
                    <span className="text-fg">{role.label}</span>
                  </span>
                  <span className="chip">
                    RESUME ·{" "}
                    <span className="text-fg">{result.resumeFileName}</span>
                  </span>
                </div>
              </div>
            </section>

            <section
              id="section-score"
              className="scroll-mt-24"
              aria-label="Score and matched skills"
            >
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ScorePanel
                    score={result.matchScore}
                    matched={result.requirements.matched}
                    total={result.requirements.total}
                    roleLabel={role.label}
                  />
                </div>
                <div className="xl:col-span-4">
                  <MatchedSkillsCard
                    matched={result.matchedSkills}
                    totalRequired={result.requirements.total}
                  />
                </div>
                <div className="xl:col-span-4">
                  <MissingSkillsCard
                    missing={result.missingSkills}
                    weak={result.weakSkills}
                  />
                </div>
              </div>
            </section>

            <section
              id="section-alignment"
              className="scroll-mt-24"
              aria-label="Skill alignment and education"
            >
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <SkillAlignmentPanel bars={result.alignment} />
                </div>
                <div className="xl:col-span-4 space-y-6">
                  <EducationPanel education={result.education} />
                  <ExperiencePanel experience={result.experience} />
                </div>
              </div>
            </section>

            <section className="scroll-mt-24" aria-label="Skill gaps">
              <SkillGapsPanel gaps={result.gapSkills} />
            </section>

            <section className="scroll-mt-24" aria-label="Suggestions">
              <SuggestionsPanel suggestions={result.suggestions} />
            </section>

            <section id="section-assessment" className="scroll-mt-24">
              <OverallAssessment result={result} />
              <p className="mt-6 text-center text-[11.5px] tracking-[0.04em] text-fg-3">
                End of report · Resumind analyzes your resume temporarily and
                does not store your data.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
