from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.graph.graph_service import graph_service
from app.models.auth import User
from app.core.rbac import get_current_user
from app.schemas.domain import (
    NetworkGraphResponse, ShortestPathRequest, ShortestPathResponse
)

router = APIRouter(prefix="/network", tags=["Network Graph & Analytics"])

@router.get("", response_model=NetworkGraphResponse)
def get_network_graph(
    case_id: Optional[str] = Query(None, description="Case ID filter"),
    date_from: Optional[datetime] = Query(None, description="Temporal filter start"),
    date_to: Optional[datetime] = Query(None, description="Temporal filter end"),
    entity_types: Optional[List[str]] = Query(None, description="Filter node types"),
    relationship_types: Optional[List[str]] = Query(None, description="Filter edge types"),
    community_id: Optional[str] = Query(None, description="Filter by community"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Rebuild graph if needed
    graph_service.build_graph_from_db(db, case_id=case_id)
    
    # Export elements in Cytoscape format
    elements = graph_service.export_cytoscape_elements(
        date_from=date_from,
        date_to=date_to,
        entity_type_filter=entity_types,
        relationship_type_filter=relationship_types,
        community_id_filter=community_id
    )
    return elements

@router.post("/shortest-path", response_model=ShortestPathResponse)
def compute_shortest_path(
    req: ShortestPathRequest,
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    graph_service.build_graph_from_db(db, case_id=case_id)
    path = graph_service.find_shortest_path(req.source_entity_id, req.target_entity_id)
    
    if not path:
        return {
            "source": req.source_entity_id,
            "target": req.target_entity_id,
            "path": None,
            "length": 0,
            "intermediaries": []
        }
    
    intermediaries = path[1:-1] if len(path) > 2 else []
    return {
        "source": req.source_entity_id,
        "target": req.target_entity_id,
        "path": path,
        "length": len(path) - 1,
        "intermediaries": intermediaries
    }

@router.get("/centrality")
def get_graph_centrality(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    graph_service.build_graph_from_db(db, case_id=case_id)
    metrics = graph_service.compute_centrality_metrics()
    return metrics
