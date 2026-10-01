import os
import sys
import io
from typing import Dict, Any, List, Optional, Tuple
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure backend directory is on sys.path and load environment variables
sys.path.insert(0, os.path.dirname(__file__))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv()

from utils.parser import extract_text_from_pdf, extract_text_from_docx, extract_skills, extract_candidate_name, extract_contact_info
from utils.matcher import load_jobs, get_job_by_id, compare_multiple_roles
from utils.ai_engine import analyze_resume_pipeline
from database.db_manager import (
    save_analysis,
    get_history,
    get_history_detail,
    is_supabase_configured
)

# Initialize FastAPI App
app = FastAPI(
    title="AI Resume Analyzer API",
    description="Enterprise-grade Resume Parsing, ATS Scoring, Multi-Role Comparison, and Job Matching API.",
    version="2.0.0"
)

# Configure CORS for Next.js frontend (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB Limit

@app.get("/api/health")
def health_check():
    """Health check endpoint verifying backend status, active database, and AI providers."""
    backend_type = "supabase" if is_supabase_configured() else "sqlite"
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer Backend",
        "version": "2.0.0",
        "database_backend": backend_type,
        "supabase_configured": is_supabase_configured(),
        "groq_configured": bool(os.getenv("GROQ_API_KEY"))
    }

@app.get("/api/jobs")
def get_jobs():
    """Get all 12 predefined industry job roles for selection in frontend dropdown."""
    return load_jobs()

async def _extract_text_from_upload(file: UploadFile) -> Tuple[str, str]:
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{ext}'. Please upload a valid PDF (or DOCX) file."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the 5MB limit. Please upload a smaller resume."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty. Please select a valid resume."
        )

    try:
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(content)
        else:
            extracted_text = extract_text_from_docx(content)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to read and extract text from document: {str(e)}"
        )

    if not extracted_text or len(extracted_text.strip()) < 30:
        raise HTTPException(
            status_code=422,
            detail="Unable to extract readable text from the document. Please ensure it is not a scanned image or empty."
        )

    return filename, extracted_text

@app.post("/api/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jobRole: Optional[str] = Form(None),
    customJd: Optional[str] = Form(None)
):
    """
    Main analysis endpoint.
    
    Accepts:
    - resume: PDF or DOCX file
    - jobRole: selected job role ID (optional if customJd provided)
    - customJd: pasted custom Job Description text (optional)
    
    Returns comprehensive ATS score /100, entity extraction, matched & missing skills,
    actionable improvement suggestions, and auto-saves to database.
    """
    if not jobRole and not customJd:
        raise HTTPException(
            status_code=400,
            detail="Please provide either 'jobRole' or 'customJd' for evaluation."
        )

    if jobRole and not customJd:
        job_data = get_job_by_id(jobRole)
        if not job_data:
            raise HTTPException(
                status_code=404,
                detail=f"Job role '{jobRole}' not found in predefined list."
            )

    filename, extracted_text = await _extract_text_from_upload(resume)

    # Run Core Analysis Pipeline
    try:
        analysis_result = analyze_resume_pipeline(
            resume_text=extracted_text,
            job_role_id=jobRole,
            custom_jd_text=customJd
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}"
        )

    # Automatic Persistence
    candidate_name = analysis_result.get("candidate", {}).get("name", "Candidate")
    save_result = save_analysis(
        file_name=filename,
        candidate_name=candidate_name,
        raw_text=extracted_text,
        job_role_id=jobRole or "custom-jd",
        analysis_result=analysis_result
    )

    analysis_result["id"] = save_result.get("id")
    analysis_result["databaseBackend"] = save_result.get("backend")
    analysis_result["fileName"] = filename
    analysis_result["jobRoleId"] = jobRole or "custom-jd"

    return analysis_result


@app.post("/api/compare-roles")
async def compare_roles(
    resume: UploadFile = File(...),
    roleIds: Optional[str] = Form(None),
    field: Optional[str] = Form(None)
):
    """
    Compare a single resume across multiple job roles simultaneously.
    Returns a ranked leaderboard of all roles sorted by match score.
    """
    filename, extracted_text = await _extract_text_from_upload(resume)

    candidate_name = extract_candidate_name(extracted_text)
    contact_info = extract_contact_info(extracted_text)
    skills = extract_skills(extracted_text)

    # Parse role IDs if provided
    selected_role_ids = None
    if roleIds:
        selected_role_ids = [rid.strip() for rid in roleIds.split(",") if rid.strip()]

    comparison_result = compare_multiple_roles(
        resume_skills=skills,
        resume_text=extracted_text,
        role_ids=selected_role_ids,
        field=field
    )

    return {
        "candidate": {
            "name": candidate_name,
            "email": contact_info.get("email"),
            "phone": contact_info.get("phone")
        },
        "fileName": filename,
        "extractedSkillsCount": len(skills),
        "totalRolesCompared": comparison_result["totalRolesCompared"],
        "bestFitRole": comparison_result["bestFitRole"],
        "bestFitScore": comparison_result["bestFitScore"],
        "rankings": comparison_result["rankings"]
    }

@app.get("/api/history")
def get_analysis_history(limit: int = Query(20, ge=1, le=100)):
    """Get past candidate evaluations history from the database."""
    records = get_history(limit=limit)
    return {
        "total": len(records),
        "history": records
    }

@app.get("/api/history/{record_id}")
def get_analysis_by_id(record_id: str):
    """Retrieve full analysis details for a specific past evaluation by its ID."""
    detail = get_history_detail(record_id)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis record with ID '{record_id}' not found."
        )
    return detail

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
