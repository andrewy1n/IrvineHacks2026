const STUDY_MODE_KEY = "study_mode";

const popupTitle = document.getElementById("popup-title");
const popupSubtext = document.getElementById("popup-subtext");
const studyModeToggle = document.getElementById("study-mode-toggle");
const viewKnowledgeMapBtn = document.getElementById("view-knowledge-map");

// Optional: set default subtext if you want to change it later
const DEFAULT_SUBTEXT = "Manage your extension and turn study mode on or off.";

function loadStudyMode() {
  chrome.storage.local.get([STUDY_MODE_KEY], (result) => {
    const on = result[STUDY_MODE_KEY] === true;
    studyModeToggle.classList.toggle("on", on);
    studyModeToggle.setAttribute("aria-checked", on);
  });
}

function setStudyMode(on) {
  chrome.storage.local.set({ [STUDY_MODE_KEY]: on }, () => {
    studyModeToggle.classList.toggle("on", on);
    studyModeToggle.setAttribute("aria-checked", on);
  });
}

studyModeToggle.addEventListener("click", () => {
  const currentlyOn = studyModeToggle.classList.contains("on");
  setStudyMode(!currentlyOn);
});

studyModeToggle.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    studyModeToggle.click();
  }
});

viewKnowledgeMapBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

loadStudyMode();
