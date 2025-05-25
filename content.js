function fillFormFields(callback) {
  chrome.storage.local.get("formData", (result) => {
    if (!result.formData) return;

    let matchedCount = 0;
    const rawData = result.formData;

    // Normalize keys for case-insensitive matching
    const data = {};
    for (const key in rawData) {
      data[key.toLowerCase()] = rawData[key];
    }

    const listItems = document.querySelectorAll("div[role='listitem']");

    listItems.forEach((item) => {
      const labelSpan = item.querySelector("span");
      const labelText = labelSpan ? labelSpan.textContent.trim() : item.innerText.split("\n")[0].trim();
      const labelTextLower = labelText.toLowerCase();

      // 🔍 Match key: exact match first, then fuzzy
      let fieldKey = Object.keys(data).find(key => key === labelTextLower);
      if (!fieldKey) {
        fieldKey = Object.keys(data).find(key =>
          key.includes(labelTextLower) || labelTextLower.includes(key)
        );
      }

      const fieldData = fieldKey ? data[fieldKey] : null;

      // Fill input (text/email/url) if value is string or number
      if ((typeof fieldData === "string" || typeof fieldData === "number") &&
          item.querySelector("input[type='text'], input[type='email'], input[type='url']")) {
        const input = item.querySelector("input[type='text'], input[type='email'], input[type='url']");
        input.value = fieldData;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        matchedCount++;
      }

      // Checkboxes (match against array values)
      if (Array.isArray(fieldData)) {
        const checkboxes = item.querySelectorAll("div[role='checkbox']");
        checkboxes.forEach((checkbox) => {
          const checkboxLabel = checkbox.parentElement?.innerText.trim();
          if (fieldData.includes(checkboxLabel)) {
            if (checkbox.getAttribute('aria-checked') !== 'true') {
              checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              matchedCount++;
            }
          }
        });
      }

      // Dropdowns
      if (fieldData && item.querySelector("div[role='listbox']")) {
        const dropdown = item.querySelector("div[role='listbox']");
        dropdown.click();

        const expectedValues = Array.isArray(fieldData) ? fieldData : [fieldData];
        setTimeout(() => {
          const options = document.querySelectorAll("div[role='option']");
          let matched = false;

          options.forEach((opt) => {
            const optionText = opt.innerText.trim();
            if (expectedValues.includes(optionText)) {
              opt.click();
              matched = true;
            }
          });

          if (matched) {
            matchedCount++;
            chrome.storage.local.set({ matchCount: matchedCount }, () => {
              chrome.runtime.sendMessage({ type: "updateMatchCount", count: matchedCount });
            });
          }

          document.body.click();
        }, 300);
      }

      // DOB Handling
      if (labelTextLower === "dob" && data["dob"]) {
        const dobValue = data["dob"];
        const [day, month, year] = dobValue.split("/");
        const input = item.querySelector("input[type='date']");
        if (input) {
          const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          input.value = formatted;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          matchedCount++;
        }
      }

      // Radio buttons
      if ((typeof fieldData === "string" || typeof fieldData === "number") && item.querySelector("div[role='radiogroup']")) {
        const radios = item.querySelectorAll("div[role='radio']");
        radios.forEach((radio) => {
          const labelContainer = radio.closest("label") || radio.parentElement;
          const radioLabel = labelContainer?.innerText.trim();

          if (radioLabel === fieldData && radio.getAttribute("aria-checked") !== "true") {
            radio.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            matchedCount++;
          }
        });
      }

      // Email checkbox match logic
      if (labelTextLower === "email" && typeof data["email"] === "object" && typeof data["email"].match === "string") {
        const targetText = data["email"].match;
        const checkboxes = item.querySelectorAll("div[role='checkbox']");
        checkboxes.forEach((checkbox) => {
          const fullText = checkbox.parentElement?.innerText.trim() || "";
          if (fullText.includes(targetText)) {
            if (checkbox.getAttribute("aria-checked") !== "true") {
              checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              matchedCount++;
            }
          }
        });
      }
    });

    chrome.storage.local.set({ matchCount: matchedCount }, () => {
      chrome.runtime.sendMessage({ type: "updateMatchCount", count: matchedCount });
      if (callback) callback();
    });
  });
}

function resetFormFields() {
  const inputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='date'], input[type='url']");
  inputs.forEach((input) => {
    input.value = "";
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  const checkboxes = document.querySelectorAll("div[role='checkbox'][aria-checked='true']");
  checkboxes.forEach((checkbox) => checkbox.click());

  const radios = document.querySelectorAll("div[role='radio'][aria-checked='true']");
  radios.forEach((radio) => radio.click());

  const listItems = document.querySelectorAll("div[role='listitem']");
  listItems.forEach((item) => {
    const listbox = item.querySelector("div[role='listbox']");
    if (listbox) {
      listbox.click();
      setTimeout(() => {
        const options = item.querySelectorAll("div[role='option']");
        if (options.length > 0) options[0].click();
        document.body.click();
      }, 300);
    }
  });

  const selectedOptions = document.querySelectorAll("div[role='option'][aria-selected='true']");
  selectedOptions.forEach((option) => option.click());
}

function scanFormFieldsForMatch() {
  chrome.storage.local.get("formData", (result) => {
    if (!result.formData) return;

    const rawData = result.formData;
    const data = {};
    for (const key in rawData) {
      data[key.toLowerCase()] = rawData[key];
    }

    const listItems = document.querySelectorAll("div[role='listitem']");
    let matchCount = 0;

    listItems.forEach((item) => {
      const labelSpan = item.querySelector("span");
      const labelText = labelSpan ? labelSpan.textContent.trim() : item.innerText.split("\n")[0].trim();
      const labelTextLower = labelText.toLowerCase();

      // Match key: exact > fuzzy
      let fieldKey = Object.keys(data).find(key => key === labelTextLower);
      if (!fieldKey) {
        fieldKey = Object.keys(data).find(key =>
          key.includes(labelTextLower) || labelTextLower.includes(key)
        );
      }

      const fieldData = fieldKey ? data[fieldKey] : null;

      if (typeof fieldData === "string" || typeof fieldData === "number" || Array.isArray(fieldData)) {
        matchCount++;
      }

      if (labelTextLower === "dob" && data["dob"]) matchCount++;
      if (labelTextLower === "email" && typeof data["email"] === "object" && typeof data["email"].match === "string") matchCount++;
    });

    chrome.storage.local.set({ matchCount }, () => {
      chrome.runtime.sendMessage({ type: "updateMatchCount", count: matchCount });
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fillForm") {
    fillFormFields(() => setTimeout(() => fillFormFields(), 500));
  }
  if (msg.type === "resetForm") {
    resetFormFields();
  }
  if (msg.type === "scanForm") {
    scanFormFieldsForMatch();
  }
});
