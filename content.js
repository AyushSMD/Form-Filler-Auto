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

      // Checkboxes (including email opt-in)
      if (Array.isArray(data[labelText])) {
        const checkboxes = item.querySelectorAll("div[role='checkbox']");
        checkboxes.forEach((checkbox) => {
          const checkboxLabel = checkbox.parentElement.innerText.trim();
          if (data[labelText].includes(checkboxLabel)) {
            if (checkbox.getAttribute('aria-checked') !== 'true') checkbox.click();
            matchedCount++;
          }
        });
      } else if (typeof data[labelText] === "boolean") {
        const checkbox = item.querySelector("div[role='checkbox']");
        if (checkbox && checkbox.getAttribute('aria-checked') !== data[labelText].toString()) {
          checkbox.click();
          matchedCount++;
        }
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
          dropdown.blur(); // Close dropdown after selection
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

    chrome.storage.local.set({ matchCount: matchedCount }, () => {
      chrome.runtime.sendMessage({ type: "updateMatchCount", count: matchedCount });
    });
  });
}

function resetFormFields() {
  const inputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='date']");
  inputs.forEach((input) => {
    input.value = "";
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  const checkboxes = document.querySelectorAll("div[role='checkbox'][aria-checked='true']");
  checkboxes.forEach((checkbox) => checkbox.click());

  const selectedOptions = document.querySelectorAll("div[role='option'][aria-selected='true']");
  selectedOptions.forEach((option) => option.click());

  const listboxes = document.querySelectorAll("div[role='listbox']");
  listboxes.forEach(lb => lb.blur()); // Close dropdowns after reset
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "fillForm") fillFormFields();
  if (msg.type === "resetForm") resetFormFields();
});
