const GEMINI_STORAGE_KEY = "geminiApiKey";
const GEMINI_MODEL = "gemini-3-flash-preview";
const API_BASE = "http://localhost:8000";

function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get([GEMINI_STORAGE_KEY], (data) => resolve(data[GEMINI_STORAGE_KEY] || ""));
  });
}

function getBackendToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["backendToken"], (data) => resolve(data.backendToken || ""));
  });
}

const SOLVE_SYNC_PROBLEMS_KEY = "solveSync_problems";
const SOLVE_SYNC_PROBLEMS_MAX = 100;
const PROBLEMS_NODE_ID = "__problems__";

function callGemini(apiKey, question, answer, options) {
  options = options || {};
  const kgLabels = options.kgLabels;
  const hasLabels = Array.isArray(kgLabels) && kgLabels.length > 0;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  let mappedNodeInstruction;
  if (hasLabels) {
    const conceptsWithDescriptions = kgLabels.map((n) => {
      const desc = (n.description || "").trim().slice(0, 80);
      return desc ? `${n.label}: ${desc}` : (n.label || "");
    }).filter(Boolean);
    const labelList = conceptsWithDescriptions.length > 0
      ? conceptsWithDescriptions.map((c) => `- ${c}`).join("\n")
      : kgLabels.map((n) => n.label).filter(Boolean).join(", ");
    mappedNodeInstruction = `- "mappedNode": exactly one of these concept labels (copy the label string exactly):\n${labelList}`;
  } else {
    mappedNodeInstruction = '- "mappedNode": a short concept tag (2-4 words) that best categorizes the topic, e.g. "Shared Memory", "Race Conditions"';
  }

  const prompt = `You are an educational evaluator. Given a practice question and the student's answer, respond with ONLY a single JSON object (no markdown, no code fence), with these exact keys:
${mappedNodeInstruction}
- "score": number 0-100 for how correct and complete the answer is
- "hint": exactly one sentence to help the student improve, if score < 100; if score is 100 use a short praise like "Perfect! You've got it."
- "correctAnswer": the correct answer to the question (e.g. the right order of numbers, the correct short answer, or key points). Be concise but complete. For ordering questions, give the exact sequence (e.g. "1, 2, 3, 4, 5, 6, 7, 8" or "7, 3, 1, 2, 5, 4, 6, 8" if that produces a linked list). Limit to 500 characters.

Question: ${question.replace(/"/g, '\\"')}

Student answer: ${answer.replace(/"/g, '\\"')}`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        const reason = data?.candidates?.[0]?.finishReason;
        const err = reason === "MAX_TOKENS"
          ? "Response was cut off (max tokens). Try a shorter question or answer."
          : (data?.error?.message || JSON.stringify(data));
        throw new Error(err);
      }
      let raw = text.trim();
      const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) raw = m[1].trim();
      console.log("[SolveSync] Gemini raw response:", raw);
      return parseGeminiJson(raw);
    });
}

function parseGeminiJson(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Empty or invalid response");
  let s = raw.trim();
  try {
    return JSON.parse(s);
  } catch (_) {}
  s = s.replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(s);
  } catch (_) {}
  const start = s.indexOf("{");
  if (start === -1) throw new Error("No JSON object in response");
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (c === "\\") { escape = true; continue; }
      if (c === '"') { inString = false; continue; }
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) {
    console.error("[SolveSync] parseGeminiJson failed – raw string:", s);
    throw new Error("Response JSON was truncated or invalid");
  }
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch (e) {
    console.error("[SolveSync] parseGeminiJson slice parse failed – raw string:", s);
    throw new Error("Could not parse evaluation response: " + (e.message || "Invalid JSON"));
  }
}

function resolveConceptIdFromLabel(mappedNodeLabel, kgLabels) {
  if (!kgLabels || !Array.isArray(kgLabels) || !mappedNodeLabel) return null;
  const label = String(mappedNodeLabel).trim().toLowerCase();
  const node = kgLabels.find(
    (n) => n.label && String(n.label).trim().toLowerCase() === label
  );
  return node ? node.id : null;
}

/** Extract a graph label from raw LLM output, e.g. "Shared Memory - good" -> "Shared Memory" */
function extractGraphLabel(rawMappedNode, kgLabels) {
  if (!rawMappedNode || !kgLabels || !Array.isArray(kgLabels)) return rawMappedNode;
  const labels = kgLabels.map((n) => n.label).filter(Boolean);
  if (labels.length === 0) return rawMappedNode;
  const raw = String(rawMappedNode).trim();
  const sorted = labels.slice().sort((a, b) => (b?.length || 0) - (a?.length || 0));
  for (const label of sorted) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "i");
    if (re.test(raw)) return label;
  }
  return rawMappedNode;
}

let lastAutoClassifyTabId = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_TAB") {
    const url = msg.url;
    if (url) {
      const isAuto = url.indexOf("auto=1") !== -1;
      chrome.tabs.create({ url, active: true }, (tab) => {
        if (isAuto && tab && tab.id) lastAutoClassifyTabId = tab.id;
        sendResponse({ ok: true });
      });
    } else {
      sendResponse({ ok: false });
    }
    return true;
  }

  if (msg.type === "CLASSIFY_DONE") {
    if (lastAutoClassifyTabId != null) {
      chrome.tabs.remove(lastAutoClassifyTabId, () => {});
      lastAutoClassifyTabId = null;
    }
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "FETCH_COURSES") {
    (async () => {
      const token = await getBackendToken();
      if (!token) return { error: "NOT_LOGGED_IN" };
      try {
        const res = await fetch(`${API_BASE}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const courses = await res.json();
        return { courses };
      } catch (e) {
        return { error: e.message || "FETCH_FAILED" };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg.type === "FETCH_KG_LABELS") {
    (async () => {
      const token = await getBackendToken();
      const courseId = msg.courseId || (await chrome.storage.local.get(["activeCourseId"])).activeCourseId;
      if (!token || !courseId) return { error: "NOT_CONFIGURED" };
      try {
        const res = await fetch(`${API_BASE}/api/courses/${courseId}/graph`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const graph = await res.json();
        const labels = (graph.nodes || []).map((n) => ({
          id: n.id,
          label: n.label,
          description: n.description,
          concept_type: n.concept_type,
          confidence: n.confidence,
        }));
        await chrome.storage.local.set({ kg_labels: labels });
        return { labels };
      } catch (e) {
        return { error: e.message || "FETCH_FAILED" };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg.type === "FETCH_SOLVED_PROBLEMS") {
    (async () => {
      const token = await getBackendToken();
      const courseId = (await chrome.storage.local.get(["activeCourseId"])).activeCourseId;
      if (!token || !courseId) return { error: "NOT_CONFIGURED" };
      try {
        const res = await fetch(`${API_BASE}/api/courses/${courseId}/solved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const problems = await res.json();
        await chrome.storage.local.set({ [SOLVE_SYNC_PROBLEMS_KEY]: problems });
        return { problems };
      } catch (e) {
        return { error: e.message || "FETCH_FAILED" };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg.type === "APPLY_MASTERY_BOOST") {
    (async () => {
      const token = await getBackendToken();
      const nodeId = msg.nodeId;
      if (!token || !nodeId) return { error: "NOT_CONFIGURED" };
      try {
        const res = await fetch(`${API_BASE}/api/mastery/${nodeId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ delta: MASTERY_BOOST_DELTA }),
        });
        if (res.ok) {
          await chrome.storage.local.set({ [SECTION_MASTERY_VIEWED_KEY]: 0 });
          const payload = await res.json();
          const current = await chrome.storage.local.get([CLASSIFY_RESULT_KEY]);
          const prev = current[CLASSIFY_RESULT_KEY];
          if (prev && prev.nodeId === nodeId) {
            await chrome.storage.local.set({
              [CLASSIFY_RESULT_KEY]: { ...prev, confidence: payload.confidence },
            });
          }
          return { ok: true };
        }
        return { error: `HTTP ${res.status}` };
      } catch (e) {
        return { error: e.message || "UPDATE_FAILED" };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg.type === "UPDATE_MASTERY") {
    (async () => {
      const token = await getBackendToken();
      if (!token || !msg.conceptId) return { error: "NOT_CONFIGURED" };
      const evalResult = msg.evalResult;
      const delta = msg.delta;
      if (evalResult == null && (delta == null || typeof delta !== "number")) return { error: "MISSING_EVAL_RESULT_OR_DELTA" };
      const body = delta != null ? { delta } : { eval_result: evalResult };
      try {
        const res = await fetch(`${API_BASE}/api/mastery/${msg.conceptId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { concept_id: data.concept_id, confidence: data.confidence };
      } catch (e) {
        return { error: e.message || "UPDATE_FAILED" };
      }
    })().then(sendResponse);
    return true;
  }

  if (msg.type !== "SOLVE_SYNC_EVALUATE") return;
  (async () => {
    console.log("[SolveSync] Starting evaluation", { question: msg.question?.slice(0, 80), answer: msg.answer?.slice(0, 80) });
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.warn("[SolveSync] No Gemini API key set");
      return { error: "NO_API_KEY" };
    }
    try {
      const token = await getBackendToken();
      const { kg_labels: kgLabels, classify_last_result: classifyResult, section_mastery_lastConceptId: sectionConceptId } = await chrome.storage.local.get(["kg_labels", "classify_last_result", "section_mastery_lastConceptId"]);
      const pageConceptId = (classifyResult && classifyResult.nodeId) || sectionConceptId || null;
      const pageConceptLabel = (classifyResult && classifyResult.label) || (kgLabels && pageConceptId && kgLabels.find((n) => n.id === pageConceptId)?.label) || null;

      console.log("[SolveSync] Calling Gemini...");
      const result = await callGemini(apiKey, msg.question, msg.answer, { kgLabels: kgLabels || [] });
      const score = typeof result.score === "number" ? Math.min(100, Math.max(0, result.score)) : 0;
      const geminiMappedNode = result.mappedNode || "Unknown";
      const canonicalMapped = kgLabels && kgLabels.length > 0 ? extractGraphLabel(geminiMappedNode, kgLabels) : geminiMappedNode;
      console.log("[SolveSync] Gemini result:", { mappedNode: geminiMappedNode, canonical: canonicalMapped, score, hint: result.hint?.slice(0, 60) });

      let conceptId = pageConceptId === PROBLEMS_NODE_ID ? null : pageConceptId;
      let displayLabel = pageConceptLabel || canonicalMapped;
      if (!conceptId) {
        conceptId = resolveConceptIdFromLabel(canonicalMapped, kgLabels);
        displayLabel = canonicalMapped;
        console.log("[SolveSync] No page concept (or Problems page); resolved from Gemini mappedNode:", conceptId);
      } else {
        console.log("[SolveSync] Using page concept:", conceptId, displayLabel);
      }

      const correctAnswer = (result.correctAnswer || "").slice(0, 500);
      const response = {
        mappedNode: displayLabel,
        score,
        hint: result.hint || "",
      };

      console.log("[SolveSync] token exists:", !!token, "kg_labels count:", kgLabels?.length ?? 0);
      if (kgLabels && kgLabels.length > 0) {
        console.log("[SolveSync] Available KG labels:", kgLabels.map((n) => n.label));
      }
      if (token && conceptId && conceptId !== PROBLEMS_NODE_ID) {
        const evalResult = score >= 85 ? "correct" : score >= 50 ? "partial" : "wrong";
        console.log("[SolveSync] Updating mastery:", { conceptId, evalResult });
        try {
          const masteryUrl = `${API_BASE}/api/mastery/${conceptId}`;
          console.log("[SolveSync] Saving mastery to API:", masteryUrl);
          const putRes = await fetch(masteryUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ eval_result: evalResult }),
          });
          console.log("[SolveSync] PUT mastery status:", putRes.status);
          if (putRes.ok) {
            const data = await putRes.json();
            response.masteryUpdated = true;
            response.confidence = data.confidence;
          }
        } catch (e) {
          console.error("[SolveSync] PUT mastery failed:", e);
        }
        const solvedUrl = `${API_BASE}/api/concepts/${conceptId}/solved`;
        console.log("[SolveSync] Saving solved problem to API:", solvedUrl);
        try {
          const solvedRes = await fetch(solvedUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: msg.question || "",
              options: [],
              correct_answer: correctAnswer,
              user_answer: msg.answer || "",
              eval_result: evalResult,
            }),
          });
          console.log("[SolveSync] POST solved status:", solvedRes.status);
        } catch (e) {
          console.error("[SolveSync] POST solved failed:", e);
        }
      } else {
        console.warn("[SolveSync] Skipping backend sync (no API saves) — token:", !!token, "conceptId:", conceptId);
      }

      const problemsRaw = await chrome.storage.local.get([SOLVE_SYNC_PROBLEMS_KEY]);
      const problemsList = Array.isArray(problemsRaw[SOLVE_SYNC_PROBLEMS_KEY]) ? problemsRaw[SOLVE_SYNC_PROBLEMS_KEY].slice() : [];
      problemsList.unshift({
        question: (msg.question || "").slice(0, 200),
        mappedNode: displayLabel,
        conceptId: conceptId || null,
        score,
        correctAnswer,
        submittedAt: new Date().toISOString(),
      });
      if (problemsList.length > SOLVE_SYNC_PROBLEMS_MAX) problemsList.length = SOLVE_SYNC_PROBLEMS_MAX;
      await chrome.storage.local.set({ [SOLVE_SYNC_PROBLEMS_KEY]: problemsList });
      console.log("[SolveSync] Saved to extension storage: chrome.storage.local key", SOLVE_SYNC_PROBLEMS_KEY, "(list length:", problemsList.length, ")");

      console.log("[SolveSync] Done, returning response");
      return response;
    } catch (e) {
      console.error("[SolveSync] Error:", e);
      return { error: e.message || "API_ERROR" };
    }
  })().then(sendResponse);
  return true;
});

const OPENSTAX_SECTION_VIEWED_KEY = "openstax_section_viewed";
const CLASSIFY_RESULT_KEY = "classify_last_result";
const SECTION_MASTERY_VIEWED_KEY = "section_mastery_sectionsViewed";
const SECTION_MASTERY_CONCEPT_KEY = "section_mastery_lastConceptId";
const SECTIONS_REQUIRED_FOR_BOOST = 3;
const MASTERY_BOOST_DELTA = 0.05;

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes[OPENSTAX_SECTION_VIEWED_KEY] || changes[OPENSTAX_SECTION_VIEWED_KEY].newValue !== true) return;
  (async () => {
    const token = await getBackendToken();
    if (!token) return;
    const data = await chrome.storage.local.get([
      CLASSIFY_RESULT_KEY,
      SECTION_MASTERY_VIEWED_KEY,
      SECTION_MASTERY_CONCEPT_KEY,
    ]);
    const result = data[CLASSIFY_RESULT_KEY];
    const nodeId = result && result.nodeId;
    if (!nodeId) {
      await chrome.storage.local.set({ [OPENSTAX_SECTION_VIEWED_KEY]: false });
      return;
    }
    let viewed = typeof data[SECTION_MASTERY_VIEWED_KEY] === "number" ? data[SECTION_MASTERY_VIEWED_KEY] : 0;
    const lastConceptId = data[SECTION_MASTERY_CONCEPT_KEY];
    if (lastConceptId !== nodeId) {
      viewed = 0;
    }
    viewed += 1;
    await chrome.storage.local.set({
      [SECTION_MASTERY_VIEWED_KEY]: viewed,
      [SECTION_MASTERY_CONCEPT_KEY]: nodeId,
      [OPENSTAX_SECTION_VIEWED_KEY]: false,
    });
    if (viewed >= SECTIONS_REQUIRED_FOR_BOOST) {
      try {
        const res = await fetch(`${API_BASE}/api/mastery/${nodeId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ delta: MASTERY_BOOST_DELTA }),
        });
        if (res.ok) {
          await chrome.storage.local.set({ [SECTION_MASTERY_VIEWED_KEY]: 0 });
          const payload = await res.json();
          const current = await chrome.storage.local.get([CLASSIFY_RESULT_KEY]);
          const prev = current[CLASSIFY_RESULT_KEY];
          if (prev && prev.nodeId === nodeId) {
            await chrome.storage.local.set({
              [CLASSIFY_RESULT_KEY]: { ...prev, confidence: payload.confidence },
            });
          }
        }
      } catch (_) {}
    }
  })();
});
