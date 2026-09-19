import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app

def test_complete_investigative_lifecycle():
    client = TestClient(app)
    
    # 1. Login
    login_res = client.post("/api/v1/auth/login", json={"username": "svance", "password": "Investigator123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Open Investigation & Case
    inv_res = client.get("/api/v1/investigations/INV-2026-0147", headers=headers)
    assert inv_res.status_code == 200
    assert inv_res.json()["code_name"] == "CERBERUS"
    
    case_res = client.get("/api/v1/cases/CASE-0147", headers=headers)
    assert case_res.status_code == 200
    
    # 3. Ingestion & Pipeline
    pipe_res = client.post("/api/v1/pipeline/trigger", headers=headers)
    assert pipe_res.status_code == 200
    assert pipe_res.json()["status"] == "SUCCESS"
    
    # 4. Entity Resolution Review
    er_candidates = client.get("/api/v1/entity-resolution/candidates?case_id=CASE-0147", headers=headers).json()
    assert len(er_candidates) >= 1
    cand_id = er_candidates[0]["id"]
    er_decide = client.post(f"/api/v1/entity-resolution/candidates/{cand_id}/decide", json={
        "decision": "MERGE",
        "reviewer_notes": "Corroborated by shared phone and DOB in Cayman registry."
    }, headers=headers)
    assert er_decide.status_code == 200
    assert er_decide.json()["status"] == "MERGED"
    
    # 5. Build Graph & Query Network
    net_res = client.get("/api/v1/network?case_id=CASE-0147", headers=headers)
    assert net_res.status_code == 200
    net_data = net_res.json()
    assert len(net_data["nodes"]) >= 30
    assert len(net_data["edges"]) >= 20
    
    # 6. Shortest Path Discovery
    path_res = client.post("/api/v1/network/shortest-path", json={
        "source_entity_id": "ENT-101",
        "target_entity_id": "ENT-105"
    }, headers=headers)
    assert path_res.status_code == 200
    assert path_res.json()["path"] is not None
    
    # 7. AI Finding & Signal Attribution
    findings_res = client.get("/api/v1/intelligence/findings?case_id=CASE-0147", headers=headers)
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) >= 1
    target_finding = findings[0]
    assert "Network Structure" in target_finding["supporting_signals"]
    
    # 8. Inspect Evidence & Provenance Chain
    chain_res = client.get(f"/api/v1/evidence/provenance-chain/{target_finding['id']}", headers=headers)
    assert chain_res.status_code == 200
    chain = chain_res.json()
    assert len(chain["lineage_steps"]) >= 5
    
    # 9. Human Review & Verification (Rule 4: LEADS -> HUMAN REVIEW -> VERIFIED FINDING)
    review_res = client.post(f"/api/v1/reviews/findings/{target_finding['id']}", json={
        "action": "VERIFIED",
        "reason_code": "CONFIRMED_BY_CORROBORATING_BANK_RECORDS",
        "investigator_notes": "Verified Marcus Vance ↔ Sarah Jenkins corporate directorship based on subpoenaed Swiss banking ledgers."
    }, headers=headers)
    assert review_res.status_code == 200
    assert review_res.json()["action"] == "VERIFIED"
    
    # 10. Generate Final Intelligence Dossier
    report_res = client.post("/api/v1/reports/generate", json={
        "case_id": "CASE-0147",
        "title": "Operation Cerberus - Judicial Intelligence Dossier",
        "classification": "SECRET//LAW ENFORCEMENT SENSITIVE"
    }, headers=headers)
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert len(report_data["checksum_sha256"]) == 64
    assert "EXECUTIVE SUMMARY" in report_data["summary"]
    
    # 11. Verify Audit Event
    audit_res = client.get("/api/v1/audit?limit=10", headers=headers)
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert any(log["action"] == "REPORT_GENERATION" for log in audit_logs)
    assert any(log["action"] == "REVIEW_DECISION" for log in audit_logs)
    
    print("\nE2E INVESTIGATIVE LIFECYCLE COMPLETED SUCCESSFULLY!")
