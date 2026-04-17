from __future__ import annotations

import json
import os
import uuid
import io
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, File

from auth import create_access_token, get_current_user, get_optional_user, hash_password, verify_password
from database import ScanHistory, User, create_tables, get_db
from gradcam import CLASS_DETAILS, CLASS_NAMES, load_model, load_scales, run_inference
from storage import STATIC_DIR, ensure_storage_dirs, save_array_image, save_upload


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "best_final.keras"))
SCALES_PATH = os.getenv("SCALES_PATH", str(BASE_DIR / "class_scales.json"))
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "12"))

app = FastAPI(title="Derm AI", version="1.0.0")

origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,https://localhost:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ensure_storage_dirs()
create_tables()
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

model = None
device = "cpu"
demo_mode = True

def get_model():
    global model, device, demo_mode
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Model not found")
        return None, "cpu", True
    if model is None:
        try:
            model, device, demo_mode = load_model(MODEL_PATH)
        except Exception as e:
            print("⚠️ Model loading failed, switching to demo mode:", e)
            model = None
            device = "cpu"
            demo_mode = True
    return model, device, demo_mode
class_scales = load_scales(SCALES_PATH)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_mode": "demo" if demo_mode else "trained",
        "device": str(device),
        "classes": {name: CLASS_DETAILS[name]["name"] for name in CLASS_NAMES},
    }


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists.")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists.")

    user = User(username=payload.username, email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Account created successfully."}


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password.")

    return {
        "access_token": create_access_token(user.username),
        "token_type": "bearer",
        "user": {"username": user.username, "email": user.email},
    }


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    return {"username": current_user.username, "email": current_user.email}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()

        print("✅ File received")

        model, device, demo_mode = get_model()
        print("✅ Model loaded:", model is not None)

        if model is None:
            return {"error": "Model not loaded", "demo": True}

        inference = run_inference(
            model, device, image_bytes, class_scales, demo_mode
        )

        print("✅ Inference done")

        return inference

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return {"error": str(e)}

@app.get("/history")
def history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    scans = (
        db.query(ScanHistory)
        .filter(ScanHistory.user_id == current_user.id)
        .order_by(ScanHistory.created_at.desc())
        .all()
    )

    return [
        {
            "id": scan.id,
            "prediction": scan.prediction,
            "prediction_name": scan.prediction_name,
            "confidence": scan.confidence,
            "risk": scan.risk,
            "risk_level": scan.risk_level,
            "top3": json.loads(scan.top3),
            "original_url": scan.original_url,
            "heatmap_url": scan.heatmap_url,
            "explanation": json.loads(scan.explanation),
            "created_at": scan.created_at.isoformat(),
        }
        for scan in scans
    ]
