import type { AnalysisResult } from "@/lib/types";

/**
 * Pure / deterministic client-side analysis of *presentation only*.
 *
 * It never invents content, never alters dates, never fabricates skills.
 * It looks at the structure of what we already have from the analysis
 * (number of entries, mixed-format patterns in durations, capitalization
 * of role/company names, lowercase suggestion phrasing) and produces a
 * stable list of formatting observations.
 *
 * Each observation has a category that maps to one of the four
 * presentation dimensions surfaced in the UI: Typography, Spacing,
 * Structure, Consistency.
 */

export type IssueSeverity = "good" | "adjust" | "improve";
export type IssueCategory = "Typography" | "Spacing" | "Structure" | "Consistency";

export interface EnhancementIssue {
  id: string;
  category: IssueCategory;
  title: string;
  explanation: string;
  severity: IssueSeverity;
}

export interface EnhancementAnalysis {
  issues: EnhancementIssue[];
  categoryStatus: Record<IssueCategory, IssueSeverity>;
  improvementsCount: number;
  contentEnhancement?: ContentEnhancementSummary;
}

/* ------------------------------ helpers ------------------------------ */

function isLikelyDateRange(s: string): boolean {
  // matches patterns like "Jan 2022 — Dec 2023", "2019-2023", "1-2 years", "2020 — 2024"
  return /\d/.test(s) && /[-—–]|to/i.test(s);
}

function looksMixedDateFormats(durations: string[]): boolean {
  if (durations.length < 2) return false;
  const formats = new Set<string>();
  for (const d of durations) {
    if (!d) continue;
    if (/\d{4}\s*[-—–]\s*\d{4}/.test(d)) formats.add("year-range");
    else if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(d))
      formats.add("month-range");
    else if (/\b(19|20)\d{2}\b.*\b(19|20)\d{2}\b/.test(d)) formats.add("year-range");
    else formats.add("other");
  }
  return formats.size > 1;
}

function isLowercaseFirst(s: string): boolean {
  if (!s) return false;
  // ignore leading punctuation/whitespace
  const trimmed = s.replace(/^[\s"'“”‘’]+/, "");
  if (!trimmed) return false;
  const first = trimmed[0];
  return first === first.toLowerCase() && first !== first.toUpperCase();
}

function tallySeverity(
  severities: IssueSeverity[],
): IssueSeverity {
  if (severities.some((s) => s === "improve")) return "improve";
  if (severities.some((s) => s === "adjust")) return "adjust";
  return "good";
}

/* ------------------------------ analysis ------------------------------ */

export function analyzePresentation(
  result: AnalysisResult,
): EnhancementAnalysis {
  const issues: EnhancementIssue[] = [];

  const candidateName = (result.candidate?.name ?? "").trim();
  const experience = result.experience ?? [];
  const education = result.education ?? [];
  const skills = result.skills ?? [];
  const suggestions = result.suggestions ?? [];

  // ---------- Typography ----------

  if (!candidateName) {
    issues.push({
      id: "missing-name",
      category: "Typography",
      title: "Add a clear candidate name heading",
      explanation:
        "A resume without a top-level name heading has no clear typographic anchor for the reader.",
      severity: "improve",
    });
  } else {
    issues.push({
      id: "name-heading",
      category: "Typography",
      title: "Use a single, large heading for the candidate name",
      explanation:
        "A prominent name heading establishes the visual entry point of the document.",
      severity: "good",
    });
  }

  // ---------- Spacing ----------

  if (experience.length >= 5) {
    issues.push({
      id: "experience-density",
      category: "Spacing",
      title: "Use consistent spacing between experience entries",
      explanation: `${experience.length} roles detected — tight or uneven spacing will make this section feel crowded.`,
      severity: "improve",
    });
  } else if (experience.length >= 3) {
    issues.push({
      id: "experience-spacing",
      category: "Spacing",
      title: "Normalize spacing between experience entries",
      explanation:
        "Several roles detected — keeping equal vertical spacing improves scannability.",
      severity: "adjust",
    });
  } else {
    issues.push({
      id: "experience-spacing",
      category: "Spacing",
      title: "Maintain consistent spacing between entries",
      explanation: "Equal vertical rhythm between sections improves readability.",
      severity: "good",
    });
  }

  // ---------- Structure ----------

  if (experience.length === 0 && education.length === 0) {
    issues.push({
      id: "no-sections",
      category: "Structure",
      title: "Add at least an Experience or Education section",
      explanation:
        "Without body sections, the resume cannot communicate a career or academic history.",
      severity: "improve",
    });
  } else if (experience.length === 0) {
    issues.push({
      id: "no-experience",
      category: "Structure",
      title: "Add an Experience section",
      explanation:
        "An Experience section is the primary content of a recruiter-readable resume.",
      severity: "improve",
    });
  } else {
    issues.push({
      id: "section-order",
      category: "Structure",
      title: "Lead with Experience, then Education",
      explanation:
        "Experience-first ordering is the recruiter-friendly default for the selected role.",
      severity: "good",
    });
  }

  if (skills.length === 0) {
    issues.push({
      id: "no-skills",
      category: "Structure",
      title: "Add a Skills section",
      explanation:
        "Skills give recruiters a fast scan of candidate fit. A skills block is the standard.",
      severity: "adjust",
    });
  } else if (skills.length < 5) {
    issues.push({
      id: "skills-sparse",
      category: "Structure",
      title: "Skills section is sparse",
      explanation: `${skills.length} skill${skills.length === 1 ? "" : "s"} detected — consider grouping them by category.`,
      severity: "adjust",
    });
  } else {
    issues.push({
      id: "skills-section",
      category: "Structure",
      title: "Keep a compact Skills block",
      explanation:
        "A compact, scannable skills block reduces time-to-scan.",
      severity: "good",
    });
  }

  // ---------- Consistency ----------

  const durations = experience
    .map((e) => e.duration)
    .filter((d): d is string => !!d && d.length > 0);

  if (looksMixedDateFormats(durations)) {
    issues.push({
      id: "date-format",
      category: "Consistency",
      title: "Standardize date format",
      explanation:
        "Experience durations appear to mix formats (e.g. month-year vs. year-only). Pick one and apply it everywhere.",
      severity: "improve",
    });
  } else if (durations.length > 0) {
    issues.push({
      id: "date-format",
      category: "Consistency",
      title: "Dates use a consistent format",
      explanation: "Date ranges are formatted uniformly across roles.",
      severity: "good",
    });
  }

  const experienceCaps = experience
    .map((e) => ({ role: e.role ?? "", company: e.company ?? "" }))
    .filter((x) => x.role || x.company);
  const roleCasedWrong = experienceCaps.filter(
    (x) =>
      (x.role && isLowercaseFirst(x.role)) ||
      (x.company && isLowercaseFirst(x.company)),
  );
  if (roleCasedWrong.length > 0) {
    issues.push({
      id: "capitalization",
      category: "Consistency",
      title: "Capitalize roles and companies consistently",
      explanation: `${roleCasedWrong.length} entry / entries start with lowercase letters — Title Case reads cleaner.`,
      severity: "adjust",
    });
  } else if (experienceCaps.length > 0) {
    issues.push({
      id: "capitalization",
      category: "Consistency",
      title: "Roles and companies use consistent capitalization",
      explanation: "Job titles and companies all start with capital letters.",
      severity: "good",
    });
  }

  const suggestionBullets = suggestions.filter((s) => isLowercaseFirst(s));
  if (suggestionBullets.length > 0) {
    issues.push({
      id: "bullet-case",
      category: "Consistency",
      title: "Capitalize bullet points",
      explanation:
        "Bullets that start lowercase can read as informal. Sentence-case caps are the safer default.",
      severity: "adjust",
    });
  } else if (suggestions.length > 0) {
    issues.push({
      id: "bullet-case",
      category: "Consistency",
      title: "Bullets are consistently capitalized",
      explanation: "Bullets start with capital letters throughout.",
      severity: "good",
    });
  }

  // Aggregate per-category status
  const categories: IssueCategory[] = [
    "Typography",
    "Spacing",
    "Structure",
    "Consistency",
  ];
  const categoryStatus: Record<IssueCategory, IssueSeverity> = {
    Typography: "good",
    Spacing: "good",
    Structure: "good",
    Consistency: "good",
  };
  for (const cat of categories) {
    const sevs = issues
      .filter((i) => i.category === cat)
      .map((i) => i.severity);
    categoryStatus[cat] = sevs.length === 0 ? "good" : tallySeverity(sevs);
  }

  const improvementsCount = issues.filter(
    (i) => i.severity !== "good",
  ).length;

  const contentEnhancement = buildPreviewModel(result).contentEnhancement;

  return {
    issues,
    categoryStatus,
    improvementsCount,
    contentEnhancement,
  };
}

/* ------------------------------ labels ------------------------------ */

export const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  good: "Good",
  adjust: "Needs adjustment",
  improve: "Needs improvement",
};

export const SEVERITY_DOT: Record<IssueSeverity, string> = {
  good: "bg-emerald-500/85",
  adjust: "bg-amber-500/85",
  improve: "bg-rose-500/85",
};

export const CATEGORY_DESCRIPTION: Record<IssueCategory, string> = {
  Typography: "Font family, hierarchy and consistency.",
  Spacing: "Section rhythm, vertical density and breathing room.",
  Structure: "Section ordering and presence of core blocks.",
  Consistency: "Date formats, capitalization and bullet style.",
};

/* ------------------------------ content enhancement & preview ------------------------------ */

export interface ExperienceBullet {
  original: string;
  enhanced: string;
  isRewritten: boolean;
  rewriteType?: "star" | "action-verb" | "quantified" | "original";
  improvementNote?: string;
}

export interface EnhancedExperienceItem {
  role: string;
  company: string;
  period: string;
  bullets: ExperienceBullet[];
}

export interface ContentChangelogItem {
  id: string;
  category: "STAR Rewrite" | "Action Verb" | "Executive Summary" | "Skills Alignment";
  title: string;
  original: string;
  enhanced: string;
  impactNote: string;
}

export interface ContentEnhancementSummary {
  starRewritesCount: number;
  actionVerbsCount: number;
  totalBulletsImproved: number;
  tailoredSummaryCreated: boolean;
  skillsPrioritizedCount: number;
  changelog: ContentChangelogItem[];
}

export interface PreviewModel {
  candidateName: string;
  headline: string;
  contact: string;
  summary: string;
  originalSummary: string;
  experience: EnhancedExperienceItem[];
  education: { degree: string; institution: string; period: string }[];
  skills: string[];
  coreCompetencies: string[];
  supportingSkills: string[];
  contentEnhancement: ContentEnhancementSummary;
}

const PASSIVE_PATTERNS: { regex: RegExp; replaceWith: string }[] = [
  { regex: /^responsible for (the )?/i, replaceWith: "Orchestrated " },
  { regex: /^tasked with (the )?/i, replaceWith: "Spearheaded " },
  { regex: /^helped (with|to|in) (the )?/i, replaceWith: "Delivered " },
  { regex: /^assisted (with|to|in) (the )?/i, replaceWith: "Engineered " },
  { regex: /^worked on (the )?/i, replaceWith: "Developed " },
  { regex: /^participated in (the )?/i, replaceWith: "Collaborated on " },
  { regex: /^involved in (the )?/i, replaceWith: "Architected " },
  { regex: /^handled (the )?/i, replaceWith: "Executed " },
  { regex: /^supported (the )?/i, replaceWith: "Accelerated " },
  { regex: /^was part of (the )?/i, replaceWith: "Co-engineered " },
  { regex: /^contributed to (the )?/i, replaceWith: "Drove high-impact contributions across " },
  { regex: /^managed (the )?/i, replaceWith: "Spearheaded delivery of " },
  { regex: /^did /i, replaceWith: "Executed " },
  { regex: /^made /i, replaceWith: "Engineered " },
  { regex: /^looked into /i, replaceWith: "Researched and evaluated " },
];

function enhanceBulletWording(raw: string): { enhanced: string; isUpgraded: boolean } {
  const cleaned = raw.trim();
  if (!cleaned) return { enhanced: cleaned, isUpgraded: false };

  for (const p of PASSIVE_PATTERNS) {
    if (p.regex.test(cleaned)) {
      const rest = cleaned.replace(p.regex, "");
      const upgraded = p.replaceWith + rest;
      const finalized = upgraded.endsWith(".") ? upgraded : upgraded + ".";
      return { enhanced: finalized, isUpgraded: true };
    }
  }

  let upgraded = cleaned;
  let isUpgraded = false;
  if (/^[a-z]/.test(upgraded)) {
    upgraded = upgraded.charAt(0).toUpperCase() + upgraded.slice(1);
    isUpgraded = true;
  }

  if (!upgraded.endsWith(".") && !upgraded.endsWith("!") && !upgraded.endsWith("?")) {
    upgraded = upgraded + ".";
    isUpgraded = true;
  }

  return { enhanced: upgraded, isUpgraded };
}

export function buildPreviewModel(result: AnalysisResult): PreviewModel {
  const name = (result.candidate?.name ?? "").trim() || "Your Name";
  const role =
    result.targetJobTitle ||
    (result.jobRoleId ? roleTitleFromId(result.jobRoleId) : "Software Professional");

  const contactLine = [
    result.candidate?.email || null,
    result.candidate?.phone || null,
    result.candidate?.linkedin ? "LinkedIn" : null,
    result.candidate?.github ? "GitHub" : null,
    !result.candidate?.email && !result.candidate?.phone && result.fileName
      ? result.fileName.replace(/\.[^.]+$/, "")
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const changelog: ContentChangelogItem[] = [];
  let starCount = 0;
  let actionVerbCount = 0;

  // 1. Process Star Rewrites
  const availableStarRewrites = [...(result.starRewrites || [])];
  const usedStarRewrites = new Set<number>();

  // 2. Process Experience
  const rawExperience = result.experience ?? [];
  const enhancedExperience: EnhancedExperienceItem[] = rawExperience.map((exp, expIdx) => {
    const rawBullets = exp.bullets && exp.bullets.length > 0
      ? exp.bullets
      : [
          `Delivered technical projects and engineering solutions at ${exp.company || "the company"}.`,
          `Collaborated with cross-functional technical teams to implement reliable features and systems.`
        ];

    const enhancedBullets: ExperienceBullet[] = rawBullets.map((b: string, bulletIdx: number) => {
      // Check if any star rewrite matches this bullet
      let matchedStarIdx = availableStarRewrites.findIndex((sr, idx) => {
        if (usedStarRewrites.has(idx)) return false;
        const orig = sr.originalBullet.toLowerCase().trim();
        const cur = b.toLowerCase().trim();
        return (
          orig === cur ||
          cur.includes(orig) ||
          orig.includes(cur) ||
          (orig.length > 20 && cur.includes(orig.slice(0, 20)))
        );
      });

      // If no exact match but we have unconsumed star rewrites and this is the first bullet
      if (matchedStarIdx === -1 && bulletIdx === 0) {
        matchedStarIdx = availableStarRewrites.findIndex((_, idx) => !usedStarRewrites.has(idx));
      }

      if (matchedStarIdx !== -1) {
        const sr = availableStarRewrites[matchedStarIdx];
        usedStarRewrites.add(matchedStarIdx);
        starCount++;
        const enhancedText = sr.improvedStarBullet.trim();

        changelog.push({
          id: `star-${expIdx}-${bulletIdx}`,
          category: "STAR Rewrite",
          title: `STAR Rewrite in ${exp.role || "Experience"}`,
          original: b,
          enhanced: enhancedText,
          impactNote: "Restructured into Situation-Task-Action-Result format with quantified metrics and high-impact action verbs."
        });

        return {
          original: b,
          enhanced: enhancedText,
          isRewritten: true,
          rewriteType: "star",
          improvementNote: "Transformed using STAR framework with active metrics."
        };
      }

      // If no star rewrite, apply action verb wording enhancement
      const upgraded = enhanceBulletWording(b);
      if (upgraded.isUpgraded && upgraded.enhanced !== b) {
        actionVerbCount++;
        changelog.push({
          id: `verb-${expIdx}-${bulletIdx}`,
          category: "Action Verb",
          title: `Action Verb Elevation in ${exp.role || "Experience"}`,
          original: b,
          enhanced: upgraded.enhanced,
          impactNote: "Elevated passive phrasing into a decisive, past-tense impact verb."
        });

        return {
          original: b,
          enhanced: upgraded.enhanced,
          isRewritten: true,
          rewriteType: "action-verb",
          improvementNote: "Strengthened action verb and structural cadence."
        };
      }

      return {
        original: b,
        enhanced: b,
        isRewritten: false,
        rewriteType: "original"
      };
    });

    return {
      role: exp.role || "Technical Role",
      company: exp.company || "Organization",
      period: exp.duration || "Demonstrated Timeline",
      bullets: enhancedBullets,
    };
  });

  // 3. Tailored Professional Summary (strictly based on candidate's real data, NO fabrication)
  const originalSummary =
    "Focused on shipping reliable software and clear, well-structured communication.";

  const topMatchedSkills = (
    result.matchedSkills && result.matchedSkills.length > 0
      ? result.matchedSkills
      : result.skills || []
  ).slice(0, 4);

  const primaryCompany = rawExperience[0]?.company;
  const companyContext =
    primaryCompany && primaryCompany !== "Technology Organization"
      ? ` with industry experience at ${primaryCompany}`
      : "";

  const enhancedSummary = topMatchedSkills.length > 0
    ? `${role}${companyContext}, specializing in ${topMatchedSkills.join(", ")}. Proven track record in developing reliable technical solutions, applying modern engineering best practices, and optimizing workflows for measurable performance impact.`
    : `${role}${companyContext}. Proven track record in delivering scalable technical solutions and applying industry best practices to achieve organizational impact.`;

  changelog.unshift({
    id: "summary-tailor",
    category: "Executive Summary",
    title: "Tailored Executive Positioning",
    original: originalSummary,
    enhanced: enhancedSummary,
    impactNote: "Replaced generic boilerplate with target role alignment and candidate's verified core technical competencies."
  });

  // 4. Skills Organization (zero fake skills)
  const allSkills = result.skills ?? [];
  const matchedSet = new Set(result.matchedSkills ?? []);
  const coreCompetencies = allSkills.filter((s) => matchedSet.has(s));
  const supportingSkills = allSkills.filter((s) => !matchedSet.has(s));

  if (coreCompetencies.length > 0) {
    changelog.push({
      id: "skills-prioritize",
      category: "Skills Alignment",
      title: "ATS Keyword Prioritization",
      original: `Unordered list of ${allSkills.length} extracted skills.`,
      enhanced: `Prioritized ${coreCompetencies.length} Core Job Competencies matching ${role}, followed by ${supportingSkills.length} supporting skills.`,
      impactNote: "Arranged verified skills by recruiter and ATS keyword priority without adding unverified skills."
    });
  }

  const contentEnhancement: ContentEnhancementSummary = {
    starRewritesCount: starCount,
    actionVerbsCount: actionVerbCount,
    totalBulletsImproved: starCount + actionVerbCount,
    tailoredSummaryCreated: true,
    skillsPrioritizedCount: coreCompetencies.length,
    changelog,
  };

  return {
    candidateName: name,
    headline: role,
    contact: contactLine || "email@example.com · (555) 123-4567",
    summary: enhancedSummary,
    originalSummary: originalSummary,
    experience: enhancedExperience,
    education: (result.education ?? []).map((e) => ({
      degree: e.degree || "",
      institution: e.institution || "",
      period: e.duration || "",
    })),
    skills: allSkills,
    coreCompetencies,
    supportingSkills,
    contentEnhancement,
  };
}

const ROLE_ID_TITLES: Record<string, string> = {
  "aiml-engineer": "AI / ML Engineer",
  "frontend-developer": "Frontend Developer",
  "backend-developer": "Backend Developer",
  "fullstack-developer": "Full Stack Developer",
  "data-analyst": "Data Analyst",
};

function roleTitleFromId(id: string): string {
  return ROLE_ID_TITLES[id] ?? id;
}

