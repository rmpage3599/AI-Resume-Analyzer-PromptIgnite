import streamlit as st
import os
import json
from utils.parser import extract_text_from_pdf, extract_text_from_docx
from utils.matcher import load_jobs, compare_multiple_roles
from utils.ai_engine import analyze_resume_pipeline
from database.db_manager import get_history, get_history_detail, is_supabase_configured

st.set_page_config(
    page_title="AI Resume Analyzer & Multi-Role Benchmark",
    page_icon="📄",
    layout="wide"
)

st.title("📄 AI Resume Analyzer & Multi-Role Benchmark")
st.caption(f"Powered by Python NLP & Supabase Cloud • Active Database: {'Supabase Cloud' if is_supabase_configured() else 'Local SQLite'}")

tab_single, tab_multi, tab_history = st.tabs([
    "🎯 Single Role / Custom JD Analysis",
    "🏆 Multi-Role Leaderboard Comparison",
    "🕒 Past Analyses History"
])

# -------------------------------------------------------------
# TAB 1: Single Role / Custom JD
# -------------------------------------------------------------
with tab_single:
    col_input, col_config = st.columns([2, 1])
    
    with col_input:
        uploaded_file = st.file_uploader("Upload Candidate Resume (PDF)", type=["pdf", "docx"], key="single_upload")
        
        mode = st.radio("Benchmark Mode:", ["Select Predefined Role", "Paste Custom Job Description"], horizontal=True)
        custom_jd = ""
        selected_role_id = "aiml-engineer"
        
        if mode == "Select Predefined Role":
            jobs = load_jobs()
            job_options = {job["title"]: job["id"] for job in jobs}
            selected_title = st.selectbox("Select Target Role:", list(job_options.keys()))
            selected_role_id = job_options[selected_title]
        else:
            custom_jd = st.text_area("Paste Job Description Text:", height=150, placeholder="Paste requirements, skills, and qualifications...")

    with col_config:
        st.subheader("ℹ️ System Status")
        st.write(f"**Database:** {'🟢 Supabase Cloud' if is_supabase_configured() else '🟡 Local SQLite'}")
        st.write(f"**Groq AI:** {'🟢 Configured' if os.getenv('GROQ_API_KEY') else '⚪ Local Engine (Fallback)'}")
        st.write(f"**Total Predefined Roles:** {len(load_jobs())}")

    if uploaded_file and st.button("🚀 Run Comprehensive Analysis", type="primary", use_container_width=True):
        with st.spinner("Analyzing resume against requirements and computing ATS metrics..."):
            file_bytes = uploaded_file.read()
            text = extract_text_from_pdf(file_bytes) if uploaded_file.name.endswith(".pdf") else extract_text_from_docx(file_bytes)

            result = analyze_resume_pipeline(
                resume_text=text,
                job_role_id=selected_role_id if mode == "Select Predefined Role" else None,
                custom_jd_text=custom_jd if mode == "Paste Custom Job Description" else None
            )

            st.markdown("---")
            # Top Score Cards
            m1, m2, m3, m4 = st.columns(4)
            with m1:
                st.metric("🎯 Job Match Score", f"{result['matchScore']}%")
                st.progress(result["matchScore"] / 100.0)
            with m2:
                st.metric("📊 Overall ATS Score", f"{result['atsScore']}/100")
                st.progress(result["atsScore"] / 100.0)
            with m3:
                st.metric("👤 Candidate", result["candidate"]["name"])
                if result["candidate"].get("email"):
                    st.caption(f"✉️ {result['candidate']['email']}")
            with m4:
                st.metric("✅ Matched Skills", len(result["matchedSkills"]))
                st.metric("⚠️ Missing Skills", len(result["missingSkills"]))

            # ATS Breakdown
            st.markdown("### 📊 ATS Rubric Breakdown")
            ats = result.get("atsRubric", {})
            sub = ats.get("subScores", {})
            
            c_ats1, c_ats2, c_ats3, c_ats4 = st.columns(4)
            with c_ats1:
                st.write(f"**Keyword Match:** {sub.get('keywordMatchScore', {}).get('score')}/40")
            with c_ats2:
                st.write(f"**Impact & Metrics:** {sub.get('impactQuantificationScore', {}).get('score')}/25")
            with c_ats3:
                st.write(f"**Power Verbs:** {sub.get('actionVerbScore', {}).get('score')}/20")
            with c_ats4:
                st.write(f"**Readability:** {sub.get('formattingReadabilityScore', {}).get('score')}/15")

            # Skills Split
            st.markdown("### 🔍 Skill Gap Analysis")
            col_match, col_miss = st.columns(2)
            with col_match:
                st.markdown("#### ✅ Matched Skills")
                st.write(" ".join([f"`{s}`" for s in result["matchedSkills"]]) if result["matchedSkills"] else "No direct matches.")
            with col_miss:
                st.markdown("#### ⚠️ Missing Skills")
                st.write(" ".join([f"`{s}`" for s in result["missingSkills"]]) if result["missingSkills"] else "All required skills covered!")

            # Categorized Skills
            with st.expander("📚 View Categorized Candidate Skills"):
                for cat, skills in result.get("categorizedSkills", {}).items():
                    st.write(f"**{cat}:** {', '.join(skills)}")

            # Suggestions
            st.markdown("### 💡 Actionable Improvement Suggestions")
            for i, tip in enumerate(result["suggestions"], 1):
                st.info(f"**{i}.** {tip}")

# -------------------------------------------------------------
# TAB 2: Multiple Job Role Leaderboard
# -------------------------------------------------------------
with tab_multi:
    st.subheader("🏆 Multi-Role Compatibility Benchmark")
    st.caption("Upload a resume to automatically benchmark it across all 12 predefined industry roles and find the best career fit.")

    multi_file = st.file_uploader("Upload Resume for Multi-Role Benchmark (PDF)", type=["pdf", "docx"], key="multi_upload")

    if multi_file and st.button("⚡ Compare Across All 12 Roles", type="primary"):
        with st.spinner("Comparing candidate against all 12 job roles..."):
            file_bytes = multi_file.read()
            text = extract_text_from_pdf(file_bytes) if multi_file.name.endswith(".pdf") else extract_text_from_docx(file_bytes)
            skills = extract_skills(text)

            comp = compare_multiple_roles(skills, text)

            st.success(f"Best Career Fit: **{comp['bestFitRole']}** with **{comp['bestFitScore']}%** match!")

            for rank, r in enumerate(comp["rankings"], 1):
                with st.expander(f"#{rank:02d} [{r['matchScore']}% Match] {r['jobTitle']}"):
                    st.progress(r["matchScore"] / 100.0)
                    r_c1, r_c2 = st.columns(2)
                    with r_c1:
                        st.write(f"**Matched Skills ({r['matchedSkillsCount']}):** {', '.join(r['topMatchedSkills'])}")
                    with r_c2:
                        st.write(f"**Missing Skills ({r['missingSkillsCount']}):** {', '.join(r['topMissingSkills'])}")

# -------------------------------------------------------------
# TAB 3: History
# -------------------------------------------------------------
with tab_history:
    st.subheader("🕒 Past Candidate Evaluations")
    history_records = get_history(limit=25)
    if history_records:
        for item in history_records:
            with st.expander(f"📄 {item['candidateName']} — {item['jobRoleId']} ({item['matchScore']}%) | {item.get('createdAt', '')[:10]}"):
                st.write(f"**Record ID:** `{item['id']}`")
                st.write(f"**File Name:** {item['fileName']}")
                detail = get_history_detail(item["id"])
                if detail:
                    st.write(f"**Matched:** {', '.join(detail.get('matchedSkills', []))}")
                    st.write(f"**Missing:** {', '.join(detail.get('missingSkills', []))}")
    else:
        st.info("No past evaluations saved yet. Upload a resume to populate history!")
