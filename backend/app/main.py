from fastapi import FastAPI
from dotenv import load_dotenv
from .api import endpoints
import os

load_dotenv()

app = FastAPI(title="Thumbnail Generator API")

app.include_router(endpoints.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
