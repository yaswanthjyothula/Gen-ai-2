import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.services.synthetic_data_generator import seed_database

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.entities import router as entities_router
from app.api.v1.relationships import router as relationships_router
from app.api.v1.network import router as network_router
from app.api.v1.intelligence import router as intelligence_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.timeline import router as timeline_router
from app.api.v1.operations import router as operations_router
from app.api.v1.data_pipeline import router as data_pipeline_router
from app.api.v1.governance import router as governance_router
from app.api.v1.models_eval import router as models_eval_router
from app.api.v1.search import router as search_router
from app.api.v1.case_brain import router as case_brain_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed synthetic data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI Criminal Network Intelligence Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(investigations_router, prefix=api_prefix)
app.include_router(entities_router, prefix=api_prefix)
app.include_router(relationships_router, prefix=api_prefix)
app.include_router(network_router, prefix=api_prefix)
app.include_router(intelligence_router, prefix=api_prefix)
app.include_router(reviews_router, prefix=api_prefix)
app.include_router(evidence_router, prefix=api_prefix)
app.include_router(timeline_router, prefix=api_prefix)
app.include_router(operations_router, prefix=api_prefix)
app.include_router(data_pipeline_router, prefix=api_prefix)
app.include_router(governance_router, prefix=api_prefix)
app.include_router(models_eval_router, prefix=api_prefix)
app.include_router(search_router, prefix=api_prefix)
app.include_router(case_brain_router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
