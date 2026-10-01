import re
import fitz  # PyMuPDF
import docx
import io
from typing import Dict, List, Any, Optional
from utils.skills_db import SKILL_ALIASES, normalize_skill

EMAIL_REGEX = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"
PHONE_REGEX = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,4}[-.\s]?\d{10}"
LINKEDIN_REGEX = r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+"
GITHUB_REGEX = r"(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+"

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

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract candidate email, phone, and professional profile links."""
    # Email
    email_match = re.search(EMAIL_REGEX, text)
    email = email_match.group(0) if email_match else None

    # Phone
    phone_match = re.search(PHONE_REGEX, text)
    phone = phone_match.group(0).strip() if phone_match else None

    # Links
    linkedin_match = re.search(LINKEDIN_REGEX, text, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else None

    github_match = re.search(GITHUB_REGEX, text, re.IGNORECASE)
    github = github_match.group(0) if github_match else None

    return {
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github
    }

def extract_candidate_name(text: str) -> str:
    """Extract candidate name using line and header heuristics."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return "Candidate"

    for line in lines[:6]:
        # Skip headers, contact lines, URLs
        if any(keyword in line.lower() for keyword in ["resume", "curriculum", "cv", "email", "phone", "github", "linkedin", "http", "@", "+"]):
            continue
        # Names are typically 2 to 4 capitalized words, no numbers
        words = line.split()
        if 2 <= len(words) <= 4 and not re.search(r"\d", line) and len(line) < 35:
            return line
    return lines[0] if lines else "Candidate"

def extract_skills(text: str) -> List[str]:
    """Identify skills from text using boundary-safe regex matching and alias normalization."""
    found_skills = set()
    text_lower = text.lower()

    for alias, standard_name in SKILL_ALIASES.items():
        # Match with word boundaries or special character boundaries
        pattern = r"(?<![a-zA-Z0-9_])" + re.escape(alias) + r"(?![a-zA-Z0-9_])"
        if re.search(pattern, text_lower):
            found_skills.add(standard_name)

    return sorted(list(found_skills), key=lambda s: s.lower())

def extract_education(text: str) -> List[Dict[str, str]]:
    """Extract education entries like degree, field, institution, year, and GPA."""
    education_entries = []
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Locate education section
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
            institution = "University / College"
            duration = "Completed"
            
            # Check year
            year_match = re.search(r"\b(20\d{2}|19\d{2})(?:\s*[-–]\s*(?:20\d{2}|present))?\b", line, re.IGNORECASE)
            if year_match:
                duration = year_match.group(0)

            # Check next line for institution or GPA
            if i + 1 < len(search_pool):
                next_line = search_pool[i + 1]
                if any(k in next_line.lower() for k in ["university", "college", "institute", "school", "academy", "campus"]):
                    institution = next_line
                    if duration == "Completed":
                        y_match = re.search(r"\b(20\d{2}|19\d{2})(?:\s*[-–]\s*(?:20\d{2}|present))?\b", next_line, re.IGNORECASE)
                        if y_match:
                            duration = y_match.group(0)

            education_entries.append({
                "degree": degree_match,
                "institution": institution,
                "duration": duration
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

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """Extract job roles, companies, durations, and bullet-point achievements."""
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

    role_keywords = ["engineer", "developer", "analyst", "intern", "manager", "specialist", "scientist", "consultant", "lead", "architect"]
    
    current_entry = None
    for i, line in enumerate(target_lines):
        is_role = any(rk in line.lower() for rk in role_keywords) and len(line.split()) <= 9 and not line.startswith("-")

        if is_role:
            if current_entry:
                experience_entries.append(current_entry)
                if len(experience_entries) >= 4:
                    current_entry = None
                    break

            duration = "1-2 years"
            date_match = re.search(r"(?i)\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d{2}\s*[-–]\s*(?:present|current|20\d{2}))\b", line)
            if date_match:
                duration = date_match.group(0)

            company = "Technology Organization"
            if i + 1 < len(target_lines):
                next_l = target_lines[i + 1]
                if not any(rk in next_l.lower() for rk in role_keywords) and not next_l.startswith(("-", "•")):
                    company = next_l

            current_entry = {
                "role": line,
                "company": company,
                "duration": duration,
                "bullets": []
            }
        elif current_entry and (line.startswith(("-", "•", "*")) or len(line.split()) > 7):
            bullet_text = line.lstrip("-•* ").strip()
            if bullet_text and len(current_entry["bullets"]) < 4:
                current_entry["bullets"].append(bullet_text)

    if current_entry:
        experience_entries.append(current_entry)

    if not experience_entries:
        experience_entries.append({
            "role": "Software / Technical Experience",
            "company": "Industry Experience",
            "duration": "Demonstrated Projects",
            "bullets": ["Delivered software projects and technical solutions in alignment with industry standards."]
        })

    return experience_entries
