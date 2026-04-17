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

The backend is configured to load your trained Keras checkpoint from `Backend/best_final.keras` by default.

## Deployment

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: SQLite by default, or PostgreSQL via `DATABASE_URL`

Set `VITE_API_URL` on the frontend to your backend URL, and configure backend env vars from `Backend/.env.example`.
