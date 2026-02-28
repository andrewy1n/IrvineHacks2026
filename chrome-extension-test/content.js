(function () {
  const QUIZ_STORAGE_KEY = "gradescope_quiz_data";
  const PDF_STORAGE_KEY = "pdf_text_data";

  function isPdfViewerPage() {
    if (window.location.protocol !== "file:") return false;
    const path = (window.location.pathname || "").toLowerCase();
    return path.endsWith(".pdf");
  }

  function extractPdfText() {
    const pages = [];
    let fullText = "";
    const viewer = document.getElementById("viewer");
    const root = viewer || document.body;
    const pageEls = root.querySelectorAll(".page");
    if (pageEls.length > 0) {
      pageEls.forEach((page, i) => {
        const textLayer = page.querySelector(".textLayer, [class*='textLayer']");
        const t = textLayer ? textLayer.textContent || "" : "";
        const trimmed = t.replace(/\s+/g, " ").trim();
        pages.push({ pageIndex: i + 1, text: trimmed });
        fullText += (fullText ? "\n\n" : "") + trimmed;
      });
    } else {
      const textLayers = root.querySelectorAll(".textLayer, [class*='textLayer']");
      if (textLayers.length > 0) {
        textLayers.forEach((el, i) => {
          const t = (el.textContent || "").replace(/\s+/g, " ").trim();
          pages.push({ pageIndex: i + 1, text: t });
          fullText += (fullText ? "\n\n" : "") + t;
        });
      } else {
        const spans = root.querySelectorAll("#viewer span[role='presentation']");
        if (spans.length > 0) {
          const byPage = {};
          spans.forEach((span) => {
            const page = span.closest(".page") || span.closest("[class*='page']");
            const key = page ? page.getAttribute("data-page-number") || "1" : "1";
            if (!byPage[key]) byPage[key] = [];
            byPage[key].push(span.textContent || "");
          });
          const keys = Object.keys(byPage).sort((a, b) => Number(a) - Number(b));
          keys.forEach((key, i) => {
            const t = byPage[key].join(" ").replace(/\s+/g, " ").trim();
            pages.push({ pageIndex: i + 1, text: t });
            fullText += (fullText ? "\n\n" : "") + t;
          });
        }
      }
    }
    const payload = {
      url: window.location.href,
      title: document.title || (window.location.pathname || "").split("/").pop() || "PDF",
      extractedAt: new Date().toISOString(),
      fullText: fullText.trim(),
      pages,
    };
    chrome.storage.local.set({ [PDF_STORAGE_KEY]: payload });
    return payload;
  }

  function text(el) {
    if (!el) return "";
    return (el.textContent || "").trim();
  }

  function trySelector(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (_) {
      return [];
    }
  }

  function extractGradescope() {
    const blocks = document.querySelectorAll(".question--radioInput");
    if (blocks.length === 0) return null;
    const questions = [];
    for (const block of blocks) {
      const radiogroup = block.querySelector('[role="radiogroup"]');
      if (!radiogroup || !radiogroup.id) continue;
      const match = radiogroup.id.match(/questions_(\d+)__(\d+)_/);
      if (!match) continue;
      const [, questionId, index] = match;
      const textEl = document.getElementById(`question_${questionId}_text_${index}`);
      const questionText = textEl
        ? text(textEl.querySelector(".markdownText") || textEl)
        : text(block.querySelector(".question--radioInput--groupLabel")) || "";
      const choiceSpans = block.querySelectorAll(".form--choice");
      let selectedIndex = null;
      const choices = Array.from(choiceSpans).map((span, i) => {
        const input = span.querySelector("input[type=radio]");
        if (input && input.checked) selectedIndex = i;
        const label = span.querySelector(".markdownText-inline");
        return label ? text(label) : (input?.value ?? "");
      }).filter(Boolean);
      questions.push({ question: questionText, choices, selectedIndex });
    }
    return questions.length ? questions : null;
  }

  function extractByQuestions() {
    const selectors = [
      ".question",
      "[data-question]",
      ".problem",
      ".quizQuestion",
      ".assignmentQuestion",
      ".questionContainer",
      "li.question",
      "[class*='question']",
      ".submissionQuestion",
    ];
    for (const sel of selectors) {
      const nodes = trySelector(sel);
      if (nodes.length > 0) {
        return Array.from(nodes).map((q) => {
          const prompt = q.querySelector(".prompt, .questionText, .text, [class*='prompt'], [class*='question-text']") || q;
          const options = q.querySelectorAll(".option, .choice, .answer, [class*='option'], [class*='choice'], input[type='radio'] + label, input[type='checkbox'] + label");
          return {
            question: text(prompt),
            choices: Array.from(options).map((o) => text(o)),
            node: q.className,
          };
        });
      }
    }
    return null;
  }

  function extractByForm() {
    const form = document.querySelector("form[action*='submit'], form.quizForm, form");
    if (!form) return null;
    const blocks = form.querySelectorAll(".formGroup, .questionBlock, fieldset, [class*='question'], .problem");
    if (blocks.length === 0) {
      const labels = form.querySelectorAll("label");
      const inputs = form.querySelectorAll("input[type='text'], input[type='radio'], input[type='checkbox'], textarea");
      if (labels.length || inputs.length) {
        return [{
          question: "Form (single block)",
          choices: Array.from(labels).map((l) => text(l)),
          rawInputs: inputs.length,
        }];
      }
      return null;
    }
    return Array.from(blocks).map((b) => {
      const prompt = b.querySelector("label, .prompt, .questionText, legend, [class*='question']") || b;
      const opts = b.querySelectorAll("label, .option, .choice");
      return {
        question: text(prompt).slice(0, 500),
        choices: Array.from(opts).map((o) => text(o)).filter(Boolean),
        node: b.className,
      };
    });
  }

  function extractByStructure() {
    const main = document.querySelector("main, .mainContent, #main, .content, .assignmentContent, [role='main']") || document.body;
    const headings = main.querySelectorAll("h1, h2, h3, h4, .questionTitle, [class*='question']");
    const result = [];
    headings.forEach((h) => {
      const q = text(h);
      if (q.length < 10) return;
      let next = h.nextElementSibling;
      const choices = [];
      while (next && !next.matches("h1, h2, h3, h4")) {
        const t = text(next);
        if (t) choices.push(t.slice(0, 300));
        next = next.nextElementSibling;
      }
      result.push({ question: q, choices });
    });
    return result.length ? result : null;
  }

  function runExtraction() {
    let data = extractGradescope();
    if (!data || data.length === 0) data = extractByQuestions();
    if (!data || data.length === 0) data = extractByForm();
    if (!data || data.length === 0) data = extractByStructure();
    const payload = {
      url: window.location.href,
      title: document.title,
      extractedAt: new Date().toISOString(),
      questions: data || [],
    };
    chrome.storage.local.set({ [QUIZ_STORAGE_KEY]: payload });
    return payload;
  }

  window.__gradescopeQuizExtract = function () {
    const out = runExtraction();
    console.log("Gradescope Quiz Reader:", out);
    return out;
  };

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg === "EXTRACT") {
      sendResponse(isPdfViewerPage() ? extractPdfText() : runExtraction());
    } else if (msg === "EXTRACT_PDF") {
      sendResponse(extractPdfText());
    }
  });

  window.__extractPdfText = extractPdfText;

  if (isPdfViewerPage()) {
    let attempts = 0;
    function tryPdf() {
      const result = extractPdfText();
      if (!result.fullText && (!result.pages || !result.pages.length) && attempts < 3) {
        attempts += 1;
        setTimeout(tryPdf, 1500);
      }
    }
    tryPdf();
  } else {
    runExtraction();
  }
})();
