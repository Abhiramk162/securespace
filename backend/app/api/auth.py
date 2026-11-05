from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.models import User, UserSession
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordChange
from app.api.deps import get_current_user
from app.services.demo_service import demo_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(User).filter(User.email == user_in.email.lower()).first():
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists."
        )
    # Check if username exists
    if db.query(User).filter(User.username == user_in.username.lower()).first():
        raise HTTPException(
            status_code=400,
            detail="This username is already taken. Please choose another."
        )

    user = User(
        email=user_in.email.lower(),
        username=user_in.username.lower(),
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role=user_in.role or "Security Engineer",
        professional_interests=user_in.professional_interests or "Application Security, Dependency Intelligence",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed initial demo repository for immediate exploration
    await demo_service.seed_demo_data(db, user.id)

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    # Email or username
    login_ident = login_data.email.lower()
    user = db.query(User).filter(
        (User.email == login_ident) | (User.username == login_ident)
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password."
        )

    access_token = create_access_token(user.id)

    # Record active session
    session_rec = UserSession(
        user_id=user.id,
        token=access_token[:64],
        ip_address=request.client.host if request.client else "127.0.0.1",
        user_agent=request.headers.get("user-agent", "Browser Client"),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(session_rec)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/demo-login", response_model=Token)
async def demo_login(db: Session = Depends(get_db)):
    """Instant 1-click Judge Demonstration Login"""
    demo_email = "judge.demo@securesphere.io"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            username="hackathon_judge",
            full_name="Hackathon Evaluation Lead",
            hashed_password=hash_password("SecureSphereDemo2026!"),
            role="Cybersecurity Architect",
            professional_interests="Supply Chain Security, OSV Threat Modeling, SBOM",
            github_connected=True,
            github_username="hackathon-judge-acme"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Ensure demo project is populated
    await demo_service.seed_demo_data(db, user.id)

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/onboarding")
def save_onboarding(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if "role" in data:
        current_user.role = data["role"]
    if "professional_interests" in data:
        current_user.professional_interests = data["professional_interests"]
    if "github_username" in data and data["github_username"]:
        current_user.github_connected = True
        current_user.github_username = data["github_username"]
    if "notification_preferences" in data:
        current_user.notification_preferences = data["notification_preferences"]
    db.commit()
    return {"message": "Onboarding completed successfully", "user": current_user}

@router.put("/profile", response_model=UserResponse)
def update_profile(update_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if update_data.full_name:
        current_user.full_name = update_data.full_name
    if update_data.role:
        current_user.role = update_data.role
    if update_data.professional_interests:
        current_user.professional_interests = update_data.professional_interests
    if update_data.avatar_url:
        current_user.avatar_url = update_data.avatar_url
    if update_data.notification_preferences:
        current_user.notification_preferences = update_data.notification_preferences
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(passwords: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(passwords.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")
    current_user.hashed_password = hash_password(passwords.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}
