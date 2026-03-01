(function () {
  const QUIZ_STORAGE_KEY = "gradescope_quiz_data";
  const OPENSTAX_STORAGE_KEY = "openstax_page_data";
  const OPENSTAX_HISTORY_KEY = "openstax_reading_history";
  const OPENSTAX_SECTION_VIEWED_KEY = "openstax_section_viewed";
  const SECTION_MASTERY_VIEWED_KEY = "section_mastery_sectionsViewed";
  const SECTION_MASTERY_CONCEPT_KEY = "section_mastery_lastConceptLabel";
  const CLASSIFY_RESULT_KEY = "classify_last_result";
  const STUDY_MODE_KEY = "study_mode";
  const SECTIONS_REQUIRED_FOR_BOOST = 3;
  let openStaxVisibleBuffer = new Set();
  let viewedSectionsHistory = [];
  let viewedSectionsSet = new Set();
  let currentViewportObserver = null;
  let currentMutationObserver = null;
  let lastObservedUrl = null;
  let lastSavedSectionKey = "";
  const SCROLL_BAND_PX = 250;
  let lastScrollBand = -1;

  // Guard: avoid "Extension context invalidated" when extension was reloaded while page is open
  function safeStorageSet(obj) {
    try {
      chrome.storage.local.set(obj);
    } catch (_) {
      // Extension context invalidated or chrome unavailable
    }
  }

  function isOpenStaxPage() {
    return /^https:\/\/openstax\.org\//.test(window.location.href);
  }

  const OPENSTAX_SKIP_PATTERNS = /citation|attribution|order a print|© |creative commons|skip to content/i;
  const OPENSTAX_VISIBLE_THRESHOLD = 0.5;
  const OPENSTAX_SELECTORS = ".os-content p, .os-content h2, .os-content h3, .os-content h4, main p, main h2, main h3, main h4, [role='main'] p, [role='main'] h2, [role='main'] h3, [role='main'] h4";
  const OPENSTAX_HEADING_TAGS = /^H[2-4]$/i;
  const OPENSTAX_SIDEBAR_SELECTORS = "nav, aside, [role='navigation'], .toc, .sidebar, .nav, [class*='toc'], [class*='sidebar'], [class*='navigation']";

  function isInsideSidebarOrNav(el) {
    if (!el || !el.closest) return false;
    try {
      return !!el.closest(OPENSTAX_SIDEBAR_SELECTORS);
    } catch (_) {
      return false;
    }
  }

  function getPageTitle() {
    const titleEl = document.querySelector("main h1, .os-content h1, h1");
    return titleEl ? titleEl.textContent.trim() : document.title;
  }

  function saveVisibleOpenStaxPayload(activeText) {
    try {
      const payload = {
        url: window.location.href,
        title: getPageTitle(),
        extractedAt: new Date().toISOString(),
        fullText: activeText,
        sections: [{ heading: "Visible on screen", content: activeText }],
        visibleOnly: true,
      };
      safeStorageSet({ [OPENSTAX_STORAGE_KEY]: payload });
      return payload;
    } catch (_) {
      return null;
    }
  }

  function addToHistory(text) {
    if (!text || viewedSectionsSet.has(text)) return;
    viewedSectionsSet.add(text);
    viewedSectionsHistory.push({ text, seenAt: new Date().toISOString(), url: window.location.href, title: getPageTitle() });
    try {
      safeStorageSet({ [OPENSTAX_HISTORY_KEY]: viewedSectionsHistory });
    } catch (_) {}
  }

  function getVisibleRatio(el) {
    const rect = el.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const viewWidth = window.innerWidth;
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewHeight);
    const visibleLeft = Math.max(rect.left, 0);
    const visibleRight = Math.min(rect.right, viewWidth);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    if (!rect.height || !rect.width) return 0;
    return (visibleHeight * visibleWidth) / (rect.height * rect.width);
  }

  function getCurrentlyVisibleOpenStaxText() {
    const elements = document.querySelectorAll(OPENSTAX_SELECTORS);
    const inMainOnly = [];
    elements.forEach((el) => {
      if (isInsideSidebarOrNav(el)) return;
      const text = (el.innerText || el.textContent || "").trim();
      if (!text || OPENSTAX_SKIP_PATTERNS.test(text)) return;
      const ratio = getVisibleRatio(el);
      if (ratio < OPENSTAX_VISIBLE_THRESHOLD) return;
      inMainOnly.push({ text, top: el.getBoundingClientRect().top });
    });
    if (inMainOnly.length === 0) return "";
    inMainOnly.sort((a, b) => a.top - b.top);
    return inMainOnly.map((x) => x.text).join("\n\n");
  }

  function observeNewElements(observer) {
    const allElements = document.querySelectorAll(OPENSTAX_SELECTORS);
    allElements.forEach((el) => {
      if (!el._openstaxObserved) {
        el._openstaxObserved = true;
        observer.observe(el);
      }
    });
  }

  function clearOpenStaxState() {
    if (currentViewportObserver) {
      currentViewportObserver.disconnect();
      currentViewportObserver = null;
    }
    if (currentMutationObserver) {
      currentMutationObserver.disconnect();
      currentMutationObserver = null;
    }
    openStaxVisibleBuffer.clear();
    viewedSectionsHistory = [];
    viewedSectionsSet.clear();
    try {
      chrome.storage.local.remove(OPENSTAX_STORAGE_KEY);
    } catch (_) {}
  }

  function setupOpenStaxVisibleObserver() {
    // Tear down previous observers if re-initializing after SPA navigation
    if (currentViewportObserver) currentViewportObserver.disconnect();
    if (currentMutationObserver) currentMutationObserver.disconnect();

    openStaxVisibleBuffer.clear();
    viewedSectionsHistory = [];
    viewedSectionsSet.clear();
    let studyTimer = null;
    lastObservedUrl = window.location.href;

    const viewportObserver = new IntersectionObserver(() => {
      clearTimeout(studyTimer);
      studyTimer = setTimeout(() => {
        const activeText = getCurrentlyVisibleOpenStaxText();
        const scrollBand = Math.floor(window.scrollY / SCROLL_BAND_PX) * SCROLL_BAND_PX;
        const textKey = activeText ? activeText.replace(/\s+/g, " ").slice(0, 300) : "";
        const sectionKey = textKey || String(scrollBand);
        const keyChanged = sectionKey !== lastSavedSectionKey;
        const bandChanged = scrollBand !== lastScrollBand;
        const willFire = sectionKey && (keyChanged || bandChanged);
        console.log("[OpenStax Sections] scrollY=" + window.scrollY + " scrollBand=" + scrollBand + " activeTextLen=" + (activeText ? activeText.length : 0) + " textKeyLen=" + textKey.length + " sectionKeyChanged=" + keyChanged + " bandChanged=" + bandChanged + " willFire=" + willFire + " lastBand=" + lastScrollBand);
        if (activeText) saveVisibleOpenStaxPayload(activeText);
        if (willFire) {
          lastSavedSectionKey = sectionKey;
          lastScrollBand = scrollBand;
          try {
            chrome.storage.local.get(
              [CLASSIFY_RESULT_KEY, SECTION_MASTERY_VIEWED_KEY, SECTION_MASTERY_CONCEPT_KEY],
              (data) => {
                const result = data[CLASSIFY_RESULT_KEY];
                const nodeLabel = result && result.nodeLabel;
                let viewed = typeof data[SECTION_MASTERY_VIEWED_KEY] === "number" ? data[SECTION_MASTERY_VIEWED_KEY] : 0;
                const lastConceptLabel = data.section_mastery_lastConceptLabel;
                if (lastConceptLabel !== nodeLabel) viewed = 0;
                viewed += 1;
                const payload = {
                  [SECTION_MASTERY_VIEWED_KEY]: viewed,
                  section_mastery_lastConceptLabel: nodeLabel || lastConceptLabel || "",
                  [OPENSTAX_SECTION_VIEWED_KEY]: false,
                };
                chrome.storage.local.set(payload, () => {
                  console.log("[OpenStax Sections] sections viewed=" + viewed + " (wrote to storage)");
                  if (viewed >= SECTIONS_REQUIRED_FOR_BOOST && nodeLabel) {
                    chrome.runtime.sendMessage({ type: "APPLY_MASTERY_BOOST", nodeLabel }, () => {});
                  }
                });
              }
            );
          } catch (e) {
            console.warn("[OpenStax Sections] storage failed", e);
          }
        }
      }, 800);
    }, { root: null, rootMargin: "0px", threshold: OPENSTAX_VISIBLE_THRESHOLD });

    currentViewportObserver = viewportObserver;
    observeNewElements(viewportObserver);

    // Watch for dynamically added content (SPA content loading)
    const mutationObserver = new MutationObserver(() => {
      observeNewElements(viewportObserver);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    currentMutationObserver = mutationObserver;

    const initialText = getCurrentlyVisibleOpenStaxText();
    if (initialText) saveVisibleOpenStaxPayload(initialText);
    lastScrollBand = Math.floor(window.scrollY / SCROLL_BAND_PX) * SCROLL_BAND_PX;
    lastSavedSectionKey = initialText ? initialText.replace(/\s+/g, " ").slice(0, 300) : String(lastScrollBand);
    console.log("[OpenStax Sections] setup done scrollY=" + window.scrollY + " lastScrollBand=" + lastScrollBand + " initialTextLen=" + (initialText ? initialText.length : 0));
  }

  // Re-initialize observer when OpenStax SPA navigates to a new section/chapter
  function watchForSpaNavigation() {
    const check = () => {
      if (window.location.href !== lastObservedUrl) {
        clearOpenStaxState();
        lastObservedUrl = window.location.href;
        setTimeout(setupOpenStaxVisibleObserver, 1200);
      }
    };
    // Patch pushState/replaceState since OpenStax uses the History API
    ["pushState", "replaceState"].forEach((fn) => {
      const original = history[fn];
      history[fn] = function (...args) {
        original.apply(this, args);
        check();
      };
    });
    window.addEventListener("popstate", check);
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
    safeStorageSet({ [QUIZ_STORAGE_KEY]: payload });
    return payload;
  }

  window.__gradescopeQuizExtract = function () {
    const out = runExtraction();
    console.log("Gradescope Quiz Reader:", out);
    return out;
  };

  window.__openstaxExtract = function () {
    const activeText = getCurrentlyVisibleOpenStaxText();
    const out = saveVisibleOpenStaxPayload(activeText);
    console.log("OpenStax visible extract:", out);
    return out;
  };

  function startFeatures() {
    if (isOpenStaxPage()) {
      setupOpenStaxVisibleObserver();
      watchForSpaNavigation();
    } else {
      runExtraction();
    }
  }

  function stopFeatures() {
    if (!isOpenStaxPage()) return;
    if (currentViewportObserver) {
      currentViewportObserver.disconnect();
      currentViewportObserver = null;
    }
    if (currentMutationObserver) {
      currentMutationObserver.disconnect();
      currentMutationObserver = null;
    }
  }

  try {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg !== "EXTRACT" && msg !== "EXTRACT_OPENSTAX") return;
      chrome.storage.local.get([STUDY_MODE_KEY], (data) => {
        if (data[STUDY_MODE_KEY] !== true) {
          sendResponse(null);
          return;
        }
        try {
          if (msg === "EXTRACT") {
            if (isOpenStaxPage()) {
              sendResponse(saveVisibleOpenStaxPayload(getCurrentlyVisibleOpenStaxText()));
            } else {
              sendResponse(runExtraction());
            }
          } else if (msg === "EXTRACT_OPENSTAX") {
            sendResponse(saveVisibleOpenStaxPayload(getCurrentlyVisibleOpenStaxText()));
          }
        } catch (_) {
          sendResponse(null);
        }
      });
      return true;
    });

    chrome.storage.local.get([STUDY_MODE_KEY], (data) => {
      if (data[STUDY_MODE_KEY] === true) startFeatures();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes[STUDY_MODE_KEY]) return;
      const enabled = changes[STUDY_MODE_KEY].newValue === true;
      if (enabled) startFeatures();
      else stopFeatures();
    });
  } catch (_) {
    // Extension context invalidated at load time (e.g. extension reloaded before script ran)
  }
})();
