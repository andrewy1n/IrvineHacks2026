const GEMINI_STORAGE_KEY = "geminiApiKey";

// Load saved Gemini API key
chrome.storage.local.get([GEMINI_STORAGE_KEY], (data) => {
  const input = document.getElementById("apiKey");
  if (data[GEMINI_STORAGE_KEY]) input.value = data[GEMINI_STORAGE_KEY];
});

document.getElementById("save").onclick = () => {
  const key = document.getElementById("apiKey").value.trim();
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    const el = document.getElementById("saved");
    el.hidden = false;
    el.textContent = key ? "Saved." : "Cleared.";
    setTimeout(() => { el.hidden = true; }, 2000);
  });
};

// --- Backend (kg-mastery API) ---
const backendEmail = document.getElementById("backendEmail");
const backendPassword = document.getElementById("backendPassword");
const backendLoginBtn = document.getElementById("backendLogin");
const backendStatus = document.getElementById("backendStatus");
const backendError = document.getElementById("backendError");
const courseSelect = document.getElementById("courseSelect");
const refreshCoursesBtn = document.getElementById("refreshCourses");
const refreshKgBtn = document.getElementById("refreshKg");
const conceptsListEl = document.getElementById("conceptsList");

function showBackendStatus(msg, isError = false) {
  backendError.hidden = !isError;
  backendStatus.hidden = isError;
  if (isError) backendError.textContent = msg;
  else backendStatus.textContent = msg;
}

function renderConceptsList(labels) {
  if (!labels || labels.length === 0) {
    conceptsListEl.innerHTML = "";
    return;
  }
  conceptsListEl.innerHTML = labels
    .map((n) => `<div class="concept-item">${escapeHtml(n.label || "(no label)")}</div>`)
    .join("");
}

function loadStoredBackendPrefs() {
  chrome.storage.local.get(["backendToken", "backendEmail", "activeCourseId", "kg_labels"], (data) => {
    if (data.backendEmail) backendEmail.value = data.backendEmail;
    courseSelect.value = data.activeCourseId || "";
    if (data.kg_labels && data.kg_labels.length) renderConceptsList(data.kg_labels);
  });
}

backendLoginBtn.addEventListener("click", async () => {
  const email = backendEmail.value.trim();
  const password = backendPassword.value.trim();
  if (!email || !password) {
    showBackendStatus("Enter email and password.", true);
    return;
  }
  backendLoginBtn.disabled = true;
  showBackendStatus("Logging in…");
  backendError.hidden = true;
  try {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showBackendStatus(data.detail || `HTTP ${res.status}`, true);
      return;
    }
    await chrome.storage.local.set({
      backendToken: data.token,
      backendUserId: data.user_id,
      backendEmail: email,
    });
    showBackendStatus("Logged in. Select a course and click Refresh courses.");
    await loadCourses();
  } catch (e) {
    showBackendStatus(e.message || "Network error. Is the API running at http://localhost:8000?", true);
  } finally {
    backendLoginBtn.disabled = false;
  }
});

async function loadCourses() {
  const { courses, error } = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "FETCH_COURSES" }, (r) => {
      resolve(r || { error: "No response" });
    });
  });
  courseSelect.innerHTML = '<option value="">— Select a course —</option>';
  if (error) {
    if (error === "NOT_LOGGED_IN") showBackendStatus("Log in first.", true);
    return;
  }
  (courses || []).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name || c.id;
    courseSelect.appendChild(opt);
  });
  const { activeCourseId } = await new Promise((r) => chrome.storage.local.get(["activeCourseId"], r));
  if (activeCourseId) courseSelect.value = activeCourseId;
}

refreshCoursesBtn.addEventListener("click", async () => {
  refreshCoursesBtn.disabled = true;
  await loadCourses();
  refreshCoursesBtn.disabled = false;
});

courseSelect.addEventListener("change", () => {
  const id = courseSelect.value || "";
  chrome.storage.local.set({ activeCourseId: id }, () => {
    if (id) showBackendStatus("Course saved. Click 'Refresh knowledge graph' to load labels for classification.");
  });
});

refreshKgBtn.addEventListener("click", async () => {
  const courseId = courseSelect.value;
  if (!courseId) {
    showBackendStatus("Select a course first.", true);
    return;
  }
  refreshKgBtn.disabled = true;
  showBackendStatus("Loading knowledge graph…");
  const { labels, error } = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "FETCH_KG_LABELS", courseId }, (r) => {
      resolve(r || { error: "No response" });
    });
  });
  if (error) {
    showBackendStatus(error, true);
    conceptsListEl.innerHTML = "";
  } else {
    showBackendStatus(`Loaded ${(labels || []).length} concepts. You can now classify with AI.`);
    renderConceptsList(labels || []);
  }
  refreshKgBtn.disabled = false;
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

loadStoredBackendPrefs();
