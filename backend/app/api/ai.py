from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_db
from app.models.models import AIConversation, AIMessage, Repository, Vulnerability, Dependency, User, Scan
from app.schemas.schemas import AIQueryRequest, AIConversationResponse, AIMessageResponse
from app.api.deps import get_current_user
from app.services.ai_service import ai_assistant

router = APIRouter(prefix="/ai", tags=["AI Security Assistant"])

@router.get("/conversations", response_model=List[AIConversationResponse])
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AIConversation).filter(AIConversation.user_id == current_user.id).order_by(AIConversation.updated_at.desc()).all()

@router.post("/chat")
async def chat_with_assistant(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Extract message from various formats
    user_message = request.get("message")
    if not user_message and "messages" in request and isinstance(request["messages"], list) and request["messages"]:
        user_message = request["messages"][-1].get("content")
    if not user_message:
        user_message = "Summarize project security"

    conv_id = request.get("conversation_id")
    repo_id = request.get("repository_id")
    if not repo_id and "context" in request and isinstance(request["context"], dict):
        repo_id = request["context"].get("repoId")

    repo = None
    if repo_id:
        repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        repo = db.query(Repository).filter(Repository.user_id == current_user.id).first()

    # Find or create conversation
    conv = None
    if conv_id:
        conv = db.query(AIConversation).filter(
            AIConversation.id == conv_id,
            AIConversation.user_id == current_user.id
        ).first()

    if not conv:
        conv = AIConversation(
            user_id=current_user.id,
            repository_id=repo.id if repo else None,
            title=f"Investigation: {user_message[:30]}"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        sender="user",
        content=user_message
    )
    db.add(user_msg)

    context = {
        "repo_name": repo.name if repo else "Demo Repository",
        "risk_score": repo.risk_score if repo else 42.0,
        "vulnerabilities": [],
        "dependencies": []
    }

    if repo:
        latest_scan = db.query(Scan).filter(Scan.repository_id == repo.id).order_by(Scan.created_at.desc()).first()
        if latest_scan:
            vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == latest_scan.id).all()
            deps = db.query(Dependency).filter(Dependency.scan_id == latest_scan.id).all()
            context["vulnerabilities"] = [
                {
                    "vuln_id": v.vuln_id,
                    "package_name": v.package_name,
                    "installed_version": v.installed_version,
                    "severity": v.severity,
                    "fixed_version": v.fixed_version,
                    "summary": v.summary,
                    "cvss_score": v.cvss_score,
                    "advisory_url": v.advisory_url,
                    "ecosystem": v.ecosystem
                }
                for v in vulns
            ]
            context["dependencies"] = [{"name": d.name, "version": d.version, "ecosystem": d.ecosystem} for d in deps]

    # Generate AI response
    ai_resp = await ai_assistant.generate_response(user_message, context)

    assistant_msg = AIMessage(
        conversation_id=conv.id,
        sender="assistant",
        content=ai_resp["content"],
        citations=ai_resp.get("citations", [])
    )
    db.add(assistant_msg)
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assistant_msg)

    return {
        "conversation_id": conv.id,
        "reply": assistant_msg.content,
        "message": assistant_msg.content,
        "citations": assistant_msg.citations,
        "sender": "assistant",
        "created_at": assistant_msg.created_at
    }

@router.post("/explain/{vuln_id}")
async def explain_vulnerability(
    vuln_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vuln = db.query(Vulnerability).filter(Vulnerability.vuln_id == vuln_id).first()
    context = {"repo_name": "Active Project", "vulnerabilities": [vuln] if vuln else []}
    resp = await ai_assistant.generate_response(f"Explain {vuln_id}", context)
    return {"explanation": resp["content"]}

@router.post("/fix/{vuln_id}")
async def suggest_fix(
    vuln_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vuln = db.query(Vulnerability).filter(Vulnerability.vuln_id == vuln_id).first()
    context = {"repo_name": "Active Project", "vulnerabilities": [vuln] if vuln else []}
    resp = await ai_assistant.generate_response(f"How do I fix {vuln_id}?", context)
    return {"suggestion": resp["content"]}
