---
title: DermAI Backend
emoji: 🩺
colorFrom: indigo
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Derm AI Backend

FastAPI service for HAM10000 skin lesion classification with calibrated inference and Grad-CAM explainability.

**Model weights:** [ganirathod/dermiAI](https://huggingface.co/ganirathod/dermiAI)

## Required Space secrets

Set these in **Settings → Repository secrets** on this Space:

| Variable | Purpose |
|----------|---------|
| `HF_MODEL_REPO` | `ganirathod/dermiAI` |
| `HF_TOKEN` | Hugging Face token (model download) |
| `FIREBASE_CREDENTIALS` | Firebase Admin JSON for auth |
| `CLOUDINARY_*` | Image storage for logged-in users |
| `DATABASE_URL` | PostgreSQL (e.g. Supabase) |
| `FRONTEND_URL` | Vercel frontend URL for CORS |
| `SENDGRID_API_KEY` | Welcome emails (optional) |
