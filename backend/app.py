import streamlit as st
import os
import json
from utils.parser import extract_text_from_pdf, extract_text_from_docx
from utils.matcher import load_jobs
from utils.ai_engine import analyze_resume_pipeline

st.set_page_config(
    page_title="AI Resume Analyzer - PromptIgnite",
    page_icon="📄",
    layout="wide"
)

st.title("📄 AI Resume Analyzer — PromptIgnite")
st.caption("Upload a resume PDF, select a target role, and evaluate match score, extracted entities, and skill gaps.")

# Sidebar - Settings & Info
with st.sidebar:
    st.header("⚙️ Configuration")
    jobs = load_jobs()
    job_options = {job["title"]: job["id"] for job in jobs}
    selected_title = st.selectbox("Select Target Job Role:", list(job_options.keys()))
    selected_role_id = job_options[selected_title]

    selected_job = next((j for j in jobs if j["id"] == selected_role_id), None)
    if selected_job:
        st.subheader("Required Skills")
        st.write(", ".join(selected_job.get("requiredSkills", [])))
        st.subheader("Preferred Skills")
        st.write(", ".join(selected_job.get("preferredSkills", [])))

# Main Area
uploaded_file = st.file_uploader("Upload Resume (PDF)", type=["pdf", "docx"])

if uploaded_file:
    st.info(f"📁 Selected: **{uploaded_file.name}** ({round(uploaded_file.size / 1024, 1)} KB)")

    if st.button("🚀 Analyze Resume", type="primary", use_container_width=True):
        with st.spinner("Extracting text and analyzing against role requirements..."):
            file_bytes = uploaded_file.read()
            if uploaded_file.name.endswith(".pdf"):
                text = extract_text_from_pdf(file_bytes)
            else:
                text = extract_text_from_docx(file_bytes)

            if not text or len(text.strip()) < 30:
                st.error("Could not extract readable text from document. Please ensure it is a valid PDF.")
            else:
                result = analyze_resume_pipeline(text, selected_role_id)

                # Results Dashboard
                st.markdown("---")
                col1, col2, col3 = st.columns([1, 1, 1])
                with col1:
                    score = result.get("matchScore", 0)
                    st.metric("🎯 Job Match Score", f"{score}%")
                    st.progress(score / 100.0)
                with col2:
                    st.metric("👤 Candidate", result.get("candidate", {}).get("name", "Candidate"))
                with col3:
                    st.metric("✅ Matched Skills", len(result.get("matchedSkills", [])))

                st.markdown("### 🔍 Skill Gap Analysis")
                gap_col1, gap_col2 = st.columns(2)
                with gap_col1:
                    st.markdown("#### ✅ Matched Skills")
                    matched = result.get("matchedSkills", [])
                    if matched:
                        st.write(" ".join([f"`{s}`" for s in matched]))
                    else:
                        st.warning("No direct required skill matches found.")

                with gap_col2:
                    st.markdown("#### ⚠️ Missing Skills")
                    missing = result.get("missingSkills", [])
                    if missing:
                        st.write(" ".join([f"`{s}`" for s in missing]))
                    else:
                        st.success("All primary required skills are covered!")

                # Education & Experience
                st.markdown("---")
                col_edu, col_exp = st.columns(2)
                with col_edu:
                    st.markdown("### 🎓 Education")
                    for edu in result.get("education", []):
                        st.write(f"- **{edu.get('degree')}** — *{edu.get('institution')}* ({edu.get('duration')})")

                with col_exp:
                    st.markdown("### 💼 Experience")
                    for exp in result.get("experience", []):
                        st.write(f"- **{exp.get('role')}** at *{exp.get('company')}* ({exp.get('duration')})")

                # Suggestions
                st.markdown("---")
                st.markdown("### 💡 Actionable Improvement Suggestions")
                for i, tip in enumerate(result.get("suggestions", []), 1):
                    st.info(f"**{i}.** {tip}")

                with st.expander("📄 View Structured JSON Response"):
                    st.json(result)
