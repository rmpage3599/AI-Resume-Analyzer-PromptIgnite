import os
import json
from typing import Dict, Any, List
from utils.parser import extract_candidate_name, extract_skills, extract_education, extract_experience
from utils.matcher import get_job_by_id, match_resume_with_job
from utils.suggestions import generate_suggestions

def analyze_resume_pipeline(resume_text: str, job_role_id: str) -> Dict[str, Any]:
    """
    Main analysis pipeline conforming to Section 10-14 & 23 of Project Context.
    
    Tries AI LLM if API key is provided; otherwise uses fast, deterministic local NLP.
    Always returns structured JSON matching Section 12.
    """
    job_data = get_job_by_id(job_role_id)
    if not job_data:
        raise ValueError(f"Job role '{job_role_id}' not found.")

    # Try Gemini LLM if configured
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            return _analyze_with_gemini(resume_text, job_data, gemini_key)
        except Exception as e:
            print(f"[Warning] AI API call failed ({e}). Falling back to local deterministic engine.")

    # Fallback / Zero-cost local engine (Section 23)
    return _analyze_with_local_engine(resume_text, job_data)

def _analyze_with_local_engine(resume_text: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Fast, deterministic local rule and pattern matching engine (zero API cost)."""
    # 1. Extract entities
    candidate_name = extract_candidate_name(resume_text)
    skills = extract_skills(resume_text)
    education = extract_education(resume_text)
    experience = extract_experience(resume_text)

    # 2. Match with target job
    matching_result = match_resume_with_job(skills, resume_text, job_data)

    # 3. Generate improvement suggestions
    suggestions = generate_suggestions(
        resume_text=resume_text,
        missing_skills=matching_result["missingSkills"],
        matched_skills=matching_result["matchedSkills"],
        job_title=job_data.get("title", "Selected Role")
    )

    # Conforms exactly to Section 12 JSON schema
    return {
        "candidate": {
            "name": candidate_name
        },
        "skills": skills,
        "education": education,
        "experience": experience,
        "matchedSkills": matching_result["matchedSkills"],
        "missingSkills": matching_result["missingSkills"],
        "matchScore": matching_result["matchScore"],
        "suggestions": suggestions
    }

def _analyze_with_gemini(resume_text: str, job_data: Dict[str, Any], api_key: str) -> Dict[str, Any]:
    """Optional LLM structured extraction using Google Gemini API."""
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
You are an expert ATS Resume Analyzer. Analyze the following resume text against the target job role requirements.

JOB ROLE: {job_data.get('title')}
REQUIRED SKILLS: {', '.join(job_data.get('requiredSkills', []))}
PREFERRED SKILLS: {', '.join(job_data.get('preferredSkills', []))}

RESUME TEXT:
{resume_text[:4000]}

Return ONLY valid JSON matching this exact structure:
{{
  "candidate": {{
    "name": "Candidate Name"
  }},
  "skills": ["Skill1", "Skill2"],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "University / College",
      "duration": "Year or duration"
    }}
  ],
  "experience": [
    {{
      "role": "Job Title",
      "company": "Company Name",
      "duration": "Duration or Year"
    }}
  ],
  "matchedSkills": ["Skill matched with required or preferred"],
  "missingSkills": ["Critical required skills not found in resume"],
  "matchScore": 75,
  "suggestions": [
    "Practical actionable tip 1",
    "Practical actionable tip 2",
    "Practical actionable tip 3"
  ]
}}
"""
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    return json.loads(response.text)
