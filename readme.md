# ChatGPT Beeps

Beep on **start** and **finish** of ChatGPT responses.

* **Console snippet**: quick, per-tab.
* **Browser extension**: automatic on all ChatGPT tabs (Chrome/Edge + Firefox).

---

## 1) Get the files

```bash
git clone https://github.com/MichaelZelensky/chat-gpt-beeps.git
cd chat-gpt-beeps
```

Repo layout:

* One-off code snippet: `devtools-console-snippet.js`
* Chrome extension: `chrome-extension/` (MV3)
* Firefox extension: `firefox-extension/` (MV3 + gecko)

---

## 2) Console snippet (one-off)

**Usage**

1. Open `devtools-console-snippet.js` and copy all (`Ctrl/⌘+C`).
2. Open ChatGPT → DevTools Console

   * Chrome/Edge: Menu → More Tools → Developer Tools
   * Firefox: Menu → Web Developer → Web Console
     Note: `Ctrl/⌘+Shift+V` is overridden on ChatGPT; use the menu.
3. Paste (`Ctrl/⌘+V`) → Enter.
4. You’ll hear a short beep at **start** and a double beep at **finish**.
   Stop = refresh tab.

**Tip**: First sound may need one click in the page (autoplay policy).

---

## 3) Chrome/Edge extension (MV3)

**Install**

1. Go to `chrome://extensions` (Edge: `edge://extensions`).
2. Enable **Developer mode**.
3. **Load unpacked** → select `extension/`.

**Files**

* `extension/manifest.json`
* `extension/content.js`

**Notes**

* CSP-safe (Web Audio, no external media).
* First sound may need one click in the tab.

---

## 4) Firefox extension (MV3, temporary load)

**Quick test (temporary)**

1. Go to `about:debugging#/runtime/this-firefox`.
2. **Load Temporary Add-on…** → select `extension-firefox/manifest.json`.
3. Refresh ChatGPT tabs.

**Files**

* `extension-firefox/manifest.json` (MV3 + `browser_specific_settings`)
* `extension-firefox/content.js` (same logic as Chrome)

**Optional signing (permanent)**

* Zip `extension-firefox/` and sign via Firefox Add-ons Developer Hub.
* Install the signed `.xpi`.

---

## 5) Troubleshooting

* **No sound?** Click once in the page (autoplay).
* **Only one beep?** Wait for the double-beep at finish; large answers may take longer.
* **Console verification:** open DevTools; snippet prints `START/DONE` logs.
* **Reinstall** unistall and reinstall the extension. 

---

## 6) Security & performance

* No external URLs, no network access.
* Uses `MutationObserver` + tiny interval; cleans up on page unload.

---

## 7) Uninstall / disable

* Console snippet: refresh page.
* Extensions: toggle off or remove from the browser’s extensions page.
