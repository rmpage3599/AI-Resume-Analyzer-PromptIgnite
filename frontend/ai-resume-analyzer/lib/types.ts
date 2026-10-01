export type JobRoleId =
  | "frontend"
  | "backend"
  | "fullstack"
  | "ai-ml"
  | "data-analyst";

export interface JobRole {
  id: JobRoleId;
  label: string;
  descriptor: string;
  shortLabel: string;
  requiredSkills: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  note?: string;
}

export interface SkillBar {
  name: string;
  value: number;
}

export interface Suggestion {
  title: string;
  detail: string;
}

/**
 * Frontend-friendly analysis result.
 * Derived from the /api/analyze wire payload through normalizeAnalysis().
 */
export interface AnalysisResult {
  candidate: { name: string };
  targetRole: JobRoleId;
  resumeFileName: string;
  resumeSizeBytes: number;
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  requirements: { matched: number; total: number };
  alignment: SkillBar[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  suggestions: Suggestion[];
  assessment: string;
  weakSkills: SkillBar[];
  gapSkills: string[];
}

/**
 * Loose wire type for POST /api/analyze responses.
 * Kept tolerant to allow easy integration with a real backend.
 */
export interface AnalyzeWireResponse {
  candidate?: { name?: string };
  skills?: string[];
  education?: Array<Partial<EducationEntry> | string>;
  experience?: Array<Partial<ExperienceEntry> | string>;
  matchedSkills?: string[];
  missingSkills?: string[];
  matchScore?: number;
  suggestions?: Array<string | Suggestion>;
  alignment?: SkillBar[];
  assessment?: string;
  requirements?: { matched?: number; total?: number };
  weakSkills?: SkillBar[];
}
