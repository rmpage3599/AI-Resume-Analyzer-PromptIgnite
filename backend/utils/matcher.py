import json
import os
from typing import Dict, List, Tuple, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_jobs() -> List[Dict[str, Any]]:
    """Load predefined job roles from jobs.json."""
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jobs.json")
    if not os.path.exists(data_path):
        return []
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_job_by_id(job_id: str):
    """Find a specific job role by its unique ID."""
    jobs = load_jobs()
    for job in jobs:
        if job.get("id") == job_id:
            return job
    return None

def match_resume_with_job(
    resume_skills: List[str],
    resume_text: str,
    job_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compare extracted resume skills and text against a target job role.
    
    Implements deterministic calculation (Section 14 of Project Context):
    - Matched Skills
    - Missing Skills (Mandatory)
    - Match Score (%)
    """
    required_skills = job_data.get("requiredSkills", [])
    preferred_skills = job_data.get("preferredSkills", [])
    
    # Normalize skill names for case-insensitive matching
    resume_skills_lower = {s.lower(): s for s in resume_skills}
    
    matched_skills = []
    missing_skills = []

    # Check required skills
    matched_req_count = 0
    for req in required_skills:
        req_lower = req.lower()
        if req_lower in resume_skills_lower:
            matched_skills.append(req)
            matched_req_count += 1
        elif any(req_lower in s for s in resume_skills_lower):
            matched_skills.append(req)
            matched_req_count += 1
        else:
            missing_skills.append(req)

    # Check preferred skills
    matched_pref_count = 0
    for pref in preferred_skills:
        pref_lower = pref.lower()
        if pref_lower in resume_skills_lower:
            if pref not in matched_skills:
                matched_skills.append(pref)
            matched_pref_count += 1

    # Deterministic calculation (Section 14)
    # 80% weight on required skills, 20% bonus on preferred skills
    total_req = len(required_skills)
    total_pref = len(preferred_skills)

    if total_req > 0:
        req_score = (matched_req_count / total_req) * 80.0
    else:
        req_score = 80.0

    if total_pref > 0:
        pref_score = (matched_pref_count / total_pref) * 20.0
    else:
        pref_score = 20.0

    deterministic_score = round(req_score + pref_score)
    final_score = min(max(deterministic_score, 10), 100)  # Bound between 10% and 100%

    # Optional TF-IDF Semantic Similarity
    semantic_score = 0.0
    try:
        jd_text = f"{job_data.get('title', '')} {' '.join(required_skills)} {' '.join(preferred_skills)} {job_data.get('description', '')}"
        vectorizer = TfidfVectorizer(stop_words='english')
        vectors = vectorizer.fit_transform([jd_text, resume_text])
        sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        semantic_score = round(float(sim * 100), 1)
    except Exception:
        semantic_score = float(final_score)

    return {
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "matchScore": int(final_score),
        "semanticScore": semantic_score
    }
