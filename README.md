# DermAI — AI Skin Diagnosis + Grad-CAM

Full-stack web app for AI-powered skin lesion diagnosis with **real Grad-CAM explainability**, camera capture, and Firebase authentication.

## Model performance (HAM10000 test set)

| Metric | Value |
|--------|-------|
| Test accuracy | **82.54%** |
| Macro F1 | **0.7073** (baseline 0.6356) |
| Micro AUC | **0.9777** |
| Macro AUC | **0.9566** |

**Weights:** [ganirathod/dermiAI](https://huggingface.co/ganirathod/dermiAI)  
**Backend API:** [Hugging Face Space](https://huggingface.co/spaces/ganirathod/dermai-backend)

Calibration scales (`class_scales.json`) rebalance predictions — especially reducing over-prediction of the dominant `nv` (nevus) class (`nv: 1.45`).

## Features

- **Image input**: File upload or camera capture (MediaDevices API)
- **Prediction**: 7-class label + confidence + top-3 probabilities
- **Explainability**: Grad-CAM heatmap + saliency maps
- **Auth**: Firebase Google Sign-In
- **Guest mode**: Diagnose without login (Base64 in-memory, no cloud storage)
- **History**: Scan history for authenticated users (Cloudinary + database)

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router, Zustand, Axios, Firebase Auth |
| Backend | FastAPI, TensorFlow/Keras, OpenCV, NumPy, Pillow, SQLAlchemy |
| Model | EfficientNetV2 + TTA + calibrated class scales |
| Storage | Cloudinary (images), PostgreSQL/Supabase (users & history) |
| Email | SendGrid (welcome emails) |
| Deploy | Vercel (frontend), Hugging Face Spaces (backend) |

## Local development

### Backend

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in secrets
python download_model.py   # optional: fetch weights from HF
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env.development   # VITE_API_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:5173`.

## Deployment

- **Frontend** → Vercel (`VITE_API_URL` points to HF Space URL)
- **Backend** → Hugging Face Space (Docker, port 7860)
- **CI** → GitHub Action syncs `Backend/` to HF on push to `main`

## Disclaimer

This application is **not** a medical device. For educational and research purposes only. Always consult a qualified healthcare professional for medical advice.
