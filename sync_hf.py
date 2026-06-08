from huggingface_hub import HfApi
import os
import sys

token = os.environ.get("HF_TOKEN")
if not token:
    print("Error: Set the HF_TOKEN environment variable with your Hugging Face token.")
    print("Example (PowerShell): $env:HF_TOKEN = 'your_token_here'")
    sys.exit(1)

try:
    api = HfApi(token=token)
    print("Uploading Backend folder to Hugging Face Spaces...")

    api.upload_folder(
        folder_path="Backend",
        repo_id="ganirathod/dermai-backend",
        repo_type="space",
        ignore_patterns=["venv/*", "__pycache__/*", "*.pt", "*.keras", ".env", "venv/**", "__pycache__/**"],
    )
    print("Upload complete! Hugging Face is now rebuilding your space.")
except Exception as e:
    print(f"Error uploading to Hugging Face: {e}")
    sys.exit(1)
