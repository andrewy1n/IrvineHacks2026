(async function checkNanoStatus() {
  try {
    if (window.ai?.languageModel?.capabilities) {
      const capabilities = await window.ai.languageModel.capabilities();
      console.log("Nano Availability:", capabilities.available);
    } else {
      console.log("Nano Availability: window.ai.languageModel.capabilities not present");
    }
  } catch (e) {
    console.log("Nano Availability check failed:", e.message);
  }
})();

const CLASSIFY_PENDING_KEY = "classify_pending_text";
const CLASSIFY_RESULT_KEY = "classify_last_result";
const FALLBACK_CATEGORIES = [
  "Educational",
  "Quiz/Assessment",
  "Reference",
  "News",
  "Social",
  "Shopping",
  "Entertainment",
  "Technical",
  "Other",
];

const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const cancelBtn = document.getElementById("cancelClassify");

const CREATE_TIMEOUT_MS = 30000;
const CREATE_DOWNLOAD_TIMEOUT_MS = 600000; // 10 min when triggering model download
const PROMPT_TIMEOUT_MS = 60000;
const withTimeout = (p, ms, msg) =>
  Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error(msg || "Timed out")), ms))]);

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = type;
}

function getLM() {
  if (typeof LanguageModel !== "undefined") return LanguageModel;
  if (typeof chrome !== "undefined" && chrome?.aiOriginTrial?.languageModel) return chrome.aiOriginTrial.languageModel;
  return null;
}

async function run() {
  const items = await chrome.storage.local.get([CLASSIFY_PENDING_KEY, "kg_labels"]);
  const text = items[CLASSIFY_PENDING_KEY];
  const kgLabels = items.kg_labels;
  await chrome.storage.local.remove(CLASSIFY_PENDING_KEY);

  if (!text || text.length < 10) {
    const msg = "No content to classify. In the extension popup, extract content (Refresh) then click Classify with AI.";
    setStatus(msg, "error");
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: true } });
    return;
  }

  const useKgLabels = Array.isArray(kgLabels) && kgLabels.length > 0;
  const labelList = useKgLabels
    ? kgLabels.map((n) => n.label).filter(Boolean).join(", ")
    : FALLBACK_CATEGORIES.join(", ");
  if (!labelList) {
    const msg = "No labels loaded. In Options, log in to the backend, select a course, and click Refresh knowledge graph.";
    setStatus(msg, "error");
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: true } });
    return;
  }

  const LM = getLM();
  if (!LM) {
    const msg = "Gemini Nano not available. Enable the Nano flags in chrome://flags and relaunch.";
    setStatus(
      "Gemini Nano not available in this context. Enable: chrome://flags/#optimization-guide-on-device-model and chrome://flags/#prompt-api-for-gemini-nano (or #prompt-api-for-gemini-nano-multimodal-input). Relaunch Chrome. Needs 22GB disk, 16GB RAM or 4GB+ VRAM.",
      "error"
    );
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: true } });
    return;
  }

  setStatus("Checking model…");
  let availability;
  try {
    availability = await LM.availability({
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });
  } catch (e) {
    const msg = "Availability check failed: " + (e.message || e);
    setStatus(msg, "error");
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: true } });
    return;
  }

  if (availability === "unavailable") {
    const msg = "Gemini Nano unavailable on this device.";
    setStatus(msg, "error");
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: true } });
    return;
  }
  if (availability === "downloading") {
    const msg = "Model downloading… Reload when ready.";
    setStatus(msg);
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: false } });
    return;
  }
  const needsDownload = availability === "downloadable";
  if (needsDownload) {
    setStatus("Starting model download… This may take several minutes.");
  } else {
    setStatus("Classifying…");
  }
  if (cancelBtn) cancelBtn.hidden = false;
  const createTimeout = needsDownload ? CREATE_DOWNLOAD_TIMEOUT_MS : CREATE_TIMEOUT_MS;
  let session;
  try {
    session = await withTimeout(
      LM.create({
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
      }),
      createTimeout,
      "Session creation timed out"
    );
  } catch (e) {
    const msg = "Could not create session: " + (e.message || e);
    setStatus(msg, "error");
    if (cancelBtn) cancelBtn.hidden = true;
    if (needsDownload) {
      statusEl.textContent += " Reload and try Classify again once the model has finished downloading.";
    }
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: msg, error: true } });
    return;
  }

  setStatus("Classifying…");
  let cancelReject;
  const cancelPromise = new Promise((_, rej) => { cancelReject = rej; });
  if (cancelBtn) {
    cancelBtn.onclick = () => cancelReject(new Error("Cancelled"));
  }
  const prompt = useKgLabels
    ? `You are classifying educational content against a knowledge graph. Given the text below, identify which concept from the list it most closely relates to. Reply with ONLY the concept label, nothing else.\n\nConcepts: ${labelList}\n\nContent:\n${text.slice(0, 6000)}`
    : `Classify the following content into exactly one of these categories. Reply with only the category name, nothing else.\n\nCategories: ${labelList}\n\nContent:\n${text.slice(0, 6000)}`;
  try {
    const result = await withTimeout(
      Promise.race([session.prompt(prompt), cancelPromise]),
      PROMPT_TIMEOUT_MS,
      "Classification timed out"
    );
    session.destroy();
    const trimmed = (result || "").trim();
    const categories = useKgLabels ? kgLabels.map((n) => n.label) : FALLBACK_CATEGORIES;
    const match = categories.find((c) => c && trimmed.toLowerCase().includes(String(c).toLowerCase()));
    const matchedLabel = match || trimmed || "(unknown)";
    const matchedNode = useKgLabels && kgLabels.find((n) => n.label && String(n.label).toLowerCase() === matchedLabel.toLowerCase());
    const resultMessage = "Concept: " + matchedLabel;
    setStatus("Done.", "done");
    resultEl.textContent = resultMessage;
    const payload = {
      message: resultMessage,
      error: false,
      nodeId: matchedNode ? matchedNode.id : null,
      nodeLabel: matchedLabel,
      confidence: matchedNode && typeof matchedNode.confidence === "number" ? matchedNode.confidence : null,
    };
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: payload });
  } catch (e) {
    if (session) session.destroy();
    const errMsg = e.message === "Cancelled" ? "Cancelled." : "Classification failed: " + (e.message || e);
    setStatus(errMsg, e.message === "Cancelled" ? "" : "error");
    await chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: { message: errMsg, error: e.message !== "Cancelled" } });
  }
  if (cancelBtn) {
    cancelBtn.hidden = true;
    cancelBtn.onclick = null;
  }
}

run();
