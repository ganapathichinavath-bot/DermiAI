"""
download_model.py
-----------------
Downloads the trained Keras model from Hugging Face if it is missing.
Uses HF_MODEL_REPO from environment variables.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

HF_REPO = os.getenv("HF_MODEL_REPO", "dermai/dermai-model")
FILENAME = "best_final.keras"
BASE_DIR = Path(__file__).resolve().parent

# Default to /tmp/best_final.keras if MODEL_PATH is set to that in .env
_env_path = os.getenv("MODEL_PATH")
if _env_path:
    DEFAULT_DEST = Path(_env_path) if os.path.isabs(_env_path) else BASE_DIR / _env_path
else:
    DEFAULT_DEST = BASE_DIR / "models" / FILENAME


def download_model(dest: Path | None = None) -> Path:
    """Download the model from Hugging Face if it is not already present.

    Args:
        dest: Destination path. Defaults to value from .env or models/best_final.keras.

    Returns:
        The path to the model file.
    """
    target = Path(dest) if dest else DEFAULT_DEST
    target.parent.mkdir(parents=True, exist_ok=True)

    if target.exists() and target.stat().st_size > 1_000_000:
        print(f"✅ Model already present at {target} — skipping download.")
        return target

    print(f"⬇️  Downloading model from Hugging Face ({HF_REPO}) …")

    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("❌ huggingface-hub not installed. Run: pip install huggingface-hub")
        sys.exit(1)

    try:
        downloaded_path = hf_hub_download(
            repo_id=HF_REPO,
            filename=FILENAME,
            local_dir=target.parent,
            local_dir_use_symlinks=False
        )
        
        # Ensure it's named exactly what we want if different
        if Path(downloaded_path).absolute() != target.absolute():
            if target.exists():
                target.unlink()
            os.rename(downloaded_path, target)
            
        print(f"✅ Model saved to {target} ({target.stat().st_size / 1e6:.1f} MB)")
        return target
    except Exception as e:
        print(f"❌ Download failed: {e}")
        raise


if __name__ == "__main__":
    dest_arg = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    download_model(dest_arg)
