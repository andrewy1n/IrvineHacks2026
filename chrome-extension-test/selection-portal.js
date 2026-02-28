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

    function closeOverlay() {
      if (overlayHost && overlayHost.parentNode) overlayHost.parentNode.removeChild(overlayHost);
      overlayHost = null;
    }

    closeBtn.onclick = closeOverlay;
    cancelBtn.onclick = closeOverlay;
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeOverlay(); });
    submitBtn.onclick = () => {
      const answer = textarea.value.trim();
      chrome.storage.local.set({
        solveSyncLastSubmission: {
          question: questionText,
          answer,
          url: window.location.href,
          submittedAt: new Date().toISOString(),
        },
      });
      closeOverlay();
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(submitBtn);
    card.appendChild(header);
    card.appendChild(promptSection);
    card.appendChild(inputSection);
    card.appendChild(footer);
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
