chrome.storage.local.get(["geminiApiKey"], (data) => {
  const input = document.getElementById("apiKey");
  if (data.geminiApiKey) input.value = data.geminiApiKey;
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
