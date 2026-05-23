from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to sqlite if no DB url provided for local testing
if not DATABASE_URL:
    BASE_DIR = Path(__file__).resolve().parent
    DATABASE_URL = f"sqlite:///{(BASE_DIR / 'skin_diagnosis.db').as_posix()}"

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    first_login = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    scans = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    original_url = Column(String(255), nullable=False)
    heatmap_url = Column(String(255), nullable=False)
    saliency_url = Column(String(255), nullable=True)
    prediction = Column(String(32), nullable=False)
    prediction_name = Column(String(128), nullable=False)
    confidence = Column(Float, nullable=False)
    risk = Column(String(32), nullable=False)
    risk_level = Column(String(32), nullable=False)
    top3 = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="scans")


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables verified/created successfully.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"⚠️ DATABASE ERROR ON STARTUP: {e}")
        print("⚠️ Application will start, but database connection is currently offline. Please ensure Supabase project is unpaused/active.")
