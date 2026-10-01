import os
import sys
import io
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from main import app

client = TestClient(app)

def test_all_endpoints():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE FASTAPI & DATABASE ENDPOINT TESTS")
    print("=" * 60)

    # 1. Test GET /api/health
    print("\n[TEST 1] GET /api/health")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health_data = res.json()
    print(f" Status: {res.status_code}")
    print(f" Response: {json.dumps(health_data, indent=2)}")

    # 2. Test GET /api/jobs
    print("\n[TEST 2] GET /api/jobs")
    res = client.get("/api/jobs")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    jobs_data = res.json()
    assert isinstance(jobs_data, list) and len(jobs_data) == 5
    print(f" Status: {res.status_code}")
    print(f" Total Jobs Returned: {len(jobs_data)}")

    # 3. Test POST /api/analyze with Automatic Persistence
    print("\n[TEST 3] POST /api/analyze (aiml-engineer) with Auto-Save")
    sample_pdf_path = os.path.join(os.path.dirname(__file__), "sample_data", "sample_resume.pdf")
    with open(sample_pdf_path, "rb") as f:
        pdf_bytes = f.read()

    res = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"jobRole": "aiml-engineer"}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    analyze_data = res.json()
    saved_id = analyze_data.get("id")
    assert saved_id is not None, "Record ID was not returned by /api/analyze"
    print(f" Status: {res.status_code}")
    print(f" Record ID created: {saved_id}")
    print(f" Database Backend: {analyze_data.get('databaseBackend')}")
    print(f" Match Score: {analyze_data.get('matchScore')}%")
    print(f" Candidate Name: {analyze_data.get('candidate', {}).get('name')}")

    # 4. Test GET /api/history
    print("\n[TEST 4] GET /api/history")
    res_hist = client.get("/api/history")
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert hist_data.get("total", 0) > 0, "Expected at least 1 record in history"
    print(f" Status: {res_hist.status_code}")
    print(f" Total History Items: {hist_data.get('total')}")
    latest_item = hist_data["history"][0]
    print(f" Latest Item: Candidate={latest_item['candidateName']}, Role={latest_item['jobRoleId']}, Score={latest_item['matchScore']}%")

    # 5. Test GET /api/history/{id}
    print(f"\n[TEST 5] GET /api/history/{saved_id}")
    res_detail = client.get(f"/api/history/{saved_id}")
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert detail_data.get("id") == saved_id
    print(f" Status: {res_detail.status_code}")
    print(f" Successfully fetched detail for: {detail_data.get('candidate', {}).get('name')}")
    print(f" Matched Skills: {detail_data.get('matchedSkills')}")

    # 6. Test Error Handling: Invalid file extension (.txt)
    print("\n[TEST 6] POST /api/analyze (Invalid file format .txt)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("test.txt", b"plain text", "text/plain")},
        data={"jobRole": "aiml-engineer"}
    )
    assert res.status_code == 400

    # 7. Test Error Handling: Unknown Job Role ID
    print("\n[TEST 7] POST /api/analyze (Unknown jobRole)")
    res = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"jobRole": "astronaut-pilot"}
    )
    assert res.status_code == 404

    # 8. Test Error Handling: History 404
    print("\n[TEST 8] GET /api/history/non-existent-id")
    res_404 = client.get("/api/history/non-existent-id")
    assert res_404.status_code == 404

    print("\n" + "=" * 60)
    print("ALL API & DATABASE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    test_all_endpoints()
