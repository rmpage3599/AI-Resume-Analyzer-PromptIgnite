import type {
  AnalysisResult,
  EducationEntry,
  ExperienceEntry,
  JobRoleId,
} from "./types";

const RESUME_SKILLS = [
  "Python",
  "Pandas",
  "NumPy",
  "Machine Learning",
  "scikit-learn",
  "SQL",
  "Statistics",
  "Data Visualization",
  "JavaScript",
  "React",
  "Git",
  "Docker",
  "REST APIs",
  "Excel",
];

const CANDIDATE = { name: "Jordan Mercer" };

const EDUCATION: EducationEntry[] = [
  {
    degree: "B.Tech in Computer Engineering",
    institution: "Stellar Institute of Technology",
    period: "2020 — 2024",
    detail: "CGPA 8.7 · Coursework in DSA, DBMS, ML, Distributed Systems",
  },
];

const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "Software Developer",
    company: "Northbeam Analytics",
    period: "Jan 2022 — Present",
    note: "Built Python data pipelines and an internal analytics dashboard used by 60+ engineers.",
  },
  {
    role: "Engineering Intern",
    company: "Atlas Insights",
    period: "Jun 2021 — Dec 2021",
    note: "Automated weekly reporting workflows; reduced manual effort by ~40%.",
  },
];

interface RoleProfile {
  matchedSkills: string[];
  missingSkills: string[];
  weakSkills: { name: string; value: number }[];
  alignment: { name: string; value: number }[];
  matchScore: number;
  suggestions: { title: string; detail: string }[];
  assessment: string;
}

const ROLE_PROFILES: Record<JobRoleId, RoleProfile> = {
  "ai-ml": {
    matchedSkills: [
      "Python",
      "Pandas",
      "NumPy",
      "Machine Learning",
      "scikit-learn",
      "SQL",
      "Statistics",
    ],
    missingSkills: ["TensorFlow", "PyTorch"],
    weakSkills: [
      { name: "TensorFlow", value: 40 },
      { name: "Deep Learning", value: 30 },
    ],
    alignment: [
      { name: "Python", value: 95 },
      { name: "Machine Learning", value: 90 },
      { name: "Pandas", value: 85 },
      { name: "NumPy", value: 82 },
      { name: "TensorFlow", value: 40 },
      { name: "Deep Learning", value: 30 },
    ],
    matchScore: 78,
    suggestions: [
      {
        title: "Learn TensorFlow fundamentals",
        detail:
          "Build a small classification model end-to-end. Move from scikit-learn to Keras and tf.data pipelines.",
      },
      {
        title: "Build a deep learning project",
        detail:
          "Ship a CNN or transformer notebook on a public dataset. Focus on training loops, eval and reproducibility.",
      },
      {
        title: "Add model deployment experience",
        detail:
          "Wrap a trained model behind a REST endpoint using FastAPI and Docker; track inference latency.",
      },
    ],
    assessment:
      "You have a strong foundation for AI / ML Engineering. Strengthening your deep learning and model deployment experience would lift your alignment into the top tier.",
  },
  frontend: {
    matchedSkills: ["JavaScript", "React", "Git", "REST APIs", "HTML", "CSS"],
    missingSkills: ["TypeScript", "Testing", "Accessibility"],
    weakSkills: [{ name: "TypeScript", value: 35 }],
    alignment: [
      { name: "JavaScript", value: 88 },
      { name: "React", value: 82 },
      { name: "CSS", value: 75 },
      { name: "HTML", value: 80 },
      { name: "TypeScript", value: 35 },
      { name: "Testing", value: 28 },
    ],
    matchScore: 64,
    suggestions: [
      {
        title: "Adopt TypeScript across projects",
        detail:
          "Convert one component library to TypeScript. Use strict mode and shared type definitions for props and API contracts.",
      },
      {
        title: "Add component testing coverage",
        detail:
          "Write Vitest + Testing Library tests for your top five reusable components. Target render, interaction and a11y.",
      },
      {
        title: "Deepen accessibility knowledge",
        detail:
          "Audit two existing screens with axe and keyboard-only navigation. Fix contrast, focus order and ARIA roles.",
      },
    ],
    assessment:
      "You have solid React fundamentals. Investing in TypeScript, accessibility and testing discipline will close the gap with senior frontend roles.",
  },
  backend: {
    matchedSkills: [
      "Python",
      "SQL",
      "REST APIs",
      "Docker",
      "Git",
      "Statistics",
    ],
    missingSkills: ["PostgreSQL", "System Design", "Linux"],
    weakSkills: [{ name: "PostgreSQL", value: 45 }],
    alignment: [
      { name: "Python", value: 92 },
      { name: "SQL", value: 80 },
      { name: "REST APIs", value: 78 },
      { name: "Docker", value: 70 },
      { name: "PostgreSQL", value: 45 },
      { name: "System Design", value: 32 },
    ],
    matchScore: 67,
    suggestions: [
      {
        title: "Deepen PostgreSQL expertise",
        detail:
          "Model a real-world schema with indexes, constraints and migrations. Practice query plans and connection pooling.",
      },
      {
        title: "Practice system design",
        detail:
          "Design two back-of-envelope systems (URL shortener, rate limiter). Focus on trade-offs and bottlenecks.",
      },
      {
        title: "Strengthen Linux fluency",
        detail:
          "Comfort with systemd, networking, ssh and basic shell tooling signals production-readiness for backend roles.",
      },
    ],
    assessment:
      "Your Python and API experience is a strong base. Closing PostgreSQL and system design gaps will make you competitive for backend roles.",
  },
  fullstack: {
    matchedSkills: [
      "JavaScript",
      "React",
      "Python",
      "SQL",
      "REST APIs",
      "Git",
    ],
    missingSkills: ["TypeScript", "Next.js", "Node.js"],
    weakSkills: [
      { name: "TypeScript", value: 38 },
      { name: "Next.js", value: 42 },
    ],
    alignment: [
      { name: "JavaScript", value: 86 },
      { name: "React", value: 80 },
      { name: "Python", value: 88 },
      { name: "SQL", value: 76 },
      { name: "REST APIs", value: 78 },
      { name: "Next.js", value: 42 },
    ],
    matchScore: 62,
    suggestions: [
      {
        title: "Ship a Next.js project end-to-end",
        detail:
          "Build a small app with server components, route handlers and a database. Focus on data flow between client and server.",
      },
      {
        title: "Adopt TypeScript for new code",
        detail:
          "Use TypeScript on the Next.js project above. Type API contracts and share definitions across frontend and backend.",
      },
      {
        title: "Add Node.js backend experience",
        detail:
          "Replace one Python service with a Node.js + Express or Fastify version. Compare ergonomics and runtime characteristics.",
      },
    ],
    assessment:
      "You are comfortable on both sides of the stack. Adding TypeScript and a modern Next.js project will round out your full stack profile.",
  },
  "data-analyst": {
    matchedSkills: [
      "SQL",
      "Python",
      "Pandas",
      "Statistics",
      "Data Visualization",
      "Excel",
    ],
    missingSkills: ["Tableau", "Communication"],
    weakSkills: [{ name: "Tableau", value: 30 }],
    alignment: [
      { name: "SQL", value: 92 },
      { name: "Python", value: 86 },
      { name: "Pandas", value: 88 },
      { name: "Statistics", value: 78 },
      { name: "Data Visualization", value: 80 },
      { name: "Tableau", value: 30 },
    ],
    matchScore: 84,
    suggestions: [
      {
        title: "Build a Tableau portfolio",
        detail:
          "Publish three interactive dashboards on Tableau Public tied to a public dataset. Add filters, parameters and tooltips.",
      },
      {
        title: "Write clear analytical narratives",
        detail:
          "Document insights with context, methodology and limitations. Treat each report as a short story for stakeholders.",
      },
      {
        title: "Practice stakeholder communication",
        detail:
          "Run a 15-minute walkthrough of an analysis for a non-technical audience. End with decisions enabled, not just numbers.",
      },
    ],
    assessment:
      "You are an excellent fit for data analyst roles. Adding Tableau fluency and stronger business storytelling will set you apart.",
  },
};

export function getMockAnalysis(
  roleId: JobRoleId,
  resumeFileName: string,
  resumeSizeBytes: number,
): AnalysisResult {
  const p = ROLE_PROFILES[roleId];
  const requirements = {
    matched: p.matchedSkills.length,
    total: p.matchedSkills.length + p.missingSkills.length,
  };
  const gapSet = new Set(p.missingSkills);
  const gapSkills = [
    ...p.missingSkills,
    ...p.weakSkills.filter((w) => !gapSet.has(w.name)).map((w) => w.name),
  ];
  return {
    candidate: CANDIDATE,
    targetRole: roleId,
    resumeFileName,
    resumeSizeBytes,
    skills: RESUME_SKILLS,
    matchedSkills: p.matchedSkills,
    missingSkills: p.missingSkills,
    matchScore: p.matchScore,
    requirements,
    alignment: p.alignment,
    education: EDUCATION,
    experience: EXPERIENCE,
    suggestions: p.suggestions,
    assessment: p.assessment,
    weakSkills: p.weakSkills,
    gapSkills,
  };
}
