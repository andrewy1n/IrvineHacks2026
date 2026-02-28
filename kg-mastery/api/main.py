import os
import io
import json
import re
import time
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from PyPDF2 import PdfReader

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_MODEL = os.getenv("PERPLEXITY_MODEL", "sonar")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

SYSTEM_PROMPT = """You are an expert Data Scientist and Ontologist specializing in extracting structured Knowledge Graphs from unstructured text.

Analyze the provided text and extract a Knowledge Graph. Break down the overarching topics into granular sub-topics, and define the relationships connecting them.

Instructions:
1. Node Extraction (Topics & Sub-Topics):
   - Identify the primary, overarching concepts in the text (Main Topics).
   - Break down each Main Topic into specific, detailed sub-topics.
   - For every node, provide a unique `id`, a readable `label`, a `type` ("Topic" or "SubTopic"), and a brief `description`.

2. Edge Extraction (Relationships):
   - Identify how the extracted topics and sub-topics are connected.
   - For each connection, extract the `source` node ID, the `target` node ID, and the `relation_type` (e.g., "INCLUDES", "CAUSES", "DEPENDS_ON").
   - Provide a brief `explanation` of exactly how they connect based on the context.

3. Constraints:
   - ONLY extract information present in the provided text.
   - Consolidate synonyms to ensure unique entities (e.g., "AI" and "Artificial Intelligence" share one ID).
   - Every SubTopic MUST have an edge connecting it to its parent Main Topic (e.g., "IS_SUBTOPIC_OF").

Respond ONLY with a valid JSON object matching this schema. Do not use markdown blocks:
{
  "nodes": [
    { "id": "string", "label": "string", "type": "Topic|SubTopic", "description": "string" }
  ],
  "edges": [
    { "source": "string", "target": "string", "relation_type": "string", "explanation": "string" }
  ]
}"""

MAX_PAGES = 10


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from the first MAX_PAGES pages of a PDF using PyPDF2."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = reader.pages[:MAX_PAGES]
    pages_text = []
    for page in pages:
        text = page.extract_text()
        if text:
            pages_text.append(text)
    print(f"[INFO] Read {len(pages)}/{len(reader.pages)} pages from PDF")
    return "\n\n".join(pages_text)


def generate_knowledge_graph(text: str, max_retries: int = 3) -> dict:
    """Send extracted text to Perplexity API and get a knowledge graph JSON."""
    if not PERPLEXITY_API_KEY:
        raise RuntimeError("PERPLEXITY_API_KEY is not set in api/.env")

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": PERPLEXITY_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "temperature": 0.1,
    }

    for attempt in range(max_retries):
        try:
            print(f"[INFO] Calling Perplexity ({PERPLEXITY_MODEL}), attempt {attempt + 1}...")
            with httpx.Client(timeout=120.0) as client:
                response = client.post(PERPLEXITY_API_URL, headers=headers, json=payload)

            if response.status_code == 429:
                wait_time = 15 * (attempt + 1)
                print(f"[WARN] Rate limited (attempt {attempt + 1}/{max_retries}), retrying in {wait_time}s...")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    continue
                response.raise_for_status()

            response.raise_for_status()

            data = response.json()
            raw = data["choices"][0]["message"]["content"].strip()
            print(f"[INFO] Got response ({len(raw)} chars)")

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)

            return json.loads(raw)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < max_retries - 1:
                continue
            raise
        except json.JSONDecodeError:
            raise

    raise RuntimeError("Max retries exceeded")


def transform_to_frontend_format(kg: dict) -> dict:
    """Transform the LLM knowledge graph into the frontend GraphData format."""
    nodes = []
    for node in kg.get("nodes", []):
        nodes.append({
            "id": node["id"],
            "label": node["label"],
            "description": node.get("description", ""),
            "confidence": 0,
            "status": "not_started",
            "difficulty": 1 if node.get("type") == "Topic" else 2,
        })

    links = []
    for i, edge in enumerate(kg.get("edges", [])):
        links.append({
            "id": f"edge-{i}",
            "source": edge["source"],
            "target": edge["target"],
            "relationship": edge.get("relation_type", "RELATED_TO"),
        })

    return {"nodes": nodes, "links": links}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Accept a PDF, extract text, generate a knowledge graph via Perplexity, and return it."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 1. Extract text from PDF
    text = extract_text_from_pdf(file_bytes)
    print(f"[INFO] Extracted {len(text)} characters from PDF")

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract any text from the PDF. The file may be image-based or empty.",
        )

    # 2. Generate knowledge graph via Perplexity
    try:
        kg = generate_knowledge_graph(text)
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON decode error: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to parse Perplexity response as JSON: {e}",
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail=f"Perplexity API error: {e}",
        )

    # 3. Transform to frontend format
    result = transform_to_frontend_format(kg)
    print(f"[INFO] Generated graph with {len(result['nodes'])} nodes and {len(result['links'])} edges")

    return result
