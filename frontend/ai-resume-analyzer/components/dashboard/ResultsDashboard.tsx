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
import { ResultHeader } from "./ResultHeader";
import type { AnalysisResult, JobRole } from "@/lib/types";


interface Props {
  result: AnalysisResult;
  jobs: JobRole[];
  onNewAnalysis: () => void;
}

export default function ResultsDashboard({
  result,
  jobs,
  onNewAnalysis,
}: Props) {
  const role = useMemo(
    () => jobs.find((r) => r.id === result.jobRoleId) ?? jobs[0],
    [jobs, result.jobRoleId],
  );

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <ResultHeader
        role={role}
        fileName={result.fileName}
        onNewAnalysis={onNewAnalysis}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <ScorePanel
            score={result.matchScore}
            matchedCount={result.matchedSkills.length}
            totalRequired={
              result.matchedSkills.length + result.missingSkills.length
            }
          />
        </div>
        <div className="xl:col-span-4">
          <MatchedSkillsCard skills={result.matchedSkills} />
        </div>
        <div className="xl:col-span-4">
          <MissingSkillsCard skills={result.missingSkills} />
        </div>
      </div>

      <div className="mt-5">
        <SkillAlignmentPanel
          matched={result.matchedSkills}
          missing={result.missingSkills}
          skills={result.skills}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <EducationPanel education={result.education} />
        </div>
        <div className="xl:col-span-7">
          <ExperiencePanel experience={result.experience} />
        </div>
      </div>

      <div className="mt-5">
        <SuggestionsPanel suggestions={result.suggestions} />
      </div>

      <div className="mt-5">
        <StarRewritesPanel
          rubric={result.atsRubric}
          starRewrites={result.starRewrites}
          atsScore={result.atsScore}
        />
      </div>

      <div className="mt-5">
        <OverallAssessment result={result} role={role} />

        <p className="mt-6 text-center text-[11.5px] text-[#7890a4]">
          Resumind processes your resume temporarily and does not store your
          data.
        </p>
      </div>
    </div>
  );
}
