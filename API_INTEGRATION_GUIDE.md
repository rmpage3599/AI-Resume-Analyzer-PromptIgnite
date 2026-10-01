# 🚀 Frontend API Integration Guide — AI Resume Analyzer (v2.0)

This document contains everything needed for the **Frontend Integrating Agent** to connect the Next.js frontend with the Python FastAPI backend.

---

## 📡 1. Backend Server Details

- **Base URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`
- **CORS:** Pre-configured and enabled for `http://localhost:3000` and `http://127.0.0.1:3000`.
- **Database Engine:** Dual Engine (Supabase Cloud + Local SQLite Fallback).
- **Max File Size:** `5 MB`
- **Accepted File Types:** `.pdf`, `.docx`

---

## 🧬 2. Complete TypeScript Definitions

Place these type definitions in `frontend/ai-resume-analyzer/types/api.ts` (or `types.ts`):

```typescript
export interface CandidateInfo {
  name: string;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  github?: string | null;
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
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
}

export interface AtsRubricSubScores {
  keywordMatchScore: { score: number; max: 40 };
  impactQuantificationScore: { score: number; max: 25 };
  actionVerbScore: { score: number; max: 20 };
  formattingReadabilityScore: { score: number; max: 15 };
}

export interface AtsCheckItem {
  item: string;
  passed: boolean;
}

export interface AtsRubric {
  overallAtsScore: number;
  subScores: AtsRubricSubScores;
  metricsDetectedCount: number;
  powerVerbsCount: number;
  checks: AtsCheckItem[];
}

export interface AnalysisResult {
  id: string; // Database record ID
  databaseBackend: "supabase" | "sqlite";
  candidate: CandidateInfo;
  targetJobTitle: string;
  matchScore: number; // 0 to 100
  atsScore: number; // Overall ATS Score out of 100
  atsRubric: AtsRubric;
  skills: string[];
  categorizedSkills: Record<string, string[]>;
  matchedSkills: string[];
  missingSkills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  suggestions: string[];
  starRewrites?: Array<{
    originalBullet: string;
    improvedStarBullet: string;
  }>;
}

export interface RoleRankingItem {
  jobRoleId: string;
  jobTitle: string;
  matchScore: number; // 0 to 100
  semanticScore: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  topMatchedSkills: string[];
  topMissingSkills: string[];
}

export interface MultiRoleComparisonResponse {
  candidate: CandidateInfo;
  fileName: string;
  extractedSkillsCount: number;
  totalRolesCompared: number;
  bestFitRole: string;
  bestFitScore: number;
  rankings: RoleRankingItem[];
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
  version: "2.0.0";
  database_backend: "supabase" | "sqlite";
  supabase_configured: boolean;
  groq_configured: boolean;
}
```

---

## 🔌 3. API Endpoints Specification

### 3.1. Health Check
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "AI Resume Analyzer Backend",
  "version": "2.0.0",
  "database_backend": "supabase",
  "supabase_configured": true,
  "groq_configured": false
}
```

---

### 3.2. Get All 12 Predefined Job Roles
- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Response (200 OK):**
Returns array of 12 roles:
1. `aiml-engineer`: AI/ML Engineer
2. `data-scientist`: Data Scientist
3. `data-analyst`: Data Analyst / BI Specialist
4. `frontend-developer`: Frontend Developer (React / Next.js)
5. `backend-python`: Backend Developer (Python / FastAPI)
6. `backend-node`: Backend Developer (Node.js / Express)
7. `fullstack-developer`: Full Stack Developer
8. `devops-engineer`: DevOps & Cloud Engineer
9. `mobile-developer`: Mobile App Developer
10. `cybersecurity-analyst`: Cybersecurity Analyst
11. `qa-automation-engineer`: QA & Automation Engineer
12. `technical-product-manager`: Technical Product Manager

---

### 3.3. Analyze Resume (Single Role OR Custom JD)
- **Method:** `POST`
- **Endpoint:** `/api/analyze`
- **Content-Type:** `multipart/form-data`

#### Request Parameters (Form-Data):
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `resume` | `File` (Binary) | **Yes** | PDF or DOCX file (Max 5MB) |
| `jobRole` | `string` | **Optional** | Predefined Role ID (e.g. `aiml-engineer`) |
| `customJd` | `string` | **Optional** | Raw text of user-pasted custom Job Description |

*(Note: Either `jobRole` OR `customJd` must be provided).*

#### Success Response (200 OK):
```json
{
  "id": "f5d4aeda-870e-4ed1-b5a5-904a5e1e486c",
  "databaseBackend": "supabase",
  "candidate": {
    "name": "Alex Chen",
    "email": "alex.chen@example.com",
    "phone": "+1 555-0199",
    "linkedin": null,
    "github": null
  },
  "targetJobTitle": "AI/ML Engineer",
  "matchScore": 82,
  "atsScore": 75,
  "atsRubric": {
    "overallAtsScore": 75,
    "subScores": {
      "keywordMatchScore": { "score": 33, "max": 40 },
      "impactQuantificationScore": { "score": 20, "max": 25 },
      "actionVerbScore": { "score": 15, "max": 20 },
      "formattingReadabilityScore": { "score": 12, "max": 15 }
    },
    "metricsDetectedCount": 3,
    "powerVerbsCount": 3,
    "checks": [
      { "item": "Contact Email Present", "passed": true },
      { "item": "Phone Number Present", "passed": true },
      { "item": "Education Section Detected", "passed": true },
      { "item": "Work Experience Section Detected", "passed": true }
    ]
  },
  "skills": ["Python", "Machine Learning", "NumPy", "Pandas", "Scikit-learn", "Docker", "Git", "SQL"],
  "categorizedSkills": {
    "Languages": ["Python", "SQL"],
    "Data & AI": ["Machine Learning", "NumPy", "Pandas", "Scikit-learn"],
    "Cloud & DevOps": ["Docker", "Git"]
  },
  "matchedSkills": ["Python", "Machine Learning", "NumPy", "Pandas", "Scikit-learn", "Docker"],
  "missingSkills": ["TensorFlow", "PyTorch"],
  "education": [
    {
      "degree": "B.Tech in Computer Science and Engineering",
      "institution": "State University of Technology",
      "duration": "2019 - 2023"
    }
  ],
  "experience": [
    {
      "role": "Machine Learning Engineer",
      "company": "TechCorp Solutions",
      "duration": "2023 - Present",
      "bullets": [
        "Architected automated data preprocessing pipelines using Pandas, cutting ETL latency by 35%.",
        "Trained classification models using Scikit-learn achieving 92% precision."
      ]
    }
  ],
  "suggestions": [
    "Bridge Priority Qualification Gaps: Gain and demonstrate hands-on experience in TensorFlow, PyTorch.",
    "Quantify Results using the STAR Method: Add measurable outcomes to your bullet points.",
    "Keyword Optimization: Ensure terms relevant to 'AI/ML Engineer' appear naturally in your Summary."
  ]
}
```

---

### 3.4. Multiple Job Role Comparison (Leaderboard) ⭐ NEW!
Compares a single resume across **all 12 predefined roles** simultaneously and returns a ranked leaderboard sorted by match percentage!

- **Method:** `POST`
- **Endpoint:** `/api/compare-roles`
- **Content-Type:** `multipart/form-data`

#### Request Parameters (Form-Data):
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `resume` | `File` (Binary) | **Yes** | PDF or DOCX file (Max 5MB) |
| `roleIds` | `string` | **Optional** | Comma-separated list of role IDs (default: compares all 12 roles) |

#### Success Response (200 OK):
```json
{
  "candidate": {
    "name": "Alex Chen",
    "email": "alex.chen@example.com",
    "phone": null
  },
  "fileName": "sample_resume.pdf",
  "extractedSkillsCount": 15,
  "totalRolesCompared": 12,
  "bestFitRole": "AI/ML Engineer",
  "bestFitScore": 82,
  "rankings": [
    {
      "jobRoleId": "aiml-engineer",
      "jobTitle": "AI/ML Engineer",
      "matchScore": 82,
      "semanticScore": 85.0,
      "matchedSkillsCount": 6,
      "missingSkillsCount": 0,
      "topMatchedSkills": ["Python", "Machine Learning", "NumPy", "Pandas"],
      "topMissingSkills": []
    },
    {
      "jobRoleId": "data-scientist",
      "jobTitle": "Data Scientist",
      "matchScore": 63,
      "semanticScore": 68.2,
      "matchedSkillsCount": 8,
      "missingSkillsCount": 2,
      "topMatchedSkills": ["Python", "Data Analysis", "Machine Learning", "SQL"],
      "topMissingSkills": ["Statistics", "A/B Testing"]
    },
    {
      "jobRoleId": "devops-engineer",
      "jobTitle": "DevOps & Cloud Engineer",
      "matchScore": 40,
      "semanticScore": 45.1,
      "matchedSkillsCount": 3,
      "missingSkillsCount": 3,
      "topMatchedSkills": ["Docker", "Linux", "Git"],
      "topMissingSkills": ["Kubernetes", "AWS", "CI/CD"]
    },
    {
      "jobRoleId": "frontend-developer",
      "jobTitle": "Frontend Developer (React / Next.js)",
      "matchScore": 10,
      "semanticScore": 15.0,
      "matchedSkillsCount": 1,
      "missingSkillsCount": 6,
      "topMatchedSkills": ["REST APIs"],
      "topMissingSkills": ["JavaScript", "TypeScript", "React"]
    }
  ]
}
```

---

### 3.5. History Endpoints
- **`GET /api/history?limit=20`**: Returns list of past candidate evaluations from Supabase / SQLite.
- **`GET /api/history/{id}`**: Returns full analysis report for a specific evaluation ID.

---

## 💻 4. Next.js Client Helper (`lib/api.ts`)

```typescript
import {
  JobRole,
  AnalysisResult,
  MultiRoleComparisonResponse,
  HistoryResponse,
  HealthResponse
} from "@/types/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchJobRoles(): Promise<JobRole[]> {
  const res = await fetch(`${BACKEND_URL}/api/jobs`);
  if (!res.ok) throw new Error("Failed to load job roles");
  return res.json();
}

export async function analyzeResume(
  file: File,
  jobRoleId?: string,
  customJd?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", file);
  if (jobRoleId) formData.append("jobRole", jobRoleId);
  if (customJd) formData.append("customJd", customJd);

  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to analyze resume");
  return data;
}

export async function compareMultipleRoles(file: File, roleIds?: string[]): Promise<MultiRoleComparisonResponse> {
  const formData = new FormData();
  formData.append("resume", file);
  if (roleIds && roleIds.length > 0) {
    formData.append("roleIds", roleIds.join(","));
  }

  const res = await fetch(`${BACKEND_URL}/api/compare-roles`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to compare roles");
  return data;
}

export async function fetchHistory(limit: number = 20): Promise<HistoryResponse> {
  const res = await fetch(`${BACKEND_URL}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function fetchHistoryDetail(id: string): Promise<AnalysisResult> {
  const res = await fetch(`${BACKEND_URL}/api/history/${id}`);
  if (!res.ok) throw new Error("Failed to load analysis detail");
  return res.json();
}
```
