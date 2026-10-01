# Resumind — AI Resume Intelligence (Frontend)

Phase 1 MVP frontend for an AI-powered resume analyzer.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- No backend, no database — everything is processed in-memory.

## Run

```bash
npm install
npm run dev
# http://localhost:3000
```

## Architecture

```
app/
  layout.tsx            Root layout, fonts (Geist), global background
  page.tsx              Renders the client <App /> orchestrator
  globals.css           Tailwind v4 theme + keyframes + component classes

components/
  App.tsx               Stage switcher (analyze ↔ results)
  background/
    TechnicalBackground.tsx   Animated grid, curved data lines, particles
  core/
    Icons.tsx           Inline SVG icon set
  shell/
    BrandMark.tsx
    TopNav.tsx          RESUMIND · Analyze / Dashboard / History
  landing/
    LandingView.tsx     Hero + workbench panel (upload + role + CTA)
    UploadPanel.tsx     Drag-drop, validation, selected-file state
    RoleSelect.tsx      Accessible custom listbox (5 roles)
    AnalyzingView.tsx   5-stage processing animation
    PipelineStrip.tsx
  dashboard/
    Sidebar.tsx         5-item analytics sidebar with scroll-spy
    DashboardTopBar.tsx
    ScorePanel.tsx      Animated ring + count-up + verdict
    MatchedSkillsCard.tsx
    MissingSkillsCard.tsx
    SkillAlignmentPanel.tsx  Horizontal skill bars
    EducationPanel.tsx
    ExperiencePanel.tsx Vertical timeline
    SkillGapsPanel.tsx
    SuggestionsPanel.tsx    Numbered recommendations
    OverallAssessment.tsx   Downloadable text report (client-side)
    ResultsDashboard.tsx

lib/
  cn.ts                 Classname helper
  types.ts              Wire + UI types
  jobRoles.ts           5 predefined Phase 1 roles
  mockData.ts           Per-role realistic mock analysis
  analyze.ts            API client + normalizer + validation
```

## Connecting the real `/api/analyze` endpoint

Set in `.env.local`:

```bash
NEXT_PUBLIC_ANALYZE_MODE=live
```

When set to `live`, the frontend POSTs the resume to `/api/analyze`:

```
POST /api/analyze
Content-Type: multipart/form-data
Fields:
  - resume:  the PDF file
  - jobRole: one of frontend | backend | fullstack | ai-ml | data-analyst
```

Expected response (loose — see `lib/types.ts → AnalyzeWireResponse`):

```jsonc
{
  "candidate":   { "name": "Jordan Mercer" },
  "skills":      ["Python", "Pandas", ...],
  "matchedSkills": [...],
  "missingSkills": [...],
  "matchScore":  78,
  "suggestions": ["Title: detail", { "title": "...", "detail": "..." }],
  "education":   [{ "degree": "...", "institution": "...", "period": "..." }],
  "experience":  [{ "role": "...", "company": "...", "period": "...", "note": "..." }],
  "alignment":   [{ "name": "Python", "value": 95 }, ...],   // optional
  "weakSkills":  [{ "name": "Deep Learning", "value": 30 }], // optional
  "assessment":  "...",                                       // optional
  "requirements": { "matched": 7, "total": 9 }                // optional
}
```

`lib/analyze.ts → normalizeAnalysis` accepts both string and object suggestions,
fills in derived fields when the API omits them, and surfaces a typed
`AnalysisResult` to the UI.

In `mock` mode (default), the UI uses deterministic, role-tuned demo data so
the loading animation and dashboard visuals can be shown during the demo
without a backend.
