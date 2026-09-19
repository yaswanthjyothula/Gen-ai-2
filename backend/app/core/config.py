import os

def _load_env_file():
    env_paths = [
        os.path.join(os.path.dirname(__file__), "../../../.env"),
        os.path.join(os.path.dirname(__file__), "../../.env"),
        os.path.join(os.getcwd(), ".env"),
        ".env"
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            key_clean = k.strip()
                            if key_clean and key_clean not in os.environ:
                                os.environ[key_clean] = v.strip().strip("\"'")
                break
            except Exception:
                pass

_load_env_file()

class Settings:
    PROJECT_NAME: str = "CRIMENET-X"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Security
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "crimenet-x-secret-key-enterprise-defense-grade-32bytes")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8 # 8 hours
    
    # Database (Dual mode: SQLite default local fallback / PostgreSQL when env specified)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./crimenet_x.db")
    
    # Neo4j Optional Integration
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "investigation_secure_pass")
    
    # Default Investigation Context
    ACTIVE_INVESTIGATION_ID: str = "INV-2026-0147"
    ACTIVE_CASE_ID: str = "CASE-0147"
    
    # Google Gemini AI Brain Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    GEMINI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models"

settings = Settings()
