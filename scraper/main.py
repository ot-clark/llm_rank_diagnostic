from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
from typing import List, Dict, Any
import redis
import psycopg2
from dotenv import load_dotenv
from .scraper import WebScraper
from .scorer import LLMScorer

load_dotenv()

app = FastAPI(title="LLM Ranking Diagnostic Scraper")

# Database connections
redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
db_conn = psycopg2.connect(os.getenv('DATABASE_URL', 'postgresql://localhost:5432/llm_diagnostic'))

# Initialize services
scraper = WebScraper()
scorer = LLMScorer()

class ScrapeRequest(BaseModel):
    url: str
    max_pages: int = 10

class ScoreRequest(BaseModel):
    content: str
    title: str
    description: str
    metadata: Dict[str, Any] = {}

@app.post("/scrape")
async def scrape_website(request: ScrapeRequest):
    """Scrape a website and return structured data"""
    try:
        pages = await scraper.scrape_website(request.url, request.max_pages)
        return {"status": "success", "pages": pages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score")
async def score_content(request: ScoreRequest):
    """Score content using LLM analysis"""
    try:
        score = await scorer.score_content(
            request.content,
            request.title,
            request.description,
            request.metadata
        )
        return {"status": "success", "score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "scraper"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 