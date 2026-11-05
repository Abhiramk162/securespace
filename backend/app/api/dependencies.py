from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Dependency, Scan, Repository, User
from app.schemas.schemas import DependencyResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/dependencies", tags=["Dependencies"])

@router.get("", response_model=List[DependencyResponse])
def get_dependencies(
    repo_id: Optional[int] = None,
    scan_id: Optional[int] = None,
    ecosystem: Optional[str] = None,
    vulnerable_only: Optional[bool] = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Dependency).join(Repository).filter(Repository.user_id == current_user.id)
    if repo_id:
        query = query.filter(Dependency.repository_id == repo_id)
    if scan_id:
        query = query.filter(Dependency.scan_id == scan_id)
    if ecosystem:
        query = query.filter(Dependency.ecosystem == ecosystem)
    if vulnerable_only:
        query = query.filter(Dependency.is_vulnerable == True)
    if search:
        query = query.filter(Dependency.name.ilike(f"%{search}%"))

    return query.order_by(Dependency.is_vulnerable.desc(), Dependency.risk_score.desc()).limit(200).all()

@router.get("/{dep_id}", response_model=DependencyResponse)
def get_dependency(dep_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dep = db.query(Dependency).join(Repository).filter(
        Dependency.id == dep_id,
        Repository.user_id == current_user.id
    ).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return dep
