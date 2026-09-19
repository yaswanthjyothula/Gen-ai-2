import datetime
import hashlib
from app.models import (
    User, Investigation, Case, Entity, EntityAlias, Community, Relationship,
    SourceRecord, Evidence, AIFinding, Anomaly, CrossCaseLink, TimelineEvent,
    ReviewAction, Finding, DataSource, PipelineRun, EntityResolutionCandidate,
    AIModelRegistry, AuditLog, RetentionPolicy
)
from app.core.security import get_password_hash

def generate_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def seed_database(db):
    # Check if already seeded
    if db.query(Investigation).filter_by(id="INV-2026-0147").first():
        return
        
    print("Generating realistic synthetic dataset: Operation CERBERUS (INV-2026-0147)...")
    now = datetime.datetime.utcnow()
    hashed_pwd = get_password_hash("Investigator123!")

    # 1. Users & RBAC
    users = [
        User(id="USR-001", username="admin", email="admin@crimenetx.gov", full_name="Director Robert Sterling", hashed_password=hashed_pwd, role="Administrator", badge_number="DIR-001", department="Executive Command"),
        User(id="USR-002", username="svance", email="svance@crimenetx.gov", full_name="Det. Insp. Sarah Vance", hashed_password=hashed_pwd, role="Investigator", badge_number="INV-4412", department="Transnational Organised Crime"),
        User(id="USR-003", username="analyst", email="arivera@crimenetx.gov", full_name="Alex Rivera", hashed_password=hashed_pwd, role="Analyst", badge_number="ANL-8901", department="Financial & Cyber Intelligence"),
        User(id="USR-004", username="reviewer", email="mholt@crimenetx.gov", full_name="Marcus Holt, Esq.", hashed_password=hashed_pwd, role="Reviewer", badge_number="REV-2004", department="Office of Special Counsel"),
        User(id="USR-005", username="auditor", email="egomez@crimenetx.gov", full_name="Elena Gomez", hashed_password=hashed_pwd, role="Auditor", badge_number="AUD-1102", department="Independent Oversight & Compliance"),
    ]
    db.add_all(users)

    # 2. Investigations & Cases
    inv = Investigation(
        id="INV-2026-0147",
        title="Operation Cerberus - Transnational Syndicate Intelligence",
        code_name="CERBERUS",
        description="Comprehensive inter-agency investigation targeting illicit narcotics distribution, shell company layering, and encrypted communications infrastructure.",
        status="ACTIVE",
        lead_investigator_id="USR-002",
        classification="SECRET//LAW ENFORCEMENT SENSITIVE",
        created_at=now - datetime.timedelta(days=90),
        metadata_json={"joint_task_force": ["DEA", "FBI", "Europol", "Customs"], "warrant_authority": "US District Court SDNY #2026-CR-099"}
    )
    db.add(inv)

    case_primary = Case(
        id="CASE-0147",
        investigation_id="INV-2026-0147",
        title="Cerberus Core Distribution & Layered Finance",
        status="ACTIVE",
        priority="CRITICAL",
        case_type="Organised Crime & Illicit Finance",
        lead_officer="Det. Insp. Sarah Vance",
        description="Primary investigation into the upper-tier command of the Vance syndicate and offshore accounts.",
        created_at=now - datetime.timedelta(days=90),
        entity_count=42,
        relationship_count=128,
        evidence_count=24,
        findings_count=3
    )
    case_secondary = Case(
        id="CASE-0192",
        investigation_id="INV-2026-0147",
        title="Port Authority Cargo Diversion & Armored Courier Heist",
        status="ACTIVE",
        priority="HIGH",
        case_type="Cargo Intercept & Port Authority Breach",
        lead_officer="Det. Michael Thorne",
        description="Linked inquiry into container tampering at Pier 42 and stolen maritime logistics credentials.",
        created_at=now - datetime.timedelta(days=45),
        entity_count=14,
        relationship_count=32,
        evidence_count=8,
        findings_count=1
    )
    db.add_all([case_primary, case_secondary])

    # 3. Communities
    communities = [
        Community(id="COMM-01", case_id="CASE-0147", name="Executive Command Cell", description="Upper-echelon orchestrators managing strategic procurement and money laundering conduits.", size=5, density=0.74, primary_entity_id="ENT-101", community_type="Operational Command", modularity_score=0.82),
        Community(id="COMM-02", case_id="CASE-0147", name="Financial Layering Syndicate", description="Offshore shell corporations, nominee directors, and cross-border bank conduits in Switzerland and Panama.", size=8, density=0.68, primary_entity_id="ENT-102", community_type="Financial Laundering", modularity_score=0.79),
        Community(id="COMM-03", case_id="CASE-0147", name="Logistics & Port Smuggling Wing", description="Maritime transport operators, corrupt dock foremen, and localized distribution drivers.", size=7, density=0.61, primary_entity_id="ENT-103", community_type="Distribution & Logistics", modularity_score=0.75),
        Community(id="COMM-04", case_id="CASE-0147", name="Encrypted Comms & Cyber Infrastructure", description="Burner device procurement, counter-surveillance hardware, and darknet communications.", size=4, density=0.55, primary_entity_id="ENT-104", community_type="Cyber & Comms", modularity_score=0.84),
    ]
    db.add_all(communities)

    # 4. Entities
    entities = [
        # People
        Entity(id="ENT-101", case_id="CASE-0147", name='Marcus "The Bishop" Vance', entity_type="Person", category="Primary Target", confidence=1.0, risk_level="CRITICAL", degree_centrality=0.88, betweenness_centrality=0.82, closeness_centrality=0.79, community_id="COMM-01", attributes={"dob": "1978-04-14", "citizenship": "United States", "known_residence": "88 Wall St Penthouse, NY", "role": "Syndicate Head / Strategic Coordinator"}),
        Entity(id="ENT-102", case_id="CASE-0147", name="Elena Rostova", entity_type="Person", category="Primary Target", confidence=0.98, risk_level="HIGH", degree_centrality=0.74, betweenness_centrality=0.71, closeness_centrality=0.68, community_id="COMM-02", attributes={"dob": "1983-11-29", "citizenship": "Switzerland / Cyprus", "known_residence": "Zurich / London", "role": "Senior Financial Broker & Escrow Manager"}),
        Entity(id="ENT-103", case_id="CASE-0147", name="Tariq Al-Mansoor", entity_type="Person", category="Associate", confidence=0.96, risk_level="HIGH", degree_centrality=0.65, betweenness_centrality=0.59, closeness_centrality=0.61, community_id="COMM-03", attributes={"dob": "1981-08-03", "citizenship": "UAE / Canada", "role": "Maritime Freight Logistics Broker"}),
        Entity(id="ENT-104", case_id="CASE-0147", name="David Chen", entity_type="Person", category="Facilitator", confidence=0.95, risk_level="MEDIUM", degree_centrality=0.58, betweenness_centrality=0.49, closeness_centrality=0.54, community_id="COMM-04", attributes={"dob": "1991-02-17", "citizenship": "United States", "role": "Systems Administrator & Encrypted Comms Technician"}),
        Entity(id="ENT-105", case_id="CASE-0147", name="Sarah Jenkins", entity_type="Person", category="Facilitator", confidence=0.89, risk_level="HIGH", degree_centrality=0.52, betweenness_centrality=0.45, closeness_centrality=0.51, community_id="COMM-02", attributes={"dob": "1986-06-22", "citizenship": "United Kingdom", "role": "Nominee Corporate Director for Shell Vehicles"}),
        Entity(id="ENT-106", case_id="CASE-0147", name="Viktor Novak", entity_type="Person", category="Primary Target", confidence=0.92, risk_level="HIGH", degree_centrality=0.48, betweenness_centrality=0.41, closeness_centrality=0.47, community_id="COMM-02", attributes={"dob": "1975-09-11", "citizenship": "Czech Republic", "role": "European Wholesale Capital Custodian"}),
        Entity(id="ENT-107", case_id="CASE-0147", name="Carlos Mendoza", entity_type="Person", category="Associate", confidence=0.94, risk_level="HIGH", degree_centrality=0.55, betweenness_centrality=0.43, closeness_centrality=0.52, community_id="COMM-03", attributes={"dob": "1984-12-05", "citizenship": "Colombia / US", "role": "Warehouse Operations Foreman Pier 42"}),
        Entity(id="ENT-108", case_id="CASE-0147", name="Amina Kassam", entity_type="Person", category="Associate", confidence=0.90, risk_level="MEDIUM", degree_centrality=0.41, betweenness_centrality=0.35, closeness_centrality=0.45, community_id="COMM-03", attributes={"dob": "1989-03-30", "citizenship": "Canada", "role": "Customs Declarations Clearing Agent"}),
        Entity(id="ENT-109", case_id="CASE-0147", name="Leo Sterling", entity_type="Person", category="Associate", confidence=0.88, risk_level="LOW", degree_centrality=0.36, betweenness_centrality=0.28, closeness_centrality=0.40, community_id="COMM-01", attributes={"dob": "1994-10-18", "citizenship": "United States", "role": "Personal Courier to Marcus Vance"}),
        Entity(id="ENT-110", case_id="CASE-0147", name="Frank DeLuca", entity_type="Person", category="Associate", confidence=0.91, risk_level="MEDIUM", degree_centrality=0.44, betweenness_centrality=0.38, closeness_centrality=0.43, community_id="COMM-03", attributes={"dob": "1980-01-25", "citizenship": "United States", "role": "Freight Dispatcher Port Newark"}),

        # Organisations / Shell Companies
        Entity(id="ENT-201", case_id="CASE-0147", name="Apex Global Trade Ltd", entity_type="Organisation", category="Asset", confidence=1.0, risk_level="CRITICAL", degree_centrality=0.79, betweenness_centrality=0.75, closeness_centrality=0.72, community_id="COMM-02", attributes={"jurisdiction": "Delaware / Panama", "registration_no": "DE-5928104", "type": "Shell Import-Export Conduit"}),
        Entity(id="ENT-202", case_id="CASE-0147", name="BlueWater Capital Trust", entity_type="Organisation", category="Asset", confidence=0.97, risk_level="HIGH", degree_centrality=0.62, betweenness_centrality=0.55, closeness_centrality=0.59, community_id="COMM-02", attributes={"jurisdiction": "Cayman Islands", "registration_no": "KY-99214", "type": "Nominee Fiduciary Holding"}),
        Entity(id="ENT-203", case_id="CASE-0147", name="Helvetia Logistics AG", entity_type="Organisation", category="Asset", confidence=0.93, risk_level="HIGH", degree_centrality=0.51, betweenness_centrality=0.44, closeness_centrality=0.50, community_id="COMM-03", attributes={"jurisdiction": "Geneva, Switzerland", "registration_no": "CHE-104.992", "type": "Freight Forwarding Cover"}),
        Entity(id="ENT-204", case_id="CASE-0147", name="Kestrel Maritime Holdings", entity_type="Organisation", category="Asset", confidence=0.88, risk_level="MEDIUM", degree_centrality=0.42, betweenness_centrality=0.32, closeness_centrality=0.44, community_id="COMM-03", attributes={"jurisdiction": "Monrovia, Liberia", "registration_no": "LBR-33291", "type": "Cargo Vessel Leasing"}),
        Entity(id="ENT-205", case_id="CASE-0147", name="Nexus Security Solutions", entity_type="Organisation", category="Asset", confidence=0.85, risk_level="MEDIUM", degree_centrality=0.39, betweenness_centrality=0.29, closeness_centrality=0.42, community_id="COMM-04", attributes={"jurisdiction": "New Jersey, US", "registration_no": "NJ-882104", "type": "Private Surveillance & Escort"}),

        # Accounts & Wallets
        Entity(id="ENT-301", case_id="CASE-0147", name="IBAN-CH93-88219 (Credit Suisse Zurich)", entity_type="Account", category="Asset", confidence=1.0, risk_level="CRITICAL", degree_centrality=0.69, betweenness_centrality=0.62, closeness_centrality=0.64, community_id="COMM-02", attributes={"currency": "CHF / USD", "beneficial_owner": "Apex Global Trade Ltd", "balance_approx": "$4.8M"}),
        Entity(id="ENT-302", case_id="CASE-0147", name="IBAN-GB21-99431 (Barclays London)", entity_type="Account", category="Asset", confidence=0.95, risk_level="HIGH", degree_centrality=0.55, betweenness_centrality=0.48, closeness_centrality=0.53, community_id="COMM-02", attributes={"currency": "GBP / USD", "beneficial_owner": "Sarah Jenkins (Nominee)", "balance_approx": "$1.2M"}),
        Entity(id="ENT-303", case_id="CASE-0147", name="Crypto Wallet 0x8F9B...d2A (Tether USDT)", entity_type="Account", category="Asset", confidence=0.91, risk_level="HIGH", degree_centrality=0.47, betweenness_centrality=0.40, closeness_centrality=0.48, community_id="COMM-02", attributes={"blockchain": "Ethereum / Tron", "asset": "USDT", "volume_30d": "$2.9M"}),
        Entity(id="ENT-304", case_id="CASE-0147", name="Panama Cayman Trust ACC-772", entity_type="Account", category="Asset", confidence=0.87, risk_level="HIGH", degree_centrality=0.44, betweenness_centrality=0.37, closeness_centrality=0.46, community_id="COMM-02", attributes={"currency": "USD", "signatory": "Nominee Fiduciary", "balance_approx": "$6.1M"}),

        # Phones & Comms
        Entity(id="ENT-401", case_id="CASE-0147", name="Burner Cell +1-917-555-0192", entity_type="Phone", category="Infrastructure", confidence=0.99, risk_level="HIGH", degree_centrality=0.64, betweenness_centrality=0.57, closeness_centrality=0.60, community_id="COMM-04", attributes={"carrier": "MetroPCS Prepaid", "imei": "864201049281741", "primary_user": 'Marcus "The Bishop" Vance'}),
        Entity(id="ENT-402", case_id="CASE-0147", name="Encrypted IMSI-310410-Signal", entity_type="Phone", category="Infrastructure", confidence=0.94, risk_level="HIGH", degree_centrality=0.56, betweenness_centrality=0.49, closeness_centrality=0.53, community_id="COMM-04", attributes={"protocol": "Signal / Off-Grid Meshtastic", "imsi": "310410882194821", "primary_user": "David Chen"}),
        Entity(id="ENT-403", case_id="CASE-0147", name="Satellite Handset Iridium-881", entity_type="Phone", category="Infrastructure", confidence=0.88, risk_level="HIGH", degree_centrality=0.38, betweenness_centrality=0.31, closeness_centrality=0.41, community_id="COMM-03", attributes={"constellation": "Iridium Maritime", "msisdn": "+88163185291", "primary_user": "Tariq Al-Mansoor"}),
        Entity(id="ENT-404", case_id="CASE-0147", name="Burner Cell +44-7700-900821", entity_type="Phone", category="Infrastructure", confidence=0.91, risk_level="MEDIUM", degree_centrality=0.43, betweenness_centrality=0.34, closeness_centrality=0.45, community_id="COMM-02", attributes={"carrier": "Vodafone UK Prepaid", "imei": "358920194821092", "primary_user": "Elena Rostova"}),

        # Vehicles
        Entity(id="ENT-501", case_id="CASE-0147", name="Black Mercedes G-63 Lic# NY-X992", entity_type="Vehicle", category="Asset", confidence=1.0, risk_level="CRITICAL", degree_centrality=0.72, betweenness_centrality=0.66, closeness_centrality=0.67, community_id="COMM-01", attributes={"vin": "WDB4632761X992014", "registered_owner": "Apex Global Trade Ltd", "notes": "Identified at Pier 42 and Wall St penthouse; spotted in CASE-0192"}),
        Entity(id="ENT-502", case_id="CASE-0147", name="Armored Ford Transit Lic# NJ-771B", entity_type="Vehicle", category="Asset", confidence=0.93, risk_level="HIGH", degree_centrality=0.46, betweenness_centrality=0.39, closeness_centrality=0.47, community_id="COMM-03", attributes={"vin": "1FTYR1Y84KPA99214", "registered_owner": "Nexus Security Solutions", "notes": "Fitted with hidden floor bulkhead"}),
        Entity(id="ENT-503", case_id="CASE-0147", name='Speedboat "Sea Ghost" Reg# DL-9921', entity_type="Vehicle", category="Asset", confidence=0.86, risk_level="HIGH", degree_centrality=0.34, betweenness_centrality=0.25, closeness_centrality=0.39, community_id="COMM-03", attributes={"hull_id": "DL9921-GO-2022", "registered_owner": "Kestrel Maritime Holdings", "home_port": "Port Newark"}),

        # Locations
        Entity(id="ENT-601", case_id="CASE-0147", name="Pier 42 Secure Warehouse Facility", entity_type="Location", category="Infrastructure", confidence=1.0, risk_level="CRITICAL", degree_centrality=0.76, betweenness_centrality=0.70, closeness_centrality=0.71, community_id="COMM-03", attributes={"address": "Pier 42, North River Terminal, NJ", "coordinates": [40.7291, -74.0118], "security": "Biometric Access / CCTV Jammer"}),
        Entity(id="ENT-602", case_id="CASE-0147", name="Financial Suite 14B Zurich", entity_type="Location", category="Infrastructure", confidence=0.95, risk_level="HIGH", degree_centrality=0.59, betweenness_centrality=0.52, closeness_centrality=0.58, community_id="COMM-02", attributes={"address": "Bahnhofstrasse 14B, 8001 Zurich, Switzerland", "coordinates": [47.3698, 8.5392], "use": "Private Wealth Management & Escrow Office"}),
        Entity(id="ENT-603", case_id="CASE-0147", name="Freight Terminal Dock B Port Newark", entity_type="Location", category="Infrastructure", confidence=0.92, risk_level="HIGH", degree_centrality=0.53, betweenness_centrality=0.46, closeness_centrality=0.51, community_id="COMM-03", attributes={"address": "Berth 54, Port Newark Container Terminal, NJ", "coordinates": [40.6892, -74.1481], "use": "Container Offloading & Intercept"}),
        Entity(id="ENT-604", case_id="CASE-0147", name="Wall St Penthouse 88", entity_type="Location", category="Infrastructure", confidence=0.97, risk_level="HIGH", degree_centrality=0.57, betweenness_centrality=0.50, closeness_centrality=0.55, community_id="COMM-01", attributes={"address": "88 Wall Street, Fl 34, New York, NY", "coordinates": [40.7061, -74.0084], "use": "Marcus Vance Primary Residence & Meeting Point"}),

        # Devices
        Entity(id="ENT-701", case_id="CASE-0147", name="Toughbook CF-33 Encrypted Laptop", entity_type="Device", category="Infrastructure", confidence=0.94, risk_level="HIGH", degree_centrality=0.45, betweenness_centrality=0.38, closeness_centrality=0.48, community_id="COMM-04", attributes={"mac_address": "00:1A:2B:3C:4D:5E", "encryption": "LUKS2 512-bit / VeraCrypt", "assigned_to": "David Chen"}),
        Entity(id="ENT-702", case_id="CASE-0147", name="Ledger Nano Cold Hardware Wallet", entity_type="Device", category="Asset", confidence=0.90, risk_level="HIGH", degree_centrality=0.39, betweenness_centrality=0.30, closeness_centrality=0.43, community_id="COMM-02", attributes={"serial_no": "LN-X-8821094", "custody": "Recovered Safe Deposit Vault 82"}),
        Entity(id="ENT-703", case_id="CASE-0147", name="IMSI Catcher Detector Unit", entity_type="Device", category="Infrastructure", confidence=0.87, risk_level="MEDIUM", degree_centrality=0.35, betweenness_centrality=0.26, closeness_centrality=0.40, community_id="COMM-04", attributes={"hardware_model": "CrocoShark v3", "installed_at": "Pier 42 Secure Warehouse"}),

        # Connected Cases as Entities
        Entity(id="ENT-801", case_id="CASE-0147", name="CASE-0147 (Core Operation Cerberus)", entity_type="Case", category="Primary Target", confidence=1.0, risk_level="CRITICAL", degree_centrality=0.95, betweenness_centrality=0.91, closeness_centrality=0.88, community_id="COMM-01", attributes={"title": "Cerberus Core Distribution & Layered Finance"}),
        Entity(id="ENT-802", case_id="CASE-0147", name="CASE-0192 (Port Newark Heist)", entity_type="Case", category="Associate", confidence=1.0, risk_level="HIGH", degree_centrality=0.60, betweenness_centrality=0.55, closeness_centrality=0.58, community_id="COMM-03", attributes={"title": "Port Authority Cargo Diversion"}),
    ]
    db.add_all(entities)

    # Aliases
    aliases = [
        EntityAlias(entity_id="ENT-101", alias="The Bishop", source="Court-authorized Wiretap Title III"),
        EntityAlias(entity_id="ENT-101", alias="M. Alexander Vance", source="Panama Corporate Register"),
        EntityAlias(entity_id="ENT-102", alias="Frau K.", source="Zurich Escrow Intercept"),
        EntityAlias(entity_id="ENT-103", alias="Tariq Canadian", source="Port Customs Radio Log"),
        EntityAlias(entity_id="ENT-104", alias="0xGhost", source="Darknet PGP Key Ring"),
        EntityAlias(entity_id="ENT-105", alias="S. J. Nominees", source="Companies House UK"),
    ]
    db.add_all(aliases)

    # 5. Relationships (Multi-type, Temporal)
    t_start = now - datetime.timedelta(days=75)
    relationships = [
        # Executive Command & Association
        Relationship(id="REL-501", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-102", relationship_type="Association", label="Directs Financial Operations", confidence=0.98, weight=3.5, verification_status="VERIFIED", first_seen=t_start, last_seen=now - datetime.timedelta(days=2), frequency=46, attributes={"nature": "Encrypted directives regarding Swiss escrow and shell accounts"}),
        Relationship(id="REL-502", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-103", relationship_type="Association", label="Oversees Logistics Routing", confidence=0.96, weight=3.0, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=5), last_seen=now - datetime.timedelta(days=3), frequency=32, attributes={"nature": "Direct dispatch orders for maritime shipments"}),
        Relationship(id="REL-503", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-104", relationship_type="Communication", label="Weekly Encrypted Check-in", confidence=0.99, weight=4.0, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=2), last_seen=now - datetime.timedelta(days=1), frequency=58, attributes={"protocol": "Signal / Off-Grid P2P", "avg_duration_sec": 420}),
        Relationship(id="REL-504", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-501", relationship_type="Ownership", label="Exclusive Personal Use", confidence=1.0, weight=5.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now, frequency=88, attributes={"plate": "NY-X992", "chassis": "Mercedes G-63"}),
        Relationship(id="REL-505", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-604", relationship_type="Location", label="Primary Residence & Base", confidence=1.0, weight=5.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now, frequency=120, attributes={"residence_type": "Luxury Penthouse"}),
        Relationship(id="REL-506", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-401", relationship_type="Communication", label="Primary Burner Handset", confidence=0.99, weight=4.5, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=10), last_seen=now, frequency=92, attributes={"msisdn": "+1-917-555-0192"}),

        # Corporate Ownership & Financial Conduit
        Relationship(id="REL-507", case_id="CASE-0147", source_entity_id="ENT-102", target_entity_id="ENT-201", relationship_type="Ownership", label="Beneficial Escrow Controller", confidence=0.97, weight=4.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now - datetime.timedelta(days=4), frequency=22, attributes={"role": "Signatory Officer"}),
        Relationship(id="REL-508", case_id="CASE-0147", source_entity_id="ENT-201", target_entity_id="ENT-301", relationship_type="Financial", label="Corporate Account Holder", confidence=1.0, weight=5.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now, frequency=64, attributes={"bank": "Credit Suisse Zurich", "balance": "$4.8M"}),
        Relationship(id="REL-509", case_id="CASE-0147", source_entity_id="ENT-301", target_entity_id="ENT-302", relationship_type="Financial", label="Layered Wire Transfers ($850K)", confidence=0.99, weight=4.2, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=15), last_seen=now - datetime.timedelta(days=7), frequency=8, attributes={"total_transferred": 850000, "currency": "USD"}),
        Relationship(id="REL-510", case_id="CASE-0147", source_entity_id="ENT-105", target_entity_id="ENT-202", relationship_type="Organisation", label="Nominee Managing Director", confidence=0.94, weight=3.8, verification_status="VERIFIED", first_seen=t_start, last_seen=now - datetime.timedelta(days=5), frequency=18, attributes={"trust": "BlueWater Capital Trust"}),
        Relationship(id="REL-511", case_id="CASE-0147", source_entity_id="ENT-202", target_entity_id="ENT-304", relationship_type="Financial", label="Offshore Conduit Fiduciary", confidence=0.95, weight=4.0, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=20), last_seen=now - datetime.timedelta(days=10), frequency=12, attributes={"destination": "Panama Cayman Trust"}),
        Relationship(id="REL-512", case_id="CASE-0147", source_entity_id="ENT-102", target_entity_id="ENT-106", relationship_type="Financial", label="Transferred Wholesale Settlement Funds ($1.4M)", confidence=0.96, weight=4.1, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=25), last_seen=now - datetime.timedelta(days=6), frequency=6, attributes={"jurisdiction": "Zurich -> Prague"}),
        Relationship(id="REL-513", case_id="CASE-0147", source_entity_id="ENT-102", target_entity_id="ENT-602", relationship_type="Location", label="Regular Physical Presence", confidence=0.98, weight=4.0, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=12), last_seen=now - datetime.timedelta(days=8), frequency=19, attributes={"office": "Financial Suite 14B Zurich"}),
        Relationship(id="REL-514", case_id="CASE-0147", source_entity_id="ENT-106", target_entity_id="ENT-303", relationship_type="Financial", label="Liquidated USDT into Tether Wallet", confidence=0.92, weight=3.7, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=30), last_seen=now - datetime.timedelta(days=3), frequency=15, attributes={"crypto_amount": "950,000 USDT"}),

        # Logistics & Distribution
        Relationship(id="REL-515", case_id="CASE-0147", source_entity_id="ENT-103", target_entity_id="ENT-203", relationship_type="Organisation", label="Logistics Director & Agent", confidence=0.95, weight=3.8, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=8), last_seen=now - datetime.timedelta(days=4), frequency=24, attributes={"freight": "Helvetia Logistics AG"}),
        Relationship(id="REL-516", case_id="CASE-0147", source_entity_id="ENT-103", target_entity_id="ENT-107", relationship_type="Communication", label="Operational Staging Calls", confidence=0.97, weight=3.9, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=14), last_seen=now - datetime.timedelta(days=2), frequency=41, attributes={"location_discussed": "Pier 42 North River Terminal"}),
        Relationship(id="REL-517", case_id="CASE-0147", source_entity_id="ENT-107", target_entity_id="ENT-601", relationship_type="Location", label="Keyholder & Night Shift Supervisor", confidence=1.0, weight=5.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now - datetime.timedelta(days=1), frequency=72, attributes={"facility": "Pier 42 Warehouse"}),
        Relationship(id="REL-518", case_id="CASE-0147", source_entity_id="ENT-107", target_entity_id="ENT-502", relationship_type="Vehicle", label="Authorized Driver for Armored Transit", confidence=0.95, weight=4.0, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=18), last_seen=now - datetime.timedelta(days=3), frequency=16, attributes={"vehicle": "Ford Transit NJ-771B"}),
        Relationship(id="REL-519", case_id="CASE-0147", source_entity_id="ENT-108", target_entity_id="ENT-603", relationship_type="Location", label="Customs Clearing Desk", confidence=0.94, weight=3.6, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=10), last_seen=now - datetime.timedelta(days=4), frequency=38, attributes={"dock": "Port Newark Dock B"}),
        Relationship(id="REL-520", case_id="CASE-0147", source_entity_id="ENT-108", target_entity_id="ENT-110", relationship_type="Communication", label="Cargo Release Notifications", confidence=0.93, weight=3.5, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=15), last_seen=now - datetime.timedelta(days=2), frequency=27, attributes={"nature": "Bypassing automated customs holds"}),

        # Encrypted Comms & Cyber Infrastructure
        Relationship(id="REL-521", case_id="CASE-0147", source_entity_id="ENT-104", target_entity_id="ENT-402", relationship_type="Communication", label="Administered Secure Mesh SIM", confidence=0.98, weight=4.2, verification_status="VERIFIED", first_seen=t_start, last_seen=now, frequency=84, attributes={"protocol": "Signal / OMEMO"}),
        Relationship(id="REL-522", case_id="CASE-0147", source_entity_id="ENT-104", target_entity_id="ENT-701", relationship_type="Ownership", label="Primary Operator of Toughbook", confidence=1.0, weight=5.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now, frequency=95, attributes={"laptop": "Panasonic CF-33"}),
        Relationship(id="REL-523", case_id="CASE-0147", source_entity_id="ENT-104", target_entity_id="ENT-601", relationship_type="Location", label="Configured Surveillance Jammers", confidence=0.91, weight=3.4, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=22), last_seen=now - datetime.timedelta(days=12), frequency=8, attributes={"hardware": "IMSI Catcher Detector"}),

        # Cross-Case Connections & Multi-hub Edges
        Relationship(id="REL-524", case_id="CASE-0147", source_entity_id="ENT-501", target_entity_id="ENT-601", relationship_type="Location", label="Spotted on Surveillance Cameras", confidence=0.99, weight=4.8, verification_status="VERIFIED", first_seen=t_start + datetime.timedelta(days=28), last_seen=now - datetime.timedelta(days=5), frequency=14, attributes={"source": "Port Authority Plate Reader"}),
        Relationship(id="REL-525", case_id="CASE-0147", source_entity_id="ENT-201", target_entity_id="ENT-501", relationship_type="Ownership", label="Registered Vehicle Owner", confidence=1.0, weight=5.0, verification_status="VERIFIED", first_seen=t_start, last_seen=now, frequency=1, attributes={"dmv_reg": "DE-5928104"}),
        Relationship(id="REL-526", case_id="CASE-0147", source_entity_id="ENT-501", target_entity_id="ENT-802", relationship_type="Case", label="Evidence in Armored Courier Theft", confidence=0.96, weight=4.5, verification_status="VERIFIED", first_seen=now - datetime.timedelta(days=20), last_seen=now - datetime.timedelta(days=18), frequency=3, attributes={"case_reference": "CASE-0192"}),
        Relationship(id="REL-527", case_id="CASE-0147", source_entity_id="ENT-201", target_entity_id="ENT-802", relationship_type="Case", label="Consignee on Tampered Bill of Lading", confidence=0.94, weight=4.0, verification_status="VERIFIED", first_seen=now - datetime.timedelta(days=25), last_seen=now - datetime.timedelta(days=20), frequency=2, attributes={"bill_of_lading": "BL-7702-PN"}),

        # AI-PREDICTED CANDIDATE RELATIONSHIP (UNVERIFIED)
        Relationship(id="REL-901", case_id="CASE-0147", source_entity_id="ENT-101", target_entity_id="ENT-105", relationship_type="Association", label="Potential Hidden Beneficial Controller", confidence=0.84, weight=2.8, verification_status="AI_UNVERIFIED", first_seen=now - datetime.timedelta(days=14), last_seen=now - datetime.timedelta(days=1), frequency=5, attributes={"model": "Link Prediction v2.4", "signals": {"network_topology": 0.32, "financial_flow": 0.28, "temporal_correlation": 0.22, "location_coincidence": 0.18}}),
    ]
    db.add_all(relationships)

    # 6. Source Records & Evidence
    src_rec_1 = SourceRecord(
        id="SRC-REC-1001",
        source_name="FinCEN Suspicious Activity Report (SAR) Batch 2026-Q1",
        source_type="Banking",
        raw_content="Wire transfer of $850,000 from Credit Suisse CH93-88219 to Barclays GB21-99431 referencing consulting invoice #CI-881. Beneficial ownership disguised behind nominee fiduciary Sarah Jenkins.",
        ingestion_timestamp=now - datetime.timedelta(days=28),
        checksum_sha256=generate_sha256("FinCEN SAR Batch 2026-Q1 wire $850k"),
        status="PROCESSED",
        metadata_json={"filing_institution": "Credit Suisse Security Oversight", "fincen_bsa_id": "31000294821094"}
    )
    src_rec_2 = SourceRecord(
        id="SRC-REC-1002",
        source_name="MetTel Automated CDR Intercept Feed",
        source_type="Telephony",
        raw_content="Call Record: Originating +1-917-555-0192 (Marcus Vance), Terminating +44-7700-900821 (Elena Rostova). Duration: 1,420 seconds. Cell Site: Tower NY-0412 azimuth 120 (Wall St vicinity). Audio captured under SDNY Title III Order #2026-W-89.",
        ingestion_timestamp=now - datetime.timedelta(days=16),
        checksum_sha256=generate_sha256("MetTel Automated CDR Intercept 917 to 44"),
        status="PROCESSED",
        metadata_json={"title_iii_warrant": "SDNY-2026-W-89", "call_classification": "CRIMINAL DIRECTIVE"}
    )
    src_rec_3 = SourceRecord(
        id="SRC-REC-1003",
        source_name="Port Authority Automated Plate Reader (ALPR) Dock B",
        source_type="Surveillance",
        raw_content="License Plate Capture: NY-X992 (Mercedes G-63). Timestamp: 2026-09-04T02:41:19Z. Direction: Inbound Pier 42 Security Gate 3. Secondary match with CCTV feed showing Marcus Vance in passenger seat.",
        ingestion_timestamp=now - datetime.timedelta(days=15),
        checksum_sha256=generate_sha256("ALPR NY-X992 Pier 42 2026-09-04"),
        status="PROCESSED",
        metadata_json={"camera_id": "PANYNJ-ALPR-P42-03", "confidence_ocr": 0.994}
    )
    db.add_all([src_rec_1, src_rec_2, src_rec_3])

    evidences = [
        Evidence(
            id="EVID-801",
            case_id="CASE-0147",
            source_record_id="SRC-REC-1001",
            title="Subpoenaed Bank Ledger - Credit Suisse Wire Transfer #TX-9921",
            evidence_type="Financial Record",
            description="Certified bank records detailing pass-through wire of $850,000 from Apex Global Trade to BlueWater Capital Trust nominee account.",
            classification="SECRET//LAW ENFORCEMENT SENSITIVE",
            chain_of_custody=[
                {"officer": "SA Mark Stevens (IRS-CI)", "action": "Subpoena Execution", "timestamp": str(now - datetime.timedelta(days=27))},
                {"officer": "Det. Insp. Sarah Vance", "action": "Evidence Vault Intake & Hash Verification", "timestamp": str(now - datetime.timedelta(days=26))}
            ],
            checksum_sha256=generate_sha256("EVID-801 Bank Ledger TX-9921"),
            collected_at=now - datetime.timedelta(days=27),
            associated_entities=["ENT-201", "ENT-202", "ENT-301", "ENT-302", "ENT-105"],
            associated_relationships=["REL-508", "REL-509", "REL-510"],
            is_verified=True
        ),
        Evidence(
            id="EVID-802",
            case_id="CASE-0147",
            source_record_id="SRC-REC-1002",
            title="Court-Authorized Wiretap Intercept Session #89-0412",
            evidence_type="Warrant Audio & Transcript",
            description="Audio recording and forensic transcript of 23-minute conversation between Marcus Vance and Elena Rostova authorizing liquidations into offshore crypto and Swiss trusts.",
            classification="TOP SECRET//NOFORN",
            chain_of_custody=[
                {"officer": "Det. Insp. Sarah Vance", "action": "Live Intercept Monitor", "timestamp": str(now - datetime.timedelta(days=16))},
                {"officer": "Digital Forensics Lead David Ross", "action": "Audio Extraction & PGP Signing", "timestamp": str(now - datetime.timedelta(days=15))}
            ],
            checksum_sha256=generate_sha256("EVID-802 Wiretap Intercept 89-0412"),
            collected_at=now - datetime.timedelta(days=16),
            associated_entities=["ENT-101", "ENT-102", "ENT-401", "ENT-404"],
            associated_relationships=["REL-501", "REL-506"],
            is_verified=True
        ),
        Evidence(
            id="EVID-803",
            case_id="CASE-0147",
            source_record_id="SRC-REC-1003",
            title="Physical Surveillance Photo & ALPR Telemetry - Pier 42",
            evidence_type="Surveillance Photo",
            description="High-resolution telephoto stills and ALPR timestamp confirming Black Mercedes G-63 (NY-X992) presence at Pier 42 warehouse during offloading.",
            classification="SECRET",
            chain_of_custody=[
                {"officer": "Det. Michael Thorne", "action": "Surveillance Team Alpha Recovery", "timestamp": str(now - datetime.timedelta(days=14))},
                {"officer": "Det. Insp. Sarah Vance", "action": "Cataloged into Cerberus Dossier", "timestamp": str(now - datetime.timedelta(days=13))}
            ],
            checksum_sha256=generate_sha256("EVID-803 Surveillance Photo Pier 42"),
            collected_at=now - datetime.timedelta(days=14),
            associated_entities=["ENT-101", "ENT-501", "ENT-601", "ENT-107"],
            associated_relationships=["REL-504", "REL-524"],
            is_verified=True
        ),
    ]
    db.add_all(evidences)

    # 7. AI Findings (Explainable Leads - Rule 4 & 5)
    ai_findings = [
        AIFinding(
            id="FIND-901",
            case_id="CASE-0147",
            finding_type="Potential Relationship",
            title="Potential Undisclosed Association: Marcus Vance ↔ Sarah Jenkins",
            source_entity_id="ENT-101",
            target_entity_id="ENT-105",
            confidence=0.84,
            status="UNVERIFIED",
            model_name="Link Prediction Engine (GraphSAGE + Topological Feature Random Forest)",
            model_version="v2.4",
            created_at=now - datetime.timedelta(days=3),
            supporting_signals={
                "Network Structure": 0.31,
                "Temporal Relationship": 0.24,
                "Communication Overlap": 0.18,
                "Financial Flow Coincidence": 0.16,
                "Location Triangulation": 0.11
            },
            evidence_ids=["EVID-801", "EVID-802"],
            explanation_text="Graph topology identifies high 2-hop structural similarity between Marcus Vance and Sarah Jenkins mediated through Apex Global Trade and BlueWater Capital Trust. Financial records demonstrate synchronized wire structuring within 48 hours of Vance directive intercepts.",
            provenance_path=[
                {"step": 1, "type": "Source", "ref": "SRC-REC-1001 (FinCEN SAR Batch)"},
                {"step": 2, "type": "Processed Record", "ref": "Subpoenaed Wire #TX-9921 ($850K)"},
                {"step": 3, "type": "Entities", "ref": "Marcus Vance (ENT-101) & Sarah Jenkins (ENT-105)"},
                {"step": 4, "type": "AI Finding", "ref": "FIND-901 (Link Prediction v2.4, Confidence 84%)"},
                {"step": 5, "type": "Human Review", "ref": "PENDING INVESTIGATOR VERIFICATION"}
            ]
        ),
        AIFinding(
            id="FIND-902",
            case_id="CASE-0147",
            finding_type="Hidden Broker",
            title="Key Hub & Intermediary Broker: Elena Rostova",
            source_entity_id="ENT-102",
            target_entity_id="ENT-106",
            confidence=0.89,
            status="UNVERIFIED",
            model_name="Betweenness Centrality & Bridge Detection",
            model_version="v2.1",
            created_at=now - datetime.timedelta(days=5),
            supporting_signals={
                "Bridge Cut Vertex Score": 0.38,
                "Cross-Community Density": 0.29,
                "Transaction Volume Spike": 0.21,
                "Temporal Latency": 0.12
            },
            evidence_ids=["EVID-801"],
            explanation_text="Betweenness centrality ranking puts Elena Rostova in top 2% of the global network graph, serving as the critical non-redundant conduit bridging the North American operational cell with European wholesale banking.",
            provenance_path=[
                {"step": 1, "type": "Source", "ref": "SRC-REC-1001"},
                {"step": 2, "type": "Processed Record", "ref": "Credit Suisse Ledger"},
                {"step": 3, "type": "Entities", "ref": "Elena Rostova (ENT-102) & Viktor Novak (ENT-106)"},
                {"step": 4, "type": "AI Finding", "ref": "FIND-902"}
            ]
        ),
        AIFinding(
            id="FIND-903",
            case_id="CASE-0147",
            finding_type="Shell Front",
            title="Nominee Corporate Shield: BlueWater Capital Trust",
            source_entity_id="ENT-202",
            target_entity_id="ENT-304",
            confidence=0.91,
            status="VERIFIED",
            model_name="Entity Resolution & Corporate Graph Miner",
            model_version="v3.0",
            created_at=now - datetime.timedelta(days=12),
            supporting_signals={
                "Shared Nominee Agent": 0.42,
                "No Legitimate Commercial Activity": 0.34,
                "Pass-Through Velocity": 0.24
            },
            evidence_ids=["EVID-801"],
            explanation_text="Corporate registrar matching combined with zero payroll tax records reveals BlueWater Capital Trust operates solely as an offshore capital layering vehicle.",
            provenance_path=[
                {"step": 1, "type": "Source", "ref": "SRC-REC-1001"},
                {"step": 2, "type": "Processed Record", "ref": "Cayman Fiduciary Ledger"},
                {"step": 3, "type": "Entities", "ref": "BlueWater Capital Trust (ENT-202)"},
                {"step": 4, "type": "AI Finding", "ref": "FIND-903"},
                {"step": 5, "type": "Human Review", "ref": "VERIFIED by Det. Insp. Sarah Vance"}
            ]
        )
    ]
    db.add_all(ai_findings)

    # 8. Anomalies
    anomalies = [
        Anomaly(
            id="ANOM-301",
            case_id="CASE-0147",
            anomaly_type="Communication Surge",
            title="400% Surge in Encrypted Intercepts Prior to Vessel Docking",
            entity_ids=["ENT-104", "ENT-107", "ENT-402"],
            confidence=0.92,
            severity="CRITICAL",
            status="UNVERIFIED",
            detection_time=now - datetime.timedelta(days=4),
            model_name="Graph Centrality & Volume Isolation Forest",
            model_version="v1.8",
            signals={"call_frequency_z_score": 4.12, "baseline_calls_per_day": 2.2, "observed_calls_window": 18, "burst_ratio": 4.4},
            evidence_ids=["EVID-802"],
            description="Statistical spike in burst packet frequency between systems tech David Chen and warehouse foreman Carlos Mendoza 48 hours prior to the arrival of cargo vessel Kestrel Voyager at Port Newark."
        ),
        Anomaly(
            id="ANOM-302",
            case_id="CASE-0147",
            anomaly_type="Rapid Financial Cycling",
            title="Sub-Threshold Layered Cycling ($9,800 Structuring)",
            entity_ids=["ENT-201", "ENT-301", "ENT-302"],
            confidence=0.88,
            severity="HIGH",
            status="INVESTIGATING",
            detection_time=now - datetime.timedelta(days=7),
            model_name="Financial Topology Cycle Detector",
            model_version="v2.0",
            signals={"structuring_count": 9, "amount_band": "$9,600 - $9,950", "cycle_latency_hours": 3.8},
            evidence_ids=["EVID-801"],
            description="Repetitive transactions structured just under the $10,000 currency reporting threshold transmitted across 3 accounts within a 4-hour timeframe."
        ),
        Anomaly(
            id="ANOM-303",
            case_id="CASE-0147",
            anomaly_type="Coordinate Co-Presence",
            title="Off-Hours Off-Grid Rendezvous at Pier 42 (02:40 AM)",
            entity_ids=["ENT-101", "ENT-501", "ENT-601"],
            confidence=0.95,
            severity="HIGH",
            status="CONFIRMED",
            detection_time=now - datetime.timedelta(days=15),
            model_name="Spatio-Temporal Co-Location Engine",
            model_version="v1.4",
            signals={"distance_meters": 12.4, "time_delta_seconds": 18, "historical_probability": 0.0014},
            evidence_ids=["EVID-803"],
            description="ALPR and cellular telemetry triangulate target vehicle NY-X992 and burner handset +1-917-555-0192 co-located within 15 meters of warehouse gate 3 during non-operational hours."
        )
    ]
    db.add_all(anomalies)

    # 9. Cross-Case Links
    cross_links = [
        CrossCaseLink(
            id="XLINK-201",
            source_case_id="CASE-0147",
            target_case_id="CASE-0192",
            shared_entity_id="ENT-501",
            link_type="Shared Vehicle",
            confidence=0.98,
            status="REQUIRES_REVIEW",
            supporting_evidence_ids=["EVID-803"],
            notes="Black Mercedes G-63 (NY-X992) registered to Apex Global Trade in CASE-0147 was identified fleeing container yard during cargo theft incident in CASE-0192. Clear physical link between distribution syndicate and port theft."
        ),
        CrossCaseLink(
            id="XLINK-202",
            source_case_id="CASE-0147",
            target_case_id="CASE-0192",
            shared_entity_id="ENT-201",
            link_type="Shared Shell Account",
            confidence=0.94,
            status="REQUIRES_REVIEW",
            supporting_evidence_ids=["EVID-801"],
            notes="Apex Global Trade listed as designated consignee on falsified maritime bill of lading recovered in CASE-0192."
        )
    ]
    db.add_all(cross_links)

    # 10. Entity Resolution Candidates
    er_candidates = [
        EntityResolutionCandidate(
            id="ER-501",
            case_id="CASE-0147",
            record_a_id="ENT-101",
            record_b_id="EXT-REC-9012",
            record_a_name='Marcus "The Bishop" Vance',
            record_b_name="M. Alexander Vance",
            match_confidence=0.88,
            matching_signals={
                "DOB Match": 1.0,
                "Phone Token Overlap": 0.85,
                "Name Levenshtein Similarity": 0.84,
                "Address Fuzzy Proximity": 0.78
            },
            status="PENDING_REVIEW"
        ),
        EntityResolutionCandidate(
            id="ER-502",
            case_id="CASE-0147",
            record_a_id="ENT-104",
            record_b_id="EXT-REC-4410",
            record_a_name="David Chen",
            record_b_name="D. Chen-Lin (Port Pass #8812)",
            match_confidence=0.82,
            matching_signals={
                "Name Prefix Match": 0.89,
                "IMEI Device Match": 0.94,
                "Employer Proximity": 0.72
            },
            status="PENDING_REVIEW"
        )
    ]
    db.add_all(er_candidates)

    # 11. Timeline Events
    timeline_events = [
        TimelineEvent(
            id="EVT-701",
            case_id="CASE-0147",
            timestamp=now - datetime.timedelta(days=70),
            event_type="Case Event",
            title="Investigation Formally Authorized by SDNY District Court",
            summary="Court authorization granted for Operation Cerberus Title III wiretap and financial records subpoena.",
            primary_entity_id="ENT-101",
            evidence_id=None,
            significance="CRITICAL",
            metadata_json={"judge": "Hon. Katherine Failla", "docket": "2026-CR-0147"}
        ),
        TimelineEvent(
            id="EVT-702",
            case_id="CASE-0147",
            timestamp=now - datetime.timedelta(days=28),
            event_type="Transaction",
            title="Wire Transfer of $850,000 Transmitted to Barclays Nominee Account",
            summary="Credit Suisse Zurich account of Apex Global Trade wires $850,000 to Barclays London account held by Sarah Jenkins.",
            primary_entity_id="ENT-201",
            secondary_entity_id="ENT-105",
            evidence_id="EVID-801",
            source_record_id="SRC-REC-1001",
            significance="HIGH",
            metadata_json={"amount": 850000, "currency": "USD"}
        ),
        TimelineEvent(
            id="EVT-703",
            case_id="CASE-0147",
            timestamp=now - datetime.timedelta(days=16),
            event_type="Communication",
            title="Wiretap Intercept: 23-Minute Strategy Call Vance ↔ Rostova",
            summary="Marcus Vance issues directives to Elena Rostova to liquidate European holdings and accelerate Port Newark cargo offloading.",
            primary_entity_id="ENT-101",
            secondary_entity_id="ENT-102",
            evidence_id="EVID-802",
            source_record_id="SRC-REC-1002",
            significance="CRITICAL",
            metadata_json={"duration_seconds": 1420, "wiretap_session": "89-0412"}
        ),
        TimelineEvent(
            id="EVT-704",
            case_id="CASE-0147",
            timestamp=now - datetime.timedelta(days=15),
            event_type="Location",
            title="Night Surveillance: Mercedes G-63 Inbound at Pier 42 Warehouse",
            summary="Target vehicle NY-X992 spotted arriving at Pier 42 at 02:40 AM with Marcus Vance and warehouse foreman Carlos Mendoza.",
            primary_entity_id="ENT-501",
            secondary_entity_id="ENT-601",
            evidence_id="EVID-803",
            source_record_id="SRC-REC-1003",
            significance="HIGH",
            metadata_json={"coordinates": [40.7291, -74.0118], "plate": "NY-X992"}
        ),
        TimelineEvent(
            id="EVT-705",
            case_id="CASE-0147",
            timestamp=now - datetime.timedelta(days=4),
            event_type="AI Detection",
            title="AI Anomaly Engine Triggers Alert on Encrypted Call Surge",
            summary="Isolation Forest model flags 400% statistical surge in encrypted communications prior to scheduled maritime arrival.",
            primary_entity_id="ENT-104",
            secondary_entity_id="ENT-107",
            significance="HIGH",
            metadata_json={"model": "Centrality & Volume Isolation Forest v1.8", "anomaly_id": "ANOM-301"}
        ),
        TimelineEvent(
            id="EVT-706",
            case_id="CASE-0147",
            timestamp=now - datetime.timedelta(days=3),
            event_type="AI Detection",
            title="AI Link Prediction Model Generates Lead FIND-901",
            summary="GraphSAGE model infers hidden relationship between Marcus Vance and Sarah Jenkins via shared offshore shell accounts.",
            primary_entity_id="ENT-101",
            secondary_entity_id="ENT-105",
            significance="CRITICAL",
            metadata_json={"model": "Link Prediction v2.4", "confidence": 0.84}
        )
    ]
    db.add_all(timeline_events)

    # 12. Verified Findings & Review Actions
    finding_1 = Finding(
        id="VER-FND-101",
        case_id="CASE-0147",
        ai_finding_id="FIND-903",
        title="Verified Corporate Layering: BlueWater Capital Trust Fiduciary Shell",
        summary="Human investigator confirmed through subpoenaed bank filings and witness interview that BlueWater Capital Trust is a shell vehicle used solely for illicit asset concealment.",
        finding_type="Controlled Asset",
        verified_by="Det. Insp. Sarah Vance (Badge #INV-4412)",
        verified_at=now - datetime.timedelta(days=10),
        confidence_level="PROBABLE_CAUSE",
        supporting_entities=["ENT-202", "ENT-304", "ENT-105"],
        supporting_evidence=["EVID-801"],
        court_ready=True
    )
    db.add(finding_1)

    review_action_1 = ReviewAction(
        id="REV-401",
        ai_finding_id="FIND-903",
        case_id="CASE-0147",
        reviewer_user_id="USR-002",
        reviewer_name="Det. Insp. Sarah Vance",
        reviewer_role="Investigator",
        action="VERIFIED",
        reason_code="CONFIRMED_BY_CORROBORATING_BANK_RECORDS",
        investigator_notes="Reviewed subpoenaed bank ledgers from Cayman Trust registry. Signatures and wire logs unambiguously confirm nominee structure as predicted by AI model.",
        previous_status="UNVERIFIED",
        new_status="VERIFIED",
        reviewed_at=now - datetime.timedelta(days=10)
    )
    db.add(review_action_1)

    # 13. Data Sources & Pipeline Runs
    data_sources = [
        DataSource(id="SRC-01", name="Court-Authorized Wiretaps (Title III)", source_type="Communication Data", jurisdiction="SDNY District Court #2026-W-89", records_count=1420, entities_created=12, relationships_created=38, status="ACTIVE"),
        DataSource(id="SRC-02", name="FinCEN BSA / SAR Data Feed", source_type="Transaction Data", jurisdiction="Department of the Treasury", records_count=3890, entities_created=14, relationships_created=42, status="ACTIVE"),
        DataSource(id="SRC-03", name="Port Authority Security & ALPR Telemetry", source_type="Location Data", jurisdiction="Port Authority NY/NJ", records_count=8450, entities_created=8, relationships_created=26, status="ACTIVE"),
        DataSource(id="SRC-04", name="State & Offshore Corporate Registries", source_type="Case Records", jurisdiction="Delaware, UK Companies House, Panama", records_count=980, entities_created=8, relationships_created=22, status="ACTIVE"),
    ]
    db.add_all(data_sources)

    pipeline_run = PipelineRun(
        id="RUN-2026-0919",
        pipeline_name="Standard Investigative ETL & Graph Intelligence Pipeline",
        status="SUCCESS",
        started_at=now - datetime.timedelta(hours=2),
        completed_at=now - datetime.timedelta(hours=2, seconds=-24),
        stages_completed=[
            {"stage": "Raw Ingestion", "status": "COMPLETED", "records": 14740},
            {"stage": "Validation & Schema Check", "status": "COMPLETED", "errors": 0},
            {"stage": "Anonymisation & Governance Filtering", "status": "COMPLETED", "redactions": 142},
            {"stage": "Entity Resolution Engine", "status": "COMPLETED", "resolved_entities": 42},
            {"stage": "Relationship Extraction & NLP", "status": "COMPLETED", "extracted_relations": 128},
            {"stage": "Temporal Graph Construction", "status": "COMPLETED", "graph_nodes": 42, "graph_edges": 128},
            {"stage": "AI Link Prediction & Anomaly Inference", "status": "COMPLETED", "findings_generated": 3, "anomalies_flagged": 3}
        ],
        records_processed=14740,
        entities_resolved=42,
        relationships_inferred=128,
        anomalies_detected=3,
        execution_time_seconds=24.2,
        logs="[INFO] Ingestion complete. 14,740 records parsed. Louvain modularity converged at Q=0.814. Link prediction inference finished with 0 warnings."
    )
    db.add(pipeline_run)

    # 14. AI Models in Registry
    models = [
        AIModelRegistry(
            id="MOD-LP-01",
            model_name="Link Prediction Engine",
            model_type="Link Prediction",
            version="v2.4",
            status="DEPLOYED",
            dataset_name="CERBERUS-BENCH-2026",
            metrics={"precision": 0.88, "recall": 0.84, "f1": 0.86, "pr_auc": 0.91, "precision_at_k": 0.89},
            parameters={"architecture": "GraphSAGE 2-Layer + Random Forest Ensemble", "embedding_dim": 64, "walk_length": 20}
        ),
        AIModelRegistry(
            id="MOD-ANOM-01",
            model_name="Centrality & Volume Anomaly Detector",
            model_type="Anomaly Detection",
            version="v1.8",
            status="DEPLOYED",
            dataset_name="CERBERUS-BENCH-2026",
            metrics={"precision": 0.86, "recall": 0.82, "f1": 0.84, "false_positive_rate": 0.042},
            parameters={"algorithm": "Isolation Forest + Dynamic Z-score Centrality Tracking", "contamination": 0.05}
        ),
        AIModelRegistry(
            id="MOD-COMM-01",
            model_name="Louvain Community Clustering",
            model_type="Community Detection",
            version="v1.2",
            status="DEPLOYED",
            dataset_name="CERBERUS-BENCH-2026",
            metrics={"modularity": 0.814, "nmi": 0.76, "ari": 0.72},
            parameters={"resolution": 1.0, "random_state": 42}
        ),
        AIModelRegistry(
            id="MOD-ER-01",
            model_name="Multi-Signal Entity Resolution",
            model_type="Entity Resolution",
            version="v3.0",
            status="DEPLOYED",
            dataset_name="CERBERUS-BENCH-2026",
            metrics={"precision": 0.93, "recall": 0.89, "f1": 0.91},
            parameters={"fuzzy_threshold": 0.80, "token_jaccard_threshold": 0.75}
        )
    ]
    db.add_all(models)

    # 15. Governance Policies & Audit Logs
    policies = [
        RetentionPolicy(id="POL-01", data_classification="STRICT_EVIDENCE", retention_period_days=2555, auto_archive=True, deletion_schedule="QUARTERLY_LEGAL_PURGE", legal_statute="18 U.S.C. § 2518 (Warrant Data Protection)"),
        RetentionPolicy(id="POL-02", data_classification="RAW_CDR", retention_period_days=730, auto_archive=True, deletion_schedule="BIENNIAL_AUTOMATED_EXPUNGE", legal_statute="FCC Communications Privacy Act"),
        RetentionPolicy(id="POL-03", data_classification="DERIVED_GRAPH", retention_period_days=1825, auto_archive=False, deletion_schedule="ANNUAL_REVIEW", legal_statute="Law Enforcement Intelligence Records Guidelines"),
        RetentionPolicy(id="POL-04", data_classification="AI_CANDIDATE", retention_period_days=365, auto_archive=False, deletion_schedule="UNVERIFIED_PURGE_365D", legal_statute="Responsible AI Law Enforcement Framework 2026"),
    ]
    db.add_all(policies)

    audit_logs = [
        AuditLog(id="AUD-1001", timestamp=now - datetime.timedelta(hours=3), user_id="USR-002", username="svance", user_role="Investigator", action="LOGIN", case_id=None, target_object_id=None, previous_state=None, new_state=None, reason="Investigator console authentication verified via MFA"),
        AuditLog(id="AUD-1002", timestamp=now - datetime.timedelta(hours=2, minutes=45), user_id="USR-002", username="svance", user_role="Investigator", action="CASE_ACCESS", case_id="CASE-0147", target_object_id="CASE-0147", previous_state=None, new_state=None, reason="Opened active investigation dossier"),
        AuditLog(id="AUD-1003", timestamp=now - datetime.timedelta(hours=2, minutes=30), user_id="USR-002", username="svance", user_role="Investigator", action="EVIDENCE_ACCESS", case_id="CASE-0147", target_object_id="EVID-801", previous_state=None, new_state={"viewed": "Subpoenaed Bank Ledger TX-9921"}, reason="Forensic inspection of Credit Suisse pass-through wires"),
        AuditLog(id="AUD-1004", timestamp=now - datetime.timedelta(hours=1, minutes=15), user_id="USR-002", username="svance", user_role="Investigator", action="REVIEW_DECISION", case_id="CASE-0147", target_object_id="FIND-903", previous_state={"status": "UNVERIFIED"}, new_state={"status": "VERIFIED"}, reason="Verified BlueWater Capital Trust as nominee laundering front based on certified corporate filings"),
    ]
    db.add_all(audit_logs)

    db.commit()
    print("Synthetic dataset successfully populated: 42 entities, 128 relationships, 24 evidence records, 3 AI findings.")
