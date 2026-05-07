from __future__ import annotations

import io
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
from huggingface_hub import hf_hub_download
import os

CLASS_NAMES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
CLASS_DETAILS = {
    "akiec": {"name": "Actinic keratoses", "risk_severity": "Moderate", "risk_label": "Precancerous"},
    "bcc": {"name": "Basal cell carcinoma", "risk_severity": "High", "risk_label": "Malignant"},
    "bkl": {"name": "Benign keratosis", "risk_severity": "Low", "risk_label": "Benign"},
    "df": {"name": "Dermatofibroma", "risk_severity": "Low", "risk_label": "Benign"},
    "mel": {"name": "Melanoma", "risk_severity": "High", "risk_label": "Malignant"},
    "nv": {"name": "Melanocytic nevus", "risk_severity": "Low", "risk_label": "Benign"},
    "vasc": {"name": "Vascular lesion", "risk_severity": "Moderate", "risk_label": "Usually benign"},
}
IMG_SIZE = 224

def load_scales(scales_path: str | Path | None = None) -> np.ndarray:
    default_scales = {
        "akiec": 0.6,
        "bcc": 0.9,
        "bkl": 1.0,
        "df": 0.4,
        "mel": 1.0,
        "nv": 2.5,
        "vasc": 0.5,
    }

    if scales_path:
        path = Path(scales_path)
        if path.exists():
            with path.open("r", encoding="utf-8") as file:
                default_scales.update(json.load(file))

    return np.array([default_scales[name] for name in CLASS_NAMES], dtype=np.float32)


def load_model(model_path: str | Path) -> tuple[tf.keras.Model, str, bool]:
    resolved_path = Path(model_path)
    
    if not resolved_path.exists():
        repo_id = os.getenv("HF_MODEL_REPO")
        if not repo_id:
            raise RuntimeError(f"Model file not found at {resolved_path} and HF_MODEL_REPO is not set.")
        
        print(f"Model not found locally at {resolved_path}. Downloading from Hugging Face ({repo_id})...")
        try:
            # We assume the model is stored as best_final.keras in the root of the HF repo
            downloaded_path = hf_hub_download(
                repo_id=repo_id,
                filename="best_final.keras",
                local_dir=resolved_path.parent,
                local_dir_use_symlinks=False,
                token=os.getenv("HF_TOKEN")
            )
            # Rename if the downloaded filename doesn't match the expected model_path
            if Path(downloaded_path).absolute() != resolved_path.absolute():
                os.rename(downloaded_path, resolved_path)
            print(f"Successfully downloaded model to {resolved_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to download model from Hugging Face: {e}")

    model = tf.keras.models.load_model(resolved_path, compile=False)
    return model, "cpu", False


def _preprocess_for_model(img_rgb_uint8: np.ndarray) -> np.ndarray:
    img = cv2.resize(img_rgb_uint8, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA).astype(np.float32)
    img = tf.keras.applications.efficientnet_v2.preprocess_input(img)  # [-1, 1]
    return img


def _tta_variants(img_rgb_uint8: np.ndarray) -> list[np.ndarray]:
    # original, hflip, vflip, rot90, rot270
    return [
        img_rgb_uint8,
        np.ascontiguousarray(img_rgb_uint8[:, ::-1, :]),
        np.ascontiguousarray(img_rgb_uint8[::-1, :, :]),
        np.ascontiguousarray(np.rot90(img_rgb_uint8, k=1)),
        np.ascontiguousarray(np.rot90(img_rgb_uint8, k=3)),
    ]


def _scaled_probs(probs: np.ndarray, class_scales: np.ndarray) -> np.ndarray:
    scaled = probs.astype(np.float32) * class_scales.astype(np.float32)
    return scaled / max(float(np.sum(scaled)), 1e-8)


def predict_probs_tta(model: tf.keras.Model, img_rgb_uint8: np.ndarray, class_scales: np.ndarray) -> np.ndarray:
    variants = _tta_variants(img_rgb_uint8)
    batch = np.stack([_preprocess_for_model(v) for v in variants], axis=0)
    logits = model(batch, training=False).numpy()
    probs = tf.nn.softmax(logits, axis=-1).numpy().mean(axis=0)
    return _scaled_probs(probs, class_scales)

def overlay_heatmap(original_np: np.ndarray, cam: np.ndarray) -> np.ndarray:
    height, width = original_np.shape[:2]
    resized_cam = cv2.resize(cam, (width, height))
    colored = cv2.applyColorMap(np.uint8(resized_cam * 255), cv2.COLORMAP_JET)
    colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
    return np.clip((0.45 * colored) + (0.55 * original_np), 0, 255).astype("uint8")

def _find_last_conv_layer_name(model: tf.keras.Model) -> str:
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
        if isinstance(layer, tf.keras.Model):
            for sub in reversed(layer.layers):
                if isinstance(sub, tf.keras.layers.Conv2D):
                    return sub.name
    raise RuntimeError("Could not find a Conv2D layer for Grad-CAM.")


def _gradcam_map(model: tf.keras.Model, input_tensor: tf.Tensor, class_idx: int, last_conv_layer_name: str) -> np.ndarray:
    last_conv_layer = model.get_layer(last_conv_layer_name)
    grad_model = tf.keras.Model([model.inputs], [last_conv_layer.output, model.output])

    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(input_tensor, training=False)
        if isinstance(preds, list) or isinstance(preds, tuple):
            preds = preds[0]
        if isinstance(conv_out, list) or isinstance(conv_out, tuple):
            conv_out = conv_out[0]
        class_score = preds[:, class_idx]

    grads = tape.gradient(class_score, conv_out)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_out = conv_out[0]

    heatmap = tf.reduce_sum(conv_out * pooled_grads, axis=-1)
    heatmap = tf.nn.relu(heatmap)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def _saliency_map(model: tf.keras.Model, input_tensor: tf.Tensor, class_idx: int) -> np.ndarray:
    with tf.GradientTape() as tape:
        tape.watch(input_tensor)
        preds = model(input_tensor, training=False)
        if isinstance(preds, list) or isinstance(preds, tuple):
            preds = preds[0]
        score = preds[:, class_idx]
    grads = tape.gradient(score, input_tensor)[0]  # HWC
    sal = tf.reduce_max(tf.abs(grads), axis=-1)
    sal = sal - tf.reduce_min(sal)
    sal = sal / (tf.reduce_max(sal) + 1e-8)
    return sal.numpy()


def run_inference(
    model: tf.keras.Model,
    device: str,
    image_bytes: bytes,
    class_scales: np.ndarray,
    demo_mode: bool,
) -> dict:
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    original_np = np.array(pil)

    scaled_probs = predict_probs_tta(model, original_np, class_scales)
    prediction_index = int(np.argmax(scaled_probs))
    max_prob = float(scaled_probs[prediction_index])
    
    if max_prob < 0.20:
        prediction_code = "unrelated"
        prediction_detail = {
            "name": "Invalid Image / Not a Skin Lesion",
            "risk_severity": "N/A",
            "risk_label": "Unknown"
        }
    elif max_prob < 0.35:
        prediction_code = "normal"
        prediction_detail = {
            "name": "Normal / No Disease Detected",
            "risk_severity": "None",
            "risk_label": "Healthy"
        }
    else:
        prediction_code = CLASS_NAMES[prediction_index]
        prediction_detail = CLASS_DETAILS[prediction_code]

    input_img = _preprocess_for_model(original_np)
    input_tensor = tf.convert_to_tensor(np.expand_dims(input_img, axis=0))
    last_conv = _find_last_conv_layer_name(model)
    cam = _gradcam_map(model, input_tensor, prediction_index, last_conv)
    saliency = _saliency_map(model, input_tensor, prediction_index)
    
    heatmap_np = overlay_heatmap(original_np, cam)
    
    height, width = original_np.shape[:2]
    resized_saliency = cv2.resize(saliency, (width, height))
    saliency_hot = cv2.applyColorMap(np.uint8(resized_saliency * 255), cv2.COLORMAP_HOT)
    saliency_hot = cv2.cvtColor(saliency_hot, cv2.COLOR_BGR2RGB)
    saliency_overlay = np.clip((0.6 * saliency_hot) + (0.4 * original_np), 0, 255).astype("uint8")

    top_indices = np.argsort(scaled_probs)[::-1][:3].tolist()
    
    top3 = [
        {
            "name": CLASS_DETAILS[CLASS_NAMES[index]]["name"],
            "value": round(float(scaled_probs[index] * 100), 2),
            "class": CLASS_NAMES[index]
        }
        for index in top_indices
    ]
    
    return {
        "prediction": prediction_detail["name"],
        "confidence": round(float(scaled_probs[prediction_index] * 100), 2),
        "top3": top3,
        "heatmap_img": Image.fromarray(heatmap_np),
        "saliency_img": Image.fromarray(saliency_overlay),
        "prediction_code": prediction_code,
        "risk_level": prediction_detail["risk_label"],
        "risk_severity": prediction_detail["risk_severity"],
    }
