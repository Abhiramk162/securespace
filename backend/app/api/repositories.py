from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.models import Repository, User, Scan
from app.schemas.schemas import RepositoryCreate, RepositoryResponse
from app.api.deps import get_current_user
from app.services.demo_service import demo_service

router = APIRouter(prefix="/repositories", tags=["Repositories"])

@router.get("", response_model=List[RepositoryResponse])
def get_repositories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repos = db.query(Repository).filter(Repository.user_id == current_user.id).order_by(Repository.created_at.desc()).all()
    return repos

@router.post("", response_model=RepositoryResponse)
def create_repository(repo_in: RepositoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Parse repo name from URL if provided
    name = repo_in.name
    full_name = f"{current_user.username}/{name}"
    if "github.com/" in repo_in.url:
        parts = repo_in.url.split("github.com/")[-1].strip("/").split("/")
        if len(parts) >= 2:
            full_name = f"{parts[0]}/{parts[1]}"
            if not name:
                name = parts[1]

    repo = Repository(
        user_id=current_user.id,
        name=name,
        full_name=full_name,
        description=repo_in.description or f"Repository {name} scanned with SecureSphere",
        url=repo_in.url,
        default_branch=repo_in.default_branch or "main",
        ecosystem=repo_in.ecosystem or "npm",
        is_demo=False,
        risk_score=100.0
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo

@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(repo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == current_user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo

@router.delete("/{repo_id}")
def delete_repository(repo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == current_user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    db.delete(repo)
    db.commit()
    return {"message": "Repository removed successfully"}

@router.post("/demo/seed", response_model=RepositoryResponse)
async def seed_demo(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = await demo_service.seed_demo_data(db, current_user.id)
    return repo
