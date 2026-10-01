import type { JobRole, JobRoleId } from "./types";

export const JOB_ROLES: JobRole[] = [
  {
    id: "frontend",
    shortLabel: "Frontend",
    label: "Frontend Developer",
    descriptor: "Interfaces, design systems, browser performance",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "HTML",
      "CSS",
      "Accessibility",
      "Testing",
    ],
  },
  {
    id: "backend",
    shortLabel: "Backend",
    label: "Backend Developer",
    descriptor: "APIs, databases, distributed systems",
    requiredSkills: [
      "Python",
      "SQL",
      "REST APIs",
      "Docker",
      "PostgreSQL",
      "Linux",
      "System Design",
      "Testing",
    ],
  },
  {
    id: "fullstack",
    shortLabel: "Full Stack",
    label: "Full Stack Developer",
    descriptor: "End-to-end product delivery across stack",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Next.js",
      "SQL",
      "Docker",
      "REST APIs",
      "Git",
    ],
  },
  {
    id: "ai-ml",
    shortLabel: "AI / ML",
    label: "AI / ML Engineer",
    descriptor: "Model training, pipelines, deployment",
    requiredSkills: [
      "Python",
      "Pandas",
      "NumPy",
      "Machine Learning",
      "scikit-learn",
      "SQL",
      "Statistics",
      "TensorFlow",
      "PyTorch",
    ],
  },
  {
    id: "data-analyst",
    shortLabel: "Data Analyst",
    label: "Data Analyst",
    descriptor: "Metrics, SQL, reporting & insight",
    requiredSkills: [
      "SQL",
      "Python",
      "Pandas",
      "Statistics",
      "Data Visualization",
      "Excel",
      "Tableau",
      "Communication",
    ],
  },
];

export function getRole(id: JobRoleId): JobRole {
  return JOB_ROLES.find((r) => r.id === id) ?? JOB_ROLES[3];
}
