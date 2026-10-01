import os
import sys
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from main import app

client = TestClient(app)

def run_advanced_tests():
    print("=" * 60)
    print("TESTING ADVANCED ATS & MULTI-ROLE COMPARISON ENGINE")
    print("=" * 60)

    # 1. Test 12 Job Roles
    print("\n[TEST 1] GET /api/jobs (Expanded Roles)")
    res = client.get("/api/jobs")
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) == 12, f"Expected 12 jobs, got {len(jobs)}"
    print(f" Successfully loaded all {len(jobs)} industry job roles:")
    for j in jobs:
        print(f"   - {j['id']}: {j['title']} ({len(j['requiredSkills'])} required, {len(j['preferredSkills'])} preferred)")

    # Load test resume
    pdf_path = os.path.join(os.path.dirname(__file__), "sample_data", "sample_resume.pdf")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # 2. Test ATS Rubric /100 & Contact Info
    print("\n[TEST 2] POST /api/analyze with ATS Rubric & Contact Info")
    res_analyze = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"jobRole": "aiml-engineer"}
    )
    assert res_analyze.status_code == 200, f"Error: {res_analyze.text}"
    data = res_analyze.json()
    print(f" Candidate Name: {data['candidate']['name']}")
    print(f" Email: {data['candidate'].get('email')}")
    print(f" Phone: {data['candidate'].get('phone')}")
    print(f" Overall ATS Score: {data['atsScore']}/100")
    print(f" Match Score: {data['matchScore']}%")
    print(" Sub-Scores:")
    for k, v in data["atsRubric"]["subScores"].items():
        print(f"   - {k}: {v['score']}/{v['max']}")
    print(f" Categorized Skills ({len(data['categorizedSkills'])} categories):")
    for cat, skl in data["categorizedSkills"].items():
        print(f"   * {cat}: {skl}")

    # 3. Test Custom Job Description Matching
    print("\n[TEST 3] POST /api/analyze with Custom Job Description")
    custom_jd = """
    We are seeking a Full Stack Cloud Engineer proficient in React, TypeScript, Docker, Kubernetes,
    and PostgreSQL to build enterprise cloud applications. Experience with REST APIs and Linux required.
    """
    res_custom = client.post(
        "/api/analyze",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")},
        data={"customJd": custom_jd}
    )
    assert res_custom.status_code == 200, f"Error: {res_custom.text}"
    custom_data = res_custom.json()
    print(f" Target Job: {custom_data['targetJobTitle']}")
    print(f" Match Score: {custom_data['matchScore']}%")
    print(f" Matched Skills: {custom_data['matchedSkills']}")
    print(f" Missing Skills: {custom_data['missingSkills']}")

    # 4. Test Multiple Job Role Comparison (Leaderboard)
    print("\n[TEST 4] POST /api/compare-roles (All 12 Roles Ranked)")
    res_compare = client.post(
        "/api/compare-roles",
        files={"resume": ("sample_resume.pdf", pdf_bytes, "application/pdf")}
    )
    assert res_compare.status_code == 200, f"Error: {res_compare.text}"
    comp_data = res_compare.json()
    print(f" Total Roles Evaluated: {comp_data['totalRolesCompared']}")
    print(f" Best Fit Role: {comp_data['bestFitRole']} ({comp_data['bestFitScore']}%)")
    print(" Full Multi-Role Leaderboard (Ranked):")
    for idx, r in enumerate(comp_data["rankings"], 1):
        print(f"   #{idx:02d} [{r['matchScore']:3d}%] {r['jobTitle']:<40} (Matched: {r['matchedSkillsCount']}, Missing: {r['missingSkillsCount']})")

    # Verify best role has highest score
    scores = [r["matchScore"] for r in comp_data["rankings"]]
    assert scores == sorted(scores, reverse=True), "Rankings not properly sorted descending"

    print("\n" + "=" * 60)
    print("ALL ADVANCED FEATURES (ATS /100, CUSTOM JD, MULTI-ROLE) PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_advanced_tests()
