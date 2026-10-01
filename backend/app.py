import streamlit as st
import os
import sys
import json
from dotenv import load_dotenv

# Ensure backend directory is in path and env vars are loaded
sys.path.insert(0, os.path.dirname(__file__))
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv()

from utils.parser import extract_text_from_pdf, extract_text_from_docx, extract_skills
from utils.matcher import load_jobs, compare_multiple_roles
from utils.ai_engine import analyze_resume_pipeline
from database.db_manager import get_history, get_history_detail, is_supabase_configured, save_analysis

st.set_page_config(
    page_title="AI Resume Analyzer & Multi-Role Benchmark",
    page_icon="",
    layout="wide"
)

st.title("AI Resume Analyzer & Multi-Role Benchmark")
db_status_text = "[Active] Supabase Cloud" if is_supabase_configured() else "[Local] Local SQLite"
ai_status_text = "[Active] Groq Cloud AI (Active)" if os.getenv("GROQ_API_KEY") else "[Fallback] Local Deterministic Engine"
st.caption(f"Powered by Python NLP & Groq AI • Active Database: **{db_status_text}** • AI Engine: **{ai_status_text}**")

tab_single, tab_multi, tab_history = st.tabs([
    "Single Role / Custom JD Analysis",
    "Multi-Role Leaderboard Comparison",
    "Past Analyses History"
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
        st.subheader("System Status")
        st.write(f"**Database:** {'[Active] Supabase Cloud' if is_supabase_configured() else '[Local] Local SQLite'}")
        st.write(f"**Groq AI:** {'[Active] Configured' if os.getenv('GROQ_API_KEY') else '[Fallback] Local Engine (Fallback)'}")
        st.write(f"**Total Predefined Roles:** {len(load_jobs())}")

    if uploaded_file and st.button("Run Comprehensive Analysis", type="primary", use_container_width=True):
        with st.spinner("Analyzing resume, running Groq AI reasoning, and computing ATS rubric..."):
            file_bytes = uploaded_file.read()
            text = extract_text_from_pdf(file_bytes) if uploaded_file.name.endswith(".pdf") else extract_text_from_docx(file_bytes)

            result = analyze_resume_pipeline(
                resume_text=text,
                job_role_id=selected_role_id if mode == "Select Predefined Role" else None,
                custom_jd_text=custom_jd if mode == "Paste Custom Job Description" else None
            )

            # Persist to active database (Supabase Cloud or SQLite)
            save_res = save_analysis(
                file_name=uploaded_file.name,
                candidate_name=result.get("candidate", {}).get("name", "Candidate"),
                raw_text=text,
                job_role_id=selected_role_id if mode == "Select Predefined Role" else "custom-jd",
                analysis_result=result
            )

            st.markdown("---")
            saved_backend = "Supabase Cloud" if save_res.get("backend") == "supabase" else "Local SQLite"
            st.success(f"Analysis complete & persisted to **{saved_backend}** (Record ID: `{save_res.get('id', '')[:8]}...`)")

            # Top Score Cards
            m1, m2, m3, m4 = st.columns(4)
            with m1:
                st.metric("Job Match Score", f"{result['matchScore']}%")
                st.progress(result["matchScore"] / 100.0)
            with m2:
                st.metric("Overall ATS Score", f"{result['atsScore']}/100")
                st.progress(result["atsScore"] / 100.0)
            with m3:
                st.metric("Candidate", result["candidate"]["name"])
                if result["candidate"].get("email"):
                    st.caption(f"{result['candidate']['email']}")
                if result["candidate"].get("phone"):
                    st.caption(f"{result['candidate']['phone']}")
            with m4:
                st.metric("Matched Skills", len(result["matchedSkills"]))
                st.metric("Missing Skills", len(result["missingSkills"]))

            # ATS Breakdown
            st.markdown("### ATS Rubric Breakdown")
            ats = result.get("atsRubric", {})
            sub = ats.get("subScores", {})
            
            c_ats1, c_ats2, c_ats3, c_ats4 = st.columns(4)
            with c_ats1:
                st.write(f"**Keyword Match:** {sub.get('keywordMatchScore', {}).get('score', 0)}/40")
            with c_ats2:
                st.write(f"**Impact & Metrics:** {sub.get('impactQuantificationScore', {}).get('score', 0)}/25")
            with c_ats3:
                st.write(f"**Power Verbs:** {sub.get('actionVerbScore', {}).get('score', 0)}/20")
            with c_ats4:
                st.write(f"**Readability:** {sub.get('formattingReadabilityScore', {}).get('score', 0)}/15")

            # Skills Split
            st.markdown("### Skill Gap Analysis")
            col_match, col_miss = st.columns(2)
            with col_match:
                st.markdown("#### Matched Skills")
                st.write(" ".join([f"`{s}`" for s in result["matchedSkills"]]) if result["matchedSkills"] else "No direct matches.")
            with col_miss:
                st.markdown("#### Missing Skills")
                st.write(" ".join([f"`{s}`" for s in result["missingSkills"]]) if result["missingSkills"] else "All required skills covered!")

            # Categorized Skills
            with st.expander("View Categorized Candidate Skills"):
                for cat, skills in result.get("categorizedSkills", {}).items():
                    st.write(f"**{cat}:** {', '.join(skills)}")

            # Groq AI STAR Rewrites
            if result.get("starRewrites"):
                st.markdown("### Groq AI: Executive STAR Bullet Point Rewrites")
                st.caption("AI-enhanced bullet points transforming passive work items into Situation-Task-Action-Result format with active verbs:")
                for rw in result["starRewrites"]:
                    with st.container():
                        st.markdown(f"**Original Bullet:** *\"{rw.get('originalBullet', '')}\"*")
                        st.markdown(f"**High-Impact STAR Rewrite:** {rw.get('improvedStarBullet', '')}")
                        st.markdown("---")

            # Suggestions
            st.markdown("### Actionable Improvement Suggestions")
            for i, tip in enumerate(result["suggestions"], 1):
                st.info(f"**{i}.** {tip}")


# -------------------------------------------------------------
# TAB 2: Multiple Job Role Leaderboard
# -------------------------------------------------------------
with tab_multi:
    st.subheader("Multi-Role Compatibility Benchmark")
    st.caption("Upload a resume to automatically benchmark it across all 12 predefined industry roles and find the best career fit.")

    multi_file = st.file_uploader("Upload Resume for Multi-Role Benchmark (PDF or DOCX)", type=["pdf", "docx"], key="multi_upload")

    if multi_file and st.button("Compare Across All 12 Roles", type="primary", use_container_width=True):
        with st.spinner("Extracting candidate skills and benchmarking across all 12 job profiles..."):
            file_bytes = multi_file.read()
            text = extract_text_from_pdf(file_bytes) if multi_file.name.endswith(".pdf") else extract_text_from_docx(file_bytes)
            skills = extract_skills(text)

            comp = compare_multiple_roles(skills, text)

            st.success(f"Best Career Fit: **{comp['bestFitRole']}** with **{comp['bestFitScore']}%** match!")

            c1, c2, c3 = st.columns(3)
            with c1:
                st.metric("Total Roles Evaluated", comp["totalRolesCompared"])
            with c2:
                st.metric("Candidate Skills Detected", len(skills))
            with c3:
                st.metric("Top Fit Match", f"{comp['bestFitScore']}%")

            st.markdown("### Ranked Role Leaderboard")
            for rank, r in enumerate(comp["rankings"], 1):
                role_icon = "#01" if rank == 1 else "#02" if rank == 2 else "#03" if rank == 3 else f"#{rank:02d}"
                with st.expander(f"{role_icon} [{r['matchScore']}% Match] {r['jobTitle']}"):
                    st.progress(r["matchScore"] / 100.0)
                    r_c1, r_c2 = st.columns(2)
                    with r_c1:
                        st.write(f"**Matched Skills ({r['matchedSkillsCount']}):**")
                        st.write(" ".join([f"`{s}`" for s in r['topMatchedSkills']]) if r['topMatchedSkills'] else "None")
                    with r_c2:
                        st.write(f"**Missing Skills ({r['missingSkillsCount']}):**")
                        st.write(" ".join([f"`{s}`" for s in r['topMissingSkills']]) if r['topMissingSkills'] else "None")

# -------------------------------------------------------------
# TAB 3: History & Past Analyses
# -------------------------------------------------------------
with tab_history:
    h_col1, h_col2 = st.columns([3, 1])
    with h_col1:
        st.subheader("Past Candidate Evaluations")
        st.caption("All resume evaluations are stored securely in Supabase Cloud with SQLite fallback.")
    with h_col2:
        if st.button("Refresh History", use_container_width=True):
            st.rerun()

    history_records = get_history(limit=50)
    if history_records:
        search_query = st.text_input("Search evaluations by candidate name or role:", placeholder="Type name or role...").strip().lower()
        
        filtered = [
            item for item in history_records
            if not search_query or search_query in str(item.get("candidateName", "")).lower() or search_query in str(item.get("jobRoleId", "")).lower()
        ]

        st.caption(f"Showing {len(filtered)} of {len(history_records)} evaluations")

        for item in filtered:
            cand_name = item.get("candidateName") or "Unknown Candidate"
            role_name = item.get("jobRoleId") or "Selected Role"
            score = item.get("matchScore", 0)
            created_date = (item.get("createdAt") or "")[:10]
            
            with st.expander(f"{cand_name} — {role_name} ({score}%) | {created_date}"):
                c_meta1, c_meta2 = st.columns(2)
                with c_meta1:
                    st.write(f"**Candidate:** {cand_name}")
                    st.write(f"**Target Role:** `{role_name}`")
                    st.write(f"**Job Match Score:** {score}%")
                with c_meta2:
                    st.write(f"**File Name:** {item.get('fileName', 'resume.pdf')}")
                    st.write(f"**Evaluation Date:** {created_date}")
                    st.write(f"**Record ID:** `{item.get('id', '')}`")

                # Fetch full detailed record
                detail = get_history_detail(item["id"])
                if detail:
                    st.markdown("---")
                    d_col1, d_col2 = st.columns(2)
                    with d_col1:
                        matched = detail.get("matchedSkills", [])
                        st.markdown("**Matched Skills:**")
                        st.write(" ".join([f"`{s}`" for s in matched]) if matched else "None")
                    with d_col2:
                        missing = detail.get("missingSkills", [])
                        st.markdown("**Missing Skills:**")
                        st.write(" ".join([f"`{s}`" for s in missing]) if missing else "All covered!")

                    suggestions = detail.get("suggestions", [])
                    if suggestions:
                        st.markdown("**Key Improvement Suggestions:**")
                        for s_idx, tip in enumerate(suggestions[:3], 1):
                            st.write(f"{s_idx}. {tip}")
    else:
        st.info("No past evaluations found. Analyze a resume in Tab 1 to populate history!")

