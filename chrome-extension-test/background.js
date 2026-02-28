const GEMINI_STORAGE_KEY = "geminiApiKey";
const GEMINI_MODEL = "gemini-3-flash-preview";

function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get([GEMINI_STORAGE_KEY], (data) => resolve(data[GEMINI_STORAGE_KEY] || ""));
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "SOLVE_SYNC_EVALUATE") return;
  (async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return { error: "NO_API_KEY" };
    }
    try {
      const result = await callGemini(apiKey, msg.question, msg.answer);
      return {
        mappedNode: result.mappedNode || "Unknown",
        score: typeof result.score === "number" ? Math.min(100, Math.max(0, result.score)) : 0,
        hint: result.hint || "",
      };
    } catch (e) {
      return { error: e.message || "API_ERROR" };
    }
  })().then(sendResponse);
  return true;
});
