"""Nebula MVP — FastAPI Backend.

Routes:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/courses
  POST /api/courses
  GET  /api/courses/{id}/graph
  POST /api/courses/{id}/upload
  PUT  /api/mastery/{concept_id}
  GET  /api/concepts/{id}/resources
  POST /api/concepts/{id}/poll
"""

import os
import io
import json
import re
import time
import uuid
import hashlib
from typing import Optional

import httpx

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models import Base, engine, get_db, ConceptNode, ConceptEdge, Course, User
from auth import hash_password, verify_password, create_token, get_current_user_id

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nebula API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------
# Perplexity Setup
# ---------------------
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_MODEL = "sonar-pro"
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

# In-memory cache: SHA-256 of PDF text → extracted KG dict
_kg_cache: dict[str, dict] = {}

# ---------------------
# Pydantic Schemas
# ---------------------

class AuthRequest(BaseModel):
    email: str
    password: str

class CourseCreate(BaseModel):
    name: str

class MasteryUpdate(BaseModel):
    eval_result: Optional[str] = None  # "correct" | "partial" | "wrong"
    delta: Optional[float] = None

class PollAnswer(BaseModel):
    answer: str

# ---------------------
# LLM Prompts
# ---------------------

EXTRACTION_PROMPT = """You are an expert ontologist. Analyze the following text and extract a knowledge graph of concepts.

Instructions:
1. Extract 25-40 nodes forming a Directed Acyclic Graph (DAG). No isolated nodes.
2. Each node has: label, description (one sentence), concept_type (one of: concept, process, formula).
3. Each edge represents a prerequisite relationship: source is_prerequisite_of target.
4. Ensure the graph is a valid DAG (no cycles).

Respond ONLY with valid JSON matching this exact schema:
{
  "nodes": [{"label": "string", "description": "string", "concept_type": "concept|process|formula"}],
  "edges": [{"source_label": "string", "target_label": "string", "relationship": "is_prerequisite_of"}]
}

Text to analyze:
"""

POLL_PROMPT = """Generate a multiple-choice question to test understanding of: {label}
Description: {description}

Respond ONLY with valid JSON:
{{
  "question": "string",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A|B|C|D"
}}"""

POLL_EVAL_PROMPT = """Evaluate the student's answer.
Question: {question}
Options: {options}
Correct answer: {correct}
Student's answer: {answer}

Respond ONLY with valid JSON:
{{"eval_result": "correct|partial|wrong"}}"""

RESOURCES_PROMPT = """Recommend exactly 3 learning resources for a student studying: {label}
Description: {description}

Respond ONLY with valid JSON array:
[{{"title": "string", "url": "string", "type": "video|article", "why": "string"}}]

Return real, useful resources (YouTube videos, articles, documentation). Exactly 3 items."""

# ---------------------
# Helper Functions
# ---------------------

MAX_PAGES = 15

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyPDF2."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = reader.pages[:MAX_PAGES]
    texts = []
    for page in pages:
        text = page.extract_text()
        if text:
            texts.append(text)
    return "\n\n".join(texts)


def call_llm(prompt: str, max_retries: int = 3) -> str:
    """Call Perplexity sonar-pro and return the response text. Retries on 429."""
    if not PERPLEXITY_API_KEY:
        raise HTTPException(status_code=500, detail="PERPLEXITY_API_KEY is not set in api/.env")

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": PERPLEXITY_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful AI that responds ONLY with valid JSON. No markdown, no explanation."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
    }

    for attempt in range(max_retries):
        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(PERPLEXITY_API_URL, headers=headers, json=payload)

            if response.status_code == 429:
                wait = 15 * (attempt + 1)
                print(f"[WARN] Rate limited (attempt {attempt+1}/{max_retries}), retrying in {wait}s...")
                if attempt < max_retries - 1:
                    time.sleep(wait)
                    continue
                response.raise_for_status()

            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < max_retries - 1:
                continue
            raise
    raise RuntimeError("Max retries exceeded for Perplexity API")


def parse_json_response(text: str) -> dict | list:
    """Parse JSON from LLM response, stripping markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def clamp(value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    return max(min_val, min(max_val, value))

# ---------------------
# Auth Routes
# ---------------------

@app.post("/api/auth/register")
def register(req: AuthRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_token(user.id, user.email)
    return {"token": token, "user_id": user.id, "email": user.email}


@app.post("/api/auth/login")
def login(req: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user.id, user.email)
    return {"token": token, "user_id": user.id, "email": user.email}

# ---------------------
# Course Routes
# ---------------------

@app.get("/api/courses")
def list_courses(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).filter(Course.user_id == user_id).all()
    return [{"id": c.id, "name": c.name, "created_at": str(c.created_at)} for c in courses]


@app.post("/api/courses")
def create_course(
    req: CourseCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    course = Course(id=str(uuid.uuid4()), name=req.name, user_id=user_id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "name": course.name}


@app.get("/api/courses/{course_id}/graph")
def get_course_graph(
    course_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == user_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    nodes = db.query(ConceptNode).filter(ConceptNode.course_id == course_id).all()
    edges = db.query(ConceptEdge).filter(ConceptEdge.course_id == course_id).all()
    
    return {
        "course": {"id": course.id, "name": course.name},
        "nodes": [
            {
                "id": n.id,
                "label": n.label,
                "description": n.description,
                "concept_type": n.concept_type,
                "confidence": n.confidence,
            }
            for n in nodes
        ],
        "links": [
            {
                "id": e.id,
                "source": e.source_id,
                "target": e.target_id,
                "relationship": e.relationship_type,
            }
            for e in edges
        ],
    }


def _persist_kg_to_course(kg: dict, course_id: str, db: Session):
    """Clear existing graph and persist new KG nodes/edges to DB."""
    db.query(ConceptEdge).filter(ConceptEdge.course_id == course_id).delete()
    db.query(ConceptNode).filter(ConceptNode.course_id == course_id).delete()
    db.flush()

    label_to_id = {}
    for node_data in kg.get("nodes", []):
        node_id = str(uuid.uuid4())
        label = node_data.get("label", "Unknown")
        label_to_id[label] = node_id
        db.add(ConceptNode(
            id=node_id,
            course_id=course_id,
            label=label,
            description=node_data.get("description", ""),
            concept_type=node_data.get("concept_type", "concept"),
            confidence=0.0,
        ))
    db.flush()

    for edge_data in kg.get("edges", []):
        source_id = label_to_id.get(edge_data.get("source_label", ""))
        target_id = label_to_id.get(edge_data.get("target_label", ""))
        if source_id and target_id:
            db.add(ConceptEdge(
                id=str(uuid.uuid4()),
                course_id=course_id,
                source_id=source_id,
                target_id=target_id,
                relationship_type=edge_data.get("relationship", "is_prerequisite_of"),
            ))
    db.commit()


@app.post("/api/courses/{course_id}/upload")
async def upload_pdf(
    course_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upload PDF → hash-check cache → extract with LLM → persist graph."""
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == user_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    text = extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF")

    # Hash the extracted text for cache lookup
    content_hash = hashlib.sha256(text.encode()).hexdigest()

    if content_hash in _kg_cache:
        print(f"[CACHE HIT] PDF hash {content_hash[:12]}… — skipping LLM call")
        kg = _kg_cache[content_hash]
    else:
        # First N pages only (already truncated by extract_text_from_pdf)
        # Truncate further to ~12000 chars to keep latency and cost down
        truncated = text[:12000]
        try:
            raw = call_llm(EXTRACTION_PROMPT + truncated)
            kg = parse_json_response(raw)
            _kg_cache[content_hash] = kg  # cache for future uploads
            print(f"[CACHE MISS] PDF hash {content_hash[:12]}… — LLM called, cached")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=502, detail=f"Failed to parse LLM response: {e}")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"LLM API error: {e}")

    # Persist to DB (fast — no LLM call)
    _persist_kg_to_course(kg, course_id, db)

    # Return the graph immediately
    return get_course_graph(course_id, user_id, db)

# ---------------------
# Mastery Route
# ---------------------

@app.put("/api/mastery/{concept_id}")
def update_mastery(
    concept_id: str,
    req: MasteryUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    node = db.query(ConceptNode).filter(ConceptNode.id == concept_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Verify ownership
    course = db.query(Course).filter(Course.id == node.course_id, Course.user_id == user_id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not your course")
    
    current = node.confidence
    
    if req.eval_result:
        if req.eval_result == "correct":
            node.confidence = max(current, 0.85)
        elif req.eval_result == "partial":
            node.confidence = max(current, 0.50)
        elif req.eval_result == "wrong":
            node.confidence = 0.20 if current == 0 else min(current, 0.20)
    elif req.delta is not None:
        node.confidence = clamp(current + req.delta)
    
    db.commit()
    db.refresh(node)
    
    return {"concept_id": node.id, "confidence": node.confidence}

# ---------------------
# Resources & Poll Routes
# ---------------------

@app.get("/api/concepts/{concept_id}/resources")
def get_resources(
    concept_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    node = db.query(ConceptNode).filter(ConceptNode.id == concept_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    try:
        raw = call_llm(
            RESOURCES_PROMPT.format(label=node.label, description=node.description)
        )
        resources = parse_json_response(raw)
        return resources[:3]  # Ensure exactly 3
    except Exception as e:
        # Fallback resources
        return [
            {"title": f"Learn {node.label} - Video Tutorial", "url": f"https://www.youtube.com/results?search_query={node.label}+tutorial", "type": "video", "why": "Visual learning is effective for this topic"},
            {"title": f"{node.label} - Comprehensive Guide", "url": f"https://www.google.com/search?q={node.label}+guide", "type": "article", "why": "In-depth reading material"},
            {"title": f"{node.label} - Documentation", "url": f"https://www.google.com/search?q={node.label}+documentation", "type": "article", "why": "Official reference material"},
        ]


@app.post("/api/concepts/{concept_id}/poll")
def generate_poll(
    concept_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate a poll question for a concept."""
    node = db.query(ConceptNode).filter(ConceptNode.id == concept_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    try:
        raw = call_llm(
            POLL_PROMPT.format(label=node.label, description=node.description)
        )
        poll = parse_json_response(raw)
        return poll
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to generate poll: {e}")


@app.post("/api/concepts/{concept_id}/poll/evaluate")
def evaluate_poll(
    concept_id: str,
    req: PollAnswer,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Evaluate a poll answer and update mastery."""
    node = db.query(ConceptNode).filter(ConceptNode.id == concept_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # For MVP: simple letter matching
    # The poll response includes correct_answer, so we evaluate client-side
    # But this endpoint accepts the eval_result directly for simplicity
    # In production, we'd store the question and validate server-side
    
    answer_letter = req.answer.strip().upper()[0] if req.answer.strip() else ""
    
    # We trust the frontend to send the eval_result via the mastery endpoint
    # This endpoint just records that a poll was attempted
    return {"received": True, "answer": answer_letter}
