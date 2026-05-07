from __future__ import annotations

import io
import os
import uuid
import base64
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


def delete_from_cloudinary(url: str):
    """
    Attempts to delete an image from Cloudinary based on its URL.
    Example URL: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.jpg
    """
    if not url or "cloudinary.com" not in url:
        return

    try:
        # Extract folder and public_id from URL
        # Parts will be: [..., 'upload', 'v123', 'folder', 'subfolder', 'public_id.jpg']
        parts = url.split("/")
        # Find the 'upload' part
        try:
            upload_idx = parts.index("upload")
            # The public_id starts after the version tag (e.g., 'v123')
            # But sometimes version tag is missing. version tag usually starts with 'v' followed by digits.
            version_idx = upload_idx + 1
            if parts[version_idx].startswith("v") and parts[version_idx][1:].isdigit():
                start_idx = version_idx + 1
            else:
                start_idx = version_idx
            
            # Join remaining parts and strip extension
            public_id_with_ext = "/".join(parts[start_idx:])
            public_id = os.path.splitext(public_id_with_ext)[0]
            
            print(f"🗑️ Deleting from Cloudinary: {public_id}")
            cloudinary.uploader.destroy(public_id)
        except (ValueError, IndexError):
            print(f"⚠️ Could not parse public_id from URL: {url}")
    except Exception as e:
        print(f"❌ Failed to delete from Cloudinary: {e}")


def image_to_base64(image_np: np.ndarray) -> str:
    """Converts a numpy image array to a Base64 data URL."""
    image = Image.fromarray(image_np.astype("uint8"))
    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=85)
    base64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{base64_str}"

def bytes_to_base64(image_bytes: bytes) -> str:
    """Converts image bytes to a Base64 data URL."""
    base64_str = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/jpeg;base64,{base64_str}"
