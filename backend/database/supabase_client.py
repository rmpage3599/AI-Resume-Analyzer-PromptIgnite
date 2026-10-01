import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_supabase_client = None

def get_supabase_client():
    """Returns an active Supabase client or None if credentials are not configured."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return _supabase_client
    except Exception as e:
        print(f"[Supabase] Initialization failed: {e}")
        return None

def is_supabase_configured() -> bool:
    """Check if Supabase credentials are provided and client is available."""
    return get_supabase_client() is not None

def save_analysis_to_supabase(
    file_name: str,
    raw_text: str,
    analysis_result: Dict[str, Any],
    job_role_id: str
) -> Optional[str]:
    """
    Saves a resume and its analysis record to Supabase (Phase 2 feature).
    Safely no-ops if Supabase is not configured.
    """
    client = get_supabase_client()
    if not client:
        return None

    try:
        candidate_name = analysis_result.get("candidate", {}).get("name", "Unknown")

        # 1. Insert into resumes table
        resume_res = client.table("resumes").insert({
            "candidate_name": candidate_name,
            "file_name": file_name,
            "raw_text": raw_text[:2000]  # Store snippet or full
        }).execute()

        resume_id = resume_res.data[0]["id"] if resume_res.data else None

        # 2. Insert into resume_analyses table
        client.table("resume_analyses").insert({
            "resume_id": resume_id,
            "job_role_id": job_role_id,
            "match_score": analysis_result.get("matchScore", 0),
            "matched_skills": analysis_result.get("matchedSkills", []),
            "missing_skills": analysis_result.get("missingSkills", []),
            "extracted_skills": analysis_result.get("skills", []),
            "education": analysis_result.get("education", []),
            "experience": analysis_result.get("experience", []),
            "suggestions": analysis_result.get("suggestions", [])
        }).execute()

        return resume_id
    except Exception as e:
        print(f"[Supabase] Error saving analysis: {e}")
        return None
