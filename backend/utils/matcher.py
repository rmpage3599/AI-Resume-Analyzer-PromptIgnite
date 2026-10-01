import json
import os
import re
from typing import Dict, List, Tuple, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from utils.skills_db import normalize_skill, categorize_skills, SKILL_ALIASES

def load_jobs() -> List[Dict[str, Any]]:
    """Load predefined job roles from jobs.json."""
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jobs.json")
    if not os.path.exists(data_path):
        return []
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """Find a specific job role by its unique ID."""
    jobs = load_jobs()
    for job in jobs:
        if job.get("id") == job_id:
            return job
    return None

def extract_skills_from_jd(jd_text: str) -> Tuple[List[str], List[str]]:
    """Extract required and preferred skills from raw pasted job description text."""
    jd_lower = jd_text.lower()
    found_skills = set()

    for alias, standard_name in SKILL_ALIASES.items():
        pattern = r"(?<![a-zA-Z0-9_])" + re.escape(alias) + r"(?![a-zA-Z0-9_])"
        if re.search(pattern, jd_lower):
            found_skills.add(standard_name)

    all_found = sorted(list(found_skills))
    # Use first 60% as required, remaining as preferred
    split_idx = max(int(len(all_found) * 0.6), 1)
    required = all_found[:split_idx] if all_found else ["Technical Problem Solving"]
    preferred = all_found[split_idx:]
    return required, preferred

def match_resume_with_job(
    resume_skills: List[str],
    resume_text: str,
    job_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compare extracted resume skills against a target job role.
    
    Computes:
    - Matched skills & Missing skills
    - Categorized skills
    - Deterministic match score out of 100
    - Semantic TF-IDF similarity score
    """
    required_skills = job_data.get("requiredSkills", [])
    preferred_skills = job_data.get("preferredSkills", [])
    
    resume_skills_lower = {s.lower(): s for s in resume_skills}
    
    matched_skills = []
    missing_skills = []

    # Required skills evaluation
    matched_req_count = 0
    for req in required_skills:
        req_norm = normalize_skill(req)
        req_lower = req_norm.lower()
        if req_lower in resume_skills_lower or any(req_lower in s for s in resume_skills_lower):
            matched_skills.append(req_norm)
            matched_req_count += 1
        else:
            missing_skills.append(req_norm)

    # Preferred skills evaluation
    matched_pref_count = 0
    for pref in preferred_skills:
        pref_norm = normalize_skill(pref)
        pref_lower = pref_norm.lower()
        if pref_lower in resume_skills_lower or any(pref_lower in s for s in resume_skills_lower):
            if pref_norm not in matched_skills:
                matched_skills.append(pref_norm)
            matched_pref_count += 1

    # Deterministic calculation (80% required weight, 20% preferred weight)
    total_req = len(required_skills)
    total_pref = len(preferred_skills)

    req_score = (matched_req_count / total_req) * 80.0 if total_req > 0 else 80.0
    pref_score = (matched_pref_count / total_pref) * 20.0 if total_pref > 0 else 20.0

    raw_score = round(req_score + pref_score)
    final_score = min(max(raw_score, 10), 100)

    # TF-IDF Semantic Similarity
    semantic_score = float(final_score)
    try:
        jd_text = f"{job_data.get('title', '')} {' '.join(required_skills)} {' '.join(preferred_skills)} {job_data.get('description', '')}"
        vectorizer = TfidfVectorizer(stop_words='english')
        vectors = vectorizer.fit_transform([jd_text, resume_text])
        sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        semantic_score = round(float(sim * 100), 1)
    except Exception:
        pass

    return {
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "matchScore": int(final_score),
        "semanticScore": semantic_score,
        "categorizedSkills": categorize_skills(resume_skills)
    }

def match_resume_with_custom_jd(
    resume_skills: List[str],
    resume_text: str,
    custom_jd_text: str
) -> Dict[str, Any]:
    """Compare resume against user-pasted custom Job Description text."""
    required, preferred = extract_skills_from_jd(custom_jd_text)
    custom_job_data = {
        "id": "custom-role",
        "title": "Custom Job Description",
        "requiredSkills": required,
        "preferredSkills": preferred,
        "description": custom_jd_text[:300]
    }
    result = match_resume_with_job(resume_skills, resume_text, custom_job_data)
    result["jobTitle"] = "Custom Job Description"
    return result

def compare_multiple_roles(
    resume_skills: List[str],
    resume_text: str,
    role_ids: Optional[List[str]] = None,
    field: Optional[str] = None
) -> Dict[str, Any]:
    """
    Compare a single resume across multiple job roles in the same field/domain.
    Returns a ranked leaderboard from highest match to lowest match.
    """
    all_jobs = load_jobs()
    if field:
        target_jobs = [j for j in all_jobs if j.get("field") == field]
        if not target_jobs:
            target_jobs = all_jobs
    elif role_ids:
        target_jobs = [j for j in all_jobs if j["id"] in role_ids]
    else:
        target_jobs = all_jobs

    rankings = []
    for job in target_jobs:
        match_res = match_resume_with_job(resume_skills, resume_text, job)
        rankings.append({
            "jobRoleId": job["id"],
            "jobTitle": job["title"],
            "field": job.get("field", "General"),
            "matchScore": match_res["matchScore"],
            "semanticScore": match_res.get("semanticScore", 0),
            "matchedSkillsCount": len(match_res["matchedSkills"]),
            "missingSkillsCount": len(match_res["missingSkills"]),
            "topMatchedSkills": match_res["matchedSkills"][:4],
            "topMissingSkills": match_res["missingSkills"][:3]
        })

    # Sort descending by match score
    rankings.sort(key=lambda r: r["matchScore"], reverse=True)

    best_match = rankings[0] if rankings else None
    resolved_field = field or (target_jobs[0].get("field") if target_jobs else "General")

    return {
        "field": resolved_field,
        "totalRolesCompared": len(rankings),
        "bestFitRole": best_match["jobTitle"] if best_match else "N/A",
        "bestFitScore": best_match["matchScore"] if best_match else 0,
        "rankings": rankings
    }

