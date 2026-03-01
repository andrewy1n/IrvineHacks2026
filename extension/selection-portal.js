(function () {
  // --- ADDED: storage keys and defaults ---
  const STORAGE_KEYS = {
    sidebarOpen: "solveSync_sidebarOpen",
    sidebarWidth: "solveSync_sidebarWidth",
    sidebarShowVisibleSection: "solveSync_sidebarShowVisibleSection",
  };
  const OPENSTAX_STORAGE_KEY = "openstax_page_data";
  const QUIZ_STORAGE_KEY = "gradescope_quiz_data";
  const CLASSIFY_PENDING_KEY = "classify_pending_text";
  const CLASSIFY_RESULT_KEY = "classify_last_result";
  const SECTION_MASTERY_VIEWED_KEY = "section_mastery_sectionsViewed";
  const STUDY_MODE_KEY = "study_mode";
  const SOLVE_SYNC_PROBLEMS_KEY = "solveSync_problems";
  const PROBLEMS_NODE_ID = "__problems__";
  const PROBLEMS_LABEL = "Problems";
  const SIDEBAR_WIDTH_MIN = 320;
  const SIDEBAR_WIDTH_MAX = 450;
  const SIDEBAR_WIDTH_DEFAULT = 380;
  const AUTO_CLASSIFY_FIRST_PARAGRAPH_MAX_CHARS = 600;

  let fab = null;
  let toggleFab = null;
  let overlayHost = null;
  let sidebarHost = null;
  let lastSelection = "";
  let sidebarWidth = SIDEBAR_WIDTH_DEFAULT;
  let sidebarOpen = false;
  let studyModeEnabled = false;
  let sidebarShowVisibleSection = true;

  // Guard: avoid "Extension context invalidated" when extension was reloaded
  function safeStorageGet(keys, cb) {
    try {
      chrome.storage.local.get(keys, (data) => {
        try {
          if (typeof cb === "function") cb(data);
        } catch (_) {}
      });
    } catch (_) {
      if (typeof cb === "function") cb({});
    }
  }
  function safeStorageSet(obj) {
    try {
      chrome.storage.local.set(obj);
    } catch (_) {}
  }
  function safeSendMessage(msg, cb) {
    try {
      chrome.runtime.sendMessage(msg, (response) => {
        try {
          if (typeof cb === "function") cb(response);
        } catch (_) {}
      });
    } catch (_) {
      if (typeof cb === "function") cb({ error: "Extension context invalidated" });
    }
  }

  function getSelectionText() {
    let doc = document;
    try {
      const active = document.activeElement;
      if (active && active.tagName === "IFRAME" && active.contentDocument) doc = active.contentDocument;
    } catch (_) {}
    const sel = doc.getSelection ? doc.getSelection() : (window.getSelection && window.getSelection());
    return sel ? sel.toString().trim() : "";
  }

  function getFirstSectionText(source) {
    if (!source) return null;
    try {
      if (source.fullText) {
        const raw = (source.fullText || "").trim();
        const firstParagraph = raw.split(/\n\s*\n/)[0].trim();
        const t = firstParagraph.slice(0, AUTO_CLASSIFY_FIRST_PARAGRAPH_MAX_CHARS);
        return t.length >= 10 ? t : null;
      }
      if (source.questions && source.questions.length) {
        const q = source.questions[0];
        const questionOnly = (q.question || "").trim().slice(0, AUTO_CLASSIFY_FIRST_PARAGRAPH_MAX_CHARS);
        return questionOnly.length >= 10 ? questionOnly : null;
      }
    } catch (_) {}
    return null;
  }

  function triggerAutoClassify(source) {
    const text = getFirstSectionText(source);
    if (!text) return;
    try {
      chrome.storage.local.set({ [CLASSIFY_PENDING_KEY]: text }, () => {
        const url = chrome.runtime.getURL("classify.html?auto=1");
        safeSendMessage({ type: "OPEN_TAB", url }, () => {});
      });
    } catch (_) {}
  }

  function loadPersistedState(cb) {
    safeStorageGet([STORAGE_KEYS.sidebarOpen, STORAGE_KEYS.sidebarWidth, STORAGE_KEYS.sidebarShowVisibleSection], (data) => {
      try {
        sidebarOpen = data[STORAGE_KEYS.sidebarOpen] !== false;
        const w = data[STORAGE_KEYS.sidebarWidth];
        sidebarWidth = typeof w === "number" && w >= SIDEBAR_WIDTH_MIN && w <= SIDEBAR_WIDTH_MAX ? w : SIDEBAR_WIDTH_DEFAULT;
        sidebarShowVisibleSection = data[STORAGE_KEYS.sidebarShowVisibleSection] !== false;
        if (typeof cb === "function") cb();
      } catch (_) {}
    });
  }

  function saveSidebarShowVisibleSection(show) {
    sidebarShowVisibleSection = show;
    safeStorageSet({ [STORAGE_KEYS.sidebarShowVisibleSection]: show });
  }

  function saveSidebarOpen(open) {
    sidebarOpen = open;
    safeStorageSet({ [STORAGE_KEYS.sidebarOpen]: open });
  }

  function saveSidebarWidth(w) {
    sidebarWidth = w;
    safeStorageSet({ [STORAGE_KEYS.sidebarWidth]: w });
  }

  function createFAB() {
    if (fab) return fab;
    const host = document.createElement("div");
    host.id = "solve-sync-fab-host";
    host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      .fab {
        position: fixed;
        z-index: 2147483646;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .fab:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
      }
      .fab:active { transform: scale(0.98); }
      .fab svg { width: 22px; height: 22px; }
      .fab { pointer-events: auto; }
    `;
    const btn = document.createElement("button");
    btn.className = "fab";
    btn.setAttribute("aria-label", "Solve & Sync");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      <path d="M12 3v9"/>
      <path d="M12 12l4.24 4.24"/>
    </svg>`;
    shadow.appendChild(style);
    shadow.appendChild(btn);
    document.body.appendChild(host);
    fab = { host, btn, shadow };
    return fab;
  }

  function showFAB(clientX, clientY) {
    const text = getSelectionText();
    if (!text) {
      hideFAB();
      return;
    }
    lastSelection = text;
    const { host, btn } = createFAB();
    const padding = 12;
    let x = clientX + padding;
    let y = clientY + padding;
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    x = Math.min(x, maxX);
    y = Math.min(y, maxY);
    x = Math.max(8, x);
    y = Math.max(8, y);
    btn.style.left = x + "px";
    btn.style.top = y + "px";
    host.style.display = "";
    btn.onclick = (e) => {
      e.stopPropagation();
      openOverlay(lastSelection);
      hideFAB();
    };
  }

  function hideFAB() {
    if (fab && fab.host) fab.host.style.display = "none";
  }

  // Toggle FAB (bottom-right): host only covers button area so clicks are received
  function createToggleFAB() {
    if (toggleFab) return toggleFab;
    const host = document.createElement("div");
    host.id = "solve-sync-toggle-fab-host";
    host.style.cssText = "position:fixed;right:20px;bottom:20px;width:44px;height:44px;z-index:2147483646;";
    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      .fab {
        position: absolute;
        inset: 0;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .fab:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
      }
      .fab:active { transform: scale(0.98); }
      .fab svg { width: 22px; height: 22px; }
    `;
    const btn = document.createElement("button");
    btn.className = "fab";
    btn.setAttribute("aria-label", "Toggle Solve & Sync sidebar");
    btn.type = "button";
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (sidebarOpen) closeSidebar(); else openSidebar();
    });
    shadow.appendChild(style);
    shadow.appendChild(btn);
    document.body.appendChild(host);
    toggleFab = { host, btn, shadow };
    return toggleFab;
  }

  function getSidebarWidthPx() {
    return Math.max(SIDEBAR_WIDTH_MIN, Math.min(SIDEBAR_WIDTH_MAX, sidebarWidth));
  }

  function openSidebar() {
    try {
      if (!sidebarHost) createSidebar();
      if (!sidebarHost) return;
      const root = sidebarHost.shadowRoot;
      if (root) {
        const inner = root.querySelector(".sidebar-inner");
        if (inner) inner.style.width = getSidebarWidthPx() + "px";
      }
      sidebarHost.style.display = "block";
      sidebarHost.style.width = getSidebarWidthPx() + "px";
      sidebarOpen = true;
      saveSidebarOpen(true);
      if (sidebarShowVisibleSection && sidebarHost.refreshVisibleText) sidebarHost.refreshVisibleText();
    } catch (_) {}
  }

  function closeSidebar() {
    if (sidebarHost) sidebarHost.style.display = "none";
    sidebarOpen = false;
    saveSidebarOpen(false);
  }

  // Sidebar: separate component (resizable panel, header + empty body). No Solve & Sync.
  function createSidebar() {
    if (sidebarHost) return;
    const host = document.createElement("div");
    host.id = "solve-sync-sidebar-host";
    host.style.cssText = "position:fixed;top:0;right:0;bottom:0;z-index:2147483644;display:none;";
    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      .sidebar-rail {
        position: absolute;
        top: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: row;
      }
      .resize-handle {
        width: 6px;
        min-width: 6px;
        cursor: ew-resize;
        background: transparent;
        flex-shrink: 0;
      }
      .sidebar-inner {
        height: 100%;
        background: #fff;
        box-shadow: -4px 0 24px rgba(0,0,0,0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        min-width: 0;
      }
      .sidebar-header {
        padding: 14px 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .sidebar-title { font-size: 14px; font-weight: 600; color: #111; margin: 0; }
      .close-btn {
        width: 32px; height: 32px;
        border: none; background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: #6b7280;
        display: flex; align-items: center; justify-content: center;
      }
      .close-btn:hover { background: #f3f4f6; color: #111; }
      .sidebar-body { flex: 1; min-height: 0; overflow: auto; }
      .sidebar-toggle-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 16px; border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0; gap: 10px;
      }
      .sidebar-toggle-label { font-size: 12px; color: #374151; margin: 0; }
      .sidebar-toggle-switch {
        position: relative; width: 36px; height: 20px;
        background: #ddd; border-radius: 10px; cursor: pointer; flex-shrink: 0;
        transition: background 0.2s;
      }
      .sidebar-toggle-switch.on { background: #1a73e8; }
      .sidebar-toggle-switch::after {
        content: ""; position: absolute; top: 2px; left: 2px;
        width: 16px; height: 16px; background: white; border-radius: 50%;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: transform 0.2s;
      }
      .sidebar-toggle-switch.on::after { transform: translateX(16px); }
      .sidebar-concept-mastery {
        padding: 12px 16px; margin: 0;
        background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
        border-bottom: 1px solid #99f6e4;
        flex-shrink: 0;
      }
      .sidebar-concept-mastery .concept-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f766e; margin-bottom: 4px; }
      .sidebar-concept-mastery .concept-value { font-size: 14px; font-weight: 600; color: #134e4a; margin-bottom: 10px; }
      .sidebar-concept-mastery .mastery-row { display: flex; align-items: center; gap: 8px; }
      .sidebar-concept-mastery .mastery-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f766e; }
      .sidebar-concept-mastery .mastery-bar-wrap { flex: 1; height: 8px; background: #ccfbf1; border-radius: 4px; overflow: hidden; }
      .sidebar-concept-mastery .mastery-bar { height: 100%; background: #0d9488; border-radius: 4px; transition: width 0.2s; }
      .sidebar-concept-mastery .mastery-pct { font-size: 12px; font-weight: 600; color: #134e4a; min-width: 2.5em; }
      .visible-text-section {
        border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
        display: flex; flex-direction: column; overflow: hidden;
      }
      .visible-text-preview {
        max-height: 180px; overflow-y: auto; padding: 10px 16px;
        font-size: 12px; line-height: 1.4; color: #374151;
        background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        white-space: pre-wrap; word-break: break-word;
      }
      .visible-text-preview.empty { color: #9ca3af; font-style: italic; }
      .sidebar-classify-wrap { padding: 10px 16px; }
      .sidebar-classify-btn {
        width: 100%; padding: 8px 12px; font-size: 12px;
        background: #0d9488; color: white; border: none; border-radius: 6px;
        cursor: pointer;
      }
      .sidebar-classify-btn:hover { background: #0f766e; }
      .sidebar-classify-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .sidebar-classify-result {
        padding: 10px 16px; font-size: 12px; line-height: 1.4;
        color: #374151; background: #f0fdf4; border-top: 1px solid #bbf7d0;
        white-space: pre-wrap; word-break: break-word; min-height: 2.5em;
      }
      .sidebar-classify-result.error { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
      .sidebar-classify-result.pending { background: #f9fafb; border-color: #e5e7eb; color: #6b7280; font-style: italic; }
      .sidebar-sections-scrolled {
        padding: 6px 16px; font-size: 12px; color: #0f766e;
        background: #f0fdfa; border-bottom: 1px solid #99f6e4;
      }
      .sidebar-problems {
        padding: 12px 16px; margin: 0;
        background: #fefce8; border-bottom: 1px solid #fde047;
        flex-shrink: 0;
      }
      .sidebar-problems .problems-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; margin-bottom: 8px; font-weight: 600; }
      .sidebar-problems .problems-list { max-height: 160px; overflow-y: auto; font-size: 12px; }
      .sidebar-problems .problem-item {
        padding: 8px 0; border-bottom: 1px solid #fef08a;
        color: #374151; line-height: 1.35;
      }
      .sidebar-problems .problem-item:last-child { border-bottom: none; }
      .sidebar-problems .problem-question { color: #1f2937; margin-bottom: 4px; }
      .sidebar-problems .problem-meta { font-size: 11px; color: #6b7280; }
      .sidebar-problems .problems-empty { color: #9ca3af; font-style: italic; padding: 8px 0; }
    `;

    const rail = document.createElement("div");
    rail.className = "sidebar-rail";

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    resizeHandle.setAttribute("aria-label", "Resize sidebar");

    const inner = document.createElement("div");
    inner.className = "sidebar-inner";
    inner.style.width = getSidebarWidthPx() + "px";

    const header = document.createElement("div");
    header.className = "sidebar-header";
    header.innerHTML = `<h2 class="sidebar-title">Sidebar</h2>`;
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    closeBtn.onclick = closeSidebar;
    header.appendChild(closeBtn);

    const toggleRow = document.createElement("div");
    toggleRow.className = "sidebar-toggle-row";
    const toggleLabel = document.createElement("span");
    toggleLabel.className = "sidebar-toggle-label";
    toggleLabel.textContent = "Show current text";
    const toggleSwitch = document.createElement("div");
    toggleSwitch.className = "sidebar-toggle-switch" + (sidebarShowVisibleSection ? " on" : "");
    toggleSwitch.setAttribute("role", "switch");
    toggleSwitch.setAttribute("aria-checked", sidebarShowVisibleSection);
    toggleSwitch.addEventListener("click", () => {
      const next = !sidebarShowVisibleSection;
      saveSidebarShowVisibleSection(next);
      toggleSwitch.classList.toggle("on", next);
      toggleSwitch.setAttribute("aria-checked", next);
      visibleTextSection.style.display = next ? "" : "none";
      if (next) refreshSidebarVisibleText();
    });
    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(toggleSwitch);

    const conceptMasterySection = document.createElement("div");
    conceptMasterySection.className = "sidebar-concept-mastery";
    const conceptLabel = document.createElement("div");
    conceptLabel.className = "concept-label";
    conceptLabel.textContent = "Concept";
    const conceptValue = document.createElement("div");
    conceptValue.className = "concept-value";
    conceptValue.textContent = "—";
    const masteryRow = document.createElement("div");
    masteryRow.className = "mastery-row";
    const masteryLabel = document.createElement("span");
    masteryLabel.className = "mastery-label";
    masteryLabel.textContent = "Mastery";
    const masteryBarWrap = document.createElement("div");
    masteryBarWrap.className = "mastery-bar-wrap";
    const masteryBar = document.createElement("div");
    masteryBar.className = "mastery-bar";
    masteryBar.style.width = "0%";
    const masteryPct = document.createElement("span");
    masteryPct.className = "mastery-pct";
    masteryPct.textContent = "0%";
    masteryBarWrap.appendChild(masteryBar);
    masteryRow.appendChild(masteryLabel);
    masteryRow.appendChild(masteryBarWrap);
    masteryRow.appendChild(masteryPct);
    conceptMasterySection.appendChild(conceptLabel);
    conceptMasterySection.appendChild(conceptValue);
    conceptMasterySection.appendChild(masteryRow);

    const problemsSection = document.createElement("div");
    problemsSection.className = "sidebar-problems";
    const problemsTitle = document.createElement("div");
    problemsTitle.className = "problems-title";
    problemsTitle.textContent = "Problems";
    const problemsListEl = document.createElement("div");
    problemsListEl.className = "problems-list";
    problemsSection.appendChild(problemsTitle);
    problemsSection.appendChild(problemsListEl);

    function refreshProblemsList() {
      safeStorageGet([SOLVE_SYNC_PROBLEMS_KEY], (data) => {
        const list = Array.isArray(data[SOLVE_SYNC_PROBLEMS_KEY]) ? data[SOLVE_SYNC_PROBLEMS_KEY] : [];
        problemsListEl.innerHTML = "";
        if (list.length === 0) {
          const empty = document.createElement("div");
          empty.className = "problems-empty";
          empty.textContent = "No problems yet.";
          problemsListEl.appendChild(empty);
        } else {
          list.forEach((p) => {
            const item = document.createElement("div");
            item.className = "problem-item";
            const q = document.createElement("div");
            q.className = "problem-question";
            q.textContent = (p.question || "").trim() || "(no question)";
            if (q.textContent.length > 60) q.textContent = q.textContent.slice(0, 60) + "…";
            const meta = document.createElement("div");
            meta.className = "problem-meta";
            const score = typeof p.score === "number" ? p.score + "%" : "—";
            const date = p.submittedAt ? new Date(p.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
            meta.textContent = (p.mappedNode || "—") + " · " + score + (date ? " · " + date : "");
            item.appendChild(q);
            item.appendChild(meta);
            problemsListEl.appendChild(item);
          });
        }
      });
    }

    const visibleTextSection = document.createElement("div");
    visibleTextSection.className = "visible-text-section";
    visibleTextSection.style.display = sidebarShowVisibleSection ? "" : "none";
    const visibleTextPreview = document.createElement("div");
    visibleTextPreview.className = "visible-text-preview empty";
    visibleTextPreview.textContent = "No content yet. Open a Gradescope quiz or OpenStax page with study mode on.";
    const sectionsScrolledRow = document.createElement("div");
    sectionsScrolledRow.className = "sidebar-sections-scrolled";
    sectionsScrolledRow.textContent = "Sections scrolled: 0";
    const classifyWrap = document.createElement("div");
    classifyWrap.className = "sidebar-classify-wrap";
    const classifyBtn = document.createElement("button");
    classifyBtn.type = "button";
    classifyBtn.className = "sidebar-classify-btn";
    classifyBtn.textContent = "Classify with AI";
    const refreshKgBtn = document.createElement("button");
    refreshKgBtn.type = "button";
    refreshKgBtn.className = "sidebar-classify-btn sidebar-refresh-kg-btn";
    refreshKgBtn.textContent = "Refresh knowledge graph";
    refreshKgBtn.style.marginTop = "6px";
    const classifyResult = document.createElement("div");
    classifyResult.className = "sidebar-classify-result";
    classifyResult.textContent = "";
    classifyResult.style.display = "none";
    classifyWrap.appendChild(classifyBtn);
    classifyWrap.appendChild(refreshKgBtn);
    classifyWrap.appendChild(classifyResult);
    visibleTextSection.appendChild(visibleTextPreview);
    visibleTextSection.appendChild(sectionsScrolledRow);
    visibleTextSection.appendChild(classifyWrap);

    const body = document.createElement("div");
    body.className = "sidebar-body";

    inner.appendChild(header);
    inner.appendChild(conceptMasterySection);
    inner.appendChild(problemsSection);
    inner.appendChild(toggleRow);
    inner.appendChild(visibleTextSection);
    inner.appendChild(body);

    function isProblemsPage(payload) {
      if (!payload || payload.error || payload.pending) return false;
      return payload.nodeLabel === PROBLEMS_LABEL || payload.nodeId === PROBLEMS_NODE_ID;
    }

    function updateSidebarMode(payload) {
      const showProblems = isProblemsPage(payload);
      problemsSection.style.display = showProblems ? "" : "none";
      conceptMasterySection.style.display = showProblems ? "none" : "";
      toggleRow.style.display = showProblems ? "none" : "";
      visibleTextSection.style.display = showProblems ? "none" : (sidebarShowVisibleSection ? "" : "none");
    }
    updateSidebarMode(null);

    function getTextForClassify() {
      let text = "";
      try {
        const raw = window.__sidebarLastVisibleData;
        if (!raw) return null;
        if (raw.fullText) text = raw.fullText.slice(0, 8000);
        else if (raw.questions && raw.questions.length) {
          text = raw.questions.map((q, i) =>
            `Q${i + 1}: ${(q.question || "")}\n${(q.choices || []).join("\n")}`
          ).join("\n\n");
        }
      } catch (_) {}
      return text && text.length >= 10 ? text : null;
    }

    function updateSectionsScrolledDisplay(count) {
      const n = typeof count === "number" ? count : 0;
      sectionsScrolledRow.textContent = "Sections scrolled: " + n;
    }

    function refreshSidebarVisibleText() {
      safeStorageGet([OPENSTAX_STORAGE_KEY, QUIZ_STORAGE_KEY, SECTION_MASTERY_VIEWED_KEY], (data) => {
        const openstax = data[OPENSTAX_STORAGE_KEY];
        const quiz = data[QUIZ_STORAGE_KEY];
        let preview = "";
        let source = null;
        if (openstax && openstax.fullText) {
          source = openstax;
          preview = (openstax.title || "OpenStax") + "\n\n" + (openstax.fullText || "").slice(0, 3000);
          if ((openstax.fullText || "").length > 3000) preview += "\n\n… (truncated)";
        } else if (quiz && quiz.questions && quiz.questions.length) {
          source = quiz;
          preview = (quiz.title || "Quiz") + "\n\n" + quiz.questions.map((q, i) =>
            `Q${i + 1}: ${(q.question || "").slice(0, 200)}${(q.question || "").length > 200 ? "…" : ""}`
          ).join("\n\n");
        }
        window.__sidebarLastVisibleData = source || null;
        visibleTextPreview.textContent = preview || "No content yet. Open a Gradescope quiz or OpenStax page with study mode on.";
        visibleTextPreview.classList.toggle("empty", !preview);
        updateSectionsScrolledDisplay(data[SECTION_MASTERY_VIEWED_KEY]);
      });
    }

    function updateConceptMasteryDisplay(payload) {
      const name = (payload && (payload.nodeLabel || (payload.message && payload.message.replace(/^Concept:\s*/i, "").split("\n")[0]))) || "—";
      const conf = payload && typeof payload.confidence === "number" ? payload.confidence : null;
      conceptValue.textContent = name.trim() || "—";
      const pct = conf != null ? Math.round(conf * 100) : 0;
      masteryBar.style.width = pct + "%";
      masteryPct.textContent = pct + "%";
    }

    function showClassifyResult(payload) {
      updateSidebarMode(payload);
      if (!payload || !payload.message) {
        classifyResult.style.display = "none";
        return;
      }
      if (!payload.error && !payload.pending && !isProblemsPage(payload)) updateConceptMasteryDisplay(payload);
      let display = payload.message;
      if (payload.confidence !== null && payload.confidence !== undefined && !payload.error) {
        const pct = Math.round(payload.confidence * 100);
        display += "\nMastery: " + pct + "%";
      }
      classifyResult.textContent = display;
      classifyResult.className = "sidebar-classify-result" +
        (payload.error ? " error" : "") +
        (payload.pending ? " pending" : "");
      classifyResult.style.display = "block";
    }

    classifyBtn.addEventListener("click", () => {
      const text = getTextForClassify();
      if (!text) {
        visibleTextPreview.textContent = "Extract content first (Gradescope or OpenStax with study mode on).";
        visibleTextPreview.classList.add("empty");
        return;
      }
      classifyResult.textContent = "Classifying…";
      classifyResult.className = "sidebar-classify-result pending";
      classifyResult.style.display = "block";
      startClassifyTimeout();
      try {
        chrome.storage.local.set({ [CLASSIFY_PENDING_KEY]: text }, () => {
          const url = chrome.runtime.getURL("classify.html");
          safeSendMessage({ type: "OPEN_TAB", url }, () => {});
        });
      } catch (_) {}
    });

    refreshKgBtn.addEventListener("click", () => {
      refreshKgBtn.disabled = true;
      classifyResult.textContent = "Refreshing knowledge graph…";
      classifyResult.className = "sidebar-classify-result pending";
      classifyResult.style.display = "block";
      safeSendMessage({ type: "FETCH_KG_LABELS" }, (r) => {
        refreshKgBtn.disabled = false;
        if (r && r.error) {
          classifyResult.textContent = "KG: " + r.error;
          classifyResult.className = "sidebar-classify-result error";
        } else if (r && r.labels) {
          const list = (r.labels || []).map((n) => n.label || "(no label)").join("\n");
          classifyResult.textContent = "Loaded " + r.labels.length + " concepts. You can now classify with AI.\n\n" + list;
          classifyResult.className = "sidebar-classify-result";
          classifyResult.style.display = "block";
        }
      });
    });

    host.refreshVisibleText = refreshSidebarVisibleText;
    host.refreshProblemsList = refreshProblemsList;
    host.updateSectionsScrolled = updateSectionsScrolledDisplay;
    host.updateClassifyResult = (payload) => {
      classifyResult.classList.remove("pending");
      updateSidebarMode(payload);
      if (payload && !payload.error && !payload.pending && !isProblemsPage(payload)) updateConceptMasteryDisplay(payload);
      showClassifyResult(payload);
    };
    host.visibleTextSection = visibleTextSection;
    if (sidebarShowVisibleSection) {
      refreshSidebarVisibleText();
      safeStorageGet([CLASSIFY_RESULT_KEY, "activeCourseId", "backendToken"], (data) => {
        const last = data[CLASSIFY_RESULT_KEY];
        if (last) {
          host.updateClassifyResult(last);
        } else {
          updateSidebarMode(null);
          updateConceptMasteryDisplay(null);
        }
        if (data.activeCourseId && data.backendToken) {
          safeSendMessage({ type: "FETCH_KG_LABELS" }, () => {});
        }
      });
    } else {
      safeStorageGet([CLASSIFY_RESULT_KEY], (data) => {
        if (data[CLASSIFY_RESULT_KEY]) {
          host.updateClassifyResult(data[CLASSIFY_RESULT_KEY]);
        } else {
          updateSidebarMode(null);
          updateConceptMasteryDisplay(null);
        }
      });
    }
    refreshProblemsList();

    rail.appendChild(resizeHandle);
    rail.appendChild(inner);
    shadow.appendChild(style);
    shadow.appendChild(rail);
    host.style.width = getSidebarWidthPx() + "px";
    document.body.appendChild(host);
    sidebarHost = host;

    let dragStartX = 0, dragStartWidth = 0;
    resizeHandle.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragStartX = e.clientX;
      dragStartWidth = getSidebarWidthPx();
      const onMove = (e2) => {
        const delta = dragStartX - e2.clientX;
        const w = Math.max(SIDEBAR_WIDTH_MIN, Math.min(SIDEBAR_WIDTH_MAX, dragStartWidth + delta));
        sidebarWidth = w;
        saveSidebarWidth(w);
        host.style.width = w + "px";
        inner.style.width = w + "px";
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  // Solve & Sync: original centered overlay (separate shadow DOM from chrome-extension-test)
  function closeOverlay() {
    if (overlayHost && overlayHost.parentNode) overlayHost.parentNode.removeChild(overlayHost);
    overlayHost = null;
  }

  function openOverlay(questionText) {
    if (overlayHost) return;
    const host = document.createElement("div");
    host.id = "solve-sync-overlay-host";
    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483645;
        background: rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
      }
      .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 24px 48px rgba(0,0,0,0.18);
        max-width: 480px;
        width: 100%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .card-header {
        padding: 14px 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .card-title { font-size: 14px; font-weight: 600; color: #111; margin: 0; }
      .close-btn {
        width: 32px; height: 32px;
        border: none; background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: #6b7280;
        display: flex; align-items: center; justify-content: center;
      }
      .close-btn:hover { background: #f3f4f6; color: #111; }
      .prompt-section {
        padding: 12px 16px;
        flex-shrink: 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .prompt-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
      .prompt-text {
        font-size: 13px; line-height: 1.5; color: #374151;
        white-space: pre-wrap; word-break: break-word;
        max-height: 120px; overflow-y: auto;
        background: #f9fafb; padding: 10px; border-radius: 8px;
      }
      .input-section {
        padding: 12px 16px;
        flex: 1;
        min-height: 140px;
        display: flex; flex-direction: column;
      }
      .input-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
      .input-area {
        flex: 1;
        min-height: 120px;
        padding: 10px 12px;
        font-size: 13px; line-height: 1.5;
        font-family: inherit;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        resize: vertical;
        box-sizing: border-box;
      }
      .input-area:focus {
        outline: none;
        border-color: #0d9488;
        box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
      }
      .card-footer {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        flex-shrink: 0;
      }
      .btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
      }
      .btn-secondary { background: #f3f4f6; color: #374151; }
      .btn-secondary:hover { background: #e5e7eb; }
      .btn-primary { background: #0d9488; color: white; }
      .btn-primary:hover { background: #0f766e; }
      .card.thinking { animation: cardGlow 1.5s ease-in-out infinite; }
      @keyframes cardGlow {
        0%, 100% { box-shadow: 0 24px 48px rgba(0,0,0,0.18), 0 0 0 2px rgba(13, 148, 136, 0.3); }
        50% { box-shadow: 0 24px 48px rgba(0,0,0,0.18), 0 0 24px 4px rgba(13, 148, 136, 0.5); }
      }
      .panel { display: none; }
      .panel.visible { display: flex; flex-direction: column; flex: 1; min-height: 0; }
      .thinking-panel {
        align-items: center; justify-content: center;
        padding: 32px 24px;
        gap: 16px;
      }
      .thinking-text { font-size: 14px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
      .thinking-dot { width: 6px; height: 6px; border-radius: 50%; background: #0d9488; animation: dotPulse 1s ease-in-out infinite; }
      .thinking-dot:nth-child(2) { animation-delay: 0.15s; }
      .thinking-dot:nth-child(3) { animation-delay: 0.3s; }
      @keyframes dotPulse { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.2); } }
      .input-area:disabled, .btn:disabled { opacity: 0.7; cursor: not-allowed; pointer-events: none; }
      .results-panel { padding: 16px; gap: 14px; }
      .concept-pill {
        display: inline-block; padding: 6px 12px; border-radius: 999px;
        background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
        color: #0f766e; font-size: 12px; font-weight: 600; align-self: flex-start;
      }
      .mastery-line { font-size: 15px; font-weight: 600; color: #111; }
      .mastery-bar-wrap { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
      .mastery-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #34d399 0%, #10b981 100%); transition: width 0.4s ease; }
      .hint-box { padding: 10px 12px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; font-size: 13px; color: #92400e; line-height: 1.45; }
      .results-done { margin-top: 8px; }
    `;

    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";

    const card = document.createElement("div");
    card.className = "card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.innerHTML = `<h2 class="card-title">Solve & Sync</h2>`;
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    cardHeader.appendChild(closeBtn);

    const promptSection = document.createElement("div");
    promptSection.className = "prompt-section";
    promptSection.innerHTML = `<div class="prompt-label">Question</div><div class="prompt-text" id="portal-prompt"></div>`;
    const promptEl = promptSection.querySelector("#portal-prompt");
    promptEl.textContent = questionText || "";

    const inputSection = document.createElement("div");
    inputSection.className = "input-section";
    inputSection.innerHTML = `<label class="input-label" for="portal-answer">Your explanation or solution</label><textarea class="input-area" id="portal-answer" placeholder="Type your answer here…"></textarea>`;
    const textarea = inputSection.querySelector("#portal-answer");

    const footer = document.createElement("div");
    footer.className = "card-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.textContent = "Cancel";
    const submitBtn = document.createElement("button");
    submitBtn.className = "btn btn-primary";
    submitBtn.textContent = "Submit";

    const formPanel = document.createElement("div");
    formPanel.className = "panel visible";
    formPanel.appendChild(promptSection);
    formPanel.appendChild(inputSection);
    formPanel.appendChild(footer);

    const thinkingPanel = document.createElement("div");
    thinkingPanel.className = "panel thinking-panel";
    thinkingPanel.innerHTML = `<div class="thinking-text">Model is evaluating<span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span></div>`;

    const resultsPanel = document.createElement("div");
    resultsPanel.className = "panel results-panel";
    resultsPanel.innerHTML = `
      <div class="concept-pill" id="portal-concept"></div>
      <div class="mastery-line" id="portal-mastery-text"></div>
      <div class="mastery-bar-wrap"><div class="mastery-bar" id="portal-mastery-bar" style="width:0%"></div></div>
      <div class="hint-box" id="portal-hint" hidden></div>
      <button class="btn btn-primary results-done" id="portal-results-done">Done</button>
    `;

    function showPanel(panel) {
      formPanel.classList.remove("visible");
      thinkingPanel.classList.remove("visible");
      resultsPanel.classList.remove("visible");
      panel.classList.add("visible");
    }

    closeBtn.onclick = closeOverlay;
    cancelBtn.onclick = closeOverlay;
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeOverlay(); });

    submitBtn.onclick = () => {
      const answer = textarea.value.trim();
      const qText = promptEl ? promptEl.textContent : "";
      if (!answer) return;
      textarea.disabled = true;
      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      showPanel(thinkingPanel);
      card.classList.add("thinking");

      safeStorageSet({
        solveSyncLastSubmission: {
          question: qText,
          answer,
          url: window.location.href,
          submittedAt: new Date().toISOString(),
        },
      });

      let resolved = false;
      const done = (response) => {
        if (resolved) return;
        resolved = true;
        card.classList.remove("thinking");
        showPanel(resultsPanel);
        const conceptEl = resultsPanel.querySelector("#portal-concept");
        const masteryTextEl = resultsPanel.querySelector("#portal-mastery-text");
        const masteryBarEl = resultsPanel.querySelector("#portal-mastery-bar");
        const hintEl = resultsPanel.querySelector("#portal-hint");
        const doneBtn = resultsPanel.querySelector("#portal-results-done");
        doneBtn.onclick = closeOverlay;

        const errMsg = (response && response.error) || "Request failed";
        if (!response || (response && response.error)) {
          conceptEl.textContent = "Error";
          masteryTextEl.textContent = errMsg === "NO_API_KEY"
            ? "Set your Gemini API key: right-click extension icon → Options."
            : "Could not evaluate: " + errMsg;
          masteryBarEl.style.width = "0%";
          hintEl.hidden = true;
          return;
        }

        const mappedNode = response.mappedNode || "Concept";
        const score = Math.min(100, Math.max(0, Number(response.score) || 0));
        const hint = response.hint || "";
        const synced = response.masteryUpdated === true;
        const backendConfidence = response.confidence != null ? Math.round(Number(response.confidence) * 100) : null;

        conceptEl.textContent = "Concept: " + mappedNode;
        masteryTextEl.textContent = "Mastery increased to " + score + "%!" +
          (synced && backendConfidence != null ? " Synced to knowledge graph (" + backendConfidence + "%)." : synced ? " Synced to knowledge graph." : "");
        masteryBarEl.style.width = score + "%";
        if (score < 100 && hint) {
          hintEl.textContent = hint;
          hintEl.hidden = false;
        } else {
          hintEl.hidden = true;
        }
      };

      setTimeout(() => {
        if (card.classList.contains("thinking")) done({ error: "Timeout" });
      }, 30000);

      safeSendMessage(
        { type: "SOLVE_SYNC_EVALUATE", question: qText, answer },
        (response) => {
          if (card.classList.contains("thinking")) done(response);
        }
      );
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(submitBtn);
    card.appendChild(cardHeader);
    card.appendChild(formPanel);
    card.appendChild(thinkingPanel);
    card.appendChild(resultsPanel);
    backdrop.appendChild(card);
    shadow.appendChild(style);
    shadow.appendChild(backdrop);
    document.body.appendChild(host);
    overlayHost = host;
    textarea.focus();
  }

  document.addEventListener("mouseup", function (e) {
    if (e.button !== 0) return;
    if (!studyModeEnabled) {
      hideFAB();
      return;
    }
    const clientX = e.clientX;
    const clientY = e.clientY;
    setTimeout(function () {
      const text = getSelectionText();
      if (text) {
        showFAB(clientX, clientY);
      } else {
        hideFAB();
      }
    }, 10);
  }, true);

  function isInSidebar(target) {
    if (!sidebarHost) return false;
    return sidebarHost === target || sidebarHost.contains(target) ||
      (sidebarHost.shadowRoot && sidebarHost.shadowRoot.contains(target));
  }
  function isInOverlay(target) {
    if (!overlayHost) return false;
    return overlayHost === target || overlayHost.contains(target) ||
      (overlayHost.shadowRoot && overlayHost.shadowRoot.contains(target));
  }
  document.addEventListener("mousedown", function (e) {
    if (isInSidebar(e.target) || isInOverlay(e.target)) return;
    const inFab = fab && fab.host && (e.target === fab.host || fab.host.contains(e.target));
    const inToggleFab = toggleFab && toggleFab.host && (e.target === toggleFab.host || toggleFab.host.contains(e.target));
    if (!inFab && !inToggleFab && !overlayHost) hideFAB();
  }, true);

  function enableStudyModeUI() {
    loadPersistedState(() => {
      createToggleFAB();
      toggleFab.host.style.display = "";
      if (sidebarOpen) openSidebar();
    });
  }

  function disableStudyModeUI() {
    hideFAB();
    closeSidebar();
    if (toggleFab && toggleFab.host) toggleFab.host.style.display = "none";
  }

  function applyStudyMode(enabled) {
    studyModeEnabled = enabled === true;
    if (studyModeEnabled) {
      enableStudyModeUI();
    } else {
      disableStudyModeUI();
    }
  }

  // Initialize: only show sidebar/FAB when study mode is on
  safeStorageGet([STUDY_MODE_KEY], (data) => {
    applyStudyMode(data[STUDY_MODE_KEY]);
  });

  let autoClassifyDebounceTimer = null;
  var lastClassifiedPageKey = null;
  var classifyTimeoutId = null;
  function clearClassifyTimeout() {
    if (classifyTimeoutId) {
      clearTimeout(classifyTimeoutId);
      classifyTimeoutId = null;
    }
  }
  function startClassifyTimeout() {
    clearClassifyTimeout();
    classifyTimeoutId = setTimeout(function () {
      classifyTimeoutId = null;
      if (sidebarHost && sidebarHost.updateClassifyResult) {
        sidebarHost.updateClassifyResult({ message: "Classification timed out. Try again or use Classify with AI.", error: true });
      }
    }, 50000);
  }
  function getPageKey(data) {
    if (!data) return null;
    return (data.url || "") + "|" + (data.title || "");
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[STUDY_MODE_KEY]) {
      applyStudyMode(changes[STUDY_MODE_KEY].newValue);
    }
    if (changes[OPENSTAX_STORAGE_KEY] || changes[QUIZ_STORAGE_KEY]) {
      if (sidebarHost && sidebarHost.refreshVisibleText && sidebarShowVisibleSection) {
        sidebarHost.refreshVisibleText();
      }
      var newValue = changes[OPENSTAX_STORAGE_KEY] ? changes[OPENSTAX_STORAGE_KEY].newValue : changes[QUIZ_STORAGE_KEY].newValue;
      if (newValue && studyModeEnabled) {
        var pageKey = getPageKey(newValue);
        if (pageKey === lastClassifiedPageKey) return;
        if (autoClassifyDebounceTimer) clearTimeout(autoClassifyDebounceTimer);
        autoClassifyDebounceTimer = setTimeout(function () {
          autoClassifyDebounceTimer = null;
          var currentKey = getPageKey(newValue);
          if (currentKey === lastClassifiedPageKey) return;
          lastClassifiedPageKey = currentKey;
          if (sidebarHost && sidebarHost.updateClassifyResult) {
            sidebarHost.updateClassifyResult({ message: "Classifying…", pending: true });
            startClassifyTimeout();
          }
          triggerAutoClassify(newValue);
        }, 600);
      }
    }
    if (changes[CLASSIFY_RESULT_KEY] && sidebarHost && sidebarHost.updateClassifyResult) {
      clearClassifyTimeout();
      sidebarHost.updateClassifyResult(changes[CLASSIFY_RESULT_KEY].newValue);
    }
    if ((changes[SECTION_MASTERY_VIEWED_KEY] || changes.section_mastery_lastConceptId) && sidebarHost && sidebarHost.updateSectionsScrolled) {
      safeStorageGet([SECTION_MASTERY_VIEWED_KEY], function (data) {
        sidebarHost.updateSectionsScrolled(data[SECTION_MASTERY_VIEWED_KEY]);
      });
    }
    if (changes[SOLVE_SYNC_PROBLEMS_KEY] && sidebarHost && sidebarHost.refreshProblemsList) {
      sidebarHost.refreshProblemsList();
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    if (!sidebarHost || !sidebarHost.updateClassifyResult) return;
    safeStorageGet([CLASSIFY_RESULT_KEY], function (data) {
      var last = data[CLASSIFY_RESULT_KEY];
      if (last && last.message && !last.pending) {
        clearClassifyTimeout();
        sidebarHost.updateClassifyResult(last);
      }
    });
  });
})();
