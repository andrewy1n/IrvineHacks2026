const QUIZ_STORAGE_KEY = "gradescope_quiz_data";
const PDF_STORAGE_KEY = "pdf_text_data";
const out = document.getElementById("out");
const refreshBtn = document.getElementById("refresh");
const copyBtn = document.getElementById("copy");

function isPdfTabUrl(url) {
  if (!url || url.indexOf("file:") !== 0) return false;
  return url.toLowerCase().endsWith(".pdf");
}

function showQuiz(data) {
  copyBtn.textContent = "Copy JSON";
  if (!data || !data.questions || data.questions.length === 0) {
    out.textContent = "No quiz structure detected. Open a Gradescope quiz page and click Refresh.";
    out.className = "empty";
    out._mode = "quiz";
    out._lastData = data;
    return;
  }
  out.className = "";
  out._mode = "quiz";
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

function showPdf(data) {
  copyBtn.textContent = "Copy text";
  if (!data || (!data.fullText && (!data.pages || !data.pages.length))) {
    out.textContent = "No PDF text yet. Open a local PDF (file://...) and click Refresh. Enable \"Allow access to file URLs\" for this extension if needed.";
    out.className = "empty";
    out._mode = "pdf";
    out._lastData = data;
    return;
  }
  out.className = "";
  out._mode = "pdf";
  const preview = (data.fullText || "").slice(0, 8000);
  out.textContent = `PDF: ${data.title || "Untitled"}\nPages: ${(data.pages && data.pages.length) || 0}\n\n${preview}${(data.fullText && data.fullText.length > 8000) ? "\n\n… (truncated)" : ""}`;
  out._lastData = data;
}

function load() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const pdfMode = tab && tab.url && isPdfTabUrl(tab.url);
    const keys = pdfMode ? [PDF_STORAGE_KEY] : [QUIZ_STORAGE_KEY];
    chrome.storage.local.get(keys, (res) => {
      if (pdfMode) showPdf(res[PDF_STORAGE_KEY] || null);
      else showQuiz(res[QUIZ_STORAGE_KEY] || null);
    });
  });
}

refreshBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;
    if (isPdfTabUrl(tab.url)) {
      chrome.tabs.sendMessage(tab.id, "EXTRACT_PDF", (payload) => {
        if (chrome.runtime.lastError) {
          out.textContent = "Error: " + chrome.runtime.lastError.message + ". Reload the PDF tab and ensure \"Allow access to file URLs\" is on for this extension.";
          out.className = "empty";
          return;
        }
        if (payload) chrome.storage.local.set({ [PDF_STORAGE_KEY]: payload });
        showPdf(payload || null);
      });
      return;
    }
    if (!tab.url.includes("gradescope.com")) {
      out.textContent = "Open a Gradescope quiz or a local PDF tab and try again.";
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
        if (payload) chrome.storage.local.set({ [QUIZ_STORAGE_KEY]: payload }, load);
        else load();
      }
    );
  });
});

copyBtn.addEventListener("click", () => {
  if (!out._lastData) {
    load();
    return;
  }
  const isPdf = out._mode === "pdf";
  const toCopy = isPdf ? (out._lastData.fullText || "") : JSON.stringify(out._lastData, null, 2);
  navigator.clipboard.writeText(toCopy).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = isPdf ? "Copy text" : "Copy JSON"; }, 1500);
  });
});

load();
