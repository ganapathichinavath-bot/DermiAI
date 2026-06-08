# DermAI — AI Skin Diagnosis + Grad-CAM

This is a full-stack web app for AI-powered skin lesion diagnosis with **real Grad-CAM explainability**, camera capture, and Firebase authentication.

## Features

- **Image input**: File upload or camera capture (MediaDevices API)
- **Prediction**: Class label + confidence + top-3 probabilities
- **Explainability**: Real Grad-CAM heatmap overlay + saliency maps
- **Storage**: Cloudinary for image storage
- **Auth**: Firebase Authentication (Google Sign-In)
- **Database**: SQLite for scan history persistence
- **Guest mode**: Usable without an account (images processed temporarily via Base64)

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router, Zustand, Firebase
- **Backend**: FastAPI, Keras/TensorFlow, OpenCV, NumPy, Pillow, SQLAlchemy

## Local Development

### Backend

1. Create a virtual environment and install dependencies:
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2. Configure environment variables (copy `.env.example` to `.env`):
- `MODEL_PATH`: Path to your `.keras` model
- `FRONTEND_URL` / `CORS_ORIGINS`: Your frontend URL for CORS
- Firebase Admin SDK credentials
- Cloudinary credentials

3. Run the server:
```bash
uvicorn main:app --reload
```
The backend runs at `http://127.0.0.1:8000`.

### Frontend

1. Install dependencies and start the dev server:
```bash
cd Frontend
npm install
npm run dev
```

2. Configure environment variables (copy `.env.example` to `.env.development`):
- `VITE_API_URL`: URL of your backend (e.g. `http://127.0.0.1:8000`)
- Firebase config keys

The frontend runs at `http://localhost:5173`.

## Deployment

- **Frontend**: Configured for Vercel.
- **Backend**: Configured for Hugging Face Spaces.
- **Automation**: Includes a GitHub Action (`.github/workflows/huggingface-sync.yml`) to automatically deploy the backend to Hugging Face when changes are pushed to GitHub.

## Disclaimer

This application is **not** a medical device and should not be used for self-diagnosis. It is intended for educational and research purposes only. Always consult a qualified healthcare professional for medical advice.
