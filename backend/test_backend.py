import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from utils.parser import extract_text_from_pdf, extract_skills, extract_education, extract_experience, extract_candidate_name
from utils.matcher import load_jobs, get_job_by_id, match_resume_with_job
from utils.suggestions import generate_suggestions
from main import app

def run_tests():
    print("--- 1. Testing jobs.json loading ---")
    jobs = load_jobs()
    assert len(jobs) >= 5, f"Expected at least 5 jobs, got {len(jobs)}"
    print(f" Loaded {len(jobs)} job roles successfully.")

    print("\n--- 2. Testing PDF Extraction ---")
    sample_pdf_path = os.path.join(os.path.dirname(__file__), "sample_data", "sample_resume.pdf")
    assert os.path.exists(sample_pdf_path), "sample_resume.pdf not found"
    with open(sample_pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    text = extract_text_from_pdf(pdf_bytes)
    assert len(text) > 50, "Extracted text too short"
    print(f" Extracted {len(text)} characters from sample_resume.pdf.")

    print("\n--- 3. Testing Entity Parsing ---")
    candidate_name = extract_candidate_name(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    print(f" Candidate: {candidate_name}")
    print(f" Skills detected ({len(skills)}): {skills[:6]}...")
    print(f" Education: {education}")
    print(f" Experience: {experience}")

    print("\n--- 4. Testing Job Matching (aiml-engineer) ---")
    job = get_job_by_id("aiml-engineer")
    match_result = match_resume_with_job(skills, text, job)
    print(f" Match Score: {match_result['matchScore']}%")
    print(f" Matched Skills: {match_result['matchedSkills']}")
    print(f" Missing Skills: {match_result['missingSkills']}")
    assert "missingSkills" in match_result, "missingSkills key missing"
    assert "matchedSkills" in match_result, "matchedSkills key missing"

    print("\n--- 5. Testing Suggestions Engine ---")
    suggestions = generate_suggestions(text, match_result["missingSkills"], match_result["matchedSkills"], job["title"])
    print(f" Generated {len(suggestions)} suggestions:")
    for i, s in enumerate(suggestions, 1):
        print(f"   {i}. {s}")

    print("\n--- 6. Testing FastAPI TestClient Endpoints ---")
    client = TestClient(app)
    
    # Test GET /api/jobs
    res_jobs = client.get("/api/jobs")
    assert res_jobs.status_code == 200
    assert len(res_jobs.json()) == 5
    print(" GET /api/jobs returned HTTP 200 with 5 roles.")

    # Test GET /api/health
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    print(f" GET /api/health returned: {res_health.json()}")

    # Test POST /api/analyze
    with open(sample_pdf_path, "rb") as f:
        files = {"resume": ("sample_resume.pdf", f, "application/pdf")}
        data = {"jobRole": "aiml-engineer"}
        res_analyze = client.post("/api/analyze", files=files, data=data)
    
    assert res_analyze.status_code == 200, f"Expected 200, got {res_analyze.status_code}: {res_analyze.text}"
    result = res_analyze.json()
    print(" POST /api/analyze successfully returned Section 12 JSON:")
    print(f"   - Candidate: {result['candidate']}")
    print(f"   - Match Score: {result['matchScore']}%")
    print(f"   - Matched Skills count: {len(result['matchedSkills'])}")
    print(f"   - Missing Skills count: {len(result['missingSkills'])}")
    print(f"   - Suggestions count: {len(result['suggestions'])}")

    print("\n ALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
