import re
from fuzzywuzzy import fuzz

def extract_keywords(text, keywords_list):
    text = text.lower()
    return [kw for kw in keywords_list if re.search(r'\b' + re.escape(kw.lower()) + r'\b', text)]

def keyword_match_score(jd_text, resume_text, keywords_list):
    jd_keywords = extract_keywords(jd_text, keywords_list)
    resume_keywords = extract_keywords(resume_text, keywords_list)

    matched = list(set(resume_keywords) & set(jd_keywords))
    total = len(jd_keywords)

    score = round((len(matched) / total) * 100, 2) if total > 0 else 0
    return score, matched

def fuzzy_score(word1, word2):
    return fuzz.token_sort_ratio(word1.lower(), word2.lower())
