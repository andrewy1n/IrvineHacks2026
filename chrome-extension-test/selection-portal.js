(function () {
  let fab = null;
  let overlayHost = null;
  let lastSelection = "";

  function getSelectionText() {
    let doc = document;
    try {
      const active = document.activeElement;
      if (active && active.tagName === "IFRAME" && active.contentDocument) doc = active.contentDocument;
    } catch (_) {}
    const sel = doc.getSelection ? doc.getSelection() : (window.getSelection && window.getSelection());
    return sel ? sel.toString().trim() : "";
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

    const header = document.createElement("div");
    header.className = "card-header";
    header.innerHTML = `<h2 class="card-title">Solve & Sync</h2>`;
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    header.appendChild(closeBtn);

    const promptSection = document.createElement("div");
    promptSection.className = "prompt-section";
    promptSection.innerHTML = `<div class="prompt-label">Question</div><div class="prompt-text" id="portal-prompt"></div>`;
    const promptEl = promptSection.querySelector("#portal-prompt");
    promptEl.textContent = questionText;

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

    function closeOverlay() {
      if (overlayHost && overlayHost.parentNode) overlayHost.parentNode.removeChild(overlayHost);
      overlayHost = null;
    }

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
      if (!answer) return;
      textarea.disabled = true;
      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      showPanel(thinkingPanel);
      card.classList.add("thinking");

      chrome.storage.local.set({
        solveSyncLastSubmission: {
          question: questionText,
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

        if (chrome.runtime.lastError || !response || response.error) {
          const err = (response && response.error) || chrome.runtime.lastError?.message || "Request failed";
          conceptEl.textContent = "Error";
          masteryTextEl.textContent = err === "NO_API_KEY"
            ? "Set your Gemini API key: right-click extension icon → Options."
            : "Could not evaluate: " + err;
          masteryBarEl.style.width = "0%";
          hintEl.hidden = true;
          return;
        }

        const mappedNode = response.mappedNode || "Concept";
        const score = Math.min(100, Math.max(0, Number(response.score) || 0));
        const hint = response.hint || "";

        conceptEl.textContent = "Concept: " + mappedNode;
        masteryTextEl.textContent = "Mastery increased to " + score + "%!";
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

      chrome.runtime.sendMessage(
        { type: "SOLVE_SYNC_EVALUATE", question: questionText, answer },
        (response) => {
          if (card.classList.contains("thinking")) done(response);
        }
      );
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(submitBtn);
    card.appendChild(header);
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

  document.addEventListener("mousedown", function (e) {
    if (overlayHost && overlayHost.contains(e.target)) return;
    const inFab = fab && fab.host && (e.target === fab.host || fab.host.contains(e.target));
    if (!inFab && !overlayHost) hideFAB();
  }, true);
})();
