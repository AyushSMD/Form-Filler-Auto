// content.js (updated: reliable email checkbox selection using full-text matching block)
function fillFormFields(callback) {
  chrome.storage.local.get("formData", (result) => {
    if (!result.formData) return;

    let matchedCount = 0;
    const data = result.formData;
    const listItems = document.querySelectorAll("div[role='listitem']");

    listItems.forEach((item) => {
      const labelText = item.innerText.split("\n")[0].trim();

      // Text, Email, URL
      if (data[labelText] && item.querySelector("input[type='text'], input[type='email'], input[type='url']")) {
        const input = item.querySelector("input[type='text'], input[type='email'], input[type='url']");
        input.value = data[labelText];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        matchedCount++;
      }

      // Checkboxes (array-based)
      if (Array.isArray(data[labelText])) {
        const checkboxes = item.querySelectorAll("div[role='checkbox']");
        checkboxes.forEach((checkbox) => {
          const checkboxLabel = checkbox.parentElement.innerText.trim();
          if (data[labelText].includes(checkboxLabel)) {
            if (checkbox.getAttribute('aria-checked') !== 'true') checkbox.click();
            matchedCount++;
          }
        });
      }

      // Dropdowns
      if (data[labelText] && item.querySelector("div[role='listbox']")) {
        const dropdown = item.querySelector("div[role='listbox']");
        dropdown.click();

        setTimeout(() => {
          const options = document.querySelectorAll("div[role='option']");
          options.forEach((opt) => {
            if (opt.innerText.trim() === data[labelText]) {
              opt.click();
              matchedCount++;
            }
          });
          document.body.click(); // Attempt to close dropdown by clicking body
        }, 300);
      }

      // DOB Handling (Google Forms date picker style)
      if (labelText === "DOB") {
        const dobValue = data["DOB"];
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
    });

    // Refined checkbox logic: target the 'Email' field and click the checkbox inside it
    const emailField = Array.from(document.querySelectorAll("div[role='listitem']")).find(item => {
  const label = item.querySelector("span");
  return label && label.textContent.trim() === "Email";
});

    if (emailField && data["Email"] === true) {
      const checkbox = emailField.querySelector("div[role='checkbox']");
      if (checkbox && checkbox.getAttribute("aria-checked") !== "true") {
        checkbox.click();
        matchedCount++;
      }
    }

        textBlocks.forEach(({ checkbox, text }) => {
          if (text.includes(key) && checkbox.getAttribute('aria-checked') !== 'true') {
            checkbox.click();
            matchedCount++;
          }
        });
      }
    }

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

  // Reset dropdowns to "Choose" or first option
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
    setTimeout(() => resetFormFields(), 500); // ensure dropdowns are reset too
  }
});
