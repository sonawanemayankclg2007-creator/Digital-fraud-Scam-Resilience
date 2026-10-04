import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

# Attempt primary DATABASE_URL; fallback cleanly to sqlite if MySQL connection fails
db_url = settings.DATABASE_URL

def get_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)

try:
    engine = get_engine(db_url)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    # Graceful fallback to SQLite for local ease and zero crashing
    fallback_url = "sqlite:///./arthraksha.db"
    print(f"[ARTHRAKSHA DB] Notice: Falling back to SQLite ({fallback_url}) due to: {e}")
    engine = get_engine(fallback_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
