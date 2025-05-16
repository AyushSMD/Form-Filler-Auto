function fillFormFields() {
  chrome.storage.local.get("formData", (result) => {
    if (!result.formData) return;

    let matchedCount = 0;
    const data = result.formData;
    const listItems = document.querySelectorAll("div[role='listitem']");

    listItems.forEach((item) => {
      const labelText = item.innerText.split("\n")[0].trim();

      // Text & Email
      if (data[labelText] && item.querySelector("input[type='text'], input[type='email']")) {
        const input = item.querySelector("input[type='text'], input[type='email']");
        input.value = data[labelText];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        matchedCount++;
      }

      // Checkboxes
      if (Array.isArray(data[labelText])) {
        const checkboxes = item.querySelectorAll("div[role='checkbox']");
        checkboxes.forEach((checkbox) => {
          const checkboxLabel = checkbox.parentElement.innerText.trim();
          if (data[labelText].includes(checkboxLabel)) {
            checkbox.click();
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
        }, 300);
      }

      // DOB Handling
      if (labelText === "DOB") {
        const dobValue = data["DOB"];
        if (dobValue) {
          const [day, month, year] = dobValue.split("/");
          const inputs = item.querySelectorAll("input[type='text']");
          if (inputs.length >= 3) {
            inputs[0].value = day;
            inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[1].value = month;
            inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
            inputs[2].value = year;
            inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
            matchedCount++;
          }
        }
      }
    });

    chrome.storage.local.set({ matchCount: matchedCount }, () => {
      chrome.runtime.sendMessage({ type: "updateMatchCount", count: matchedCount });
    });
  });
}

function resetFormFields() {
  const inputs = document.querySelectorAll("input[type='text'], input[type='email']");
  inputs.forEach((input) => {
    input.value = "";
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  const checkboxes = document.querySelectorAll("div[role='checkbox'][aria-checked='true']");
  checkboxes.forEach((checkbox) => checkbox.click());

  const selectedOptions = document.querySelectorAll("div[role='option'][aria-selected='true']");
  selectedOptions.forEach((option) => option.click());
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fillForm") {
    fillFormFields();
  }
  if (msg.type === "resetForm") {
    resetFormFields();
  }
});
