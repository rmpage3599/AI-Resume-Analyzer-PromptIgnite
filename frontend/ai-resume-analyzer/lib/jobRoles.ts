import type { JobRole } from "@/types/api";

/**
 * Fallback job-role definitions used ONLY when the backend is unreachable
 * on mount. The backend is the source of truth in normal operation — see
 * `lib/api/jobs.ts`. IDs must match what the backend expects so that
 * selecting a fallback role still produces a meaningful /api/analyze call.
 */
export const FALLBACK_JOB_ROLES: JobRole[] = [
  {
    id: "aiml-engineer",
    title: "AI / ML Engineer",
    requiredSkills: [
      "Python",
      "Machine Learning",
      "NumPy",
      "Pandas",
      "Scikit-learn",
    ],
    preferredSkills: [
      "TensorFlow",
      "PyTorch",
      "Deep Learning",
      "NLP",
      "Computer Vision",
      "Docker",
    ],
    description:
      "Develop and deploy machine learning models, analyze complex datasets, and build intelligent algorithms for production applications.",
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    requiredSkills: ["JavaScript", "TypeScript", "React", "HTML", "CSS"],
    preferredSkills: ["Next.js", "Tailwind CSS", "GraphQL", "REST APIs", "Jest"],
    description:
      "Build high-performance, accessible, and responsive user interfaces for modern web applications.",
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    requiredSkills: ["Python", "Node.js", "SQL", "PostgreSQL", "REST APIs"],
    preferredSkills: ["FastAPI", "Express", "Docker", "Redis", "MongoDB"],
    description:
      "Architect scalable backend services, design robust APIs, and optimize database queries.",
  },
  {
    id: "fullstack-developer",
    title: "Full Stack Developer",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "SQL",
      "Git",
    ],
    preferredSkills: ["Next.js", "PostgreSQL", "Docker", "Tailwind CSS"],
    description:
      "Deliver end-to-end web applications bridging frontend experience with reliable backend services.",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    requiredSkills: [
      "SQL",
      "Excel",
      "Python",
      "Power BI",
      "Data Visualization",
    ],
    preferredSkills: ["Tableau", "Pandas", "NumPy", "Statistics", "ETL"],
    description:
      "Transform raw business data into actionable insights, interactive dashboards, and reports.",
  },
];

export const DEFAULT_JOB_ROLE_ID = FALLBACK_JOB_ROLES[0].id;

export function getFallbackRole(id: string): JobRole | undefined {
  return FALLBACK_JOB_ROLES.find((r) => r.id === id);
}
