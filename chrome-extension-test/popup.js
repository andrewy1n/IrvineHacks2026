const QUIZ_STORAGE_KEY = "gradescope_quiz_data";
const OPENSTAX_STORAGE_KEY = "openstax_page_data";
const OPENSTAX_HISTORY_KEY = "openstax_reading_history";

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

const out = document.getElementById("out");
const refreshBtn = document.getElementById("refresh");
const copyBtn = document.getElementById("copy");
const classifyBtn = document.getElementById("classify");
const cancelBtn = document.getElementById("cancelClassify");
const classificationResult = document.getElementById("classificationResult");

function isOpenStaxUrl(url) {
  return url && url.includes("openstax.org");
}

function showQuiz(data) {
  copyBtn.textContent = "Copy JSON";
  out._mode = "quiz";
  if (!data || !data.questions || data.questions.length === 0) {
    out.textContent = "No quiz structure detected. Open a Gradescope quiz page and click Refresh.";
    out.className = "empty";
    out._lastData = data;
    return;
  }
  out.className = "";
  const lines = [
    `URL: ${data.url}`,
    `Title: ${data.title}`,
    `Questions: ${data.questions.length}`,
    "",
    ...data.questions.map((q, i) => {
      const choices = (q.choices && q.choices.length)
        ? q.choices.map((c, j) => (q.selectedIndex === j ? `  • ${c}  ← chosen` : `  • ${c}`)).join("\n")
        : "(no choices)";
      const chosen = q.selectedIndex != null && q.choices && q.choices[q.selectedIndex]
        ? `\n  Chosen: ${q.choices[q.selectedIndex]}`
        : q.selectedIndex == null && (q.choices?.length > 0) ? "\n  Chosen: (none)" : "";
      return `Q${i + 1}: ${(q.question || "").slice(0, 200)}${q.question && q.question.length > 200 ? "…" : ""}${chosen}\n${choices}`;
    }),
  ];
  out.textContent = lines.join("\n");
  out._lastData = data;
}

function showOpenStax(data, history) {
  copyBtn.textContent = "Copy text";
  out._mode = "openstax";
  out._lastData = data;
  out._lastHistory = history;

  if (!data || !data.fullText) {
    if (history && history.length > 0) {
      out.className = "";
      out.textContent = `Reading history (${history.length} sections seen):\n\n` +
        history.map((entry, i) => `[${i + 1}] ${entry.seenAt.slice(11, 19)} — ${entry.text.slice(0, 200)}${entry.text.length > 200 ? "…" : ""}`).join("\n\n");
    } else {
      out.textContent = "No OpenStax content yet. Navigate to an OpenStax book page — tracking starts automatically.";
      out.className = "empty";
    }
    return;
  }

  out.className = "";
  const historyNote = history && history.length > 0
    ? `Sections seen this session: ${history.length}\n\n`
    : "";
  const preview = data.fullText.slice(0, 12000);
  out.textContent = `${data.title || "OpenStax"}\n\n${historyNote}Currently visible:\n${preview}${data.fullText.length > 12000 ? "\n\n… (truncated)" : ""}`;
}

function getCurrentExtractedText() {
  const data = out._lastData;
  if (!data) return null;
  if (out._mode === "openstax" && data.fullText) return data.fullText.slice(0, 8000);
  if (out._mode === "quiz" && data.questions && data.questions.length) {
    return data.questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q.question || ""}\n${(q.choices || []).join("\n")}`
      )
      .join("\n\n");
  }
  return null;
}

function showClassificationResult(text, isError = false) {
  classificationResult.textContent = text;
  classificationResult.hidden = false;
  classificationResult.classList.toggle("error", isError);
}

function hideClassificationResult() {
  classificationResult.hidden = true;
  classificationResult.classList.remove("error");
}

function getLanguageModel() {
  if (typeof LanguageModel !== "undefined") return LanguageModel;
  if (typeof chrome !== "undefined" && chrome?.aiOriginTrial?.languageModel) return chrome.aiOriginTrial.languageModel;
  return null;
}

const CLASSIFY_PENDING_KEY = "classify_pending_text";

async function runClassification() {
  const text = getCurrentExtractedText();
  if (!text || text.length < 10) {
    showClassificationResult("Extract content first (Refresh on a Gradescope or OpenStax page).", true);
    return;
  }
  const LM = getLanguageModel();
  if (!LM) {
    showClassificationResult("Opening classifier tab… (popup has no API access)", false);
    await chrome.storage.local.set({ [CLASSIFY_PENDING_KEY]: text });
    chrome.tabs.create({ url: chrome.runtime.getURL("classify.html") });
    return;
  }
  classifyBtn.disabled = true;
  showClassificationResult("Checking model…");
  let availability;
  try {
    availability = await LM.availability({
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    });
  } catch (e) {
    showClassificationResult("Availability check failed: " + (e.message || e), true);
    classifyBtn.disabled = false;
    return;
  }
  if (availability === "unavailable") {
    showClassificationResult("Gemini Nano unavailable on this device (see Chrome AI requirements).", true);
    classifyBtn.disabled = false;
    return;
  }
  if (availability === "downloadable" || availability === "downloading") {
    showClassificationResult(availability === "downloading" ? "Model downloading…" : "Model may need to download. Click Classify again after ready.");
    classifyBtn.disabled = false;
    return;
  }
  const CREATE_TIMEOUT_MS = 30000;
  const PROMPT_TIMEOUT_MS = 60000;
  const withTimeout = (p, ms, msg) =>
    Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error(msg || "Timed out")), ms))]);

  showClassificationResult("Classifying…");
  cancelBtn.hidden = false;
  let session;
  try {
    session = await withTimeout(
      LM.create({
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
      }),
      CREATE_TIMEOUT_MS,
      "Session creation timed out"
    );
  } catch (e) {
    showClassificationResult("Could not create session: " + (e.message || e), true);
    classifyBtn.disabled = false;
    cancelBtn.hidden = true;
    return;
  }
  let cancelReject;
  const cancelPromise = new Promise((_, rej) => { cancelReject = rej; });
  cancelBtn.onclick = () => cancelReject(new Error("Cancelled"));
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
    showClassificationResult("Classification: " + (match || trimmed || "(unknown)"));
  } catch (e) {
    if (session) session.destroy();
    showClassificationResult(e.message === "Cancelled" ? "Cancelled." : "Classification failed: " + (e.message || e), e.message === "Cancelled" ? false : true);
  }
  classifyBtn.disabled = false;
  cancelBtn.hidden = true;
  cancelBtn.onclick = null;
}

function load() {
  hideClassificationResult();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const openstax = tab && isOpenStaxUrl(tab.url);
    if (openstax) {
      chrome.storage.local.get([OPENSTAX_STORAGE_KEY, OPENSTAX_HISTORY_KEY], (res) => {
        showOpenStax(res[OPENSTAX_STORAGE_KEY] || null, res[OPENSTAX_HISTORY_KEY] || []);
      });
    } else {
      chrome.storage.local.get([QUIZ_STORAGE_KEY], (res) => {
        showQuiz(res[QUIZ_STORAGE_KEY] || null);
      });
    }
  });
}

// Auto-update popup whenever the content script saves new data autonomously
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[OPENSTAX_STORAGE_KEY] || changes[OPENSTAX_HISTORY_KEY]) {
    load();
  }
});

refreshBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;
    if (isOpenStaxUrl(tab.url)) {
      chrome.tabs.sendMessage(tab.id, "EXTRACT_OPENSTAX", (payload) => {
        if (chrome.runtime.lastError) {
          out.textContent = "Error: " + chrome.runtime.lastError.message + ". Reload the OpenStax page.";
          out.className = "empty";
          return;
        }
        if (payload) chrome.storage.local.set({ [OPENSTAX_STORAGE_KEY]: payload });
        load();
      });
      return;
    }
    if (!tab.url.includes("gradescope.com")) {
      out.textContent = "Open a Gradescope or OpenStax tab and try again.";
      out.className = "empty";
      return;
    }
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: () => window.__gradescopeQuizExtract && window.__gradescopeQuizExtract() },
      (results) => {
        if (chrome.runtime.lastError) {
          out.textContent = "Error: " + chrome.runtime.lastError.message + ". Reload the Gradescope page.";
          out.className = "empty";
          return;
        }
        const payload = results && results[0] && results[0].result;
        if (payload) {
          chrome.storage.local.set({ [QUIZ_STORAGE_KEY]: payload }, load);
        } else {
          load();
        }
      }
    );
  });
});

copyBtn.addEventListener("click", () => {
  const isOpenStax = out._mode === "openstax";
  let toCopy;
  if (isOpenStax) {
    const history = out._lastHistory;
    if (history && history.length > 0) {
      toCopy = history.map((e) => `[${e.seenAt}] ${e.text}`).join("\n\n");
    } else {
      toCopy = (out._lastData && out._lastData.fullText) || "";
    }
  } else {
    toCopy = JSON.stringify(out._lastData, null, 2);
  }
  if (!toCopy) { load(); return; }
  navigator.clipboard.writeText(toCopy).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = isOpenStax ? "Copy text" : "Copy JSON"; }, 1500);
  });
});

classifyBtn.addEventListener("click", () => runClassification());

load();
