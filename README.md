# 📄 AI Resume Analyzer - PromptIgnite

An intelligent, lightweight resume evaluation and screening engine built with Python, Streamlit, and NLP. It extracts key candidate information from resumes, compares them against target job descriptions, calculates ATS match scores, highlights missing skills, and provides actionable improvement feedback.

---

## 🚀 Features

- 📑 **Multi-Format Resume Parsing** – Extracts structured text from PDF and DOCX files.
- 🎯 **Job Role & JD Matching** – Compare resumes against predefined industry roles or custom job descriptions.
- 📊 **Smart ATS Scoring** – Combines TF-IDF semantic vector similarity with skill matching.
- 🔍 **Skill Gap Analysis** – Instantly view matched skills and critical missing skills.
- 💡 **Improvement Suggestions** – Actionable advice for ATS optimization, formatting, and impactful bullet points.
- 🗄️ **Database Ready** – Clean, modular architecture designed to plug into Supabase or custom backends.

---

## 📁 Project Structure

```text
AI-Resume-Analyzer-PromptIgnite/
├── app.py                 # Streamlit web application
├── utils/
│   ├── parser.py          # PDF / DOCX text extraction
│   ├── scorer.py          # TF-IDF similarity & scoring logic
│   └── matcher.py         # Keyword & skill matching
├── sample_data/
│   ├── sample_resume.pdf  # Test resume
│   └── sample_jd.txt      # Test job description
├── requirements.txt       # Dependencies
└── README.md              # Project documentation
```

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rmpage3599/AI-Resume-Analyzer-PromptIgnite.git
   cd AI-Resume-Analyzer-PromptIgnite
   ```

2. **Create and activate a virtual environment (optional):**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   streamlit run app.py
   ```

---

## 📄 License
MIT License
