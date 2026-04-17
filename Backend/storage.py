from __future__ import annotations

import io
import uuid
from pathlib import Path

import numpy as np
from PIL import Image


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
OUTPUTS_DIR = STATIC_DIR / "outputs"
MODELS_DIR = BASE_DIR / "models"


def ensure_storage_dirs() -> None:
    for directory in (STATIC_DIR, UPLOADS_DIR, OUTPUTS_DIR, MODELS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def _public_url(path: Path) -> str:
    relative = path.relative_to(STATIC_DIR).as_posix()
    return f"/static/{relative}"


def save_upload(image_bytes: bytes, filename: str | None = None) -> tuple[Path, str]:
    ensure_storage_dirs()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    safe_name = filename or f"{uuid.uuid4().hex}.jpg"
    if not safe_name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        safe_name = f"{Path(safe_name).stem}.jpg"

    output_path = UPLOADS_DIR / f"{Path(safe_name).stem}.jpg"
    image.save(output_path, format="JPEG", quality=95)
    return output_path, _public_url(output_path)


def save_array_image(image_np: np.ndarray, stem: str, folder: str = "outputs") -> tuple[Path, str]:
    ensure_storage_dirs()
    target_dir = OUTPUTS_DIR if folder == "outputs" else STATIC_DIR / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    output_path = target_dir / f"{stem}.jpg"
    image = Image.fromarray(image_np.astype("uint8"))
    image.save(output_path, format="JPEG", quality=95)
    return output_path, _public_url(output_path)
