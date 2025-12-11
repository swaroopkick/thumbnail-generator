from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from .api import endpoints
from .config import get_settings
from pathlib import Path
import os

load_dotenv()

app = FastAPI(title="Thumbnail Generator API")

settings = get_settings()

# Mount static files for serving exports if not signing URLs
if not settings.SIGN_URLS:
    output_dir = Path(settings.OUTPUT_DIR)
    if output_dir.exists():
        app.mount("/static/output", StaticFiles(directory=str(output_dir)), name="output")

app.include_router(endpoints.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
