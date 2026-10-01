# AI Resume Analyzer — Phase 1 Project Context

> **Purpose:** This document is the single source of truth for the Phase 1 hackathon MVP.  
> Share this file with teammates and their AI coding agents before they make implementation decisions.

---

## 1. Project Overview

We are building an **AI Resume Analyzer** for a hackathon.

The core user journey is:

```text
Upload Resume PDF
        ↓
Extract Resume Text
        ↓
Select Target Job Role
        ↓
Compare Resume Against Job Requirements
        ↓
Identify Skills / Education / Experience
        ↓
Identify Missing Skills
        ↓
Provide Improvement Suggestions
        ↓
Display Results
```

The objective of Phase 1 is to create a **working, polished, demonstrable MVP quickly**.

This is NOT the full production version of the product.

---

# 2. Problem Statement Requirements

The hackathon problem requires the system to:

- Upload a PDF resume
- Extract resume text
- Identify:
  - Skills
  - Education
  - Experience
- Compare the resume with a selected job role
- Display missing skills
- Provide improvement suggestions

The Phase 1 implementation must directly demonstrate all of these requirements.

---

# 3. Phase 1 Scope

## Included

Phase 1 includes:

1. PDF resume uploader
2. Temporary handling of the uploaded PDF
3. PDF text extraction
4. Resume information extraction
5. Hardcoded/local job-role data
6. Job-role selection
7. Resume-vs-job comparison
8. Match score
9. Matched skills
10. Missing skills
11. Education information
12. Experience information
13. Improvement suggestions
14. Results dashboard
15. Basic loading and error states

---

# 4. Explicitly NOT Included in Phase 1

Do NOT implement these unless explicitly requested later:

- User authentication
- Login
- Signup
- User profiles
- User accounts
- Persistent sessions
- Database
- Supabase
- Firebase
- Cloud file storage
- Permanent resume storage
- Resume history
- Multiple-user management
- Recruiter dashboard
- Job posting system
- Resume builder
- Email notifications
- Microservices
- Separate production backend
- Complex ML training
- Fine-tuned custom ML model
- Vector database
- RAG pipeline
- Production-grade analytics

These belong to future phases.

**Do not add infrastructure merely because it may be useful later.**

---

# 5. Phase 1 Design Principle

The most important principle is:

> **Keep Phase 1 simple enough to finish and demonstrate within the hackathon time limit.**

We prioritize:

1. Working end-to-end flow
2. Correct coverage of the problem statement
3. Simple architecture
4. Clean UI
5. Reliable demo
6. Easy future expansion

We do NOT prioritize production-scale architecture yet.

---

# 6. Recommended Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS

Next.js should handle both the UI and the lightweight server/API processing required for Phase 1.

There is no need for a separate Express/Node backend for the MVP.

---

## PDF Processing

Use a suitable PDF text extraction library.

The requirement is:

```text
PDF → Extracted Text
```

The exact library can be selected during implementation based on compatibility with the chosen Next.js environment.

---

## AI Layer

The architecture should allow an LLM to analyze the extracted resume text.

Possible providers include:

- Gemini
- OpenAI
- Groq

The specific provider can be selected based on which API key/service is available and reliable during the hackathon.

The application should not become tightly coupled to one provider if avoidable.

---

# 7. File Handling Decision

## Phase 1: No permanent storage

The uploaded PDF is **not stored permanently**.

The browser receives the user's selected file as a temporary `File` object.

Conceptually:

```text
User selects resume.pdf
        ↓
Browser File object
        ↓
Send to processing endpoint
        ↓
Extract text
        ↓
Analyze
        ↓
Return results
        ↓
Temporary file is no longer needed
```

### Important clarification

Do NOT use `localStorage` to store the PDF.

The phrase "temporary browser storage" refers to temporary handling of the selected file in the browser/session, not permanent browser persistence.

If a browser object URL is needed for a preview, it may be created temporarily and revoked when no longer needed.

The actual Phase 1 goal is simply:

> **Process the uploaded PDF without persistent storage.**

---

# 8. No Database Decision

Phase 1 does NOT use a database.

There is currently no need for:

- PostgreSQL
- MongoDB
- Firestore
- Supabase Database

All static job-role information should live in local JSON/TypeScript data.

For example:

```text
data/
└── jobs.json
```

or an equivalent local module.

---

# 9. Job Role Data

Job roles are predefined for Phase 1.

Do NOT build a job creation/admin system.

Suggested initial roles:

1. Frontend Developer
2. Backend Developer
3. Full Stack Developer
4. AI/ML Engineer
5. Data Analyst

The exact number can be adjusted if time is limited.

Each role should contain information such as:

```json
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
    "Deep Learning"
  ]
}
```

The data does not need to be stored in a database.

---

# 10. Resume Analysis Pipeline

The intended processing pipeline is:

```text
PDF Upload
    ↓
Validate File
    ↓
Extract PDF Text
    ↓
Validate Extracted Text
    ↓
Load Selected Job Role
    ↓
Analyze Resume
    ↓
Compare With Job Requirements
    ↓
Calculate/Determine Match
    ↓
Return Structured Result
    ↓
Render Dashboard
```

---

# 11. Resume Information to Extract

The system should identify at least:

## Candidate

- Name, if available

## Skills

Examples:

- Python
- Java
- JavaScript
- React
- SQL
- Machine Learning
- etc.

## Education

Examples:

- Degree
- Field of study
- Institution
- Relevant education details

## Experience

Examples:

- Job title
- Company
- Duration
- Relevant responsibilities/projects

The system must not invent information that is not present in the resume.

---

# 12. AI Response Structure

If an LLM is used, it should return structured JSON rather than arbitrary prose.

A suitable response shape is:

```json
{
  "candidate": {
    "name": "John Doe"
  },
  "skills": [
    "Python",
    "NumPy",
    "Pandas"
  ],
  "education": [
    {
      "degree": "B.Tech Computer Science",
      "institution": "ABC University"
    }
  ],
  "experience": [
    {
      "role": "Software Developer",
      "company": "XYZ Technologies",
      "duration": "2 years"
    }
  ],
  "matchedSkills": [
    "Python",
    "NumPy"
  ],
  "missingSkills": [
    "TensorFlow",
    "Deep Learning"
  ],
  "matchScore": 70,
  "suggestions": [
    "Learn TensorFlow fundamentals",
    "Build a deep learning project"
  ]
}
```

The exact schema may evolve during implementation, but the frontend should consume predictable structured data.

---

# 13. AI Prompt Principles

The AI should be instructed to behave as a resume analyzer/career assistant.

The prompt should tell the model to:

1. Extract factual information from the resume
2. Identify skills
3. Identify education
4. Identify experience
5. Compare the candidate with the selected role
6. Identify matching skills
7. Identify missing skills
8. Provide practical improvement suggestions
9. Avoid inventing information
10. Return structured JSON

The selected job's requirements should be provided alongside the extracted resume text.

Conceptually:

```text
JOB ROLE:
AI/ML Engineer

REQUIRED SKILLS:
Python
Machine Learning
NumPy
Pandas
Scikit-learn

PREFERRED SKILLS:
TensorFlow
PyTorch
Deep Learning

RESUME:
<extracted resume text>
```

---

# 14. Match Score

A match score should be displayed to the user.

For the basic implementation, a deterministic skill-based calculation is preferred where practical.

Example:

```text
Required skills = 6
Matched skills = 4

Match score = 4 / 6 × 100
            = 66.7%
```

This makes the core score predictable.

The AI can provide qualitative context around the score.

Do not rely on an arbitrary AI-generated number if a simple deterministic calculation can be used.

---

# 15. UI/UX Requirements

The MVP should primarily be a **single-page application/dashboard**.

## Initial state

The page should show:

- Project title
- Short explanation
- PDF upload area
- Job role selector
- Analyze button

Example:

```text
AI Resume Analyzer

Upload your resume PDF

[ Drop PDF here / Browse ]

Select Job Role

[ AI/ML Engineer ▼ ]

[ Analyze Resume ]
```

---

# 16. Results UI

After successful analysis, show:

## Match Score

Example:

```text
78%
Job Match
```

A progress bar, circular indicator, or similar visual can be used.

---

## Skills

Display identified/matched skills as badges or chips.

Example:

```text
✓ Python
✓ Pandas
✓ NumPy
✓ Machine Learning
```

---

## Education

Example:

```text
B.Tech Computer Science
ABC University
```

---

## Experience

Example:

```text
Software Developer
XYZ Technologies
2 years
```

---

## Missing Skills

This section is mandatory.

Example:

```text
Missing Skills

⚠ TensorFlow
⚠ Deep Learning
⚠ PyTorch
```

---

## Improvement Suggestions

Example:

```text
Improvement Suggestions

1. Learn TensorFlow fundamentals.
2. Build a deep-learning project.
3. Add ML deployment experience.
```

---

# 17. UI State Handling

The application should have at least:

### Empty state

No resume uploaded.

### File selected state

Show selected file name and allow the user to analyze it.

### Loading state

While extracting/analyzing:

```text
Analyzing your resume...
```

Disable repeated submissions while processing.

### Success state

Display the complete analysis dashboard.

### Error state

Handle:

- Non-PDF file
- Oversized file
- Invalid/corrupt PDF
- PDF text extraction failure
- Empty/extractable text failure
- AI/API failure

Errors should be understandable to a normal user.

---

# 18. Suggested Project Structure

A simple structure is preferred:

```text
project/
│
├── app/
│   ├── page.tsx
│   │
│   └── api/
│       └── analyze/
│           └── route.ts
│
├── components/
│   ├── ResumeUploader.tsx
│   ├── JobSelector.tsx
│   ├── MatchScore.tsx
│   ├── SkillsCard.tsx
│   ├── EducationCard.tsx
│   ├── ExperienceCard.tsx
│   ├── MissingSkills.tsx
│   └── Suggestions.tsx
│
├── data/
│   └── jobs.json
│
├── lib/
│   ├── pdf.ts
│   ├── ai.ts
│   └── matching.ts
│
└── ...
```

The exact structure may differ, but avoid unnecessary abstraction.

---

# 19. API Design

A simple endpoint is sufficient:

```http
POST /api/analyze
```

Input:

```text
multipart/form-data
```

with:

```text
resume: PDF file
jobRole: selected role ID
```

Processing:

```text
PDF
 ↓
Extract text
 ↓
Get job role data
 ↓
Analyze
 ↓
Match
```

Response:

```json
{
  "candidate": {},
  "skills": [],
  "education": [],
  "experience": [],
  "matchedSkills": [],
  "missingSkills": [],
  "matchScore": 78,
  "suggestions": []
}
```

---

# 20. Security/Privacy Scope for Phase 1

Because no permanent storage or authentication is being implemented:

- Do not save uploaded resumes permanently.
- Do not expose resume contents unnecessarily.
- Do not log entire resumes to the console.
- Do not put API keys in frontend code.
- Keep LLM/API credentials server-side.
- Validate that the uploaded file is actually a supported PDF.
- Apply a reasonable upload size limit.

This is a hackathon MVP, not a complete production privacy system.

---

# 21. Recommended Implementation Order

The implementation should follow this order so that the team reaches a working vertical slice quickly.

## Step 1 — Project setup

Set up:

- Next.js
- TypeScript
- Tailwind
- Required PDF library
- AI SDK/client if using an LLM

---

## Step 2 — Job data

Create the local job-role JSON/data.

Make sure the frontend can select a role.

---

## Step 3 — PDF uploader

Implement:

- PDF selection
- Drag/drop if time allows
- File validation
- Selected file display

---

## Step 4 — PDF extraction

Make sure:

```text
PDF → Text
```

works before spending significant time on styling.

---

## Step 5 — Analysis

Connect:

```text
Resume text
+
Selected job requirements
→
Analysis
```

Use structured JSON.

---

## Step 6 — Matching

Determine:

- Matched skills
- Missing skills
- Match score

---

## Step 7 — Results UI

Render:

- Score
- Skills
- Education
- Experience
- Missing skills
- Suggestions

---

## Step 8 — Polish

Only after the complete flow works:

- Improve spacing
- Add icons
- Add progress indicators
- Improve cards
- Improve loading state
- Improve error messages
- Add responsive behavior

---

# 22. One-Hour Hackathon Priority

The project should be developed according to this priority:

### Priority 1 — MUST WORK

```text
PDF upload
↓
PDF extraction
↓
Resume analysis
↓
Job comparison
↓
Results
```

### Priority 2 — MUST LOOK GOOD

```text
Clean dashboard
Match score
Skill badges
Missing skill visualization
```

### Priority 3 — NICE TO HAVE

```text
Drag-and-drop animation
Skill gap chart
Advanced animations
Extra job roles
```

If time becomes limited, remove Priority 3 rather than risking the core flow.

---

# 23. Fallback Strategy

Because this is a hackathon, the demo must not depend on one fragile external component.

The architecture should allow a fallback if the AI API is unavailable.

Possible fallback:

```text
PDF extraction
      ↓
Basic keyword/rule matching
      ↓
Hardcoded analysis structure
      ↓
Results UI
```

This fallback exists to protect the demo.

However, if the AI API works, the preferred demonstration should show actual AI-assisted resume analysis.

---

# 24. Future Phase 2 Direction

Phase 2 will add persistence and user accounts.

The planned direction is:

```text
Supabase
├── Auth
├── PostgreSQL
└── Storage
```

### Authentication

Users can:

- Sign up
- Log in
- Access their own resumes/analyses

### Storage

Resume PDFs can be stored in a private Supabase Storage bucket.

Example:

```text
resumes/
└── user-id/
    ├── resume-001.pdf
    └── resume-002.pdf
```

### PostgreSQL

Store metadata and analysis history.

Potential tables:

```text
users
resumes
job_roles
resume_analyses
```

Additional normalized tables can be introduced later if required.

---

# 25. Phase 2 Storage/Data Concept

A future resume record could look conceptually like:

```json
{
  "id": "resume_123",
  "user_id": "user_456",
  "file_name": "john_resume.pdf",
  "storage_path": "user_456/resume_123.pdf",
  "created_at": "...",
  "status": "analyzed"
}
```

The database stores metadata and relationships.

The actual PDF belongs in object storage.

---

# 26. Why Supabase Later?

The project data is naturally relational:

```text
User
 ↓
Resume
 ↓
Analysis
 ↓
Job Role
 ↓
Required Skills
```

Therefore PostgreSQL is preferred over a NoSQL database for the long-term product.

Supabase is preferred because it can provide:

- PostgreSQL
- Authentication
- Object/file storage
- Row-level security
- APIs
- One integrated platform

But again:

> **Supabase is NOT part of Phase 1.**

---

# 27. Phase Boundary — IMPORTANT

AI agents working on Phase 1 must understand this boundary:

```text
                 PHASE 1
                    │
        ┌───────────┴───────────┐
        │                       │
    Temporary              Hardcoded
    Processing              Job Data
        │                       │
        └───────────┬───────────┘
                    ↓
              AI Analysis
                    ↓
                 Results
```

Not:

```text
User
 ↓
Auth
 ↓
Database
 ↓
Storage
 ↓
Processing
 ↓
History
```

That is Phase 2.

---

# 28. Definition of Done — Phase 1

Phase 1 is considered complete when a judge can:

1. Open the application.
2. Select/upload a PDF resume.
3. Select a predefined job role.
4. Click Analyze.
5. See the resume processed successfully.
6. See extracted skills.
7. See education.
8. See experience.
9. See a job match score.
10. See matched skills.
11. See missing skills.
12. See improvement suggestions.

The complete journey must work without:

- Login
- Database
- Cloud storage
- Manual developer intervention

---

# 29. Final Phase 1 Architecture

```text
                         USER
                          │
                          ▼
                 ┌─────────────────┐
                 │   Next.js UI    │
                 │                 │
                 │ PDF Upload      │
                 │ Job Selection   │
                 └────────┬────────┘
                          │
                     Temporary
                     File Object
                          │
                          ▼
                 ┌─────────────────┐
                 │ /api/analyze    │
                 └────────┬────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
        ┌──────────────┐    ┌──────────────┐
        │ PDF Parser   │    │ jobs.json    │
        │              │    │              │
        │ Resume Text  │    │ Job Skills   │
        └──────┬───────┘    └──────┬───────┘
               │                   │
               └─────────┬─────────┘
                         ▼
                  ┌──────────────┐
                  │ AI / Matcher │
                  └──────┬───────┘
                         │
                  Structured JSON
                         │
                         ▼
                 ┌─────────────────┐
                 │ Results         │
                 │                 │
                 │ Match Score     │
                 │ Skills          │
                 │ Education       │
                 │ Experience      │
                 │ Missing Skills  │
                 │ Suggestions     │
                 └─────────────────┘
```

---

# 30. Core Principle for All Contributors

Before adding any feature, ask:

> **"Is this required to demonstrate the Phase 1 problem statement?"**

If the answer is no, it should probably be postponed.

The Phase 1 goal is not to build the entire product.

The goal is to build a **clean, reliable, visually polished AI Resume Analyzer MVP that demonstrates the complete problem-to-solution flow within the hackathon timeframe.**

---

## Phase Roadmap

```text
PHASE 1 — HACKATHON MVP
────────────────────────
PDF Upload
    ↓
Temporary Processing
    ↓
Text Extraction
    ↓
Hardcoded Job Roles
    ↓
AI / Rule Analysis
    ↓
Job Comparison
    ↓
Missing Skills
    ↓
Suggestions
    ↓
Results Dashboard


PHASE 2 — PRODUCT
──────────────────
Authentication
    ↓
Supabase
    ├── Auth
    ├── PostgreSQL
    └── Storage
    ↓
Persistent Resumes
    ↓
Analysis History
    ↓
Personal Dashboard
```

**End of Phase 1 Project Context**
