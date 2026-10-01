import os
import sys
import io
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from main import app

client = TestClient(app)

def test_all_endpoints():
    results = {}
    print("=" * 60)
    print("RUNNING COMPREHENSIVE FASTAPI ENDPOINT TESTS")
    print("=" * 60)

    # 1. Test GET /api/health
    print("\n[TEST 1] GET /api/health")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health_data = res.json()
    print(f" Status: {res.status_code}")
    print(f" Response: {json.dumps(health_data, indent=2)}")
    results["GET /api/health"] = {"status": res.status_code, "data": health_data}

    # 2. Test GET /api/jobs
    print("\n[TEST 2] GET /api/jobs")
    res = client.get("/api/jobs")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    jobs_data = res.json()
    assert isinstance(jobs_data, list) and len(jobs_data) == 5
    print(f" Status: {res.status_code}")
    print(f" Total Jobs Returned: {len(jobs_data)}")
    print(f" Roles: {[j['id'] for j in jobs_data]}")
    results["GET /api/jobs"] = {"status": res.status_code, "data": jobs_data}

    # Prepare sample resume
    sample_pdf_path = os.path.join(os.path.dirname(__file__), "sample_data", "sample_resume.pdf")
    with open(sample_pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # 3. Test POST /api/analyze (AI/ML Engineer role)
    print("\n[TEST 3] POST /api/analyze (aiml-engineer)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"jobRole": "aiml-engineer"}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    analyze_data = res.json()
    print(f" Status: {res.status_code}")
    print(f" Match Score: {analyze_data.get('matchScore')}%")
    print(f" Candidate Name: {analyze_data.get('candidate', {}).get('name')}")
    print(f" Matched Skills ({len(analyze_data.get('matchedSkills', []))}): {analyze_data.get('matchedSkills')}")
    print(f" Missing Skills ({len(analyze_data.get('missingSkills', []))}): {analyze_data.get('missingSkills')}")
    print(f" Suggestions ({len(analyze_data.get('suggestions', []))}): {analyze_data.get('suggestions')}")
    results["POST /api/analyze (aiml-engineer)"] = {"status": res.status_code, "data": analyze_data}

    # 4. Test POST /api/analyze (Frontend Developer role to verify missing skills calculation)
    print("\n[TEST 4] POST /api/analyze (frontend-developer - gap testing)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"jobRole": "frontend-developer"}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    fe_data = res.json()
    print(f" Status: {res.status_code}")
    print(f" Match Score: {fe_data.get('matchScore')}%")
    print(f" Matched Skills: {fe_data.get('matchedSkills')}")
    print(f" Missing Skills: {fe_data.get('missingSkills')}")
    results["POST /api/analyze (frontend-developer)"] = {"status": res.status_code, "data": fe_data}

    # 5. Test Error Handling: Invalid file extension (.txt)
    print("\n[TEST 5] POST /api/analyze (Invalid file format .txt)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("test.txt", b"plain text", "text/plain")},
        data={"jobRole": "aiml-engineer"}
    )
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print(f" Status: {res.status_code} (Properly rejected unsupported extension)")
    print(f" Detail: {res.json().get('detail')}")

    # 6. Test Error Handling: Empty file (0 bytes)
    print("\n[TEST 6] POST /api/analyze (Empty 0-byte file)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("empty.pdf", b"", "application/pdf")},
        data={"jobRole": "aiml-engineer"}
    )
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print(f" Status: {res.status_code} (Properly rejected empty file)")
    print(f" Detail: {res.json().get('detail')}")

    # 7. Test Error Handling: Invalid/Unknown Job Role ID
    print("\n[TEST 7] POST /api/analyze (Unknown jobRole)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"jobRole": "astronaut-pilot"}
    )
    assert res.status_code == 404, f"Expected 404, got {res.status_code}"
    print(f" Status: {res.status_code} (Properly returned 404 for unknown role)")
    print(f" Detail: {res.json().get('detail')}")

    # 8. Test Error Handling: Missing parameters (422 Unprocessable Entity)
    print("\n[TEST 8] POST /api/analyze (Missing jobRole)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")}
    )
    assert res.status_code == 422, f"Expected 422, got {res.status_code}"
    print(f" Status: {res.status_code} (FastAPI correctly returned 422 validation error)")

    print("\n" + "=" * 60)
    print("ALL 8 ENDPOINT SCENARIOS PASSED WITH PERFECT STATUS CODES!")
    print("=" * 60)

    # Save results to a temporary JSON file to feed exact examples into the integration guide
    with open("test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    test_all_endpoints()
