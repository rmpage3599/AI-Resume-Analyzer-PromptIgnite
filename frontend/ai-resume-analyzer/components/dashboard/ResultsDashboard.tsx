"use client";

import { useMemo, useState } from "react";
import MatchedSkillsCard from "./MatchedSkillsCard";
import MissingSkillsCard from "./MissingSkillsCard";
import ScorePanel from "./ScorePanel";
import SkillAlignmentPanel from "./SkillAlignmentPanel";
import EducationPanel from "./EducationPanel";
import ExperiencePanel from "./ExperiencePanel";
import SuggestionsPanel from "./SuggestionsPanel";
import StarRewritesPanel from "./StarRewritesPanel";
import OverallAssessment from "./OverallAssessment";
import MultiRoleSidebar from "./MultiRoleSidebar";
import DashboardSidebar, { type DashboardTab } from "./DashboardSidebar";
import EnhancementCard from "./EnhancementCard";
import { ResultHeader } from "./ResultHeader";
import type { AnalysisResult, JobRole } from "@/lib/types";

interface Props {
  result: AnalysisResult;
  jobs: JobRole[];
  onNewAnalysis?: () => void;
}

export default function ResultsDashboard({
  result,
  jobs,
}: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const role = useMemo(
    () => jobs.find((r) => r.id === result.jobRoleId) ?? jobs[0],
    [jobs, result.jobRoleId],
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col lg:flex-row bg-[#f8fafc]">
      {/* Left Sidebar Navigation — Docked Hard to Left Viewport Edge */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        candidateName={result.candidate.name}
        matchScore={result.matchScore}
      />

      {/* Right Tab Content View (Modular & Compact — No Long Scrolling) */}
      <main className="flex-1 min-w-0 p-5 sm:p-6 lg:p-8 xl:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <ResultHeader
            role={role}
            fileName={result.fileName}
            targetJobTitle={result.targetJobTitle}
          />

          {/* TAB 1: OVERVIEW & SCORES */}
          {activeTab === "overview" && (
            <div className="space-y-6 anim-fade">
              <div className="grid gap-5 xl:grid-cols-12 items-stretch">
                <div className="xl:col-span-5">
                  <ScorePanel
                    score={result.matchScore}
                    matchedCount={result.matchedSkills.length}
                    totalRequired={
                      result.matchedSkills.length + result.missingSkills.length
                    }
                  />
                </div>
                <div className="xl:col-span-7">
                  <StarRewritesPanel
                    rubric={result.atsRubric}
                    atsScore={result.atsScore}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <MatchedSkillsCard skills={result.matchedSkills} />
                <MissingSkillsCard skills={result.missingSkills} />
              </div>

              <EnhancementCard />
            </div>
          )}

          {/* TAB 2: MULTI-ROLE BENCHMARK */}
          {activeTab === "multi-role" && (
            <div className="anim-fade space-y-6">
              <MultiRoleSidebar
                comparison={result.multiRoleComparison}
                candidateName={result.candidate.name}
              />
            </div>
          )}

          {/* TAB 3: AI IMPROVEMENTS & STAR REWRITES */}
          {activeTab === "improvements" && (
            <div className="space-y-6 anim-fade">
              <SuggestionsPanel suggestions={result.suggestions} />
              {result.starRewrites && result.starRewrites.length > 0 && (
                <StarRewritesPanel
                  starRewrites={result.starRewrites}
                />
              )}
              <EnhancementCard />
            </div>
          )}

          {/* TAB 4: SKILL ALIGNMENT & GAPS */}
          {activeTab === "skills" && (
            <div className="space-y-6 anim-fade">
              <SkillAlignmentPanel
                matched={result.matchedSkills}
                missing={result.missingSkills}
                skills={result.skills}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <MatchedSkillsCard skills={result.matchedSkills} />
                <MissingSkillsCard skills={result.missingSkills} />
              </div>
            </div>
          )}

          {/* TAB 5: EXPERIENCE, EDUCATION & REPORT */}
          {activeTab === "experience" && (
            <div className="space-y-6 anim-fade">
              <div className="grid gap-5 sm:grid-cols-2">
                <EducationPanel education={result.education} />
                <ExperiencePanel experience={result.experience} />
              </div>
              <OverallAssessment result={result} role={role} />
            </div>
          )}

          <p className="mt-12 text-center text-[11.5px] text-[#7890a4]">
            Resumind processes your resume temporarily and does not store your data.
          </p>
        </div>
      </main>
    </div>
  );
}


