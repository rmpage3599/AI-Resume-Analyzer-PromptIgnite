import os
import json
import sqlite3
from typing import Dict, Any, List, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_supabase_client = None

def get_supabase_client():
    """Returns active Supabase client if credentials are configured."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_KEY or "your-project" in SUPABASE_URL:
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return _supabase_client
    except Exception as e:
        print(f"[Supabase] Connection error: {e}")
        return None

def is_supabase_configured() -> bool:
    """Returns True if cloud Supabase credentials are valid and active."""
    return get_supabase_client() is not None

# -------------------------------------------------------------
# Local SQLite Storage (Active Out-of-the-Box)
# -------------------------------------------------------------
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "resume_analyzer.db")

def _init_sqlite_db():
    """Initializes local SQLite database for instant zero-config persistence."""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id TEXT PRIMARY KEY,
            candidate_name TEXT,
            file_name TEXT,
            job_role_id TEXT,
            match_score INTEGER,
            matched_skills TEXT,
            missing_skills TEXT,
            analysis_data TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()

# Auto-initialize local database
_init_sqlite_db()

# -------------------------------------------------------------
# Unified Persistence Operations
# -------------------------------------------------------------
def save_analysis(
    file_name: str,
    candidate_name: str,
    raw_text: str,
    job_role_id: str,
    analysis_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Saves an analysis record to Supabase if configured;
    otherwise saves to local SQLite database so history always works!
    """
    import uuid
    record_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()

    match_score = analysis_result.get("matchScore", 0)
    matched_skills = analysis_result.get("matchedSkills", [])
    missing_skills = analysis_result.get("missingSkills", [])

    storage_backend = "sqlite"

    # 1. Try Supabase Cloud
    client = get_supabase_client()
    if client:
        try:
            # Insert resume
            res = client.table("resumes").insert({
                "id": record_id,
                "candidate_name": candidate_name,
                "file_name": file_name,
                "raw_text": raw_text[:2000]
            }).execute()

            # Insert analysis
            client.table("resume_analyses").insert({
                "id": record_id,
                "resume_id": record_id,
                "job_role_id": job_role_id,
                "match_score": match_score,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "extracted_skills": analysis_result.get("skills", []),
                "education": analysis_result.get("education", []),
                "experience": analysis_result.get("experience", []),
                "suggestions": analysis_result.get("suggestions", [])
            }).execute()

            storage_backend = "supabase"
            return {"id": record_id, "backend": storage_backend, "saved": True}
        except Exception as e:
            print(f"[Supabase] Insert failed, falling back to local DB: {e}")

    # 2. Local SQLite Persistence (Fallback / Instant Out-of-the-Box)
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO resumes (
                id, candidate_name, file_name, job_role_id,
                match_score, matched_skills, missing_skills,
                analysis_data, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record_id,
            candidate_name,
            file_name,
            job_role_id,
            match_score,
            json.dumps(matched_skills),
            json.dumps(missing_skills),
            json.dumps(analysis_result),
            now_iso
        ))
        conn.commit()
        conn.close()
        return {"id": record_id, "backend": "sqlite", "saved": True}
    except Exception as e:
        print(f"[Database] Error saving record: {e}")
        return {"id": record_id, "backend": "none", "saved": False, "error": str(e)}

def get_history(limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieve history of past candidate analyses."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("resume_analyses")\
                .select("id, resume_id, job_role_id, match_score, created_at, resumes(candidate_name, file_name)")\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            history_list = []
            for item in res.data or []:
                resume_info = item.get("resumes") or {}
                history_list.append({
                    "id": item.get("id"),
                    "candidateName": resume_info.get("candidate_name", "Unknown"),
                    "fileName": resume_info.get("file_name", "resume.pdf"),
                    "jobRoleId": item.get("job_role_id"),
                    "matchScore": item.get("match_score"),
                    "createdAt": item.get("created_at")
                })
            return history_list
        except Exception as e:
            print(f"[Supabase] Failed to fetch history: {e}")

    # Fallback to SQLite
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, candidate_name, file_name, job_role_id, match_score, created_at
            FROM resumes
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": row["id"],
                "candidateName": row["candidate_name"],
                "fileName": row["file_name"],
                "jobRoleId": row["job_role_id"],
                "matchScore": row["match_score"],
                "createdAt": row["created_at"]
            }
            for row in rows
        ]
    except Exception as e:
        print(f"[Database] Error fetching history: {e}")
        return []

def get_history_detail(record_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve the full detailed analysis for a specific past evaluation."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("resume_analyses")\
                .select("*, resumes(*)")\
                .or_(f"id.eq.{record_id},resume_id.eq.{record_id}")\
                .execute()
            if res.data:
                item = res.data[0]
                resume_info = item.get("resumes") or {}
                return {
                    "id": item["id"],
                    "candidate": {"name": resume_info.get("candidate_name")},
                    "jobRole": item["job_role_id"],
                    "matchScore": item["match_score"],
                    "matchedSkills": item.get("matched_skills", []),
                    "missingSkills": item.get("missing_skills", []),
                    "skills": item.get("extracted_skills", []),
                    "education": item.get("education", []),
                    "experience": item.get("experience", []),
                    "suggestions": item.get("suggestions", []),
                    "createdAt": item.get("created_at")
                }
        except Exception as e:
            print(f"[Supabase] Error fetching detail: {e}")

    # Fallback to SQLite
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resumes WHERE id = ?", (record_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            analysis = json.loads(row["analysis_data"])
            analysis["id"] = row["id"]
            analysis["createdAt"] = row["created_at"]
            analysis["fileName"] = row["file_name"]
            analysis["jobRoleId"] = row["job_role_id"]
            return analysis
        return None
    except Exception as e:
        print(f"[Database] Error fetching detail from SQLite: {e}")
        return None
