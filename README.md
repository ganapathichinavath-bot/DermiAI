# DermAI — Free, production-ready skin diagnosis + Grad‑CAM

This is a **fully free** full-stack web app for AI-powered skin lesion diagnosis with **real Grad‑CAM explainability**, camera capture, and optional JWT authentication.

## Features

- **Image input**: file upload or camera capture (MediaDevices API)
- **Prediction**: class label + confidence + top‑3 probabilities
- **Explainability**: real Grad‑CAM heatmap overlay + compare slider
- **Storage**: local filesystem under `Backend/static/` (no paid cloud storage)
- **Auth (optional)**: JWT + bcrypt (only needed to save history server-side)
- **Guest mode**: saves up to 20 scans in browser localStorage (Zustand persist)

## Tech stack (100% free)

- Frontend: React (Vite), Tailwind, Framer Motion, React Router, Zustand
- Backend: FastAPI, PyTorch, OpenCV, NumPy, Pillow, SQLAlchemy, SQLite, JWT

## Local development

### Backend

1. Create venv and install deps:

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2. Configure environment variables (copy `.env.example` to `.env`):

- `SECRET_KEY`: required for JWT
- `MODEL_PATH`: **PyTorch model file** (expects `.pt`)
- `FRONTEND_ORIGIN`: your frontend URL (for CORS)
- `DATABASE_URL`: defaults to SQLite

3. Run:

```bash
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Production deployment (free tiers)

### Backend on Render / Railway (free)

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set env vars:
  - `SECRET_KEY`
  - `MODEL_PATH` (path on the server to your `.pt` model)
  - `FRONTEND_ORIGIN` (your Vercel/Netlify URL)
  - `DATABASE_URL` (optional; SQLite works for simple demos)

### Frontend on Vercel / Netlify (free)

- Set `VITE_API_URL` to your backend base URL (Render/Railway)

## Notes

- This is **not** a medical device. Use for education/research only.
- If you want to deploy with a large model, keep in mind free tiers may have RAM/disk limits.

# DermAI

Free full-stack skin disease screening app with:

- React + Vite + Tailwind frontend
- FastAPI backend with Keras/TensorFlow model inference
- Real Grad-CAM explainability
- Browser camera capture
- Optional JWT authentication
- SQLite history persistence for signed-in users

## Run locally

### Backend

```powershell
cd Backend
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

### Frontend

```powershell
cd Frontend
npm install
copy .env.example .env.development
npm run dev
```

Frontend defaults to `http://localhost:5173` and backend defaults to `http://localhost:8000`.

## Model behavior

The backend is configured to automatically download the trained Keras model from [Hugging Face](https://huggingface.co/dermai/dermai-model) if it is not present locally. By default, it downloads to `/tmp/best_final.keras` (configured via `MODEL_PATH` in `.env`).

## Deployment

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: SQLite by default, or PostgreSQL via `DATABASE_URL`

Set `VITE_API_URL` on the frontend to your backend URL, and configure backend env vars from `Backend/.env.example`.
