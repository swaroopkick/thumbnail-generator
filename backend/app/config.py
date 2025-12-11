import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Output configuration
    OUTPUT_DIR: Path = Path(os.getenv("OUTPUT_DIR", "backend/storage/output"))
    TEMP_DIR: Path = Path(os.getenv("TEMP_DIR", "backend/storage/temp"))
    
    # Image processing configuration
    MAX_VARIATIONS: int = int(os.getenv("MAX_VARIATIONS", 5))
    OUTPUT_QUALITY: int = int(os.getenv("OUTPUT_QUALITY", 85))
    JPEG_QUALITY: int = int(os.getenv("JPEG_QUALITY", 85))
    WEBP_QUALITY: int = int(os.getenv("WEBP_QUALITY", 80))
    PNG_COMPRESSION: int = int(os.getenv("PNG_COMPRESSION", 9))
    
    # Gemini API configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
    GEMINI_MAX_RETRIES: int = int(os.getenv("GEMINI_MAX_RETRIES", 3))
    GEMINI_RETRY_DELAY: int = int(os.getenv("GEMINI_RETRY_DELAY", 2))
    
    # URL signing configuration
    URL_SIGNATURE_EXPIRY: int = int(os.getenv("URL_SIGNATURE_EXPIRY", 3600))
    SERVE_FILES_STATIC: bool = os.getenv("SERVE_FILES_STATIC", "true").lower() == "true"
    SIGN_URLS: bool = os.getenv("SIGN_URLS", "false").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings() -> Settings:
    """Get settings instance"""
    return Settings()
