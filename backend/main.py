import os
import io
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

from utils.parser import extract_text_from_pdf, extract_text_from_docx
from utils.matcher import load_jobs, get_job_by_id
from utils.ai_engine import analyze_resume_pipeline
from database.supabase_client import is_supabase_configured, save_analysis_to_supabase

# Initialize FastAPI App
app = FastAPI(
    title="AI Resume Analyzer API",
    description="Backend API for AI-assisted resume parsing, job comparison, and ATS score evaluation.",
    version="1.0.0"
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
    """Health check endpoint to verify backend service and database status."""
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer Backend",
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
    
    Returns structured JSON matching Section 12 specification.
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

    # 6. Optional: Persist to Supabase if credentials are provided (Phase 2 bridge)
    if is_supabase_configured():
        save_analysis_to_supabase(
            file_name=filename,
            raw_text=extracted_text,
            analysis_result=analysis_result,
            job_role_id=jobRole
        )

    # 7. Return Section 12 compliant response
    return analysis_result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
