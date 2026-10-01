/**
 * Backend wire types — mirror the FastAPI contract documented in
 * /API_INTEGRATION_GUIDE.md. UI code consumes these via the api/ layer.
 */

export interface CandidateInfo {
  name: string;
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
}

export interface JobRole {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
}

export interface AnalysisResult {
  id: string;
  databaseBackend: "supabase" | "sqlite";
  candidate: CandidateInfo;
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
