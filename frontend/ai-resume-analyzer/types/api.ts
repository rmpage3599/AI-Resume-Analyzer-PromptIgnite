/**
 * Backend wire types — mirror the FastAPI contract documented in
 * /API_INTEGRATION_GUIDE.md. UI code consumes these via the api/ layer.
 */

export interface CandidateInfo {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  duration: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
  bullets?: string[];
}

export interface JobRole {
  id: string;
  title: string;
  field?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
}

export interface AtsSubScore {
  score: number;
  max: number;
  notes?: string;
}

export interface AtsRubric {
  overallAtsScore: number;
  subScores: {
    keywordMatchScore?: AtsSubScore;
    impactQuantificationScore?: AtsSubScore;
    actionVerbScore?: AtsSubScore;
    formattingReadabilityScore?: AtsSubScore;
  };
}

export interface StarRewrite {
  originalBullet: string;
  improvedStarBullet: string;
}

export interface RoleRankingItem {
  jobRoleId: string;
  jobTitle: string;
  field?: string;
  matchScore: number;
  semanticScore?: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  topMatchedSkills: string[];
  topMissingSkills: string[];
}

export interface MultiRoleComparison {
  field?: string;
  totalRolesCompared: number;
  bestFitRole: string;
  bestFitScore: number;
  rankings: RoleRankingItem[];
}

export interface AnalysisResult {
  id: string;
  databaseBackend: "supabase" | "sqlite";
  candidate: CandidateInfo;
  field?: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  suggestions: string[];
  createdAt?: string;
  fileName?: string;
  jobRoleId?: string;
  targetJobTitle?: string;
  atsScore?: number;
  atsRubric?: AtsRubric;
  starRewrites?: StarRewrite[];
  aiEnhanced?: boolean;
  multiRoleComparison?: MultiRoleComparison;
}



export interface HistoryItem {
  id: string;
  candidateName: string;
  fileName: string;
  jobRoleId: string;
  matchScore: number;
  createdAt: string;
}

export interface HistoryResponse {
  total: number;
  history: HistoryItem[];
}

export interface HealthResponse {
  status: "healthy";
  service: string;
  database_backend: "supabase" | "sqlite";
  supabase_configured: boolean;
}

export interface ApiErrorResponse {
  detail: string;
}
