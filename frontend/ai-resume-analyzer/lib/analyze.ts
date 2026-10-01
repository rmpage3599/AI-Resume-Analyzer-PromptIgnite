import { getRole } from "./jobRoles";
import { getMockAnalysis } from "./mockData";
import type {
  AnalysisResult,
  AnalyzeWireResponse,
  EducationEntry,
  ExperienceEntry,
  JobRoleId,
  SkillBar,
  Suggestion,
} from "./types";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type AnalysisErrorCode =
  | "not-pdf"
  | "too-large"
  | "invalid-pdf"
  | "empty-text"
  | "api-failure";

export class AnalysisError extends Error {
  code: AnalysisErrorCode;
  constructor(code: AnalysisErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AnalysisError";
  }
}

function looksLikePdf(buf: ArrayBuffer): boolean {
  const view = new Uint8Array(buf.slice(0, 5));
  if (view.length < 5) return false;
  const signature = String.fromCharCode(...view);
  return signature === "%PDF-";
}

export async function validateResumeFile(file: File): Promise<void> {
  const isPdfType = file.type === "application/pdf";
  const isPdfName = file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfType && !isPdfName) {
    throw new AnalysisError(
      "not-pdf",
      "Please upload a PDF resume.",
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new AnalysisError(
      "too-large",
      "Your resume exceeds the 10MB limit.",
    );
  }
  try {
    const head = await file.slice(0, 5).arrayBuffer();
    if (!looksLikePdf(head)) {
      throw new AnalysisError(
        "invalid-pdf",
        "We couldn't read this PDF. Try uploading another file.",
      );
    }
  } catch (err) {
    if (err instanceof AnalysisError) throw err;
    throw new AnalysisError(
      "invalid-pdf",
      "We couldn't read this PDF. Try uploading another file.",
    );
  }
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumber(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function normalizeEducation(raw: AnalyzeWireResponse["education"]): EducationEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { degree: item, institution: "", period: "" };
      }
      if (item && typeof item === "object") {
        return {
          degree: asString(item.degree),
          institution: asString(item.institution),
          period: asString(item.period),
          detail: item.detail ? asString(item.detail) : undefined,
        };
      }
      return null;
    })
    .filter((x): x is EducationEntry => x !== null);
}

function normalizeExperience(raw: AnalyzeWireResponse["experience"]): ExperienceEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { role: item, company: "", period: "" };
      }
      if (item && typeof item === "object") {
        return {
          role: asString(item.role),
          company: asString(item.company),
          period: asString(item.period),
          note: item.note ? asString(item.note) : undefined,
        };
      }
      return null;
    })
    .filter((x): x is ExperienceEntry => x !== null);
}

function normalizeSuggestions(raw: AnalyzeWireResponse["suggestions"]): Suggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        const [title, ...rest] = item.split(/[:—–-]\s?(.+)/);
        if (rest.length === 0) {
          return { title: item.trim(), detail: "" };
        }
        return {
          title: (title ?? item).trim(),
          detail: rest.join("").trim(),
        };
      }
      if (item && typeof item === "object") {
        return {
          title: asString(item.title),
          detail: asString(item.detail),
        };
      }
      return null;
    })
    .filter(
      (s): s is Suggestion =>
        s !== null && (s.title.length > 0 || s.detail.length > 0),
    );
}

function buildAlignment(
  skills: string[],
  matchedSkills: string[],
  weakSkills: SkillBar[],
): SkillBar[] {
  const matched = matchedSkills.slice(0, 4).map((name, idx) => ({
    name,
    value: 96 - idx * 6,
  }));
  const weakNames = new Set(weakSkills.map((w) => w.name));
  const matchedNames = new Set(matchedSkills);
  const extras = skills
    .filter((s) => !matchedNames.has(s) && !weakNames.has(s))
    .slice(0, Math.max(0, 6 - matched.length - weakSkills.length))
    .map((name, idx) => ({
      name,
      value: 70 - idx * 8,
    }));
  const out: SkillBar[] = [...matched, ...extras, ...weakSkills];
  return out
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function normalizeAnalysis(
  raw: AnalyzeWireResponse,
  roleId: JobRoleId,
  resumeFileName: string,
  resumeSizeBytes: number,
): AnalysisResult {
  const role = getRole(roleId);
  const skills = Array.isArray(raw.skills) ? raw.skills.map(asString) : [];
  const matchedSkills = Array.isArray(raw.matchedSkills)
    ? raw.matchedSkills.map(asString)
    : [];
  const missingSkills = Array.isArray(raw.missingSkills)
    ? raw.missingSkills.map(asString)
    : [];
  const matchScore = Math.max(
    0,
    Math.min(100, Math.round(asNumber(raw.matchScore))),
  );
  const requirements = raw.requirements
    ? {
        matched:
          typeof raw.requirements.matched === "number"
            ? raw.requirements.matched
            : matchedSkills.length,
        total:
          typeof raw.requirements.total === "number"
            ? raw.requirements.total
            : matchedSkills.length + missingSkills.length,
      }
    : {
        matched: matchedSkills.length,
        total: matchedSkills.length + missingSkills.length,
      };
  const alignment = Array.isArray(raw.alignment) ? raw.alignment : [];
  const weakSkills = Array.isArray(raw.weakSkills) ? raw.weakSkills : [];
  const computedAlignment =
    alignment.length > 0
      ? alignment
          .map((b) => ({ name: asString(b.name), value: asNumber(b.value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6)
      : buildAlignment(skills, matchedSkills, weakSkills);

  const gapSet = new Set(missingSkills);
  const gapSkills = [
    ...missingSkills,
    ...weakSkills
      .filter((w) => !gapSet.has(w.name))
      .map((w) => w.name),
  ];

  const assessment = raw.assessment
    ? asString(raw.assessment)
    : `Aligned at ${matchScore}% with ${role.label}.`;

  return {
    candidate: {
      name: asString(raw.candidate?.name),
    },
    targetRole: roleId,
    resumeFileName,
    resumeSizeBytes,
    skills,
    matchedSkills,
    missingSkills,
    matchScore,
    requirements,
    alignment: computedAlignment,
    education: normalizeEducation(raw.education),
    experience: normalizeExperience(raw.experience),
    suggestions: normalizeSuggestions(raw.suggestions),
    assessment,
    weakSkills,
    gapSkills,
  };
}

const MODE: "mock" | "live" =
  (process.env.NEXT_PUBLIC_ANALYZE_MODE as "mock" | "live" | undefined) ??
  "mock";

const MOCK_DELAY_MS = 4400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Submit the resume for analysis.
 * In `live` mode, this POSTs FormData to /api/analyze and normalizes the response.
 * In `mock` mode (default), it returns a role-tuned mock with realistic latency
 * so the loading animation is visible.
 */
export async function analyzeResume(
  file: File,
  roleId: JobRoleId,
): Promise<AnalysisResult> {
  if (MODE === "live") {
    const form = new FormData();
    form.append("resume", file);
    form.append("jobRole", roleId);
    let res: Response;
    try {
      res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });
    } catch {
      throw new AnalysisError(
        "api-failure",
        "Analysis couldn't be completed. Please try again.",
      );
    }
    if (!res.ok) {
      throw new AnalysisError(
        "api-failure",
        "Analysis couldn't be completed. Please try again.",
      );
    }
    const json = (await res.json()) as AnalyzeWireResponse;
    if (!Array.isArray(json.matchedSkills) || !Array.isArray(json.missingSkills)) {
      throw new AnalysisError(
        "empty-text",
        "We couldn't extract readable text from this resume.",
      );
    }
    return normalizeAnalysis(json, roleId, file.name, file.size);
  }

  await delay(MOCK_DELAY_MS);
  return getMockAnalysis(roleId, file.name, file.size);
}

export { MODE as ANALYSIS_MODE };
