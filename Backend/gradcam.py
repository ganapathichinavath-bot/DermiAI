from __future__ import annotations

import io
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
CLASS_DETAILS = {
    "akiec": {"name": "Actinic keratoses", "risk_level": "Moderate", "risk_label": "Precancerous"},
    "bcc": {"name": "Basal cell carcinoma", "risk_level": "High", "risk_label": "Malignant"},
    "bkl": {"name": "Benign keratosis", "risk_level": "Low", "risk_label": "Benign"},
    "df": {"name": "Dermatofibroma", "risk_level": "Low", "risk_label": "Benign"},
    "mel": {"name": "Melanoma", "risk_level": "High", "risk_label": "Malignant"},
    "nv": {"name": "Melanocytic nevus", "risk_level": "Low", "risk_label": "Benign"},
    "vasc": {"name": "Vascular lesion", "risk_level": "Moderate", "risk_label": "Usually benign"},
}
IMG_SIZE = 224


def load_scales(scales_path: str | Path | None = None) -> np.ndarray:
    default_scales = {
        "akiec": 1.0,
        "bcc": 1.05,
        "bkl": 1.0,
        "df": 0.95,
        "mel": 1.05,
        "nv": 1.0,
        "vasc": 0.95,
    }

    if scales_path:
        path = Path(scales_path)
        if path.exists():
            with path.open("r", encoding="utf-8") as file:
                default_scales.update(json.load(file))

    return np.array([default_scales[name] for name in CLASS_NAMES], dtype=np.float32)


def _find_last_conv_layer(model) -> str:
    try:
        import keras
    except ImportError as exc:
        raise RuntimeError("Keras is required to load the Keras checkpoint.") from exc

    last_conv_name = None
    for layer in model.layers:
        if isinstance(layer, keras.layers.Conv2D):
            last_conv_name = layer.name
        elif hasattr(layer, "layers"):
            for nested_layer in layer.layers:
                if isinstance(nested_layer, keras.layers.Conv2D):
                    last_conv_name = nested_layer.name

    if last_conv_name is None:
        raise RuntimeError("Could not locate a convolutional layer for Grad-CAM.")
    return last_conv_name


def load_model(model_path: str | Path | None = None) -> tuple[dict, str | None, bool]:
    resolved_path = Path(model_path) if model_path else Path(__file__).resolve().parent / "best_final.keras"
    if not resolved_path.exists():
        raise FileNotFoundError(
            f"Model file not found at {resolved_path}. Place your trained Keras model there or set MODEL_PATH."
        )

    if resolved_path.suffix.lower() not in {".keras", ".h5"}:
        raise RuntimeError(
            f"Unsupported model format: {resolved_path.name}. This backend is currently configured for your Keras checkpoint."
        )

    try:
        import keras
    except ImportError as exc:
        raise RuntimeError(
            "Keras/TensorFlow is not installed correctly. Run `pip install tensorflow keras` in Backend first."
        ) from exc

    try:
        model = keras.models.load_model(resolved_path, compile=False)
        print("✅ Keras model loaded successfully")
    except Exception as e:
        print("❌ Keras loading error:", e)
        raise
    model.trainable = False
    last_conv_name = _find_last_conv_layer(model)

    bundle = {
        "backend": "keras",
        "model": model,
        "last_conv_name": last_conv_name,
        "path": str(resolved_path),
    }
    return bundle, None, False


def preprocess_image(image_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    original_np = np.array(image)
    resized = np.array(image.resize((IMG_SIZE, IMG_SIZE)), dtype=np.float32)
    return original_np, resized


def overlay_heatmap(original_np: np.ndarray, cam: np.ndarray) -> np.ndarray:
    height, width = original_np.shape[:2]
    resized_cam = cv2.resize(cam, (width, height))
    colored = cv2.applyColorMap(np.uint8(resized_cam * 255), cv2.COLORMAP_JET)
    colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
    return np.clip((0.45 * colored) + (0.55 * original_np), 0, 255).astype("uint8")


def build_explanation(prediction: str, top3: list[dict], cam: np.ndarray) -> list[str]:
    detail = CLASS_DETAILS[prediction]
    focus_ratio = float((cam > 0.55).mean() * 100)
    hotspot = np.unravel_index(np.argmax(cam), cam.shape)
    vertical = "upper" if hotspot[0] < cam.shape[0] / 3 else "central" if hotspot[0] < cam.shape[0] * 2 / 3 else "lower"
    horizontal = "left" if hotspot[1] < cam.shape[1] / 3 else "central" if hotspot[1] < cam.shape[1] * 2 / 3 else "right"

    second_choice = top3[1]["name"] if len(top3) > 1 else "another class"
    third_choice = top3[2]["name"] if len(top3) > 2 else "a lower-ranked class"

    return [
        f"The trained model ranked {detail['name']} highest from the lesion image features it learned during training.",
        f"Grad-CAM focused about {focus_ratio:.1f}% of its strongest attention in the {vertical}-{horizontal} part of the lesion.",
        f"The next alternatives were {second_choice} and {third_choice}, which helps show where the model still sees overlap.",
        f"This class is treated as {detail['risk_label'].lower()} in the app, so the output should support clinical follow-up rather than replace it.",
    ]


def _predict_keras(model, resized_np: np.ndarray, class_scales: np.ndarray) -> tuple[np.ndarray, int]:
    img_array = np.expand_dims(resized_np, axis=0)
    raw_probs = model.predict(img_array, verbose=0)[0].astype(np.float32)
    scaled_probs = raw_probs * class_scales
    scaled_probs = scaled_probs / max(scaled_probs.sum(), 1e-8)
    prediction_index = int(np.argmax(scaled_probs))
    return scaled_probs, prediction_index


def _generate_gradcam_keras(model, resized_np: np.ndarray, prediction_index: int, last_conv_name: str) -> np.ndarray:
    import tensorflow as tf
    import keras

    img_tensor = tf.convert_to_tensor(np.expand_dims(resized_np, axis=0), dtype=tf.float32)
    grad_model = keras.models.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(last_conv_name).output, model.output],
    )

    with tf.GradientTape() as tape:
        conv_output, predictions = grad_model(img_tensor)
        class_score = predictions[:, prediction_index]

    gradients = tape.gradient(class_score, conv_output)
    pooled_gradients = tf.reduce_mean(gradients, axis=(0, 1, 2))
    conv_output = conv_output[0]
    cam = tf.reduce_sum(conv_output * pooled_gradients, axis=-1)
    cam = tf.nn.relu(cam).numpy()
    cam -= cam.min()
    cam /= cam.max() + 1e-8
    return cam


def run_inference(
    model_bundle: dict,
    _device,
    image_bytes: bytes,
    class_scales: np.ndarray,
    _demo_mode: bool,
) -> dict:
    if model_bundle["backend"] != "keras":
        raise RuntimeError("Only Keras-backed inference is supported by the currently configured trained model.")

    model = model_bundle["model"]
    original_np, resized_np = preprocess_image(image_bytes)
    probabilities, prediction_index = _predict_keras(model, resized_np, class_scales)
    prediction_code = CLASS_NAMES[prediction_index]
    prediction_detail = CLASS_DETAILS[prediction_code]

    cam = _generate_gradcam_keras(model, resized_np, prediction_index, model_bundle["last_conv_name"])
    heatmap_np = overlay_heatmap(original_np, cam)

    top_indices = np.argsort(probabilities)[::-1][:3].tolist()
    top3 = [
        {
            "class": CLASS_NAMES[index],
            "name": CLASS_DETAILS[CLASS_NAMES[index]]["name"],
            "confidence": round(float(probabilities[index] * 100), 2),
        }
        for index in top_indices
    ]

    return {
        "prediction": prediction_code,
        "prediction_name": prediction_detail["name"],
        "confidence": round(float(probabilities[prediction_index] * 100), 2),
        "risk": prediction_detail["risk_label"],
        "risk_level": prediction_detail["risk_level"],
        "top3": top3,
        "explanation": build_explanation(prediction_code, top3, cam),
        "original_np": original_np,
        "heatmap_np": heatmap_np,
        "model_mode": "trained",
    }
