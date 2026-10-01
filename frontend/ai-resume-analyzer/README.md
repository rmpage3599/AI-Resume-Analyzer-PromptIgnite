# Resumind — AI Resume Intelligence (Frontend)

Phase 1 MVP frontend for an AI-powered resume analyzer.
Talks to the Python FastAPI backend documented in `/API_INTEGRATION_GUIDE.md`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Light aeroglass visual system (white/translucent surfaces on a soft blue background)
- No permanent file storage. No database. No auth. UI-only.

## Routes

| Path        | Purpose                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `/`         | Redirects to `/analyze`                                                  |
| `/analyze`  | Upload, role select, analyze action                                      |
| `/results`  | Match score, matched / missing skills, recommendations, **Enhance CTA**   |
| `/enhance`  | Presentation-only enhancement (typography / spacing / structure review)  |

`/enhance` is reached from the "Make your resume presentation stronger"
card at the bottom of `/results`. It is gated on an existing analysis:
without one, the page redirects to `/analyze`.

The latest analysis result is handed between routes through
`sessionStorage` (`lib/resultStore.ts`) — per-tab, not permanent storage.

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
  globals.css             Tailwind v4 theme + glass utilities + keyframes + print stylesheet
  analyze/page.tsx        Renders <AnalyzeRoute />
  results/page.tsx        Renders <ResultsRoute />
  enhance/page.tsx        Renders <EnhanceRoute />

components/
  background/
    TechnicalBackground.tsx   Faint grid + flowing curves + 9 particles
  core/Icons.tsx          Inline SVG icon set
  shell/
    BrandMark.tsx
    TopNav.tsx            Analyze / Results + Analyze Resume CTA / mobile menu
  landing/
    LandingView.tsx
    UploadPanel.tsx
    RoleSelect.tsx
    AnalyzingView.tsx
  dashboard/
    ResultHeader.tsx
    ScorePanel.tsx
    MatchedSkillsCard.tsx
    MissingSkillsCard.tsx
    SkillAlignmentPanel.tsx
    EducationPanel.tsx
    ExperiencePanel.tsx
    SuggestionsPanel.tsx
    StarRewritesPanel.tsx
    OverallAssessment.tsx
    EnhancementCard.tsx   CTA that links to /enhance
    ResultsDashboard.tsx
  enhance/
    EnhancePage.tsx       Hero + summary + issues + style picker + before/after + apply
    EnhancementProgress.tsx  4-stage in-place scanning panel
    EnhancementSummary.tsx   Per-category statuses (no fake %)
    EnhancementIssueList.tsx  List of detected formatting observations
    StylePresetSelector.tsx  Professional / Minimal / Modern radios
    BeforeAfterPreview.tsx    Two A4 document panels side-by-side
    ResumePreview.tsx        The A4 document (flawed + clean variants)
    EnhancedResumeView.tsx    Post-apply screen with Print-to-PDF + back
    enhanceData.ts            Deterministic presentation analysis
  routes/
    AnalyzeRoute.tsx
    ResultsRoute.tsx
    EnhanceRoute.tsx
  ui/Notice.tsx           ErrorNotice

lib/
  api/
    client.ts             jsonFetch + multipartFetch
    config.ts             BACKEND_URL, MAX_FILE_BYTES, ACCEPTED_*
    errors.ts             ApiError + parseError
    health.ts             checkBackendHealth
    jobs.ts               fetchJobRoles
    resume.ts             analyzeResume(file, roleId)
    enhance.ts            enhanceResume(analysis)  → deterministic
    index.ts
  validation.ts           Client-side file validation
  cn.ts                   Classname helper
  jobRoles.ts             FALLBACK_JOB_ROLES (offline fallback only)
  resultStore.ts          sessionStorage helpers for /analyze ↔ /results
  enhancementStore.ts     sessionStorage helpers for /enhance (style + cached analysis)
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
  atsRubric?: AtsRubric;
  starRewrites?: StarRewrite[];
}
```

Documented backend errors are surfaced inline by reading the response
`detail` field. No retry, no proxying, no transformation — the UI consumes
the contract directly.

## Resume Enhancement

The enhancement feature is **presentation-only**. It inspects the existing
analysis result and reports deterministic formatting observations:

- **Typography**: name presence and heading clarity
- **Spacing**: experience density and section rhythm
- **Structure**: presence of Experience / Education / Skills sections
- **Consistency**: date formats, capitalization, bullet style

Statuses are reported qualitatively (`Good` / `Needs adjustment` /
`Needs improvement`). **No fake percentages** are invented — the UI only
displays numbers when they are real measurements from the backend.

The `/enhance` route also offers a side-by-side before/after preview
rendered as A4-shaped document panels using the same source data. Both
panels display the same content; the "after" panel uses a clean preset
(Professional / Minimal / Modern) for typography, spacing and hierarchy.
A "Download Enhanced Resume" button triggers the browser's print-to-PDF
on the clean preset (the print-only stylesheet in `globals.css` renders
only the resume at A4 size, hidden offscreen until then).

**Content-safety rule:** the enhancement feature never invents, edits or
removes content. It only derives observations from the existing analysis
result. No client-side re-parsing of the resume PDF.

## Verification

After starting both servers:

```bash
node scripts/test-api.mjs
```

Exercises `/api/health`, `/api/jobs`, a valid `/api/analyze` POST, plus
the documented error responses (invalid role, bad extension, empty file,
oversized file).
