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
const CONTENT_CATEGORIES = [
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
  const items = await chrome.storage.local.get(CLASSIFY_PENDING_KEY);
  const text = items[CLASSIFY_PENDING_KEY];
  await chrome.storage.local.remove(CLASSIFY_PENDING_KEY);

  if (!text || text.length < 10) {
    setStatus("No content to classify. In the extension popup, extract content (Refresh) then click Classify with AI.", "error");
    return;
  }

  const LM = getLM();
  if (!LM) {
    setStatus(
      "Gemini Nano not available in this context. Enable: chrome://flags/#optimization-guide-on-device-model and chrome://flags/#prompt-api-for-gemini-nano (or #prompt-api-for-gemini-nano-multimodal-input). Relaunch Chrome. Needs 22GB disk, 16GB RAM or 4GB+ VRAM.",
      "error"
    );
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
    setStatus("Availability check failed: " + (e.message || e), "error");
    return;
  }

  if (availability === "unavailable") {
    setStatus("Gemini Nano unavailable on this device (storage, RAM/VRAM, or network).", "error");
    return;
  }
  if (availability === "downloading") {
    setStatus("Model downloading… Reload this page when ready.");
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
    setStatus("Could not create session: " + (e.message || e), "error");
    if (cancelBtn) cancelBtn.hidden = true;
    if (needsDownload) {
      statusEl.textContent += " Reload and try Classify again once the model has finished downloading.";
    }
    return;
  }

  setStatus("Classifying…");
  let cancelReject;
  const cancelPromise = new Promise((_, rej) => { cancelReject = rej; });
  if (cancelBtn) {
    cancelBtn.onclick = () => cancelReject(new Error("Cancelled"));
  }
  const categoriesList = CONTENT_CATEGORIES.join(", ");
  const prompt = `Classify the following content into exactly one of these categories. Reply with only the category name, nothing else.\n\nCategories: ${categoriesList}\n\nContent:\n${text.slice(0, 6000)}`;
  try {
    const result = await withTimeout(
      Promise.race([session.prompt(prompt), cancelPromise]),
      PROMPT_TIMEOUT_MS,
      "Classification timed out"
    );
    session.destroy();
    const trimmed = (result || "").trim();
    const match = CONTENT_CATEGORIES.find((c) => trimmed.toLowerCase().includes(c.toLowerCase()));
    const classification = match || trimmed || "(unknown)";
    setStatus("Done.", "done");
    resultEl.textContent = "Classification: " + classification;
  } catch (e) {
    if (session) session.destroy();
    setStatus(e.message === "Cancelled" ? "Cancelled." : "Classification failed: " + (e.message || e), e.message === "Cancelled" ? "" : "error");
  }
  if (cancelBtn) {
    cancelBtn.hidden = true;
    cancelBtn.onclick = null;
  }
}

run();
