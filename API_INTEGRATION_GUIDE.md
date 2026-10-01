# 🚀 Frontend API Integration Guide — AI Resume Analyzer

This document contains everything needed for the **Frontend Integrating Agent** to connect the Next.js frontend with the Python FastAPI backend.

---

## 📡 1. Backend Server Details

- **Base URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`
- **CORS:** Pre-configured and enabled for `http://localhost:3000` and `http://127.0.0.1:3000`.
- **Database Engine:** Dual Engine (Supabase Cloud + Local SQLite Fallback out-of-the-box).
- **Max File Size:** `5 MB`
- **Accepted File Types:** `.pdf`, `.docx`

---

## 🧬 2. Complete TypeScript Definitions

Place these type definitions in `frontend/ai-resume-analyzer/types/api.ts` (or `types.ts`):

```typescript
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
  id: "aiml-engineer" | "frontend-developer" | "backend-developer" | "fullstack-developer" | "data-analyst" | string;
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
}

export interface AnalysisResult {
  id: string; // Database record ID
  databaseBackend: "supabase" | "sqlite";
  candidate: CandidateInfo;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number; // Integer percentage from 0 to 100
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
  "database_backend": "sqlite",
  "supabase_configured": false
}
```

---

### 3.2. Get Predefined Job Roles (Dropdown)
- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Response (200 OK):**
```json
[
  {
    "id": "aiml-engineer",
    "title": "AI/ML Engineer",
    "requiredSkills": ["Python", "Machine Learning", "NumPy", "Pandas", "Scikit-learn"],
    "preferredSkills": ["TensorFlow", "PyTorch", "Deep Learning", "NLP", "Docker"],
    "description": "Develop and deploy machine learning models, analyze complex datasets, and build intelligent algorithms."
  },
  {
    "id": "frontend-developer",
    "title": "Frontend Developer",
    "requiredSkills": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind CSS"],
    "preferredSkills": ["Next.js", "Redux", "GraphQL", "REST APIs", "Jest"],
    "description": "Build high-performance, accessible, and responsive user interfaces for modern web applications."
  },
  {
    "id": "backend-developer",
    "title": "Backend Developer",
    "requiredSkills": ["Python", "Node.js", "SQL", "PostgreSQL", "REST APIs"],
    "preferredSkills": ["FastAPI", "Express", "Docker", "Redis", "MongoDB", "AWS"],
    "description": "Architect scalable backend services, design robust APIs, and optimize database queries."
  },
  {
    "id": "fullstack-developer",
    "title": "Full Stack Developer",
    "requiredSkills": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git"],
    "preferredSkills": ["Next.js", "PostgreSQL", "Docker", "AWS", "Tailwind CSS"],
    "description": "Deliver end-to-end web applications bridging frontend experience with reliable backend microservices."
  },
  {
    "id": "data-analyst",
    "title": "Data Analyst",
    "requiredSkills": ["SQL", "Excel", "Python", "Power BI", "Data Visualization"],
    "preferredSkills": ["Tableau", "Pandas", "NumPy", "Statistics", "ETL"],
    "description": "Transform raw business data into actionable insights, interactive dashboards, and reports."
  }
]
```

---

### 3.3. Analyze Resume (Core Endpoint & Auto-Save)
Uploads the resume, parses entities, compares against the selected role, computes ATS match metrics, missing skills, suggestions, and **automatically saves the record to the database**.

- **Method:** `POST`
- **Endpoint:** `/api/analyze`
- **Content-Type:** `multipart/form-data`

#### Request Parameters (Form-Data):
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `resume` | `File` (Binary) | **Yes** | PDF or DOCX file (Max 5MB) |
| `jobRole` | `string` | **Yes** | Predefined Job Role ID |

#### Success Response (200 OK):
```json
{
  "id": "8ef39955-157a-406c-a5bf-3ff639c47df0",
  "databaseBackend": "sqlite",
  "candidate": {
    "name": "Alex Chen"
  },
  "skills": [
    "Data Analysis", "Docker", "Git", "Linux", "Machine Learning",
    "NumPy", "Pandas", "Python", "REST APIs", "Scikit-learn", "SQL"
  ],
  "education": [
    {
      "degree": "B.Tech in Computer Science and Engineering",
      "institution": "State University of Technology | 2019 - 2023",
      "duration": "2019"
    }
  ],
  "experience": [
    {
      "role": "Machine Learning Engineer - TechCorp Solutions",
      "company": "Technology Company",
      "duration": "1-2 years"
    }
  ],
  "matchedSkills": [
    "Python", "Machine Learning", "NumPy", "Pandas", "Scikit-learn", "Docker"
  ],
  "missingSkills": [
    "TensorFlow", "PyTorch"
  ],
  "matchScore": 83,
  "suggestions": [
    "Gain hands-on proficiency in critical role requirements: TensorFlow, PyTorch. Build a portfolio project demonstrating their usage.",
    "Quantify your accomplishments using the STAR method (e.g., 'Improved API latency by 35%' or 'Reduced cloud costs by $12K').",
    "Tailor your resume summary and headline specifically for the 'AI/ML Engineer' position to pass ATS keyword filters."
  ]
}
```

---

### 3.4. Get Past Analyses History
Used to display past candidate evaluations in the **"History / Past Analyses"** tab.

- **Method:** `GET`
- **Endpoint:** `/api/history?limit=20`
- **Query Params:** `limit` (optional integer, default 20)

#### Response (200 OK):
```json
{
  "total": 1,
  "history": [
    {
      "id": "8ef39955-157a-406c-a5bf-3ff639c47df0",
      "candidateName": "Alex Chen",
      "fileName": "sample_resume.pdf",
      "jobRoleId": "aiml-engineer",
      "matchScore": 83,
      "createdAt": "2026-10-01T07:21:46.123456"
    }
  ]
}
```

---

### 3.5. Get Analysis Detail by ID
Retrieve the full details of any previous evaluation by its record ID.

- **Method:** `GET`
- **Endpoint:** `/api/history/{id}`

#### Response (200 OK):
Returns the complete `AnalysisResult` object matching Section 3.3.

---

## 💻 4. Next.js Client Helper (`lib/api.ts`)

```typescript
import { JobRole, AnalysisResult, HistoryResponse, HealthResponse } from "@/types/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchJobRoles(): Promise<JobRole[]> {
  const res = await fetch(`${BACKEND_URL}/api/jobs`);
  if (!res.ok) throw new Error("Failed to load job roles");
  return res.json();
}

export async function analyzeResume(file: File, jobRoleId: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobRole", jobRoleId);

  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to analyze resume");
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

---

## ☁️ 5. Supabase Configuration (Optional Cloud Sync)

To connect Supabase Cloud:
1. Open [database.new](https://database.new) and create a free Supabase project.
2. In Supabase SQL Editor: Run [backend/database/schema.sql](backend/database/schema.sql).
3. In `backend/.env`:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-or-service-key
   ```
4. The backend automatically switches to Supabase Cloud on reload!
