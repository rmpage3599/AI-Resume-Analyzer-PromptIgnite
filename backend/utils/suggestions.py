import re
from typing import List, Dict, Any, Optional

POWER_ACTION_VERBS = [
    "Architected", "Engineered", "Optimized", "Spearheaded", "Accelerated",
    "Automated", "Deployed", "Streamlined", "Implemented", "Designed",
    "Orchestrated", "Restructured", "Expanded", "Generated", "Formulated",
    "Pioneered", "Consolidated", "Maximized", "Minimized", "Constructed"
]

WEAK_PASSIVE_VERBS = [
    "worked on", "helped", "assisted", "responsible for", "handled",
    "participated in", "did", "tasked with", "was involved in"
]

def calculate_ats_rubric(
    resume_text: str,
    match_score: int,
    matched_skills: List[str],
    missing_skills: List[str],
    contact_info: Dict[str, Optional[str]],
    education_entries: List[Dict[str, Any]],
    experience_entries: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculate comprehensive 4-pillar ATS Rubric out of 100:
    1. Keyword Match Score (40 pts)
    2. Impact & Metrics Quantification (25 pts)
    3. Action Verbs & Power Phrasing (20 pts)
    4. Structure & Readability (15 pts)
    """
    # Pillar 1: Keyword Match (scale 0-40 based on match_score)
    keyword_score = round((match_score / 100.0) * 40.0)

    # Pillar 2: Impact & Metrics (25 pts)
    # Check for %, $, numbers, scale metrics in resume
    metric_matches = re.findall(r"(\b\d+%\b|\$\d+|\b\d+\s*(?:k|m|million|x|times|users|req/s)\b)", resume_text, re.IGNORECASE)
    metrics_count = len(metric_matches)
    if metrics_count >= 5:
        impact_score = 25
    elif metrics_count >= 3:
        impact_score = 20
    elif metrics_count >= 1:
        impact_score = 14
    else:
        impact_score = 5

    # Pillar 3: Action Verbs (20 pts)
    power_verb_hits = sum(1 for verb in POWER_ACTION_VERBS if re.search(r"\b" + verb + r"\b", resume_text, re.IGNORECASE))
    passive_hits = sum(1 for weak in WEAK_PASSIVE_VERBS if weak in resume_text.lower())
    
    if power_verb_hits >= 4 and passive_hits == 0:
        action_verb_score = 20
    elif power_verb_hits >= 2:
        action_verb_score = max(15 - (passive_hits * 2), 8)
    else:
        action_verb_score = 8

    # Pillar 4: Formatting & Structure (15 pts)
    formatting_score = 0
    checks = []

    # Check Email
    if contact_info.get("email"):
        formatting_score += 4
        checks.append({"item": "Contact Email Present", "passed": True})
    else:
        checks.append({"item": "Contact Email Missing", "passed": False})

    # Check Phone
    if contact_info.get("phone"):
        formatting_score += 3
        checks.append({"item": "Phone Number Present", "passed": True})
    else:
        checks.append({"item": "Phone Number Missing", "passed": False})

    # Check Education
    if education_entries and education_entries[0].get("degree") != "Bachelor's Degree":
        formatting_score += 4
        checks.append({"item": "Education Section Detected", "passed": True})
    else:
        formatting_score += 2
        checks.append({"item": "Standard Education Section", "passed": True})

    # Check Experience
    if experience_entries and len(experience_entries) >= 1:
        formatting_score += 4
        checks.append({"item": "Work Experience Section Detected", "passed": True})
    else:
        checks.append({"item": "Work Experience Section Minimal", "passed": False})

    total_ats_score = min(keyword_score + impact_score + action_verb_score + formatting_score, 100)

    return {
        "overallAtsScore": total_ats_score,
        "subScores": {
            "keywordMatchScore": {"score": keyword_score, "max": 40},
            "impactQuantificationScore": {"score": impact_score, "max": 25},
            "actionVerbScore": {"score": action_verb_score, "max": 20},
            "formattingReadabilityScore": {"score": formatting_score, "max": 15}
        },
        "metricsDetectedCount": metrics_count,
        "powerVerbsCount": power_verb_hits,
        "checks": checks
    }

def generate_suggestions(
    resume_text: str,
    missing_skills: List[str],
    matched_skills: List[str],
    job_title: str,
    ats_rubric: Optional[Dict[str, Any]] = None
) -> List[str]:
    """Generate prioritized, actionable improvement suggestions based on analysis gaps."""
    suggestions = []

    # 1. Missing Technical Skills
    if missing_skills:
        primary = missing_skills[:3]
        suggestions.append(
            f"Bridge Priority Qualification Gaps: Gain and demonstrate hands-on experience in {', '.join(primary)}."
        )

    # 2. Impact & STAR Framework
    if ats_rubric and ats_rubric["subScores"]["impactQuantificationScore"]["score"] < 20:
        suggestions.append(
            "Quantify Results using the STAR Method: Add measurable outcomes to your bullet points (e.g., 'Improved API latency by 40%', 'Handled 500K daily active users')."
        )

    # 3. Action Verbs
    if ats_rubric and ats_rubric["subScores"]["actionVerbScore"]["score"] < 16:
        suggestions.append(
            "Replace Passive Phrasing: Swap phrases like 'worked on' or 'helped with' for strong impact verbs such as 'Architected', 'Spearheaded', 'Optimized', or 'Automated'."
        )

    # 4. Tailoring
    suggestions.append(
        f"Keyword Optimization: Ensure terms relevant to '{job_title}' appear naturally in your Summary and Skills sections to pass automated ATS filters."
    )

    return suggestions[:4]
