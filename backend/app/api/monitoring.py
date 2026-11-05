from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.models import MonitoringSchedule, Notification, Repository, User
from app.schemas.schemas import MonitoringScheduleCreate, MonitoringScheduleResponse, NotificationResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/monitoring", tags=["Monitoring & Alerts"])

@router.get("/schedules", response_model=List[MonitoringScheduleResponse])
def get_monitoring_schedules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MonitoringSchedule).filter(MonitoringSchedule.user_id == current_user.id).all()

@router.post("/schedules", response_model=MonitoringScheduleResponse)
def create_or_update_schedule(
    req: MonitoringScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sched = db.query(MonitoringSchedule).filter(
        MonitoringSchedule.repository_id == req.repository_id,
        MonitoringSchedule.user_id == current_user.id
    ).first()

    if not sched:
        sched = MonitoringSchedule(
            user_id=current_user.id,
            repository_id=req.repository_id,
            frequency=req.frequency,
            is_active=req.is_active,
            last_run_at=datetime.utcnow(),
            next_run_at=datetime.utcnow() + timedelta(days=1 if req.frequency == "daily" else 7)
        )
        db.add(sched)
    else:
        sched.frequency = req.frequency
        sched.is_active = req.is_active
        sched.next_run_at = datetime.utcnow() + timedelta(days=1 if req.frequency == "daily" else 7)

    db.commit()
    db.refresh(sched)
    return sched

@router.get("/alerts", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(50).all()

@router.post("/alerts/{alert_id}/read")
def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == alert_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Alert marked as read"}
