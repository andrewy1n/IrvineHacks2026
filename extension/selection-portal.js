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
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        background: #000000;
        color: #fafafa;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .fab:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
      }
      .fab:active { transform: scale(0.98); }
      .fab svg { width: 22px; height: 22px; }
      .fab { pointer-events: auto; }
    `;
    const btn = document.createElement("button");
    btn.className = "fab";
    btn.setAttribute("aria-label", "Nebula Node");
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
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        background: #000000;
        color: #fafafa;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .fab:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
      }
      .fab:active { transform: scale(0.98); }
      .fab svg { width: 22px; height: 22px; }
    `;
    const btn = document.createElement("button");
    btn.className = "fab";
    btn.setAttribute("aria-label", "Toggle Nebula Node sidebar");
    btn.type = "button";
    
    try {
      const iconUrl = chrome.runtime.getURL("icon.png");
      btn.innerHTML = `<img src="${iconUrl}" alt="Nebula Icon" style="width:28px;height:28px;border-radius:50%;" />`;
    } catch (e) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    }

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
      if (toggleFab && toggleFab.host) toggleFab.host.style.display = "none";
      if (sidebarShowVisibleSection && sidebarHost.refreshVisibleText) sidebarHost.refreshVisibleText();
      
      // Fetch latest problems from backend when opening sidebar
      safeSendMessage({ type: "FETCH_SOLVED_PROBLEMS" }, (r) => {
        if (r && r.problems && sidebarHost.refreshProblemsList) sidebarHost.refreshProblemsList();
      });
    } catch (_) {}
  }

  function closeSidebar() {
    if (sidebarHost) sidebarHost.style.display = "none";
    sidebarOpen = false;
    saveSidebarOpen(false);
    if (toggleFab && toggleFab.host && studyModeEnabled) toggleFab.host.style.display = "";
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
        background: #050505;
        color: #fafafa;
        box-shadow: -4px 0 24px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        min-width: 0;
        font-family: system-ui, sans-serif;
      }
      .sidebar-header {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .sidebar-title { font-size: 14px; font-weight: 600; color: #fafafa; margin: 0; }
      .close-btn {
        width: 32px; height: 32px;
        border: none; background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: #a1a1aa;
        display: flex; align-items: center; justify-content: center;
      }
      .close-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fafafa; }
      .spline-container {
        width: 100%;
        height: 180px;
        background: #0a0a0a;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .sidebar-body { flex: 1; min-height: 0; overflow: auto; }
      .sidebar-toggle-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0; gap: 10px;
      }
      .sidebar-toggle-label { font-size: 13px; color: #e4e4e7; margin: 0; font-weight: 500; }
      .sidebar-toggle-switch {
        position: relative; width: 36px; height: 20px;
        background: rgba(255, 255, 255, 0.15); border-radius: 10px; cursor: pointer; flex-shrink: 0;
        transition: background 0.2s;
      }
      .sidebar-toggle-switch.on { background: #fafafa; }
      .sidebar-toggle-switch::after {
        content: ""; position: absolute; top: 2px; left: 2px;
        width: 16px; height: 16px; background: white; border-radius: 50%;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: transform 0.2s;
      }
      .sidebar-toggle-switch.on::after { transform: translateX(16px); background: #18181b; }
      .sidebar-concept-mastery {
        padding: 14px 16px; margin: 0;
        background: #050505;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }
      .sidebar-concept-mastery .concept-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 6px; }
      .sidebar-concept-mastery .concept-value { font-size: 14px; font-weight: 600; color: #fafafa; margin-bottom: 12px; }
      .sidebar-concept-mastery .mastery-row { display: flex; align-items: center; gap: 8px; }
      .sidebar-concept-mastery .mastery-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; }
      .sidebar-concept-mastery .mastery-bar-wrap { flex: 1; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; }
      .sidebar-concept-mastery .mastery-bar { height: 100%; background: #fafafa; border-radius: 4px; transition: width 0.2s; }
      .sidebar-concept-mastery .mastery-pct { font-size: 12px; font-weight: 600; color: #fafafa; min-width: 2.5em; }
      .visible-text-section {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); flex-shrink: 0;
        display: flex; flex-direction: column; overflow: hidden;
      }
      .visible-text-preview {
        max-height: 180px; overflow-y: auto; padding: 12px 16px;
        font-size: 12px; line-height: 1.5; color: #d4d4d8;
        background: #050505; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        white-space: pre-wrap; word-break: break-word;
      }
      .visible-text-preview.empty { color: #71717a; font-style: italic; }
      .sidebar-classify-wrap { padding: 12px 16px; background: #0a0a0a; }
      .sidebar-classify-btn {
        width: 100%; padding: 10px 12px; font-size: 13px; font-weight: 500;
        background: #fafafa; color: #18181b; border: none; border-radius: 8px;
        cursor: pointer; transition: opacity 0.2s;
      }
      .sidebar-classify-btn:hover { opacity: 0.9; }
      .sidebar-classify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .sidebar-refresh-nebula-btn {
        background: transparent; color: #fafafa; border: 1px solid rgba(255, 255, 255, 0.2);
        margin-top: 8px;
      }
      .sidebar-refresh-nebula-btn:hover { background: rgba(255, 255, 255, 0.05); opacity: 1; }
      .sidebar-classify-result {
        padding: 12px 16px; font-size: 12px; line-height: 1.5;
        color: #d4d4d8; background: rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.1);
        white-space: pre-wrap; word-break: break-word; min-height: 2.5em; margin-top: 12px; border-radius: 8px;
      }
      .sidebar-classify-result.error { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fafafa; }
      .sidebar-classify-result.pending { background: rgba(255, 255, 255, 0.02); border-color: rgba(255, 255, 255, 0.05); color: #a1a1aa; font-style: italic; }
      .sidebar-sections-scrolled {
        padding: 8px 16px; font-size: 12px; color: #a1a1aa;
        background: #0a0a0a; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .sidebar-problems {
        padding: 14px 16px; margin: 0;
        background: #0a0a0a; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .sidebar-problems .problems-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 10px; font-weight: 600; flex-shrink: 0; }
      .sidebar-problems .problems-list { flex: 1; overflow-y: auto; font-size: 12px; }
      .sidebar-problems .problem-item {
        padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #e4e4e7; line-height: 1.4;
      }
      .sidebar-problems .problem-item:last-child { border-bottom: none; }
      .sidebar-problems .problem-question { color: #fafafa; margin-bottom: 6px; }
      .sidebar-problems .problem-meta { font-size: 11px; color: #a1a1aa; }
      .sidebar-problems .problem-item {
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        backdrop-filter: blur(10px);
      }
      .sidebar-problems .problem-header {
        padding: 12px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .sidebar-problems .problem-header:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .sidebar-problems .problem-question {
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.4;
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .sidebar-problems .problem-status {
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .sidebar-problems .status-correct { color: #34d399; }
      .sidebar-problems .status-partial { color: #fbbf24; }
      .sidebar-problems .status-wrong { color: #f87171; }
      
      .sidebar-problems .problem-content {
        display: none;
        padding: 0 12px 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.2);
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
      }
      .sidebar-problems .problem-content.expanded {
        display: block;
      }
      .sidebar-problems .problem-full-question {
        padding-top: 10px;
        margin-bottom: 8px;
      }
      .sidebar-problems .problem-options-title {
        font-size: 10px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      .sidebar-problems .problem-options-list {
        margin: 0;
        padding-left: 16px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
      }
      .sidebar-problems .problem-answer-box {
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 4px;
        margin-top: 8px;
        font-size: 10px;
      }
      .sidebar-problems .problem-answer-row {
        margin-bottom: 4px;
      }
      .sidebar-problems .problem-answer-row:last-child {
        margin-bottom: 0;
      }
      .sidebar-problems .problem-answer-label {
        color: rgba(255, 255, 255, 0.5);
      }
      .sidebar-problems .problem-answer-value {
        color: rgba(255, 255, 255, 0.9);
      }
      .sidebar-problems .problem-correct-value {
        color: #34d399;
      }
      .sidebar-problems .problem-meta {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
      }
      .sidebar-problems .problems-empty { color: #71717a; font-style: italic; padding: 10px 0; }
      
      /* Scrollbar styles */
      .sidebar-inner ::-webkit-scrollbar { width: 6px; }
      .sidebar-inner ::-webkit-scrollbar-track { background: transparent; }
      .sidebar-inner ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
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
    header.innerHTML = `<h2 class="sidebar-title">Nebula Node</h2>`;
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    closeBtn.onclick = closeSidebar;
    header.appendChild(closeBtn);
    
    const splineContainer = document.createElement("div");
    splineContainer.className = "spline-container";
    
    // Instead of <spline-viewer>, let's use an animated SVG or a clean constellation background image
    // since some contexts block the spline WebGL viewer due to CSP or WebGL context limits.
    const fallbackVisual = document.createElement("div");
    fallbackVisual.style.cssText = `
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, #1a1a1a 0%, #050505 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    `;
    
    // Node visualization consistent with frontend NebulaGraph
    fallbackVisual.innerHTML = `
      <div id="visual-concept-view" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <div style="
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);
          animation: pulseNode 4s ease-in-out infinite;
          cursor: default;
        ">
          <div style="
            position: absolute;
            top: 8%;
            left: 15%;
            width: 55%;
            height: 35%;
            background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%);
            border-radius: 50%;
            pointer-events: none;
          "></div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; z-index: 1;">
              <span id="node-visual-label" style="font-size: 13px; font-weight: 600; color: #fafafa; text-align: center; line-height: 1.15; font-family: system-ui, sans-serif;">Nebula</span>
              <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                <div id="node-visual-bar" style="width: 0%; height: 100%; background: #ffffff; box-shadow: 0 0 10px rgba(255,255,255,0.5); transition: width 0.5s ease-out;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="visual-problems-view" style="display: none; align-items: center; justify-content: center; width: 100%; height: 100%;">
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 16px 24px;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <span style="font-size: 15px; font-weight: 600; color: #fafafa; font-family: system-ui, sans-serif; letter-spacing: 0.05em;">Problems History</span>
            
            <div style="display: flex; gap: 20px; margin-top: 4px;">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span id="node-visual-problems-count" style="font-size: 18px; font-weight: 700; color: #ffffff;">0</span>
                <span style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em;">Solved</span>
              </div>
              <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span id="node-visual-problems-avg" style="font-size: 18px; font-weight: 700; color: #ffffff;">0%</span>
                <span style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em;">Avg Score</span>
              </div>
            </div>
          </div>
        </div>
  
        <style>
          @keyframes pulseNode {
            0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 24px rgba(255, 255, 255, 0.15), 0 4px 12px rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.1); }
          }
        </style>
      `;
    
    splineContainer.appendChild(fallbackVisual);

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
    conceptLabel.textContent = "View";
    const conceptSelectWrap = document.createElement("div");
    conceptSelectWrap.style.marginBottom = "12px";
    const conceptSelect = document.createElement("select");
    conceptSelect.style.cssText = "width:100%; padding:8px 10px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fafafa; font-size:14px; font-weight:600; outline:none; cursor:pointer;";
    conceptSelectWrap.appendChild(conceptSelect);

    function populateConceptDropdown(currentId) {
      safeStorageGet(["kg_labels"], (data) => {
        const labels = data.kg_labels || [];
        conceptSelect.innerHTML = '<option value="" style="background:#1a1a1a;">— Unknown Concept —</option>';
        labels.forEach(l => {
          const opt = document.createElement("option");
          opt.value = l.id;
          opt.textContent = l.label;
          opt.dataset.confidence = l.confidence || 0;
          opt.style.background = "#1a1a1a";
          conceptSelect.appendChild(opt);
        });
        
        const problemsOpt = document.createElement("option");
        problemsOpt.value = PROBLEMS_NODE_ID;
        problemsOpt.textContent = PROBLEMS_LABEL;
        problemsOpt.style.background = "#1a1a1a";
        conceptSelect.appendChild(problemsOpt);

        if (currentId) {
          conceptSelect.value = currentId;
        }
      });
    }

    conceptSelect.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      if (!selectedId) return;
      
      let payload;
      if (selectedId === PROBLEMS_NODE_ID) {
        payload = {
          nodeId: PROBLEMS_NODE_ID,
          nodeLabel: PROBLEMS_LABEL,
          message: PROBLEMS_LABEL,
          error: false,
          pending: false
        };
        // Fetch latest problems from backend when switching to problems view
        safeSendMessage({ type: "FETCH_SOLVED_PROBLEMS" }, (r) => {
            if (r && r.problems) refreshProblemsList();
        });
      } else {
        const selectedOpt = e.target.selectedOptions[0];
        const selectedLabel = selectedOpt.textContent;
        const selectedConf = parseFloat(selectedOpt.dataset.confidence) || 0;
        
        payload = {
          nodeId: selectedId,
          nodeLabel: selectedLabel,
          confidence: selectedConf,
          message: "Concept: " + selectedLabel + "\\nMastery: " + Math.round(selectedConf * 100) + "%",
          error: false,
          pending: false
        };
      }
      
      chrome.storage.local.set({ [CLASSIFY_RESULT_KEY]: payload, section_mastery_lastConceptId: selectedId === PROBLEMS_NODE_ID ? null : selectedId });
    });

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
    conceptMasterySection.appendChild(conceptSelectWrap);
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
            
            const header = document.createElement("div");
            header.className = "problem-header";
            
            const q = document.createElement("div");
            q.className = "problem-question";
            q.textContent = (p.question || "").trim() || "(no question)";
            
            const status = document.createElement("div");
            status.className = "problem-status";
            let statusText = "UNKNOWN";
            let statusClass = "";
            
            // Check eval_result first (from backend), fallback to score
            if (p.eval_result === "correct" || p.score >= 85) {
              statusText = "CORRECT";
              statusClass = "status-correct";
            } else if (p.eval_result === "partial" || p.score >= 50) {
              statusText = "PARTIAL";
              statusClass = "status-partial";
            } else if (p.eval_result === "wrong" || (p.score != null && p.score < 50)) {
              statusText = "INCORRECT";
              statusClass = "status-wrong";
            }
            
            status.textContent = statusText;
            status.className = "problem-status " + statusClass;
            
            // Expandable icon
            const expandIcon = document.createElement("div");
            expandIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><path d="M6 9l6 6 6-6"/></svg>`;
            expandIcon.style.marginTop = "1px";
            expandIcon.style.flexShrink = "0";

            header.appendChild(q);
            header.appendChild(status);
            header.appendChild(expandIcon);
            
            const content = document.createElement("div");
            content.className = "problem-content";
            
            const fullQ = document.createElement("div");
            fullQ.className = "problem-full-question";
            fullQ.textContent = (p.question || "").trim() || "(no question)";
            content.appendChild(fullQ);
            
            if (p.options && p.options.length > 0) {
              const optsList = document.createElement("div");
              optsList.style.marginBottom = "8px";
              optsList.innerHTML = `<div class="problem-options-title">Options</div>`;
              const ul = document.createElement("ul");
              ul.className = "problem-options-list";
              p.options.forEach(opt => {
                const li = document.createElement("li");
                li.textContent = opt;
                ul.appendChild(li);
              });
              optsList.appendChild(ul);
              content.appendChild(optsList);
            }
            
            const ansBox = document.createElement("div");
            ansBox.className = "problem-answer-box";
            
            const userAnsRow = document.createElement("div");
            userAnsRow.className = "problem-answer-row";
            userAnsRow.innerHTML = `<span class="problem-answer-label">Your answer:</span> <span class="problem-answer-value">${escapeHtml(p.user_answer || p.userAnswer || "—")}</span>`;
            
            const correctAnsRow = document.createElement("div");
            correctAnsRow.className = "problem-answer-row";
            correctAnsRow.innerHTML = `<span class="problem-answer-label">Correct answer:</span> <span class="problem-correct-value">${escapeHtml(p.correct_answer || p.correctAnswer || "—")}</span>`;
            
            ansBox.appendChild(userAnsRow);
            ansBox.appendChild(correctAnsRow);
            content.appendChild(ansBox);
            
            const meta = document.createElement("div");
            meta.className = "problem-meta";
            const date = p.submittedAt || p.created_at ? new Date(p.submittedAt || p.created_at).toLocaleDateString() : "";
            meta.innerHTML = `<span>${escapeHtml(p.mappedNode || "—")}</span><span>${date}</span>`;
            content.appendChild(meta);
            
            let isExpanded = false;
            header.addEventListener("click", () => {
              isExpanded = !isExpanded;
              content.classList.toggle("expanded", isExpanded);
              expandIcon.querySelector("svg").style.transform = isExpanded ? "rotate(180deg)" : "rotate(0)";
            });

            item.appendChild(header);
            item.appendChild(content);
            problemsListEl.appendChild(item);
          });
        }
        
        // Update stats in the visual widget if it's currently showing
        const countEl = fallbackVisual.querySelector("#node-visual-problems-count");
        const avgEl = fallbackVisual.querySelector("#node-visual-problems-avg");
        if (countEl && countEl.offsetParent !== null) {
          countEl.textContent = list.length;
          if (avgEl) {
            if (list.length === 0) {
              avgEl.textContent = "0%";
            } else {
              const totalScore = list.reduce((sum, p) => {
                let s = 0;
                if (typeof p.score === "number") s = p.score;
                else if (p.eval_result === "correct") s = 100;
                else if (p.eval_result === "partial") s = 50;
                return sum + s;
              }, 0);
              avgEl.textContent = Math.round(totalScore / list.length) + "%";
            }
          }
        }
      });
    }

    // Helper for escaping HTML inside innerHTML blocks
    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
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
    const refreshNebulaBtn = document.createElement("button");
    refreshNebulaBtn.type = "button";
    refreshNebulaBtn.className = "sidebar-classify-btn sidebar-refresh-nebula-btn";
    refreshNebulaBtn.textContent = "Refresh knowledge graph";
    refreshNebulaBtn.style.marginTop = "6px";
    const classifyResult = document.createElement("div");
    classifyResult.className = "sidebar-classify-result";
    classifyResult.textContent = "";
    classifyResult.style.display = "none";
    classifyWrap.appendChild(classifyBtn);
    classifyWrap.appendChild(refreshNebulaBtn);
    classifyWrap.appendChild(classifyResult);
    visibleTextSection.appendChild(visibleTextPreview);
    visibleTextSection.appendChild(sectionsScrolledRow);
    visibleTextSection.appendChild(classifyWrap);

    const body = document.createElement("div");
    body.className = "sidebar-body";

    inner.appendChild(header);
    inner.appendChild(splineContainer);
    inner.appendChild(conceptMasterySection);
    inner.appendChild(toggleRow);
    inner.appendChild(visibleTextSection);
    inner.appendChild(problemsSection);
    inner.appendChild(body);

    function isProblemsPage(payload) {
      if (!payload || payload.error || payload.pending) return false;
      return payload.nodeLabel === PROBLEMS_LABEL || payload.nodeId === PROBLEMS_NODE_ID;
    }

    function updateSidebarMode(payload) {
      const showProblems = isProblemsPage(payload);
      
      const conceptView = fallbackVisual.querySelector("#visual-concept-view");
      const problemsView = fallbackVisual.querySelector("#visual-problems-view");
      
      if (showProblems) {
        if (conceptView) conceptView.style.display = "none";
        if (problemsView) problemsView.style.display = "flex";
        
        safeStorageGet([SOLVE_SYNC_PROBLEMS_KEY], (data) => {
          const list = Array.isArray(data[SOLVE_SYNC_PROBLEMS_KEY]) ? data[SOLVE_SYNC_PROBLEMS_KEY] : [];
          const countEl = fallbackVisual.querySelector("#node-visual-problems-count");
          const avgEl = fallbackVisual.querySelector("#node-visual-problems-avg");
          
          if (countEl) countEl.textContent = list.length;
          if (avgEl) {
            if (list.length === 0) {
              avgEl.textContent = "0%";
            } else {
              const totalScore = list.reduce((sum, p) => sum + (typeof p.score === "number" ? p.score : 0), 0);
              avgEl.textContent = Math.round(totalScore / list.length) + "%";
            }
          }
        });
      } else {
        if (conceptView) conceptView.style.display = "flex";
        if (problemsView) problemsView.style.display = "none";
      }

      problemsSection.style.display = showProblems ? "" : "none";
      masteryRow.style.display = showProblems ? "none" : "";
      toggleRow.style.display = showProblems ? "none" : "";
      visibleTextSection.style.display = showProblems ? "none" : (sidebarShowVisibleSection ? "" : "none");
      body.style.display = showProblems ? "none" : "";
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

    let labelsPopulated = false;

    function updateConceptMasteryDisplay(payload) {
      const name = (payload && (payload.nodeLabel || (payload.message && payload.message.replace(/^Concept:\s*/i, "").split("\\n")[0]))) || "—";
      const conf = payload && typeof payload.confidence === "number" ? payload.confidence : null;
      
      const nodeId = payload && payload.nodeId;
      if (!labelsPopulated) {
        populateConceptDropdown(nodeId);
        labelsPopulated = true;
      } else if (nodeId) {
        conceptSelect.value = nodeId;
      } else if (!nodeId && name !== "—") {
        // Find by name if possible
        const options = Array.from(conceptSelect.options);
        const matchingOpt = options.find(opt => opt.textContent === name);
        if (matchingOpt) conceptSelect.value = matchingOpt.value;
      }

      const pct = conf != null ? Math.round(conf * 100) : 0;
      masteryBar.style.width = pct + "%";
      masteryPct.textContent = pct + "%";

      const visualLabel = fallbackVisual.querySelector("#node-visual-label");
      if (visualLabel) {
        let labelText = name.trim() === "—" ? "Nebula" : name.trim();
        if (labelText.length > 20) {
          labelText = labelText.substring(0, 18) + "…";
        }
        visualLabel.textContent = labelText;
      }
      const visualBarWrap = fallbackVisual.querySelector("#node-visual-bar")?.parentElement;
      if (visualBarWrap) visualBarWrap.style.display = ""; // Ensure it's visible for concept view
      const visualBar = fallbackVisual.querySelector("#node-visual-bar");
      if (visualBar) visualBar.style.width = pct + "%";
    }

    function showClassifyResult(payload) {
      updateSidebarMode(payload);
      if (!payload || !payload.message) {
        classifyResult.style.display = "none";
        return;
      }
      
      if (!labelsPopulated) {
        populateConceptDropdown(payload.nodeId);
        labelsPopulated = true;
      } else if (payload.nodeId) {
        conceptSelect.value = payload.nodeId;
      }

      if (!payload.error && !payload.pending) {
        if (!isProblemsPage(payload)) {
          updateConceptMasteryDisplay(payload);
        }
      }
      
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

    refreshNebulaBtn.addEventListener("click", () => {
      refreshNebulaBtn.disabled = true;
      classifyResult.textContent = "Refreshing knowledge graph…";
      classifyResult.className = "sidebar-classify-result pending";
      classifyResult.style.display = "block";
      safeSendMessage({ type: "FETCH_KG_LABELS" }, (r) => {
        refreshNebulaBtn.disabled = false;
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
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
      }
      .card {
        background: #0a0a0a;
        color: #fafafa;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        box-shadow: 0 24px 48px rgba(0,0,0,0.5);
        max-width: 480px;
        width: 100%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: system-ui, sans-serif;
      }
      .card-header {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .card-title { font-size: 14px; font-weight: 600; color: #fafafa; margin: 0; }
      .close-btn {
        width: 32px; height: 32px;
        border: none; background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: #a1a1aa;
        display: flex; align-items: center; justify-content: center;
      }
      .close-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fafafa; }
      .prompt-section {
        padding: 14px 16px;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .prompt-label { font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
      .prompt-text {
        font-size: 13px; line-height: 1.5; color: #e4e4e7;
        white-space: pre-wrap; word-break: break-word;
        max-height: 120px; overflow-y: auto;
        background: #050505; padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .input-section {
        padding: 14px 16px;
        flex: 1;
        min-height: 140px;
        display: flex; flex-direction: column;
      }
      .input-label { font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
      .input-area {
        flex: 1;
        min-height: 120px;
        padding: 12px;
        font-size: 13px; line-height: 1.5; color: #fafafa;
        font-family: inherit;
        background: #050505;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        resize: vertical;
        box-sizing: border-box;
      }
      .input-area:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.3);
      }
      .card-footer {
        padding: 14px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: #050505;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex-shrink: 0;
      }
      .btn {
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: opacity 0.2s;
      }
      .btn:hover { opacity: 0.9; }
      .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #fafafa; }
      .btn-primary { background: #fafafa; color: #18181b; }
      .card.thinking { animation: cardGlow 1.5s ease-in-out infinite; }
      @keyframes cardGlow {
        0%, 100% { box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255, 255, 255, 0.1); }
        50% { box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 20px 2px rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3); }
      }
      .panel { display: none; }
      .panel.visible { display: flex; flex-direction: column; flex: 1; min-height: 0; }
      .thinking-panel {
        align-items: center; justify-content: center;
        padding: 40px 24px;
        gap: 16px;
      }
      .thinking-text { font-size: 14px; color: #a1a1aa; display: flex; align-items: center; gap: 6px; }
      .thinking-dot { width: 6px; height: 6px; border-radius: 50%; background: #fafafa; animation: dotPulse 1s ease-in-out infinite; }
      .thinking-dot:nth-child(2) { animation-delay: 0.15s; }
      .thinking-dot:nth-child(3) { animation-delay: 0.3s; }
      @keyframes dotPulse { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.2); } }
      .input-area:disabled, .btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
      .results-panel { padding: 20px 16px; gap: 16px; }
      .concept-pill {
        display: inline-block; padding: 6px 12px; border-radius: 999px;
        background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fafafa; font-size: 12px; font-weight: 600; align-self: flex-start;
      }
      .mastery-line { font-size: 15px; font-weight: 600; color: #fafafa; margin-top: 4px; }
      .mastery-bar-wrap { height: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 999px; overflow: hidden; margin: 8px 0; }
      .mastery-bar { height: 100%; border-radius: 999px; background: #fafafa; transition: width 0.4s ease; }
      .hint-box { padding: 12px 14px; background: rgba(253, 224, 71, 0.1); border: 1px solid rgba(253, 224, 71, 0.2); border-radius: 8px; font-size: 13px; color: #fde047; line-height: 1.5; margin-top: 4px; }
      .results-done { margin-top: 16px; }
      
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
    `;

    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";

    const card = document.createElement("div");
    card.className = "card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.innerHTML = `<h2 class="card-title">Solve Question</h2>`;
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
