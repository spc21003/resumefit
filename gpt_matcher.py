from openai import OpenAI
import os
from dotenv import load_dotenv
import re


load_dotenv()

def clean_text(text):
    return re.sub(r'[\r\u200b]', '', text).strip()


client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

def resume_match_score(resume, job_desc):
    resume = clean_text(resume)
    job_desc = clean_text(job_desc)
    
    prompt = f"""
Act as an expert resume reviewer specializing in AI/ATS (Applicant Tracking System) screening. Evaluate the resume below against the job description and provide:

1. A match score out of 100, based on how well the resume aligns with the job description and likely passes automated screening.
2. A brief explanation (2-3 sentences) of the score, focusing on keyword relevance, formatting, and overall alignment.
3. 3-5 actionable suggestions to improve the resume’s chances of passing AI/ATS filters, such as adding missing keywords, improving structure, or clarifying experience.

Resume:
{resume}

Job Description:
{job_desc}
"""
    
    response = client.chat.completions.create(
        model = "gpt-4.1-mini",
        messages = [
            {"role": "system", "content": "You are an expert resume reviewer."},
            {"role": "user", "content": prompt}
        ],
        temperature = 0.7
    )

    return response.choices[0].message.content.strip()