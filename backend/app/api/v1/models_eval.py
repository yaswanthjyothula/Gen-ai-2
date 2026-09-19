from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pipeline import AIModelRegistry
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import AIModelOut
from app.ai.evaluation_engine import evaluation_engine

router = APIRouter(tags=["Model Center & AI Evaluation"])

@router.get("/models", response_model=List[AIModelOut])
def list_ai_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AIModelRegistry).all()

@router.get("/evaluation")
def get_evaluation_dashboard(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Returns research-grade AI benchmark metrics, baseline comparisons, and stress tests."""
    return evaluation_engine.get_comprehensive_evaluation_report()
