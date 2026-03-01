# Nebula — Web App & API

This folder contains the **Nebula** web app (Vite + React) and the **FastAPI** backend. For full project description, architecture diagrams, and setup (including the Chrome extension), see the [root README](../README.md).

## Run locally

**API** (from this folder’s `api/`):

```bash
cd api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create api/.env with PERPLEXITY_API_KEY=
uvicorn main:app --reload --port 8000
```

**Web app** (from this folder):

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173), register/login, create a course, and upload a PDF or use a seeded graph.
