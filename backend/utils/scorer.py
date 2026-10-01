from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from utils.matcher import keyword_match_score

def score_resume_against_jd(resume_text, jd_text):
    """
    Compares a resume against a job description using both TF-IDF similarity and keyword matching.

    Args:
        resume_text (str): The resume content as plain text.
        jd_text (str): The job description content as plain text.

    Returns:
        final_score (float): Weighted score out of 100.
        breakdown (dict): Detailed component scores and metrics.
    """

    # TF-IDF similarity score
    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([jd_text, resume_text])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    similarity_score = round(similarity * 100, 2)

    # Keyword match score
    target_skills = ['python', 'sql', 'excel', 'power bi', 'machine learning', 'communication']
    keyword_score, matched_skills = keyword_match_score(jd_text, resume_text, target_skills)

    # Final weighted score
    final_score = round((similarity_score * 0.6) + (keyword_score * 0.4), 2)

    breakdown = {
        "similarity_score": similarity_score,
        "keyword_score": keyword_score,
        "matched_skills": matched_skills,
        "resume_length_words": len(resume_text.split()),
        "jd_length_words": len(jd_text.split())
    }

    return final_score, breakdown
