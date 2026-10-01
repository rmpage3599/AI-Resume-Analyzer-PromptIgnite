import re
from typing import Dict, List, Set, Tuple

# Comprehensive alias mapping: (alias_lower -> normalized_standard_skill_name)
SKILL_ALIASES = {
    # Languages
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "golang": "Go",
    "c plus plus": "C++",
    "c#": "C#",
    "c sharp": "C#",
    "rb": "Ruby",
    "ruby on rails": "Ruby on Rails",
    "rails": "Ruby on Rails",
    
    # Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "react native": "React Native",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vue": "Vue",
    "vuejs": "Vue",
    "vue.js": "Vue",
    "angular": "Angular",
    "angularjs": "Angular",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "html5": "HTML",
    "html": "HTML",
    "css3": "CSS",
    "css": "CSS",
    "redux toolkit": "Redux",
    "redux": "Redux",

    # Backend
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express",
    "expressjs": "Express",
    "express.js": "Express",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful": "REST APIs",
    "restful apis": "REST APIs",
    "graphql": "GraphQL",
    "grpc": "gRPC",

    # Data & AI
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "cv": "Computer Vision",
    "computer vision": "Computer Vision",
    "llm": "LLMs",
    "llms": "LLMs",
    "large language models": "LLMs",
    "generative ai": "Generative AI",
    "genai": "Generative AI",
    "gen ai": "Generative AI",
    "rag": "RAG",
    "langchain": "LangChain",
    "llamaindex": "LlamaIndex",
    "llama index": "LlamaIndex",
    "transformers": "Transformers",
    "huggingface": "Hugging Face",
    "hugging face": "Hugging Face",
    "scikit learn": "Scikit-learn",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "keras": "Keras",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "opencv": "OpenCV",
    "data analysis": "Data Analysis",
    "data analytics": "Data Analysis",
    "data visualization": "Data Visualization",
    "bi": "Business Intelligence",
    "business intelligence": "Business Intelligence",
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "advanced excel": "Excel",

    # Cloud & DevOps
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "ci cd": "CI/CD",
    "continuous integration": "CI/CD",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "linux": "Linux",
    "bash": "Bash",
    "shell": "Shell",

    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "supabase": "Supabase",
    "firebase": "Firebase",
    "dynamodb": "DynamoDB",
    "cassandra": "Cassandra",
    "snowflake": "Snowflake",
    "bigquery": "BigQuery",
    "prisma": "Prisma",
    "sqlalchemy": "SQLAlchemy",

    # Testing & Security
    "selenium": "Selenium",
    "playwright": "Playwright",
    "cypress": "Cypress",
    "pytest": "PyTest",
    "jest": "Jest",
    "unit testing": "Unit Testing",
    "test automation": "Test Automation",
    "qa": "QA",
    "owasp": "OWASP",
    "penetration testing": "Penetration Testing",
    "network security": "Network Security",
    "information security": "Information Security",
    "vulnerability assessment": "Vulnerability Assessment",
    "siem": "SIEM",
    "wireshark": "Wireshark",

    # Methodologies
    "agile": "Agile",
    "scrum": "Scrum",
    "jira": "Jira",
    "system design": "System Design",
    "microservices": "Microservices",
    "oop": "OOP",
    "object-oriented programming": "OOP"
}

# Categorized taxonomy for grouping in UI output
SKILL_CATEGORIES = {
    "Languages": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust",
        "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "Dart", "Bash", "Shell", "SQL"
    ],
    "Frontend": [
        "React", "Next.js", "Vue", "Angular", "HTML", "CSS", "Tailwind CSS",
        "Bootstrap", "Sass", "Redux", "GraphQL", "Vite", "Webpack", "Responsive Design"
    ],
    "Backend": [
        "Node.js", "Express", "FastAPI", "Flask", "Django", "Spring Boot",
        "NestJS", "Microservices", "REST APIs", "gRPC", "WebSocket"
    ],
    "Data & AI": [
        "Machine Learning", "Deep Learning", "Artificial Intelligence", "NumPy", "Pandas",
        "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "OpenCV", "NLP", "Computer Vision",
        "LLMs", "Generative AI", "LangChain", "LlamaIndex", "Transformers", "Hugging Face",
        "Data Analysis", "Data Visualization", "Matplotlib", "Seaborn", "Statistics",
        "Power BI", "Tableau", "Excel", "ETL", "Business Intelligence"
    ],
    "Databases": [
        "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Supabase", "Firebase",
        "DynamoDB", "Cassandra", "Snowflake", "BigQuery", "Prisma", "SQLAlchemy"
    ],
    "Cloud & DevOps": [
        "AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab",
        "Linux", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Prometheus", "Grafana"
    ],
    "Testing & QA": [
        "Selenium", "Playwright", "Cypress", "PyTest", "Jest", "Test Automation", "Unit Testing", "QA"
    ],
    "Security": [
        "Network Security", "Information Security", "Vulnerability Assessment", "Penetration Testing",
        "SIEM", "Wireshark", "OWASP"
    ],
    "Methodologies & Soft Skills": [
        "Agile", "Scrum", "Jira", "System Design", "Roadmapping", "Product Management",
        "Problem Solving", "Communication", "Leadership", "Teamwork"
    ]
}

def normalize_skill(term: str) -> str:
    """Normalize any skill synonym/alias to standard casing and name."""
    cleaned = term.strip().lower()
    return SKILL_ALIASES.get(cleaned, term.strip())

def categorize_skills(skills_list: List[str]) -> Dict[str, List[str]]:
    """Group a list of skills into clean UI domain categories."""
    categorized: Dict[str, List[str]] = {}
    remaining = set(skills_list)

    for category, cat_skills in SKILL_CATEGORIES.items():
        cat_skills_set = set(cat_skills)
        matched = [s for s in skills_list if s in cat_skills_set]
        if matched:
            categorized[category] = sorted(matched)
            remaining -= set(matched)

    if remaining:
        categorized["Other Tools & Skills"] = sorted(list(remaining))

    return categorized
