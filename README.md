
![Form Filler Auto](./icons/FFA-with-text-without-background.png)

**Form Filler Auto** is a Chrome extension that allows users to automatically fill out Google Forms using data from a JSON file. It is designed for speed, accuracy, and convenience—especially useful for bulk form testing, repeated surveys, and automated input scenarios.

## Features

- Automatically fills Google Forms using JSON key-value pairs.
- Upload a local JSON file directly from the popup.
- Shows how many fields were successfully matched and filled.
- Supports text inputs, dropdowns, checkboxes, radio buttons, and date fields.
- Automatically identifies the type of input and treat it accordingly
- Includes a reset option to clear form data.
- Clean, intuitive popup interface.

## How to install

1. Download or **clone** this repository to your local machine.

    ```
    git clone https://github.com/AyushSMD/Form-Filler-Auto.git
    ```
2. Open **Google Chrome** and go to [chrome://extensions/](chrome://extensions/).
3. Enable **Developer mode** using the toggle at the top-right.
4. Click **Load unpacked**.
5. Select the folder where this project was cloned or downloaded.
6. The extension icon will now appear in your Chrome toolbar.


## How It Works

1. Open a Google Form.
2. Click the **Form Filler Auto** extension icon.
3. Upload a `.json` file with field names and values.
4. Click **Fill Form** to populate matching fields.
5. Optionally, click **Reset Form** to clear entries.

### Example JSON Format

```json
{
  "Full Name": "John Doe",
  "Email Address": "john@example.com",
  "Gender": "Male",
  "Birth Date": "01/01/1990",
  "Hobbies": ["Reading", "Traveling"]
}
```

### JSON formatting Guide ###

- The program is **capable of detecting the type of input feild**, just write the label as the key and the value you want to input as key value pairs in the JSON file.
- **Strings**, **Numbers** and **Email** are to be written **directly**.
- For **Radio buttons** just mention the option you want to be selected.
- For **Google Dates** popups mention the date in the `DD/MM/YYYY` format.
    ````json
    "Birth Date": "01/01/1990",
    ````
- In case of a **Dropdown** having acronyms or alternate version of the desired selection you may mention both and the program will select the one that matches. Just write normal key value pairs in normal cases

    ````json
    "company" :["NASA","National Aeronautics and Space Administration"]
    ````
- For **Checkboxes** mention the options that you want to select.
    ````json
    "Hobbies": ["Reading", "Traveling"]
    ````

> [!IMPORTANT]
> Form Filler auto is not a complete product and still under development there are certain unavoidable glitches that you might face while using the extension. 
>
> Stuff like resetting radio buttons is still a problem. I recommend you to use the clear form button at the end of every form.
>
> Try reloading the page or the extension form the extension settings in any case of error.
>
> The capabilities of the extension is currently limited to google forms.

> [!NOTE]
> I made FFA to fill annoying google forms that my college sends every once in a while asking for the same details again and again for different companies.
>
> Happy Form Filling!!!