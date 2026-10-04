import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.api import api_router
from backend.app.seed.seed_demo_data import seed_initial_demo_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure all DB tables exist
    Base.metadata.create_all(bind=engine)
    # Automatically seed rich demo data if empty
    db = SessionLocal()
    try:
        seed_initial_demo_data(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title="ARTHRAKSHA - Financial Scam & Fraud Resilience Platform",
    description="Detect. Explain. Warn. Protect. AI-powered fraud resilience platform developed for Hackathon SANGYAN Track A.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL,
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for smooth local development & hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[ARTHRAKSHA SERVER ERROR] {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal service error occurred. Operation logged safely."}
    )

# Include core API router under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "ARTHRAKSHA",
        "tagline": "Detect. Explain. Warn. Protect.",
        "track": "SANGYAN Track A — Digital Fraud & Scam Resilience",
        "status": "ONLINE",
        "docs": "/docs",
        "demo_mode": settings.DEMO_MODE
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "database": "CONNECTED"}
