from fastapi import FastAPI, Request
from pydantic import BaseModel
from utils.gpt_matcher import resume_match_score
import openai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchRequest(BaseModel):
    resume:str
    job_desc: str

@app.post("/match")

def match_resume(request: MatchRequest):
    result = resume_match_score(request.resume, request.job_desc)
    return {"result": result}
