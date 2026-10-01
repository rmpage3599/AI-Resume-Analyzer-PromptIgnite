import streamlit as st
from utils.parser import extract_text_from_pdf, extract_text_from_docx
from utils.scorer import score_resume_against_jd

st.title("🤖 AI Resume Evaluator")

jd_text = st.text_area("Paste Job Description Here", height=300)
uploaded_files = st.file_uploader("Upload Resumes (PDF or DOCX)", type=["pdf", "docx"], accept_multiple_files=True)

if jd_text and uploaded_files:
    st.subheader("Resume Match Scores")
    for resume_file in uploaded_files:
        if resume_file.name.endswith(".pdf"):
            resume_text = extract_text_from_pdf(resume_file)
        elif resume_file.name.endswith(".docx"):
            resume_text = extract_text_from_docx(resume_file)
        else:
            st.warning(f"Unsupported file format: {resume_file.name}")
            continue

        score, breakdown = score_resume_against_jd(resume_text, jd_text)
        st.write(f"📄 {resume_file.name} → **Match Score: {score}%**")
        with st.expander("Breakdown"):
            st.json(breakdown)
