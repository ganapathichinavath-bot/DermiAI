from __future__ import annotations

import json
import os
from pathlib import Path

import gdown
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import ScanHistory, User, create_tables, get_db
from gradcam import CLASS_DETAILS, CLASS_NAMES, load_model, load_scales, run_inference
from storage import STATIC_DIR, ensure_storage_dirs

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = str(BASE_DIR / "best_final.keras")

# 🔥 FIXED DOWNLOAD URL
MODEL_URL = "https://drive.google.com/uc?export=download&id=1dxjm9Z-PLKv5iFplcyuJ_sPHN9z2kelz"

SCALES_PATH = str(BASE_DIR / "class_scales.json")

app = FastAPI(title="Derm AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# 🔥 SAFE DOWNLOAD
def download_model():
    if not os.path.exists(MODEL_PATH):
        print("⬇️ Downloading model...")
        gdown.download(MODEL_URL, MODEL_PATH, quiet=False, fuzzy=True)

        size = os.path.getsize(MODEL_PATH)
        print(f"📦 Model size: {size/(1024*1024):.2f} MB")

        if size < 5 * 1024 * 1024:
            raise RuntimeError("Downloaded file is invalid (too small)")

        print("✅ Model downloaded")

def get_model():
    global model, device, demo_mode

    if model is None:
        try:
            download_model()
            model, device, demo_mode = load_model(MODEL_PATH)
            print("✅ Model loaded successfully")
        except Exception as e:
            print("❌ Model loading failed:", e)
            model = None

    return model, device, demo_mode

class_scales = load_scales(SCALES_PATH)

# ================= AUTH =================

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(409, "Username exists")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    return {"message": "Account created"}

@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    return {"access_token": create_access_token(user.username)}

# ================= PREDICT =================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()

        model, device, demo_mode = get_model()

        if model is None:
            return {"error": "Model failed to load"}

        result = run_inference(
            model, device, image_bytes, class_scales, demo_mode
        )

        return result

    except Exception as e:
        print("🔥 ERROR:", e)
        return {"error": str(e)}

# ================= HISTORY =================

@app.get("/history")
def history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).all()

    return [
        {
            "id": s.id,
            "prediction": s.prediction,
            "confidence": s.confidence,
            "created_at": s.created_at.isoformat(),
        }
        for s in scans
    ]