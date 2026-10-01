import re
from typing import List, Dict, Any

STRONG_ACTION_VERBS = [
    "Architected", "Engineered", "Optimized", "Spearheaded", "Accelerated",
    "Automated", "Deployed", "Streamlined", "Implemented", "Designed"
]

def generate_suggestions(
    resume_text: str,
    missing_skills: List[str],
    matched_skills: List[str],
    job_title: str
) -> List[str]:
    """Generate practical, tailored improvement suggestions based on analysis gaps."""
    suggestions = []

    # 1. Address Missing Technical Skills
    if missing_skills:
        primary_missing = missing_skills[:2]
        suggestions.append(
            f"Gain hands-on proficiency in critical role requirements: {', '.join(primary_missing)}. Build a portfolio project demonstrating their usage."
        )
        if len(missing_skills) > 2:
            suggestions.append(
                f"Consider completing a verified certification or online workshop in {missing_skills[2]} to bridge the qualification gap."
            )

    # 2. Quantifiable Impact & Metrics Check
    # Check if the resume mentions numbers, percentages, or dollar values
    has_metrics = bool(re.search(r"(\b\d+%\b|\$\d+|\b\d+\s*(?:k|m|million|x|times)\b)", resume_text, re.IGNORECASE))
    if not has_metrics:
        suggestions.append(
            "Quantify your accomplishments using the STAR method (e.g., 'Improved API latency by 35%' or 'Reduced cloud costs by $12K')."
        )

    # 3. Action Verbs Check
    has_action_verbs = any(re.search(r"\b" + verb + r"\b", resume_text, re.IGNORECASE) for verb in STRONG_ACTION_VERBS)
    if not has_action_verbs:
        suggestions.append(
            "Strengthen your bullet points with high-impact power verbs like 'Architected', 'Spearheaded', 'Optimized', and 'Accelerated'."
        )

    # 4. Role-Specific Tailoring
    suggestions.append(
        f"Tailor your resume summary and headline specifically for the '{job_title}' position to pass ATS keyword filters."
    )

    # Return top 4-5 high quality suggestions
    return suggestions[:4]
