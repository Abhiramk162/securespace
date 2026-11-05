from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
import app.models.models  # ensure models registered
from app.api import (
    auth, repositories, scans, dependencies,
    vulnerabilities, risk, ai, reports,
    threats, monitoring, integrations, overview
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(repositories.router, prefix=settings.API_V1_STR)
app.include_router(repositories.router, prefix=f"{settings.API_V1_STR}/repos")  # alias
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(dependencies.router, prefix=settings.API_V1_STR)
app.include_router(dependencies.router, prefix=f"{settings.API_V1_STR}/deps")   # alias
app.include_router(vulnerabilities.router, prefix=settings.API_V1_STR)
app.include_router(vulnerabilities.router, prefix=f"{settings.API_V1_STR}/vulns") # alias
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(threats.router, prefix=settings.API_V1_STR)
app.include_router(monitoring.router, prefix=settings.API_V1_STR)
app.include_router(integrations.router, prefix=settings.API_V1_STR)
app.include_router(overview.router, prefix=settings.API_V1_STR)
app.include_router(overview.router, prefix=f"{settings.API_V1_STR}/dashboard") # alias

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Discover. Analyze. Protect.",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
