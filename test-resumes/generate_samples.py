"""Generate sample resume PDFs for testing the AI Resume Analyzer."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

OUTPUT_DIR = "test-resumes"

PROFILES = [
    {
        "filename": "resume_aiml_strong.pdf",
        # Strong match for AI/ML Engineer role
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "+91 98765 43210",
        "summary": (
            "Machine Learning Engineer with 3 years of experience building and deploying "
            "ML models. Strong in Python, NumPy, Pandas, and Scikit-learn, with production "
            "experience serving models."
        ),
        "skills": [
            "Python", "Machine Learning", "NumPy", "Pandas", "Scikit-learn",
            "SQL", "Docker", "FastAPI",
        ],
        "preferred_present": ["TensorFlow"],
        "education": [
            ("B.Tech Computer Science", "Indian Institute of Technology, Delhi", "2018 - 2022"),
        ],
        "experience": [
            ("Machine Learning Engineer", "DataWorks Labs", "Aug 2023 - Present",
             "Built recommendation models with Scikit-learn and Pandas. Deployed REST "
             "inference APIs with FastAPI and Docker. Reduced model latency by 40%."),
            ("Data Analyst Intern", "Analytix Solutions", "Jan 2023 - Jun 2023",
             "Wrote SQL pipelines and Python notebooks for churn analysis using NumPy "
             "and Pandas."),
        ],
    },
    {
        "filename": "resume_frontend_mismatch.pdf",
        # Weak match for AI/ML role - should trigger many missing skills
        "name": "Rahul Verma",
        "email": "rahul.verma@example.com",
        "phone": "+91 91234 56789",
        "summary": (
            "Frontend Developer focused on building accessible, responsive web interfaces "
            "with React and TypeScript. 2 years of experience shipping production UIs."
        ),
        "skills": [
            "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS",
            "HTML", "CSS", "Git",
        ],
        "preferred_present": [],
        "education": [
            ("B.E. Information Technology", "Pune University", "2019 - 2023"),
        ],
        "experience": [
            ("Frontend Developer", "WebCraft Studios", "Jul 2023 - Present",
             "Developed component libraries in React and Next.js. Implemented Tailwind "
             "design systems and improved Lighthouse performance score from 72 to 95."),
        ],
    },
    {
        "filename": "resume_backend_medium.pdf",
        # Partial match for Full Stack / Backend roles
        "name": "Aisha Khan",
        "email": "aisha.khan@example.com",
        "phone": "+91 90000 11111",
        "summary": (
            "Backend Developer with 4 years of experience designing REST APIs and "
            "relational databases. Some exposure to machine learning pipelines."
        ),
        "skills": [
            "Python", "Node.js", "SQL", "PostgreSQL", "Docker",
            "REST API", "Machine Learning", "Pandas",
        ],
        "preferred_present": [],
        "education": [
            ("M.Sc Data Science", "Christ University, Bangalore", "2020 - 2022"),
        ],
        "experience": [
            ("Backend Developer", "CloudScale Systems", "Mar 2022 - Present",
             "Designed PostgreSQL schemas and REST endpoints serving 50k daily requests. "
             "Built a Python-based ML scoring microservice."),
            ("Junior Developer", "StartUp Hub", "Jun 2021 - Feb 2022",
             "Maintained Node.js services and wrote SQL migration scripts."),
        ],
    },
]


def draw_wrapped(c, text, x, y, max_width, font="Helvetica", size=10, leading=13):
    c.setFont(font, size)
    words = text.split()
    line = ""
    for w in words:
        test = f"{line} {w}".strip()
        if c.stringWidth(test, font, size) > max_width:
            c.drawString(x, y, line)
            y -= leading
            line = w
        else:
            line = test
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y


def build(profile, path):
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    margin = 0.75 * inch
    y = height - margin
    right = width - margin

    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, y, profile["name"])
    y -= 18
    c.setFont("Helvetica", 9.5)
    c.drawString(margin, y, f"{profile['email']}  |  {profile['phone']}")
    y -= 8
    c.setStrokeColorRGB(0.2, 0.2, 0.2)
    c.line(margin, y, right, y)
    y -= 22

    # Summary
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "PROFESSIONAL SUMMARY")
    y -= 16
    y = draw_wrapped(c, profile["summary"], margin, y, right - margin)
    y -= 10

    # Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "SKILLS")
    y -= 16
    all_skills = profile["skills"] + profile["preferred_present"]
    y = draw_wrapped(c, ", ".join(all_skills), margin, y, right - margin, size=10)
    y -= 10

    # Education
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "EDUCATION")
    y -= 16
    for degree, inst, period in profile["education"]:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, degree)
        c.setFont("Helvetica", 10)
        c.drawRightString(right, y, period)
        y -= 13
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(margin, y, inst)
        y -= 18
    y -= 4

    # Experience
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "EXPERIENCE")
    y -= 16
    for role, company, period, bullets in profile["experience"]:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, f"{role} - {company}")
        c.setFont("Helvetica", 10)
        c.drawRightString(right, y, period)
        y -= 13
        y = draw_wrapped(c, bullets, margin + 10, y, right - margin - 10, size=9.5, leading=12)
        y -= 8

    c.showPage()
    c.save()
    print(f"created {path}")


if __name__ == "__main__":
    import os
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for p in PROFILES:
        build(p, os.path.join(OUTPUT_DIR, p["filename"]))
