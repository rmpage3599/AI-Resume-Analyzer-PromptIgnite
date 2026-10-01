import re
import fitz  # PyMuPDF
import docx
import io
from typing import Dict, List, Any

# Curated comprehensive skills dictionary grouped by domains
COMMON_SKILLS = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Golang", "Rust",
    "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "Dart", "Bash", "Shell", "SQL",
    # Frontend
    "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "HTML", "HTML5", "CSS", "CSS3",
    "Tailwind CSS", "Bootstrap", "Sass", "Redux", "Redux Toolkit", "GraphQL", "REST APIs",
    "Webpack", "Vite", "Material UI", "Chakra UI", "Responsive Design",
    # Backend & Frameworks
    "Node.js", "Express", "Express.js", "FastAPI", "Flask", "Django", "Spring Boot",
    "ASP.NET", "Ruby on Rails", "NestJS", "Microservices", "RESTful APIs", "gRPC", "WebSocket",
    # AI / Machine Learning & Data Science
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "NumPy", "Pandas",
    "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "OpenCV", "NLP", "Natural Language Processing",
    "Computer Vision", "Transformers", "Hugging Face", "LLMs", "Large Language Models", "LangChain",
    "Data Analysis", "Data Visualization", "Matplotlib", "Seaborn", "Statistics", "Predictive Modeling",
    # Databases & Storage
    "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Supabase", "Firebase",
    "DynamoDB", "Cassandra", "Elasticsearch", "Prisma", "SQLAlchemy", "Firestore",
    # Cloud & DevOps
    "Git", "GitHub", "GitLab", "Docker", "Kubernetes", "AWS", "Amazon Web Services",
    "Azure", "Google Cloud", "GCP", "CI/CD", "Linux", "Terraform", "Nginx", "Jenkins",
    # Analytics & Business Intelligence
    "Power BI", "Tableau", "Excel", "Advanced Excel", "ETL", "Data Warehousing", "Snowflake", "BigQuery",
    # Methodologies & Soft Skills
    "Agile", "Scrum", "Problem Solving", "Communication", "Leadership", "Teamwork"
]

DEGREE_PATTERNS = [
    r"(?i)\b(b\.?tech|bachelor of technology|b\.?e\.?|bachelor of engineering)\b",
    r"(?i)\b(b\.?s\.?|b\.?sc|bachelor of science)\b",
    r"(?i)\b(b\.?c\.?a\.?|bachelor of computer applications)\b",
    r"(?i)\b(m\.?tech|master of technology|m\.?e\.?|master of engineering)\b",
    r"(?i)\b(m\.?s\.?|m\.?sc|master of science)\b",
    r"(?i)\b(m\.?c\.?a\.?|master of computer applications)\b",
    r"(?i)\b(m\.?b\.?a\.?|master of business administration)\b",
    r"(?i)\b(ph\.?d\.?|doctor of philosophy)\b",
    r"(?i)\b(bachelor|master|diploma|associate degree)\b"
]

def extract_text_from_pdf(file_input) -> str:
    """Extract clean text from a PDF file or bytes buffer."""
    if isinstance(file_input, bytes):
        doc = fitz.open(stream=file_input, filetype="pdf")
    elif hasattr(file_input, "read"):
        doc = fitz.open(stream=file_input.read(), filetype="pdf")
    else:
        doc = fitz.open(file_input)

    text_parts = []
    for page in doc:
        page_text = page.get_text()
        if page_text:
            text_parts.append(page_text)
    
    doc.close()
    return "\n".join(text_parts).strip()

def extract_text_from_docx(file_input) -> str:
    """Extract clean text from a DOCX file or bytes buffer."""
    if isinstance(file_input, bytes):
        file_input = io.BytesIO(file_input)
    doc = docx.Document(file_input)
    return "\n".join([para.text for para in doc.paragraphs if para.text.strip()]).strip()

def extract_candidate_name(text: str) -> str:
    """Extract candidate name using clean line heuristics."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return "Candidate"

    for line in lines[:5]:
        # Filter out common headers, emails, phones, URLs
        if any(keyword in line.lower() for keyword in ["resume", "curriculum", "cv", "email", "phone", "github", "linkedin", "http", "@"]):
            continue
        # Names are typically 2 to 4 capitalized words, no digits
        if 2 <= len(line.split()) <= 4 and not re.search(r"\d", line) and len(line) < 40:
            return line
    return lines[0] if lines else "Candidate"

def extract_skills(text: str) -> List[str]:
    """Identify skills from text using boundary-safe regex matching against taxonomy."""
    found_skills = set()
    text_lower = text.lower()

    for skill in COMMON_SKILLS:
        skill_lower = skill.lower()
        # Word boundary match with special character escaping
        pattern = r"(?<!\w)" + re.escape(skill_lower) + r"(?!\w)"
        if re.search(pattern, text_lower):
            found_skills.add(skill)

    # Sort alphabetically for consistency
    return sorted(list(found_skills), key=lambda s: s.lower())

def extract_education(text: str) -> List[Dict[str, str]]:
    """Extract education entries like degree, field, institution, and year."""
    education_entries = []
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Locate education section if present
    edu_section_lines = []
    in_edu = False
    for line in lines:
        if re.search(r"(?i)^(education|academic background|academics|qualifications)\b", line):
            in_edu = True
            continue
        elif in_edu and re.search(r"(?i)^(experience|work experience|skills|projects|certifications|achievements)\b", line):
            in_edu = False
            break
        elif in_edu:
            edu_section_lines.append(line)

    search_pool = edu_section_lines if edu_section_lines else lines

    for i, line in enumerate(search_pool):
        degree_match = None
        for pattern in DEGREE_PATTERNS:
            match = re.search(pattern, line)
            if match:
                degree_match = line
                break
        
        if degree_match:
            # Look for institution and year in current or subsequent lines
            institution = "University / College"
            year = ""
            
            # Check for year (e.g. 2020-2024 or 2023)
            year_match = re.search(r"\b(20\d{2}|19\d{2})\b", line)
            if year_match:
                year = year_match.group(1)

            # Check next line for institution if present
            if i + 1 < len(search_pool):
                next_line = search_pool[i + 1]
                if any(k in next_line.lower() for k in ["university", "college", "institute", "school", "academy"]):
                    institution = next_line
                    if not year:
                        y_match = re.search(r"\b(20\d{2}|19\d{2})\b", next_line)
                        if y_match:
                            year = y_match.group(1)
            
            education_entries.append({
                "degree": degree_match,
                "institution": institution,
                "duration": year if year else "N/A"
            })
            if len(education_entries) >= 3:
                break

    if not education_entries:
        education_entries.append({
            "degree": "Bachelor's Degree",
            "institution": "Relevant University",
            "duration": "Completed"
        })

    return education_entries

def extract_experience(text: str) -> List[Dict[str, str]]:
    """Extract job roles, companies, and durations from experience section."""
    experience_entries = []
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Locate experience section
    exp_lines = []
    in_exp = False
    for line in lines:
        if re.search(r"(?i)^(experience|work experience|professional experience|employment history)\b", line):
            in_exp = True
            continue
        elif in_exp and re.search(r"(?i)^(education|skills|projects|certifications|achievements)\b", line):
            in_exp = False
            break
        elif in_exp:
            exp_lines.append(line)

    target_lines = exp_lines if exp_lines else lines

    # Look for role and company patterns
    role_keywords = ["engineer", "developer", "analyst", "intern", "manager", "specialist", "scientist", "consultant", "lead", "architect"]
    
    for i, line in enumerate(target_lines):
        if any(rk in line.lower() for rk in role_keywords) and len(line.split()) <= 8:
            role = line
            company = "Technology Company"
            duration = "1-2 years"

            # Check for duration / dates in current line or neighboring lines
            date_match = re.search(r"(?i)\b(20\d{2}|present|current|\d+\s*(?:years?|yrs?|months?))\b", line)
            if date_match:
                duration = date_match.group(0)

            # Look around for company name
            if i + 1 < len(target_lines):
                next_l = target_lines[i + 1]
                if not any(rk in next_l.lower() for rk in role_keywords) and len(next_l.split()) <= 6:
                    company = next_l

            experience_entries.append({
                "role": role,
                "company": company,
                "duration": duration
            })

            if len(experience_entries) >= 4:
                break

    if not experience_entries:
        experience_entries.append({
            "role": "Software / Technical Experience",
            "company": "Industry Experience",
            "duration": "Demonstrated Projects"
        })

    return experience_entries
