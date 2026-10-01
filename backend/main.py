import os
import sys
import io

# Ensure backend root is always on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional

from utils.parser import extract_text_from_pdf, extract_text_from_docx
from utils.matcher import load_jobs, get_job_by_id
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
    description="Backend API for AI-assisted resume parsing, job comparison, and ATS score evaluation.",
    version="1.1.0"
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
    """Health check endpoint verifying backend status and active database engine."""
    backend_type = "supabase" if is_supabase_configured() else "sqlite"
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer Backend",
        "database_backend": backend_type,
        "supabase_configured": is_supabase_configured()
    }

@app.get("/api/jobs")
def get_jobs():
    """Get all predefined job roles for selection in frontend dropdown."""
    return load_jobs()

@app.post("/api/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jobRole: str = Form(...)
):
    """
    Main analysis endpoint (Section 19 of Project Context).
    
    Accepts:
    - resume: PDF or DOCX file
    - jobRole: selected job role ID
    
    Returns structured JSON matching Section 12 specification,
    and automatically saves the result into the database.
    """
    # 1. Validate File Existence and Extension
    filename = resume.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{ext}'. Please upload a valid PDF (or DOCX) file."
        )

    # 2. Read and Validate File Size
    content = await resume.read()
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

    # 3. Extract Text
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

    # 4. Verify Job Role exists
    job_data = get_job_by_id(jobRole)
    if not job_data:
        raise HTTPException(
            status_code=404,
            detail=f"Job role '{jobRole}' not found in predefined list."
        )

    # 5. Run Core Analysis Pipeline (LLM or deterministic fallback)
    try:
        analysis_result = analyze_resume_pipeline(extracted_text, jobRole)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}"
        )

    # 6. Automatic Persistence (Supabase Cloud if configured, SQLite out-of-the-box)
    candidate_name = analysis_result.get("candidate", {}).get("name", "Candidate")
    save_result = save_analysis(
        file_name=filename,
        candidate_name=candidate_name,
        raw_text=extracted_text,
        job_role_id=jobRole,
        analysis_result=analysis_result
    )

    # Attach storage metadata to result
    analysis_result["id"] = save_result.get("id")
    analysis_result["databaseBackend"] = save_result.get("backend")

    # 7. Return Section 12 compliant response
    return analysis_result

@app.get("/api/history")
def get_analysis_history(limit: int = Query(20, ge=1, le=100)):
    """
    Get past candidate evaluations history from the database.
    Used to populate the 'History / Past Analyses' tab in the frontend.
    """
    records = get_history(limit=limit)
    return {
        "total": len(records),
        "history": records
    }

@app.get("/api/history/{record_id}")
def get_analysis_by_id(record_id: str):
    """
    Retrieve full analysis details for a specific past evaluation by its ID.
    """
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
