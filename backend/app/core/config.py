import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SecureSphere"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DESCRIPTION: str = "AI-Powered Open-Source Security Intelligence Platform"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_ENV")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./securesphere.db"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        
    ]
    
    # External APIs
    OSV_API_URL: str = "https://api.osv.dev/v1"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN", "")
    
    # Upload limits
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
