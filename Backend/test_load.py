import traceback
import sys
import os
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

# Set base directory and load env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

sys.path.append(str(BASE_DIR))

try:
    from gradcam import load_model, run_inference, load_scales
    
    # Get model path from env or default
    model_path = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "best_final.keras"))
    scales_path = os.getenv("SCALES_PATH", str(BASE_DIR / "class_scales.json"))
    
    print(f"📂 Model Path: {model_path}")
    print(f"📂 Scales Path: {scales_path}")
    
    print("⏳ Loading model (this may trigger a download if missing)...")
    model, device, demo_mode = load_model(model_path)
    print("✅ Model loaded successfully!")
    
    # Load scales
    class_scales = load_scales(scales_path)
    print("✅ Scales loaded.")
    
    # Try a dummy inference
    print("🖼️ Creating dummy image...")
    from PIL import Image
    import io
    img = Image.new("RGB", (224, 224), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()
    
    print("🚀 Running inference...")
    result = run_inference(model, device, image_bytes, class_scales, demo_mode)
    print(f"🎉 Inference successful! Result: {result['prediction']} ({result['confidence']}%)")
    
except Exception as e:
    print("\n❌ ERROR OCCURRED:")
    traceback.print_exc()
