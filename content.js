function fillFormFields(callback) {
  chrome.storage.local.get("formData", (result) => {
    if (!result.formData) return;

    let matchedCount = 0;
    const rawData = result.formData;

    // Normalize keys to lowercase for case-insensitive lookup
    const data = {};
    for (const key in rawData) {
      data[key.toLowerCase()] = rawData[key];
    }

    const listItems = document.querySelectorAll("div[role='listitem']");

    listItems.forEach((item) => {
      const labelSpan = item.querySelector("span");
      const labelText = labelSpan ? labelSpan.textContent.trim() : item.innerText.split("\n")[0].trim();
      const labelKey = labelText.toLowerCase();

      const fieldData = data[labelKey];

      // Text, Email, URL
      if (fieldData && item.querySelector("input[type='text'], input[type='email'], input[type='url']")) {
        const input = item.querySelector("input[type='text'], input[type='email'], input[type='url']");
        input.value = fieldData;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        matchedCount++;
      }

      // Checkboxes (array-based)
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

      // Dropdowns (support array of alternatives)
      if (fieldData && item.querySelector("div[role='listbox']")) {
        const dropdown = item.querySelector("div[role='listbox']");
        dropdown.click();

        setTimeout(() => {
          const options = document.querySelectorAll("div[role='option']");
          const expectedValues = Array.isArray(fieldData) ? fieldData : [fieldData];

          options.forEach((opt) => {
            const optionText = opt.innerText.trim();
            if (expectedValues.includes(optionText)) {
              opt.click();
              matchedCount++;
            }
          });

          document.body.click();
        }, 300);
      }

      // DOB Handling
      if (labelKey === "dob") {
        const dobValue = data["dob"];
        if (dobValue) {
          const [day, month, year] = dobValue.split("/");
          const input = item.querySelector("input[type='date']");
          if (input) {
            const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            input.value = formatted;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            matchedCount++;
          }
        }
      }

      // Email checkbox with custom match
      if (labelKey === "email" && typeof data["email"] === "object" && typeof data["email"].match === "string") {
        const targetText = data["email"].match;
        const checkboxes = item.querySelectorAll("div[role='checkbox']");
        checkboxes.forEach((checkbox) => {
          const fullText = checkbox.parentElement?.innerText.trim() || "";
          if (fullText.includes(targetText)) {
            if (checkbox.getAttribute("aria-checked") !== "true") {
              checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              console.log("✔ Email match found and checkbox clicked:", fullText);
              matchedCount++;
            } else {
              console.log("☑ Email checkbox already checked:", fullText);
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fillForm") {
    fillFormFields(() => setTimeout(() => fillFormFields(), 500)); // Double run for dropdowns
  }
  if (msg.type === "resetForm") {
    resetFormFields();
  }
});
