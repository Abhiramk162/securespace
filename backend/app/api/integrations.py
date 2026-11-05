from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.models import IntegrationSetting, User
from app.schemas.schemas import IntegrationResponse, IntegrationUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/integrations", tags=["Integrations"])

DEFAULT_INTEGRATIONS = [
    {"service_name": "osv", "is_connected": True, "config_metadata": {"endpoint": "https://api.osv.dev/v1", "status": "Active"}},
    {"service_name": "github", "is_connected": True, "config_metadata": {"auth_type": "OAuth 2.0", "scopes": ["repo", "read:org"]}},
    {"service_name": "gemini", "is_connected": True, "config_metadata": {"model": "gemini-1.5-flash", "status": "Connected"}},
    {"service_name": "openai", "is_connected": False, "config_metadata": {"model": "gpt-4o", "status": "Not configured"}},
    {"service_name": "slack", "is_connected": False, "config_metadata": {"webhook": "", "status": "Inactive"}},
    {"service_name": "email", "is_connected": True, "config_metadata": {"alerts": "Immediate", "status": "Active"}}
]

@router.get("", response_model=List[IntegrationResponse])
def get_integrations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_settings = db.query(IntegrationSetting).filter(IntegrationSetting.user_id == current_user.id).all()
    if not user_settings:
        # Seed defaults
        for def_int in DEFAULT_INTEGRATIONS:
            setting = IntegrationSetting(
                user_id=current_user.id,
                service_name=def_int["service_name"],
                is_connected=def_int["is_connected"],
                config_metadata=def_int["config_metadata"]
            )
            db.add(setting)
        db.commit()
        user_settings = db.query(IntegrationSetting).filter(IntegrationSetting.user_id == current_user.id).all()

    return user_settings

@router.post("/toggle", response_model=IntegrationResponse)
def toggle_integration(
    req: IntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    setting = db.query(IntegrationSetting).filter(
        IntegrationSetting.user_id == current_user.id,
        IntegrationSetting.service_name == req.service_name
    ).first()

    if not setting:
        setting = IntegrationSetting(
            user_id=current_user.id,
            service_name=req.service_name,
            is_connected=req.is_connected,
            config_metadata=req.config_metadata or {}
        )
        db.add(setting)
    else:
        setting.is_connected = req.is_connected
        if req.config_metadata:
            setting.config_metadata = req.config_metadata
        setting.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(setting)
    return setting
