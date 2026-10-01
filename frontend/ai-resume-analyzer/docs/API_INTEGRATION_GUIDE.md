# 🚀 Frontend API Integration Guide — AI Resume Analyzer

This document contains everything needed for the **Frontend Integrating Agent** to connect the Next.js frontend with the Python FastAPI backend.

---

## 📡 1. Backend Server Details

- **Base URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`
- **CORS:** Pre-configured and enabled for `http://localhost:3000` and `http://127.0.0.1:3000`.
- **Max File Size:** `5 MB`
- **Accepted File Types:** `.pdf`, `.docx`

---

## 🧬 2. Ready-to-Use TypeScript Definitions

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
  candidate: CandidateInfo;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number; // Integer percentage from 0 to 100
  suggestions: string[];
}

export interface HealthResponse {
  status: "healthy";
  service: string;
  supabase_configured: boolean;
}

export interface ApiErrorResponse {
  detail: string;
}
```

---

## 🔌 3. API Endpoints Specification

### 3.1. Health Check

Used to verify the backend is online and check whether Phase 2 Supabase is active.

- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Headers:** None
- **Request Body:** None

#### Response (200 OK):
```json
{
  "status": "healthy",
  "service": "AI Resume Analyzer Backend",
  "supabase_configured": false
}
```

---

### 3.2. Get Predefined Job Roles

Used to populate the **Job Role Selector** dropdown in the UI.

- **Method:** `GET`
- **Endpoint:** `/api/jobs`
- **Headers:** None
- **Request Body:** None

#### Response (200 OK):
```json
[
  {
    "id": "aiml-engineer",
    "title": "AI/ML Engineer",
    "requiredSkills": [
      "Python",
      "Machine Learning",
      "NumPy",
      "Pandas",
      "Scikit-learn"
    ],
    "preferredSkills": [
      "TensorFlow",
      "PyTorch",
      "Deep Learning",
      "NLP",
      "Computer Vision",
      "Docker"
    ],
    "description": "Develop and deploy machine learning models, analyze complex datasets, and build intelligent algorithms for production applications."
  },
  {
    "id": "frontend-developer",
    "title": "Frontend Developer",
    "requiredSkills": [
      "JavaScript",
      "TypeScript",
      "React",
      "HTML",
      "CSS",
      "Tailwind CSS"
    ],
    "preferredSkills": [
      "Next.js",
      "Redux",
      "GraphQL",
      "REST APIs",
      "Responsive Design",
      "Jest"
    ],
    "description": "Build high-performance, accessible, and responsive user interfaces for modern web applications using React and Next.js."
  },
  {
    "id": "backend-developer",
    "title": "Backend Developer",
    "requiredSkills": [
      "Python",
      "Node.js",
      "SQL",
      "PostgreSQL",
      "REST APIs"
    ],
    "preferredSkills": [
      "FastAPI",
      "Express",
      "Docker",
      "Redis",
      "MongoDB",
      "Microservices",
      "AWS"
    ],
    "description": "Architect scalable backend services, design robust APIs, optimize database queries, and ensure server security."
  },
  {
    "id": "fullstack-developer",
    "title": "Full Stack Developer",
    "requiredSkills": [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "SQL",
      "Git"
    ],
    "preferredSkills": [
      "Next.js",
      "PostgreSQL",
      "Docker",
      "AWS",
      "Tailwind CSS",
      "REST APIs"
    ],
    "description": "Deliver end-to-end web applications bridging frontend user experience with reliable backend microservices and databases."
  },
  {
    "id": "data-analyst",
    "title": "Data Analyst",
    "requiredSkills": [
      "SQL",
      "Excel",
      "Python",
      "Power BI",
      "Data Visualization"
    ],
    "preferredSkills": [
      "Tableau",
      "Pandas",
      "NumPy",
      "Statistics",
      "ETL",
      "Business Intelligence"
    ],
    "description": "Transform raw business data into actionable insights, interactive dashboards, and strategic performance reports."
  }
]
```

---

### 3.3. Analyze Resume (Core Endpoint)

Uploads the candidate's resume, parses extracted entities, compares against the selected role, and computes ATS match metrics, missing skills, and suggestions.

- **Method:** `POST`
- **Endpoint:** `/api/analyze`
- **Content-Type:** `multipart/form-data`

#### Request Parameters (Form-Data):
| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `resume` | `File` (Binary) | **Yes** | PDF or DOCX file (Max 5MB) | `my_resume.pdf` |
| `jobRole` | `string` | **Yes** | Predefined Job Role ID | `"aiml-engineer"` |

> ⚠️ **Important:** Do NOT manually set `headers: { 'Content-Type': 'multipart/form-data' }` in `fetch()`. The browser automatically sets it with the proper `boundary` string when passing a `FormData` object.

---

#### Success Response (200 OK):
```json
{
  "candidate": {
    "name": "Alex Chen"
  },
  "skills": [
    "Data Analysis",
    "Docker",
    "ETL",
    "Git",
    "GitHub",
    "Linux",
    "Machine Learning",
    "Matplotlib",
    "NumPy",
    "Pandas",
    "Predictive Modeling",
    "Python",
    "REST APIs",
    "Scikit-learn",
    "SQL"
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
    "Python",
    "Machine Learning",
    "NumPy",
    "Pandas",
    "Scikit-learn",
    "Docker"
  ],
  "missingSkills": [
    "TensorFlow",
    "PyTorch"
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

#### Error Responses:

##### 1. Unsupported File Extension (400 Bad Request):
```json
{
  "detail": "Unsupported file format: '.txt'. Please upload a valid PDF (or DOCX) file."
}
```

##### 2. Empty File (400 Bad Request):
```json
{
  "detail": "Uploaded file is empty. Please select a valid resume."
}
```

##### 3. File Too Large (400 Bad Request):
```json
{
  "detail": "File size exceeds the 5MB limit. Please upload a smaller resume."
}
```

##### 4. Unknown Job Role (404 Not Found):
```json
{
  "detail": "Job role 'unknown-role' not found in predefined list."
}
```

##### 5. Scanned / Unreadable PDF (422 Unprocessable Entity):
```json
{
  "detail": "Unable to extract readable text from the document. Please ensure it is not a scanned image or empty."
}
```

##### 6. Missing Parameters (422 Unprocessable Entity):
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "resume"],
      "msg": "Field required"
    }
  ]
}
```

---

## 💻 4. Next.js Frontend Integration Examples

### 4.1. Client-Side API Helper (`lib/api.ts`)

```typescript
import { JobRole, AnalysisResult, HealthResponse } from "@/types/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Fetch all predefined job roles for dropdown selector
 */
export async function fetchJobRoles(): Promise<JobRole[]> {
  const response = await fetch(`${BACKEND_URL}/api/jobs`);
  if (!response.ok) {
    throw new Error(`Failed to load job roles: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Submit PDF resume and selected job role for analysis
 */
export async function analyzeResume(file: File, jobRoleId: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobRole", jobRoleId);

  const response = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    // If backend returned a detailed error message, throw it
    throw new Error(data.detail || "Failed to analyze resume");
  }

  return data as AnalysisResult;
}

/**
 * Check backend service health
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${BACKEND_URL}/api/health`);
  return response.json();
}
```

---

### 4.2. Example React Component Usage (`components/ResumeAnalyzer.tsx`)

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { fetchJobRoles, analyzeResume } from "@/lib/api";
import { JobRole, AnalysisResult } from "@/types/api";

export default function ResumeAnalyzer() {
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("aiml-engineer");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // 1. Load job roles on mount
  useEffect(() => {
    fetchJobRoles()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) setSelectedRole(data[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  // 2. Submit handler
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume PDF file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeResume(file, selectedRole);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Upload & Form */}
      <form onSubmit={handleAnalyze} className="bg-white p-6 rounded-xl shadow border space-y-4">
        <div>
          <label className="block font-medium mb-1">Target Job Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {loading ? "Analyzing resume..." : "Analyze Resume"}
        </button>
      </form>

      {/* Results Dashboard */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow border space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold">{result.candidate.name}</h2>
              <p className="text-gray-500">Evaluated Candidate Profile</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-600">{result.matchScore}%</span>
              <p className="text-xs text-gray-500 font-medium">Job Match</p>
            </div>
          </div>

          {/* Matched Skills */}
          <div>
            <h3 className="font-semibold text-green-700 mb-2">✅ Matched Skills</h3>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <h3 className="font-semibold text-red-700 mb-2">⚠️ Missing Skills</h3>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">All required skills covered!</p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">💡 Improvement Suggestions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {result.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 5. Optional Next.js Rewrites (No CORS / Proxy Setup)

If you prefer to make calls to `/api/analyze` directly without writing `http://localhost:8000`, add this rewrite in `frontend/ai-resume-analyzer/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

With this rewrite in place, your frontend code can simply call:
```typescript
fetch("/api/analyze", { method: "POST", body: formData });
fetch("/api/jobs");
```
And Next.js will automatically proxy the requests to the FastAPI backend!
