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

function callGemini(apiKey, question, answer) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = `You are an educational evaluator. Given a practice question and the student's answer, respond with ONLY a single JSON object (no markdown, no code fence), with these exact keys:
- "mappedNode": a short concept tag (2-4 words) that best categorizes the topic, e.g. "Shared Memory", "Race Conditions"
- "score": number 0-100 for how correct and complete the answer is
- "hint": exactly one sentence to help the student improve, if score < 100; if score is 100 use a short praise like "Perfect! You've got it."

Question: ${question.replace(/"/g, '\\"')}

Student answer: ${answer.replace(/"/g, '\\"')}`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
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
      return JSON.parse(raw);
    });
}

function resolveConceptIdFromLabel(mappedNodeLabel, kgLabels) {
  if (!kgLabels || !Array.isArray(kgLabels) || !mappedNodeLabel) return null;
  const label = String(mappedNodeLabel).trim().toLowerCase();
  const node = kgLabels.find(
    (n) => n.label && String(n.label).trim().toLowerCase() === label
  );
  return node ? node.id : null;
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

  if (msg.type === "UPDATE_MASTERY") {
    (async () => {
      const token = await getBackendToken();
      if (!token || !msg.conceptId) return { error: "NOT_CONFIGURED" };
      const evalResult = msg.evalResult; // "correct" | "partial" | "wrong"
      if (!evalResult) return { error: "MISSING_EVAL_RESULT" };
      try {
        const res = await fetch(`${API_BASE}/api/mastery/${msg.conceptId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eval_result: evalResult }),
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
    const apiKey = await getApiKey();
    if (!apiKey) {
      return { error: "NO_API_KEY" };
    }
    try {
      const result = await callGemini(apiKey, msg.question, msg.answer);
      const score = typeof result.score === "number" ? Math.min(100, Math.max(0, result.score)) : 0;
      const mappedNode = result.mappedNode || "Unknown";
      const response = {
        mappedNode,
        score,
        hint: result.hint || "",
      };

      const token = await getBackendToken();
      const { kg_labels: kgLabels } = await chrome.storage.local.get(["kg_labels"]);
      const conceptId = resolveConceptIdFromLabel(mappedNode, kgLabels);
      if (token && conceptId) {
        const evalResult = score >= 85 ? "correct" : score >= 50 ? "partial" : "wrong";
        try {
          const putRes = await fetch(`${API_BASE}/api/mastery/${conceptId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ eval_result: evalResult }),
          });
          if (putRes.ok) {
            const data = await putRes.json();
            response.masteryUpdated = true;
            response.confidence = data.confidence;
          }
        } catch (_) {}
      }
      return response;
    } catch (e) {
      return { error: e.message || "API_ERROR" };
    }
  })().then(sendResponse);
  return true;
});
