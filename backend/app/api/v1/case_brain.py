"""
CRIMENET-X: Case AI Brain REST API Endpoints
Provides case-unique behavioral profiling, interactive investigator copilot,
hypothesis generation, and Gemini 3.6-Flash intelligence telemetry.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.auth import User
from app.core.rbac import get_current_user, require_roles
from app.schemas.domain import (
    CaseCognitiveProfileOut,
    CaseBrainChatRequest,
    CaseBrainChatResponse,
    CaseHypothesisOut,
    BrainStatusOut
)
from app.ai.gemini_brain import gemini_brain_service
from app.services.audit_service import record_audit_event

router = APIRouter(tags=["Case AI Brain (Google Gemini 3.6-Flash)"])

@router.get("/intelligence/case-brain/status", response_model=BrainStatusOut)
def get_brain_status(
    current_user: User = Depends(get_current_user)
):
    """
    Returns real-time status and latency telemetry for the Gemini AI Brain.
    """
    return gemini_brain_service.get_brain_status()

@router.get("/cases/{case_id}/ai-brain/profile", response_model=CaseCognitiveProfileOut)
def get_case_cognitive_profile(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the unique behavioral persona, analytical posture, and directives
    synthesized specifically for this case. Every case has a unique AI profile.
    """
    return gemini_brain_service.get_case_cognitive_profile(case_id=case_id, db=db)

@router.post("/cases/{case_id}/ai-brain/chat", response_model=CaseBrainChatResponse)
def chat_with_case_brain(
    case_id: str,
    payload: CaseBrainChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Conduct an interactive session with the Case Brain.
    The AI speaks strictly in the character and directives of this specific case,
    grounding answers in catalogued entities, relationships, evidence, and anomalies.
    """
    result = gemini_brain_service.chat_with_case_brain(
        case_id=case_id,
        message=payload.message,
        conversation_history=payload.conversation_history,
        db=db
    )

    # Record audit log for investigative accountability
    record_audit_event(
        db=db,
        user=current_user,
        action="INSPECTION",
        case_id=case_id,
        reason=f"Investigator {current_user.username} queried Case AI Brain ({result['persona_code']}): '{payload.message[:80]}...'"
    )
    db.commit()

    return result

@router.post("/cases/{case_id}/ai-brain/hypotheses", response_model=List[CaseHypothesisOut])
def generate_case_hypotheses(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates 3 to 4 actionable, testable investigative hypotheses tailored uniquely
    to this case, including required corroborating evidence and recommended warrants.
    """
    hypotheses = gemini_brain_service.generate_case_hypotheses(case_id=case_id, db=db)

    record_audit_event(
        db=db,
        user=current_user,
        action="INSPECTION",
        case_id=case_id,
        reason=f"Generated {len(hypotheses)} case-unique investigative hypotheses using Gemini AI Brain."
    )
    db.commit()

    return hypotheses

@router.get("/cases/{case_id}/ai-brain/compare-profiles")
def compare_case_profiles(
    case_id: str,
    compare_to_case_id: str = Query(default="CASE-0192"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Demonstrates how the AI Brain dynamically alters its persona, analytical posture,
    and directives between two different cases.
    """
    profile_a = gemini_brain_service.get_case_cognitive_profile(case_id=case_id, db=db)
    profile_b = gemini_brain_service.get_case_cognitive_profile(case_id=compare_to_case_id, db=db)

    return {
        "case_a": profile_a,
        "case_b": profile_b,
        "uniqueness_summary": f"Case '{profile_a['persona_code']}' focuses on '{profile_a['specialization']}' with {len(profile_a['behavioral_directives'])} custom directives, while Case '{profile_b['persona_code']}' focuses on '{profile_b['specialization']}' with {len(profile_b['behavioral_directives'])} custom directives."
    }
