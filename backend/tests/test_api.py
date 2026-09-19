import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.session import SessionLocal
from app.models import AIFinding, Finding, Relationship

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login(client):
    # Test admin login
    res = client.post("/api/v1/auth/login", json={"username": "svance", "password": "Investigator123!"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "Investigator"

def test_list_investigations_and_cases(client):
    res_inv = client.get("/api/v1/investigations")
    assert res_inv.status_code == 200
    assert len(res_inv.json()) >= 1
    assert res_inv.json()[0]["id"] == "INV-2026-0147"

    res_cases = client.get("/api/v1/cases")
    assert res_cases.status_code == 200
    assert len(res_cases.json()) >= 2

def test_entities_and_communities(client):
    res_ent = client.get("/api/v1/entities?case_id=CASE-0147")
    assert res_ent.status_code == 200
    entities = res_ent.json()
    assert len(entities) >= 30
    
    # Check specific target entity
    marcus = next((e for e in entities if "Marcus" in e["name"]), None)
    assert marcus is not None
    assert marcus["risk_level"] == "CRITICAL"

    # Test profile detail
    res_prof = client.get(f"/api/v1/entities/{marcus['id']}")
    assert res_prof.status_code == 200
    prof_data = res_prof.json()
    assert "aliases" in prof_data
    assert "relationships" in prof_data

def test_network_graph_export(client):
    res = client.get("/api/v1/network?case_id=CASE-0147")
    assert res.status_code == 200
    graph = res.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert "statistics" in graph
    assert len(graph["nodes"]) >= 30
    assert len(graph["edges"]) >= 20

def test_shortest_path(client):
    # Test shortest path between Marcus Vance (ENT-101) and Sarah Jenkins (ENT-105)
    res = client.post("/api/v1/network/shortest-path", json={
        "source_entity_id": "ENT-101",
        "target_entity_id": "ENT-105"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["path"] is not None
    assert len(data["path"]) >= 2

def test_ai_findings_and_review_workflow(client):
    # Retrieve AI findings
    res = client.get("/api/v1/intelligence/findings?case_id=CASE-0147")
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) >= 2
    
    unverified = next((f for f in findings if f["status"] == "UNVERIFIED"), None)
    if not unverified and findings:
        db = SessionLocal()
        finding_db = db.query(AIFinding).filter_by(id=findings[0]["id"]).first()
        if finding_db:
            finding_db.status = "UNVERIFIED"
            db.commit()
        db.close()
        findings = client.get("/api/v1/intelligence/findings?case_id=CASE-0147").json()
        unverified = next((f for f in findings if f["status"] == "UNVERIFIED"), None)
    assert unverified is not None
    
    # Test Human Review action
    review_res = client.post(f"/api/v1/reviews/findings/{unverified['id']}", json={
        "action": "VERIFIED",
        "reason_code": "CONFIRMED_BY_CORROBORATING_WIRE",
        "investigator_notes": "Corroborated by Det. Sarah Vance using Title III wiretap session transcripts."
    })
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert review_data["action"] == "VERIFIED"
    assert review_data["new_status"] == "VERIFIED"

    # Verify provenance chain
    chain_res = client.get(f"/api/v1/evidence/provenance-chain/{unverified['id']}")
    assert chain_res.status_code == 200
    chain = chain_res.json()
    assert len(chain["lineage_steps"]) >= 5

def test_evaluation_dashboard(client):
    res = client.get("/api/v1/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert "link_prediction" in data
    assert "community_detection" in data
    assert "anomaly_detection" in data
    assert "operational_impact" in data

def test_audit_log_capture(client):
    res = client.get("/api/v1/audit?limit=20")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 3
    # Check that audit log has action and user fields
    assert "action" in logs[0]
    assert "username" in logs[0]
