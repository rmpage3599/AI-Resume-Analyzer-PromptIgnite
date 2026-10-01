"use client";

import { useMemo } from "react";
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
  const role = useMemo(
    () => jobs.find((r) => r.id === result.jobRoleId) ?? jobs[0],
    [jobs, result.jobRoleId],
  );

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <ResultHeader
        role={role}
        fileName={result.fileName}
        targetJobTitle={result.targetJobTitle}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Content Area */}
        <div className="space-y-6 lg:col-span-8">
          {/* Top Score & Skills Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-12">
              <ScorePanel
                score={result.matchScore}
                matchedCount={result.matchedSkills.length}
                totalRequired={
                  result.matchedSkills.length + result.missingSkills.length
                }
              />
            </div>
            <div className="xl:col-span-6">
              <MatchedSkillsCard skills={result.matchedSkills} />
            </div>
            <div className="xl:col-span-6">
              <MissingSkillsCard skills={result.missingSkills} />
            </div>
          </div>

          <div>
            <SkillAlignmentPanel
              matched={result.matchedSkills}
              missing={result.missingSkills}
              skills={result.skills}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <EducationPanel education={result.education} />
            <ExperiencePanel experience={result.experience} />
          </div>

          <div>
            <SuggestionsPanel suggestions={result.suggestions} />
          </div>

          <div>
            <StarRewritesPanel
              rubric={result.atsRubric}
              starRewrites={result.starRewrites}
              atsScore={result.atsScore}
            />
          </div>

          <div>
            <OverallAssessment result={result} role={role} />
          </div>
        </div>

        {/* Multi-Role Benchmark Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          <MultiRoleSidebar
            comparison={result.multiRoleComparison}
            candidateName={result.candidate.name}
          />
        </div>
      </div>

      <p className="mt-10 text-center text-[11.5px] text-[#7890a4]">
        Resumind processes your resume temporarily and does not store your data.
      </p>
    </div>
  );
}

