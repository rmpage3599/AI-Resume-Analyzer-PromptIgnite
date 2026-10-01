# Resumind — AI Resume Intelligence (Frontend)

Phase 1 MVP frontend for an AI-powered resume analyzer.
Talks to the Python FastAPI backend documented in `/API_INTEGRATION_GUIDE.md`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Light aeroglass visual system (white/translucent surfaces on a soft blue background)
- No permanent file storage. No database. No auth. UI-only.

## Routes

| Path        | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `/`         | Redirects to `/analyze`                                |
| `/analyze`  | Upload, role select, analyze action                    |
| `/results`  | Match score, matched / missing skills, recommendations |

The latest analysis result is handed between routes through `sessionStorage`
(`lib/resultStore.ts`) — per-tab, not permanent storage.

## Run

In one terminal start the backend (FastAPI):

```bash
cd ../backend
python -m uvicorn main:app --port 8000 --host 127.0.0.1
```

In another terminal start the frontend:

```bash
npm install
npm run dev
# http://localhost:3000
```

The frontend reads `NEXT_PUBLIC_BACKEND_URL` (defaults to
`http://localhost:8000`); see `.env.example`. If the backend is unreachable on
mount the role dropdown falls back to a small built-in list and a banner
informs the user; the Analyze action still requires the backend.

## Architecture

```
app/
  layout.tsx              Root layout, fonts (Geist), global background
  page.tsx                Redirects to /analyze
  globals.css             Tailwind v4 theme + glass utilities + keyframes
  analyze/page.tsx        Renders <AnalyzeRoute />
  results/page.tsx        Renders <ResultsRoute />

components/
  App.tsx                 (removed — routes replaced it)
  background/
    TechnicalBackground.tsx   Faint grid + flowing curves + 9 particles
  core/Icons.tsx          Inline SVG icon set
  shell/
    BrandMark.tsx         RESUMIND · AI RESUME INTELLIGENCE
    TopNav.tsx            Analyze / Results + Analyze Resume CTA / mobile menu
  landing/
    LandingView.tsx       Two-column hero + glass workbench panel
    UploadPanel.tsx       Drag-drop / Choose PDF
    RoleSelect.tsx        Accessible custom listbox (populated from /api/jobs)
    AnalyzingView.tsx     4-stage in-place progress panel
  dashboard/
    ResultHeader.tsx      Page title + "New analysis" / "Analyze another"
    ScorePanel.tsx        Light circular match indicator
    MatchedSkillsCard.tsx
    MissingSkillsCard.tsx
    SkillAlignmentPanel.tsx   Horizontal bars (0 → final) derived from backend
    EducationPanel.tsx
    ExperiencePanel.tsx   Vertical timeline
    SuggestionsPanel.tsx  Numbered recommendations
    OverallAssessment.tsx Verdict + downloadable text report
    ResultsDashboard.tsx
  routes/
    AnalyzeRoute.tsx      /analyze route orchestrator
    ResultsRoute.tsx      /results route orchestrator
  ui/Notice.tsx           ErrorNotice

lib/
  api/                    Centralized backend client (BACKEND_URL, errors, jobs, resume, health)
  validation.ts           Client-side file validation
  cn.ts                   Classname helper
  jobRoles.ts             FALLBACK_JOB_ROLES (offline fallback only)
  resultStore.ts          sessionStorage helpers for /analyze ↔ /results handoff
  types.ts                Re-exports wire types + small UI helpers

types/api.ts              Backend wire types (single source of truth)
```

## Connecting the real backend

Set in `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

The frontend POSTs to `/api/analyze` with `multipart/form-data`:

```
POST ${NEXT_PUBLIC_BACKEND_URL}/api/analyze
Content-Type: multipart/form-data   (browser sets boundary)

resume:  File  (.pdf or .docx, ≤ 5 MB)
jobRole: string  (one of the ids returned by /api/jobs)
```

Expected response shape (see `types/api.ts`):

```ts
{
  id: string;
  databaseBackend: "supabase" | "sqlite";
  candidate: { name: string };
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  education: { degree, institution, duration }[];
  experience: { role, company, duration }[];
  suggestions: string[];
  createdAt?: string;
  fileName?: string;
  jobRoleId?: string;
}
```

Documented backend errors are surfaced inline by reading the response
`detail` field. No retry, no proxying, no transformation — the UI consumes
the contract directly.

## Verification

After starting both servers:

```bash
node scripts/test-api.mjs
```

Exercises `/api/health`, `/api/jobs`, a valid `/api/analyze` POST, plus
the documented error responses (invalid role, bad extension, empty file,
oversized file).
