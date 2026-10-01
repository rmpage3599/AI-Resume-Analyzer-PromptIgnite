import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

from utils.parser import extract_candidate_name, extract_contact_info, extract_skills, extract_education, extract_experience
from utils.matcher import get_job_by_id, match_resume_with_job, match_resume_with_custom_jd, compare_multiple_roles
from utils.suggestions import calculate_ats_rubric, generate_suggestions

def analyze_resume_pipeline(
    resume_text: str,
    job_role_id: Optional[str] = None,
    custom_jd_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main analysis pipeline with multi-factor ATS scoring, entity extraction,
    and optional Groq/Gemini LLM enhancement with zero-cost local fallback.
    """
    # 1. Extract Entities
    candidate_name = extract_candidate_name(resume_text)
    contact_info = extract_contact_info(resume_text)
    skills = extract_skills(resume_text)
    education = extract_education(resume_text)
    experience = extract_experience(resume_text)

    # 2. Determine Job Matching Strategy
    if custom_jd_text and custom_jd_text.strip():
        matching_result = match_resume_with_custom_jd(skills, resume_text, custom_jd_text)
        job_title = "Custom Job Description"
    else:
        role_id = job_role_id or "aiml-engineer"
        job_data = get_job_by_id(role_id)
        if not job_data:
            raise ValueError(f"Job role '{role_id}' not found.")
        matching_result = match_resume_with_job(skills, resume_text, job_data)
        job_title = job_data.get("title", "Selected Role")

    match_score = matching_result["matchScore"]
    matched_skills = matching_result["matchedSkills"]
    missing_skills = matching_result["missingSkills"]

    # 3. Calculate Comprehensive ATS Rubric /100
    ats_rubric = calculate_ats_rubric(
        resume_text=resume_text,
        match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        contact_info=contact_info,
        education_entries=education,
        experience_entries=experience
    )

    # 4. Generate Rule-Based Suggestions
    suggestions = generate_suggestions(
        resume_text=resume_text,
        missing_skills=missing_skills,
        matched_skills=matched_skills,
        job_title=job_title,
        ats_rubric=ats_rubric
    )

    # 5. Optional Groq AI Enhancement
    groq_key = os.getenv("GROQ_API_KEY")
    ai_enhancements = None
    if groq_key:
        try:
            ai_enhancements = _call_groq_enhancer(
                resume_text=resume_text,
                job_title=job_title,
                missing_skills=missing_skills,
                groq_key=groq_key
            )
            if ai_enhancements and "suggestions" in ai_enhancements:
                # Merge AI suggestions with rule-based ones if needed, or use AI's tailored ones
                suggestions = ai_enhancements["suggestions"]
        except Exception as e:
            print(f"[Groq AI] Call skipped ({e}). Using deterministic engine.")

    # 6. Assemble Full Structured Output
    response_payload = {
        "candidate": {
            "name": candidate_name,
            "email": contact_info.get("email"),
            "phone": contact_info.get("phone"),
            "linkedin": contact_info.get("linkedin"),
            "github": contact_info.get("github")
        },
        "targetJobTitle": job_title,
        "matchScore": match_score,
        "atsScore": ats_rubric["overallAtsScore"],
        "atsRubric": ats_rubric,
        "skills": skills,
        "categorizedSkills": matching_result.get("categorizedSkills", {}),
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "education": education,
        "experience": experience,
        "suggestions": suggestions,
        "aiEnhanced": ai_enhancements is not None
    }

    if ai_enhancements and "starRewrites" in ai_enhancements:
        response_payload["starRewrites"] = ai_enhancements["starRewrites"]

    # 7. Compute Multi-Role Benchmark across all 12 roles
    try:
        response_payload["multiRoleComparison"] = compare_multiple_roles(skills, resume_text)
    except Exception as e:
        print(f"[Multi-Role] Benchmark skipped: {e}")

    return response_payload


_cached_groq_model: Optional[str] = None

def _get_best_groq_model(client) -> str:
    global _cached_groq_model
    if _cached_groq_model:
        return _cached_groq_model
    try:
        models_data = client.models.list().data
        available_ids = {m.id for m in models_data}
        preferred = [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant"
        ]
        for candidate in preferred:
            if candidate in available_ids:
                _cached_groq_model = candidate
                return candidate
    except Exception as e:
        print(f"[Groq AI] Could not list models: {e}")
    _cached_groq_model = "openai/gpt-oss-120b"
    return _cached_groq_model

def _call_groq_enhancer(resume_text: str, job_title: str, missing_skills: List[str], groq_key: str) -> Optional[Dict[str, Any]]:
    """Use Groq Cloud LLM API to provide STAR rewrites and tailored critique."""
    from openai import OpenAI
    client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
    model_name = _get_best_groq_model(client)

    prompt = f"""
You are an expert Executive Resume Coach and ATS Specialist.
Analyze the following resume snippet for a '{job_title}' role.

Missing Skills: {', '.join(missing_skills[:5])}
Resume Snippet:
{resume_text[:2500]}

Respond ONLY in valid JSON matching this schema:
{{
  "suggestions": [
    "High-impact tip 1 targeting missing skills",
    "High-impact tip 2 on metrics quantification",
    "High-impact tip 3 on ATS optimization"
  ],
  "starRewrites": [
    {{
      "originalBullet": "Original weak bullet from experience",
      "improvedStarBullet": "Situation-Task-Action-Result format with active verb and quantified impact"
    }}
  ]
}}
"""
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=1500
    )
    return json.loads(response.choices[0].message.content)


