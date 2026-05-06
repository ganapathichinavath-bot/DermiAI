from __future__ import annotations

import io
import os
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader
import numpy as np
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

BASE_DIR = Path(__file__).resolve().parent

def _upload_to_cloudinary(image_bytes: bytes, folder: str, filename: str) -> str:
    """Uploads an image to Cloudinary and returns the secure URL."""
    try:
        response = cloudinary.uploader.upload(
            image_bytes,
            folder=folder,
            public_id=filename,
            overwrite=True,
            resource_type="image"
        )
        return response.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise


def save_upload(image_bytes: bytes, filename: str | None = None) -> tuple[str, str]:
    """Saves original uploaded image to Cloudinary dermai/uploads/."""
    safe_name = filename or f"{uuid.uuid4().hex}"
    stem = Path(safe_name).stem
    
    # Compress/convert to JPEG for consistency before upload
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=95)
    processed_bytes = buf.getvalue()

    url = _upload_to_cloudinary(processed_bytes, "dermai/uploads", stem)
    # We return stem as the "path" equivalent, and url as public_url
    return stem, url


def save_array_image(image_np: np.ndarray, stem: str, folder: str = "outputs") -> tuple[str, str]:
    """
    Saves a generated heatmap or saliency map.
    Maps local "outputs" or "saliency" folder names to Cloudinary folders.
    """
    if folder == "saliency":
        cloud_folder = "dermai/saliency"
    else:
        cloud_folder = "dermai/heatmaps"

    image = Image.fromarray(image_np.astype("uint8"))
    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=95)
    image_bytes = buf.getvalue()

    url = _upload_to_cloudinary(image_bytes, cloud_folder, stem)
    return stem, url
