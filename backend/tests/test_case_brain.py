import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    res = client.post("/api/v1/auth/login", json={"username": "svance", "password": "Investigator123!"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_case_brain_status(client, auth_headers):
    res = client.get("/api/v1/intelligence/case-brain/status", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["provider"] == "Google DeepMind / Google Cloud"
    assert "gemini" in data["model"].lower()
    assert data["key_configured"] is True

def test_case_brain_profile_uniqueness(client, auth_headers):
    # Test CASE-0147 (Operation CERBERUS - AML & Financial Structuring)
    res_147 = client.get("/api/v1/cases/CASE-0147/ai-brain/profile", headers=auth_headers)
    assert res_147.status_code == 200
    data_147 = res_147.json()
    assert data_147["persona_code"] == "CERBERUS-Forensic-AML"
    assert "Financial Structuring" in data_147["specialization"]
    assert len(data_147["behavioral_directives"]) >= 3

    # Test CASE-0192 (Operation ODIN - Maritime & Port Interdiction)
    res_192 = client.get("/api/v1/cases/CASE-0192/ai-brain/profile", headers=auth_headers)
    assert res_192.status_code == 200
    data_192 = res_192.json()
    assert data_192["persona_code"] == "ODIN-Tactical-Interdict"
    assert "Maritime" in data_192["specialization"]
    assert len(data_192["behavioral_directives"]) >= 3

    # Verify that the two cases have strictly unique profiles
    assert data_147["persona_code"] != data_192["persona_code"]
    assert data_147["specialization"] != data_192["specialization"]
    assert data_147["analytical_posture"] != data_192["analytical_posture"]

def test_case_brain_chat_grounded(client, auth_headers):
    res = client.post("/api/v1/cases/CASE-0147/ai-brain/chat", json={
        "message": "Analyze the financial connection between Marcus Vance and Sarah Jenkins via BlueWater Capital Trust."
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["case_id"] == "CASE-0147"
    assert data["persona_code"] == "CERBERUS-Forensic-AML"
    assert len(data["response"]) > 50
    assert len(data["suggested_next_leads"]) >= 1

def test_case_brain_hypotheses(client, auth_headers):
    res = client.post("/api/v1/cases/CASE-0147/ai-brain/hypotheses", headers=auth_headers)
    assert res.status_code == 200
    hypotheses = res.json()
    assert len(hypotheses) >= 2
    first = hypotheses[0]
    assert "title" in first
    assert "rationale" in first
    assert "target_entities" in first
    assert "required_evidence_to_verify" in first

def test_compare_case_profiles(client, auth_headers):
    res = client.get("/api/v1/cases/CASE-0147/ai-brain/compare-profiles?compare_to_case_id=CASE-0192", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "case_a" in data
    assert "case_b" in data
    assert data["case_a"]["persona_code"] == "CERBERUS-Forensic-AML"
    assert data["case_b"]["persona_code"] == "ODIN-Tactical-Interdict"
