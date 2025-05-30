document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["uploadedFileName", "matchCount"], (result) => {
    document.getElementById("fileName").innerText = result.uploadedFileName || "No file uploaded";
    document.getElementById("matchCount").innerText = result.matchCount || 0;
  });

  // Trigger match scan
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "scanForm" });
  });
});

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    chrome.storage.local.set({ formData: data, uploadedFileName: file.name, matchCount: 0 });
    document.getElementById("fileName").innerText = file.name;
    document.getElementById("matchCount").innerText = "0";
  };
  reader.readAsText(file);
});

document.getElementById("fillForm").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "fillForm" });
  });
});

document.getElementById("resetForm").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "resetForm" });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "updateMatchCount") {
    document.getElementById("matchCount").innerText = msg.count;
  }
});
